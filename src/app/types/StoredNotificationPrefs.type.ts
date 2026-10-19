import type { NotificationDeliveryMode } from '@/app/types/NotificationDeliveryMode.type';
import type { NotificationType } from '@/app/types/NotificationType.type';

export interface StoredNotificationPrefs {
  delivery?: Partial<Record<NotificationType, NotificationDeliveryMode>>;
  registrationOpenLeadMinutes?: unknown;
  classReminderLeadMinutes?: unknown;
  classReminderScope?: unknown;
}
