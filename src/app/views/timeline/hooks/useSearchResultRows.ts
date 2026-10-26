import { useMemo } from 'react';
import type { StudyPeriodInfo } from '@/app/api/dataPoints/getStudyPeriodMap';
import type { TimelineCourse } from '@/app/api/dataPoints/getTimelineCourses';
import { useCourseTeaching } from '@/app/api/dataPoints/getCourseTeaching';
import type { PlanCourseOption, PlanOptionGroup } from '@/app/api/dataPoints/planOptions/buildOptionGroups';
import type { FreeSearchModule } from '@/app/api/dataPoints/planOptions/walkPlanOptions';
import type { CourseUnitSearchResult } from '@/app/api/dataPoints/searchCourseUnits';
import type { CourseUnitAttainmentRestricted } from '@/app/api/generated/OriApi';
import { toCandidateCourse } from '@/app/views/timeline/util/candidateCourse';
import {
  getCandidatePrerequisites,
  type CandidatePrerequisites,
} from '@/app/views/timeline/util/candidatePrerequisites';
import { todayKey } from '@/app/schedule/time';
import { getNextTeachingWindow, type DatedTeachingWindow } from '@/app/views/timeline/util/nextTeaching';
import { getPeriodFit, type PeriodFit } from '@/app/views/timeline/util/periodFit';
import {
  isSearchResultPlanned,
  resolveSearchGroupId,
  routeSearchResult,
  type SearchRoute,
} from '@/app/views/timeline/util/searchRouting';

export interface SearchPlacement {
  moduleId: string;
  sectionId: string;
  sectionName: string;
}

export interface SearchResultRowModel {
  key: string;
  route: SearchRoute;
  option: PlanCourseOption;
  placement: SearchPlacement | undefined;
  fit: PeriodFit | null;
  periodLocators: string[];
  fitPeriods: StudyPeriodInfo[];
  prerequisites: CandidatePrerequisites | undefined;
  pending: boolean;
  creditsMax: number | null;
  universityOrgId: string | null;
  nextTeaching: DatedTeachingWindow | null;
}

interface Args {
  results: CourseUnitSearchResult[] | undefined;
  optionGroups: PlanOptionGroup[];
  freeSearchModules: FreeSearchModule[];
  moduleChoices: Record<string, string>;
  planGroupIds: Set<string>;
  planCourseUnitIds: Set<string>;
  keepVisibleId: string | null;
  courses: TimelineCourse[];
  attainments: CourseUnitAttainmentRestricted[];
  periods: StudyPeriodInfo[];
  targetLocator: string;
}

const toOption = (result: CourseUnitSearchResult): PlanCourseOption => ({
  courseUnitId: result.courseUnitId,
  courseUnitGroupId: result.groupId ?? '',
  code: result.code,
  name: result.name,
  credits: result.credits,
  required: false,
});

const getPlacement = (route: SearchRoute, freeModule: FreeSearchModule | undefined): SearchPlacement | undefined => {
  if (route.kind === 'listed') return route.group;
  return route.kind === 'free' ? freeModule : undefined;
};

export const useSearchResultRows = ({
  results,
  optionGroups,
  freeSearchModules,
  moduleChoices,
  planGroupIds,
  planCourseUnitIds,
  keepVisibleId,
  courses,
  attainments,
  periods,
  targetLocator,
}: Args): SearchResultRowModel[] => {
  const ungroupedIds = useMemo(
    () => (results ?? []).filter((result) => !result.groupId).map((result) => result.courseUnitId),
    [results],
  );
  const { byId: ungroupedTeaching } = useCourseTeaching(ungroupedIds, true);
  const teachingGroupIds = useMemo(
    () => new Map([...ungroupedTeaching].map(([id, teaching]) => [id, teaching.courseUnitGroupId] as const)),
    [ungroupedTeaching],
  );

  const routedRows = useMemo(() => {
    const rows = (results ?? []).map((searchResult) => {
      const result = { ...searchResult, groupId: resolveSearchGroupId(searchResult, teachingGroupIds) };
      const route = routeSearchResult({ groupId: result.groupId, groups: optionGroups, planGroupIds, keepVisibleId });
      const option = route.kind === 'listed' ? route.option : toOption(result);
      const freeModule =
        freeSearchModules.find((module) => module.moduleId === moduleChoices[result.courseUnitId]) ??
        freeSearchModules[0];
      return { key: result.courseUnitId, result, route, option, placement: getPlacement(route, freeModule) };
    });
    return rows.filter(
      (row, index) =>
        (!isSearchResultPlanned(row.result, planGroupIds, planCourseUnitIds) ||
          row.option.courseUnitId === keepVisibleId) &&
        rows.findIndex((other) => other.option.courseUnitId === row.option.courseUnitId) === index,
    );
  }, [
    freeSearchModules,
    keepVisibleId,
    moduleChoices,
    optionGroups,
    planCourseUnitIds,
    planGroupIds,
    results,
    teachingGroupIds,
  ]);

  const teachingIds = useMemo(() => routedRows.map((row) => row.option.courseUnitId), [routedRows]);
  const { byId, isLoading: teachingLoading, failedIds } = useCourseTeaching(teachingIds, true);
  const today = todayKey();

  return useMemo(
    () =>
      routedRows.map(({ key, route, placement, ...row }): SearchResultRowModel => {
        const teaching = byId.get(row.option.courseUnitId);
        const option = row.option.courseUnitGroupId
          ? row.option
          : { ...row.option, courseUnitGroupId: teaching?.courseUnitGroupId ?? '' };
        const fit = teaching ? getPeriodFit(teaching.realisations, periods, targetLocator) : null;
        const periodLocators = fit?.periodLocators ?? [targetLocator];
        const fitPeriods = periods.filter((period) => periodLocators.includes(period.locator));
        const prerequisites =
          teaching && placement
            ? getCandidatePrerequisites({
                candidate: toCandidateCourse({
                  option,
                  sectionId: placement.sectionId,
                  sectionName: placement.sectionName,
                  parentModuleId: placement.moduleId,
                  plannedPeriods: fitPeriods,
                }),
                courses: courses.filter((course) => course.courseUnitId !== option.courseUnitId),
                prerequisites: teaching.prerequisites,
                attainments,
              })
            : undefined;
        const pending = !teaching && teachingLoading && !failedIds.has(option.courseUnitId);
        return {
          key,
          route,
          option,
          placement,
          fit,
          periodLocators,
          fitPeriods,
          prerequisites,
          pending,
          creditsMax: row.result.creditsMax,
          universityOrgId: row.result.universityOrgId,
          nextTeaching: teaching ? getNextTeachingWindow(teaching.realisations, today) : null,
        };
      }),
    [attainments, byId, courses, failedIds, periods, routedRows, targetLocator, teachingLoading, today],
  );
};
