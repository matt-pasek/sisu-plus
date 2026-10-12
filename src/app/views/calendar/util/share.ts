const SISU_LANGUAGES = ['fi', 'en', 'sv'] as const;

export const shareLanguage = (locale: string): (typeof SISU_LANGUAGES)[number] =>
  SISU_LANGUAGES.find((language) => locale.toLowerCase().startsWith(language)) ?? 'en';

export const shareFeedUrl = (origin: string, token: string): string =>
  `${origin}/ilmo/api/calendar-share/${encodeURIComponent(token)}`;
