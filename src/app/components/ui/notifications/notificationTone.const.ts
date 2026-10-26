import type { NotificationType } from '@/app/types/NotificationType.type';

export const NOTIFICATION_TONE: Record<NotificationType, string> = {
  'class-reminder': 'text-offwhite/80',
  'moodle-deadline': 'text-warn',
  'registration-close': 'text-danger',
  'registration-open': 'text-lighterGreen',
  'sisu-sync': 'text-lightGrey',
};
