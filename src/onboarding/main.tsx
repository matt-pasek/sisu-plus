import '@/app/i18n';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { isGrantableOrigin } from '@/shared/timetables/timetables';
import { App } from './App';
import { GrantOriginStep } from './steps/GrantOriginStep';
import './onboarding.css';

const grantOrigin = new URLSearchParams(window.location.search).get('grant');
const root = document.getElementById('root')!;
createRoot(root).render(
  <StrictMode>{isGrantableOrigin(grantOrigin) ? <GrantOriginStep origin={grantOrigin} /> : <App />}</StrictMode>,
);
