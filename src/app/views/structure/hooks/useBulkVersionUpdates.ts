import { useMemo } from 'react';
import { getStudyPeriodMap, type StudyPeriodInfo } from '@/app/api/dataPoints/getStudyPeriodMap';
import { fetchCourseUnit, fetchCourseUnitsByGroupIds } from '@/app/api/endpoints/courseUnit';
import { fetchEnrolments } from '@/app/api/endpoints/enrolments';
import { useSisuQuery } from '@/app/hooks/useSisuQuery';
import type { CourseUnit } from '@/app/api/generated/KoriApi';
import type { Plan } from '@/app/api/generated/OsuvaApi';
import type { CourseEntry, SectionData } from '@/app/views/structure/structureTypes';

export type VersionUpdate = {
  course: CourseEntry;
  current: CourseUnit;
  latest: CourseUnit;
  academicYear: number | null;
};

function getCourseSelection(plan: Plan, courseUnitId: string) {
  return plan.courseUnitSelections.find((selection) => selection.courseUnitId === courseUnitId);
}

function getPlannedPeriods(
  plan: Plan,
  courseUnitId: string,
  periodMap: Map<string, StudyPeriodInfo>,
): StudyPeriodInfo[] {
  return (getCourseSelection(plan, courseUnitId)?.plannedPeriods ?? [])
    .map((locator) => periodMap.get(locator))
    .filter((period): period is StudyPeriodInfo => period != null)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
}

function findPlannedAcademicYear(periods: StudyPeriodInfo[]): number | null {
  return periods[0]?.studyYear ?? null;
}

function coversAcademicYear(unit: CourseUnit, academicYear: number): boolean {
  const curriculumYears = unit.curriculumPeriodIds
    ?.map((id) => id.match(/(\d{4})-(\d{4})/)?.[1])
    .map(Number)
    .filter(Number.isFinite);

  if (curriculumYears?.length) return curriculumYears.includes(academicYear);

  const startYear = Number(unit.validityPeriod?.startDate?.split('-')[0]);
  const endYear = Number(unit.validityPeriod?.endDate?.split('-')[0]);
  if (!Number.isFinite(startYear)) return false;
  if (startYear > academicYear) return false;
  return !Number.isFinite(endYear) || endYear >= academicYear + 1;
}

function findLatestVersion(versions: CourseUnit[], academicYear: number | null): CourseUnit | null {
  const active = versions.filter((unit) => unit.documentState !== 'DELETED');
  const byStartDate = (latest: CourseUnit | null, unit: CourseUnit) => {
    const latestStart = latest?.validityPeriod?.startDate ?? '';
    const unitStart = unit.validityPeriod?.startDate ?? '';
    return !latest || unitStart > latestStart ? unit : latest;
  };
  const yearMatch = academicYear != null ? active.filter((unit) => coversAcademicYear(unit, academicYear)) : active;
  return (yearMatch.length > 0 ? yearMatch : active).reduce<CourseUnit | null>(byStartDate, null);
}

export function formatAcademicYear(startYear: number): string {
  return `${startYear}-${startYear + 1}`;
}

export function useBulkVersionUpdates(plan: Plan, sections: SectionData[]) {
  const { studyPeriodMap, isLoading: periodsLoading } = getStudyPeriodMap();
  const { data: enrolments = [], isLoading: enrolmentsLoading } = useSisuQuery(['enrolments'], fetchEnrolments);

  const enrolledCourseUnitIds = useMemo(
    () =>
      new Set(
        enrolments
          .filter((enrolment) => enrolment.state === 'ENROLLED' || enrolment.state === 'CONFIRMED')
          .map((enrolment) => enrolment.courseUnitId),
      ),
    [enrolments],
  );

  const courses = useMemo(
    () =>
      sections
        .flatMap((section) => section.courses)
        .filter((course) => !course.completed && !enrolledCourseUnitIds.has(course.courseUnitId)),
    [sections, enrolledCourseUnitIds],
  );
  const courseUnitIds = useMemo(() => [...new Set(courses.map((course) => course.courseUnitId))], [courses]);

  const { data: currentUnits = [], isLoading: currentUnitsLoading } = useSisuQuery(
    ['bulk-version-current-units', ...courseUnitIds],
    () => Promise.all(courseUnitIds.map(fetchCourseUnit)),
    { enabled: courseUnitIds.length > 0 },
  );

  const groupIds = [...new Set(currentUnits.map((unit) => unit.groupId))];
  const { data: versionUnits = [], isLoading: versionsLoading } = useSisuQuery(
    ['bulk-version-units', ...groupIds],
    () => fetchCourseUnitsByGroupIds(groupIds),
    { enabled: groupIds.length > 0 },
  );

  const versionsByGroupId = versionUnits.reduce<Record<string, CourseUnit[]>>((acc, unit) => {
    acc[unit.groupId] = [...(acc[unit.groupId] ?? []), unit];
    return acc;
  }, {});

  const currentById = new Map(currentUnits.map((unit) => [unit.id, unit]));
  const updates: VersionUpdate[] = courses.flatMap((course) => {
    const current = currentById.get(course.courseUnitId);
    if (!current) return [];
    const plannedPeriods = getPlannedPeriods(plan, course.courseUnitId, studyPeriodMap);
    const academicYear = findPlannedAcademicYear(plannedPeriods);
    const latest = findLatestVersion(versionsByGroupId[current.groupId] ?? [], academicYear);
    if (!latest?.id || latest.id === course.courseUnitId) return [];
    return [{ course, current, latest, academicYear }];
  });

  return {
    updates,
    isLoading: currentUnitsLoading || versionsLoading || periodsLoading || enrolmentsLoading,
  };
}
