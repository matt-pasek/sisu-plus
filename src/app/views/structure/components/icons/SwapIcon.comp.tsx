import React from 'react';

export const SwapIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({
  className = 'size-3.5',
  style,
}) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    className={className}
    style={style}
  >
    <path d="M4 8h14" />
    <path d="m15 4 4 4-4 4" />
    <path d="M20 16H6" />
    <path d="m9 12-4 4 4 4" />
  </svg>
);
