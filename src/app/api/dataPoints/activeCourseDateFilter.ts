export interface ActiveCourseDateWindow {
  endDate: string | null;
  startDate: string | null;
}

export function isCurrentOrUpcomingCourse(
  course: ActiveCourseDateWindow,
  today = new Date().toISOString().slice(0, 10),
): boolean {
  return (course.startDate != null || course.endDate != null) && (course.endDate == null || course.endDate >= today);
}
