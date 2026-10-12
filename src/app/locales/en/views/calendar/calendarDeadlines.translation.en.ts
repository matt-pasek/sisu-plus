export type CalendarDeadlinesTranslation = {
  layer: string;
  legend: string;
  connect: string;
  connectHint: string;
  unavailable: string;
  retry: string;
  allDay: string;
  more: string;
  moreAria: string;
  chip: string;
  chipAria: string;
  due: string;
  past: string;
  openInMoodle: string;
  noCourse: string;
  monthLine: string;
  yearDots_one: string;
  yearDots_other: string;
  dueSoon: string;
  dueToday: string;
  dueTomorrow: string;
  dueInDays: string;
  dueRow: string;
};

export const calendarDeadlinesTranslation: CalendarDeadlinesTranslation = {
  layer: 'Moodle deadlines',
  legend: 'Deadline',
  connect: 'Connect Moodle',
  connectHint: 'Export your Moodle calendar link and paste it in the Sisu+ popup.',
  unavailable: 'Moodle unavailable',
  retry: 'Retry',
  allDay: 'All day',
  more: '+{{count}}',
  moreAria: '{{count}} more on {{date}}',
  chip: '{{time}} {{title}}',
  chipAria: 'Deadline: {{title}}, {{course}}, {{date}} {{time}}',
  due: 'Due {{date}} {{time}}',
  past: 'Past due',
  openInMoodle: 'Open in Moodle',
  noCourse: 'Moodle',
  monthLine: '{{time}} {{title}}',
  yearDots_one: '{{count}} deadline',
  yearDots_other: '{{count}} deadlines',
  dueSoon: 'Due soon',
  dueToday: 'today',
  dueTomorrow: 'tomorrow',
  dueInDays: 'in {{count}} days',
  dueRow: '{{date}} {{time}} · {{relative}}',
};
