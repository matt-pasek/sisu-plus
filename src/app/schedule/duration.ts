const DEFAULT_DURATION_MS = 3_600_000;
const ISO_DURATION = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/;

const toMs = ([, days = '0', hours = '0', minutes = '0', seconds = '0']: RegExpMatchArray): number =>
  ((Number(days) * 24 + Number(hours)) * 60 + Number(minutes)) * 60_000 + Number(seconds) * 1000;

export const parseIsoDurationMs = (duration: string): number => {
  const match = duration.match(ISO_DURATION);
  return match ? toMs(match) : DEFAULT_DURATION_MS;
};

export const tryParseIsoDurationMs = (duration: string): number | null => {
  const match = duration.match(ISO_DURATION);
  const ms = match ? toMs(match) : 0;
  return ms > 0 ? ms : null;
};

export const formatIsoDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return `PT${hours > 0 ? `${hours}H` : ''}${rest > 0 || hours === 0 ? `${rest}M` : ''}`;
};
