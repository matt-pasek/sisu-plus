export type ResumeStash = {
  route: string;
  savedAt: number;
};

export const RESUME_TTL_MS = 10 * 60_000;

const LANDING_PATHS = ['/student', '/student/'];

export const isResumeFresh = (stash: ResumeStash, now: number): boolean => {
  const age = now - stash.savedAt;
  return age >= 0 && age < RESUME_TTL_MS;
};

export const resolveResumeRoute = ({
  currentPath,
  stash,
  now,
}: {
  currentPath: string;
  stash: ResumeStash | undefined;
  now: number;
}): string | null => {
  if (!stash || !isResumeFresh(stash, now)) return null;
  if (!LANDING_PATHS.includes(currentPath)) return null;
  if (LANDING_PATHS.includes(stash.route)) return null;

  return stash.route;
};
