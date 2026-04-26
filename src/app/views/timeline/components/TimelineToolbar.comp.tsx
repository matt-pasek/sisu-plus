import React from 'react';
import { Button } from '@/app/components/ui/Button.comp';
import { TIMELINE_COLORS } from '@/app/views/timeline/components/timelineUtils';

interface Props {
  moduleNames: string[];
  autoScheduleDisabled?: boolean;
  autoSchedulePending?: boolean;
  confirmDisabled?: boolean;
  confirmPending?: boolean;
  onAutoSchedule?: () => void;
  onConfirm?: () => void;
  onReset?: () => void;
  pendingChangesCount?: number;
  resetDisabled?: boolean;
  validationIssueCount?: number;
}

export const TimelineToolbar: React.FC<Props> = ({
  moduleNames,
  autoScheduleDisabled = false,
  autoSchedulePending = false,
  confirmDisabled = true,
  confirmPending = false,
  onAutoSchedule,
  onConfirm,
  onReset,
  pendingChangesCount = 0,
  resetDisabled = true,
  validationIssueCount = 0,
}) => (
  <header className="flex min-h-14 shrink-0 items-center gap-3 border-b border-solid border-border bg-container px-6 shadow-[0_1px_0_rgba(255,255,255,0.03)]">
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

    <div className="ml-2 flex min-w-0 items-center gap-5">
      {moduleNames.slice(0, 6).map((name, index) => (
        <div
          key={name}
          className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-lightGrey transition-[opacity] duration-200"
        >
          <span className="size-2 shrink-0 rounded-sm" style={{ backgroundColor: TIMELINE_COLORS[index] }} />
          <span className="max-w-fit truncate">{name}</span>
        </div>
      ))}
    </div>

    <div className="ml-auto flex shrink-0 items-center gap-2">
      <div
        className={`flex min-h-8 items-center gap-2 rounded-lg border px-3 text-xs font-semibold tabular-nums transition-[opacity,scale,filter,border-color,background-color] duration-200 ease-[cubic-bezier(0.2,0,0,1)] ${
          pendingChangesCount > 0
            ? 'blur-0 scale-100 border-accent/30 bg-accent/10 text-accent opacity-100'
            : 'pointer-events-none scale-[0.25] border-border bg-container2 text-lightGrey opacity-0 blur-[4px]'
        }`}
      >
        <span className="size-1.5 rounded-full bg-accent" />
        {pendingChangesCount} unsaved
      </div>
      <div
        className={`flex min-h-8 items-center gap-2 rounded-lg border px-3 text-xs font-semibold tabular-nums transition-[opacity,scale,filter,border-color,background-color] duration-200 ease-[cubic-bezier(0.2,0,0,1)] ${
          validationIssueCount > 0
            ? 'blur-0 scale-100 border-amber-300/40 bg-amber-300/10 text-amber-100 opacity-100'
            : 'pointer-events-none scale-[0.25] border-border bg-container2 text-lightGrey opacity-0 blur-[4px]'
        }`}
      >
        <span className="size-1.5 rounded-full bg-amber-300" />
        {validationIssueCount} issue{validationIssueCount === 1 ? '' : 's'}
      </div>
      <Button disabled={autoScheduleDisabled || autoSchedulePending} onClick={onAutoSchedule}>
        {autoSchedulePending ? 'Scheduling...' : 'Auto-schedule'}
      </Button>
      <Button disabled={confirmDisabled || confirmPending} variant="accent" onClick={onConfirm}>
        {confirmPending ? 'Confirming...' : 'Confirm'}
      </Button>
      <Button
        ariaLabel="Reset timeline changes"
        className="min-w-10 px-2.5"
        disabled={resetDisabled || confirmPending}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-3.5">
            <path
              fillRule="evenodd"
              d="M4.755 10.059a.75.75 0 0 1 .986.394 6.75 6.75 0 1 0 2.017-2.694h2.492a.75.75 0 0 1 0 1.5H5.75A.75.75 0 0 1 5 8.509v-4.5a.75.75 0 0 1 1.5 0v2.52a8.25 8.25 0 1 1-2.139 3.924.75.75 0 0 1 .394-.394Z"
              clipRule="evenodd"
            />
          </svg>
        }
        onClick={onReset}
        title="Reset timeline changes"
      />
    </div>
  </header>
);
