export type StructureTranslation = {
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
};

export const structureTranslation: StructureTranslation = {
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
    detailsAction: 'Details ->',
    methodAction: 'Method ->',
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
};
