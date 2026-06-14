import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useNotificationCache } from '@/app/hooks/useNotificationCache';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import type { NotificationType } from '@/app/types/NotificationType.type';
import type { QueuedInAppNotification } from '@/background/notifications/types';

function BellIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="M15.5 18.25a3.5 3.5 0 0 1-7 0" strokeLinecap="round" />
      <path
        d="M18.5 16.75h-13c1.15-1.25 1.8-2.75 1.8-4.5V10a4.7 4.7 0 0 1 9.4 0v2.25c0 1.75.65 3.25 1.8 4.5Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TypeIcon({ type }: { type: NotificationType }) {
  if (type === 'moodle-deadline') {
    return (
      <svg
        aria-hidden="true"
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === 'registration-close') {
    return (
      <svg
        aria-hidden="true"
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        viewBox="0 0 24 24"
      >
        <path
          d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
          strokeLinejoin="round"
        />
        <path d="M12 9v4M12 17h.01" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === 'registration-open') {
    return (
      <svg
        aria-hidden="true"
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M21 3v5h-5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M3 21v-5h5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const TYPE_STYLES: Record<NotificationType, { accent: string; glow: string; label: string }> = {
  'moodle-deadline': {
    accent: 'bg-blue-500 text-background shadow-[0_0_16px_rgba(59,130,246,0.35)]',
    glow: 'from-blue-500/12 via-blue-500/4',
    label: 'Moodle',
  },
  'registration-close': {
    accent: 'bg-danger text-background shadow-[0_0_16px_rgba(240,107,107,0.35)]',
    glow: 'from-danger/12 via-danger/4',
    label: 'Closes',
  },
  'registration-open': {
    accent: 'bg-lighterGreen text-background shadow-[0_0_16px_rgba(82,201,137,0.35)]',
    glow: 'from-lighterGreen/12 via-lighterGreen/4',
    label: 'Opens',
  },
  'sisu-sync': {
    accent: 'bg-warn text-background shadow-[0_0_16px_rgba(240,168,77,0.35)]',
    glow: 'from-warn/12 via-warn/4',
    label: 'Sisu',
  },
};

const formatRelativeTime = (timestamp: number, t: ReturnType<typeof useTranslationWithPrefix>['t']): string => {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return t('relative.justNow');
  if (minutes < 60) return t('relative.minutesAgo', { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t('relative.hoursAgo', { count: hours });
  return t('relative.daysAgo', { count: Math.floor(hours / 24) });
};

function NotificationRow({
  item,
  t,
}: {
  item: QueuedInAppNotification;
  t: ReturnType<typeof useTranslationWithPrefix>['t'];
}) {
  const styles = TYPE_STYLES[item.type] ?? {
    accent: 'bg-offwhite/20 text-offwhite',
    glow: 'from-offwhite/8 via-offwhite/2',
    label: 'Info',
  };
  return (
    <div className="relative overflow-hidden border-b border-white/[0.04] px-3 py-3 last:border-b-0">
      <span className={`pointer-events-none absolute inset-0 bg-linear-to-br ${styles.glow} to-transparent`} />
      <span className="pointer-events-none absolute inset-x-3 top-0 h-px bg-linear-to-r from-transparent via-offwhite/10 to-transparent" />
      {!item.read && (
        <span className="absolute top-1/2 left-1 size-1.5 -translate-y-1/2 rounded-full bg-lighterGreen" />
      )}
      <div className="relative flex gap-3">
        <span className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-[10px] ${styles.accent}`}>
          <TypeIcon type={item.type} />
        </span>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-[10px] leading-none font-semibold tracking-[0.12em] text-lightGrey uppercase">
            {styles.label}
          </p>
          <p className="mt-1 text-sm leading-snug font-semibold text-offwhite">{item.title}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-lightGrey">{item.body}</p>
          <p className="mt-1.5 text-[10px] text-lightGrey/40">{formatRelativeTime(item.createdAt, t)}</p>
        </div>
      </div>
    </div>
  );
}

export const NavbarNotificationBell: React.FC = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { unread, unreadCount } = useNotificationCache();
  const { t } = useTranslationWithPrefix('components.navbar.notificationBell');

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const markAllRead = () => {
    chrome.runtime.sendMessage({ type: 'MARK_ALL_NOTIFICATIONS_READ' }, () => undefined);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        aria-label={t('aria')}
        className="relative flex size-8 cursor-pointer items-center justify-center rounded-xl bg-container text-lightGrey shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)] transition-[background-color,color] duration-150 hover:bg-container2 hover:text-offwhite"
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex min-w-4 items-center justify-center rounded-full border border-container bg-warn px-1 py-px text-[9px] leading-none font-bold text-background shadow-[0_0_10px_rgba(240,168,77,0.4)]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97, transition: { duration: 0.15 } }}
            transition={{ type: 'spring', duration: 0.25, bounce: 0 }}
            style={{ transformOrigin: 'top right' }}
            className="absolute top-10 right-0 z-50 w-80 overflow-hidden rounded-2xl bg-container text-offwhite shadow-[0_16px_48px_rgba(0,0,0,0.45),inset_0_0_0_1px_rgba(255,255,255,0.08)]"
          >
            <div className="flex items-center justify-between border-b border-white/[0.06] px-3 py-2.5">
              <p className="text-xs font-semibold text-offwhite">{t('title')}</p>
              {unreadCount > 0 && (
                <button
                  className="cursor-pointer text-[10px] font-semibold text-lightGrey/60 transition-colors duration-150 hover:text-lightGrey"
                  onClick={markAllRead}
                  type="button"
                >
                  {t('markAll')}
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {unread.length === 0 ? (
                <p className="px-3 py-6 text-center text-xs text-lightGrey/40">{t('empty')}</p>
              ) : (
                unread.map((item) => <NotificationRow key={item.id} item={item} t={t} />)
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
