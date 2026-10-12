import { useEffect } from 'react';
import type { CalendarView } from '../types';
import { shortcutFor } from '../util';

interface Handlers {
  editing: boolean;
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

export const useCalendarKeyboard = ({
  editing,
  onPrevious,
  onNext,
  onToday,
  onEscape,
  onView,
  onNewNote,
}: Handlers): void => {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onEscape();
        return;
      }
      // The app lives in a shadow root, so event.target is retargeted to the host; the path holds the real element.
      if (isTyping(event.composedPath()[0] ?? event.target) || event.metaKey || event.ctrlKey || event.altKey) return;
      const shortcut = shortcutFor(event.key, event.repeat, editing);
      if (!shortcut) return;
      if (shortcut.type === 'previous') onPrevious();
      else if (shortcut.type === 'next') onNext();
      else if (shortcut.type === 'today') onToday();
      else if (shortcut.type === 'view') onView(shortcut.view);
      else {
        // The editor focuses its title field during this keydown; without this the key would type an "n" into it.
        event.preventDefault();
        onNewNote();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [editing, onPrevious, onNext, onToday, onEscape, onView, onNewNote]);
};
