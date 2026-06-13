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
    periodWarning: string;
    prerequisiteWarning: string;
    unnamed: string;
    warningCount: string;
  };
  pool: {
    empty: string;
    hidePrevious: string;
    outsideTimeline: string;
    searchPlaceholder: string;
    schedulingIssue: string;
    schedulingIssues: string;
    showSummer: string;
    title: string;
    unscheduled: string;
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
    grade: string;
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
    periodWarning: 'Timing',
    prerequisiteWarning: 'Prereq',
    unnamed: 'Unnamed course',
    warningCount: '{{count}} issues',
  },
  pool: {
    empty: 'Every planned course has a study period.',
    hidePrevious: 'Hide previous periods',
    outsideTimeline: 'Outside shown timeline',
    searchPlaceholder: 'Search courses...',
    schedulingIssue: '{{count}} scheduling issue',
    schedulingIssues: '{{count}} scheduling issues',
    showSummer: 'Show summer periods',
    title: 'Course Pool',
    unscheduled: 'Unscheduled',
    unscheduleDrop: 'Drop to unschedule',
    withoutVisiblePeriod: '{{count}} courses have no visible timing period - drag them onto a period to schedule.',
  },
  semester: {
    autumn: 'Autumn',
    spring: 'Spring',
    now: 'NOW',
  },
  status: {
    active: 'Active',
    done: 'Done',
    grade: 'Grade {{grade}}',
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
