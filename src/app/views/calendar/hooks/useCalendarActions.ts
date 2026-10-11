import { useCallback, useMemo } from 'react';
import {
  withDismissed,
  withoutSkip,
  withoutSwap,
  withSkip,
  withSwaps,
  withUsual,
} from '@/app/api/dataPoints/calendar/attendancePlan';
import type {
  CalendarCourse,
  CalendarData,
  GroupFlagChange,
  VisibilityChange,
} from '@/app/api/dataPoints/calendar/types';
import { ALL_DATES, seriesKeyOf, type Session, type Swap } from '@/app/schedule';
import type { CalendarActions } from '../types';

export const useCalendarActions = (
  updatePlan: CalendarData['updatePlan'],
  changeVisibility: (change: VisibilityChange) => void,
): CalendarActions => {
  const swap = useCallback(
    (courseKey: string, swaps: Swap[]) => updatePlan(courseKey, (plan) => withSwaps(plan, swaps)),
    [updatePlan],
  );
  const undoSwap = useCallback(
    (session: Session) => updatePlan(session.courseKey, (plan) => withoutSwap(plan, session.id)),
    [updatePlan],
  );
  const makeUsual = useCallback(
    (courseKey: string, setId: string, groupId: string | null) =>
      updatePlan(courseKey, (plan) => withUsual(plan, setId, groupId)),
    [updatePlan],
  );
  const skip = useCallback(
    (session: Session, keep: Session, everyTime: boolean) =>
      updatePlan(session.courseKey, (plan) =>
        withSkip(plan, {
          keepSeriesKey: seriesKeyOf(keep),
          skipSeriesKey: seriesKeyOf(session),
          dateKey: everyTime ? ALL_DATES : session.dateKey,
        }),
      ),
    [updatePlan],
  );
  const undoSkip = useCallback(
    (session: Session) =>
      updatePlan(session.courseKey, (plan) => withoutSkip(plan, seriesKeyOf(session), session.dateKey)),
    [updatePlan],
  );
  const dismiss = useCallback(
    (courseKey: string, id: string) => updatePlan(courseKey, (plan) => withDismissed(plan, id)),
    [updatePlan],
  );
  const setGroups = useCallback(
    (course: CalendarCourse, changes: GroupFlagChange[]) => {
      if (course.enrolmentId && changes.length > 0) {
        changeVisibility({ courseKey: course.realisationId, enrolmentId: course.enrolmentId, groups: changes });
      }
    },
    [changeVisibility],
  );
  const setCourseVisible = useCallback(
    (course: CalendarCourse, visible: boolean) => {
      if (course.enrolmentId) {
        changeVisibility({
          courseKey: course.realisationId,
          enrolmentId: course.enrolmentId,
          groups: [],
          courseVisible: visible,
        });
      }
    },
    [changeVisibility],
  );
  return useMemo(
    () => ({ swap, undoSwap, makeUsual, skip, undoSkip, dismiss, setGroups, setCourseVisible }),
    [swap, undoSwap, makeUsual, skip, undoSkip, dismiss, setGroups, setCourseVisible],
  );
};
