const DEFAULT_DURATION_MS = 3_600_000;
const ISO_DURATION = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/;

export const parseIsoDurationMs = (duration: string): number => {
  const match = duration.match(ISO_DURATION);
  if (!match) return DEFAULT_DURATION_MS;
  const [, days = '0', hours = '0', minutes = '0', seconds = '0'] = match;
  return ((Number(days) * 24 + Number(hours)) * 60 + Number(minutes)) * 60_000 + Number(seconds) * 1000;
};
