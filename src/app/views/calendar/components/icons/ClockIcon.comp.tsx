import React from 'react';
import type { IconProps } from '../../types';

export const ClockIcon: React.FC<IconProps> = ({ className = 'size-4' }) => (
  <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth={1.4} viewBox="0 0 16 16">
    <circle cx="8" cy="8" r="6" />
    <path d="M8 4.8V8l2.2 1.4" strokeLinecap="round" />
  </svg>
);
