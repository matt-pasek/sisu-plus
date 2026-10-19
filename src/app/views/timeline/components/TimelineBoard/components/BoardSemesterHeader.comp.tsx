import React from 'react';
import type { SemesterCreditSummary } from '@/app/api/dataPoints/getCreditsByPeriod';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { CreditChip } from '@/app/views/timeline/components/TimelineBoard/components/CreditChip.comp';
import { isCurrentSemester } from '@/app/views/timeline/util/getVisibleSemesters';
import { getSemesterTitle } from '@/app/helpers/getSemesterTitle';

interface Props {
  semester: SemesterCreditSummary;
  startColumn: number;
}

export const BoardSemesterHeader: React.FC<Props> = ({ semester, startColumn }) => {
  const { t } = useTranslationWithPrefix('views.timeline');
  const isCompact = semester.periods.length === 1;

  return (
    <div
      data-flip-id={`semester:${semester.studyYear}:${semester.termName}`}
      className={`overflow-hidden rounded-lg border px-4 py-2 ${
        isCurrentSemester(semester)
          ? 'border-accent/70 bg-accent/10 shadow-[0_0_0_1px_rgba(65,150,72,0.2)]'
          : 'border-border bg-container'
      }`}
      style={{ gridColumn: `${startColumn} / span ${semester.periods.length}` }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-offwhite">{getSemesterTitle(semester)}</h2>
        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
          {semester.completedCredits > 0 && (
            <CreditChip label={t('board.done')} credits={semester.completedCredits} variant="completed" />
          )}
          {semester.plannedCredits > 0 && (
            <CreditChip
              label={t('board.planned')}
              credits={semester.plannedCredits}
              hideLabel={isCompact}
              variant="planned"
            />
          )}
        </div>
      </div>
    </div>
  );
};
