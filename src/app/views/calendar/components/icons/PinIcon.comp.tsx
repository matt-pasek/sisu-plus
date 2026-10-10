import React from 'react';
import type { IconProps } from '../../types';

export const PinIcon: React.FC<IconProps> = ({ className = 'size-4' }) => (
  <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth={1.4} viewBox="0 0 16 16">
    <path d="M8 14s4.5-4.2 4.5-7.5a4.5 4.5 0 1 0-9 0C3.5 9.8 8 14 8 14Z" />
    <circle cx="8" cy="6.5" r="1.5" />
  </svg>
);
