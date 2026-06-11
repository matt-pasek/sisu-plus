import React from 'react';
import { ModuleProgress } from '@/app/api/dataPoints/getCreditsByModule';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { getModuleColor } from '@/app/theme/moduleColors';

function formatCredits(value: number, unit: string): string {
  const rounded = Math.round(value * 10) / 10;
  return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)} ${unit}`;
}

const Ring: React.FC<{ done: number; total: number }> = ({ done, total }) => {
  const { t } = useTranslationWithPrefix('views.dashboard');
  const pct = total > 0 ? Math.min(done / total, 1) : 0;
  const r = 46;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;

  return (
    <div className="relative grid size-28 shrink-0 place-items-center">
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
          strokeDashoffset={0}
          className="sisu-widget-ring transition-[stroke-dasharray] duration-700 ease-out"
          style={
            {
              '--sisu-ring-from': `${circ}`,
              '--sisu-ring-to': 0,
            } as React.CSSProperties
          }
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[26px] leading-none font-bold text-offwhite tabular-nums">
          {total > 0 ? `${Math.round(pct * 100)}%` : '-'}
        </span>
        <span className="mt-1 text-[10px] font-medium tracking-[0.08em] text-lightGrey uppercase">
          {t('widgets.degreeCompletion.complete')}
        </span>
      </div>
    </div>
  );
};

const ModuleBar: React.FC<{ name: string; done: number; target: number; color: string }> = ({
  name,
  done,
  target,
  color,
}) => {
  const pct = target > 0 ? Math.min(done / target, 1) : 0;
  const full = pct >= 1;

  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-x-2.5 gap-y-0.5 rounded-[11px] bg-background/35 px-3 py-2 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.035)] transition-[background-color] duration-200 hover:bg-background/55">
      <div className="flex min-w-0 items-center gap-2">
        <span
          className="size-1.75 shrink-0 rounded-xs"
          style={{
            backgroundColor: color,
            boxShadow: full ? `0 0 8px ${color}99` : 'none',
          }}
        />
        <span className="truncate text-[12.5px] font-medium text-offwhite">{name}</span>
      </div>
      <span className="font-mono text-[11.5px] font-semibold" style={{ color: full ? color : undefined }}>
        <span className={full ? '' : 'text-offwhite'}>{done}</span>
        <span className="opacity-50">/{target}</span>
      </span>
      <div className="col-span-2 mt-1.5 h-1.25 overflow-hidden rounded-full bg-border2">
        <div
          className="sisu-widget-bar-x h-full rounded-full transition-[width] duration-700 ease-out"
          style={{ width: `${pct * 100}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};

interface Props {
  creditsDone: number;
  totalTarget: number;
  modules: ModuleProgress[];
}

export const DegreeCompletionContent: React.FC<Props> = ({ creditsDone, totalTarget, modules }) => {
  const { t } = useTranslationWithPrefix('views.dashboard');
  const { t: tUtil } = useTranslationWithPrefix('util');
  const creditsRemaining = Math.max(totalTarget - creditsDone, 0);
  const unit = tUtil('credits.short');

  return (
    <div className="flex h-full min-h-0 gap-4 overflow-hidden">
      <section className="flex w-47 shrink-0 flex-col justify-between rounded-[18px] bg-container2 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
        <div>
          <p className="text-[10px] font-semibold tracking-widest text-lightGrey uppercase">
            {t('widgets.degreeCompletion.paceLabel')}
          </p>
          <p className="mt-1.5 text-[13.5px] leading-snug text-pretty text-offwhite">
            <span className="font-semibold text-lighterGreen">{formatCredits(creditsRemaining, unit)}</span>{' '}
            {t('widgets.degreeCompletion.paceLeft', { credits: '' }).trim()}
          </p>
        </div>
        <div className="flex items-center justify-center">
          <Ring done={creditsDone} total={totalTarget} />
        </div>
      </section>

      <section className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          <div className="flex flex-col gap-1.5">
            {modules.map((mod) => (
              <ModuleBar
                key={mod.moduleId}
                name={mod.name}
                done={mod.done}
                target={mod.target}
                color={getModuleColor(mod.moduleId)}
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
