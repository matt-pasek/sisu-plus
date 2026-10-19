import React, { PropsWithChildren } from 'react';
import type { SeriesClashSummary } from '@/app/schedule';
import { WarningIcon } from './icons';

interface Props extends PropsWithChildren {
  summary: SeriesClashSummary;
  label: string;
}

export const ClashBox: React.FC<Props> = ({ summary, label, children }) => (
  <div className="mx-4 mb-3 flex gap-2 rounded-[10px] bg-warn/8 px-3 py-2.5 text-[12.5px] text-warn shadow-[inset_0_0_0_1px_rgba(240,168,77,0.25)]">
    <WarningIcon className="mt-0.5 size-3 shrink-0" />
    <div className="min-w-0 flex-1">
      <p>{label}</p>
      <div className="mt-2 flex flex-wrap gap-[3px]" aria-hidden="true">
        {summary.perSession.map((entry) => (
          <span
            key={entry.sessionId}
            className={`h-1.5 w-[18px] rounded-full ${entry.clashes ? 'bg-warn' : 'bg-lighterGreen/50'}`}
          />
        ))}
      </div>
      {children}
    </div>
  </div>
);
