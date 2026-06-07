import React, { useEffect, useState } from 'react';
import { dismissToast, getToasts, subscribeToToasts, type AppToast, type ToastTone } from '@/app/components/ui/notify';

type ToastPhase = 'enter' | 'exit' | 'present';

interface RenderedToast extends AppToast {
  phase: ToastPhase;
}

const toneClass: Record<ToastTone, { dot: string; ring: string }> = {
  error: {
    dot: 'bg-danger',
    ring: 'shadow-[0_0_0_1px_rgba(240,107,107,0.22),0_14px_44px_rgba(0,0,0,0.38)]',
  },
  info: {
    dot: 'bg-[#7ea0ff]',
    ring: 'shadow-[0_0_0_1px_rgba(126,160,255,0.18),0_14px_44px_rgba(0,0,0,0.38)]',
  },
  success: {
    dot: 'bg-lighterGreen',
    ring: 'shadow-[0_0_0_1px_rgba(82,201,137,0.2),0_14px_44px_rgba(0,0,0,0.38)]',
  },
  warning: {
    dot: 'bg-warn',
    ring: 'shadow-[0_0_0_1px_rgba(240,168,77,0.22),0_14px_44px_rgba(0,0,0,0.38)]',
  },
};

const exitMs = 170;

const mergeToasts = (current: RenderedToast[], incoming: AppToast[]): RenderedToast[] => {
  const incomingIds = new Set(incoming.map((toast) => toast.id));
  const currentById = new Map(current.map((toast) => [toast.id, toast]));

  const next = incoming.map((toast): RenderedToast => {
    const existing = currentById.get(toast.id);
    return existing
      ? { ...toast, phase: existing.phase === 'exit' ? 'enter' : 'present' }
      : { ...toast, phase: 'enter' };
  });

  const exiting = current.filter((toast) => !incomingIds.has(toast.id) && toast.phase !== 'exit');
  return [...next, ...exiting.map((toast) => ({ ...toast, phase: 'exit' as const }))];
};

const ToastItem: React.FC<{ toast: RenderedToast }> = ({ toast }) => {
  const tone = toneClass[toast.tone];
  const exiting = toast.phase === 'exit';

  return (
    <li
      className={`relative flex min-h-13 w-90 max-w-[calc(100vw-2rem)] origin-top-right overflow-hidden rounded-[10px] bg-container/95 font-sans text-offwhite backdrop-blur-md will-change-transform ${exiting ? 'animate-[sisu-toast-exit_170ms_cubic-bezier(0.5,0,0.75,0)_forwards]' : 'animate-[sisu-toast-enter_260ms_cubic-bezier(0.16,1,0.3,1)]'} ${tone.ring}`}
      role={toast.tone === 'error' ? 'alert' : 'status'}
    >
      <div className="flex w-full items-start gap-3 px-4 py-3">
        <span className={`mt-1.5 block size-2 shrink-0 rounded-full ${tone.dot}`} />
        <p className="min-w-0 flex-1 text-sm leading-snug font-semibold text-pretty">{toast.message}</p>
        <button
          type="button"
          aria-label="Dismiss notification"
          className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md bg-container2 text-lightGrey transition-[background-color,color,transform] duration-150 ease-[cubic-bezier(0.25,1,0.5,1)] hover:bg-offwhite/10 hover:text-offwhite active:scale-95"
          onClick={() => dismissToast(toast.id)}
        >
          <span aria-hidden="true" className="text-base leading-none">
            ×
          </span>
        </button>
      </div>
      {!exiting && (
        <span
          className={`absolute right-0 bottom-0 left-0 h-px origin-left animate-[sisu-toast-life_var(--toast-duration)_linear_forwards] ${tone.dot}`}
          style={{ '--toast-duration': `${toast.durationMs}ms` } as React.CSSProperties}
        />
      )}
    </li>
  );
};

export const AppToaster: React.FC = () => {
  const [toasts, setToasts] = useState<RenderedToast[]>(() =>
    getToasts().map((toast) => ({ ...toast, phase: 'present' })),
  );

  useEffect(
    () =>
      subscribeToToasts(() => {
        setToasts((current) => mergeToasts(current, getToasts()));
      }),
    [],
  );

  useEffect(() => {
    if (!toasts.some((toast) => toast.phase === 'exit')) return undefined;
    const timeout = window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.phase !== 'exit'));
    }, exitMs);
    return () => window.clearTimeout(timeout);
  }, [toasts]);

  if (toasts.length === 0) return null;

  return (
    <ol className="pointer-events-none fixed top-21 right-6 z-1000 flex max-w-[calc(100vw-2rem)] flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto grid transition-[grid-template-rows,opacity,transform,filter] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${toast.phase === 'exit' ? '-translate-y-1 grid-rows-[0fr] opacity-0 blur-[1px]' : 'blur-0 translate-y-0 grid-rows-[1fr] opacity-100'}`}
        >
          <div className="min-h-0 overflow-hidden">
            <ToastItem toast={toast} />
          </div>
        </div>
      ))}
    </ol>
  );
};
