import type React from 'react';
import type { KynnosLight, KynnosParams } from '@usva-ui/react/atmospheres/kynnos';

/** The roles Kynnös reads, at the values of usva's own sisu theme. */
export const HERO_GROUND_TOKENS = {
  '--usva-bg': '#0d0d11',
  '--usva-surface': '#15151c',
  '--usva-surface-2': '#1d1d28',
  '--usva-ink': '#ddddf0',
  '--usva-accent': '#52c989',
  '--usva-accent-alt': '#74e3ad',
} as React.CSSProperties;

/** usva's Kynnös studio, "raked clay" template, unchanged. */
export const HERO_GROUND_LIGHT: KynnosLight = { direction: [-0.72, 0.5, 0.34] };

export const HERO_GROUND_PARAMS: Partial<KynnosParams> = {
  origin: [-1.05, 0.78],
  spin: (2 * Math.PI) / 90,
  furrowFreq: 16,
  warpAmt: 2.8,
  warpFreq: 2.1,
  breakAmt: 0.22,
  ridgeShape: 1.9,
  depth: 0.03,
  slope: 1,
  microScale: 180,
  microAmt: 0.34,
  crackScale: 90,
  crackAmt: 0.5,
  ao: 0.9,
  rough: 0.9,
  ambient: 0.42,
  key: 0.78,
  drift: 0.012,
  dither: 0.006,
};
