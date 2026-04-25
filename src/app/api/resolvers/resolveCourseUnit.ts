import { extractCourseCode } from '@/app/api/resolvers/helpers/extractCourseCode';
import { koriApi } from '@/app/api/client';
import { pickLabel } from '@/app/api/resolvers/helpers/pickLabel';

type CourseUnitResult = { code: string | null; name: string | null; credits: number | null };

const courseUnitCache = new Map<string, CourseUnitResult>();

export const resolveCourseUnit = async (courseUnitId: string): Promise<CourseUnitResult> => {
  const cached = courseUnitCache.get(courseUnitId);
  if (cached) return cached;

  try {
    const response = await koriApi.api.getCourseUnit(courseUnitId);
    const unit = response.data;
    const result: CourseUnitResult = {
      code: unit.code ?? extractCourseCode(courseUnitId),
      name: pickLabel(unit.name) ?? extractCourseCode(courseUnitId),
      credits: unit.credits?.min ?? null,
    };
    courseUnitCache.set(courseUnitId, result);
    return result;
  } catch {
    const fallbackCode = extractCourseCode(courseUnitId);
    const fallback: CourseUnitResult = { code: fallbackCode, name: fallbackCode, credits: null };
    courseUnitCache.set(courseUnitId, fallback);
    return fallback;
  }
};
