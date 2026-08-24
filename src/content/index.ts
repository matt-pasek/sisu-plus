import { mountApp } from '@/app/main';
import { mountControlCenter } from '@/app/controlCenter/main';
import { DEFAULT_PREFS, SisuPrefs } from '@/app/types/prefs';
import globalCss from '@/app/global.css?inline';
import type { UniversityConfig } from '@/app/types/universityConfig';
import { buildShibbolethLoginUrl, withResolvedShibbolethUrl } from '@/shared/sisuUniversityConfig';
import { createSessionRevalidator, validateSession } from '@/app/api/sessionValidation';
import { hideAuthOverlay, showAuthOverlay } from '@/app/auth/mountAuthOverlay';
import { resolveResumeRoute, type ResumeStash } from '@/shared/sessionResume';

const SISU_PLUS_ROOT_ID = 'sisu-plus-root';
const SISU_PLUS_CONTROLS_ID = 'sisu-plus-controls';
const SPLASH_ID = 'sisu-plus-splash';
const ROUTE_BRIDGE_SOURCE = 'sisu-plus-route-bridge';
const ROUTE_CHANGE_TYPE = 'sisuplus:main-world-route-change';
const SESSION_PING_PATH = '/ori/api/user-details';

let appMounted = false;
let initStarted = false;
let waitingForToken = false;
let unauthenticated = false;
let unauthenticatedTimer: number | undefined;
let universityConfig: UniversityConfig | undefined;
let shadowRoot: ShadowRoot | undefined;
let lastStudentUrl = window.location.href;

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

const stashResumeRoute = async (route: string) => {
  await chrome.runtime.sendMessage({
    type: 'STASH_RESUME',
    origin: window.location.origin,
    route,
  });
};

const takeResumeStash = async (): Promise<ResumeStash | undefined> => {
  const { stash } = await chrome.runtime.sendMessage({
    type: 'TAKE_RESUME',
    origin: window.location.origin,
  });

  return stash as ResumeStash | undefined;
};

const persistResolvedUniversityConfig = async (config: UniversityConfig) => {
  if (!config.shibbolethUrl || config.shibbolethUrl === universityConfig?.shibbolethUrl) return;

  universityConfig = config;
  await chrome.storage.sync.set({ universityConfig: config });
};

const didUniversityOriginsChange = (oldConfig?: UniversityConfig, newConfig?: UniversityConfig) => {
  if (!oldConfig || !newConfig) return true;

  return oldConfig.sisuOrigin !== newConfig.sisuOrigin || oldConfig.moodleOrigin !== newConfig.moodleOrigin;
};

const hasSisuPlusRoot = () => Boolean(document.getElementById(SISU_PLUS_ROOT_ID));
const hasControlCenterRoot = () => Boolean(document.getElementById(SISU_PLUS_CONTROLS_ID));

const reloadToRestoreNativeSisu = () => {
  window.location.reload();
};

const navigateToShibbolethLogin = async () => {
  if (!universityConfig) return;

  const resolvedConfig = await withResolvedShibbolethUrl(universityConfig);
  await persistResolvedUniversityConfig(resolvedConfig);

  if (!resolvedConfig.shibbolethUrl) {
    if (!isStudentLoginPage()) {
      window.location.assign(`${resolvedConfig.sisuOrigin}/student/login`);
    }

    return;
  }

  window.location.assign(
    buildShibbolethLoginUrl({
      shibbolethUrl: resolvedConfig.shibbolethUrl,
      sisuOrigin: resolvedConfig.sisuOrigin,
      targetUrl: lastStudentUrl,
    }),
  );
};

const pingSession = async () => {
  const token = await getStoredSisuToken();

  if (!token) {
    throw new Error('No captured token to validate');
  }

  return fetch(`${window.location.origin}${SESSION_PING_PATH}`, {
    credentials: 'include',
    headers: { Authorization: `Bearer ${token}` },
  });
};

const sessionRevalidator = createSessionRevalidator({
  validate: () => validateSession(pingSession),
  onExpired: () => enterUnauthenticated(true),
});

const revalidateSession = () => {
  if (!appMounted || unauthenticated || waitingForToken) return;

  void sessionRevalidator.revalidate();
};

const exitUnauthenticated = () => {
  if (unauthenticatedTimer !== undefined) {
    window.clearTimeout(unauthenticatedTimer);
    unauthenticatedTimer = undefined;
  }

  if (unauthenticated) {
    sessionRevalidator.reset();

    if (shadowRoot) {
      hideAuthOverlay(shadowRoot);
    }
  }

  waitingForToken = false;
  unauthenticated = false;
};

const continueToReAuth = async () => {
  await stashResumeRoute(`${window.location.pathname}${window.location.search}`);

  try {
    window.sessionStorage.setItem('sisuPlusReauth', '1');
  } catch {
    // Private mode or blocked storage; the splash is optional polish.
  }

  await navigateToShibbolethLogin();
};

const applyUnauthenticated = async (clearStoredSession: boolean) => {
  if (unauthenticated) return;

  waitingForToken = false;
  unauthenticated = true;

  if (clearStoredSession) {
    await clearStoredSessionForCurrentOrigin();
  }

  if (!appMounted || !shadowRoot) return;

  showAuthOverlay(shadowRoot, () => {
    void continueToReAuth();
  });
};

const enterUnauthenticated = (clearStoredSession: boolean) => {
  if (unauthenticated || unauthenticatedTimer !== undefined) return;

  unauthenticatedTimer = window.setTimeout(() => {
    unauthenticatedTimer = undefined;
    void applyUnauthenticated(clearStoredSession);
  }, 100);
};

const mountSisuPlus = () => {
  if (appMounted || hasSisuPlusRoot()) {
    appMounted = true;
    shadowRoot ??= document.getElementById(SISU_PLUS_ROOT_ID)?.shadowRoot ?? undefined;
    return;
  }

  document.body.replaceChildren();

  const host = document.createElement('div');
  host.id = SISU_PLUS_ROOT_ID;
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: 'open' });
  shadowRoot = shadow;

  const style = document.createElement('style');
  style.textContent = globalCss;
  shadow.appendChild(style);

  const appRoot = document.createElement('div');
  appRoot.id = 'app';
  appRoot.classList.add('bg-background', 'text-offwhite');
  shadow.appendChild(appRoot);

  mountApp(appRoot);
  appMounted = true;
  document.getElementById(SPLASH_ID)?.remove();
};

const mountControlCenterOnce = () => {
  if (hasControlCenterRoot()) return;

  mountControlCenter();
};

const reconcileRoute = async () => {
  await ensureBodyReady();

  if (isStudentLoginPage()) {
    enterUnauthenticated(false);
    return;
  }

  if (!canRunSisuPlusOnCurrentRoute()) return;

  lastStudentUrl = window.location.href;

  const prefs = await getPrefs();

  if (!prefs.sisuPlusActive) {
    exitUnauthenticated();

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

  exitUnauthenticated();

  const resumeRoute = resolveResumeRoute({
    currentPath: window.location.pathname,
    stash: await takeResumeStash(),
    now: Date.now(),
  });

  if (resumeRoute) {
    window.history.replaceState(null, '', resumeRoute);
    lastStudentUrl = window.location.href;
  }

  mountSisuPlus();
  mountControlCenterOnce();
  revalidateSession();
};

const handleRouteChange = () => {
  void reconcileRoute();
};

const isRouteBridgeMessage = (event: MessageEvent) => {
  if (event.source !== window || event.origin !== window.location.origin) return false;
  if (!event.data || typeof event.data !== 'object') return false;

  const data = event.data as { source?: unknown; type?: unknown };
  return data.source === ROUTE_BRIDGE_SOURCE && data.type === ROUTE_CHANGE_TYPE;
};

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return;

  revalidateSession();
});

window.addEventListener('popstate', handleRouteChange);
window.addEventListener('message', (event) => {
  if (!isRouteBridgeMessage(event)) return;
  handleRouteChange();
});

const init = async () => {
  if (initStarted) return;
  initStarted = true;

  const stored = await chrome.storage.sync.get('universityConfig');
  universityConfig = stored.universityConfig as UniversityConfig | undefined;

  if (!universityConfig || window.location.hostname !== universityConfig.sisuDomain) return;

  await reconcileRoute();

  window.addEventListener('sisuplus:session-expired', () => {
    enterUnauthenticated(true);
  });

  chrome.runtime.onMessage.addListener((message) => {
    if (message.type !== 'SISU_TOKEN_CAPTURED') return;
    if (message.origin !== window.location.origin) return;
    if (!waitingForToken && !unauthenticated) return;

    exitUnauthenticated();
    void reconcileRoute();
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync') return;

    if ('sisuPlusActive' in changes) {
      void reconcileRoute();
    }

    if ('universityConfig' in changes) {
      const oldConfig = changes.universityConfig.oldValue as UniversityConfig | undefined;
      const newConfig = changes.universityConfig.newValue as UniversityConfig | undefined;
      universityConfig = newConfig;

      if (didUniversityOriginsChange(oldConfig, newConfig)) {
        window.location.reload();
      }
    }
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  void init();
}
