import React from 'react';
import type { IconProps } from '../../types';

export const PlusIcon: React.FC<IconProps> = ({ className = 'size-4' }) => (
  <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth={1.4} viewBox="0 0 16 16">
    <path d="M8 3v10M3 8h10" strokeLinecap="round" />
  </svg>
);
