import React, { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { BellIcon } from '@/app/components/ui/icons/BellIcon.comp';
import { NotificationRow } from '@/app/components/ui/notifications/NotificationRow.comp';
import { useNotificationCache } from '@/app/hooks/useNotificationCache';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';

export const NavbarNotificationBell: React.FC = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const shouldReduceMotion = useReducedMotion();
  const { unread, unreadCount } = useNotificationCache();
  const { t } = useTranslationWithPrefix('components.navbar.notificationBell');

  // Clicks inside the shadow root reach document retargeted to the host, so containment is read from the path.
  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event: PointerEvent) => {
      if (ref.current && event.composedPath().includes(ref.current)) return;
      setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const markAllRead = () => {
    chrome.runtime.sendMessage({ type: 'MARK_ALL_NOTIFICATIONS_READ' }, () => undefined);
  };

  const hidden = shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.98 };

  return (
    <div className="relative" ref={ref}>
      <button
        ref={buttonRef}
        aria-label={t('aria')}
        aria-expanded={open}
        aria-controls={panelId}
        className={`relative flex size-8 cursor-pointer items-center justify-center rounded-xl border border-border2 transition-[background-color,color,transform] duration-150 hover:bg-container2 hover:text-offwhite active:scale-[0.96] ${open ? 'bg-container2 text-offwhite' : 'bg-container text-lightGrey'}`}
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-lighterGreen px-1 text-[10px] leading-none font-semibold text-background tabular-nums ring-2 ring-container">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={panelId}
            role="dialog"
            aria-label={t('title')}
            initial={hidden}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ ...hidden, transition: { duration: 0.12 } }}
            transition={{ type: 'spring', duration: 0.2, bounce: 0 }}
            style={{ transformOrigin: 'top right' }}
            className="absolute top-10 right-0 z-50 w-80 overflow-hidden rounded-xl bg-container text-offwhite shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_16px_40px_rgba(0,0,0,0.4)]"
          >
            <header className="flex items-center justify-between gap-3 border-b border-border px-3.5 py-2.5">
              <div className="flex items-baseline gap-2">
                <h2 className="text-xs font-semibold text-offwhite">{t('title')}</h2>
                {unreadCount > 0 && <span className="text-[11px] text-lightGrey tabular-nums">{unreadCount}</span>}
              </div>
              {unreadCount > 0 && (
                <button
                  className="-mr-1.5 cursor-pointer rounded-md px-1.5 py-0.5 text-[11px] text-lightGrey transition-colors duration-150 hover:bg-offwhite/5 hover:text-offwhite"
                  onClick={markAllRead}
                  type="button"
                >
                  {t('markAll')}
                </button>
              )}
            </header>

            <div className="max-h-96 overflow-y-auto overscroll-contain">
              {unread.length === 0 ? (
                <p className="px-3.5 py-8 text-center text-xs text-lightGrey">{t('empty')}</p>
              ) : (
                <ul className="divide-y divide-border">
                  {unread.map((item) => (
                    <NotificationRow key={item.id} item={item} t={t} />
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
