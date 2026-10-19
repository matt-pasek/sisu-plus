import { useCallback, useState } from 'react';
import type { CalendarDeadline } from '@/app/api/dataPoints/calendar/types';
import type { DeadlinePopoverState } from '../types';

export const useDeadlinePopover = () => {
  const [target, setTarget] = useState<DeadlinePopoverState | null>(null);
  const open = useCallback(
    (deadline: CalendarDeadline, element: HTMLElement) =>
      setTarget({ deadline, element, anchor: element.getBoundingClientRect() }),
    [],
  );
  const close = useCallback(() => setTarget(null), []);
  return { target, open, close };
};
