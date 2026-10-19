import React from 'react';
import { Button } from '@/app/components/ui/Button.comp';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import type { CalendarView } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, WarningIcon } from './icons';

interface Props {
  view: CalendarView;
  title: string;
  eyebrow: string | null;
  clashCount: number;
  onToday: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onShowClash: () => void;
}

export const CalendarToolbar: React.FC<Props> = ({
  view,
  title,
  eyebrow,
  clashCount,
  onToday,
  onPrevious,
  onNext,
  onShowClash,
}) => {
  const { t } = useTranslationWithPrefix('views.calendar');
  const previousLabel = t(`navigation.previous.${view}`);
  const nextLabel = t(`navigation.next.${view}`);
  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border px-3.5 py-3">
      <Button onClick={onToday} title={`${t('actions.today')} (T)`}>
        {t('actions.today')}
      </Button>
      <Button
        ariaLabel={previousLabel}
        title={`${previousLabel} (←)`}
        className="min-w-10 px-2.5"
        onClick={onPrevious}
        icon={<ChevronLeftIcon className="size-4" />}
      />
      <Button
        ariaLabel={nextLabel}
        title={`${nextLabel} (→)`}
        className="min-w-10 px-2.5"
        onClick={onNext}
        icon={<ChevronRightIcon className="size-4" />}
      />
      <h2 className="ml-1.5 text-lg font-bold tracking-[-0.01em] whitespace-nowrap text-offwhite">
        {title}
        {eyebrow && (
          <span className="ml-2 font-mono text-[11px] font-medium tracking-normal text-lightGrey uppercase">
            {eyebrow}
          </span>
        )}
      </h2>
      {clashCount > 0 && (
        <button
          type="button"
          onClick={onShowClash}
          title={t('actions.showClash')}
          className="ml-1 inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-lg bg-warn/8 px-2.5 text-xs font-medium text-warn shadow-[inset_0_0_0_1px_rgba(240,168,77,0.22)] transition-[background-color,transform] duration-150 hover:bg-warn/12 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lighterGreen active:scale-[0.96]"
        >
          <WarningIcon className="size-3" />
          {t('toolbar.clashes', { count: clashCount })}
        </button>
      )}
    </div>
  );
};
