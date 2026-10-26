export type ToastTone = 'error' | 'info' | 'success' | 'warning';

export interface ToastAction {
  label: string;
  onAction: () => void;
}

export interface AppToast {
  action?: ToastAction;
  durationMs: number;
  id: number;
  message: string;
  subtitle?: string;
  tone: ToastTone;
}

interface ShowOptions {
  action?: ToastAction;
  durationMs?: number;
  subtitle?: string;
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

const show = (tone: ToastTone, message: string, options: ShowOptions = {}) => {
  const id = nextToastId;
  nextToastId += 1;
  const durationMs = options.durationMs ?? (tone === 'error' ? 6200 : 3800);

  toasts = [
    { action: options.action, durationMs, id, message, subtitle: options.subtitle, tone },
    ...toasts.slice(0, 3),
  ];
  emit();
  setTimeout(() => dismiss(id), durationMs);
};

export const subscribeToToasts = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const getToasts = (): AppToast[] => toasts;

export const dismissToast = dismiss;

export const runToastAction = (id: number) => {
  const toast = toasts.find((candidate) => candidate.id === id);
  if (!toast?.action) return;
  dismiss(id);
  toast.action.onAction();
};

export const notify = {
  error: (message: string) => {
    show('error', message);
  },
  info: (message: string) => {
    show('info', message);
  },
  notification: (title: string, body: string) => {
    show('info', title, { subtitle: body });
  },
  success: (message: string) => {
    show('success', message);
  },
  undoable: (message: string, action: ToastAction & { durationMs: number }) => {
    show('success', message, {
      action: { label: action.label, onAction: action.onAction },
      durationMs: action.durationMs,
    });
  },
  warning: (message: string) => {
    show('warning', message);
  },
};
