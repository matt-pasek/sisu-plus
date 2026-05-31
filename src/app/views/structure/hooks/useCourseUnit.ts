import { fetchCourseUnit } from '@/app/api/endpoints/courseUnit';
import { useSisuQuery } from '@/app/hooks/useSisuQuery';

export function useCourseUnit(courseUnitId: string | null) {
  return useSisuQuery(['course-unit', courseUnitId], () => fetchCourseUnit(courseUnitId!), {
    enabled: courseUnitId != null,
  });
}
