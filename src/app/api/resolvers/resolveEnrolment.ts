import { Enrolment } from '@/app/api/generated/IlmoApi';
import { resolveRealisation } from '@/app/api/resolvers/resolveRealization';
import { resolveCourseUnit } from '@/app/api/resolvers/resolveCourseUnit';
import { extractCourseCode } from '@/app/api/resolvers/helpers/extractCourseCode';

export type ResolvedEnrolment = {
  id: string | undefined;
  courseUnitId: string;
  courseCode: string | null;
  courseName: string | null;
  name: string | null;
  credits: number | null;
  startDate: string | null;
  endDate: string | null;
  status: string | undefined;
  moduleId: string | null;
};

export const resolveEnrolment = async (enrolment: Enrolment): Promise<ResolvedEnrolment> => {
  const [courseUnit, realisation] = await Promise.all([
    resolveCourseUnit(enrolment.courseUnitId),
    resolveRealisation(enrolment.courseUnitRealisationId),
  ]);

  return {
    id: enrolment.id,
    courseUnitId: enrolment.courseUnitId,
    courseCode: extractCourseCode(enrolment.assessmentItemId),
    courseName: courseUnit.name,
    name: realisation.name,
    credits: courseUnit.credits,
    startDate: realisation.startDate,
    endDate: realisation.endDate,
    status: enrolment.state,
    moduleId: null,
  };
};

export async function resolveAllEnrolments(enrolments: Enrolment[]): Promise<ResolvedEnrolment[]> {
  const uniqueCourseUnitIds = [...new Set(enrolments.map((e) => e.courseUnitId))];
  const uniqueRealisationIds = [...new Set(enrolments.map((e) => e.courseUnitRealisationId))];

  await Promise.all([...uniqueCourseUnitIds.map(resolveCourseUnit), ...uniqueRealisationIds.map(resolveRealisation)]);

  return Promise.all(enrolments.map(resolveEnrolment));
}
