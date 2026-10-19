export type CalendarRemindersTranslation = {
  label: string;
  off: string;
  lead: string;
  until: string;
  setUp: string;
  setUpAria: string;
  change: string;
  changeAria: string;
};

export const calendarRemindersTranslation: CalendarRemindersTranslation = {
  label: 'Class reminders',
  off: 'Off',
  lead: '{{minutes}} min before',
  until: 'until {{date}}',
  setUp: 'Set up',
  setUpAria: 'Set up class reminders',
  change: 'Change',
  changeAria: 'Change class reminders',
};
