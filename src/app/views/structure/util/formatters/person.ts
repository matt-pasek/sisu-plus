import { PersonLike } from '@/app/views/structure/types';

export function formatPersonDisplayName(
  fallbackText: string | undefined | null,
  person: PersonLike | undefined,
  options: { lastNameFirst?: boolean } = {},
): string | null {
  if (fallbackText?.trim()) return fallbackText.trim();

  const firstName = person?.callName ?? person?.firstName ?? person?.firstNames;
  const nameParts = options.lastNameFirst ? [person?.lastName, firstName] : [firstName, person?.lastName];
  const fullName = nameParts.filter(Boolean).join(' ').trim();
  if (fullName) return fullName;

  return person?.emailAddress ?? person?.primaryEmail ?? person?.secondaryEmail ?? null;
}

export function formatPersonEmail(person: PersonLike | undefined): string | null {
  return person?.emailAddress ?? person?.primaryEmail ?? person?.secondaryEmail ?? null;
}
