import { mountApp } from '@/app/main';
import { mountControlCenter } from '@/app/controlCenter/main';
import { DEFAULT_PREFS, SisuPrefs } from '@/app/types/prefs';
import globalCss from '@/app/global.css?inline';
import type { UniversityConfig } from '@/app/types/universityConfig';

const SISU_PLUS_ROOT_ID = 'sisu-plus-root';
const SISU_PLUS_CONTROLS_ID = 'sisu-plus-controls';

const origPushState = history.pushState;
const origReplaceState = history.replaceState;

let appMounted = false;
let initStarted = false;
let waitingForToken = false;

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

const getStoredSisuToken = async () => {
  const { sisuToken } = await chrome.runtime.sendMessage({
    type: 'GET_TOKEN',
    origin: window.location.origin,
  });

  return sisuToken as string | undefined;
};

const clearStoredSessionForCurrentOrigin = async () => {
  await chrome.runtime.sendMessage({
    type: 'CLEAR_SESSION_FOR_ORIGIN',
    origin: window.location.origin,
  });
};

const hasSisuPlusRoot = () => Boolean(document.getElementById(SISU_PLUS_ROOT_ID));
const hasControlCenterRoot = () => Boolean(document.getElementById(SISU_PLUS_CONTROLS_ID));

const reloadToRestoreNativeSisu = () => {
  window.location.reload();
};

const removeSisuPlus = () => {
  document.getElementById(SISU_PLUS_ROOT_ID)?.remove();
  appMounted = false;
};

const handOffToSisuLogin = () => {
  waitingForToken = false;
  removeSisuPlus();
};

const handleSessionExpired = async () => {
  waitingForToken = false;
  await clearStoredSessionForCurrentOrigin();
  removeSisuPlus();
};

const mountSisuPlus = () => {
  if (appMounted || hasSisuPlusRoot()) {
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
  if (hasControlCenterRoot()) return;

  mountControlCenter();
};

const reconcileRoute = async () => {
  await ensureBodyReady();

  if (isStudentLoginPage()) {
    handOffToSisuLogin();
    return;
  }

  if (!canRunSisuPlusOnCurrentRoute()) return;

  const prefs = await getPrefs();

  if (!prefs.sisuPlusActive) {
    waitingForToken = false;

    if (hasSisuPlusRoot()) {
      reloadToRestoreNativeSisu();
      return;
    }

    mountControlCenterOnce();
    return;
  }

  const token = await getStoredSisuToken();

  if (!token) {
    waitingForToken = true;
    mountControlCenterOnce();
    return;
  }

  waitingForToken = false;
  mountSisuPlus();
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
    void handleSessionExpired();
  });

  chrome.runtime.onMessage.addListener((message) => {
    if (message.type !== 'SISU_TOKEN_CAPTURED') return;
    if (message.origin !== window.location.origin) return;
    if (!waitingForToken) return;

    void reconcileRoute();
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
