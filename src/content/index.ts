import { mountApp } from '@/app/main';
import globalCss from '@/app/global.css?inline';

function mount() {
  document.body.replaceChildren();

  const host = document.createElement('div');
  host.id = 'sisu-plus-root';
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = globalCss;
  shadow.appendChild(style);

  const appRoot = document.createElement('div');
  appRoot.id = 'app';
  shadow.appendChild(appRoot);

  mountApp(appRoot);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount);
} else {
  mount();
}
