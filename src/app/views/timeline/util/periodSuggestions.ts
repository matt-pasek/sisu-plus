import type { StudyPeriodInfo } from '@/app/api/dataPoints/getStudyPeriodMap';
import type { PlanCourseOption, PlanOptionGroup } from '@/app/api/dataPoints/planOptions/buildOptionGroups';

import { getPeriodFit } from './periodFit';
import type { PeriodFit, TeachingWindow } from './periodFit';

export type GroupProgress =
  | { kind: 'credits'; done: number; target: number }
  | { kind: 'count'; pick: number; of: number }
  | null;

export interface PeriodSuggestion {
  option: PlanCourseOption;
  group: PlanOptionGroup;
  fit: PeriodFit | null;
}

export interface SuggestionGroup {
  group: PlanOptionGroup;
  progress: GroupProgress;
  taught: PeriodSuggestion[];
  notTaught: PeriodSuggestion[];
}

interface BuildPeriodSuggestionsArgs {
  groups: PlanOptionGroup[];
  planGroupIds: Set<string>;
  teaching: Map<string, TeachingWindow[]>;
  periods: StudyPeriodInfo[];
  targetLocator: string;
  keepVisibleId?: string | null;
  skipIds?: Set<string>;
}

export const isOptionPlanned = (option: PlanCourseOption, planGroupIds: Set<string>): boolean =>
  planGroupIds.has(option.courseUnitGroupId);

export const isGroupVisible = (
  group: PlanOptionGroup,
  planGroupIds: Set<string>,
  keepVisibleId: string | null = null,
): boolean => {
  if (keepVisibleId && group.options.some((option) => option.courseUnitId === keepVisibleId)) return true;
  const planned = group.options.filter((option) => isOptionPlanned(option, planGroupIds));
  if (planned.length === group.options.length) return false;
  return group.max == null || planned.length < group.max;
};

const getProgress = (group: PlanOptionGroup, planned: PlanCourseOption[]): GroupProgress => {
  if (group.creditsMin != null) {
    const done = planned.reduce((sum, option) => sum + (option.credits ?? 0), 0);
    return { kind: 'credits', done, target: group.creditsMin };
  }
  const pick = group.min ?? group.max;
  return pick != null ? { kind: 'count', pick, of: group.options.length } : null;
};

const certaintyRank = (suggestion: PeriodSuggestion): number => (suggestion.fit?.certainty === 'confirmed' ? 0 : 1);

export const buildPeriodSuggestions = ({
  groups,
  planGroupIds,
  teaching,
  periods,
  targetLocator,
  keepVisibleId = null,
  skipIds,
}: BuildPeriodSuggestionsArgs): SuggestionGroup[] =>
  groups.flatMap((group) => {
    const planned = group.options.filter((option) => isOptionPlanned(option, planGroupIds));
    if (!isGroupVisible(group, planGroupIds, keepVisibleId)) return [];
    const remaining = group.options.filter(
      (option) =>
        (!isOptionPlanned(option, planGroupIds) || option.courseUnitId === keepVisibleId) &&
        !skipIds?.has(option.courseUnitId),
    );
    if (remaining.length === 0) return [];

    const suggestions = remaining.map(
      (option): PeriodSuggestion => ({
        option,
        group,
        fit: getPeriodFit(teaching.get(option.courseUnitId) ?? [], periods, targetLocator),
      }),
    );
    const taught = suggestions
      .filter((suggestion) => suggestion.fit)
      .sort((a, b) => certaintyRank(a) - certaintyRank(b) || a.option.name.localeCompare(b.option.name));

    return [
      {
        group,
        progress: getProgress(group, planned),
        taught,
        notTaught: suggestions.filter((suggestion) => !suggestion.fit),
      },
    ];
  });
