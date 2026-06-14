import type { NotificationDeliveryMode } from '@/app/types/NotificationDeliveryMode.type';
import type { NotificationType } from '@/app/types/NotificationType.type';

export interface NotificationPrefs {
  delivery: Record<NotificationType, NotificationDeliveryMode>;
  registrationOpenLeadMinutes: number;
}
