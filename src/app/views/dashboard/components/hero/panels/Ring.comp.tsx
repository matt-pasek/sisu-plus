import React from 'react';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';

interface Props {
  done: number;
  total: number;
}

export const Ring: React.FC<Props> = ({ done, total }) => {
  const { t } = useTranslationWithPrefix('views.dashboard');
  const pct = total > 0 ? Math.min(done / total, 1) : 0;
  const r = 88;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;

  return (
    <div className="flex shrink-0 items-center gap-5">
      <div className="relative grid size-48 shrink-0 place-items-center xl:size-56">
        <svg
          aria-label={t('widgets.degreeCompletion.aria', { percent: Math.round(pct * 100) })}
          className="size-48 -rotate-90 drop-shadow-[0_0_22px_rgba(82,201,137,0.28)] xl:size-56"
          role="img"
          viewBox="0 0 208 208"
        >
          <defs>
            <filter id="hero-ring-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <circle cx="104" cy="104" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10" />
          <circle
            className="sisu-widget-ring transition-[stroke-dasharray] duration-700 ease-out"
            cx="104"
            cy="104"
            fill="none"
            filter="url(#hero-ring-glow)"
            r={r}
            stroke="var(--color-lighterGreen)"
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            strokeWidth="10"
            style={{ '--sisu-ring-from': `${circ}`, '--sisu-ring-to': 0 } as React.CSSProperties}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[38px] leading-none font-bold text-offwhite tabular-nums xl:text-[44px]">
            {total > 0 ? `${Math.round(pct * 100)}%` : '-'}
          </span>
          <span className="mt-1.5 font-mono text-[10px] font-semibold tracking-[0.12em] text-lightGrey uppercase">
            {t('widgets.degreeCompletion.complete')}
          </span>
        </div>
      </div>

      <div className="hidden min-w-32 flex-col md:flex">
        <span className="font-mono text-[10px] font-semibold tracking-[0.12em] text-offwhite/55 uppercase">
          {t('widgets.degreeCompletion.creditsLabel')}
        </span>
        <span className="mt-3 text-2xl font-semibold text-offwhite tabular-nums">
          {t('hero.creditsLabel', { done, total })}
        </span>
      </div>
    </div>
  );
};
