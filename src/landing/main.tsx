import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import '@/app/global.css';
import '@/landing/landing.css';
import i18n from '@/app/i18n';
import { getLandingRoute } from '@/landing/landingSeo';
import { LandingApp } from '@/landing/LandingApp';

const root = document.getElementById('landing-root');

if (!root) {
  throw new Error('Missing #landing-root');
}

const landingRoot = root;
const route = getLandingRoute(window.location.pathname);

const app = (
  <StrictMode>
    <LandingApp route={route} />
    <Analytics />
  </StrictMode>
);

function renderLandingApp() {
  if (landingRoot.hasChildNodes()) {
    hydrateRoot(landingRoot, app);
  } else {
    createRoot(landingRoot).render(app);
  }
}

void i18n.changeLanguage(route.locale).finally(renderLandingApp);
