import React from 'react';
import type { IconProps } from '../../types';

export const ShareIcon: React.FC<IconProps> = ({ className = 'size-4' }) => (
  <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth={1.4} viewBox="0 0 16 16">
    <path d="M8 2.5v7M5 5.5l3-3 3 3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3.5 9v3.5h9V9" strokeLinejoin="round" />
  </svg>
);
