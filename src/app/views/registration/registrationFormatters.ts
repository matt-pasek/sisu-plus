import type {
  RegistrationCourse,
  RegistrationImplementation,
  RegistrationStatus,
} from '@/app/api/dataPoints/getRegistrationCourses';
import i18n, { getCurrentLocale, I18N_NAMESPACE } from '@/app/i18n';

export const courseColors = ['bg-[#6f95ff]', 'bg-[#9b7cff]', 'bg-[#6ed39a]', 'bg-[#f0b761]'];

export const formatCredits = (credits: number | null): string =>
  credits == null ? '-' : `${credits} ${i18n.t('util.credits.short', { ns: I18N_NAMESPACE })}`;

export const formatDate = (value: string | null): string => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(getCurrentLocale(), { day: 'numeric', month: 'numeric', year: 'numeric' });
};

export const formatDateTime = (value: string | null): string => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(getCurrentLocale(), {
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    month: 'numeric',
    year: 'numeric',
  });
};

export const formatDateRange = (start: string | null, end: string | null): string => {
  if (!start && !end) return i18n.t('views.registration.labels.datesNotPublished', { ns: I18N_NAMESPACE });
  if (!start) return i18n.t('views.registration.labels.untilDate', { ns: I18N_NAMESPACE, date: formatDate(end) });
  if (!end) return i18n.t('views.registration.labels.fromDate', { ns: I18N_NAMESPACE, date: formatDate(start) });
  return `${formatDate(start)}-${formatDate(end)}`;
};

export const isExamImplementation = (implementation: RegistrationImplementation | null): boolean =>
  implementation?.isExam === true;

export const formatImplementationDateRange = (implementation: RegistrationImplementation | null): string => {
  if (!implementation) return i18n.t('views.registration.labels.checkSisuLater', { ns: I18N_NAMESPACE });
  const { activityStart: start, activityEnd: end } = implementation;
  if (isExamImplementation(implementation)) {
    return start ? formatDate(start) : i18n.t('views.registration.labels.examDateNotPublished', { ns: I18N_NAMESPACE });
  }
  return formatDateRange(start, end);
};

export const getStatusLabel = (status: RegistrationStatus): string => {
  switch (status) {
    case 'registered':
      return i18n.t('views.registration.status.registered', { ns: I18N_NAMESPACE });
    case 'processing':
      return i18n.t('views.registration.status.processing', { ns: I18N_NAMESPACE });
    case 'rejected':
      return i18n.t('views.registration.status.rejected', { ns: I18N_NAMESPACE });
    case 'not-selected':
      return i18n.t('views.registration.status.notSelected', { ns: I18N_NAMESPACE });
    case 'not-enrolled':
      return i18n.t('views.registration.status.notEnrolled', { ns: I18N_NAMESPACE });
  }
};

export const getStatusClass = (status: RegistrationStatus): string => {
  switch (status) {
    case 'registered':
      return 'bg-lighterGreen/15 text-lighterGreen shadow-[inset_0_0_0_1px_rgba(82,201,137,0.18)]';
    case 'processing':
      return 'bg-warn/15 text-warn shadow-[inset_0_0_0_1px_rgba(240,168,77,0.18)]';
    case 'rejected':
      return 'bg-danger/15 text-danger shadow-[inset_0_0_0_1px_rgba(240,107,107,0.18)]';
    case 'not-selected':
      return 'bg-container2 text-lightGrey shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]';
    case 'not-enrolled':
      return 'bg-accent/15 text-accent shadow-[inset_0_0_0_1px_rgba(65,150,72,0.18)]';
  }
};

export const getCourseTone = (course: RegistrationCourse): string => {
  const source = course.courseCode ?? course.courseUnitId;
  const index = [...source].reduce((sum, char) => sum + char.charCodeAt(0), 0) % courseColors.length;
  return courseColors[index];
};
