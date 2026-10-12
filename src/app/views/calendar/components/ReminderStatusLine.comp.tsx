import React from 'react';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import type { ReminderStatus } from '../types';

interface Props {
  status: ReminderStatus;
  onSetUp: () => void;
}

export const ReminderStatusLine: React.FC<Props> = ({ status, onSetUp }) => {
  const { t } = useTranslationWithPrefix('views.calendar');
  const isOff = status.kind === 'off';
  const details =
    status.kind === 'off'
      ? [t('reminders.off')]
      : [
          t('reminders.lead', { minutes: status.leadMinutes }),
          ...(status.untilLabel ? [t('reminders.until', { date: status.untilLabel })] : []),
        ];
  return (
    <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 border-t border-border/60 pt-2 pb-1.5 text-[12px] text-lightGrey">
      <span className="font-medium text-offwhite">{t('reminders.label')}</span>
      {details.map((detail) => (
        <React.Fragment key={detail}>
          <span aria-hidden="true">·</span>
          <span>{detail}</span>
        </React.Fragment>
      ))}
      <span aria-hidden="true">·</span>
      <button
        type="button"
        onClick={onSetUp}
        aria-label={isOff ? t('reminders.setUpAria') : t('reminders.changeAria')}
        className="cursor-pointer font-semibold text-lighterGreen underline-offset-2 hover:underline"
      >
        {isOff ? t('reminders.setUp') : t('reminders.change')}
      </button>
    </p>
  );
};
