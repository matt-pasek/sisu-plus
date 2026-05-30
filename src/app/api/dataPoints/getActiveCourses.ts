import { useSisuQuery } from '@/app/hooks/useSisuQuery';
import { fetchEnrolments } from '@/app/api/endpoints/enrolments';
import { fetchPlans } from '@/app/api/endpoints/plans';
import { fetchAttainments } from '@/app/api/endpoints/attainments';
import { resolveAllEnrolments } from '@/app/api/resolvers/resolveEnrolment';
import { buildCuToTopModuleMap } from '@/app/api/resolvers/helpers/buildCuToTopModuleMap';
import type { CourseUnitAttainmentRestricted } from '@/app/api/generated/OriApi';
import { isCurrentOrUpcomingCourse } from './activeCourseDateFilter';

export interface ActiveCourse {
  moduleId: string | null;
  isPassed: boolean;
  grade: string | number | null;
  id: string | undefined;
  courseUnitId: string;
  courseCode: string | null;
  courseName: string | null;
  name: string | null;
  credits: number | undefined | null;
}

export const getActiveCourses = (): { activeCourses: ActiveCourse[]; isLoading: boolean } => {
  const enrolmentsQuery = useSisuQuery(['enrolments'], fetchEnrolments);
  const plansQuery = useSisuQuery(['plans'], fetchPlans);
  const attainmentsQuery = useSisuQuery(['attainments'], fetchAttainments);

  const { data: activeCourses, isLoading } = useSisuQuery(
    ['active-courses'],
    async () => {
      const enrolled = enrolmentsQuery.data!.filter((e) => e.state === 'ENROLLED' || e.state === 'CONFIRMED');
      const resolved = await resolveAllEnrolments(enrolled);

      const today = new Date().toISOString().slice(0, 10);
      const filtered = resolved.filter((e) => isCurrentOrUpcomingCourse(e, today));

      const seen = new Map<string, (typeof filtered)[0]>();
      for (const e of filtered) {
        const existing = seen.get(e.courseUnitId);
        if (!existing || (!existing.courseCode && e.courseCode)) {
          seen.set(e.courseUnitId, e);
        }
      }
      const active = [...seen.values()];

      const passedByUnit = new Map<string, CourseUnitAttainmentRestricted>();
      for (const a of attainmentsQuery.data ?? []) {
        if (a.type === 'CourseUnitAttainment' && a.primary && a.state !== 'FAILED') {
          const att = a as CourseUnitAttainmentRestricted;
          if (att.courseUnitId) passedByUnit.set(att.courseUnitId, att);
        }
      }

      const plan = plansQuery.data?.[0];
      const cuToTopModule = plan ? buildCuToTopModuleMap(plan) : new Map<string, string>();

      return active.map((e) => {
        const att = passedByUnit.get(e.courseUnitId);
        let grade: number | string | null = null;
        if (att) {
          if (att.gradeScaleId.includes('hyl-hyv')) {
            grade = Boolean(att.gradeId) ? 'Pass' : 'Fail';
          } else {
            grade = att.gradeId >= 1 && att.gradeId <= 5 ? att.gradeId : null;
          }
        }
        return {
          ...e,
          moduleId: cuToTopModule.get(e.courseUnitId) ?? null,
          isPassed: att != null,
          grade,
        };
      });
    },
    { enabled: enrolmentsQuery.data != null && plansQuery.data != null && attainmentsQuery.data != null },
  );

  return {
    activeCourses: activeCourses ?? [],
    isLoading: enrolmentsQuery.isLoading || plansQuery.isLoading || attainmentsQuery.isLoading || isLoading,
  };
};
