import type { ClassReminderLead } from '@/app/types/ClassReminderLead.type';

export type ReminderStatus =
  | { kind: 'off' }
  | { kind: 'on'; leadMinutes: ClassReminderLead; untilLabel: string | null };
