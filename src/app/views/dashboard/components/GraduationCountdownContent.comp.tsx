import React from 'react';
import type { SemesterCreditSummary } from '@/app/api/dataPoints/getCreditsByPeriod';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';

const formatDays = (days: number | null): string => {
  if (days == null) return '-';
  return new Intl.NumberFormat().format(Math.max(days, 0));
};

export const GraduationCountdownContent: React.FC<{
  creditsDone: number;
  semesters: SemesterCreditSummary[];
  totalTarget: number;
}> = ({ creditsDone, semesters, totalTarget }) => {
  const { t } = useTranslationWithPrefix('views.dashboard');
  const creditsRemaining = Math.max(totalTarget - creditsDone, 0);
  const plannedGraduationDate =
    semesters
      .filter((semester) => semester.plannedCredits > 0)
      .flatMap((semester) => semester.periods)
      .reduce<string | null>((latestDate, period) => {
        if (latestDate == null) return period.period.endDate;
        return period.period.endDate > latestDate ? period.period.endDate : latestDate;
      }, null) ?? null;
  const daysRemaining = plannedGraduationDate
    ? Math.ceil((new Date(plannedGraduationDate).getTime() - Date.now()) / 86_400_000)
    : null;
  const creditsPerDay = daysRemaining && daysRemaining > 0 ? creditsRemaining / daysRemaining : null;
  const intense = creditsPerDay != null && creditsPerDay > 0.08;

  return (
    <div className="grid h-full grid-cols-2 gap-3">
      <div className="rounded-xl bg-container2 p-3">
        <p className="text-xs text-lightGrey">{t('widgets.analytics.creditsLeft')}</p>
        <p className="mt-1 text-2xl font-semibold text-offwhite tabular-nums">{creditsRemaining}</p>
      </div>
      <div className="rounded-xl bg-container2 p-3">
        <p className="text-xs text-lightGrey">{t('widgets.analytics.daysLeft')}</p>
        <p className="mt-1 text-2xl font-semibold text-offwhite tabular-nums">{formatDays(daysRemaining)}</p>
      </div>
      <div className="col-span-2 rounded-xl bg-background/45 p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-lightGrey">{t('widgets.analytics.creditsPerDay')}</span>
          <span
            className={`font-mono text-sm font-semibold tabular-nums ${intense ? 'text-danger' : 'text-lighterGreen'}`}
          >
            {creditsPerDay == null ? '-' : creditsPerDay.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};
