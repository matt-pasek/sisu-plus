import type { Session } from '@/app/schedule';

export interface PopoverTarget {
  session: Session;
  element: HTMLElement;
}
