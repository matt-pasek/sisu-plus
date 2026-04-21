import { koriApi } from './client';
import type { Enrolment } from './endpoints/enrolments';

type LocalizedString = { en?: string | null; fi?: string | null; sv?: string | null } | null | undefined;

function pickLabel(obj: LocalizedString): string | null {
  if (!obj) return null;
  return obj.en ?? obj.fi ?? obj.sv ?? null;
}

function extractCourseCode(id: string | undefined): string | null {
  if (!id) return null;
  const match = id.match(/[A-Z]{2,}\d[\w-]*/);
  return match ? match[0] : null;
}

type CourseUnitResult = { name: string | null; credits: number | null };
type RealisationResult = { startDate: string | null; endDate: string | null; subtitle: string | null };

export type ResolvedEnrolment = {
  id: string | undefined;
  courseCode: string | null;
  courseName: string | null;
  subtitle: string | null;
  credits: number | null;
  startDate: string | null;
  endDate: string | null;
  status: string | undefined;
};

const courseUnitCache = new Map<string, CourseUnitResult>();
const realisationCache = new Map<string, RealisationResult>();
const assessmentItemCache = new Map<string, string>();

async function resolveCourseUnit(courseUnitId: string): Promise<CourseUnitResult> {
  const cached = courseUnitCache.get(courseUnitId);
  if (cached) return cached;

  try {
    const response = await koriApi.api.getCourseUnit(courseUnitId);
    const unit = response.data as any;
    const result: CourseUnitResult = {
      name: pickLabel(unit.name) ?? extractCourseCode(courseUnitId),
      credits: unit.credits?.min ?? null,
    };
    courseUnitCache.set(courseUnitId, result);
    return result;
  } catch {
    const fallback: CourseUnitResult = { name: extractCourseCode(courseUnitId), credits: null };
    courseUnitCache.set(courseUnitId, fallback);
    return fallback;
  }
}

export async function resolveAssessmentItem(assessmentItemId: string): Promise<string> {
  const cached = assessmentItemCache.get(assessmentItemId);
  if (cached) return cached;

  try {
    const response = await koriApi.api.getAssessmentItem(assessmentItemId);
    const item = response.data as any;
    assessmentItemCache.set(assessmentItemId, item.courseUnitId);
    return item.courseUnitId;
  } catch {
    assessmentItemCache.set(assessmentItemId, assessmentItemId);
    return assessmentItemId;
  }
}

async function resolveRealisation(courseUnitRealisationId: string): Promise<RealisationResult> {
  const cached = realisationCache.get(courseUnitRealisationId);
  if (cached) return cached;

  try {
    const response = await koriApi.api.getCourseUnitRealisation(courseUnitRealisationId);
    const realisation = response.data as any;
    const result: RealisationResult = {
      startDate: realisation.activityPeriod?.startDate ?? null,
      endDate: realisation.activityPeriod?.endDate ?? null,
      subtitle: pickLabel(realisation.nameSpecifier),
    };
    realisationCache.set(courseUnitRealisationId, result);
    return result;
  } catch {
    const fallback: RealisationResult = { startDate: null, endDate: null, subtitle: null };
    realisationCache.set(courseUnitRealisationId, fallback);
    return fallback;
  }
}

export async function resolveEnrolment(enrolment: Enrolment): Promise<ResolvedEnrolment> {
  const [courseUnit, realisation] = await Promise.all([
    resolveCourseUnit(enrolment.courseUnitId),
    resolveRealisation(enrolment.courseUnitRealisationId),
  ]);

  return {
    id: enrolment.id,
    courseCode: extractCourseCode(enrolment.assessmentItemId),
    courseName: courseUnit.name,
    subtitle: realisation.subtitle,
    credits: courseUnit.credits,
    startDate: realisation.startDate,
    endDate: realisation.endDate,
    status: enrolment.state,
  };
}

export async function resolveAllEnrolments(enrolments: Enrolment[]): Promise<ResolvedEnrolment[]> {
  const uniqueCourseUnitIds = [...new Set(enrolments.map((e) => e.courseUnitId))];
  const uniqueRealisationIds = [...new Set(enrolments.map((e) => e.courseUnitRealisationId))];

  await Promise.all([...uniqueCourseUnitIds.map(resolveCourseUnit), ...uniqueRealisationIds.map(resolveRealisation)]);

  return Promise.all(enrolments.map(resolveEnrolment));
}
