import React from 'react';
import type { NotificationType } from '@/app/types/NotificationType.type';

interface Props {
  type: NotificationType;
  className?: string;
}

const ICON_PATHS: Record<NotificationType, React.ReactNode> = {
  'class-reminder': (
    <>
      <rect height="15" rx="2" width="16" x="4" y="5.5" />
      <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  'moodle-deadline': (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  'registration-close': (
    <>
      <path
        d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
        strokeLinejoin="round"
      />
      <path d="M12 9v4M12 17h.01" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  'registration-open': (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  'sisu-sync': (
    <>
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M21 3v5h-5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M3 21v-5h5" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
};

export const NotificationTypeIcon: React.FC<Props> = ({ type, className = 'size-4' }) => (
  <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    {ICON_PATHS[type] ?? ICON_PATHS['sisu-sync']}
  </svg>
);
