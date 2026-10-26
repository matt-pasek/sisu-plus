import React from 'react';

interface IconProps {
  className?: string;
}

export const BellIcon: React.FC<IconProps> = ({ className = 'size-4' }) => (
  <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M15.5 18.25a3.5 3.5 0 0 1-7 0" strokeLinecap="round" />
    <path
      d="M18.5 16.75h-13c1.15-1.25 1.8-2.75 1.8-4.5V10a4.7 4.7 0 0 1 9.4 0v2.25c0 1.75.65 3.25 1.8 4.5Z"
      strokeLinejoin="round"
    />
  </svg>
);
