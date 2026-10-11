import type { Clash, Holiday, Session } from '@/app/schedule';

export type MonthException =
  | { kind: 'exam'; session: Session }
  | { kind: 'cancelled'; session: Session }
  | { kind: 'roomChange'; session: Session }
  | { kind: 'clash'; clash: Clash }
  | { kind: 'periodStart'; name: string }
  | { kind: 'holiday'; holiday: Holiday }
  | { kind: 'noTeaching' };
