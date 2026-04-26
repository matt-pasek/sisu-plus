import { useSisuQuery } from '@/app/hooks/useSisuQuery';
import { fetchStudyRights } from '@/app/api/endpoints/studyRights';
import { fetchAttainments } from '@/app/api/endpoints/attainments';
import { fetchAverageGrade } from '@/app/api/endpoints/averageGrade';
import type { CourseUnitAttainmentRestricted } from '@/app/api/generated/OriApi';

export const getDashboardStats = () => {
  const studyRightsQuery = useSisuQuery(['study-rights'], fetchStudyRights);
  const attainmentsQuery = useSisuQuery(['attainments'], fetchAttainments);

  const activeStudyRight =
    studyRightsQuery.data?.find((sr) => sr.state === 'ACTIVE' || sr.state === 'ACTIVE_NONATTENDING') ??
    studyRightsQuery.data?.[0] ??
    null;

  const courseUnitAttainments = (attainmentsQuery.data ?? []).filter(
    (a): a is CourseUnitAttainmentRestricted => a.type === 'CourseUnitAttainment',
  );

  const attained = courseUnitAttainments.filter((a) => a.state !== 'FAILED' && a.primary);
  const creditsDone = attained.reduce((s, a) => s + a.credits, 0);

  const gradeQuery = useSisuQuery(
    ['grade-average'],
    async () => {
      const primaryGraded = courseUnitAttainments.filter((a) => a.primary && a.state !== 'FAILED' && a.gradeId > 0);
      if (primaryGraded.length === 0) return null;

      const byScale = new Map<string, CourseUnitAttainmentRestricted[]>();
      for (const a of primaryGraded) {
        const arr = byScale.get(a.gradeScaleId) ?? [];
        arr.push(a);
        byScale.set(a.gradeScaleId, arr);
      }

      const [mainScaleId, mainScaleAtts] = [...byScale.entries()].sort(
        (a, b) => b[1].reduce((s, x) => s + x.credits, 0) - a[1].reduce((s, x) => s + x.credits, 0),
      )[0];

      const personId = mainScaleAtts[0].personId;
      const ids = mainScaleAtts.map((a) => a.id).filter((id): id is string => Boolean(id));
      if (!ids.length) return null;

      return fetchAverageGrade({
        personId,
        gradeScaleId: mainScaleId,
        attainmentIds: ids,
        method: 'COURSE_UNIT_ARITHMETIC_MEAN_WEIGHTING_BY_CREDITS',
      });
    },
    { enabled: attained.length > 0 },
  );

  return {
    creditsDone,
    gradeAverage: gradeQuery.data?.gradeAverage ?? null,
    gradedCount: attained.length,
    studyRightEndDate: activeStudyRight?.valid?.endDate ?? null,
    isLoading: studyRightsQuery.isLoading || attainmentsQuery.isLoading || gradeQuery.isLoading,
  };
};
