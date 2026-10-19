import React from 'react';
import type { PeriodCreditSummary } from '@/app/api/dataPoints/getCreditsByPeriod';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { formatCredits } from '@/app/helpers/formatCredits';
import { isCurrentPeriod } from '@/app/views/timeline/util/getVisibleSemesters';
import { formatPeriodRange } from '@/app/views/timeline/util/formatPeriodRange';

interface Props {
  period: PeriodCreditSummary;
  loadShare: number;
}

export const BoardPeriodHeader: React.FC<Props> = ({ period, loadShare }) => {
  const { t } = useTranslationWithPrefix('views.timeline');
  const credits = formatCredits(period.plannedCredits + period.completedCredits);

  return (
    <div
      title={t('board.workloadTitle', { period: period.period.name, credits })}
      className={`rounded-lg border px-3 py-2 ${
        isCurrentPeriod(period) ? 'border-accent/70 bg-accent/10' : 'border-border bg-container'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-offwhite">{period.period.name}</p>
          <p className="mt-0.5 truncate text-xs text-lightGrey">
            {formatPeriodRange(period.period.startDate, period.period.endDate)}
          </p>
        </div>
        <span className="shrink-0 font-mono text-xs text-lightGrey tabular-nums">{credits}</span>
      </div>
      <div className="mt-2 h-0.5 rounded-full bg-lightGrey/40" style={{ width: `${loadShare * 100}%` }} />
    </div>
  );
};
