const parseUrl = (value: string): URL | null => {
  try {
    return new URL(value);
  } catch {
    return null;
  }
};

export const normalizeTimetableUrl = (input: string): string | null => {
  const url = parseUrl(input.trim().replace(/^webcal:\/\//i, 'https://'));
  if (!url || url.protocol !== 'https:' || url.username || url.password) return null;
  const isTimeEditPage = url.hostname.endsWith('timeedit.net') && url.pathname.endsWith('.html');
  return isTimeEditPage ? `${url.origin}${url.pathname.replace(/\.html$/, '.ics')}${url.search}` : url.toString();
};

export const timetableSourceLabel = (url: string): string => {
  const host = parseUrl(url)?.hostname ?? url;
  return host.includes('timeedit') ? 'TimeEdit' : host.replace(/^www\./, '');
};

export const timetableHost = (url: string): string => parseUrl(url)?.host ?? url;

export const timetableOrigin = (url: string): string | null => parseUrl(url)?.origin ?? null;
