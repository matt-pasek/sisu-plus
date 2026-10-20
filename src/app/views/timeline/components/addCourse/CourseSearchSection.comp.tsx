import React, { useState } from 'react';
import type { StudyPeriodInfo } from '@/app/api/dataPoints/getStudyPeriodMap';
import type { TimelineCourse } from '@/app/api/dataPoints/getTimelineCourses';
import type { PlanOptionGroup } from '@/app/api/dataPoints/planOptions/buildOptionGroups';
import type { FreeSearchModule } from '@/app/api/dataPoints/planOptions/walkPlanOptions';
import { searchCourseUnits } from '@/app/api/dataPoints/searchCourseUnits';
import type { CourseUnitAttainmentRestricted } from '@/app/api/generated/OriApi';
import { useDebouncedValue } from '@/app/hooks/useDebouncedValue';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { SearchResultRow } from '@/app/views/timeline/components/addCourse/SearchResultRow.comp';
import type { AddCourseInput } from '@/app/views/timeline/hooks/useAddCourseFlow';
import { useSearchResultRows } from '@/app/views/timeline/hooks/useSearchResultRows';
import type { AddProgress } from '@/app/views/timeline/util/addRowState';

interface Props {
  freeSearchModules: FreeSearchModule[];
  optionGroups: PlanOptionGroup[];
  planGroupIds: Set<string>;
  planCourseUnitIds: Set<string>;
  courses: TimelineCourse[];
  attainments: CourseUnitAttainmentRestricted[];
  periods: StudyPeriodInfo[];
  targetLocator: string;
  addProgress: AddProgress;
  keepVisibleId: string | null;
  isWriting: boolean;
  onAdd: (input: AddCourseInput) => void;
  onUndo: () => void;
}

const SEARCH_DEBOUNCE_MS = 300;

export const CourseSearchSection: React.FC<Props> = ({
  freeSearchModules,
  optionGroups,
  planGroupIds,
  planCourseUnitIds,
  courses,
  attainments,
  periods,
  targetLocator,
  addProgress,
  keepVisibleId,
  isWriting,
  onAdd,
  onUndo,
}) => {
  const { t } = useTranslationWithPrefix('views.timeline');
  const [query, setQuery] = useState('');
  const [moduleChoices, setModuleChoices] = useState<Record<string, string>>({});
  const debouncedQuery = useDebouncedValue(query.trim(), SEARCH_DEBOUNCE_MS);
  const { data: results } = searchCourseUnits(debouncedQuery);
  const rows = useSearchResultRows({
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
  });
  const targetName = periods.find((period) => period.locator === targetLocator)?.name ?? '';

  if (freeSearchModules.length === 0) return null;

  return (
    <section className="mb-4">
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t('addCourse.search')}
        aria-label={t('addCourse.search')}
        className="w-full rounded-lg border border-border bg-container2 px-3 py-2 text-xs text-offwhite placeholder:text-lightGrey focus-visible:outline-2 focus-visible:outline-lighterGreen"
      />
      {rows.length > 0 && (
        <ul className="mt-2 flex flex-col gap-2">
          {rows.map((row) => (
            <SearchResultRow
              key={row.key}
              row={row}
              freeSearchModules={freeSearchModules}
              targetPeriodName={targetName}
              addProgress={addProgress}
              isWriting={isWriting}
              onChooseModule={(moduleId) => setModuleChoices((current) => ({ ...current, [row.key]: moduleId }))}
              onAdd={onAdd}
              onUndo={onUndo}
            />
          ))}
        </ul>
      )}
    </section>
  );
};
