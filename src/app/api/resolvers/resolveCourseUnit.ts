import { extractCourseCode } from '@/app/api/resolvers/helpers/extractCourseCode';
import { koriApi } from '@/app/api/client';
import { pickLabel } from '@/app/api/resolvers/helpers/pickLabel';

type CourseUnitResult = {
  assessmentItemIds: string[];
  code: string | null;
  credits: number | null;
  groupId: string | null;
  name: string | null;
  teachingPeriodLocators: string[];
};

const courseUnitCache = new Map<string, CourseUnitResult>();

export const resolveCourseUnit = async (courseUnitId: string): Promise<CourseUnitResult> => {
  const cached = courseUnitCache.get(courseUnitId);
  if (cached) return cached;

  try {
    const response = await koriApi.api.getCourseUnit(courseUnitId);
    const unit = response.data;
    const completionMethods = unit.completionMethods ?? [];
    const result: CourseUnitResult = {
      assessmentItemIds: [...new Set(completionMethods.flatMap((method) => method.assessmentItemIds ?? []))],
      code: unit.code ?? extractCourseCode(courseUnitId),
      credits: unit.credits?.min ?? null,
      groupId: unit.groupId ?? null,
      name: pickLabel(unit.name) ?? extractCourseCode(courseUnitId),
      teachingPeriodLocators: [
        ...new Set(
          completionMethods.flatMap((method) => (method.repeats ?? []).flatMap((repeat) => repeat.repeatPossibility)),
        ),
      ],
    };
    courseUnitCache.set(courseUnitId, result);
    return result;
  } catch {
    const fallbackCode = extractCourseCode(courseUnitId);
    const fallback: CourseUnitResult = {
      assessmentItemIds: [],
      code: fallbackCode,
      credits: null,
      groupId: null,
      name: fallbackCode,
      teachingPeriodLocators: [],
    };
    courseUnitCache.set(courseUnitId, fallback);
    return fallback;
  }
};
