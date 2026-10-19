import React from 'react';
import type { IconProps } from '../../types';

export const ChevronRightIcon: React.FC<IconProps> = ({ className = 'size-4' }) => (
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
    <path d="M6 3.5 10.5 8 6 12.5" />
  </svg>
);
