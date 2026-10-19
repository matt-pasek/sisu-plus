import React from 'react';
import type { IconProps } from '../../types';

export const NoteIcon: React.FC<IconProps> = ({ className = 'size-4' }) => (
  <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth={1.4} viewBox="0 0 16 16">
    <path d="M3.5 2.5h9v7l-3 3.5h-6z" />
    <path d="M9.5 13V9.5h3" />
  </svg>
);
