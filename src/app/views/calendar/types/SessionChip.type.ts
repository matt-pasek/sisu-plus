export type SessionChip =
  | { type: 'clash' }
  | { type: 'partialClash'; minutes: number }
  | { type: 'roomChanged' }
  | { type: 'cancelled' };
