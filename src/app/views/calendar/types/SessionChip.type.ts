export type SessionChip =
  | { type: 'clash' }
  | { type: 'partialClash'; minutes: number }
  | { type: 'roomChanged' }
  | { type: 'cancelled' }
  | { type: 'swapped' }
  | { type: 'skipping' }
  | { type: 'swapUnavailable' };
