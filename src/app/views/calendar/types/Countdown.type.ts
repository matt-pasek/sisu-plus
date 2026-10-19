export type Countdown =
  | { kind: 'now'; until: Date }
  | { kind: 'soon'; minutes: number }
  | { kind: 'later'; days: number };
