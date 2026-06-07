export type ToastTone = 'error' | 'info' | 'success' | 'warning';

export interface AppToast {
  durationMs: number;
  id: number;
  message: string;
  tone: ToastTone;
}

type Listener = () => void;

const listeners = new Set<Listener>();
let nextToastId = 1;
let toasts: AppToast[] = [];

const emit = () => {
  listeners.forEach((listener) => listener());
};

const dismiss = (id: number) => {
  toasts = toasts.filter((toast) => toast.id !== id);
  emit();
};

const show = (tone: ToastTone, message: string) => {
  const id = nextToastId;
  nextToastId += 1;
  const durationMs = tone === 'error' ? 6200 : 3800;

  toasts = [{ durationMs, id, message, tone }, ...toasts.slice(0, 3)];
  emit();
  window.setTimeout(() => dismiss(id), durationMs);
};

export const subscribeToToasts = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const getToasts = (): AppToast[] => toasts;

export const dismissToast = dismiss;

export const notify = {
  error: (message: string) => {
    show('error', message);
  },
  info: (message: string) => {
    show('info', message);
  },
  success: (message: string) => {
    show('success', message);
  },
  warning: (message: string) => {
    show('warning', message);
  },
};
