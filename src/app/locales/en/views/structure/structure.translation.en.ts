export type StructureTranslation = {
  pageTitle: string;
  pageSubtitle: string;
  header: {
    planLabel: string;
    primaryBadge: string;
    subtitle: string;
    overallProgress: string;
    creditsEarned: string;
    curriculumPercent: string;
    toDegreeMinimum: string;
    modifiedOn: string;
    completed: string;
    remaining: string;
    milestone: string;
    milestoneWithCredits: string;
    studyRightUntil: string;
  };
  sidebar: {
    byCategory: string;
    viewAction: string;
    creditsLeft: string;
  };
  section: {
    statusComplete: string;
    statusInProgress: string;
    statusNotStarted: string;
    creditsMin: string;
    creditsPlanned: string;
    credits: string;
    completedGroup: string;
    activeGroup: string;
    remainingGroup: string;
    noCourses: string;
  };
  course: {
    completedLabel: string;
    notCompletedLabel: string;
    enrolledLabel: string;
    detailsAction: string;
    methodAction: string;
    methodSelectedLabel: string;
  };
  edit: {
    edit: string;
    save: string;
    saving: string;
    cancel: string;
    title: string;
    draftHint: string;
    instructions: string;
    groups: string;
    noGroups: string;
    selected: string;
    select: string;
    add: string;
    remove: string;
    countRule: string;
    creditRule: string;
    searchLabel: string;
    searchPlaceholder: string;
    searchMinLength: string;
    searching: string;
  };
  errors: {
    noPlan: string;
  };
  bulkUpdate: {
    button: string;
    panelTitle: string;
    panelDescription: string;
    checking: string;
    counter: string;
    title: string;
    subtitle: string;
    applyButton: string;
    applySelectedButton: string;
    cancelButton: string;
    coursesToUpdate: string;
    availableCount: string;
    selectAll: string;
    deselectAll: string;
    selectYear: string;
    deselectYear: string;
    newVersionTag: string;
    fromVersion: string;
    noneTitle: string;
    noneSubtitle: string;
    oldVersion: string;
    newVersion: string;
    unscheduledGroup: string;
    courseCount: string;
    selectedCount: string;
    moreCount: string;
  };
  dialogs: {
    close: string;
    completionMethod: {
      title: string;
      description: string;
      courseDetailsHeading: string;
      courseLabel: string;
      creditsLabel: string;
      methodsHeading: string;
      methodLabel: string;
      whatNextHeading: string;
      whatNextBody: string;
      cancel: string;
      confirm: string;
      saving: string;
    };
    attainment: {
      title: string;
      stateLabel: string;
      gradeLabel: string;
      creditsLabel: string;
      dateLabel: string;
      expiryLabel: string;
      noExpiry: string;
      languageLabel: string;
      averageGradeLabel: string;
      approvedByLabel: string;
      studyRightLabel: string;
      versionLabel: string;
      typeOfStudiesLabel: string;
      registrationDateLabel: string;
      fieldOfStudyLabel: string;
      coordinatingOrgLabel: string;
      responsibleOrgLabel: string;
      approvedDateLabel: string;
      recordedLabel: string;
      courseCardTitle: string;
      validityCardTitle: string;
      adminCardTitle: string;
      additionalInfoCardTitle: string;
      noAdditionalInfo: string;
      stateAttained: string;
      stateIncluded: string;
      stateSubstituted: string;
      stateFailed: string;
    };
    courseDetails: {
      statusLabel: string;
      gradeLabel: string;
      placedToLabel: string;
      tabInfo: string;
      tabEquivalences: string;
      courseVersionLabel: string;
      changeVersionButton: string;
      versionInPlan: string;
      completedBannerTitle: string;
      completedBannerRecorded: string;
      viewAttainmentAction: string;
      basicInfoHeading: string;
      languageLabel: string;
      gradeScaleLabel: string;
      creditsLabel: string;
      courseLevelLabel: string;
      courseTypeLabel: string;
      organiserLabel: string;
      contentHeading: string;
      outcomesHeading: string;
      contentSectionHeading: string;
      additionalInfoLabel: string;
      prerequisitesHeading: string;
      noPrerequisites: string;
      additionalHeading: string;
      studyMaterialsHeading: string;
      studyMaterialsLabel: string;
      classificationHeading: string;
      fieldsOfStudyLabel: string;
      responsiblePersonsHeading: string;
      responsibleTeacherLabel: string;
      toBeConfirmed: string;
      noData: string;
      loading: string;
    };
  };
};

export const structureTranslation: StructureTranslation = {
  pageTitle: 'Structure of Studies',
  pageSubtitle: 'Your degree programme, modules, and courses.',
  header: {
    planLabel: 'My study plan',
    primaryBadge: 'PRIMARY',
    subtitle: 'Degree programme · university · curriculum',
    overallProgress: 'Overall progress',
    creditsEarned: 'credits earned',
    curriculumPercent: '{{count}}% of curriculum',
    toDegreeMinimum: '{{count}} cr to the degree minimum',
    modifiedOn: 'Modified on: {{date}}',
    completed: 'Completed',
    remaining: 'Remaining',
    milestone: 'Milestone',
    milestoneWithCredits: 'Required {{count}} cr',
    studyRightUntil: 'Study right until',
  },
  sidebar: {
    byCategory: 'By Category',
    viewAction: 'View',
    creditsLeft: '{{count}} cr left',
  },
  section: {
    statusComplete: 'Complete',
    statusInProgress: 'In progress',
    statusNotStarted: 'Not started',
    creditsMin: 'min. {{count}} cr',
    creditsPlanned: 'planned',
    credits: '{{done}} / {{total}} cr',
    completedGroup: 'Completed · {{count}} cr',
    activeGroup: 'Active · {{count}} cr',
    remainingGroup: 'Remaining · {{count}} cr',
    noCourses: 'No courses',
  },
  course: {
    completedLabel: 'Completed',
    notCompletedLabel: 'Not completed',
    enrolledLabel: 'Enrolled',
    detailsAction: 'Details',
    methodAction: 'Method',
    methodSelectedLabel: 'Method {{n}}',
  },
  edit: {
    edit: 'Edit structure',
    save: 'Save',
    saving: 'Saving...',
    cancel: 'Cancel',
    title: 'Edit selections',
    draftHint:
      'Changes stay in draft until saved. Choosing a new alternative removes the old alternative and its nested courses.',
    instructions: 'Instructions',
    groups: 'groups',
    noGroups: 'No structured selection groups were found for this section.',
    selected: 'Selected',
    select: 'Select',
    add: 'Add',
    remove: 'Remove',
    countRule: 'Select {{min}}-{{max}} options',
    creditRule: 'Select {{min}}-{{max}} cr',
    searchLabel: 'Search optional courses',
    searchPlaceholder: 'Search by course name or code',
    searchMinLength: 'Type at least three characters.',
    searching: 'Searching...',
  },
  errors: {
    noPlan: 'No study plan data was found.',
  },
  bulkUpdate: {
    button: 'Update all to latest',
    panelTitle: 'Course version updates',
    panelDescription:
      'Your planned courses have newer versions available. Enrolled and completed courses are not affected.',
    checking: 'Checking...',
    counter: '{{count}} to update',
    title: 'Update course versions',
    subtitle: 'Select which courses to update to their latest version.',
    applyButton: 'Apply updates',
    applySelectedButton: 'Apply {{count}} updates',
    cancelButton: 'Cancel',
    coursesToUpdate: 'Courses to update',
    availableCount: '{{count}} available',
    selectAll: 'Select all',
    deselectAll: 'Deselect all',
    selectYear: 'Select year',
    deselectYear: 'Deselect year',
    newVersionTag: 'New version',
    fromVersion: 'from {{version}}',
    noneTitle: 'All up to date',
    noneSubtitle: 'All uncompleted courses are already on their latest version.',
    oldVersion: 'Current',
    newVersion: 'Latest',
    unscheduledGroup: 'Unscheduled',
    courseCount: 'courses',
    selectedCount: 'selected',
    moreCount: '+{{count}} more',
  },
  dialogs: {
    close: 'Close',
    completionMethod: {
      title: 'Select a completion method.',
      description:
        'The course can be completed in the ways listed. If necessary, read the course completion instructions in the course information sheet.',
      courseDetailsHeading: 'Course details',
      courseLabel: 'Course',
      creditsLabel: 'Credits',
      methodsHeading: 'Course completion methods',
      methodLabel: 'Completion method {{index}} ({{credits}} cr)',
      whatNextHeading: 'What to expect after confirmation?',
      whatNextBody:
        'Select the implementations related to the completion method and register for them in the Registration view.',
      cancel: 'Cancel',
      confirm: 'Confirm',
      saving: 'Saving...',
    },
    attainment: {
      title: 'Details of the attainment',
      stateLabel: 'STATE',
      gradeLabel: 'GRADE',
      creditsLabel: 'CREDITS (CR)',
      dateLabel: 'DATE',
      expiryLabel: 'EXPIRATION DATE',
      noExpiry: 'No expiration date',
      languageLabel: 'LANGUAGE OF LEARNING',
      averageGradeLabel: 'AVERAGE GRADE',
      approvedByLabel: 'APPROVED BY',
      studyRightLabel: 'STUDY RIGHT',
      versionLabel: 'VERSION',
      typeOfStudiesLabel: 'TYPE OF STUDIES',
      registrationDateLabel: 'DATE OF REGISTRATION',
      fieldOfStudyLabel: 'FIELD OF STUDY',
      coordinatingOrgLabel: 'COORDINATING ORG.',
      responsibleOrgLabel: 'RESPONSIBLE ORG.',
      approvedDateLabel: 'APPROVED DATE',
      recordedLabel: 'Recorded',
      courseCardTitle: 'Course',
      validityCardTitle: 'Validity & registration',
      adminCardTitle: 'Administration',
      additionalInfoCardTitle: 'Additional information',
      noAdditionalInfo: 'No additional information provided for this attainment.',
      stateAttained: 'Attained',
      stateIncluded: 'Included',
      stateSubstituted: 'Substituted',
      stateFailed: 'Failed',
    },
    courseDetails: {
      statusLabel: 'Status',
      gradeLabel: 'Grade',
      placedToLabel: 'Placed to',
      tabInfo: 'Information sheet',
      tabEquivalences: 'Equivalences & substitutions',
      courseVersionLabel: 'Course version',
      changeVersionButton: 'Change version',
      versionInPlan: '(in plan)',
      completedBannerTitle: 'Study completed',
      completedBannerRecorded: 'Recorded',
      viewAttainmentAction: 'View attainment',
      basicInfoHeading: 'Basic information',
      languageLabel: 'Languages of learning',
      gradeScaleLabel: 'Grading scale',
      creditsLabel: 'Credits',
      courseLevelLabel: 'Course level',
      courseTypeLabel: 'Course type',
      organiserLabel: 'Organiser',
      contentHeading: 'Content and goals',
      outcomesHeading: 'Learning outcomes',
      contentSectionHeading: 'Content',
      additionalInfoLabel: 'Additional information',
      prerequisitesHeading: 'Prerequisites',
      noPrerequisites: 'No prerequisites defined for this course.',
      additionalHeading: 'Additional information',
      studyMaterialsHeading: 'Course materials',
      studyMaterialsLabel: 'Study materials',
      classificationHeading: 'Classification',
      fieldsOfStudyLabel: 'Fields of study',
      responsiblePersonsHeading: 'Responsible persons and contact information',
      responsibleTeacherLabel: 'Responsible teacher',
      toBeConfirmed: 'To be confirmed',
      noData: 'No data available.',
      loading: 'Loading course details…',
    },
  },
};
