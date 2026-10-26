import React from 'react';
import type { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import type { QueuedInAppNotification } from '@/background/notifications/types';
import { NotificationTypeIcon } from './NotificationTypeIcon.comp';
import { NOTIFICATION_TONE } from './notificationTone.const';

type Translate = ReturnType<typeof useTranslationWithPrefix>['t'];

interface Props {
  item: QueuedInAppNotification;
  t: Translate;
}

const formatRelativeTime = (timestamp: number, t: Translate): string => {
  const minutes = Math.floor((Date.now() - timestamp) / 60_000);
  if (minutes < 1) return t('relative.justNow');
  if (minutes < 60) return t('relative.minutesAgo', { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t('relative.hoursAgo', { count: hours });
  return t('relative.daysAgo', { count: Math.floor(hours / 24) });
};

export const NotificationRow: React.FC<Props> = ({ item, t }) => (
  <li className="flex gap-3 px-3.5 py-3">
    <span
      className={`mt-px flex size-7 shrink-0 items-center justify-center rounded-md bg-offwhite/5 ${NOTIFICATION_TONE[item.type] ?? 'text-lightGrey'}`}
    >
      <NotificationTypeIcon type={item.type} className="size-3.5" />
    </span>
    <div className="min-w-0 flex-1">
      <div className="flex items-baseline justify-between gap-3">
        <p className="truncate text-[13px] font-medium text-offwhite">{item.title}</p>
        <time
          className="shrink-0 text-[11px] text-lightGrey tabular-nums"
          dateTime={new Date(item.createdAt).toISOString()}
        >
          {formatRelativeTime(item.createdAt, t)}
        </time>
      </div>
      <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-pretty text-lightGrey">{item.body}</p>
    </div>
  </li>
);
