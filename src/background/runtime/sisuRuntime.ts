import type { UniversityConfig } from '@/app/types/universityConfig';
import { clearOriginSessionData, patchOriginSessionData } from '@/background/session/sessionStore';
import { getOrigin } from '@/background/util/origin';

const CONTENT_SCRIPT_ID = 'sisu-plus-content';
const CONTENT_SCRIPT_FILE = 'content/index.js';

let webRequestListenerRegistered = false;
let currentConfig: UniversityConfig | null = null;

const getSisuMatchPattern = (config: UniversityConfig) => `${config.sisuOrigin}/*`;

const getWebRequestUrlPatterns = (config: UniversityConfig) => [`${config.sisuOrigin}/*`, `${config.moodleOrigin}/*`];

const notifyTokenCaptured = (tabId: number, origin: string) => {
  if (tabId < 0) return;

  void chrome.tabs.sendMessage(tabId, {
    type: 'SISU_TOKEN_CAPTURED',
    origin,
  });
};

const onBeforeSendHeaders: Parameters<typeof chrome.webRequest.onBeforeSendHeaders.addListener>[0] = (details) => {
  void (async () => {
    const config = currentConfig;
    if (!config) return;

    const origin = getOrigin(details.url);
    if (!origin) return;
    if (origin !== config.sisuOrigin && origin !== config.moodleOrigin) return;

    const headers = details.requestHeaders ?? [];

    const authHeader = headers.find((h) => h.name.toLowerCase() === 'authorization');
    if (authHeader?.value?.startsWith('Bearer ')) {
      const token = authHeader.value.slice(7);

      void patchOriginSessionData('sisuTokensByOrigin', origin, token).then(() => {
        notifyTokenCaptured(details.tabId, origin);
      });
    }

    const cookieHeader = headers.find((h) => h.name.toLowerCase() === 'cookie');
    if (cookieHeader?.value) {
      const cookies: Record<string, string> = {};

      cookieHeader.value.split(';').forEach((part) => {
        const [k, ...v] = part.trim().split('=');
        const key = k?.trim();

        if (key === 'AWSALB' || key === 'AWSALBCORS') {
          cookies[key] = v.join('=');
        }
      });

      if (Object.keys(cookies).length > 0) {
        void patchOriginSessionData('sisuCookiesByOrigin', origin, cookies);
      }
    }
  })();
};

const syncContentScriptRegistration = async (config: UniversityConfig | null) => {
  const registeredScripts = await chrome.scripting.getRegisteredContentScripts({
    ids: [CONTENT_SCRIPT_ID],
  });

  if (!config) {
    if (registeredScripts.length > 0) {
      await chrome.scripting.unregisterContentScripts({
        ids: [CONTENT_SCRIPT_ID],
      });
    }

    return;
  }

  const matches = [getSisuMatchPattern(config)];

  if (registeredScripts.length > 0) {
    await chrome.scripting.updateContentScripts([
      {
        id: CONTENT_SCRIPT_ID,
        matches,
        js: [CONTENT_SCRIPT_FILE],
        runAt: 'document_start',
        allFrames: false,
      },
    ]);

    return;
  }

  await chrome.scripting.registerContentScripts([
    {
      id: CONTENT_SCRIPT_ID,
      matches,
      js: [CONTENT_SCRIPT_FILE],
      runAt: 'document_start',
      allFrames: false,
      persistAcrossSessions: true,
    },
  ]);
};

const syncWebRequestListener = async (config: UniversityConfig | null) => {
  if (webRequestListenerRegistered) {
    chrome.webRequest.onBeforeSendHeaders.removeListener(onBeforeSendHeaders);
    webRequestListenerRegistered = false;
  }

  if (!config) return;

  chrome.webRequest.onBeforeSendHeaders.addListener(
    onBeforeSendHeaders,
    {
      urls: getWebRequestUrlPatterns(config),
    },
    ['requestHeaders'],
  );

  webRequestListenerRegistered = true;
};

export const syncRuntimeForConfig = async (config: UniversityConfig | null) => {
  currentConfig = config;
  await syncContentScriptRegistration(config);
  await syncWebRequestListener(config);
};

export const clearSessionForOrigin = clearOriginSessionData;
