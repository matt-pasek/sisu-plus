import React from 'react';
import type { SemesterCreditSummary } from '@/app/api/dataPoints/getCreditsByPeriod';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { formatCredits } from '@/app/helpers/formatCredits';
import { getSemesterTitle } from '@/app/helpers/getSemesterTitle';

export const CreditsVelocityContent: React.FC<{ semesters: SemesterCreditSummary[] }> = ({ semesters }) => {
  const { t } = useTranslationWithPrefix('views.dashboard');
  const visible = semesters
    .filter((semester) => semester.completedCredits > 0 || semester.plannedCredits > 0)
    .slice(-6);
  const maxCredits = Math.max(...visible.map((semester) => semester.completedCredits + semester.plannedCredits), 1);

  return (
    <div className="flex h-full flex-col gap-2">
      {visible.map((semester) => (
        <div
          key={`${semester.studyYear}:${semester.termName}`}
          className="grid grid-cols-[92px_1fr_56px] items-center gap-3"
        >
          <span className="truncate text-xs font-medium text-lightGrey">{getSemesterTitle(semester)}</span>
          <div className="flex h-6 overflow-hidden rounded-full bg-background/70 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
            <div
              className="bg-lighterGreen transition-[width] duration-300"
              style={{ width: `${(semester.completedCredits / maxCredits) * 100}%` }}
            />
            <div
              className="bg-blue-400/35 transition-[width] duration-300"
              style={{ width: `${(semester.plannedCredits / maxCredits) * 100}%` }}
            />
          </div>
          <span className="text-right font-mono text-xs text-offwhite tabular-nums">
            {formatCredits(semester.completedCredits + semester.plannedCredits)}
          </span>
        </div>
      ))}
      <div className="mt-auto flex items-center gap-4 text-[11px] text-lightGrey">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-sm bg-lighterGreen" /> {t('widgets.analytics.completed')}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-sm bg-blue-400/45" /> {t('widgets.analytics.planned')}
        </span>
      </div>
    </div>
  );
};
