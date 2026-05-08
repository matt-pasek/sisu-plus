import { fetchAttainments } from '@/app/api/endpoints/attainments';
import { fetchPlans } from '@/app/api/endpoints/plans';
import { fetchStudyRights } from '@/app/api/endpoints/studyRights';
import type { CourseUnitAttainmentRestricted } from '@/app/api/generated/OriApi';
import { buildCuToTopModuleMap } from '@/app/api/resolvers/helpers/buildCuToTopModuleMap';
import { resolveCourseUnit } from '@/app/api/resolvers/resolveCourseUnit';
import { resolveModule } from '@/app/api/resolvers/resolveModule';
import { getCurrentLocale } from '@/app/i18n';
import { useSisuQuery } from '@/app/hooks/useSisuQuery';
import type { CourseEntry, StructureData } from '@/app/views/structure/structureTypes';

type StructurePlan = {
  rootId: string;
  moduleSelections: { moduleId: string; parentModuleId?: string }[];
  courseUnitSelections: { courseUnitId: string; parentModuleId?: string }[];
};

function getTopLevelModuleIds(plan: StructurePlan): { topLevelModuleIds: string[]; wrapperModuleId: string | null } {
  let topLevelModuleIds = plan.moduleSelections
    .filter((selection) => selection.parentModuleId === plan.rootId)
    .map((selection) => selection.moduleId);

  let wrapperModuleId: string | null = null;
  if (topLevelModuleIds.length === 1) {
    wrapperModuleId = topLevelModuleIds[0];
    const children = plan.moduleSelections
      .filter((selection) => selection.parentModuleId === wrapperModuleId)
      .map((selection) => selection.moduleId);
    if (children.length > 0) topLevelModuleIds = children;
  }

  return { topLevelModuleIds, wrapperModuleId };
}

function isPassingCourseUnitAttainment(attainment: unknown): attainment is CourseUnitAttainmentRestricted {
  const candidate = attainment as Partial<CourseUnitAttainmentRestricted>;
  return candidate.type === 'CourseUnitAttainment' && candidate.primary === true && candidate.state !== 'FAILED';
}

function getGrade(attainment: CourseUnitAttainmentRestricted | undefined): string | null {
  if (!attainment) return null;
  if (attainment.gradeScaleId.includes('hyl-hyv')) return attainment.gradeId != null ? 'Pass' : null;
  return attainment.gradeId >= 1 && attainment.gradeId <= 5
    ? String(attainment.gradeId)
    : String(attainment.gradeId ?? 'Pass');
}

function formatStudyRightUntil(endDate: string | undefined): string | null {
  if (!endDate) return null;
  const date = new Date(endDate);
  date.setDate(date.getDate() - 1);
  return date.toLocaleDateString(getCurrentLocale(), { month: 'long', year: 'numeric' });
}

export const getStructureData = (): { data: StructureData | undefined; isLoading: boolean } => {
  const plansQuery = useSisuQuery(['plans'], fetchPlans);
  const attainmentsQuery = useSisuQuery(['attainments'], fetchAttainments);
  const studyRightsQuery = useSisuQuery(['study-rights'], fetchStudyRights);

  const { data, isLoading: structureLoading } = useSisuQuery(
    ['structure-data'],
    async (): Promise<StructureData> => {
      const plan = plansQuery.data?.[0] as StructurePlan | undefined;
      if (!plan) {
        return {
          planName: 'My study plan',
          studyRightUntil: null,
          totalTarget: 0,
          degreeMinimumCredits: null,
          totalCompleted: 0,
          sections: [],
        };
      }

      const { topLevelModuleIds, wrapperModuleId } = getTopLevelModuleIds(plan);
      const cuToTopModule = buildCuToTopModuleMap(plan);
      const passingAttainments = (attainmentsQuery.data ?? []).filter(isPassingCourseUnitAttainment);
      const passingByCourseUnit = new Map(
        passingAttainments.map((attainment) => [attainment.courseUnitId, attainment]),
      );
      const courseUnitIds = plan.courseUnitSelections
        .filter((selection) => cuToTopModule.has(selection.courseUnitId))
        .map((selection) => selection.courseUnitId);

      const [moduleDetails, wrapperDetails, courseUnits] = await Promise.all([
        Promise.all(topLevelModuleIds.map(resolveModule)),
        wrapperModuleId ? resolveModule(wrapperModuleId) : Promise.resolve(null),
        Promise.all(courseUnitIds.map(resolveCourseUnit)),
      ]);

      const coursesByModule = new Map<string, CourseEntry[]>();
      courseUnitIds.forEach((courseUnitId, index) => {
        const moduleId = cuToTopModule.get(courseUnitId);
        if (!moduleId) return;

        const courseUnit = courseUnits[index];
        const attainment = passingByCourseUnit.get(courseUnitId);
        const course: CourseEntry = {
          courseUnitId,
          code: courseUnit.code,
          name: courseUnit.name,
          credits: courseUnit.credits,
          completed: attainment != null,
          grade: getGrade(attainment),
        };

        coursesByModule.set(moduleId, [...(coursesByModule.get(moduleId) ?? []), course]);
      });

      const sections = topLevelModuleIds.map((moduleId, index) => {
        const courses = coursesByModule.get(moduleId) ?? [];
        const completedCredits = courses.reduce(
          (sum, course) => sum + (course.completed ? (course.credits ?? 0) : 0),
          0,
        );
        const plannedCredits = courses.reduce((sum, course) => sum + (course.credits ?? 0), 0);
        return {
          moduleId,
          name: moduleDetails[index].name,
          targetCredits: plannedCredits || moduleDetails[index].targetCredits,
          minimumCredits: moduleDetails[index].targetCredits,
          completedCredits,
          courses,
        };
      });

      const activeStudyRight =
        studyRightsQuery.data?.find(
          (studyRight) => studyRight.state === 'ACTIVE' || studyRight.state === 'ACTIVE_NONATTENDING',
        ) ?? studyRightsQuery.data?.[0];

      return {
        planName: wrapperDetails?.name ?? 'My study plan',
        studyRightUntil: formatStudyRightUntil(activeStudyRight?.valid?.endDate),
        totalTarget: sections.reduce((sum, section) => sum + section.targetCredits, 0),
        degreeMinimumCredits: wrapperDetails?.targetCredits ?? null,
        totalCompleted: sections.reduce((sum, section) => sum + section.completedCredits, 0),
        sections,
      };
    },
    { enabled: plansQuery.data != null && attainmentsQuery.data != null && studyRightsQuery.data != null },
  );

  return {
    data,
    isLoading: plansQuery.isLoading || attainmentsQuery.isLoading || studyRightsQuery.isLoading || structureLoading,
  };
};
