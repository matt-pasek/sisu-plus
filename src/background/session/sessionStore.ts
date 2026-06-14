type OriginSessionData = Record<string, string | Record<string, string>>;

export const patchOriginSessionData = async (key: string, origin: string, value: string | Record<string, string>) => {
  const stored = await chrome.storage.session.get(key);
  const current = (stored[key] ?? {}) as OriginSessionData;

  await chrome.storage.session.set({
    [key]: {
      ...current,
      [origin]: value,
    },
  });
};

export const getSisuTokenForOrigin = async (origin: string | null): Promise<string | undefined> => {
  const { sisuTokensByOrigin } = await chrome.storage.session.get(['sisuTokensByOrigin']);
  const tokens = (sisuTokensByOrigin ?? {}) as Record<string, string>;
  return origin ? tokens[origin] : undefined;
};

export const clearOriginSessionData = async (origin: string) => {
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
