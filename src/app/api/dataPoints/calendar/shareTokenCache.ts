export const shareTokenKey = (origin: string): string => `calendarShareToken:${origin}`;

export const resolveShareToken = async (
  cached: string | null,
  create: () => Promise<string | null>,
): Promise<{ token: string | null; created: boolean }> =>
  cached ? { token: cached, created: false } : { token: await create(), created: true };

export const readShareToken = async (origin: string): Promise<string | null> => {
  const key = shareTokenKey(origin);
  const stored = await chrome.storage.sync.get(key);
  const value: unknown = stored[key];
  return typeof value === 'string' && value ? value : null;
};

export const saveShareToken = async (origin: string, token: string): Promise<void> => {
  await chrome.storage.sync.set({ [shareTokenKey(origin)]: token });
};
