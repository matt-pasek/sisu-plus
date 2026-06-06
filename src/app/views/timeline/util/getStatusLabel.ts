import type { TimelineCourse } from '@/app/api/dataPoints/getTimelineCourses';
import i18n, { I18N_NAMESPACE } from '@/app/i18n';

export const getStatusLabel = (course: TimelineCourse): string => {
  if (course.isPassed)
    return course.grade != null ? String(course.grade) : i18n.t('views.timeline.status.done', { ns: I18N_NAMESPACE });
  if (course.isEnrolled) return i18n.t('views.timeline.status.active', { ns: I18N_NAMESPACE });
  return i18n.t('views.timeline.status.planned', { ns: I18N_NAMESPACE });
};
