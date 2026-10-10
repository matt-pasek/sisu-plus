export interface SeriesOccurrence {
  start?: string;
  end?: string;
  duration?: string;
  excluded?: boolean;
  cancelled?: boolean;
  irregularLocationIds?: string[];
  notice?: string | null;
}
