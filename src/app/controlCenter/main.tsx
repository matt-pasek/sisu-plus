import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ControlCenter } from './ControlCenter.comp';
import globalCss from '@/app/global.css?inline';

export function mountControlCenter() {
  const host = document.createElement('div');
  host.id = 'sisu-plus-controls';
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = globalCss;
  shadow.appendChild(style);

  const root = document.createElement('div');
  shadow.appendChild(root);

  createRoot(root).render(
    <StrictMode>
      <ControlCenter />
    </StrictMode>,
  );
}
