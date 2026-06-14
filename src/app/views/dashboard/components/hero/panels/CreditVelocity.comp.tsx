import React, { useMemo } from 'react';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import type { SemesterCreditSummary } from '@/app/api/dataPoints/getCreditsByPeriod';
import { getSemesterTitle } from '@/app/helpers/getSemesterTitle';

interface Props {
  semesters?: SemesterCreditSummary[];
  done?: number;
}

export const CreditVelocity: React.FC<Props> = ({ semesters, done }) => {
  const { t } = useTranslationWithPrefix('views.dashboard');
  const { t: tUtil } = useTranslationWithPrefix('util');
  const unit = tUtil('credits.short');

  const visible = useMemo(
    () => (semesters ?? []).filter((s) => s.completedCredits > 0 || s.plannedCredits > 0).slice(-5),
    [semesters],
  );
  const maxCredits = Math.max(...visible.map((s) => s.completedCredits + s.plannedCredits), 1);
  const totalDone = done ?? visible.reduce((sum, s) => sum + s.completedCredits, 0);

  return (
    <div className="hidden min-w-[30rem] flex-col gap-3 md:flex" style={{ minHeight: 160 }}>
      <p className="font-mono text-[9px] font-semibold tracking-[0.12em] text-offwhite/60 uppercase">
        {t('hero.panel.creditVelocity')}
      </p>
      <div className="flex items-baseline gap-1.5">
        <p className="text-[38px] leading-none font-bold text-offwhite tabular-nums">{Math.round(totalDone)}</p>
        <span className="text-[16px] font-semibold text-offwhite/45">{unit}</span>
      </div>
      {visible.length === 0 ? (
        <p className="text-[12px] text-offwhite/60">{t('widgets.analytics.noCompletedCourses')}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {visible.map((s, i) => {
            const isCurrent = i === visible.length - 1;
            const completedPct = (s.completedCredits / maxCredits) * 100;
            const plannedPct = (s.plannedCredits / maxCredits) * 100;

            return (
              <div
                key={`${s.studyYear}:${s.termName}`}
                className="grid grid-cols-[88px_minmax(150px,1fr)_40px] items-center gap-3"
              >
                <span className="font-mono text-[10px] font-medium whitespace-nowrap text-offwhite/60">
                  {getSemesterTitle(s)}
                </span>
                <div
                  className="flex h-5 overflow-hidden rounded-full"
                  style={{ background: 'rgba(13,13,17,0.6)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)' }}
                >
                  {s.completedCredits > 0 && (
                    <div
                      className="sisu-widget-bar-x h-full flex-none transition-[width] duration-500"
                      style={{
                        width: `${completedPct}%`,
                        background: isCurrent ? 'linear-gradient(90deg, #3da86b, #52c989)' : 'rgba(82,201,137,0.45)',
                        boxShadow: isCurrent ? '0 0 10px rgba(82,201,137,0.35)' : 'none',
                        animationDelay: `${i * 45}ms`,
                      }}
                    />
                  )}
                  {s.plannedCredits > 0 && (
                    <div
                      className="h-full flex-none transition-[width] duration-500"
                      style={{ width: `${plannedPct}%`, background: 'rgba(82,201,137,0.18)' }}
                    />
                  )}
                </div>
                <span className="text-right font-mono text-[10px] font-semibold text-offwhite/90 tabular-nums">
                  {Math.round(s.completedCredits + s.plannedCredits)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
