import React from 'react';

interface Props {
  label: string;
}

export const EmptyWidgetState: React.FC<Props> = ({ label }) => (
  <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-border text-sm text-lightGrey">
    {label}
  </div>
);
