import type { GroupFlagChange } from './GroupFlagChange.type';

export interface VisibilityChange {
  courseKey: string;
  enrolmentId: string;
  groups: GroupFlagChange[];
  courseVisible?: boolean;
}
