import React from 'react';
import type { FreeSearchModule } from '@/app/api/dataPoints/planOptions/walkPlanOptions';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { SuggestionRow } from '@/app/views/timeline/components/addCourse/SuggestionRow.comp';
import type { AddCourseInput } from '@/app/views/timeline/hooks/useAddCourseFlow';
import type { SearchResultRowModel } from '@/app/views/timeline/hooks/useSearchResultRows';
import { getAddRowState, type AddProgress } from '@/app/views/timeline/util/addRowState';

interface Props {
  row: SearchResultRowModel;
  freeSearchModules: FreeSearchModule[];
  targetPeriodName: string;
  addProgress: AddProgress;
  isWriting: boolean;
  onChooseModule: (moduleId: string) => void;
  onAdd: (input: AddCourseInput) => void;
  onUndo: () => void;
}

export const SearchResultRow: React.FC<Props> = ({
  row,
  freeSearchModules,
  targetPeriodName,
  addProgress,
  isWriting,
  onChooseModule,
  onAdd,
  onUndo,
}) => {
  const { t } = useTranslationWithPrefix('views.timeline');
  const { route, option, placement, fit, fitPeriods, periodLocators, prerequisites, pending } = row;
  const note =
    route.kind === 'listed'
      ? t('addCourse.listedUnder', { module: route.group.moduleName })
      : route.kind === 'full'
        ? t('addCourse.groupFull', { module: route.group.moduleName })
        : undefined;

  return (
    <SuggestionRow
      name={option.name}
      code={option.code}
      credits={option.credits}
      creditsMax={row.creditsMax}
      fit={fit}
      fitPeriods={fitPeriods}
      targetPeriodName={targetPeriodName}
      required={false}
      prerequisites={prerequisites}
      state={pending ? 'busy' : getAddRowState(option.courseUnitId, addProgress)}
      disabled={isWriting || !placement}
      note={note}
      moduleChoice={
        route.kind === 'free' && placement && freeSearchModules.length > 1 ? (
          <label className="mt-2 flex items-center gap-2 text-xs text-lightGrey">
            {t('addCourse.addTo')}
            <select
              aria-label={t('addCourse.addTo')}
              value={placement.moduleId}
              onChange={(event) => onChooseModule(event.target.value)}
              className="min-w-0 flex-1 rounded-md border border-border bg-container px-2 py-1 text-xs text-offwhite"
            >
              {freeSearchModules.map((module) => (
                <option key={module.moduleId} value={module.moduleId}>
                  {module.name}
                </option>
              ))}
            </select>
          </label>
        ) : undefined
      }
      onAdd={() => {
        if (!placement) return;
        onAdd({
          option,
          sectionId: placement.sectionId,
          sectionName: placement.sectionName,
          parentModuleId: placement.moduleId,
          periodLocators,
        });
      }}
      onUndo={onUndo}
    />
  );
};
