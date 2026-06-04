import type { UniversityConfig } from '@/app/types/universityConfig';

type OriginSessionData = Record<string, string | Record<string, string>>;

let cachedConfig: UniversityConfig | null = null;

const configReady = chrome.storage.sync.get('universityConfig').then((result) => {
  cachedConfig = (result.universityConfig as UniversityConfig) ?? null;
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes.universityConfig) {
    cachedConfig = (changes.universityConfig.newValue as UniversityConfig) ?? null;
  }
});

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    void chrome.tabs.create({ url: chrome.runtime.getURL('onboarding.html') });
  }
});

function getOrigin(value?: string): string | null {
  if (!value) return null;

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

async function patchOriginSessionData(key: string, origin: string, value: string | Record<string, string>) {
  const stored = await chrome.storage.session.get(key);
  const current = (stored[key] ?? {}) as OriginSessionData;
  await chrome.storage.session.set({ [key]: { ...current, [origin]: value } });
}

chrome.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
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
        void patchOriginSessionData('sisuTokensByOrigin', origin, token);
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
  },
  { urls: ['https://*/*'] },
  ['requestHeaders'],
);

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GET_TOKEN') {
    const origin = getOrigin(message.origin);

    chrome.storage.session.get(['sisuTokensByOrigin']).then(({ sisuTokensByOrigin }) => {
      const tokens = (sisuTokensByOrigin ?? {}) as Record<string, string>;
      sendResponse({ sisuToken: origin ? tokens[origin] : undefined });
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
