import type { TimelineCourse } from '@/app/api/dataPoints/getTimelineCourses';

export const TIMELINE_COURSE_DRAG_TYPE = 'timeline-course';

export interface TimelineCourseDragData {
  kind: 'timeline-course';
  courseUnitId: string;
  periodCount: number;
  periodLocators: string[];
}

export interface TimelinePeriodDropData {
  kind: 'timeline-period';
  periodLocator: string;
}

export interface TimelinePoolDropData {
  kind: 'timeline-pool';
}

export type TimelineDropData = TimelinePeriodDropData | TimelinePoolDropData;

export function getCourseDragData(course: TimelineCourse): TimelineCourseDragData {
  return {
    kind: 'timeline-course',
    courseUnitId: course.courseUnitId,
    periodCount: Math.max(course.plannedPeriods.length, 1),
    periodLocators: course.plannedPeriods.map((period) => period.locator),
  };
}

export function isTimelineCourseDragData(value: unknown): value is TimelineCourseDragData {
  return (
    typeof value === 'object' &&
    value != null &&
    'kind' in value &&
    value.kind === 'timeline-course' &&
    'courseUnitId' in value &&
    typeof value.courseUnitId === 'string' &&
    'periodCount' in value &&
    typeof value.periodCount === 'number' &&
    'periodLocators' in value &&
    Array.isArray(value.periodLocators) &&
    value.periodLocators.every((locator) => typeof locator === 'string')
  );
}

export function isTimelineDropData(value: unknown): value is TimelineDropData {
  if (typeof value !== 'object' || value == null || !('kind' in value)) return false;

  if (value.kind === 'timeline-pool') return true;

  return value.kind === 'timeline-period' && 'periodLocator' in value && typeof value.periodLocator === 'string';
}
