import React, { useSyncExternalStore } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { dismissToast, getToasts, subscribeToToasts, type AppToast, type ToastTone } from '@/app/components/ui/notify';

interface ToastToneStyle {
  accent: string;
  glow: string;
  icon: string;
  label: string;
  progress: string;
}

const toneStyles: Record<ToastTone, ToastToneStyle> = {
  error: {
    accent: 'bg-danger text-background shadow-[0_0_24px_rgba(240,107,107,0.32)]',
    glow: 'from-danger/24 via-danger/7',
    icon: '!',
    label: 'Error',
    progress: 'bg-danger',
  },
  info: {
    accent: 'bg-[#7ea0ff] text-background shadow-[0_0_24px_rgba(126,160,255,0.28)]',
    glow: 'from-[#7ea0ff]/22 via-[#7ea0ff]/7',
    icon: 'i',
    label: 'Info',
    progress: 'bg-[#7ea0ff]',
  },
  success: {
    accent: 'bg-lighterGreen text-background shadow-[0_0_24px_rgba(82,201,137,0.3)]',
    glow: 'from-lighterGreen/22 via-lighterGreen/7',
    icon: '✓',
    label: 'Success',
    progress: 'bg-lighterGreen',
  },
  warning: {
    accent: 'bg-warn text-background shadow-[0_0_24px_rgba(240,168,77,0.3)]',
    glow: 'from-warn/22 via-warn/7',
    icon: '!',
    label: 'Warning',
    progress: 'bg-warn',
  },
};

const emptyToasts: AppToast[] = [];

const ToastItem: React.FC<{ toast: AppToast }> = ({ toast }) => {
  const prefersReducedMotion = useReducedMotion();
  const tone = toneStyles[toast.tone];
  const role = toast.tone === 'error' ? 'alert' : 'status';

  return (
    <motion.li
      layout
      role={role}
      initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: 28, y: -12, scale: 0.96, filter: 'blur(6px)' }}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: 18, y: -6, scale: 0.98, filter: 'blur(4px)' }}
      transition={{ type: 'spring', duration: 0.34, bounce: 0 }}
      className="pointer-events-auto relative w-92 max-w-[calc(100vw-2rem)] overflow-hidden rounded-[14px] bg-container/92 font-sans text-offwhite shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_0_0_1px_rgba(255,255,255,0.08),0_18px_55px_rgba(0,0,0,0.42)] backdrop-blur-xl"
    >
      <span className={`pointer-events-none absolute inset-0 bg-linear-to-br ${tone.glow} to-transparent`} />
      <span className="pointer-events-none absolute inset-x-3 top-0 h-px bg-linear-to-r from-transparent via-offwhite/22 to-transparent" />
      <div className="relative flex min-h-16 items-start gap-3 px-3.5 py-3.5">
        <span
          aria-hidden="true"
          className={`flex size-8 shrink-0 items-center justify-center rounded-[10px] text-[10px] leading-none font-bold tracking-[0.08em] uppercase ${tone.accent}`}
        >
          {tone.icon}
        </span>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-[11px] leading-none font-semibold tracking-[0.12em] text-lightGrey uppercase">
            {tone.label}
          </p>
          <p className="mt-1.5 text-sm leading-snug font-semibold text-pretty text-offwhite">{toast.message}</p>
        </div>
        <motion.button
          type="button"
          aria-label="Dismiss notification"
          whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
          className="relative -mt-1 -mr-1 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-[10px] text-lightGrey transition-[background-color,color] duration-150 ease-[cubic-bezier(0.2,0,0,1)] hover:bg-offwhite/10 hover:text-offwhite"
          onClick={() => dismissToast(toast.id)}
        >
          <span aria-hidden="true" className="text-lg leading-none">
            ×
          </span>
        </motion.button>
      </div>
      <motion.span
        aria-hidden="true"
        className={`absolute right-0 bottom-0 left-0 h-0.5 origin-left ${tone.progress}`}
        initial={{ scaleX: 1, opacity: 0.9 }}
        animate={{ scaleX: 0, opacity: 0.35 }}
        transition={{ duration: toast.durationMs / 1000, ease: 'linear' }}
      />
    </motion.li>
  );
};

export const AppToaster: React.FC = () => {
  const toasts = useSyncExternalStore(subscribeToToasts, getToasts, () => emptyToasts);

  return (
    <ol
      aria-live="polite"
      aria-relevant="additions removals"
      className="pointer-events-none fixed top-21 right-6 z-1000 flex max-w-[calc(100vw-2rem)] flex-col gap-2.5"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </ol>
  );
};
