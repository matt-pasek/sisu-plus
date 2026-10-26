import React from 'react';
import type { TFunction } from 'i18next';
import { NotificationTypeIcon } from '@/app/components/ui/notifications/NotificationTypeIcon.comp';
import { NOTIFICATION_TONE } from '@/app/components/ui/notifications/notificationTone.const';
import { DeliveryModePicker } from '@/app/controlCenter/DeliveryModePicker.comp';
import type { NotificationDeliveryMode } from '@/app/types/NotificationDeliveryMode.type';
import type { NotificationType } from '@/app/types/NotificationType.type';

interface Props {
  type: NotificationType;
  mode: NotificationDeliveryMode;
  onModeChange: (mode: NotificationDeliveryMode) => void;
  t: TFunction<'translation', 'controlCenter'>;
  children?: React.ReactNode;
}

export const NotificationTypeRow: React.FC<Props> = ({ type, mode, onModeChange, t, children }) => {
  const title = t(`notifications.types.${type}.title`);
  return (
    <section className="rounded-2xl bg-container p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]">
      <div className="flex items-start gap-3">
        <span
          className={`flex size-7 shrink-0 items-center justify-center rounded-md bg-offwhite/5 ${NOTIFICATION_TONE[type]}`}
        >
          <NotificationTypeIcon type={type} className="size-3.5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-offwhite">{title}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-pretty text-lightGrey">
            {t(`notifications.types.${type}.body`)}
          </p>
        </div>
        <div className="self-center">
          <DeliveryModePicker label={title} value={mode} onChange={onModeChange} t={t} />
        </div>
      </div>
      {children && <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 pl-10">{children}</div>}
    </section>
  );
};
