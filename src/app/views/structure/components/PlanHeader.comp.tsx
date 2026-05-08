import React from 'react';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';

interface Props {
  planName: string;
  studyRightUntil: string | null;
  totalCompleted: number;
  totalTarget: number;
  degreeMinimumCredits: number | null;
}

export const PlanHeader: React.FC<Props> = ({
  degreeMinimumCredits,
  planName,
  studyRightUntil,
  totalCompleted,
  totalTarget,
}) => {
  const { t } = useTranslationWithPrefix('views.structure');
  const remaining = Math.max(totalTarget - totalCompleted, 0);
  const milestonePercent =
    degreeMinimumCredits != null && totalTarget > 0
      ? Math.min(Math.max(degreeMinimumCredits / totalTarget, 0), 1)
      : null;

  return (
    <section className="min-w-0 flex-1 rounded-[10px] bg-container px-5 py-4 shadow-[0_0_0_1px_rgba(255,255,255,0.07),0_18px_50px_rgba(0,0,0,0.18)]">
      <div className="mb-2 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl leading-tight font-semibold text-balance text-offwhite">
          {planName || t('header.planLabel')}
        </h1>
        <span className="rounded px-2 py-0.5 text-xs font-bold tracking-[0.08em] text-accent uppercase shadow-[0_0_0_1px_rgba(65,150,72,0.55)]">
          {t('header.primaryBadge')}
        </span>
      </div>
      <p className="mb-4 text-sm text-lightGrey">{t('header.subtitle')}</p>

      <div className="mb-1.5 flex items-center justify-between gap-4 text-sm text-lightGrey">
        <span>{t('header.overallProgress')}</span>
        <span className="font-mono text-sm font-semibold text-accent">
          {totalCompleted} / {totalTarget} cr
        </span>
      </div>
      <div className="relative h-4">
        <div className="absolute top-1/2 h-2 w-full -translate-y-1/2 overflow-hidden rounded-full bg-container2">
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-300 ease-out"
            style={{ width: `${totalTarget > 0 ? Math.min(Math.max(totalCompleted / totalTarget, 0), 1) * 100 : 0}%` }}
          />
        </div>
        {milestonePercent != null && (
          <div
            className="absolute top-0 bottom-0 z-10 flex -translate-x-1/2 items-center"
            style={{ left: `${milestonePercent * 100}%` }}
            title={t('header.milestoneWithCredits', { count: degreeMinimumCredits })}
          >
            <span className="h-4 w-0.5 rounded-full bg-offwhite/80 shadow-[0_0_0_2px_rgba(13,13,17,0.9),0_0_12px_rgba(221,221,240,0.2)]" />
          </div>
        )}
      </div>
      {degreeMinimumCredits != null && (
        <div className="mt-1 flex justify-end text-xs font-medium text-lightGrey">
          {t('header.milestoneWithCredits', { count: degreeMinimumCredits })}
        </div>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <StatChip label={t('header.completed')} value={`${totalCompleted} cr`} valueClassName="text-lighterGreen" />
        <StatChip label={t('header.remaining')} value={`${remaining} cr`} valueClassName="text-offwhite" />
        <StatChip label={t('header.studyRightUntil')} value={studyRightUntil ?? '-'} valueClassName="text-offwhite" />
      </div>
    </section>
  );
};

const StatChip: React.FC<{ label: string; value: string; valueClassName: string }> = ({
  label,
  value,
  valueClassName,
}) => (
  <div className="min-w-0 rounded-lg bg-container2/70 px-4 py-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]">
    <div className="mb-1 truncate text-xs font-medium text-lightGrey">{label}</div>
    <div className={`truncate font-mono text-base font-semibold tabular-nums ${valueClassName}`}>{value}</div>
  </div>
);
