import { mountApp } from '@/app/main';
import { mountControlCenter } from '@/app/controlCenter/main';
import { DEFAULT_PREFS, SisuPrefs } from '@/app/types/prefs';
import globalCss from '@/app/global.css?inline';

const origPushState = history.pushState;
const origReplaceState = history.replaceState;
let onStudentRoute: (() => void) | null = null;
let loginHandoffStarted = false;

function isStudentPage(pathname = window.location.pathname) {
  return pathname === '/student' || pathname.startsWith('/student/');
}

function isStudentLoginPage(pathname = window.location.pathname) {
  return pathname === '/student/login' || pathname.startsWith('/student/login/');
}

function handOffToSisuLogin() {
  if (loginHandoffStarted) return;
  loginHandoffStarted = true;

  chrome.storage.sync.set({ sisuPlusActive: false }, () => {
    if (document.getElementById('sisu-plus-root')) {
      window.location.reload();
    }
  });
}

function handleStudentRouteChange() {
  if (isStudentLoginPage()) {
    handOffToSisuLogin();
    return;
  }

  if (isStudentPage() && onStudentRoute) {
    const cb = onStudentRoute;
    onStudentRoute = null;
    cb();
  }
}

history.pushState = function (...args: Parameters<typeof history.pushState>) {
  origPushState.apply(this, args);
  handleStudentRouteChange();
};

history.replaceState = function (...args: Parameters<typeof history.replaceState>) {
  origReplaceState.apply(this, args);
  handleStudentRouteChange();
};

window.addEventListener('popstate', handleStudentRouteChange);

function waitForStudentPage(): Promise<void> {
  if (isStudentPage()) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    onStudentRoute = resolve;
  });
}

function mountSisuPlus() {
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
  appRoot.classList.add('bg-background', 'text-offwhite');
  shadow.appendChild(appRoot);

  mountApp(appRoot);
}

async function init() {
  await waitForStudentPage();

  if (isStudentLoginPage()) {
    handOffToSisuLogin();
    return;
  }

  chrome.storage.sync.get(DEFAULT_PREFS, (stored) => {
    const prefs = stored as SisuPrefs;
    if (prefs.sisuPlusActive) mountSisuPlus();
    mountControlCenter();
  });

  chrome.storage.onChanged.addListener((changes) => {
    if ('sisuPlusActive' in changes) {
      window.location.reload();
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
