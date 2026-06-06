import {
  EducationLike,
  ModuleLike,
  OrganisationLike,
  StudyRightLike,
  StudyRightSelectionPathLike,
} from '@/app/views/structure/types';
import { formatLocalizedLabel } from '@/app/views/structure/util/formatters/label';
import { formatYearRange } from '@/app/views/structure/util/formatters/numeric';

const getSelectionPathGroupIds = (path: StudyRightSelectionPathLike | undefined): string[] => {
  return [
    path?.educationPhase2ChildGroupId,
    path?.educationPhase2GroupId,
    path?.educationPhase1ChildGroupId,
    path?.educationPhase1GroupId,
  ].filter((groupId): groupId is string => Boolean(groupId));
};

export const getStudyRightSelectionGroupIds = (
  studyRight: StudyRightLike | undefined,
  education?: EducationLike | null,
) => {
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
};

export const formatStudyRightLabel = (
  studyRight: StudyRightLike | undefined,
  organisationMap: Map<string, OrganisationLike>,
  education?: EducationLike | null,
  moduleMap: Map<string, ModuleLike> = new Map(),
) => {
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
};
