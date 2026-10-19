import type { NotificationDeliveryMode } from '@/app/types/NotificationDeliveryMode.type';
import type { NotificationType } from '@/app/types/NotificationType.type';

const CLASS_REMINDER_ID_PREFIX = 'sisu-plus-notification:class-reminder:';

// A missed "in 10 minutes" is noise by the time anyone opens the bell.
export const shouldQueueUnread = (
  type: NotificationType,
  mode: NotificationDeliveryMode,
  visibleTabCount: number,
  desktopSent: boolean,
): boolean =>
  type !== 'class-reminder' && (mode === 'in-app' || mode === 'both') && visibleTabCount === 0 && !desktopSent;

export const notificationTargetPath = (notificationId: string): string =>
  notificationId.startsWith(CLASS_REMINDER_ID_PREFIX) ? '/student/calendar' : '/student/frontpage';
