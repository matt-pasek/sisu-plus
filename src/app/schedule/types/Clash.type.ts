import type { ClashKind } from './ClashKind.type';

export interface Clash {
  id: string;
  sessionIds: [string, string];
  start: Date;
  end: Date;
  minutes: number;
  kind: ClashKind;
  involvesExam: boolean;
}
