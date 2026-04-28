import { SISU_ORIGINS } from '../shared/domains';

type OriginSessionData = Record<string, string | Record<string, string>>;

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
    const origin = getOrigin(details.url);
    if (!origin) return;

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
  },
  { urls: SISU_ORIGINS.map((origin) => `${origin}/*`) },
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
