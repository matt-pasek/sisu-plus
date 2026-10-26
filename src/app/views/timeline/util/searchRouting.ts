import type { PlanCourseOption, PlanOptionGroup } from '@/app/api/dataPoints/planOptions/buildOptionGroups';

import { isGroupVisible } from './periodSuggestions';

export type SearchRoute =
  | { kind: 'listed'; group: PlanOptionGroup; option: PlanCourseOption }
  | { kind: 'full'; group: PlanOptionGroup }
  | { kind: 'free' };

interface RouteArgs {
  groupId: string | null;
  groups: PlanOptionGroup[];
  planGroupIds: Set<string>;
  keepVisibleId: string | null;
}

export const routeSearchResult = ({ groupId, groups, planGroupIds, keepVisibleId }: RouteArgs): SearchRoute => {
  if (!groupId) return { kind: 'free' };
  const matches = groups.flatMap((group) => {
    const option = group.options.find((candidate) => candidate.courseUnitGroupId === groupId);
    return option ? [{ group, option }] : [];
  });
  const listed = matches.find(({ group }) => isGroupVisible(group, planGroupIds, keepVisibleId));
  if (listed) return { kind: 'listed', ...listed };
  return matches[0] ? { kind: 'full', group: matches[0].group } : { kind: 'free' };
};

export const isSearchResultPlanned = (
  result: { courseUnitId: string; groupId: string | null },
  planGroupIds: Set<string>,
  planCourseUnitIds: Set<string>,
): boolean => (!!result.groupId && planGroupIds.has(result.groupId)) || planCourseUnitIds.has(result.courseUnitId);

export const resolveSearchGroupId = (
  result: { courseUnitId: string; groupId: string | null },
  groupIdsByCourseUnitId: Map<string, string | null>,
): string | null => result.groupId ?? groupIdsByCourseUnitId.get(result.courseUnitId) ?? null;
