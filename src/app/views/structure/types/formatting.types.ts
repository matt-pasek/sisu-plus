export type LocalizedStringLike = object;

export type PersonLike = {
  firstName?: string;
  firstNames?: string;
  callName?: string;
  lastName?: string;
  emailAddress?: string;
  primaryEmail?: string;
  secondaryEmail?: string;
};

export type OrganisationRoleLike = {
  organisationId?: string;
  educationalInstitutionUrn?: string;
  roleUrn: string;
  share?: number;
};

export type OrganisationLike = {
  name?: LocalizedStringLike;
  abbreviation?: LocalizedStringLike;
};

export type StudyRightSelectionPathLike = {
  educationPhase1GroupId?: string;
  educationPhase1ChildGroupId?: string;
  educationPhase2GroupId?: string;
  educationPhase2ChildGroupId?: string;
};

export type StudyRightLike = {
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

export type EducationLike = {
  structure?: {
    learningOpportunities?: {
      localId: string;
      name?: LocalizedStringLike;
      allowedPaths?: StudyRightSelectionPathLike[];
    }[];
  };
};

export type ModuleLike = {
  name?: LocalizedStringLike;
};

export type GradeAverageLike = {
  value?: number;
};
