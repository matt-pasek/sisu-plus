import type { SisuPrefs } from '@/app/types/prefs';

export const shouldShowInAppChangelog = (prefs: SisuPrefs, isLoaded: boolean, releaseVersion: string): boolean =>
  isLoaded && prefs.sisuPlusOnboardingCompleted && prefs.lastSeenChangelogVersion !== releaseVersion;
