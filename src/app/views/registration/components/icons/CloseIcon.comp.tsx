import React from 'react';

export const CloseIcon: React.FC<{ className?: string }> = ({ className = 'size-5' }) => (
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className={className}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);
