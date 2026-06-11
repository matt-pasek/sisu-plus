import type { UniversityConfig } from '@/app/types/universityConfig';

type OriginSessionData = Record<string, string | Record<string, string>>;

const CONTENT_SCRIPT_ID = 'sisu-plus-content';
const CONTENT_SCRIPT_FILE = 'content/index.js';

let cachedConfig: UniversityConfig | null = null;
let webRequestListenerRegistered = false;

const getOrigin = (value?: string): string | null => {
  if (!value) return null;

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
};

const getSisuMatchPattern = (config: UniversityConfig) => `${config.sisuOrigin}/*`;

const getWebRequestUrlPatterns = (config: UniversityConfig) => [`${config.sisuOrigin}/*`, `${config.moodleOrigin}/*`];

const patchOriginSessionData = async (key: string, origin: string, value: string | Record<string, string>) => {
  const stored = await chrome.storage.session.get(key);
  const current = (stored[key] ?? {}) as OriginSessionData;

  await chrome.storage.session.set({
    [key]: {
      ...current,
      [origin]: value,
    },
  });
};

const clearOriginSessionData = async (origin: string) => {
  const stored = await chrome.storage.session.get(['sisuTokensByOrigin', 'sisuCookiesByOrigin']);

  const tokens = { ...((stored.sisuTokensByOrigin ?? {}) as Record<string, string>) };
  const cookies = { ...((stored.sisuCookiesByOrigin ?? {}) as Record<string, Record<string, string>>) };

  delete tokens[origin];
  delete cookies[origin];

  await chrome.storage.session.set({
    sisuTokensByOrigin: tokens,
    sisuCookiesByOrigin: cookies,
  });
};

const notifyTokenCaptured = (tabId: number, origin: string) => {
  if (tabId < 0) return;

  void chrome.tabs.sendMessage(tabId, {
    type: 'SISU_TOKEN_CAPTURED',
    origin,
  });
};

const onBeforeSendHeaders: Parameters<typeof chrome.webRequest.onBeforeSendHeaders.addListener>[0] = (details) => {
  void (async () => {
    if (!cachedConfig) await configReady;
    if (!cachedConfig) return;

    const origin = getOrigin(details.url);
    if (!origin) return;
    if (origin !== cachedConfig.sisuOrigin && origin !== cachedConfig.moodleOrigin) return;

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

const syncRuntimeForConfig = async (config: UniversityConfig | null) => {
  await syncContentScriptRegistration(config);
  await syncWebRequestListener(config);
};

const configReady = chrome.storage.sync.get('universityConfig').then(async (result) => {
  cachedConfig = (result.universityConfig as UniversityConfig) ?? null;
  await syncRuntimeForConfig(cachedConfig);
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes.universityConfig) {
    cachedConfig = (changes.universityConfig.newValue as UniversityConfig) ?? null;
    void syncRuntimeForConfig(cachedConfig);
  }
});

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    void chrome.tabs.create({ url: chrome.runtime.getURL('onboarding.html') });
  }

  void configReady.then(() => syncRuntimeForConfig(cachedConfig));
});

chrome.runtime.onStartup.addListener(() => {
  void configReady.then(() => syncRuntimeForConfig(cachedConfig));
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GET_TOKEN') {
    const origin = getOrigin(message.origin);

    chrome.storage.session.get(['sisuTokensByOrigin']).then(({ sisuTokensByOrigin }) => {
      const tokens = (sisuTokensByOrigin ?? {}) as Record<string, string>;
      sendResponse({ sisuToken: origin ? tokens[origin] : undefined });
    });

    return true;
  }

  if (message.type === 'CLEAR_SESSION_FOR_ORIGIN') {
    const origin = getOrigin(message.origin);

    if (!origin) {
      sendResponse({ ok: false });
      return false;
    }

    clearOriginSessionData(origin)
      .then(() => sendResponse({ ok: true }))
      .catch((err) => sendResponse({ ok: false, err }));

    return true;
  }

  if (message.type === 'SYNC_CONTENT_SCRIPT') {
    chrome.storage.sync.get('universityConfig').then(({ universityConfig }) => {
      const config = (universityConfig as UniversityConfig) ?? null;

      cachedConfig = config;

      syncRuntimeForConfig(config)
        .then(() => sendResponse({ ok: true }))
        .catch((err) => sendResponse({ ok: false, err }));
    });

    return true;
  }

  if (message.type === 'GET_MOODLE') {
    chrome.storage.sync.get('moodleToken').then(({ moodleToken }) => {
      fetch(moodleToken)
        .then((res) => {
          if (!res.ok) throw new Error('Fetch failed');
          return res.text();
        })
        .then((textData) => {
          sendResponse(textData);
        })
        .catch((err) => {
          sendResponse({ err });
        });
    });

    return true;
  }
});
