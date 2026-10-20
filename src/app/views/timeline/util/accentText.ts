import type { AccentText } from '@/app/views/timeline/types';

export const ACCENT_MARK = '⁣';

export const splitAccent = (text: string, accent: string): AccentText => {
  const markIndex = text.indexOf(ACCENT_MARK);
  if (markIndex === -1) return { before: text, accent: '', after: '' };
  return { before: text.slice(0, markIndex), accent, after: text.slice(markIndex + ACCENT_MARK.length) };
};
