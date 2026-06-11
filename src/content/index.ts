import { mountApp } from '@/app/main';
import { mountControlCenter } from '@/app/controlCenter/main';
import { DEFAULT_PREFS, SisuPrefs } from '@/app/types/prefs';
import globalCss from '@/app/global.css?inline';
import type { UniversityConfig } from '@/app/types/universityConfig';

const SISU_PLUS_ROOT_ID = 'sisu-plus-root';

const origPushState = history.pushState;
const origReplaceState = history.replaceState;

let appMounted = false;
let controlCenterMounted = false;
let initStarted = false;

const isStudentPage = (pathname = window.location.pathname) =>
  pathname === '/student' || pathname.startsWith('/student/');

const isStudentLoginPage = (pathname = window.location.pathname) =>
  pathname === '/student/login' || pathname.startsWith('/student/login/');

const canRunSisuPlusOnCurrentRoute = () => isStudentPage() && !isStudentLoginPage();

const ensureBodyReady = async () => {
  if (document.body) return;

  await new Promise<void>((resolve) => {
    document.addEventListener('DOMContentLoaded', () => resolve(), { once: true });
  });
};

const getPrefs = async (): Promise<SisuPrefs> => {
  const stored = await chrome.storage.sync.get(DEFAULT_PREFS);
  return stored as SisuPrefs;
};

const clearStoredSessionForCurrentOrigin = async () => {
  await chrome.runtime.sendMessage({
    type: 'CLEAR_SESSION_FOR_ORIGIN',
    origin: window.location.origin,
  });
};

const removeSisuPlus = () => {
  document.getElementById(SISU_PLUS_ROOT_ID)?.remove();
  appMounted = false;
};

const handOffToSisuLogin = async () => {
  await clearStoredSessionForCurrentOrigin();
  removeSisuPlus();
};

const mountSisuPlus = () => {
  if (appMounted || document.getElementById(SISU_PLUS_ROOT_ID)) {
    appMounted = true;
    return;
  }

  document.body.replaceChildren();

  const host = document.createElement('div');
  host.id = SISU_PLUS_ROOT_ID;
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = globalCss;
  shadow.appendChild(style);

  const appRoot = document.createElement('div');
  appRoot.id = 'app';
  appRoot.classList.add('bg-background', 'text-offwhite');
  shadow.appendChild(appRoot);

  mountApp(appRoot);
  appMounted = true;
};

const mountControlCenterOnce = () => {
  if (controlCenterMounted) return;

  mountControlCenter();
  controlCenterMounted = true;
};

const reconcileRoute = async () => {
  await ensureBodyReady();

  if (isStudentLoginPage()) {
    await handOffToSisuLogin();
    return;
  }

  if (!canRunSisuPlusOnCurrentRoute()) return;

  const prefs = await getPrefs();

  if (prefs.sisuPlusActive) {
    mountSisuPlus();
  } else {
    removeSisuPlus();
  }

  mountControlCenterOnce();
};

const handleRouteChange = () => {
  void reconcileRoute();
};

history.pushState = function (...args: Parameters<typeof history.pushState>) {
  origPushState.apply(this, args);
  handleRouteChange();
};

history.replaceState = function (...args: Parameters<typeof history.replaceState>) {
  origReplaceState.apply(this, args);
  handleRouteChange();
};

window.addEventListener('popstate', handleRouteChange);

const init = async () => {
  if (initStarted) return;
  initStarted = true;

  const stored = await chrome.storage.sync.get('universityConfig');
  const universityConfig = stored.universityConfig as UniversityConfig | undefined;

  if (!universityConfig || window.location.hostname !== universityConfig.sisuDomain) return;

  await reconcileRoute();

  window.addEventListener('sisuplus:session-expired', () => {
    void handOffToSisuLogin();
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync') return;

    if ('sisuPlusActive' in changes) {
      void reconcileRoute();
    }

    if ('universityConfig' in changes) {
      window.location.reload();
    }
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  void init();
}
