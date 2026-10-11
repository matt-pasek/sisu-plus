import React, { useState } from 'react';
import { timetableHost, timetableSourceLabel } from '@/app/api/dataPoints/calendar/timetableUrl';
import type { CalendarCourse, TimetableLink } from '@/app/api/dataPoints/calendar/types';
import { Button } from '@/app/components/ui/Button.comp';
import { Panel } from '@/app/components/ui/Panel.comp';
import { PanelEyebrow } from '@/app/components/ui/PanelEyebrow.comp';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import type { DateRange } from '@/app/schedule';
import { getModuleColorValueByIndex } from '@/app/theme/moduleColors';
import { useTimetableDraft } from '../hooks/useTimetableDraft';
import { previewSummary } from '../util';
import { CloseIcon } from './icons';

const NOTE_CLASS = 'rounded-lg bg-container2/70 px-3 py-2.5 text-[12px] text-offwhite';

interface Props {
  course: CalendarCourse;
  code: string | null;
  range: DateRange;
  existingUrl: string | null;
  locale: string;
  onSave: (link: TimetableLink) => void;
  onClose: () => void;
}

export const TimetableInspector: React.FC<Props> = ({ course, code, range, existingUrl, locale, onSave, onClose }) => {
  const { t } = useTranslationWithPrefix('views.calendar');
  const [input, setInput] = useState(existingUrl ?? '');
  const { draft, submit, allow } = useTimetableDraft(course, code, range);
  const summary = draft.step === 'preview' ? previewSummary(draft.sessions, locale) : null;

  return (
    <Panel
      className="max-lg:fixed max-lg:inset-x-4 max-lg:bottom-4 max-lg:z-40 max-lg:max-h-[60dvh]"
      header={
        <>
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              aria-hidden="true"
              className="w-1 self-stretch rounded-full"
              style={{ backgroundColor: getModuleColorValueByIndex(course.colorIndex) }}
            />
            <div className="min-w-0">
              <PanelEyebrow>{t('timetable.title')}</PanelEyebrow>
              <p className="truncate text-sm font-semibold text-offwhite">{course.name}</p>
            </div>
          </div>
          <button
            type="button"
            aria-label={t('actions.close')}
            onClick={onClose}
            className="relative cursor-pointer rounded-md p-1 text-lightGrey transition-colors duration-150 after:absolute after:-inset-2 after:content-[''] hover:text-offwhite"
          >
            <CloseIcon className="size-4" />
          </button>
        </>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-3.5">
        <label className="flex flex-col gap-1.5 text-[12px] text-lightGrey">
          {t('timetable.label')}
          <input
            type="url"
            inputMode="url"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') submit(input);
            }}
            placeholder="https://cloud.timeedit.net/…"
            className="rounded-lg bg-container2 px-2.5 py-2 font-mono text-[12px] text-offwhite shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] outline-none focus-visible:shadow-[inset_0_0_0_1px_rgba(76,214,150,0.7)]"
          />
        </label>
        <Button
          variant="onSurface"
          className="min-h-8 self-start px-2.5"
          disabled={input.trim() === '' || draft.step === 'loading'}
          onClick={() => submit(input)}
        >
          {t('timetable.preview')}
        </Button>
        {draft.step === 'invalid' && <p className="text-[12px] text-warn">{t('timetable.errors.invalid')}</p>}
        {draft.step === 'failed' && <p className="text-[12px] text-warn">{t(`timetable.errors.${draft.reason}`)}</p>}
        {draft.step === 'loading' && <p className="text-[12px] text-lightGrey">{t('timetable.loading')}</p>}
        {draft.step === 'permission' && (
          <div className={NOTE_CLASS}>
            <p>{t('timetable.needsPermission', { host: timetableHost(draft.url) })}</p>
            {draft.waiting ? (
              <p className="mt-1.5 text-lightGrey">{t('timetable.waiting')}</p>
            ) : (
              <Button variant="accent" className="mt-2 min-h-7 px-2" onClick={allow}>
                {t('timetable.allow')}
              </Button>
            )}
          </div>
        )}
        {draft.step === 'preview' && summary && (
          <div className={NOTE_CLASS}>
            {summary.count === 0 ? (
              <p>{t('timetable.empty')}</p>
            ) : (
              <>
                <p className="font-semibold">
                  {t('timetable.summary', { count: summary.count, first: summary.first, last: summary.last })}
                </p>
                {summary.pattern && (
                  <p className="mt-0.5 text-lightGrey">{t('timetable.pattern', { pattern: summary.pattern })}</p>
                )}
              </>
            )}
            {code && draft.imported.matched > 0 && draft.imported.matched < draft.imported.total && (
              <p className="mt-1 text-lightGrey">
                {t('timetable.matched', { matched: draft.imported.matched, total: draft.imported.total, code })}
              </p>
            )}
            {draft.imported.firstOnly > 0 && (
              <p className="mt-1 text-lightGrey">{t('timetable.firstOnly', { count: draft.imported.firstOnly })}</p>
            )}
            {timetableSourceLabel(draft.url) === 'TimeEdit' && (
              <p className="mt-1 text-lightGrey">{t('timetable.recentOnly', { source: 'TimeEdit' })}</p>
            )}
            <div className="mt-2.5 flex gap-1.5">
              <Button
                variant="accent"
                className="min-h-8 px-2.5"
                onClick={() => onSave({ url: draft.url, codeFilter: code })}
              >
                {t('timetable.save')}
              </Button>
              <Button variant="onSurface" className="min-h-8 px-2.5" onClick={onClose}>
                {t('timetable.cancel')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
};
