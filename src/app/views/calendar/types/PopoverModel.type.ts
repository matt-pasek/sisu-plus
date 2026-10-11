import type { AttendanceStatus, Session } from '@/app/schedule';
import type { PopoverActionHandlers } from './PopoverActionHandlers.type';
import type { SessionBadge } from './SessionBadge.type';
import type { SwapSuggestionModel } from './SwapSuggestionModel.type';

export interface PopoverModel {
  status: AttendanceStatus;
  badge: SessionBadge | null;
  otherTimes: Session[];
  suggestion: SwapSuggestionModel | null;
  partner: Session | null;
  groupMenu: 'switch' | 'hide' | null;
  groupName: string | null;
  canGoInstead: boolean;
  canSwapWeek: boolean;
  handlers: PopoverActionHandlers;
}
