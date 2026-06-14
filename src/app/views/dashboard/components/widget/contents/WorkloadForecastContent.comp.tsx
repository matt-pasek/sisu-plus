import React from 'react';
import type { PeriodCreditSummary } from '@/app/api/dataPoints/getCreditsByPeriod';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { formatCredits } from '@/app/helpers/formatCredits';
import { hexA } from '@/app/views/dashboard/util/hexA';

export const WorkloadForecastContent: React.FC<{ periods: PeriodCreditSummary[] }> = ({ periods }) => {
  const { t } = useTranslationWithPrefix('views.dashboard');
  const now = new Date();
  const upcoming = periods
    .filter((period) => new Date(period.period.endDate) >= now)
    .filter((period) => period.plannedCredits > 0 || period.period.visibleByDefault)
    .slice(0, 6);
  const maxCredits = Math.max(...upcoming.map((period) => period.plannedCredits), 1);

  if (upcoming.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-lightGrey">
        {t('widgets.analytics.nothingPlanned')}
      </div>
    );
  }

  return (
    <div className="flex h-full items-end gap-2.5">
      {upcoming.map((period, index) => {
        const tone = period.plannedCredits >= 15 ? '#f06b6b' : period.plannedCredits >= 10 ? '#f0a84d' : '#5b8df6';
        const barPct = Math.max((period.plannedCredits / maxCredits) * 100, 10);
        return (
          <div
            key={period.periodLocator}
            className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
          >
            <span className="font-mono text-[12px] font-bold" style={{ color: tone }}>
              {period.plannedCredits}
            </span>
            <div
              className="flex w-full flex-1 items-end rounded-[10px] p-1.25"
              style={{
                background: 'rgba(13,13,17,0.5)',
                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)',
                minHeight: 0,
              }}
            >
              <div
                className="sisu-widget-bar-y w-full rounded-[7px] transition-[height] duration-500"
                style={{
                  height: `${barPct}%`,
                  background: `linear-gradient(180deg, ${tone}, ${hexA(tone, 0.55)})`,
                  boxShadow: `0 0 14px ${hexA(tone, 0.4)}`,
                  animationDelay: `${index * 50}ms`,
                }}
                title={`${period.period.name}: ${formatCredits(period.plannedCredits)}`}
              />
            </div>
            <div className="w-full text-center">
              <p className="truncate text-[10px] font-medium text-lightGrey">{period.period.name}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
