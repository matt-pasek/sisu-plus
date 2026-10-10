import React from 'react';
import type { IconProps } from '../../types';

export const ListIcon: React.FC<IconProps> = ({ className = 'size-4' }) => (
  <svg
    aria-hidden="true"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    viewBox="0 0 16 16"
  >
    <path d="M5.5 4h8M5.5 8h8M5.5 12h8M2.5 4h.01M2.5 8h.01M2.5 12h.01" />
  </svg>
);
