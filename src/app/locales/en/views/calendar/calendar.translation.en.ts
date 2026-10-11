export type CalendarTranslation = {
  title: string;
  weekLabel: string;
  weekShort: string;
  weekendShort: string;
  weekendFree: string;
  timeZoneNote: string;
  actions: {
    today: string;
    previous: string;
    next: string;
    refresh: string;
    close: string;
    allSessions: string;
    showClash: string;
    openRegistration: string;
  };
  toolbar: {
    clashes_one: string;
    clashes_other: string;
  };
  sidebar: {
    courses: string;
    layers: string;
    cancelled: string;
    exam: string;
    previousMonth: string;
    nextMonth: string;
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
    };
  };
  footer: {
    source: string;
    updated: string;
  };
  states: {
    loading: string;
    error: string;
    retry: string;
    emptyWeek: string;
    emptyTerm: string;
  };
  aria: {
    session: string;
    clash: string;
    moreSessions: string;
  };
  plan: {
    saveFailed: string;
  };
};

export const calendarTranslation: CalendarTranslation = {
  title: 'Calendar',
  weekLabel: 'Week {{week}}',
  weekShort: 'WK {{week}}',
  weekendShort: 'S–S',
  weekendFree: 'Weekend free',
  timeZoneNote: 'Times shown in Finnish time',
  actions: {
    today: 'Today',
    previous: 'Previous week',
    next: 'Next week',
    refresh: 'Refresh',
    close: 'Close',
    allSessions: 'All sessions',
    showClash: 'Show the first clash',
    openRegistration: 'Open Registration',
  },
  toolbar: {
    clashes_one: '{{count}} clash',
    clashes_other: '{{count}} clashes',
  },
  sidebar: {
    courses: 'Courses',
    layers: 'Layers',
    cancelled: 'Cancelled sessions',
    exam: 'Exam',
    previousMonth: 'Previous month',
    nextMonth: 'Next month',
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
    },
  },
  footer: {
    source: 'Times from Sisu',
    updated: 'updated {{time}}',
  },
  states: {
    loading: 'Loading calendar',
    error: 'The calendar could not be loaded.',
    retry: 'Try again',
    emptyWeek: 'No teaching this week',
    emptyTerm: 'No enrolments with teaching this term.',
  },
  aria: {
    session: '{{kind}}, {{course}}, {{date}} {{start}} to {{end}}, {{room}}',
    clash: 'clashes with {{names}}',
    moreSessions: '{{count}} more at this time: {{names}}',
  },
  plan: {
    saveFailed: "Couldn't save that change. It only lasts until you leave this page.",
  },
};
