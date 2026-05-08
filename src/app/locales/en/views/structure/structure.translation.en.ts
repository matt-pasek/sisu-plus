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
  errors: {
    noPlan: 'No study plan data was found.',
  },
};
