export const shareTokenKey = (origin: string, personId: string): string => `calendarShareToken:${origin}:${personId}`;

export const resolveShareToken = async (
  cached: string | null,
  create: () => Promise<string | null>,
): Promise<{ token: string | null; created: boolean }> =>
  cached ? { token: cached, created: false } : { token: await create(), created: true };

export const isNotFound = (error: unknown): boolean =>
  typeof error === 'object' && error !== null && 'status' in error && error.status === 404;

export const readShareToken = async (key: string): Promise<string | null> => {
  const stored = await chrome.storage.sync.get(key);
  const value: unknown = stored[key];
  return typeof value === 'string' && value ? value : null;
};

export const saveShareToken = async (key: string, token: string): Promise<void> => {
  await chrome.storage.sync.set({ [key]: token });
};

export const clearShareToken = async (key: string): Promise<void> => {
  await chrome.storage.sync.remove(key);
};
