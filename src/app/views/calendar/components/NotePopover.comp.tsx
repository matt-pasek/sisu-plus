import React, { useState } from 'react';
import type { CalendarEvent } from '@/app/api/generated/IlmoApi';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import type { NotePopoverState } from '../types';
import { formatClock, formatDayMonth, formatSessionDate } from '../util';
import { CalendarPopover } from './CalendarPopover.comp';
import { CalendarIcon, ClockIcon, CloseIcon, NoteIcon } from './icons';

const ACTION_CLASS =
  'cursor-pointer rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-offwhite shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] transition-colors duration-150 hover:bg-offwhite/8';
const DANGER_CLASS = `${ACTION_CLASS} text-warn`;

interface Props {
  state: NotePopoverState;
  event: CalendarEvent | undefined;
  fallbackFocus: React.RefObject<HTMLElement>;
  locale: string;
  onEdit?: () => void;
  onDeleteDay: () => void;
  onDeleteSeries: () => void;
  onClose: () => void;
}

export const NotePopover: React.FC<Props> = ({
  state,
  event,
  fallbackFocus,
  locale,
  onEdit,
  onDeleteDay,
  onDeleteSeries,
  onClose,
}) => {
  const { t } = useTranslationWithPrefix('views.calendar');
  const [confirming, setConfirming] = useState(false);
  const { note } = state;
  const repeat = event?.recursEvery ?? 'NEVER';
  const until = event?.recursUntil?.slice(0, 10) ?? note.dateKey;
  return (
    <CalendarPopover
      anchor={state.anchor}
      returnFocus={state.element}
      fallbackFocus={fallbackFocus}
      ariaLabel={note.name}
      width={320}
      closeOnOutside
      onClose={onClose}
    >
      <div className="flex items-start gap-3 px-[18px] pt-4 pb-3">
        <NoteIcon className="mt-0.5 size-4 shrink-0 text-lighterGreen" />
        <h3 className="min-w-0 flex-1 text-[15px] leading-[1.3] font-semibold text-balance text-offwhite">
          {note.name}
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
        <dt className="pt-px text-darkishGrey">
          <ClockIcon className="size-3.5" />
        </dt>
        <dd className="font-mono text-offwhite tabular-nums">
          {formatSessionDate(note.dateKey, locale)} · {formatClock(note.start)}–{formatClock(note.end)}
        </dd>
        <dt className="pt-px text-darkishGrey">
          <CalendarIcon className="size-3.5" />
        </dt>
        <dd className="text-lightGrey">{t(`notes.summary.${repeat}`, { date: formatDayMonth(until) })}</dd>
      </dl>
      <div className="flex flex-wrap items-center gap-2 border-t border-border px-[18px] py-3">
        {confirming ? (
          <>
            <span className="mr-auto text-[12.5px] text-offwhite">{t('notes.deleteQuestion')}</span>
            {note.recurring ? (
              <>
                <button type="button" className={DANGER_CLASS} onClick={onDeleteDay}>
                  {t('notes.deleteDay')}
                </button>
                <button type="button" className={DANGER_CLASS} onClick={onDeleteSeries}>
                  {t('notes.deleteSeries')}
                </button>
              </>
            ) : (
              <button type="button" className={DANGER_CLASS} onClick={onDeleteSeries}>
                {t('notes.delete')}
              </button>
            )}
            <button type="button" className={ACTION_CLASS} onClick={() => setConfirming(false)}>
              {t('notes.keep')}
            </button>
          </>
        ) : (
          <>
            {onEdit && (
              <button type="button" className={ACTION_CLASS} onClick={onEdit}>
                {t('notes.edit')}
              </button>
            )}
            <button type="button" className={ACTION_CLASS} onClick={() => setConfirming(true)}>
              {t('notes.delete')}
            </button>
          </>
        )}
      </div>
    </CalendarPopover>
  );
};
