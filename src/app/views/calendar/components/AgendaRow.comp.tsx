import React from 'react';
import type { Session } from '@/app/schedule';
import { getModuleColorValueByIndex } from '@/app/theme/moduleColors';
import { formatClock } from '../util';

interface Props {
  session: Session;
  subtitle: string;
  isFaded: boolean;
}

export const AgendaRow: React.FC<Props> = ({ session, subtitle, isFaded }) => (
  <div
    className={`grid grid-cols-[44px_8px_minmax(0,1fr)] items-baseline gap-2.5 border-t border-border py-[7px] text-[13px] first:border-t-0 ${isFaded ? 'opacity-45' : ''}`}
  >
    <span className="font-mono text-[11px] text-lightGrey tabular-nums">{formatClock(session.start)}</span>
    <span
      aria-hidden="true"
      className="size-2 rounded-full"
      style={{ backgroundColor: getModuleColorValueByIndex(session.colorIndex) }}
    />
    <span className={`min-w-0 text-offwhite ${session.cancelled ? 'line-through' : ''}`}>
      <span className="block truncate">{session.courseName}</span>
      <span className="block truncate text-[11.5px] text-lightGrey">{subtitle}</span>
    </span>
  </div>
);
