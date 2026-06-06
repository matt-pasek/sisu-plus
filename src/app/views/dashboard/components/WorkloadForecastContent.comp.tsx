import React from 'react';
import type { PeriodCreditSummary } from '@/app/api/dataPoints/getCreditsByPeriod';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { formatCredits } from '@/app/helpers/formatCredits';

export const WorkloadForecastContent: React.FC<{ periods: PeriodCreditSummary[] }> = ({ periods }) => {
  const { t } = useTranslationWithPrefix('views.dashboard');
  const now = new Date();
  const upcoming = periods
    .filter((period) => new Date(period.period.endDate) >= now)
    .filter((period) => period.plannedCredits > 0 || period.period.visibleByDefault)
    .slice(0, 6);
  const maxCredits = Math.max(...upcoming.map((period) => period.plannedCredits), 1);

  return (
    <div className="flex h-full items-end gap-2">
      {upcoming.map((period) => (
        <div key={period.periodLocator} className="flex h-full min-w-0 flex-1 flex-col justify-end gap-2">
          <div className="flex min-h-0 flex-1 items-end rounded-lg bg-background/45 p-1.5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
            <div
              className={`w-full rounded-md transition-[height] duration-300 ${
                period.plannedCredits >= 15 ? 'bg-danger' : period.plannedCredits >= 10 ? 'bg-warn' : 'bg-blue-400'
              }`}
              style={{ height: `${Math.max((period.plannedCredits / maxCredits) * 100, 8)}%` }}
              title={`${period.period.name}: ${formatCredits(period.plannedCredits)}`}
            />
          </div>
          <div>
            <p className="truncate text-center text-[10px] font-medium text-lightGrey">{period.period.name}</p>
            <p className="text-center font-mono text-[10px] text-offwhite tabular-nums">
              {formatCredits(period.plannedCredits)}
            </p>
          </div>
        </div>
      ))}
      {upcoming.length === 0 && (
        <div className="flex flex-1 items-center justify-center text-sm text-lightGrey">
          {t('widgets.analytics.nothingPlanned')}
        </div>
      )}
    </div>
  );
};
