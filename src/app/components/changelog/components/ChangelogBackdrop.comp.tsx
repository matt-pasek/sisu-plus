import React from 'react';

export const ChangelogBackdrop: React.FC = () => (
  <>
    <div
      className="pointer-events-none absolute inset-0 z-0 flex bg-background opacity-[0.58] blur-[3px] saturate-[0.92]"
      aria-hidden="true"
      style={{ backgroundImage: 'radial-gradient(120% 90% at 100% 0%, rgba(65, 150, 72, 0.08), transparent 62%)' }}
    >
      <div className="flex w-16 shrink-0 flex-col items-center gap-2.5 border-r border-border bg-[rgba(13,13,17,0.7)] py-4.5">
        <span className="mb-2.5 size-8.5 rounded-[10px] bg-linear-[155deg,var(--color-lighterGreen),var(--color-accent)]" />
        <i className="size-9.5 rounded-[11px] bg-container2" />
        <i className="size-9.5 rounded-[11px] bg-container2" />
        <i className="size-9.5 rounded-[11px] bg-container2" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-14 shrink-0 items-center border-b border-border px-7.5">
          <span className="h-3 w-40 rounded-full bg-container2" />
        </div>
        <div className="grid flex-1 grid-cols-4 gap-5 p-7.5 max-[720px]:grid-cols-1">
          <span className="col-span-full min-h-45 rounded-3xl border border-border bg-container" />
          <span className="min-h-40 rounded-[18px] border border-border bg-container" />
          <span className="min-h-40 rounded-[18px] border border-border bg-container" />
          <span className="min-h-40 rounded-[18px] border border-border bg-container" />
          <span className="min-h-40 rounded-[18px] border border-border bg-container" />
        </div>
      </div>
    </div>
    <div className="absolute inset-0 z-1 bg-[rgba(4,5,8,0.62)] backdrop-blur-lg" aria-hidden="true" />
  </>
);
