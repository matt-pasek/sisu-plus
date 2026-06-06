import React from 'react';

export const CheckIcon: React.FC<{ className?: string }> = ({ className = 'size-4' }) => (
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className={className}>
    <path d="m5 12 4 4L19 6" />
  </svg>
);
