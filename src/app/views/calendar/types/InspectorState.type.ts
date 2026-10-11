export type InspectorState =
  | { type: 'sessions'; seriesKey: string }
  | { type: 'groups'; courseKey: string; setId: string | null };
