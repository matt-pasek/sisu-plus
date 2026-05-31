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
  widgets: {
    actions: {
      closeEditor: string;
      grow: string;
      noSpace: string;
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
    titles: {
      degreeCompletion: string;
      activeCourses: string;
      moodleDeadlines: string;
      semesterStats: string;
      gradeTrend: string;
      creditsVelocity: string;
      timelinePeek: string;
      recentAchievements: string;
      workloadForecast: string;
      graduationCountdown: string;
    };
    descriptions: {
      degreeCompletion: string;
      activeCourses: string;
      moodleDeadlines: string;
      semesterStats: string;
      gradeTrend: string;
      creditsVelocity: string;
      timelinePeek: string;
      recentAchievements: string;
      workloadForecast: string;
      graduationCountdown: string;
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
  widgets: {
    actions: {
      closeEditor: 'Close dashboard editor',
      grow: 'Grow {{title}}',
      noSpace: 'No space',
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
    titles: {
      degreeCompletion: 'Degree Completion',
      activeCourses: 'Current & Upcoming Courses',
      moodleDeadlines: 'Moodle Deadlines',
      semesterStats: 'This Semester',
      gradeTrend: 'Grade Trend',
      creditsVelocity: 'Credits Velocity',
      timelinePeek: 'Timeline Peek',
      recentAchievements: 'Recent Achievements',
      workloadForecast: 'Workload Forecast',
      graduationCountdown: 'Graduation Countdown',
    },
    descriptions: {
      degreeCompletion: 'Target credits, study right, grade average, and module progress.',
      activeCourses: 'Current and future enrolments with module and credit badges.',
      moodleDeadlines: 'Live deadline cards from Moodle calendar.',
      semesterStats: 'Enrolled courses, active credits, and upcoming deadlines.',
      gradeTrend: 'Completed-course grade scatter plot with credit-weighted dots.',
      creditsVelocity: 'Completed and planned credits grouped by semester.',
      timelinePeek: 'Current and next two periods from the timeline.',
      recentAchievements: 'Latest completed courses with grade and credit badges.',
      workloadForecast: 'Planned credits for upcoming study periods.',
      graduationCountdown: 'Credits remaining, days remaining, and pace pressure.',
    },
    degreeCompletion: {
      aria: 'Degree completion {{percent}} percent',
      paceLabel: 'Degree Pace',
      paceLeft: 'You have {{credits}} left.',
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
