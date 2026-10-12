import React from 'react';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { HEADER_ACTION_CLASS } from '../constants/headerAction.const';
import { PlusIcon } from './icons';

interface Props {
  addNoteRef: React.RefObject<HTMLButtonElement>;
  onAddNote: (element: HTMLElement) => void;
}

export const CalendarHeaderActions: React.FC<Props> = ({ addNoteRef, onAddNote }) => {
  const { t } = useTranslationWithPrefix('views.calendar');
  return (
    <button
      ref={addNoteRef}
      type="button"
      className={HEADER_ACTION_CLASS}
      onClick={(event) => onAddNote(event.currentTarget)}
    >
      <PlusIcon className="size-3.5" />
      {t('notes.add')}
    </button>
  );
};
