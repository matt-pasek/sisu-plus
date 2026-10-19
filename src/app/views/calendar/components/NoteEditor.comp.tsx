import React, { useId } from 'react';
import { clampUntilKey, maxUntilKey, validateNoteDraft } from '@/app/api/dataPoints/calendar/notes';
import type { NoteDraft } from '@/app/api/dataPoints/calendar/types';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { HELSINKI_TIME_ZONE } from '@/app/schedule';
import type { NoteEditorState } from '../types';
import { minutesToTimeValue, parseRepeat, REPEAT_OPTIONS, timeValueToMinutes } from '../util';
import { CalendarPopover } from './CalendarPopover.comp';
import { CloseIcon, NoteIcon } from './icons';
import { NoteField } from './NoteField.comp';

const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const INPUT_CLASS =
  'w-full min-w-0 rounded-lg border border-border bg-background px-2.5 py-1.5 text-[13px] text-offwhite [color-scheme:dark] outline-none focus-visible:border-lighterGreen';
const BUTTON_CLASS =
  'cursor-pointer rounded-lg px-3 py-1.5 text-[12.5px] font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lighterGreen';

interface Props {
  state: NoteEditorState;
  onChange: (draft: NoteDraft) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const NoteEditor: React.FC<Props> = ({ state, onChange, onSave, onCancel }) => {
  const { t } = useTranslationWithPrefix('views.calendar');
  const id = useId();
  const { draft } = state;
  const errors = state.attempted ? validateNoteDraft(draft) : {};
  const title = t(state.noteId ? 'notes.editTitle' : 'notes.newTitle');
  const set = (patch: Partial<NoteDraft>) => onChange({ ...draft, ...patch });
  const setStart = (value: string) => {
    const minutes = timeValueToMinutes(value);
    if (minutes != null) set({ startMinutes: minutes });
  };
  const setEnd = (value: string) => {
    const minutes = timeValueToMinutes(value);
    if (minutes != null) set({ endMinutes: minutes });
  };
  const describedBy = (key: string, hasError: boolean) => (hasError ? `${id}-${key}-error` : undefined);

  return (
    <CalendarPopover
      anchor={state.anchor}
      returnFocus={state.returnFocus}
      ariaLabel={title}
      width={340}
      closeOnOutside={false}
      onClose={onCancel}
    >
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          onSave();
        }}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-[18px] py-3">
          <span className="flex items-center gap-2 text-sm font-semibold text-offwhite">
            <NoteIcon className="size-4 text-lighterGreen" />
            {title}
          </span>
          <button
            type="button"
            aria-label={t('actions.close')}
            onClick={onCancel}
            className="relative cursor-pointer rounded-md p-1 text-lightGrey transition-colors duration-150 after:absolute after:-inset-2 after:content-[''] hover:text-offwhite"
          >
            <CloseIcon className="size-4" />
          </button>
        </div>
        <div className="flex flex-col gap-3 px-[18px] py-3.5">
          <NoteField
            id={`${id}-title`}
            label={t('notes.fields.title')}
            error={errors.title ? t('notes.errors.required') : null}
          >
            <input
              id={`${id}-title`}
              data-autofocus
              value={draft.title}
              maxLength={120}
              placeholder={t('notes.titlePlaceholder')}
              aria-invalid={errors.title != null}
              aria-describedby={describedBy('title', errors.title != null)}
              onChange={(event) => set({ title: event.target.value })}
              className={INPUT_CLASS}
            />
          </NoteField>
          <NoteField id={`${id}-date`} label={t('notes.fields.date')} error={null}>
            <input
              id={`${id}-date`}
              type="date"
              value={draft.dateKey}
              onChange={(event) => event.target.value && set({ dateKey: event.target.value })}
              className={INPUT_CLASS}
            />
          </NoteField>
          <div className="grid grid-cols-2 gap-2.5">
            <NoteField id={`${id}-start`} label={t('notes.fields.start')} error={null}>
              <input
                id={`${id}-start`}
                type="time"
                step={900}
                value={minutesToTimeValue(draft.startMinutes)}
                onChange={(event) => setStart(event.target.value)}
                className={INPUT_CLASS}
              />
            </NoteField>
            <NoteField
              id={`${id}-time`}
              label={t('notes.fields.end')}
              error={errors.time ? t('notes.errors.endBeforeStart') : null}
            >
              <input
                id={`${id}-time`}
                type="time"
                step={900}
                value={minutesToTimeValue(draft.endMinutes)}
                aria-invalid={errors.time != null}
                aria-describedby={describedBy('time', errors.time != null)}
                onChange={(event) => setEnd(event.target.value)}
                className={INPUT_CLASS}
              />
            </NoteField>
          </div>
          <NoteField id={`${id}-repeat`} label={t('notes.fields.repeat')} error={null}>
            <select
              id={`${id}-repeat`}
              value={draft.repeat}
              onChange={(event) => {
                const repeat = parseRepeat(event.target.value);
                set({ repeat, untilKey: clampUntilKey(draft.untilKey, draft.dateKey, repeat) });
              }}
              className={INPUT_CLASS}
            >
              {REPEAT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {t(`notes.repeat.${option}`)}
                </option>
              ))}
            </select>
          </NoteField>
          {draft.repeat !== 'NEVER' && (
            <NoteField
              id={`${id}-until`}
              label={t('notes.fields.until')}
              error={errors.until ? t(`notes.errors.${errors.until}`) : null}
            >
              <input
                id={`${id}-until`}
                type="date"
                value={draft.untilKey}
                min={draft.dateKey}
                max={maxUntilKey(draft.dateKey, draft.repeat)}
                aria-invalid={errors.until != null}
                aria-describedby={describedBy('until', errors.until != null)}
                onChange={(event) => event.target.value && set({ untilKey: event.target.value })}
                className={INPUT_CLASS}
              />
            </NoteField>
          )}
          {browserTimeZone !== HELSINKI_TIME_ZONE && (
            <p className="font-mono text-[11px] text-lightGrey">{t('notes.helsinkiNote')}</p>
          )}
        </div>
        <div className="flex justify-end gap-2 border-t border-border px-[18px] py-3">
          <button type="button" onClick={onCancel} className={`${BUTTON_CLASS} text-lightGrey hover:text-offwhite`}>
            {t('notes.cancel')}
          </button>
          <button
            type="submit"
            className={`${BUTTON_CLASS} bg-lighterGreen/15 text-lighterGreen hover:bg-lighterGreen/25`}
          >
            {t('notes.save')}
          </button>
        </div>
      </form>
    </CalendarPopover>
  );
};
