import type {
  RegistrationCourse,
  RegistrationImplementation,
  RegistrationStatus,
} from '@/app/api/dataPoints/getRegistrationCourses';

export const courseColors = ['bg-[#6f95ff]', 'bg-[#9b7cff]', 'bg-[#6ed39a]', 'bg-[#f0b761]'];

export const formatCredits = (credits: number | null): string => (credits == null ? '-' : `${credits} cr`);

export const formatDate = (value: string | null): string => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('fi-FI', { day: 'numeric', month: 'numeric', year: 'numeric' });
};

export const formatDateTime = (value: string | null): string => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('fi-FI', {
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    month: 'numeric',
    year: 'numeric',
  });
};

export const formatDateRange = (start: string | null, end: string | null): string => {
  if (!start && !end) return 'Dates not published';
  if (!start) return `Until ${formatDate(end)}`;
  if (!end) return `From ${formatDate(start)}`;
  return `${formatDate(start)}-${formatDate(end)}`;
};

export const isExamImplementation = (implementation: RegistrationImplementation | null): boolean =>
  implementation?.typeLabel.toLowerCase().includes('exam') === true;

export const formatImplementationDateRange = (implementation: RegistrationImplementation | null): string => {
  if (!implementation) return 'Check Sisu later';
  const { activityStart: start, activityEnd: end } = implementation;
  if (isExamImplementation(implementation)) {
    const startDate = start ? formatDate(start) : null;
    const endDate = end ? formatDate(end) : null;
    if (startDate && (!endDate || startDate === endDate)) return startDate;
    if (!startDate && endDate) return endDate;
  }
  return formatDateRange(start, end);
};

export const getStatusLabel = (status: RegistrationStatus): string => {
  switch (status) {
    case 'registered':
      return 'Registered';
    case 'processing':
      return 'Processing';
    case 'rejected':
      return 'Needs attention';
    case 'not-selected':
      return 'No implementation';
    case 'not-enrolled':
      return 'Open';
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
