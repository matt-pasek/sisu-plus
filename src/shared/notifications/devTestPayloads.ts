import type { NotificationType } from '@/app/types/NotificationType.type';
import type { NotificationPayload } from '@/background/notifications/types';

export const DEV_TEST_NOTIFICATION_PAYLOADS: Record<NotificationType, NotificationPayload> = {
  'moodle-deadline': {
    body: 'Data Structures essay (CS-A1141) · due tomorrow 23:59',
    eventId: 'dev-test-moodle',
    source: 'moodle',
    title: 'Moodle deadline tomorrow',
    type: 'moodle-deadline',
  },
  'registration-close': {
    body: 'Algorithms and Data Structures closes for registration tomorrow.',
    eventId: 'dev-test-reg-close',
    source: 'sisu',
    title: 'Registration closes soon',
    type: 'registration-close',
  },
  'registration-open': {
    body: '3 courses open for registration.',
    eventId: 'dev-test-reg-open',
    source: 'sisu',
    title: 'Registrations open',
    type: 'registration-open',
  },
  'sisu-sync': {
    body: 'Open Sisu to refresh registration windows and course data.',
    eventId: 'dev-test-sisu-sync',
    source: 'sisu',
    title: 'Sisu+ needs a fresh sync',
    type: 'sisu-sync',
  },
};

export const isNotificationType = (value: unknown): value is NotificationType =>
  typeof value === 'string' && value in DEV_TEST_NOTIFICATION_PAYLOADS;
