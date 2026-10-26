import React from 'react';

interface Props extends React.SelectHTMLAttributes<HTMLSelectElement> {
  compact?: boolean;
}

export const SettingsSelect: React.FC<Props> = ({ compact = false, className = '', children, ...props }) => (
  <span className="relative inline-flex">
    <select
      {...props}
      className={`cursor-pointer appearance-none rounded-lg border-0 bg-background pr-7 pl-2.5 font-medium text-offwhite shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] transition-shadow duration-150 outline-none hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14)] focus-visible:shadow-[inset_0_0_0_1px_rgba(82,201,137,0.4)] ${compact ? 'h-7 text-[11px]' : 'h-8 text-xs'} ${className}`}
    >
      {children}
    </select>
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute top-1/2 right-2 size-3 -translate-y-1/2 text-lightGrey"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  </span>
);
