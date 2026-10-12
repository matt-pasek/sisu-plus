export interface CalendarDeadline {
  id: string;
  title: string;
  dueAt: Date;
  dateKey: string;
  courseLabel: string | null;
  colorIndex: number | null;
  url: string | null;
}
