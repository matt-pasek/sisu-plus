import type { SisuApiMessage, SisuApiResponse } from '@/app/api/client';

const SISU_BASE = 'https://sisu.lut.fi';

chrome.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
    const headers = details.requestHeaders ?? [];
    const authHeader = headers.find((h) => h.name.toLowerCase() === 'authorization');
    if (authHeader?.value?.startsWith('Bearer ')) {
      const token = authHeader.value.slice(7);
      chrome.storage.session.set({ sisuToken: token });
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
        chrome.storage.session.set({ sisuCookies: cookies });
      }
    }
  },
  { urls: [`${SISU_BASE}/*`] },
  ['requestHeaders'],
);

chrome.runtime.onMessage.addListener((message: SisuApiMessage, _sender, sendResponse) => {
  if (message.type !== 'SISU_API_REQUEST') return false;

  handleApiRequest(message.endpoint, message.params)
    .then((result) => sendResponse(result))
    .catch((err: unknown) => {
      const error = err instanceof Error ? err.message : String(err);
      sendResponse({ ok: false, error } satisfies SisuApiResponse<never>);
    });

  return true;
});

async function handleApiRequest(endpoint: string, params?: Record<string, string>): Promise<SisuApiResponse<unknown>> {
  const stored = await chrome.storage.session.get(['sisuToken', 'sisuCookies']);
  const token = stored.sisuToken as string | undefined;
  const cookies = stored.sisuCookies as Record<string, string> | undefined;

  const url = new URL(`${SISU_BASE}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (cookies && Object.keys(cookies).length > 0) {
    headers['Cookie'] = Object.entries(cookies)
      .map(([k, v]) => `${k}=${v}`)
      .join('; ');
  }

  const response = await fetch(url.toString(), { headers });

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error: response.statusText,
    };
  }

  const data: unknown = await response.json();
  return { ok: true, status: response.status, data };
}
