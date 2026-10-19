import React, { PropsWithChildren } from 'react';
import type { StatusTone } from './types';

const TONE_CLASS: Record<StatusTone, string> = {
  warn: 'border-warn/25 bg-warn/10 text-warn',
  ok: 'border-lighterGreen/25 bg-lighterGreen/10 text-lighterGreen',
  info: 'border-blue-400/25 bg-blue-400/10 text-blue-300',
  neutral: 'border-lightGrey/25 bg-lightGrey/10 text-lightGrey',
};

interface Props extends PropsWithChildren {
  tone: StatusTone;
  icon?: React.ReactNode;
  className?: string;
}

export const StatusChip: React.FC<Props> = ({ tone, icon, className = '', children }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] leading-none font-semibold whitespace-nowrap ${TONE_CLASS[tone]} ${className}`}
  >
    {icon}
    {children}
  </span>
);
