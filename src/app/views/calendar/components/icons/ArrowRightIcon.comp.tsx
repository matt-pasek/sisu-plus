import React from 'react';
import type { IconProps } from '../../types';

export const ArrowRightIcon: React.FC<IconProps> = ({ className = 'size-4' }) => (
  <svg
    aria-hidden="true"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={1.6}
    viewBox="0 0 16 16"
  >
    <path d="M3 8h9M9 5l3 3-3 3" />
  </svg>
);
