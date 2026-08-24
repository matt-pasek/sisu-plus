import { StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { AuthOverlay } from './AuthOverlay.comp';
import '@/app/i18n';

const OVERLAY_ID = 'sisu-plus-auth-overlay';
const APP_ID = 'app';

let root: Root | undefined;

const setAppBlurred = (shadowRoot: ShadowRoot, blurred: boolean) => {
  const app = shadowRoot.getElementById(APP_ID);
  if (!app) return;

  app.style.filter = blurred ? 'blur(6px)' : '';
  app.style.pointerEvents = blurred ? 'none' : '';

  if (blurred) {
    app.setAttribute('aria-hidden', 'true');
  } else {
    app.removeAttribute('aria-hidden');
  }
};

export const showAuthOverlay = (shadowRoot: ShadowRoot, onContinue: () => void) => {
  if (shadowRoot.getElementById(OVERLAY_ID)) return;

  const host = document.createElement('div');
  host.id = OVERLAY_ID;
  shadowRoot.appendChild(host);

  setAppBlurred(shadowRoot, true);

  root = createRoot(host);
  root.render(
    <StrictMode>
      <AuthOverlay onContinue={onContinue} />
    </StrictMode>,
  );
};

export const hideAuthOverlay = (shadowRoot: ShadowRoot) => {
  setAppBlurred(shadowRoot, false);

  root?.unmount();
  root = undefined;

  shadowRoot.getElementById(OVERLAY_ID)?.remove();
};
