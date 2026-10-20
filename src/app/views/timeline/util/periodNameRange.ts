const sharedSuffixStart = (first: string, last: string): number => {
  let length = 0;
  while (
    length < first.length &&
    length < last.length &&
    first[first.length - 1 - length] === last[last.length - 1 - length]
  ) {
    length += 1;
  }
  const suffix = first.slice(first.length - length);
  const space = suffix.indexOf(' ');
  return space === -1 ? first.length : first.length - length + space;
};

export const formatPeriodNameRange = (first: string, last: string): string => {
  if (first === last) return first;
  const firstCut = sharedSuffixStart(first, last);
  if (firstCut === first.length) return `${first} – ${last}`;
  const lastCut = last.length - (first.length - firstCut);
  const firstHead = first.slice(0, firstCut);
  const lastHead = last.slice(0, lastCut);
  if (!firstHead || !lastHead) return `${first} – ${last}`;
  return `${firstHead}–${lastHead}${first.slice(firstCut)}`;
};
