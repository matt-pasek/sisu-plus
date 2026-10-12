import type { DeadlineStatus } from '@/app/api/dataPoints/calendar/types';
import type { LayerPrefsPatch } from './LayerPrefsPatch.type';
import type { ReminderStatus } from './ReminderStatus.type';

export interface LayerControls {
  showCancelled: boolean;
  showNotes: boolean;
  showDeadlines: boolean;
  notesFailed: boolean;
  deadlineStatus: DeadlineStatus;
  onChange: (patch: LayerPrefsPatch) => void;
  onRetryNotes: () => void;
  onRetryDeadlines: () => void;
  onConnectMoodle: () => void;
  reminders: ReminderStatus;
  onSetUpReminders: () => void;
}
