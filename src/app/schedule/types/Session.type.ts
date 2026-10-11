import type { Occurrence } from './Occurrence.type';
import type { SessionKind } from './SessionKind.type';
import type { SessionSource } from './SessionSource.type';

export interface Session extends Occurrence {
  id: string;
  courseKey: string;
  courseName: string;
  courseUnitId: string | null;
  groupId: string | null;
  groupName: string | null;
  groupIds: string[];
  kind: SessionKind;
  colorIndex: number;
  source: SessionSource;
  locationText: string | null;
}
