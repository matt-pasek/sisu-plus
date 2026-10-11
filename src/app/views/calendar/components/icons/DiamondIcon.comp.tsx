import React from 'react';
import type { IconProps } from '../../types';

export const DiamondIcon: React.FC<IconProps> = ({ className = 'size-4' }) => (
  <svg aria-hidden="true" className={className} fill="currentColor" viewBox="0 0 16 16">
    <path d="M8 1.5 14.5 8 8 14.5 1.5 8z" />
  </svg>
);
