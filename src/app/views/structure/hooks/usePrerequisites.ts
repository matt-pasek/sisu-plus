import { fetchCourseUnitsByGroupIds } from '@/app/api/endpoints/courseUnit';
import { fetchAttainments } from '@/app/api/endpoints/attainments';
import { useSisuQuery } from '@/app/hooks/useSisuQuery';
import { pickLabel } from '@/app/api/resolvers/helpers/pickLabel';
import type { CourseUnit } from '@/app/api/generated/KoriApi';
import type { CourseUnitAttainmentRestricted } from '@/app/api/generated/OriApi';

export interface PrerequisiteCourse {
  courseUnitId: string;
  groupId: string;
  name: string;
  code: string;
  credits: number | null;
  completed: boolean;
  grade: string | null;
  required: boolean;
}

function extractGroupIds(unit: CourseUnit): { required: string[]; recommended: string[] } {
  const extract = (groups: CourseUnit['compulsoryFormalPrerequisites']) =>
    (groups ?? []).flatMap((g) =>
      (g.prerequisites ?? [])
        .filter((p): p is { type: string; courseUnitGroupId: string } => 'courseUnitGroupId' in p)
        .map((p) => p.courseUnitGroupId),
    );

  return {
    required: extract(unit.compulsoryFormalPrerequisites),
    recommended: extract(unit.recommendedFormalPrerequisites),
  };
}

export function usePrerequisites(unit: CourseUnit | undefined) {
  const { required, recommended } = unit ? extractGroupIds(unit) : { required: [], recommended: [] };
  const allGroupIds = [...new Set([...required, ...recommended])];

  const { data: prereqUnits, isLoading: unitsLoading } = useSisuQuery(
    ['prereq-units', ...allGroupIds],
    () => fetchCourseUnitsByGroupIds(allGroupIds),
    { enabled: allGroupIds.length > 0 },
  );

  const { data: allAttainments, isLoading: attainmentsLoading } = useSisuQuery(['attainments'], fetchAttainments);

  // Keep only one version per groupId: the one with the latest validity start date
  const dedupedUnits = Object.values(
    (prereqUnits ?? []).reduce<Record<string, CourseUnit>>((acc, cu) => {
      const existing = acc[cu.groupId];
      const existingStart = existing?.validityPeriod?.startDate ?? '';
      const cuStart = cu.validityPeriod?.startDate ?? '';
      if (!existing || cuStart > existingStart) acc[cu.groupId] = cu;
      return acc;
    }, {}),
  );

  const prerequisites: PrerequisiteCourse[] = dedupedUnits.map((cu) => {
    const attainment = allAttainments?.find(
      (a): a is CourseUnitAttainmentRestricted => 'courseUnitId' in a && a.courseUnitId === cu.id,
    );

    const grade = attainment?.gradeId != null ? String(attainment.gradeId) : null;

    return {
      courseUnitId: cu.id ?? '',
      groupId: cu.groupId,
      name: pickLabel(cu.name) ?? cu.code,
      code: cu.code,
      credits: cu.credits?.min ?? null,
      completed: attainment != null,
      grade,
      required: required.includes(cu.groupId),
    };
  });

  return {
    prerequisites,
    isLoading: allGroupIds.length > 0 && (unitsLoading || attainmentsLoading),
    hasStructuredPrerequisites: allGroupIds.length > 0,
  };
}
