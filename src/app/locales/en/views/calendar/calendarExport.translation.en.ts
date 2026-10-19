export type CalendarExportTranslation = {
  button: string;
  title: string;
  eyebrow: string;
  linkLabel: string;
  privacy: string;
  copy: string;
  copied: string;
  copyFallback: string;
  loading: string;
  failed: string;
  retry: string;
  includedTitle: string;
  includedGroups: string;
  includedExams: string;
  includedNotes: string;
  notIncludedTitle: string;
  notIncludedSwaps: string;
  notIncludedLinked: string;
  notIncludedMoodle: string;
  howTitle: string;
  google: { name: string; step1: string; step2: string; step3: string };
  apple: { name: string; step1: string; step2: string };
  outlook: { name: string; step1: string; step2: string };
  refreshNote: string;
  moodleTitle: string;
  moodleHint: string;
  reset: string;
  resetQuestion: string;
  resetConfirm: string;
  resetCancel: string;
  resetDone: string;
  resetFailed: string;
};

export const calendarExportTranslation: CalendarExportTranslation = {
  button: 'Export',
  title: 'Export calendar',
  eyebrow: 'Subscribe',
  linkLabel: 'Subscribe link',
  privacy: 'Anyone with this link can see your timetable.',
  copy: 'Copy',
  copied: 'Copied',
  copyFallback: 'Press Ctrl+C or ⌘C to copy.',
  loading: 'Getting your link…',
  failed: "Couldn't get the link.",
  retry: 'Retry',
  includedTitle: "What's in it",
  includedGroups: 'Sisu groups you show in the calendar',
  includedExams: 'Exams',
  includedNotes: 'Your notes',
  notIncludedTitle: 'Not in it',
  notIncludedSwaps: 'Sisu+ swaps and skips',
  notIncludedLinked: 'Linked timetables',
  notIncludedMoodle: 'Moodle deadlines',
  howTitle: 'How to add it',
  google: {
    name: 'Google Calendar',
    step1: 'Open Google Calendar on the web.',
    step2: 'Next to Other calendars, choose + and then From URL.',
    step3: 'Paste the link and choose Add calendar.',
  },
  apple: {
    name: 'Apple Calendar',
    step1: 'In Calendar, choose File → New Calendar Subscription.',
    step2: 'Paste the link and choose Subscribe.',
  },
  outlook: {
    name: 'Outlook',
    step1: 'In Outlook on the web, choose Add calendar → Subscribe from web.',
    step2: 'Paste the link, name the calendar and choose Import.',
  },
  refreshNote: 'Calendar apps refresh subscriptions on their own schedule; Google can take up to a day.',
  moodleTitle: 'Moodle deadlines feed',
  moodleHint: 'Subscribe to this link too to see deadlines in your calendar app.',
  reset: 'Reset link',
  resetQuestion: 'This link stops working; add the new one to your calendar app again.',
  resetConfirm: 'Reset',
  resetCancel: 'Cancel',
  resetDone: 'New link created.',
  resetFailed: "Couldn't reset the link.",
};
