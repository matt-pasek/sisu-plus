import { pickLabel } from '@/app/api/resolvers/helpers/pickLabel';
import { LocalizedStringLike } from '@/app/views/structure/types';

export const formatUrnTail = (urn: string | undefined, options: { suffix?: string } = {}) => {
  if (!urn) return null;
  const tail = urn.split(':').at(-1) ?? urn;
  const words = tail
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  return options.suffix ? `${words} ${options.suffix}` : words;
};

export function formatLocalizedLabel(value: LocalizedStringLike | undefined): string | null {
  if (!value) return null;
  return (
    pickLabel(value as Record<string, string>) ??
    Object.values(value).find((entry): entry is string => typeof entry === 'string' && entry.length > 0) ??
    null
  );
}

export function formatCodeLabel(
  urn: string | undefined,
  code?: { name?: LocalizedStringLike } | null,
  options: { suffix?: string } = {},
): string {
  return formatLocalizedLabel(code?.name) ?? formatUrnTail(urn, options) ?? '–';
}
