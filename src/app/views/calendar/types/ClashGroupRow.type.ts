import type { Session } from '@/app/schedule';

export interface ClashGroupRow {
  session: Session;
  ariaLabel: string;
  detail: string;
  status: string | null;
}
