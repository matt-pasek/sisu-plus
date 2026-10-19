import React from 'react';
import type { IconProps } from '../../types';

export const ChevronLeftIcon: React.FC<IconProps> = ({ className = 'size-4' }) => (
  <svg
    aria-hidden="true"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 16 16"
  >
    <path d="M10 3.5 5.5 8l4.5 4.5" />
  </svg>
);
