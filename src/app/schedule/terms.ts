import type { DateRange } from './types';

const AUTUMN_START_MONTH = 8;

export const termRangeFor = (dateKey: string): DateRange => {
  const year = Number(dateKey.slice(0, 4));
  const month = Number(dateKey.slice(5, 7));
  return month >= AUTUMN_START_MONTH
    ? { startKey: `${year}-08-01`, endKey: `${year + 1}-01-01` }
    : { startKey: `${year}-01-01`, endKey: `${year}-08-01` };
};
