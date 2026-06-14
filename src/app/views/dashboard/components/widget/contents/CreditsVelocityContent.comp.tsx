import React from 'react';
import type { SemesterCreditSummary } from '@/app/api/dataPoints/getCreditsByPeriod';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { formatCredits } from '@/app/helpers/formatCredits';
import { getSemesterTitle } from '@/app/helpers/getSemesterTitle';
import { hexA } from '@/app/views/dashboard/util/hexA';

export const CreditsVelocityContent: React.FC<{ semesters: SemesterCreditSummary[] }> = ({ semesters }) => {
  const { t } = useTranslationWithPrefix('views.dashboard');
  const visible = semesters
    .filter((semester) => semester.completedCredits > 0 || semester.plannedCredits > 0)
    .slice(-6);
  const maxCredits = Math.max(...visible.map((semester) => semester.completedCredits + semester.plannedCredits), 1);

  return (
    <div className="flex h-full flex-col gap-2.5">
      {visible.map((semester, index) => (
        <div
          key={`${semester.studyYear}:${semester.termName}`}
          className="grid grid-cols-[84px_1fr_52px] items-center gap-3"
        >
          <span className="truncate font-mono text-[11px] font-medium text-lightGrey">
            {getSemesterTitle(semester)}
          </span>
          <div
            className="flex h-4.5 overflow-hidden rounded-full"
            style={{
              background: 'rgba(13,13,17,0.6)',
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)',
            }}
          >
            <div
              className="sisu-widget-bar-x transition-[width] duration-500"
              style={{
                width: `${(semester.completedCredits / maxCredits) * 100}%`,
                background: '#52c989',
                boxShadow: semester.completedCredits ? '0 0 12px rgba(82,201,137,0.4)' : 'none',
                animationDelay: `${index * 45}ms`,
              }}
            />
            <div
              className="sisu-widget-bar-x transition-[width] duration-500"
              style={{
                width: `${(semester.plannedCredits / maxCredits) * 100}%`,
                background: hexA('#5b8df6', 0.5),
                backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.08) 0 4px, transparent 4px 8px)',
                animationDelay: `${index * 45 + 90}ms`,
              }}
            />
          </div>
          <span className="text-right font-mono text-[11.5px] font-semibold text-offwhite tabular-nums">
            {formatCredits(semester.completedCredits + semester.plannedCredits)}
          </span>
        </div>
      ))}
      <div className="mt-auto flex items-center gap-5 text-[11px] text-lightGrey">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-xs bg-lighterGreen" /> {t('widgets.analytics.completed')}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-xs" style={{ background: hexA('#5b8df6', 0.55) }} />{' '}
          {t('widgets.analytics.planned')}
        </span>
      </div>
    </div>
  );
};
