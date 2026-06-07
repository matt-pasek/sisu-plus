import React, { PropsWithChildren } from 'react';
import { InlineLoader } from '@/app/components/ui/InlineLoader.comp';

interface Props extends PropsWithChildren {
  icon?: React.ReactNode;
  eyebrow?: string;
  title: React.ReactNode;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  loading?: boolean;
}

export const Widget: React.FC<Props> = ({ icon, eyebrow, title, badge, actions, children, loading = false }) => {
  return (
    <div className="relative flex h-full max-h-full min-h-0 w-full flex-col overflow-hidden rounded-2xl bg-container shadow-[0_1px_3px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.045),0_18px_38px_-22px_rgba(0,0,0,0.8)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/8 to-transparent" />

      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          {icon}
          <div className="min-w-0">
            {eyebrow && (
              <p className="font-mono text-[10px] font-semibold tracking-[0.12em] text-lightGrey uppercase">
                {eyebrow}
              </p>
            )}
            <div className="truncate text-sm font-semibold tracking-[-0.01em] text-offwhite">{title}</div>
          </div>
        </div>
        {(badge || actions) && (
          <div className="flex shrink-0 items-center gap-2">
            {badge}
            {actions}
          </div>
        )}
      </div>

      <div className="h-full flex-1 overflow-y-auto p-4">{loading ? <InlineLoader /> : children}</div>
    </div>
  );
};
