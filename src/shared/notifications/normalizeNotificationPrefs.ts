import type { ClassReminderLead } from '@/app/types/ClassReminderLead.type';
import type { ClassReminderScope } from '@/app/types/ClassReminderScope.type';
import type { NotificationPrefs } from '@/app/types/NotificationPrefs.type';
import { DEFAULT_NOTIFICATION_PREFS } from '@/app/types/prefs';
import type { StoredNotificationPrefs } from '@/app/types/StoredNotificationPrefs.type';

export const CLASS_REMINDER_LEADS: readonly ClassReminderLead[] = [5, 10, 15, 30];

export const isClassReminderLead = (value: unknown): value is ClassReminderLead =>
  CLASS_REMINDER_LEADS.some((lead) => lead === value);

const isClassReminderScope = (value: unknown): value is ClassReminderScope => value === 'all' || value === 'exams';

export const normalizeNotificationPrefs = (stored: StoredNotificationPrefs | null | undefined): NotificationPrefs => {
  const registrationLead = stored?.registrationOpenLeadMinutes;
  const classLead = stored?.classReminderLeadMinutes;
  const classScope = stored?.classReminderScope;
  return {
    delivery: { ...DEFAULT_NOTIFICATION_PREFS.delivery, ...(stored?.delivery ?? {}) },
    registrationOpenLeadMinutes:
      typeof registrationLead === 'number' ? registrationLead : DEFAULT_NOTIFICATION_PREFS.registrationOpenLeadMinutes,
    classReminderLeadMinutes: isClassReminderLead(classLead)
      ? classLead
      : DEFAULT_NOTIFICATION_PREFS.classReminderLeadMinutes,
    classReminderScope: isClassReminderScope(classScope) ? classScope : DEFAULT_NOTIFICATION_PREFS.classReminderScope,
  };
};
