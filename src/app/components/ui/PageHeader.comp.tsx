import React from 'react';

interface Props {
  title: string;
  subtitle?: React.ReactNode;
  aside?: React.ReactNode;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<Props> = ({ title, subtitle, aside, actions }) => (
  <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <span className="inline-flex min-w-0 items-center gap-2 font-mono text-[11px] font-semibold tracking-[0.14em] text-lightGrey uppercase">
      <span className="size-1.5 shrink-0 rounded-full bg-lighterGreen shadow-[0_0_10px_rgba(82,201,137,0.7)]" />
      <span className="truncate">{title}</span>
      {subtitle != null && (
        <>
          <span aria-hidden="true">&middot;</span>
          <b className="truncate font-bold text-offwhite">{subtitle}</b>
        </>
      )}
    </span>
    {(aside != null || actions != null) && (
      <div className="flex shrink-0 items-center gap-2 sm:justify-end">
        {aside}
        {actions}
      </div>
    )}
  </header>
);
