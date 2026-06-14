import { OrganisationLike, OrganisationRoleLike } from '@/app/views/structure/types';
import { formatLocalizedLabel, formatUrnTail } from '@/app/views/structure/util/formatters/label';

const matchOrganisationsByRole = (
  organisations: OrganisationRoleLike[] | undefined,
  roleFragments: string[],
  fallbackToAny?: boolean,
) => {
  const fragments = roleFragments.map((f) => f.toLowerCase());
  const roleMatches =
    organisations?.filter((org) => {
      const role = org.roleUrn.toLowerCase();
      return fragments.some((f) => role.includes(f));
    }) ?? [];
  return roleMatches.length > 0 || !fallbackToAny ? roleMatches : (organisations ?? []);
};

export const resolveOrganisationRoleNames = (
  organisations: OrganisationRoleLike[] | undefined,
  organisationMap: Map<string, OrganisationLike>,
  roleFragments: string[],
  options: { fallbackToAny?: boolean } = {},
) => {
  const matches = matchOrganisationsByRole(organisations, roleFragments, options.fallbackToAny);

  const names = matches
    .map((organisation) => {
      const resolved = organisation.organisationId ? organisationMap.get(organisation.organisationId) : undefined;
      return (
        formatLocalizedLabel(resolved?.name) ??
        formatLocalizedLabel(resolved?.abbreviation) ??
        formatUrnTail(organisation.educationalInstitutionUrn) ??
        organisation.organisationId ??
        null
      );
    })
    .filter((name): name is string => Boolean(name));

  return names.length > 0 ? [...new Set(names)].join(', ') : '–';
};

export const resolveOrganisationRoleLabels = (
  organisations: OrganisationRoleLike[] | undefined,
  organisationMap: Map<string, OrganisationLike>,
  roleFragments: string[],
  options: { fallbackToAny?: boolean; includeShare?: boolean } = {},
) => {
  const matches = matchOrganisationsByRole(organisations, roleFragments, options.fallbackToAny);

  const labels = matches
    .map((organisation) => {
      const name = resolveOrganisationRoleNames([organisation], organisationMap, [], { fallbackToAny: true });
      if (name === '–') return null;
      const share = organisation.share != null ? Math.round(organisation.share * 100) : null;
      return options.includeShare && share != null ? `${name} ${share} %` : name;
    })
    .filter((label): label is string => Boolean(label));

  return labels.length > 0 ? [...new Set(labels)].join(', ') : '–';
};
