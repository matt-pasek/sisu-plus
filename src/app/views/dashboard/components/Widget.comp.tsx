import React, { PropsWithChildren } from 'react';
import { InlineLoader } from '@/app/components/ui/InlineLoader.comp';

interface Props extends PropsWithChildren {
  loading?: boolean;
  header?: React.ReactNode;
  showHeaderDivider?: boolean;
}

export const Widget: React.FC<Props> = ({ header, showHeaderDivider = true, children, loading = false }) => {
  return (
    <div className="flex max-h-full w-full flex-col rounded-2xl bg-container py-3 shadow-[0_1px_3px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.04)]">
      {header && (
        <div className={`px-4 pb-3 ${showHeaderDivider && 'border-b border-solid border-border'}`}>{header}</div>
      )}
      <div className="h-full flex-1 overflow-y-auto p-4 pb-0">{loading ? <InlineLoader /> : children}</div>
    </div>
  );
};
