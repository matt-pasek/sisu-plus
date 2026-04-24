import { mountApp } from '@/app/main';
import { mountControlCenter } from '@/app/controlCenter/main';
import { DEFAULT_PREFS, SisuPrefs } from '@/app/types/prefs';
import globalCss from '@/app/global.css?inline';

const origPushState = history.pushState;
let onStudentRoute: (() => void) | null = null;

history.pushState = function (...args: Parameters<typeof history.pushState>) {
  origPushState.apply(this, args);
  if (window.location.pathname.startsWith('/student/') && onStudentRoute) {
    history.pushState = origPushState;
    const cb = onStudentRoute;
    onStudentRoute = null;
    cb();
  }
};

function waitForStudentPage(): Promise<void> {
  if (window.location.pathname.startsWith('/student/')) {
    history.pushState = origPushState;
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    onStudentRoute = resolve;
    window.addEventListener('popstate', () => {
      if (window.location.pathname.startsWith('/student/')) {
        history.pushState = origPushState;
        onStudentRoute = null;
        resolve();
      }
    });
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
