import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ControlCenter } from './ControlCenter.comp';
import globalCss from '@/app/global.css?inline';

const controlCenterCss = `
  :host {
    --spacing: 4px;
    --text-xs: 12px;
    --text-xs--line-height: 1.3333333;
    --text-sm: 14px;
    --text-sm--line-height: 1.4285714;
    --text-base: 16px;
    --text-base--line-height: 1.5;
    --text-lg: 18px;
    --text-lg--line-height: 1.5555556;
    --text-xl: 20px;
    --text-xl--line-height: 1.4;
    --text-2xl: 24px;
    --text-2xl--line-height: 1.3333333;
    --text-3xl: 30px;
    --text-3xl--line-height: 1.2;
    --radius-sm: 4px;
    --radius-md: 6px;
    --radius-lg: 8px;
    --radius-xl: 12px;
    --radius-2xl: 16px;
    --radius-3xl: 24px;
    color-scheme: dark;
    font-size: 16px;
    line-height: 1.5;
  }

  #sisu-plus-control-root {
    all: initial;
    color: var(--color-offwhite);
    display: block;
    font-family: var(--font-sans);
    font-size: 16px;
    line-height: 1.5;
    pointer-events: auto;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`;

export function mountControlCenter() {
  const host = document.createElement('div');
  host.id = 'sisu-plus-controls';
  host.style.position = 'fixed';
  host.style.inset = '0';
  host.style.pointerEvents = 'none';
  host.style.zIndex = '30';
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = globalCss;
  shadow.appendChild(style);

  const controlStyle = document.createElement('style');
  controlStyle.textContent = controlCenterCss;
  shadow.appendChild(controlStyle);

  const root = document.createElement('div');
  root.id = 'sisu-plus-control-root';
  root.classList.add('font-sans', 'text-offwhite');
  root.style.fontFamily = 'var(--font-sans)';
  root.style.color = 'var(--color-offwhite)';
  root.style.fontSize = '16px';
  root.style.lineHeight = '1.5';
  root.style.setProperty('-webkit-font-smoothing', 'antialiased');
  root.style.pointerEvents = 'auto';
  shadow.appendChild(root);

  createRoot(root).render(
    <StrictMode>
      <ControlCenter />
    </StrictMode>,
  );
}
