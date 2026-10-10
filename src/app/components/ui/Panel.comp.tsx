import React, { PropsWithChildren } from 'react';

interface Props extends PropsWithChildren {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const Panel: React.FC<Props> = ({ header, footer, className = '', children }) => (
  <section
    className={`relative flex min-h-0 flex-col overflow-hidden rounded-[14px] bg-container shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_16px_42px_-30px_rgba(0,0,0,0.85)] ${className}`}
  >
    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/8 to-transparent" />
    {header != null && (
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3">{header}</div>
    )}
    {children}
    {footer != null && (
      <div className="mt-auto shrink-0 border-t border-border px-4 py-2 text-xs text-lightGrey">{footer}</div>
    )}
  </section>
);
