import React, { useState } from 'react';
import type { StudyPeriodMap } from '@/app/api/dataPoints/getStudyPeriodMap';
import { formatCredits } from '@/app/helpers/formatCredits';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { SuggestionRow } from '@/app/views/timeline/components/addCourse/SuggestionRow.comp';
import type { AddCourseInput } from '@/app/views/timeline/hooks/useAddCourseFlow';
import { getAddRowState, type AddProgress } from '@/app/views/timeline/util/addRowState';
import { formatCreditAmount } from '@/app/views/timeline/util/suggestionDerivation';
import type { CandidatePrerequisites } from '@/app/views/timeline/util/candidatePrerequisites';
import type { PeriodSuggestion, SuggestionGroup } from '@/app/views/timeline/util/periodSuggestions';

interface Props {
  suggestionGroup: SuggestionGroup;
  prerequisitesById: Map<string, CandidatePrerequisites>;
  studyPeriodMap: StudyPeriodMap;
  targetLocator: string;
  addProgress: AddProgress;
  isWriting: boolean;
  onAdd: (input: AddCourseInput) => void;
  onUndo: () => void;
}

export const SuggestionGroupSection: React.FC<Props> = ({
  suggestionGroup,
  prerequisitesById,
  studyPeriodMap,
  targetLocator,
  addProgress,
  isWriting,
  onAdd,
  onUndo,
}) => {
  const { t } = useTranslationWithPrefix('views.timeline');
  const [showNotTaught, setShowNotTaught] = useState(false);
  const { group, progress, taught, notTaught, pendingCount } = suggestionGroup;
  const targetPeriodName = studyPeriodMap.get(targetLocator)?.name ?? '';

  const progressLabel =
    progress?.kind === 'credits'
      ? `${formatCreditAmount(progress.done)} / ${formatCredits(progress.target)}`
      : progress?.kind === 'count'
        ? t('addCourse.pick', { pick: progress.pick, of: progress.of })
        : null;

  const renderRow = (suggestion: PeriodSuggestion) => {
    const { option, fit } = suggestion;
    const periodLocators = fit?.periodLocators ?? [targetLocator];
    return (
      <SuggestionRow
        key={option.courseUnitId}
        name={option.name}
        code={option.code}
        credits={option.credits}
        fit={fit}
        fitPeriods={periodLocators.flatMap((locator) => studyPeriodMap.get(locator) ?? [])}
        targetPeriodName={targetPeriodName}
        required={option.required}
        prerequisites={prerequisitesById.get(option.courseUnitId)}
        state={getAddRowState(option.courseUnitId, addProgress)}
        disabled={isWriting}
        onAdd={() =>
          onAdd({
            option,
            sectionId: group.sectionId,
            sectionName: group.sectionName,
            parentModuleId: group.moduleId,
            periodLocators,
          })
        }
        onUndo={onUndo}
      />
    );
  };

  return (
    <section className="mt-4 first:mt-0">
      <header className="mb-2 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-xs font-semibold text-offwhite">{group.moduleName}</h3>
          {group.title && (
            <p className="truncate text-[11px] text-lightGrey" title={group.title}>
              {group.title}
            </p>
          )}
        </div>
        {progressLabel && <span className="shrink-0 text-xs text-lightGrey tabular-nums">{progressLabel}</span>}
      </header>
      <ul className="flex flex-col gap-2">{taught.map(renderRow)}</ul>
      {pendingCount > 0 && (
        <div role="status" className={taught.length > 0 ? 'mt-2' : undefined}>
          {taught.length === 0 && (
            <div className="mb-2 h-16 animate-pulse rounded-lg bg-container2/80 motion-reduce:animate-none" />
          )}
          <p className="text-[11px] text-lightGrey">{t('addCourse.checking', { count: pendingCount })}</p>
        </div>
      )}
      {notTaught.length > 0 && (
        <div className="mt-2">
          <button
            type="button"
            aria-expanded={showNotTaught}
            onClick={() => setShowNotTaught((current) => !current)}
            className="flex w-full cursor-pointer items-center justify-between gap-2 text-left text-xs text-lightGrey transition-colors duration-150 hover:text-offwhite"
          >
            <span>{t('addCourse.notTaught', { count: notTaught.length })}</span>
            <span className="shrink-0 font-medium text-lighterGreen">
              {showNotTaught ? t('addCourse.hide') : t('addCourse.show')}
            </span>
          </button>
          {showNotTaught && <ul className="mt-2 flex flex-col gap-2">{notTaught.map(renderRow)}</ul>}
        </div>
      )}
    </section>
  );
};
