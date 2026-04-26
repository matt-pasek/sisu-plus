import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/app/global.css';
import '@/landing/landing.css';
import { LandingPage } from '@/landing/LandingPage';

const root = document.getElementById('landing-root');

if (!root) {
  throw new Error('Missing #landing-root');
}

createRoot(root).render(
  <StrictMode>
    <LandingPage />
  </StrictMode>,
);
