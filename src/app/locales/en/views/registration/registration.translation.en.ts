export type RegistrationTranslation = {
  actions: {
    cancel: string;
    change: string;
    confirm: string;
    confirming: string;
    fixCourseRights: string;
    register: string;
    saveSelection: string;
    savingSelection: string;
    updateView: string;
  };
  dialog: {
    close: string;
    completion: string;
    course: string;
    courseTitle: string;
    examTitle: string;
    explanation: string;
    registrationCloses: string;
    registrationStarts: string;
    studyGroup: string;
    selectRange: string;
    selectAny: string;
    version: string;
    whatHappensBody: string;
    whatHappensTitle: string;
  };
  empty: {
    noAvailableBody: string;
    noAvailableCourses: string;
    noAvailableExams: string;
    noConfirmedBody: string;
    noConfirmed: string;
    noPlannedBody: string;
    noPlanned: string;
  };
  labels: {
    availableExams: string;
    cancelBy: string;
    closed: string;
    courseRegistration: string;
    exam: string;
    examRegistration: string;
    examRegistrationsConfirmed: string;
    finished: string;
    noOpenOption: string;
    noOpenRegistration: string;
    implementationOption: string;
    implementationOptions: string;
    open: string;
    openOption: string;
    openOptions: string;
    registrationClosed: string;
    registrationNotOpen: string;
    registrationStarts: string;
    registrationProcessed: string;
    selected: string;
    selectedUpcoming: string;
    selectedImplementation: string;
    selectImplementation: string;
    selectSitting: string;
    selectBeforeRegistering: string;
    showAttempts: string;
    totalCredits: string;
    upcoming: string;
    withdrawing: string;
    withdraw: string;
    cancelling: string;
    checkSisuLater: string;
    courseExamRegistration: string;
    courseImplementation: string;
    datesNotPublished: string;
    examDateNotPublished: string;
    examImplementation: string;
    fromDate: string;
    reRegister: string;
    untilDate: string;
  };
  messages: {
    cancellationFailed: string;
    registrationFailed: string;
    refreshSent: string;
    refreshed: string;
    registrationSent: string;
    selectionSaved: string;
    viewUpdated: string;
  };
  status: {
    registered: string;
    processing: string;
    rejected: string;
    notSelected: string;
    notEnrolled: string;
  };
  subtitle: string;
  title: string;
};

export const registrationTranslation: RegistrationTranslation = {
  actions: {
    cancel: 'Cancel',
    change: 'Change',
    confirm: 'Confirm',
    confirming: 'Confirming',
    fixCourseRights: 'Fix course rights',
    register: 'Register',
    saveSelection: 'Save selection',
    savingSelection: 'Saving',
    updateView: 'Update view',
  },
  dialog: {
    close: 'Close dialog',
    completion: 'Completion',
    course: 'Course',
    courseTitle: 'Select a course implementation',
    examTitle: 'Select an exam sitting',
    explanation: 'Confirm the option you want Sisu to register for this course.',
    registrationCloses: 'Registration closes {{date}}',
    registrationStarts: 'Registration starts {{date}}',
    studyGroup: 'Study group',
    selectRange: 'select {{range}}',
    selectAny: 'any',
    version: 'Version',
    whatHappensTitle: 'What happens after confirmation?',
    whatHappensBody:
      'Sisu+ creates the enrolment if needed and sends your selected implementation or sitting to Sisu. Confirmed registrations will appear in the right column after the view refreshes.',
  },
  empty: {
    noAvailableBody: "You've registered for all implementations that are currently available for registration.",
    noAvailableCourses: 'No courses ready to register',
    noAvailableExams: 'No available exam sittings',
    noConfirmed: 'No confirmed registrations',
    noConfirmedBody:
      'When you register for a course or exam, the registration will first be processed. Once done, it will appear here.',
    noPlanned: 'No planned courses with registration data',
    noPlannedBody: 'Add courses to your plan first, then return here when implementations are published.',
  },
  labels: {
    availableExams: 'Available exams',
    cancelBy: 'Cancel by {{date}}',
    closed: 'Closed',
    courseRegistration: 'Course Registration',
    exam: 'Exam',
    examRegistration: 'Exam Registration',
    examRegistrationsConfirmed: 'Exam registrations confirmed',
    finished: 'Finished',
    noOpenOption: 'No open option',
    noOpenRegistration: 'No open registration',
    implementationOption: '{{count}} implementation',
    implementationOptions: '{{count}} implementations',
    open: 'Open',
    openOption: '{{count}} open option',
    openOptions: '{{count}} open options',
    registrationClosed: 'Registration is closed or no published implementations.',
    registrationNotOpen: 'Not open yet',
    registrationStarts: 'Registration starts {{date}}',
    registrationProcessed: 'Registration processed',
    selected: 'Selected',
    selectedUpcoming: 'Selected',
    selectedImplementation: 'Selected implementation',
    selectBeforeRegistering: 'Select an implementation before registering.',
    selectImplementation: 'Select implementation',
    selectSitting: 'Select sitting',
    showAttempts: 'Show attempts',
    totalCredits: 'cr total',
    upcoming: 'Upcoming',
    withdrawing: 'Withdrawing',
    withdraw: 'Withdraw',
    cancelling: 'Cancelling',
    checkSisuLater: 'Check Sisu later',
    courseExamRegistration: 'Course & Exam Registration',
    courseImplementation: 'Course implementation',
    datesNotPublished: 'Dates not published',
    examDateNotPublished: 'Exam date not published',
    examImplementation: 'Exam',
    fromDate: 'From {{date}}',
    reRegister: 'Re-register',
    untilDate: 'Until {{date}}',
  },
  messages: {
    cancellationFailed: 'Cancellation failed.',
    registrationFailed: 'Registration failed.',
    refreshSent: 'Registration update sent to Sisu. Refreshing view...',
    refreshed: 'Registration view refreshed.',
    registrationSent: 'Registration sent to Sisu. Refreshing view...',
    selectionSaved: 'Implementation selection saved. Refreshing view...',
    viewUpdated: 'Registration view updated.',
  },
  status: {
    registered: 'Registered',
    processing: 'Processing',
    rejected: 'Needs attention',
    notSelected: 'No implementation',
    notEnrolled: 'Open',
  },
  subtitle: 'Select implementations, register for courses and exams.',
  title: 'Enrolments',
};
