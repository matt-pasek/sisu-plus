import { useEffect } from 'react';
import type { CalendarView } from '../types';

interface Handlers {
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onEscape: () => void;
  onView: (view: CalendarView) => void;
}

const VIEW_KEYS: Record<string, CalendarView> = { d: 'day', w: 'week', m: 'month', y: 'year' };

const isTyping = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

export const useCalendarKeyboard = ({ onPrevious, onNext, onToday, onEscape, onView }: Handlers): void => {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onEscape();
        return;
      }
      // The app lives in a shadow root, so event.target is retargeted to the host; the path holds the real element.
      if (isTyping(event.composedPath()[0] ?? event.target) || event.metaKey || event.ctrlKey || event.altKey) return;
      const key = event.key.toLowerCase();
      if (event.key === 'ArrowLeft') onPrevious();
      else if (event.key === 'ArrowRight') onNext();
      else if (key === 't') onToday();
      else if (VIEW_KEYS[key]) onView(VIEW_KEYS[key]);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onPrevious, onNext, onToday, onEscape, onView]);
};
