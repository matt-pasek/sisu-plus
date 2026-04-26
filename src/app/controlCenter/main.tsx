import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ControlCenter } from './ControlCenter.comp';
import globalCss from '@/app/global.css?inline';

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

  const root = document.createElement('div');
  root.classList.add('font-sans', 'text-offwhite');
  root.style.fontFamily = 'var(--font-sans)';
  root.style.color = 'var(--color-offwhite)';
  root.style.setProperty('-webkit-font-smoothing', 'antialiased');
  root.style.pointerEvents = 'auto';
  shadow.appendChild(root);

  createRoot(root).render(
    <StrictMode>
      <ControlCenter />
    </StrictMode>,
  );
}
