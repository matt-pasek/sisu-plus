export interface Occurrence {
  seriesId: string;
  index: number;
  start: Date;
  end: Date;
  dateKey: string;
  cancelled: boolean;
  locationIds: string[];
  notice: string | null;
}
