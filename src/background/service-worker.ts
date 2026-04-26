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

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GET_TOKEN') {
    chrome.storage.session.get(['sisuToken']).then(sendResponse);
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
