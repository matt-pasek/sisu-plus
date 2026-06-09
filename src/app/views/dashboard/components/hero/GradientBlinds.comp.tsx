import React, { useEffect, useRef } from 'react';
import { Renderer, Program, Mesh, Triangle } from 'ogl';
import type { OGLRenderingContext } from 'ogl';

export interface GradientBlindsProps {
  className?: string;
  dpr?: number;
  paused?: boolean;
  gradientColors?: string[];
  angle?: number;
  noise?: number;
  blindCount?: number;
  blindMinWidth?: number;
  spotlightPosition?: [number, number];
  mirrorGradient?: boolean;
  spotlightRadius?: number;
  spotlightSoftness?: number;
  spotlightOpacity?: number;
  distortAmount?: number;
  shineDirection?: 'left' | 'right';
  mixBlendMode?: string;
}

const MAX_COLORS = 8;
const COLOR_UNIFORM_KEYS = [
  'uColor0',
  'uColor1',
  'uColor2',
  'uColor3',
  'uColor4',
  'uColor5',
  'uColor6',
  'uColor7',
] as const;

type UniformMap = Record<string, { value: unknown }>;

const hexToRGB = (hex: string): [number, number, number] => {
  const c = hex.replace('#', '').padEnd(6, '0');
  return [parseInt(c.slice(0, 2), 16) / 255, parseInt(c.slice(2, 4), 16) / 255, parseInt(c.slice(4, 6), 16) / 255];
};

const clamp01 = (value: number): number => Math.min(Math.max(value, 0), 1);

const getSpotlightPosition = (x: number, y: number): [number, number] => [clamp01(x), clamp01(y)];

const getEffectiveBlindCount = (containerWidth: number, blindCount: number, blindMinWidth: number): number => {
  const maxByMinWidth = blindMinWidth > 0 ? Math.max(1, Math.floor(containerWidth / blindMinWidth)) : Infinity;
  const effective = blindCount ? Math.min(blindCount, maxByMinWidth) : maxByMinWidth === Infinity ? 16 : maxByMinWidth;
  return Math.max(1, effective);
};

const setUniformValues = (uniforms: UniformMap | null, values: Record<string, unknown>): void => {
  if (!uniforms) return;

  Object.entries(values).forEach(([key, value]) => {
    uniforms[key].value = value;
  });
};

const prepStops = (stops?: string[]) => {
  const base = (stops && stops.length ? stops : ['#FF9FFC', '#5227FF']).slice(0, MAX_COLORS);
  if (base.length === 1) base.push(base[0]);
  while (base.length < MAX_COLORS) base.push(base[base.length - 1]);
  const arr: [number, number, number][] = base.map(hexToRGB);
  const count = Math.max(2, Math.min(MAX_COLORS, stops?.length ?? 2));
  return { arr, count };
};

const NOISE_SIZE = 256;
let noiseTextureSingleton: WebGLTexture | null = null;

function getOrCreateNoiseTexture(gl: OGLRenderingContext): WebGLTexture {
  if (noiseTextureSingleton) return noiseTextureSingleton;

  const data = new Uint8Array(NOISE_SIZE * NOISE_SIZE);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 255) | 0;

  const tex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, NOISE_SIZE, NOISE_SIZE, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, data);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.bindTexture(gl.TEXTURE_2D, null);

  noiseTextureSingleton = tex;
  return tex;
}

const VERTEX = `
  attribute vec2 position;
  attribute vec2 uv;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const FRAGMENT = `
  #ifdef GL_ES
  precision mediump float;
  #endif

  uniform vec3  iResolution;
  uniform vec2  uSpotlightPosition;
  uniform vec2  uNoiseOffset;

  uniform float uAngle;
  uniform float uNoise;
  uniform float uBlindCount;
  uniform float uSpotlightRadius;
  uniform float uSpotlightSoftness;
  uniform float uSpotlightOpacity;
  uniform float uMirror;
  uniform float uDistort;
  uniform float uShineFlip;

  uniform vec3  uColor0;
  uniform vec3  uColor1;
  uniform vec3  uColor2;
  uniform vec3  uColor3;
  uniform vec3  uColor4;
  uniform vec3  uColor5;
  uniform vec3  uColor6;
  uniform vec3  uColor7;
  uniform int   uColorCount;

  uniform sampler2D uNoiseTex;

  varying vec2 vUv;

  vec2 rotate2D(vec2 p, float a) {
    float c = cos(a), s = sin(a);
    return mat2(c, -s, s, c) * p;
  }

  vec3 getGradientColor(float t) {
    float tt = clamp(t, 0.0, 1.0);
    int count = uColorCount < 2 ? 2 : uColorCount;
    float scaled = tt * float(count - 1);
    float seg = floor(scaled);
    float f = fract(scaled);

    if (seg < 1.0)                       return mix(uColor0, uColor1, f);
    if (seg < 2.0 && count > 2)          return mix(uColor1, uColor2, f);
    if (seg < 3.0 && count > 3)          return mix(uColor2, uColor3, f);
    if (seg < 4.0 && count > 4)          return mix(uColor3, uColor4, f);
    if (seg < 5.0 && count > 5)          return mix(uColor4, uColor5, f);
    if (seg < 6.0 && count > 6)          return mix(uColor5, uColor6, f);
    if (seg < 7.0 && count > 7)          return mix(uColor6, uColor7, f);
    if (count > 7)  return uColor7;
    if (count > 6)  return uColor6;
    if (count > 5)  return uColor5;
    if (count > 4)  return uColor4;
    if (count > 3)  return uColor3;
    if (count > 2)  return uColor2;
    return uColor1;
  }

  void main() {
    vec2 fragCoord = vUv * iResolution.xy;
    vec2 uv0 = fragCoord / iResolution.xy;

    float aspect = iResolution.x / iResolution.y;
    vec2 p = uv0 * 2.0 - 1.0;
    p.x *= aspect;
    vec2 pr = rotate2D(p, uAngle);
    pr.x /= aspect;
    vec2 uv = pr * 0.5 + 0.5;

    vec2 uvMod = uv;
    if (uDistort > 0.0) {
      float w = 0.01 * uDistort;
      uvMod.x += sin(uvMod.y * 6.0) * w;
      uvMod.y += cos(uvMod.x * 6.0) * w;
    }

    float t = uvMod.x;
    if (uMirror > 0.5) t = 1.0 - abs(1.0 - 2.0 * fract(t));

    vec3 base = getGradientColor(t);

    float d  = length(uv0 - uSpotlightPosition);
    float dn = d / max(uSpotlightRadius, 1e-4);
    float spot = (1.0 - 2.0 * pow(dn, uSpotlightSoftness)) * uSpotlightOpacity;

    float stripe = fract(uvMod.x * max(uBlindCount, 1.0));
    if (uShineFlip > 0.5) stripe = 1.0 - stripe;

    vec3 col = vec3(spot) + base - vec3(stripe);

    if (uNoise > 0.0) {
      float grain = texture2D(uNoiseTex, uv0 + uNoiseOffset).r;
      col += (grain - 0.5) * uNoise;
    }

    gl_FragColor = vec4(col, 1.0);
  }
`;

const GradientBlinds: React.FC<GradientBlindsProps> = ({
  className,
  dpr,
  paused = false,
  gradientColors,
  angle = 0,
  noise = 0.3,
  blindCount = 16,
  blindMinWidth = 60,
  spotlightPosition = [0.56, 0.5],
  mirrorGradient = false,
  spotlightRadius = 0.5,
  spotlightSoftness = 1,
  spotlightOpacity = 1,
  distortAmount = 0,
  shineDirection = 'left',
  mixBlendMode = 'lighten',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const glRef = useRef<OGLRenderingContext | null>(null);
  const programRef = useRef<Program | null>(null);
  const meshRef = useRef<Mesh<Triangle> | null>(null);
  const geometryRef = useRef<Triangle | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const uniformsRef = useRef<UniformMap | null>(null);

  const pausedRef = useRef(paused);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  const [spotlightX, spotlightY] = spotlightPosition;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new Renderer({
      dpr: dpr ?? (typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1),
      alpha: true,
      antialias: true,
    });
    rendererRef.current = renderer;
    const gl = renderer.gl;
    glRef.current = gl;
    const canvas = gl.canvas as HTMLCanvasElement;

    canvas.style.cssText = 'width:100%;height:100%;display:block;';
    container.appendChild(canvas);

    const noiseTex = getOrCreateNoiseTexture(gl);

    const { arr: colorArr, count: colorCount } = prepStops(gradientColors);

    const uniforms: UniformMap = {
      iResolution: { value: [gl.drawingBufferWidth, gl.drawingBufferHeight, 1] as [number, number, number] },
      uSpotlightPosition: { value: getSpotlightPosition(spotlightX, spotlightY) },
      uNoiseOffset: { value: [0, 0] as [number, number] },
      uAngle: { value: (angle * Math.PI) / 180 },
      uNoise: { value: noise },
      uBlindCount: { value: Math.max(1, blindCount) },
      uSpotlightRadius: { value: spotlightRadius },
      uSpotlightSoftness: { value: spotlightSoftness },
      uSpotlightOpacity: { value: spotlightOpacity },
      uMirror: { value: mirrorGradient ? 1 : 0 },
      uDistort: { value: distortAmount },
      uShineFlip: { value: shineDirection === 'right' ? 1 : 0 },
      uColorCount: { value: colorCount },
      uNoiseTex: { value: noiseTex },
    };
    COLOR_UNIFORM_KEYS.forEach((key, index) => {
      uniforms[key] = { value: colorArr[index] };
    });
    uniformsRef.current = uniforms;

    const program = new Program(gl, { vertex: VERTEX, fragment: FRAGMENT, uniforms });
    programRef.current = program;

    const geometry = new Triangle(gl);
    geometryRef.current = geometry;
    const mesh = new Mesh(gl, { geometry, program });
    meshRef.current = mesh;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      renderer.setSize(rect.width, rect.height);
      (uniforms.iResolution.value as number[])[0] = gl.drawingBufferWidth;
      (uniforms.iResolution.value as number[])[1] = gl.drawingBufferHeight;

      uniforms.uBlindCount.value = getEffectiveBlindCount(rect.width, blindCount, blindMinWidth);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(container);

    let grainT = 0;
    const loop = (ts: number) => {
      rafRef.current = requestAnimationFrame(loop);

      if (pausedRef.current) return;

      grainT = ts * 0.0002;
      (uniforms.uNoiseOffset.value as number[])[0] = grainT % 1;
      (uniforms.uNoiseOffset.value as number[])[1] = (grainT * 0.7) % 1;

      renderer.render({ scene: meshRef.current! });
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      if (canvas.parentElement === container) container.removeChild(canvas);

      const tryCall = <T extends object>(obj: T | null, key: keyof T) => {
        if (obj && typeof obj[key] === 'function') (obj[key] as unknown as () => void).call(obj);
      };
      tryCall(programRef.current, 'remove' as keyof Program);
      tryCall(geometryRef.current, 'remove' as keyof Triangle);

      programRef.current = null;
      geometryRef.current = null;
      meshRef.current = null;
      rendererRef.current = null;
      uniformsRef.current = null;
    };
  }, [dpr]);

  useEffect(() => {
    setUniformValues(uniformsRef.current, {
      uAngle: (angle * Math.PI) / 180,
      uNoise: noise,
      uBlindCount: Math.max(1, blindCount),
      uSpotlightPosition: getSpotlightPosition(spotlightX, spotlightY),
      uMirror: mirrorGradient ? 1 : 0,
      uSpotlightRadius: spotlightRadius,
      uSpotlightSoftness: spotlightSoftness,
      uSpotlightOpacity: spotlightOpacity,
      uDistort: distortAmount,
      uShineFlip: shineDirection === 'right' ? 1 : 0,
    });
  }, [
    angle,
    blindCount,
    distortAmount,
    mirrorGradient,
    noise,
    shineDirection,
    spotlightOpacity,
    spotlightRadius,
    spotlightSoftness,
    spotlightX,
    spotlightY,
  ]);

  useEffect(() => {
    const u = uniformsRef.current;
    if (!u) return;
    const { arr, count } = prepStops(gradientColors);
    COLOR_UNIFORM_KEYS.forEach((key, index) => {
      u[key].value = arr[index];
    });
    u.uColorCount.value = count;
  }, [gradientColors]);

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full overflow-hidden ${className ?? ''}`}
      style={mixBlendMode ? { mixBlendMode: mixBlendMode as React.CSSProperties['mixBlendMode'] } : undefined}
    />
  );
};

export default GradientBlinds;
