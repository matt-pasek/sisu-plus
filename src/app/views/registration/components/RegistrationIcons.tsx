import React from 'react';

export const CalendarIcon: React.FC<{ className?: string }> = ({ className = 'size-4' }) => (
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M8 2v4M16 2v4M3 10h18" />
    <rect width="18" height="18" x="3" y="4" rx="3" />
  </svg>
);

export const CheckIcon: React.FC<{ className?: string }> = ({ className = 'size-4' }) => (
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className={className}>
    <path d="m5 12 4 4L19 6" />
  </svg>
);

export const CloseIcon: React.FC<{ className?: string }> = ({ className = 'size-5' }) => (
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className={className}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);
