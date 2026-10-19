export interface PopoverViewCallbacks {
  showAllSessions: (seriesKey: string) => void;
  openGroups: (courseKey: string, setId: string | null) => void;
  close: () => void;
}
