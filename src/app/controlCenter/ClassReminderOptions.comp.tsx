import React from 'react';
import type { TFunction } from 'i18next';
import type { ClassReminderScope } from '@/app/types/ClassReminderScope.type';
import type { NotificationPrefs } from '@/app/types/NotificationPrefs.type';
import { CLASS_REMINDER_LEADS, isClassReminderLead } from '@/shared/notifications/normalizeNotificationPrefs';

type ReminderPatch = Partial<Pick<NotificationPrefs, 'classReminderLeadMinutes' | 'classReminderScope'>>;

interface Props {
  notificationPrefs: NotificationPrefs;
  onChange: (patch: ReminderPatch) => void;
  t: TFunction<'translation', 'controlCenter'>;
}

const SCOPES: ClassReminderScope[] = ['all', 'exams'];
const SELECT_CLASS =
  'h-9 cursor-pointer appearance-none rounded-xl border-0 bg-background pr-7 pl-3 text-xs font-semibold text-offwhite shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] outline-none';

export const ClassReminderOptions: React.FC<Props> = ({ notificationPrefs, onChange, t }) => (
  <div className="mt-3 flex flex-wrap gap-3 pl-5">
    <label className="flex items-center gap-2 text-xs text-lightGrey">
      {t('notifications.classReminders.leadTitle')}
      <select
        className={SELECT_CLASS}
        value={notificationPrefs.classReminderLeadMinutes}
        onChange={(event) => {
          const lead = Number(event.target.value);
          if (isClassReminderLead(lead)) onChange({ classReminderLeadMinutes: lead });
        }}
      >
        {CLASS_REMINDER_LEADS.map((lead) => (
          <option key={lead} value={lead}>
            {t(`notifications.classReminders.leadOptions.${lead}`)}
          </option>
        ))}
      </select>
    </label>
    <label className="flex items-center gap-2 text-xs text-lightGrey">
      {t('notifications.classReminders.scopeTitle')}
      <select
        className={SELECT_CLASS}
        value={notificationPrefs.classReminderScope}
        onChange={(event) => {
          const scope = SCOPES.find((item) => item === event.target.value);
          if (scope) onChange({ classReminderScope: scope });
        }}
      >
        {SCOPES.map((scope) => (
          <option key={scope} value={scope}>
            {t(`notifications.classReminders.scope.${scope}`)}
          </option>
        ))}
      </select>
    </label>
  </div>
);
