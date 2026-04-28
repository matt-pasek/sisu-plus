import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import '@/app/global.css';
import '@/landing/landing.css';
import { LandingPage, PrivacyPolicyPage } from '@/landing/LandingPage';

const root = document.getElementById('landing-root');

if (!root) {
  throw new Error('Missing #landing-root');
}

const isPrivacyRoute = window.location.pathname.replace(/\/$/, '') === '/privacy';

createRoot(root).render(
  <StrictMode>
    {isPrivacyRoute ? <PrivacyPolicyPage /> : <LandingPage />}
    <Analytics />
  </StrictMode>,
);
