import React from 'react';

interface Props {
  accent: string;
}

export const TimelineMock: React.FC<Props> = ({ accent }) => (
  <div className="min-h-29">
    <svg className="h-full w-full overflow-visible" viewBox="0 0 360 170" aria-hidden="true">
      <path
        d="M18 126 C90 58 142 142 207 82 C250 43 296 48 342 24"
        fill="none"
        stroke="rgba(255,255,255,0.28)"
        strokeDasharray="5 5"
        strokeWidth="1.5"
      />
      <path d="M18 126 C90 58 142 142 207 82 C250 43 296 48 342 24 L342 152 L18 152 Z" fill={accent} opacity="0.12" />
      <path
        d="M18 126 C90 58 142 142 207 82 C250 43 296 48 342 24"
        fill="none"
        stroke={accent}
        strokeLinecap="round"
        strokeWidth="3"
      />
      <circle cx="207" cy="82" r="7" fill={accent} />
      <text x="218" y="76" fill="#f3f3ff" fontFamily="var(--font-mono)" fontSize="12">
        Week 7
      </text>
    </svg>
  </div>
);
