import type { Session, Swap } from '@/app/schedule';

export interface SwapSuggestionModel {
  swap: Swap;
  target: Session;
  clashId: string;
}
