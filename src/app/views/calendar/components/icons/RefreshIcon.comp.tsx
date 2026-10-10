import React from 'react';
import type { IconProps } from '../../types';

export const RefreshIcon: React.FC<IconProps> = ({ className = 'size-4' }) => (
  <svg
    aria-hidden="true"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 16 16"
  >
    <path d="M13.5 8a5.5 5.5 0 1 1-1.61-3.89M13.5 2.5v3h-3" />
  </svg>
);
