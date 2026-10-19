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
    periodWarning: string;
    prerequisiteWarning: string;
    unnamed: string;
    warningCount: string;
  };
  hero: {
    chartLabel: string;
    degreeMarker: string;
    ofDegree: string;
    pointPlanned: string;
    targetLine: string;
    trajectoryLabel: string;
    trajectoryLabelNoTarget: string;
    fold: string;
    graduation: string;
    heaviest: string;
    scheduled: string;
    short: string;
    title: string;
    titleAccent: string;
    unfold: string;
  };
  pool: {
    empty: string;
    hidePrevious: string;
    outsideTimeline: string;
    showSummer: string;
    title: string;
    unscheduleDrop: string;
    withoutVisiblePeriod: string;
  };
  sidebar: {
    issues: string;
    modules: string;
  };
  semester: {
    autumn: string;
    autumnShort: string;
    spring: string;
    springShort: string;
  };
  status: {
    active: string;
    done: string;
    grade: string;
    planned: string;
  };
  toolbar: {
    issue_one: string;
    issue_other: string;
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
    periodWarning: 'Timing',
    prerequisiteWarning: 'Prereq',
    unnamed: 'Unnamed course',
    warningCount: '{{count}} issues',
  },
  hero: {
    chartLabel: 'Credits over time against your degree target',
    degreeMarker: 'Degree',
    ofDegree: '{{pct}}% of degree',
    pointPlanned: 'planned',
    targetLine: '{{target}} · degree',
    trajectoryLabel: 'Credit trajectory → {{target}}',
    trajectoryLabelNoTarget: 'Credit trajectory',
    fold: 'Hide summary',
    graduation: 'graduation',
    heaviest: 'heaviest · {{period}}',
    scheduled: 'scheduled',
    short: '{{credits}} short',
    title: 'Plan your path,',
    titleAccent: 'period by period',
    unfold: 'Show summary',
  },
  pool: {
    empty: 'Every planned course has a study period.',
    hidePrevious: 'Hide previous periods',
    outsideTimeline: 'Outside shown timeline',
    showSummer: 'Show summer periods',
    title: 'Course pool',
    unscheduleDrop: 'Drop to unschedule',
    withoutVisiblePeriod: '{{count}} courses have no visible timing period - drag them onto a period to schedule.',
  },
  sidebar: {
    issues: 'Scheduling issues · {{count}}',
    modules: 'Modules',
  },
  semester: {
    autumn: 'Autumn',
    autumnShort: 'Aut',
    spring: 'Spring',
    springShort: 'Spr',
  },
  status: {
    active: 'Active',
    done: 'Done',
    grade: 'Grade {{grade}}',
    planned: 'Planned',
  },
  toolbar: {
    issue_one: '{{count}} issue',
    issue_other: '{{count}} issues',
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
