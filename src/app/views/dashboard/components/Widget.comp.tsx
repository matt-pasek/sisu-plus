import React, { PropsWithChildren } from 'react';
import { InlineLoader } from '@/app/components/ui/InlineLoader.comp';

interface Props extends PropsWithChildren {
  loading?: boolean;
  header?: React.ReactNode;
  showHeaderDivider?: boolean;
}

export const Widget: React.FC<Props> = ({ header, showHeaderDivider = true, children, loading = false }) => {
  return (
    <div className="flex max-h-full w-full flex-col rounded-lg border border-solid border-border bg-container py-3">
      {header && (
        <div className={`px-4 pb-3 ${showHeaderDivider && 'border-b border-solid border-border'}`}>{header}</div>
      )}
      <div className="h-full flex-1 overflow-y-auto p-4 pb-0">{loading ? <InlineLoader /> : children}</div>
    </div>
  );
};
