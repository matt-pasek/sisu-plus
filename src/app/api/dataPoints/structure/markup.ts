export const stripMarkup = (value: string | null): string | null =>
  value
    ?.replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim() || null;
