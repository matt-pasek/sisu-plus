import React from 'react';
import { Button } from '@/app/components/ui/Button.comp';
import { TIMELINE_COLORS } from '@/app/views/timeline/components/timelineUtils';

interface Props {
  moduleNames: string[];
}

export const TimelineToolbar: React.FC<Props> = ({ moduleNames }) => (
  <header className="flex h-12 shrink-0 items-center gap-4 border-b border-solid border-border bg-container px-6">
    <Button
      disabled
      variant="accent"
      icon={
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-3">
          <path
            fillRule="evenodd"
            d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z"
            clipRule="evenodd"
          />
        </svg>
      }
    >
      Add Course
    </Button>
    <div className="h-8 w-px bg-border" />
    <Button disabled>Auto-schedule</Button>

    <div className="ml-2 flex min-w-0 items-center gap-5">
      {moduleNames.slice(0, 6).map((name, index) => (
        <div key={name} className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-lightGrey">
          <span className="size-2 shrink-0 rounded-sm" style={{ backgroundColor: TIMELINE_COLORS[index] }} />
          <span className="max-w-fit truncate">{name}</span>
        </div>
      ))}
    </div>
  </header>
);
