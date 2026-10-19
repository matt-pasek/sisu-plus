import { calendarDeadlinesTranslation, type CalendarDeadlinesTranslation } from './calendarDeadlines.translation.en';
import { calendarExportTranslation, type CalendarExportTranslation } from './calendarExport.translation.en';
import { calendarNotesTranslation, type CalendarNotesTranslation } from './calendarNotes.translation.en';
import { calendarRemindersTranslation, type CalendarRemindersTranslation } from './calendarReminders.translation.en';

export type CalendarTranslation = {
  title: string;
  weekLabel: string;
  weekShort: string;
  weekendShort: string;
  weekendFree: string;
  weekendDueAria_one: string;
  weekendDueAria_other: string;
  timeZoneNote: string;
  clashGroup: {
    clash: string;
    overlap: string;
    aria: string;
  };
  actions: {
    today: string;
    previous: string;
    next: string;
    refresh: string;
    close: string;
    allSessions: string;
    showClash: string;
    openRegistration: string;
    goToThis: string;
    goInstead: string;
    swapWeek: string;
    makeUsual: string;
    undoSwap: string;
    switchGroup: string;
    hideGroup: string;
    skipOnce: string;
    skipAlways: string;
    undoSkip: string;
  };
  toolbar: {
    clashes_one: string;
    clashes_other: string;
    academicYear: string;
  };
  sidebar: {
    courses: string;
    layers: string;
    cancelled: string;
    exam: string;
    previousMonth: string;
    nextMonth: string;
    showCourse: string;
    chooseGroup: string;
    noTimes: string;
    addTimetable: string;
  };
  prompt: {
    notNow: string;
  };
  kinds: {
    lecture: string;
    exercise: string;
    lab: string;
    seminar: string;
    exam: string;
    other: string;
  };
  event: {
    session: string;
    noRoom: string;
    roomUnavailable: string;
    nextSession: string;
    nextSessionMoves: string;
    clashesWith: string;
    otherTimes: string;
    alternativeChip: string;
    fromSource: string;
    fromSourcePlain: string;
  };
  suggestion: {
    free: string;
    switch: string;
    keep: string;
  };
  sessions: {
    title: string;
    week: string;
    total_one: string;
    total_other: string;
    clashes_one: string;
    clashes_other: string;
    rooms_one: string;
    rooms_other: string;
    next: string;
    chips: {
      clash: string;
      partialClash: string;
      roomChanged: string;
      cancelled: string;
      swapped: string;
      skipping: string;
      swapUnavailable: string;
    };
  };
  footer: {
    source: string;
    updated: string;
    sourceWithLinked_one: string;
    sourceWithLinked_other: string;
  };
  linked: {
    unreachable: string;
    retry: string;
    refresh: string;
    edit: string;
    remove: string;
    sisuHasTimes: string;
  };
  timetable: {
    title: string;
    label: string;
    preview: string;
    save: string;
    cancel: string;
    loading: string;
    needsPermission: string;
    allow: string;
    waiting: string;
    summary_one: string;
    summary_other: string;
    pattern: string;
    matched: string;
    firstOnly_one: string;
    firstOnly_other: string;
    recentOnly: string;
    empty: string;
    errors: {
      invalid: string;
      permission: string;
      network: string;
      notCalendar: string;
      tooLarge: string;
    };
  };
  states: {
    loading: string;
    error: string;
    retry: string;
    emptyWeek: string;
    emptyDay: string;
    emptyTerm: string;
  };
  aria: {
    session: string;
    clash: string;
    moreSessions: string;
    alternative: string;
  };
  plan: {
    saveFailed: string;
  };
  groups: {
    title: string;
    choose: string;
    count_one: string;
    count_other: string;
    question: { lecture: string; exercise: string; lab: string; seminar: string; exam: string; other: string };
    varies: string;
    variesDetail: string;
    swapHint: string;
    visibility: string;
    visibilityHint: string;
    notInCalendar: string;
    nowShown: string;
    nowHidden: string;
    undo: string;
    showInCalendar: string;
    sessions_one: string;
    sessions_other: string;
    fitsAll: string;
    clashes: string;
    noSessions: string;
    sameAs: string;
    sharesWith: string;
    stillShown: string;
    hideThatToo: string;
    changeInSisu: string;
    loading: string;
    failed: string;
  };
  visibility: {
    failed: string;
  };
  views: {
    label: string;
    day: string;
    week: string;
    month: string;
    year: string;
  };
  navigation: {
    previous: { day: string; week: string; month: string; year: string };
    next: { day: string; week: string; month: string; year: string };
  };
  agenda: {
    title: string;
    today: string;
    next: string;
    now: string;
    until: string;
    inMinutes: string;
    inHours: string;
    inWholeHours: string;
    tomorrow: string;
    inDays_one: string;
    inDays_other: string;
    restOfToday: string;
    onDay: string;
    tomorrowFirst: string;
    firstOn: string;
    noUpcoming: string;
    clashWith: string;
    skipping: string;
  };
  month: {
    hours: string;
    exam: string;
    cancelled: string;
    roomChange: string;
    clash: string;
    periodStarts: string;
    noTeaching: string;
    openWeek: string;
    moreDeadlines_one: string;
    moreDeadlines_other: string;
  };
  holidays: {
    newYear: string;
    epiphany: string;
    goodFriday: string;
    easterSunday: string;
    easterMonday: string;
    mayDay: string;
    ascension: string;
    whitsun: string;
    midsummerEve: string;
    midsummerDay: string;
    allSaints: string;
    independence: string;
    christmasEve: string;
    christmasDay: string;
    stStephens: string;
  };
  year: {
    less: string;
    more: string;
    exam: string;
    clash: string;
    holiday: string;
    noTeaching: string;
    exams: string;
    noExams: string;
    heaviest: string;
    weekRange: string;
    hours: string;
    nextTerm: string;
    autumn: string;
    spring: string;
    emptyTerm: string;
    planned_one: string;
    planned_other: string;
    cellAria: string;
  };
  notes: CalendarNotesTranslation;
  deadlines: CalendarDeadlinesTranslation;
  exportPanel: CalendarExportTranslation;
  reminders: CalendarRemindersTranslation;
};

export const calendarTranslation: CalendarTranslation = {
  title: 'Calendar',
  weekLabel: 'Week {{week}}',
  weekShort: 'WK {{week}}',
  weekendShort: 'S–S',
  weekendFree: 'Weekend free',
  weekendDueAria_one: '{{count}} deadline this weekend. Open {{date}}',
  weekendDueAria_other: '{{count}} deadlines this weekend. Open {{date}}',
  timeZoneNote: 'Times shown in Finnish time',
  clashGroup: {
    clash: 'Clash',
    overlap: '{{count}} classes',
    aria: '{{count}} classes at the same time, {{start}} to {{end}}',
  },
  actions: {
    today: 'Today',
    previous: 'Previous week',
    next: 'Next week',
    refresh: 'Refresh',
    close: 'Close',
    allSessions: 'All sessions',
    showClash: 'Show the first clash',
    openRegistration: 'Open Registration',
    goToThis: 'Go to this one',
    goInstead: 'Go to this one instead',
    swapWeek: 'Swap the whole week',
    makeUsual: 'Go to {{group}} every week',
    undoSwap: 'Undo swap',
    switchGroup: 'Switch group',
    hideGroup: 'Hide this group',
    skipOnce: 'Skip this one',
    skipAlways: 'Skip every time',
    undoSkip: 'Undo skip',
  },
  toolbar: {
    clashes_one: '{{count}} clash',
    clashes_other: '{{count}} clashes',
    academicYear: 'Academic year',
  },
  sidebar: {
    courses: 'Courses',
    layers: 'Layers',
    cancelled: 'Cancelled sessions',
    exam: 'Exam',
    previousMonth: 'Previous month',
    nextMonth: 'Next month',
    showCourse: 'Show {{course}} in the calendar',
    chooseGroup: 'Choose tutorial group',
    noTimes: 'Sisu has no times for this course',
    addTimetable: 'Add timetable link',
  },
  prompt: {
    notNow: 'Not now',
  },
  kinds: {
    lecture: 'Lecture',
    exercise: 'Exercise',
    lab: 'Lab',
    seminar: 'Seminar',
    exam: 'Exam',
    other: 'Teaching',
  },
  event: {
    session: 'Session {{index}} of {{total}}',
    noRoom: 'No room',
    roomUnavailable: 'Room unavailable',
    nextSession: 'Next session {{date}} · {{room}}',
    nextSessionMoves: 'Next session moves to {{room}} on {{date}}',
    clashesWith: 'Clashes with {{names}} in {{count}} of {{total}} sessions',
    otherTimes: 'Other times this week',
    alternativeChip: 'Alternative',
    fromSource: 'From {{source}} · updated {{time}}',
    fromSourcePlain: 'From {{source}}',
  },
  suggestion: {
    free: '{{group}} on {{date}} {{start}}–{{end}} is free this week',
    switch: 'Switch',
    keep: 'Keep',
  },
  sessions: {
    title: 'All sessions',
    week: 'Week {{week}}',
    total_one: '{{count}} session',
    total_other: '{{count}} sessions',
    clashes_one: '{{count}} clash',
    clashes_other: '{{count}} clashes',
    rooms_one: '{{count}} room',
    rooms_other: '{{count}} rooms',
    next: 'Next',
    chips: {
      clash: 'Clash',
      partialClash: '{{minutes}} min clash',
      roomChanged: 'Room changed',
      cancelled: 'Cancelled',
      swapped: 'Swapped',
      skipping: 'Skipping',
      swapUnavailable: 'Swap unavailable',
    },
  },
  footer: {
    source: 'Times from Sisu',
    updated: 'updated {{time}}',
    sourceWithLinked_one: 'Times from Sisu and {{count}} linked timetable',
    sourceWithLinked_other: 'Times from Sisu and {{count}} linked timetables',
  },
  linked: {
    unreachable: 'Timetable link unreachable',
    retry: 'Retry',
    refresh: 'Refresh',
    edit: 'Edit link',
    remove: 'Remove link',
    sisuHasTimes: 'Sisu now has times for this course',
  },
  timetable: {
    title: 'Timetable link',
    label: 'Timetable link (TimeEdit, or any calendar link ending in .ics)',
    preview: 'Preview',
    save: 'Save',
    cancel: 'Cancel',
    loading: 'Loading timetable',
    needsPermission: 'Sisu+ needs permission to read {{host}}',
    allow: 'Allow',
    waiting: 'Waiting for permission…',
    summary_one: '{{count}} session · {{first}}–{{last}}',
    summary_other: '{{count}} sessions · {{first}}–{{last}}',
    pattern: 'Mostly {{pattern}}',
    matched: '{{matched}} of {{total}} events mention {{code}}',
    firstOnly_one: '{{count}} repeating event shown once',
    firstOnly_other: '{{count}} repeating events shown once',
    recentOnly: '{{source}} only shares recent and upcoming sessions',
    empty: 'No sessions in this term',
    errors: {
      invalid: "That doesn't look like a calendar link. Paste a https link to a TimeEdit page or an .ics file.",
      permission: 'Sisu+ is not allowed to read this site.',
      network: 'The timetable could not be reached.',
      notCalendar: 'That link did not return a calendar.',
      tooLarge: 'That calendar is too large to load.',
    },
  },
  states: {
    loading: 'Loading calendar',
    error: 'The calendar could not be loaded.',
    retry: 'Try again',
    emptyWeek: 'No teaching this week',
    emptyDay: 'No teaching this day',
    emptyTerm: 'No enrolments with teaching this term.',
  },
  aria: {
    session: '{{kind}}, {{course}}, {{date}} {{start}} to {{end}}, {{room}}',
    clash: 'clashes with {{names}}',
    moreSessions: '{{count}} more at this time: {{names}}',
    alternative: 'Other group, not attending: {{course}}, {{group}}, {{date}} {{start}} to {{end}}',
  },
  plan: {
    saveFailed: "Couldn't save that change. It only lasts until you leave this page.",
  },
  groups: {
    title: 'Groups',
    choose: 'choose {{max}} of {{count}}',
    count_one: '{{count}} group',
    count_other: '{{count}} groups',
    question: {
      lecture: 'Which lecture group do you go to?',
      exercise: 'Which tutorial group do you go to?',
      lab: 'Which lab group do you go to?',
      seminar: 'Which seminar group do you go to?',
      exam: 'Which exam do you take?',
      other: 'Which group do you go to?',
    },
    varies: 'It varies week to week',
    variesDetail: 'Every group shown in your calendar stays in your timetable',
    swapHint: 'The other groups stay in the calendar as dashed swap options.',
    visibility: 'Shown in Sisu calendar · {{on}} of {{total}}',
    visibilityHint: 'These switches change your Sisu calendar too.',
    notInCalendar: 'Not in your calendar',
    nowShown: 'Now shown in your Sisu calendar.',
    nowHidden: 'Now hidden from your Sisu calendar.',
    undo: 'Undo',
    showInCalendar: 'Show in calendar',
    sessions_one: '{{count}} session',
    sessions_other: '{{count}} sessions',
    fitsAll: 'Fits all {{count}}',
    clashes: 'Clashes {{count}} of {{total}} · {{names}}',
    noSessions: 'No sessions this term',
    sameAs: 'Same sessions as {{name}}',
    sharesWith: 'Shares {{count}} sessions with {{name}}',
    stillShown: 'Still shown through {{names}}',
    hideThatToo: 'Hide that too',
    changeInSisu: 'Change this in Sisu',
    loading: 'Loading groups',
    failed: 'Group times could not be loaded.',
  },
  visibility: {
    failed: "Sisu didn't accept the change. Try again.",
  },
  views: {
    label: 'Calendar view',
    day: 'Day',
    week: 'Week',
    month: 'Month',
    year: 'Year',
  },
  navigation: {
    previous: { day: 'Previous day', week: 'Previous week', month: 'Previous month', year: 'Previous academic year' },
    next: { day: 'Next day', week: 'Next week', month: 'Next month', year: 'Next academic year' },
  },
  agenda: {
    title: 'Agenda',
    today: 'Today',
    next: 'Next',
    now: 'Now',
    until: 'until {{time}}',
    inMinutes: 'in {{minutes}} min',
    inHours: 'in {{hours}} h {{minutes}} min',
    inWholeHours: 'in {{hours}} h',
    tomorrow: 'Tomorrow',
    inDays_one: 'in {{count}} day',
    inDays_other: 'in {{count}} days',
    restOfToday: 'Rest of today',
    onDay: 'On {{date}}',
    tomorrowFirst: "Tomorrow's first class",
    firstOn: 'First class on {{date}}',
    noUpcoming: 'No upcoming classes',
    clashWith: 'Clashes with {{names}}',
    skipping: 'Skipping',
  },
  month: {
    hours: '{{hours}} h',
    exam: '{{course}} {{time}}',
    cancelled: '{{course}} {{kind}}',
    roomChange: '{{course}} → {{room}}',
    clash: '{{first}} × {{second}} {{time}}',
    periodStarts: '{{period}} starts',
    noTeaching: 'No teaching',
    openWeek: 'Open week {{week}}',
    moreDeadlines_one: '+{{count}} deadline',
    moreDeadlines_other: '+{{count}} deadlines',
  },
  holidays: {
    newYear: "New Year's Day",
    epiphany: 'Epiphany',
    goodFriday: 'Good Friday',
    easterSunday: 'Easter Sunday',
    easterMonday: 'Easter Monday',
    mayDay: 'May Day',
    ascension: 'Ascension Day',
    whitsun: 'Whitsun',
    midsummerEve: 'Midsummer Eve',
    midsummerDay: 'Midsummer Day',
    allSaints: "All Saints' Day",
    independence: 'Independence Day',
    christmasEve: 'Christmas Eve',
    christmasDay: 'Christmas Day',
    stStephens: "St Stephen's Day",
  },
  year: {
    less: 'Less',
    more: 'More',
    exam: 'Exam',
    clash: 'Clash',
    holiday: 'Public holiday',
    noTeaching: 'No teaching',
    exams: 'Exams',
    noExams: 'No upcoming exams',
    heaviest: 'Heaviest weeks',
    weekRange: 'Wk {{week}}',
    hours: '{{hours}} h',
    nextTerm: 'Next term',
    autumn: 'autumn',
    spring: 'spring',
    emptyTerm: 'No classes in your calendar for {{term}} yet.',
    planned_one: '{{count}} course is planned there in your Timeline.',
    planned_other: '{{count}} courses are planned there in your Timeline.',
    cellAria: '{{date}}: {{hours}} h',
  },
  notes: calendarNotesTranslation,
  deadlines: calendarDeadlinesTranslation,
  exportPanel: calendarExportTranslation,
  reminders: calendarRemindersTranslation,
};
