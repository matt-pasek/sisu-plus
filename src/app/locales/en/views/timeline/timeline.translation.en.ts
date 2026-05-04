export type TimelineTranslation = {
  actions: {
    addCourse: string;
    autoSchedule: string;
    confirm: string;
    confirming: string;
    reset: string;
    scheduling: string;
  };
  board: {
    completed: string;
    done: string;
    dropHere: string;
    noCourses: string;
    noPeriods: string;
    offeredHere: string;
    planned: string;
    workloadTitle: string;
  };
  course: {
    fallback: string;
    dismissPrerequisite: string;
    noModule: string;
    unnamed: string;
  };
  pool: {
    empty: string;
    hidePrevious: string;
    outsideTimeline: string;
    searchPlaceholder: string;
    showSummer: string;
    title: string;
    unscheduleDrop: string;
    withoutVisiblePeriod: string;
  };
  semester: {
    autumn: string;
    spring: string;
    now: string;
  };
  status: {
    active: string;
    done: string;
    planned: string;
  };
  toolbar: {
    issue: string;
    unsaved: string;
  };
  title: string;
  validation: {
    missingPeriod: string;
    prerequisite: string;
    requiredCourse: string;
    unknownModule: string;
  };
};

export const timelineTranslation: TimelineTranslation = {
  actions: {
    addCourse: 'Add Course',
    autoSchedule: 'Auto-schedule',
    confirm: 'Confirm',
    confirming: 'Confirming...',
    reset: 'Reset timeline changes',
    scheduling: 'Scheduling...',
  },
  board: {
    completed: 'completed',
    done: 'Done',
    dropHere: 'Drop here',
    noCourses: 'No courses',
    noPeriods: 'No timeline periods available yet.',
    offeredHere: 'Offered here',
    planned: 'Planned',
    workloadTitle: 'Workload in {{period}}: {{credits}}',
  },
  course: {
    fallback: 'Course',
    dismissPrerequisite: 'I have similar prerequisite',
    noModule: 'No module',
    unnamed: 'Unnamed course',
  },
  pool: {
    empty: 'Every planned course has a study period.',
    hidePrevious: 'Hide previous',
    outsideTimeline: 'Outside shown timeline',
    searchPlaceholder: 'Search...',
    showSummer: 'Show summer',
    title: 'Course Pool',
    unscheduleDrop: 'Drop to unschedule',
    withoutVisiblePeriod: '{{count}} course without a visible timing period.',
  },
  semester: {
    autumn: 'Autumn',
    spring: 'Spring',
    now: 'NOW',
  },
  status: {
    active: 'Active',
    done: 'Done',
    planned: 'Planned',
  },
  toolbar: {
    issue: '{{count}} issue',
    unsaved: '{{count}} unsaved',
  },
  title: 'Timeline',
  validation: {
    missingPeriod: 'Not organized in {{periods}}.',
    prerequisite: '{{course}} must be completed before this course.',
    requiredCourse: 'a required course',
    unknownModule: 'Unknown module',
  },
};
