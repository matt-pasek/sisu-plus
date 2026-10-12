import React from 'react';
import type { NoteOccurrence } from '@/app/schedule';
import { formatClock } from '../util';
import { NoteIcon } from './icons';

interface Props {
  note: NoteOccurrence;
  subtitle: string;
  isFaded: boolean;
}

export const AgendaNoteRow: React.FC<Props> = ({ note, subtitle, isFaded }) => (
  <div
    className={`grid grid-cols-[44px_8px_minmax(0,1fr)] items-baseline gap-2.5 border-t border-border py-[7px] text-[13px] first:border-t-0 ${isFaded ? 'opacity-45' : ''}`}
  >
    <span className="font-mono text-[11px] text-lightGrey tabular-nums">{formatClock(note.start)}</span>
    <NoteIcon className="size-2.5 self-center text-lighterGreen" />
    <span className="min-w-0 text-offwhite">
      <span className="block truncate">{note.name}</span>
      <span className="block truncate text-[11.5px] text-lightGrey">{subtitle}</span>
    </span>
  </div>
);
