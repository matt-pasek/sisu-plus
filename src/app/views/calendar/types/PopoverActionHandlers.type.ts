import type { Session } from '@/app/schedule';

export interface PopoverActionHandlers {
  onShowAllSessions: () => void;
  onGoTo: (other: Session) => void;
  onSwitchToSuggestion: () => void;
  onKeep: () => void;
  onSkip: (everyTime: boolean) => void;
  onUndoSkip: () => void;
  onGoInstead: () => void;
  onSwapWeek: () => void;
  onMakeUsual: () => void;
  onUndoSwap: () => void;
  onSwitchGroup: () => void;
  onHideGroup: () => void;
}
