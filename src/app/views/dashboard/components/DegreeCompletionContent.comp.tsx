import React from 'react';
import { ModuleProgress } from '@/app/api/dataPoints/getCreditsByModule';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { MODULE_COLOR_VALUES } from '@/app/theme/moduleColors';

export const BAR_COLORS = MODULE_COLOR_VALUES;

function formatCredits(value: number, unit: string): string {
  const rounded = Math.round(value * 10) / 10;
  return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)} ${unit}`;
}

const ProgressDial: React.FC<{ done: number; total: number }> = ({ done, total }) => {
  const { t } = useTranslationWithPrefix('views.dashboard');
  const pct = total > 0 ? Math.min(done / total, 1) : 0;
  const r = 46;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;

  return (
    <div className="relative grid size-36 shrink-0 place-items-center rounded-[28px] bg-background/45 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
      <svg
        aria-label={t('widgets.degreeCompletion.aria', { percent: Math.round(pct * 100) })}
        className="size-28 -rotate-90"
        role="img"
        viewBox="0 0 112 112"
      >
        <circle cx="56" cy="56" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10" />
        <circle
          cx="56"
          cy="56"
          r={r}
          fill="none"
          stroke="var(--color-accent)"
          strokeLinecap="round"
          strokeWidth="10"
          strokeDasharray={`${dash} ${circ - dash}`}
          className="transition-[stroke-dasharray] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl leading-none font-semibold text-offwhite tabular-nums">
          {total > 0 ? `${Math.round(pct * 100)}%` : '-'}
        </span>
        <span className="mt-1 text-[11px] font-medium text-lightGrey">{t('widgets.degreeCompletion.complete')}</span>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{ label: string; value: React.ReactNode; sub: string; tone?: 'default' | 'accent' }> = ({
  label,
  value,
  sub,
  tone = 'default',
}) => (
  <div
    className={`min-w-0 rounded-2xl px-4 py-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)] ${
      tone === 'accent' ? 'bg-accent/10' : 'bg-container2'
    }`}
  >
    <p className="truncate text-xs font-medium text-lightGrey">{label}</p>
    <p className="mt-1 truncate text-2xl leading-none font-semibold text-offwhite tabular-nums">{value}</p>
    <p className="mt-1 truncate text-xs text-lightGrey">{sub}</p>
  </div>
);

const ModuleProgressRow: React.FC<{ name: string; done: number; target: number; color: string }> = ({
  name,
  done,
  target,
  color,
}) => {
  const pct = target > 0 ? Math.min(done / target, 1) : 0;

  return (
    <div className="group grid grid-cols-[4px_minmax(0,1fr)_auto] items-center gap-x-3 rounded-xl bg-background/35 px-3 py-2 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.035)] transition-[background-color,box-shadow] duration-200 hover:bg-background/55 hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]">
      <span className="row-span-2 h-8 w-1 self-center rounded-full" style={{ backgroundColor: color }} />
      <div className="min-w-0">
        <span className="truncate text-sm font-medium text-lightGrey">{name}</span>
      </div>
      <div className="text-right">
        <span className="shrink-0 font-mono text-xs text-offwhite tabular-nums">
          {done}/{target}
        </span>
      </div>
      <div className="col-start-2 col-end-4 mt-2 h-1.5 overflow-hidden rounded-full bg-border2">
        <div
          className="h-full rounded-full transition-[width] duration-700 ease-out"
          style={{ width: `${pct * 100}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};

interface Props {
  creditsDone: number;
  totalTarget: number;
  gradeAverage: number | null;
  gradedCount: number;
  studyRightEnd: { year: string; until: string } | null;
  modules: ModuleProgress[];
}

export const DegreeCompletionContent: React.FC<Props> = ({
  creditsDone,
  gradeAverage,
  gradedCount,
  studyRightEnd,
  totalTarget,
  modules,
}) => {
  const { t } = useTranslationWithPrefix('views.dashboard');
  const { t: tUtil } = useTranslationWithPrefix('util');
  const creditsRemaining = Math.max(totalTarget - creditsDone, 0);
  const unit = tUtil('credits.short');

  return (
    <div className="flex h-full min-h-0 gap-5 overflow-hidden">
      <section className="flex w-52 shrink-0 flex-col justify-between rounded-[28px] bg-container2 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
        <div>
          <p className="text-xs font-medium tracking-wide text-lightGrey uppercase">
            {t('widgets.degreeCompletion.paceLabel')}
          </p>
          <p className="mt-1 text-sm leading-snug text-pretty text-offwhite">
            {t('widgets.degreeCompletion.paceLeft', { credits: formatCredits(creditsRemaining, unit) })}
          </p>
        </div>
        <ProgressDial done={creditsDone} total={totalTarget} />
      </section>

      <section className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="grid grid-cols-3 gap-3">
          <MetricCard
            label={t('widgets.degreeCompletion.creditsLabel')}
            value={creditsDone}
            sub={totalTarget > 0 ? t('widgets.degreeCompletion.ofTarget', { target: totalTarget }) : '-'}
            tone="accent"
          />
          <MetricCard
            label={t('widgets.degreeCompletion.avgGradeLabel')}
            value={gradeAverage?.toFixed(1) ?? '-'}
            sub={
              gradedCount > 0
                ? t('widgets.degreeCompletion.gradedCount', { count: gradedCount })
                : t('widgets.degreeCompletion.noneYet')
            }
          />
          <MetricCard
            label={t('widgets.degreeCompletion.studyRightLabel')}
            value={studyRightEnd?.year ?? '-'}
            sub={studyRightEnd?.until ?? ''}
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          <div className="grid gap-2">
            {modules.map((mod, i) => (
              <ModuleProgressRow
                key={mod.moduleId}
                name={mod.name}
                done={mod.done}
                target={mod.target}
                color={BAR_COLORS[i % BAR_COLORS.length]}
              />
            ))}
            {modules.length === 0 && (
              <div className="flex h-28 items-center justify-center rounded-2xl border border-dashed border-border text-sm text-lightGrey">
                {t('widgets.degreeCompletion.noModules')}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
