export type TimelineTranslation = {
  addCourse: {
    add: string;
    addFailed: string;
    addTo: string;
    added: string;
    addedToast: string;
    adding: string;
    close: string;
    confirmed: string;
    empty: string;
    emptyNoSearch: string;
    eyebrow: string;
    groupFull: string;
    hide: string;
    likely: string;
    checking_one: string;
    checking_other: string;
    listedUnder: string;
    loadFailed: string;
    loading: string;
    otherUniversities: string;
    otherUniversitiesSub: string;
    notTaught_one: string;
    notTaught_other: string;
    periods_one: string;
    periods_other: string;
    pick: string;
    planned: string;
    plannedOnly: string;
    primaryOnly: string;
    required: string;
    teachingDates: string;
    timingUnknown: string;
    search: string;
    show: string;
    slot: string;
    someUnchecked_one: string;
    someUnchecked_other: string;
    title: string;
    undo: string;
    undoFailed: string;
    unmet: string;
  };
  actions: {
    confirm: string;
    confirming: string;
    reset: string;
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
    resize: string;
    unnamed: string;
    warningCount: string;
  };
  hero: {
    empty: string;
    emptyHint: string;
    eyebrow: string;
    fold: string;
    graduating: string;
    heaviest: string;
    heaviestSub: string;
    loadNeeded: string;
    loadPeriod: string;
    loadTitle: string;
    met: string;
    metAccent: string;
    needed: string;
    neededSub: string;
    pace: string;
    paceEarnedSub: string;
    paceSub: string;
    periodsLeft_one: string;
    periodsLeft_other: string;
    planEnds: string;
    projected: string;
    projectedLabel: string;
    projectedSub: string;
    scheduled: string;
    short: string;
    shortAccent: string;
    span: string;
    termAutumn: string;
    termSpring: string;
    unfold: string;
  };
  pool: {
    empty: string;
    outsideTimeline: string;
    previous: string;
    show: string;
    showPrevious: string;
    showSummer: string;
    summer: string;
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
  addCourse: {
    add: 'Add',
    addFailed: "Couldn't add {{course}}. Nothing changed.",
    addTo: 'Add to',
    added: 'Added',
    addedToast: 'Added {{course}} to your plan',
    adding: 'Adding…',
    close: 'Close',
    confirmed: 'Taught {{term}}',
    empty: 'Nothing left to choose here. Try searching all courses.',
    emptyNoSearch: 'Nothing left to choose here.',
    eyebrow: 'Add course',
    groupFull: '{{module}} is already full',
    hide: 'Hide',
    likely: 'Taught in {{period}} last year',
    checking_one: 'Checking {{count}} course…',
    checking_other: 'Checking {{count}} courses…',
    listedUnder: 'Listed under {{module}}',
    loadFailed: "Couldn't load your study options. Try again later.",
    loading: 'Finding courses that fit…',
    notTaught_one: "{{count}} more option isn't taught in this period",
    notTaught_other: "{{count}} more options aren't taught in this period",
    otherUniversities: 'Other universities',
    otherUniversitiesSub: 'Cross-institutional studies open to you',
    periods_one: '1 period',
    periods_other: '{{count}} periods · {{range}}',
    pick: 'pick {{pick}} of {{of}}',
    planned: '{{credits}} planned there so far',
    plannedOnly: 'Needs {{course}} first, planned for {{period}}',
    primaryOnly: 'Adding courses works on your primary plan.',
    required: 'Required',
    teachingDates: 'Teaching {{range}}',
    timingUnknown: 'Timing unknown',
    search: 'Search all courses…',
    show: 'Show',
    slot: 'Add course to {{period}}',
    someUnchecked_one: "{{count}} course couldn't be checked for this period",
    someUnchecked_other: "{{count}} courses couldn't be checked for this period",
    title: 'Fits in {{period}} · {{term}}',
    undo: 'Undo',
    undoFailed: "Couldn't undo. {{course}} is still in your plan.",
    unmet: 'Needs {{course}} first',
  },
  actions: {
    confirm: 'Confirm',
    confirming: 'Confirming...',
    reset: 'Reset timeline changes',
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
    resize: 'Resize {{course}}',
    unnamed: 'Unnamed course',
    warningCount: '{{count}} issues',
  },
  hero: {
    empty: 'No courses scheduled yet',
    emptyHint: 'Drag a course from the course pool onto a period to schedule it.',
    eyebrow: 'Plan',
    fold: 'Hide summary',
    graduating: 'Graduating in {{accent}}',
    heaviest: 'Heaviest period',
    heaviestSub: '{{period}} · {{term}}',
    loadNeeded: '{{credits}} needed',
    loadPeriod: '{{period}} · {{term}}',
    loadTitle: 'Load per period',
    met: 'Degree target {{accent}}',
    metAccent: 'reached',
    needed: 'Needed / period',
    neededSub: 'to reach {{target}}',
    pace: 'Avg. pace',
    paceEarnedSub: 'earned per period',
    paceSub: 'planned per period',
    periodsLeft_one: '{{count}} period left',
    periodsLeft_other: '{{count}} periods left',
    planEnds: 'Plan ends in {{accent}}',
    projected: 'projected cr',
    projectedLabel: 'Projected',
    projectedSub: '{{pct}}% of {{target}}',
    scheduled: '{{credits}} scheduled',
    short: '{{accent}} of graduating',
    shortAccent: '{{credits}} short',
    span: '{{from}} → {{to}}',
    termAutumn: 'Autumn {{year}}',
    termSpring: 'Spring {{year}}',
    unfold: 'Show summary',
  },
  pool: {
    empty: 'Every planned course has a study period.',
    outsideTimeline: 'Outside shown timeline',
    previous: 'Previous',
    show: 'Show',
    showPrevious: 'Show previous periods',
    showSummer: 'Show summer periods',
    summer: 'Summer',
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
