export interface AccentStyles {
  accent: string;
  subtle: string;
  border: string;
  glow: string;
}

export const getAccentWash = (accent: string, alpha: number): string => {
  const normalized = accent.replace('#', '');
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const getAccentStyles = (accent: string): AccentStyles => ({
  accent,
  subtle: getAccentWash(accent, 0.14),
  border: getAccentWash(accent, 0.4),
  glow: getAccentWash(accent, 0.55),
});
