import type { TimelineCourse } from '@/app/api/dataPoints/getTimelineCourses';
import type { StatusTone } from '@/app/components/ui/types';
import i18n, { I18N_NAMESPACE } from '@/app/i18n';
import type { TimelineValidationWarning } from '@/app/views/timeline/util/timelineValidation';

export const getStatusLabel = (course: TimelineCourse): string => {
  if (course.isPassed)
    return course.grade != null ? String(course.grade) : i18n.t('views.timeline.status.done', { ns: I18N_NAMESPACE });
  if (course.isEnrolled) return i18n.t('views.timeline.status.active', { ns: I18N_NAMESPACE });
  return i18n.t('views.timeline.status.planned', { ns: I18N_NAMESPACE });
};

export const getWarningLabel = (warnings: Pick<TimelineValidationWarning, 'type'>[]): string => {
  if (warnings.length > 1)
    return i18n.t('views.timeline.course.warningCount', { ns: I18N_NAMESPACE, count: warnings.length });
  return warnings[0]?.type === 'prerequisite'
    ? i18n.t('views.timeline.course.prerequisiteWarning', { ns: I18N_NAMESPACE })
    : i18n.t('views.timeline.course.periodWarning', { ns: I18N_NAMESPACE });
};

export const getStatusTone = (course: TimelineCourse): StatusTone => {
  if (course.isPassed) return 'ok';
  if (course.isEnrolled) return 'info';
  return 'neutral';
};
