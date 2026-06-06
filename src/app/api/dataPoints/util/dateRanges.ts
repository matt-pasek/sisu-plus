export const rangesOverlap = (
  firstStart: string | null,
  firstEnd: string | null,
  secondStart: string,
  secondEnd: string,
): boolean => {
  if (!firstStart || !firstEnd) return false;
  return firstStart < secondEnd && firstEnd > secondStart;
};
