import React, { useMemo } from 'react';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import type { SemesterCreditSummary } from '@/app/api/dataPoints/getCreditsByPeriod';
import { getSemesterTitle } from '@/app/helpers/getSemesterTitle';

interface Props {
  semesters?: SemesterCreditSummary[];
}

export const CreditVelocity: React.FC<Props> = ({ semesters }) => {
  const { t } = useTranslationWithPrefix('views.dashboard');
  const visible = useMemo(
    () => (semesters ?? []).filter((s) => s.completedCredits > 0 || s.plannedCredits > 0).slice(-5),
    [semesters],
  );
  const maxCredits = Math.max(...visible.map((s) => s.completedCredits + s.plannedCredits), 1);

  return (
    <div className="hidden min-w-44 flex-col gap-2 md:flex">
      <p className="font-mono text-[9px] font-semibold tracking-[0.12em] text-lightGrey uppercase">
        {t('hero.panel.creditVelocity')}
      </p>
      {visible.length === 0 ? (
        <p className="text-[12px] text-lightGrey/60">{t('widgets.analytics.noCompletedCourses')}</p>
      ) : (
        visible.map((s, i) => (
          <div key={`${s.studyYear}:${s.termName}`} className="grid grid-cols-[60px_1fr_36px] items-center gap-2">
            <span className="truncate font-mono text-[10px] text-lightGrey/70">{getSemesterTitle(s)}</span>
            <div
              className="flex h-3.5 overflow-hidden rounded-full"
              style={{ background: 'rgba(13,13,17,0.6)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)' }}
            >
              <div
                className="sisu-widget-bar-x transition-[width] duration-500"
                style={{
                  width: `${(s.completedCredits / maxCredits) * 100}%`,
                  background: i === visible.length - 1 ? '#52c989' : 'rgba(82,201,137,0.5)',
                  animationDelay: `${i * 45}ms`,
                }}
              />
            </div>
            <span className="text-right font-mono text-[10px] font-semibold text-offwhite tabular-nums">
              {Math.round(s.completedCredits)}
            </span>
          </div>
        ))
      )}
    </div>
  );
};
