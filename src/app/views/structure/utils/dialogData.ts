import { pickLabel } from '@/app/api/resolvers/helpers/pickLabel';

type LocalizedStringLike = object;

type PersonLike = {
  firstName?: string;
  firstNames?: string;
  callName?: string;
  lastName?: string;
  emailAddress?: string;
  primaryEmail?: string;
  secondaryEmail?: string;
};

type OrganisationRoleLike = {
  organisationId?: string;
  educationalInstitutionUrn?: string;
  roleUrn: string;
  share?: number;
};

type OrganisationLike = {
  name?: LocalizedStringLike;
  abbreviation?: LocalizedStringLike;
};

type StudyRightSelectionPathLike = {
  educationPhase1GroupId?: string;
  educationPhase1ChildGroupId?: string;
  educationPhase2GroupId?: string;
  educationPhase2ChildGroupId?: string;
};

type StudyRightLike = {
  educationId?: string;
  learningOpportunityId?: string;
  organisationId?: string;
  acceptedSelectionPath?: StudyRightSelectionPathLike;
  requestedSelectionPath?: StudyRightSelectionPathLike;
  valid?: {
    startDate?: string;
    endDate?: string;
  };
};

type EducationLike = {
  structure?: {
    learningOpportunities?: {
      localId: string;
      name?: LocalizedStringLike;
      allowedPaths?: StudyRightSelectionPathLike[];
    }[];
  };
};

type ModuleLike = {
  name?: LocalizedStringLike;
};

type GradeAverageLike = {
  value?: number;
};

function formatUrnTail(urn: string | undefined, options: { suffix?: string } = {}): string | null {
  if (!urn) return null;
  const tail = urn.split(':').at(-1) ?? urn;
  const words = tail
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  return options.suffix ? `${words} ${options.suffix}` : words;
}

function formatYearRange(startDate: string | undefined, endDate: string | undefined): string | null {
  const startYear = startDate?.split('-')[0];
  const endYear = endDate?.split('-')[0];
  if (!startYear) return null;
  if (!endYear || endYear === startYear) return startYear;
  return `${startYear}-${endYear}`;
}

export function formatLocalizedLabel(value: LocalizedStringLike | undefined): string | null {
  if (!value) return null;
  return (
    pickLabel(value as Record<string, string>) ??
    Object.values(value).find((entry): entry is string => typeof entry === 'string' && entry.length > 0) ??
    null
  );
}

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

export function resolveOrganisationRoleNames(
  organisations: OrganisationRoleLike[] | undefined,
  organisationMap: Map<string, OrganisationLike>,
  roleFragments: string[],
  options: { fallbackToAny?: boolean } = {},
): string {
  const fragments = roleFragments.map((fragment) => fragment.toLowerCase());
  const roleMatches =
    organisations?.filter((organisation) => {
      const role = organisation.roleUrn.toLowerCase();
      return fragments.some((fragment) => role.includes(fragment));
    }) ?? [];
  const matches = roleMatches.length > 0 || !options.fallbackToAny ? roleMatches : (organisations ?? []);

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
}

export function resolveOrganisationRoleLabels(
  organisations: OrganisationRoleLike[] | undefined,
  organisationMap: Map<string, OrganisationLike>,
  roleFragments: string[],
  options: { fallbackToAny?: boolean; includeShare?: boolean } = {},
): string {
  const fragments = roleFragments.map((fragment) => fragment.toLowerCase());
  const roleMatches =
    organisations?.filter((organisation) => {
      const role = organisation.roleUrn.toLowerCase();
      return fragments.some((fragment) => role.includes(fragment));
    }) ?? [];
  const matches = roleMatches.length > 0 || !options.fallbackToAny ? roleMatches : (organisations ?? []);

  const labels = matches
    .map((organisation) => {
      const name = resolveOrganisationRoleNames([organisation], organisationMap, [], { fallbackToAny: true });
      if (name === '–') return null;
      const share = organisation.share != null ? Math.round(organisation.share * 100) : null;
      return options.includeShare && share != null ? `${name} ${share} %` : name;
    })
    .filter((label): label is string => Boolean(label));

  return labels.length > 0 ? [...new Set(labels)].join(', ') : '–';
}

function getSelectionPathGroupIds(path: StudyRightSelectionPathLike | undefined): string[] {
  return [
    path?.educationPhase2ChildGroupId,
    path?.educationPhase2GroupId,
    path?.educationPhase1ChildGroupId,
    path?.educationPhase1GroupId,
  ].filter((groupId): groupId is string => Boolean(groupId));
}

export function getStudyRightSelectionGroupIds(
  studyRight: StudyRightLike | undefined,
  education?: EducationLike | null,
): string[] {
  if (!studyRight) return [];

  const learningOpportunity = education?.structure?.learningOpportunities?.find(
    (candidate) => candidate.localId === studyRight.learningOpportunityId,
  );
  const groupIds = [
    ...getSelectionPathGroupIds(studyRight.acceptedSelectionPath),
    ...getSelectionPathGroupIds(studyRight.requestedSelectionPath),
    ...(learningOpportunity?.allowedPaths ?? []).flatMap(getSelectionPathGroupIds),
  ];

  return [...new Set(groupIds)];
}

export function formatStudyRightLabel(
  studyRight: StudyRightLike | undefined,
  organisationMap: Map<string, OrganisationLike>,
  education?: EducationLike | null,
  moduleMap: Map<string, ModuleLike> = new Map(),
): string {
  if (!studyRight) return '–';

  const selectionModuleName = getStudyRightSelectionGroupIds(studyRight, education)
    .map((groupId) => formatLocalizedLabel(moduleMap.get(groupId)?.name))
    .find((name): name is string => Boolean(name));
  if (selectionModuleName) return selectionModuleName;

  const learningOpportunityName = formatLocalizedLabel(
    education?.structure?.learningOpportunities?.find(
      (learningOpportunity) => learningOpportunity.localId === studyRight.learningOpportunityId,
    )?.name,
  );
  if (learningOpportunityName) return learningOpportunityName;

  const organisationName = studyRight.organisationId
    ? (formatLocalizedLabel(organisationMap.get(studyRight.organisationId)?.name) ??
      formatLocalizedLabel(organisationMap.get(studyRight.organisationId)?.abbreviation))
    : null;
  const validity = formatYearRange(studyRight.valid?.startDate, studyRight.valid?.endDate);
  const parts = [organisationName, studyRight.learningOpportunityId ?? studyRight.educationId, validity].filter(
    (part): part is string => Boolean(part),
  );

  return parts.length > 0 ? parts.join(' · ') : '–';
}

export function formatCodeLabel(
  urn: string | undefined,
  code?: { name?: LocalizedStringLike } | null,
  options: { suffix?: string } = {},
): string {
  return formatLocalizedLabel(code?.name) ?? formatUrnTail(urn, options) ?? '–';
}

export function formatGradeAverage(gradeAverage: GradeAverageLike | undefined): string {
  return gradeAverage?.value != null
    ? new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(gradeAverage.value)
    : '–';
}
