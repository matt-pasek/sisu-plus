export interface YearBand {
  kind: 'period' | 'noTeaching' | 'month';
  label: string;
  from: number;
  to: number;
}
