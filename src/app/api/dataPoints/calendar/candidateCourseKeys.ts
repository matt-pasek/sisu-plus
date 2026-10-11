import type { AttendancePlan, Clash, Session } from '@/app/schedule';
import type { CalendarCourse } from './types';

export const candidateCourseKeys = (
  courses: CalendarCourse[],
  plans: Record<string, AttendancePlan>,
  attended: Session[],
  clashes: Clash[],
  requested: string[],
): string[] => {
  const known = new Set(courses.map((course) => course.realisationId));
  const byId = new Map(attended.map((session) => [session.id, session]));
  const clashing = clashes
    .flatMap((clash) => clash.sessionIds.map((id) => byId.get(id)))
    .filter(
      (session): session is Session =>
        session != null && session.groupId != null && session.kind !== 'exam' && session.source === 'sisu',
    )
    .map((session) => session.courseKey);
  const swapping = Object.entries(plans)
    .filter(([, plan]) => plan.swaps.length > 0)
    .map(([courseKey]) => courseKey);
  return [...new Set([...requested, ...swapping, ...clashing])].filter((key) => known.has(key)).sort();
};
