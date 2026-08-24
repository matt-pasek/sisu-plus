import type { ResumeStash } from '@/shared/sessionResume';

const RESUME_KEY = 'sisuPlusResumeByOrigin';

type ResumeByOrigin = Record<string, ResumeStash>;

const readAll = async (): Promise<ResumeByOrigin> => {
  const stored = await chrome.storage.session.get([RESUME_KEY]);
  return (stored[RESUME_KEY] ?? {}) as ResumeByOrigin;
};

export const stashResume = async (origin: string, route: string, savedAt: number): Promise<void> => {
  const current = await readAll();

  await chrome.storage.session.set({
    [RESUME_KEY]: {
      ...current,
      [origin]: { route, savedAt },
    },
  });
};

export const takeResume = async (origin: string): Promise<ResumeStash | undefined> => {
  const current = await readAll();
  const stash = current[origin];

  if (!stash) return undefined;

  const remaining = { ...current };
  delete remaining[origin];

  await chrome.storage.session.set({ [RESUME_KEY]: remaining });

  return stash;
};
