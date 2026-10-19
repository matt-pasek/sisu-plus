import React from 'react';
import type { IconProps } from '../../types';

export const CalendarIcon: React.FC<IconProps> = ({ className = 'size-4' }) => (
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M8 2v4M16 2v4M3 10h18" />
    <rect width="18" height="18" x="3" y="4" rx="3" />
  </svg>
);
