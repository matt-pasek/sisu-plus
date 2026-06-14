import React from 'react';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';

interface Props {
  creditsDone: number;
  totalTarget: number;
  studyRightEndDate: string | null;
}

export const CreditPaceContent: React.FC<Props> = ({ creditsDone, totalTarget, studyRightEndDate }) => {
  const { t } = useTranslationWithPrefix('views.dashboard');
  const { t: tUtil } = useTranslationWithPrefix('util');

  const pctActual = totalTarget > 0 ? Math.min(creditsDone / totalTarget, 1) : 0;
  const creditsRemaining = Math.max(totalTarget - creditsDone, 0);
  const unit = tUtil('credits.short');

  const now = Date.now();
  const endMs = studyRightEndDate ? new Date(studyRightEndDate).getTime() : null;
  const daysRemaining = endMs ? Math.ceil((endMs - now) / 86_400_000) : null;

  const creditsPerDay =
    daysRemaining != null && daysRemaining > 0 ? (creditsRemaining / daysRemaining).toFixed(2) : null;

  const isLowPressure = creditsPerDay != null && Number(creditsPerDay) <= 0.2;
  const paceLabel =
    creditsRemaining === 0
      ? t('widgets.analytics.completed')
      : isLowPressure
        ? t('widgets.analytics.onTrack')
        : t('widgets.analytics.watchPace');

  return (
    <div className="flex h-full flex-col justify-center gap-4 overflow-hidden">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] text-lightGrey">{t('widgets.analytics.creditsLeft')}</p>
          <p className="mt-1 font-mono leading-none">
            <span className="text-[30px] font-bold text-lighterGreen tabular-nums">{creditsRemaining}</span>
            <span className="ml-1.5 text-[14px] font-medium text-lightGrey">{unit}</span>
          </p>
          <p className="mt-2 text-[11px] text-lightGrey">
            {creditsDone} / {totalTarget} {unit}
          </p>
        </div>
        <span
          className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
          style={{
            background: isLowPressure || creditsRemaining === 0 ? 'rgba(82,201,137,0.12)' : 'rgba(240,168,77,0.13)',
            color: isLowPressure || creditsRemaining === 0 ? '#52c989' : '#f0a84d',
          }}
        >
          <span className="size-1.5 rounded-full" style={{ background: 'currentColor' }} />
          {paceLabel}
        </span>
      </div>

      <div
        className="relative h-4 overflow-hidden rounded-full"
        style={{
          background: 'rgba(13,13,17,0.7)',
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)',
        }}
      >
        <div
          className="sisu-widget-bar-x absolute inset-y-0 left-0 rounded-full transition-[width] duration-700"
          style={{
            width: `${pctActual * 100}%`,
            background: 'linear-gradient(90deg, rgba(65,150,72,0.86), #52c989)',
            boxShadow: '0 0 14px rgba(82,201,137,0.4)',
            transition: 'width 320ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] text-lightGrey">
          {t('widgets.analytics.degreePercent', { percent: Math.round(pctActual * 100) })}
        </span>
        <span className="font-mono text-[11px] text-lightGrey">
          {creditsPerDay != null ? t('widgets.analytics.creditsPerDayValue', { value: creditsPerDay, unit }) : '-'}
        </span>
      </div>
    </div>
  );
};
