import React from 'react';
import type { IconProps } from '../../types';

export const FlagIcon: React.FC<IconProps> = ({ className = 'size-4' }) => (
  <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth={1.4} viewBox="0 0 16 16">
    <path d="M4 14V2.5" strokeLinecap="round" />
    <path d="M4 3h7.5L10 5.5 11.5 8H4" strokeLinejoin="round" />
  </svg>
);
