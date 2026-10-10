import type { Occurrence } from './Occurrence.type';
import type { SessionKind } from './SessionKind.type';

export interface Session extends Occurrence {
  id: string;
  courseKey: string;
  courseName: string;
  courseUnitId: string | null;
  groupId: string | null;
  groupName: string | null;
  kind: SessionKind;
  colorIndex: number;
}
