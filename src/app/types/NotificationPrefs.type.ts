import type { ClassReminderLead } from '@/app/types/ClassReminderLead.type';
import type { ClassReminderScope } from '@/app/types/ClassReminderScope.type';
import type { NotificationDeliveryMode } from '@/app/types/NotificationDeliveryMode.type';
import type { NotificationType } from '@/app/types/NotificationType.type';

export interface NotificationPrefs {
  delivery: Record<NotificationType, NotificationDeliveryMode>;
  registrationOpenLeadMinutes: number;
  classReminderLeadMinutes: ClassReminderLead;
  classReminderScope: ClassReminderScope;
}
