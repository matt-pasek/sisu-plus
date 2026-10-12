import { useEffect } from 'react';
import type { CalendarView } from '../types';
import { isNewNoteKey, viewForKey } from '../util';

interface Handlers {
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onEscape: () => void;
  onView: (view: CalendarView) => void;
  onNewNote: () => void;
}

const isTyping = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

export const useCalendarKeyboard = ({ onPrevious, onNext, onToday, onEscape, onView, onNewNote }: Handlers): void => {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onEscape();
        return;
      }
      // The app lives in a shadow root, so event.target is retargeted to the host; the path holds the real element.
      if (isTyping(event.composedPath()[0] ?? event.target) || event.metaKey || event.ctrlKey || event.altKey) return;
      const view = viewForKey(event.key, event.repeat);
      if (event.key === 'ArrowLeft') onPrevious();
      else if (event.key === 'ArrowRight') onNext();
      else if (event.key.toLowerCase() === 't') onToday();
      else if (isNewNoteKey(event.key, event.repeat)) onNewNote();
      else if (view) onView(view);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onPrevious, onNext, onToday, onEscape, onView, onNewNote]);
};
