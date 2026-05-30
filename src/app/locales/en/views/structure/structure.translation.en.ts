export type StructureTranslation = {
  pageTitle: string;
  pageSubtitle: string;
  header: {
    planLabel: string;
    primaryBadge: string;
    subtitle: string;
    overallProgress: string;
    completed: string;
    remaining: string;
    milestone: string;
    milestoneWithCredits: string;
    studyRightUntil: string;
  };
  sidebar: {
    byCategory: string;
  };
  section: {
    statusComplete: string;
    statusInProgress: string;
    statusNotStarted: string;
    creditsMin: string;
    creditsPlanned: string;
    credits: string;
    completedGroup: string;
    remainingGroup: string;
    noCourses: string;
  };
  course: {
    completedLabel: string;
    notCompletedLabel: string;
    detailsAction: string;
    methodAction: string;
  };
  edit: {
    edit: string;
    save: string;
    saving: string;
    cancel: string;
    title: string;
    draftHint: string;
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
    title: string;
    subtitle: string;
    applyButton: string;
    noneTitle: string;
    noneSubtitle: string;
    oldVersion: string;
    newVersion: string;
    unscheduledGroup: string;
    courseCount: string;
    selectedCount: string;
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
    completed: 'Completed',
    remaining: 'Remaining',
    milestone: 'Milestone',
    milestoneWithCredits: 'Required {{count}} cr',
    studyRightUntil: 'Study right until',
  },
  sidebar: {
    byCategory: 'By Category',
  },
  section: {
    statusComplete: 'Complete',
    statusInProgress: 'In progress',
    statusNotStarted: 'Not started',
    creditsMin: 'min. {{count}} cr',
    creditsPlanned: 'planned',
    credits: '{{done}} / {{total}} cr',
    completedGroup: 'Completed · {{count}} cr',
    remainingGroup: 'Remaining · {{count}} cr',
    noCourses: 'No courses',
  },
  course: {
    completedLabel: 'Completed',
    notCompletedLabel: 'Not completed',
    detailsAction: 'Details',
    methodAction: 'Method',
  },
  edit: {
    edit: 'Edit structure',
    save: 'Save',
    saving: 'Saving...',
    cancel: 'Cancel',
    title: 'Edit selections',
    draftHint:
      'Changes stay in draft until saved. Choosing a new alternative removes the old alternative and its nested courses.',
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
    title: 'Update course versions',
    subtitle: 'These uncompleted courses have a newer version available.',
    applyButton: 'Apply changes',
    noneTitle: 'All up to date',
    noneSubtitle: 'All uncompleted courses are already on their latest version.',
    oldVersion: 'Old version',
    newVersion: 'New version',
    unscheduledGroup: 'Unscheduled',
    courseCount: 'courses',
    selectedCount: 'selected',
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
      cancel: 'Close',
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
