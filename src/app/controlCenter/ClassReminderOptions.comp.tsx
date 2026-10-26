import React from 'react';
import type { TFunction } from 'i18next';
import { SettingsSelect } from '@/app/controlCenter/SettingsSelect.comp';
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

export const ClassReminderOptions: React.FC<Props> = ({ notificationPrefs, onChange, t }) => (
  <>
    <label className="flex items-center gap-2 text-xs text-lightGrey">
      {t('notifications.classReminders.leadTitle')}
      <SettingsSelect
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
      </SettingsSelect>
    </label>
    <label className="flex items-center gap-2 text-xs text-lightGrey">
      {t('notifications.classReminders.scopeTitle')}
      <SettingsSelect
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
      </SettingsSelect>
    </label>
  </>
);
