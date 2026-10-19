import React from 'react';
import { SegmentedControl } from '@/app/components/ui/SegmentedControl.comp';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { HEADER_ACTION_CLASS } from '../constants/headerAction.const';
import type { CalendarView } from '../types';
import { CALENDAR_VIEWS } from '../util';
import { PlusIcon, ShareIcon } from './icons';

interface Props {
  view: CalendarView;
  addNoteRef: React.RefObject<HTMLButtonElement>;
  onViewChange: (view: CalendarView) => void;
  onAddNote: (element: HTMLElement) => void;
  onExport: () => void;
}

export const CalendarHeaderActions: React.FC<Props> = ({ view, addNoteRef, onViewChange, onAddNote, onExport }) => {
  const { t } = useTranslationWithPrefix('views.calendar');
  const options = CALENDAR_VIEWS.map((value) => ({
    value,
    label: t(`views.${value}`),
    keyShortcut: value[0].toUpperCase(),
  }));
  return (
    <>
      <SegmentedControl
        options={options}
        value={view}
        onChange={onViewChange}
        layoutId="calendar-view"
        ariaLabel={t('views.label')}
        size="sm"
      />
      <button
        ref={addNoteRef}
        type="button"
        aria-keyshortcuts="N"
        title={`${t('notes.add')} (N)`}
        className={HEADER_ACTION_CLASS}
        onClick={(event) => onAddNote(event.currentTarget)}
      >
        <PlusIcon className="size-3.5" />
        {t('notes.add')}
      </button>
      <button type="button" className={HEADER_ACTION_CLASS} onClick={onExport}>
        <ShareIcon className="size-3.5" />
        {t('exportPanel.button')}
      </button>
    </>
  );
};
