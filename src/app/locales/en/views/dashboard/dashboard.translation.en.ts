export type DashboardTranslation = {
  title: string;
  periodLabel: {
    autumn: string;
    spring: string;
    summer: string;
    ongoing: string;
    firstPeriod: string;
    secondPeriod: string;
    thirdPeriod: string;
    fourthPeriod: string;
  };
  semesterLabel: {
    autumn: string;
    spring: string;
    summer: string;
  };
  studyRight: {
    until: string;
  };
  notificationNudge: {
    dismiss: string;
    eyebrow: string;
    openSetup: string;
    openUnread: string;
    setupBody: string;
    setupTitle: string;
    unreadBody: string;
    unreadTitle: string;
  };
  hero: {
    greetingMorning: string;
    greetingAfternoon: string;
    greetingEvening: string;
    editHero: string;
    doneEditing: string;
    loadingName: string;
    studentFallback: string;
    creditsLabel: string;
    editPanel: string;
    stats: {
      gradeAvg: string;
      activeCourses: string;
      creditsLeft: string;
      studyRight: string;
      urgentDeadlines: string;
      completionPct: string;
      creditsDone: string;
      nextDue: string;
      creditsThisPeriod: string;
    };
    statSubs: {
      enrolled: string;
      toTarget: string;
      thisWeek: string;
      ofDegree: string;
      ofCredits: string;
      thisPeriod: string;
    };
    panel: {
      ring: string;
      upcoming: string;
      gradeTrend: string;
      creditVelocity: string;
      calendar: string;
    };
    panelUpcomingEmpty: string;
  };
  widgets: {
    actions: {
      closeEditor: string;
      grow: string;
      noSpace: string;
      openRegistration: string;
      openTimeline: string;
      remove: string;
      resize: string;
      resizeHorizontally: string;
      resizeVertically: string;
      shrink: string;
    };
    moodleDeadlines: {
      title: string;
      live: string;
      openMoodle: string;
      emptyTitle: string;
      emptyBody: string;
      nextPressure: string;
      noUrgentItems: string;
      urgentItems: string;
      tone: {
        overdue: string;
        urgent: string;
        soon: string;
        later: string;
      };
    };
    activeCourses: {
      title: string;
      empty: string;
    };
    eyebrows: {
      activeCourses: string;
      courseMap: string;
      creditPace: string;
      creditsVelocity: string;
      degreeCompletion: string;
      gradeDonut: string;
      gradeTrend: string;
      moodleDeadlines: string;
      nextExam: string;
      recentAchievements: string;
      semesterStats: string;
      timelinePeek: string;
      upcomingRegistrations: string;
      workloadForecast: string;
    };
    titles: {
      degreeCompletion: string;
      activeCourses: string;
      courseMap: string;
      moodleDeadlines: string;
      semesterStats: string;
      gradeTrend: string;
      creditsVelocity: string;
      timelinePeek: string;
      recentAchievements: string;
      workloadForecast: string;
      gradeDonut: string;
      creditPace: string;
      nextExam: string;
      upcomingRegistrations: string;
    };
    descriptions: {
      degreeCompletion: string;
      activeCourses: string;
      courseMap: string;
      moodleDeadlines: string;
      semesterStats: string;
      gradeTrend: string;
      creditsVelocity: string;
      timelinePeek: string;
      recentAchievements: string;
      workloadForecast: string;
      gradeDonut: string;
      creditPace: string;
      nextExam: string;
      upcomingRegistrations: string;
    };
    courseMap: {
      done: string;
      active: string;
      planned: string;
      noCourses: string;
    };
    degreeCompletion: {
      aria: string;
      paceLabel: string;
      paceLeft: string;
      complete: string;
      creditsLabel: string;
      ofTarget: string;
      avgGradeLabel: string;
      gradedCount: string;
      noneYet: string;
      studyRightLabel: string;
      noModules: string;
    };
    semesterStats: {
      enrolled: string;
      courses: string;
      credits: string;
      thisSemester: string;
      deadlines: string;
      upcoming: string;
    };
    analytics: {
      moreGradesNeeded: string;
      creditWeightedGrades: string;
      improving: string;
      onTrack: string;
      watchPace: string;
      chartAria: string;
      gradeTooltip: string;
      completed: string;
      planned: string;
      courseFallback: string;
      noModule: string;
      noUpcomingCourses: string;
      noCompletedCourses: string;
      nothingPlanned: string;
      creditsLeft: string;
      daysLeft: string;
      creditsPerDay: string;
      creditsPerDayValue: string;
      degreePercent: string;
    };
    registration: {
      closesIn: string;
      daysAway: string;
      daysShort: string;
      noUpcomingExams: string;
      noUpcomingRegistrations: string;
      openNowCount: string;
      opensIn: string;
    };
  };
  actions: {
    customize: string;
    done: string;
  };
  editor: {
    libraryTitle: string;
    libraryDescription: string;
    emptyLibrary: string;
    footerHint: string;
  };
  moodleMissing: {
    title: string;
    subtitle: string;
    description: string;
    button: string;
  };
  grades: {
    pass: string;
  };
  courses: {
    completedCourse: string;
  };
};

export const dashboardTranslation: DashboardTranslation = {
  title: 'Dashboard',
  periodLabel: {
    autumn: 'Autumn',
    spring: 'Spring',
    summer: 'Summer',
    ongoing: 'Period ongoing',
    firstPeriod: '1st',
    secondPeriod: '2nd',
    thirdPeriod: '3rd',
    fourthPeriod: '4th',
  },
  semesterLabel: {
    autumn: 'Autumn',
    spring: 'Spring',
    summer: 'Summer',
  },
  studyRight: {
    until: 'until',
  },
  notificationNudge: {
    dismiss: 'Not now',
    eyebrow: 'Reminders',
    openSetup: 'Choose reminders',
    openUnread: 'Open notifications',
    setupBody: 'Sisu+ can turn Moodle deadlines and registration windows into in-app or desktop reminders.',
    setupTitle: 'Set up study reminders from this dashboard.',
    unreadBody: 'Open the Control Center to review what fired while you were away.',
    unreadTitle: '{{count}} reminder waiting',
  },
  hero: {
    greetingMorning: 'Good morning,',
    greetingAfternoon: 'Good afternoon,',
    greetingEvening: 'Good evening,',
    editHero: 'Edit overview',
    doneEditing: 'Done',
    loadingName: 'Loading',
    studentFallback: 'student',
    creditsLabel: '{{done}} / {{total}} cr',
    editPanel: 'Panel view',
    stats: {
      gradeAvg: 'Grade avg.',
      activeCourses: 'Active courses',
      creditsLeft: 'Credits left',
      studyRight: 'Study right',
      urgentDeadlines: 'Urgent deadlines',
      completionPct: 'Completion',
      creditsDone: 'Credits done',
      nextDue: 'Next due',
      creditsThisPeriod: 'This period',
    },
    statSubs: {
      enrolled: 'enrolled',
      toTarget: 'to target',
      thisWeek: 'this week',
      ofDegree: 'of degree',
      ofCredits: 'of {{total}} cr',
      thisPeriod: 'this period',
    },
    panel: {
      ring: 'Progress ring',
      upcoming: 'Upcoming',
      gradeTrend: 'Grade trend',
      creditVelocity: 'Credit velocity',
      calendar: 'Calendar',
    },
    panelUpcomingEmpty: 'No upcoming deadlines',
  },
  widgets: {
    actions: {
      closeEditor: 'Close dashboard editor',
      grow: 'Grow {{title}}',
      noSpace: 'No space',
      openRegistration: 'Registration',
      openTimeline: 'Timeline',
      remove: 'Remove {{title}}',
      resize: 'Resize {{title}}',
      resizeHorizontally: 'Resize {{title}} horizontally',
      resizeVertically: 'Resize {{title}} vertically',
      shrink: 'Shrink {{title}}',
    },
    moodleDeadlines: {
      title: 'Moodle Deadlines',
      live: 'LIVE',
      openMoodle: 'Open Moodle',
      emptyTitle: 'No deadlines approaching',
      emptyBody: 'Moodle sync is connected, but there is nothing urgent.',
      nextPressure: 'Next deadline pressure',
      noUrgentItems: 'No urgent items',
      urgentItems: '{{count}} urgent item(s)',
      tone: {
        overdue: 'Overdue',
        urgent: 'Urgent',
        soon: 'Soon',
        later: 'Later',
      },
    },
    activeCourses: {
      title: 'Current & Upcoming Courses',
      empty: 'No current or upcoming courses',
    },
    eyebrows: {
      activeCourses: 'Enrolled',
      courseMap: 'Study plan',
      creditPace: 'Goal tracking',
      creditsVelocity: 'Pace',
      degreeCompletion: 'Progress',
      gradeDonut: 'All attainments',
      gradeTrend: 'Performance',
      moodleDeadlines: 'Moodle',
      nextExam: 'Examinations',
      recentAchievements: 'Completed',
      semesterStats: 'At a glance',
      timelinePeek: 'Ahead',
      upcomingRegistrations: 'Course registration',
      workloadForecast: 'Forecast',
    },
    titles: {
      degreeCompletion: 'Degree Completion',
      activeCourses: 'Current & Upcoming Courses',
      courseMap: 'Course Map',
      moodleDeadlines: 'Moodle Deadlines',
      semesterStats: 'This Semester',
      gradeTrend: 'Grade Trend',
      creditsVelocity: 'Credits Velocity',
      timelinePeek: 'Timeline Peek',
      recentAchievements: 'Recent Achievements',
      workloadForecast: 'Workload Forecast',
      gradeDonut: 'Grade Distribution',
      creditPace: 'Credit Pace',
      nextExam: 'Next Exam',
      upcomingRegistrations: 'Upcoming Registrations',
    },
    descriptions: {
      degreeCompletion: 'Module progress and degree completion ring.',
      activeCourses: 'Current and future enrolments with module and credit badges.',
      courseMap: 'Active and completed courses grouped by module.',
      moodleDeadlines: 'Live deadline cards from Moodle calendar.',
      semesterStats: 'Enrolled courses, active credits, and upcoming deadlines.',
      gradeTrend: 'Completed-course grade scatter plot with credit-weighted dots.',
      creditsVelocity: 'Completed and planned credits grouped by semester.',
      timelinePeek: 'Current and next two periods from the timeline.',
      recentAchievements: 'Latest completed courses with grade and credit badges.',
      workloadForecast: 'Planned credits for upcoming study periods.',
      gradeDonut: 'Numeric grade distribution and average.',
      creditPace: 'Credits left and daily pace needed.',
      nextExam: 'Nearest upcoming exam sitting and the next two dates.',
      upcomingRegistrations: 'Open and upcoming course registrations from the current Study Plan.',
    },
    courseMap: {
      done: 'done',
      active: 'active',
      planned: 'planned',
      noCourses: 'No courses yet.',
    },
    degreeCompletion: {
      aria: 'Degree completion {{percent}} percent',
      paceLabel: 'Degree Pace',
      paceLeft: 'left to target',
      complete: 'complete',
      creditsLabel: 'Credits done',
      ofTarget: 'of {{target}} cr',
      avgGradeLabel: 'Avg. grade',
      gradedCount: '{{count}} graded',
      noneYet: 'none yet',
      studyRightLabel: 'Study right',
      noModules: 'Module progress is not available yet.',
    },
    semesterStats: {
      enrolled: 'Enrolled',
      courses: 'courses',
      credits: 'Credits',
      thisSemester: 'this semester',
      deadlines: 'Deadlines',
      upcoming: 'upcoming',
    },
    analytics: {
      moreGradesNeeded: 'More graded courses needed.',
      creditWeightedGrades: 'Credit-weighted grades over time',
      improving: 'Improving',
      onTrack: 'On track',
      watchPace: 'Watch pace',
      chartAria: 'Grade trend chart',
      gradeTooltip: '{{name}} · grade {{grade}} · {{credits}}',
      completed: 'completed',
      planned: 'planned',
      courseFallback: 'Course',
      noModule: 'No module',
      noUpcomingCourses: 'No upcoming planned courses.',
      noCompletedCourses: 'No completed courses yet.',
      nothingPlanned: 'Nothing planned ahead.',
      creditsLeft: 'Credits left',
      daysLeft: 'Days left',
      creditsPerDay: 'Credits/day needed',
      creditsPerDayValue: '{{value}} {{unit}}/day',
      degreePercent: '{{percent}}% of degree',
    },
    registration: {
      closesIn: 'Closes in {{count}}d',
      daysAway: 'days away',
      daysShort: '{{count}}d',
      noUpcomingExams: 'No upcoming exams.',
      noUpcomingRegistrations: 'No upcoming registrations.',
      openNowCount: '{{count}} open now',
      opensIn: 'Opens in {{count}}d',
    },
  },
  actions: {
    customize: 'Customize Dashboard',
    done: 'Done Editing',
  },
  editor: {
    libraryTitle: 'Widget Library',
    libraryDescription: 'Add, remove, drag, and resize dashboard cards.',
    emptyLibrary: 'All widgets are on the board.',
    footerHint: 'Drag widgets onto the dotted grid. Use + and - on each card to resize within its min and max size.',
  },
  moodleMissing: {
    title: 'Configuration missing',
    subtitle: 'You need to first configure Moodle calendar.',
    description: 'Head over to Moodle and export calendar URL with options: All Events and choose Custom Date Range.',
    button: 'Head over to Moodle',
  },
  grades: {
    pass: 'Pass',
  },
  courses: {
    completedCourse: 'Completed course',
  },
};
