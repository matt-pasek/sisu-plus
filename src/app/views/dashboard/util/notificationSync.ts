import type { RegistrationCourse } from '@/app/api/dataPoints/getRegistrationCourses';
import type { CachedRegistrationEvent } from '@/background/notifications/types';

const toRegistrationNotificationEvents = (courses: RegistrationCourse[]): CachedRegistrationEvent[] =>
  courses.flatMap((course) =>
    course.implementations
      .filter((implementation) => implementation.enrolmentStart || implementation.enrolmentEnd)
      .map((implementation): CachedRegistrationEvent => {
        const enrolment = course.enrolments.find((item) => item.courseUnitRealisationId === implementation.id);

        return {
          closesAt: implementation.enrolmentEnd,
          courseId: course.courseUnitId,
          enrolled: Boolean(enrolment) || course.status === 'registered',
          id: implementation.id,
          name: course.courseName ?? course.courseCode ?? implementation.name ?? course.courseUnitId,
          opensAt: implementation.enrolmentStart,
        };
      }),
  );

export const syncDashboardNotifications = (courses: RegistrationCourse[]) => {
  void chrome.runtime.sendMessage({
    type: 'SYNC_SISU_NOTIFICATION_CACHE',
    payload: {
      registrations: toRegistrationNotificationEvents(courses),
      syncedAt: Date.now(),
    },
  });
};
