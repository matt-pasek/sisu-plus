import React from 'react';
import { StatusChip } from '@/app/components/ui/StatusChip.comp';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import type { DeadlinePopoverState } from '../types';
import { deadlineColor, formatClock, formatSessionDate } from '../util';
import { CalendarPopover } from './CalendarPopover.comp';
import { ClockIcon, CloseIcon, FlagIcon, LinkIcon } from './icons';

interface Props {
  state: DeadlinePopoverState;
  now: Date;
  locale: string;
  onClose: () => void;
}

export const DeadlinePopover: React.FC<Props> = ({ state, now, locale, onClose }) => {
  const { t } = useTranslationWithPrefix('views.calendar');
  const { deadline } = state;
  return (
    <CalendarPopover
      anchor={state.anchor}
      returnFocus={state.element}
      ariaLabel={deadline.title}
      width={320}
      closeOnOutside
      onClose={onClose}
    >
      <div className="flex items-start gap-3 px-[18px] pt-4 pb-3">
        <FlagIcon className="mt-0.5 size-4 shrink-0 text-lightGrey" />
        <h3 className="min-w-0 flex-1 text-[15px] leading-[1.3] font-semibold text-balance text-offwhite">
          {deadline.title}
        </h3>
        <button
          type="button"
          aria-label={t('actions.close')}
          onClick={onClose}
          className="relative -mt-1 -mr-1.5 cursor-pointer rounded-md p-1 text-lightGrey transition-colors duration-150 after:absolute after:-inset-2 after:content-[''] hover:text-offwhite"
        >
          <CloseIcon className="size-4" />
        </button>
      </div>
      <dl className="grid grid-cols-[18px_minmax(0,1fr)] gap-x-2.5 gap-y-2.5 border-t border-border px-[18px] py-3 text-[12.5px]">
        <dt className="flex items-center justify-center">
          <span
            aria-hidden="true"
            className="size-2 rounded-full"
            style={{ backgroundColor: deadlineColor(deadline) }}
          />
        </dt>
        <dd className="text-offwhite">{deadline.courseLabel ?? t('deadlines.noCourse')}</dd>
        <dt className="pt-px text-darkishGrey">
          <ClockIcon className="size-3.5" />
        </dt>
        <dd className="flex flex-wrap items-center gap-2 font-mono text-offwhite tabular-nums">
          {t('deadlines.due', { date: formatSessionDate(deadline.dateKey, locale), time: formatClock(deadline.dueAt) })}
          {deadline.dueAt <= now && <StatusChip tone="neutral">{t('deadlines.past')}</StatusChip>}
        </dd>
      </dl>
      {deadline.url && (
        <div className="border-t border-border px-[18px] py-3">
          <a
            href={deadline.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-lighterGreen underline-offset-2 hover:underline"
          >
            <LinkIcon className="size-3.5" />
            {t('deadlines.openInMoodle')}
          </a>
        </div>
      )}
    </CalendarPopover>
  );
};
