import type { DashboardWidgetDefinition, DashboardWidgetLayout } from '../types';

export const DASHBOARD_COLUMNS = 10;
export const DASHBOARD_ROWS = 16;

export const DASHBOARD_WIDGETS: DashboardWidgetDefinition[] = [
  {
    id: 'degree-completion',
    title: 'Degree Completion',
    description: 'Target credits, study right, grade average, and module progress.',
    size: { w: 7, h: 4 },
    minSize: { w: 5, h: 3 },
    maxSize: { w: 10, h: 5 },
  },
  {
    id: 'moodle-deadlines',
    title: 'Moodle Deadlines',
    description: 'Live deadline cards from Moodle calendar.',
    size: { w: 3, h: 5 },
    minSize: { w: 3, h: 4 },
    maxSize: { w: 4, h: 8 },
  },
  {
    id: 'active-courses',
    title: 'Current & Upcoming Courses',
    description: 'Current and future enrolments with module and credit badges.',
    size: { w: 7, h: 4 },
    minSize: { w: 5, h: 3 },
    maxSize: { w: 10, h: 6 },
  },
  {
    id: 'semester-stats',
    title: 'This Semester',
    description: 'Enrolled courses, active credits, and upcoming deadlines.',
    size: { w: 3, h: 4 },
    minSize: { w: 3, h: 2 },
    maxSize: { w: 4, h: 4 },
  },
  {
    id: 'grade-trend',
    title: 'Grade Trend',
    description: 'Completed-course grade scatter plot with credit-weighted dots.',
    size: { w: 5, h: 4 },
    minSize: { w: 4, h: 3 },
    maxSize: { w: 7, h: 5 },
  },
  {
    id: 'credits-velocity',
    title: 'Credits Velocity',
    description: 'Completed and planned credits grouped by semester.',
    size: { w: 7, h: 3 },
    minSize: { w: 5, h: 3 },
    maxSize: { w: 10, h: 4 },
  },
  {
    id: 'timeline-peek',
    title: 'Timeline Peek',
    description: 'Current and next two periods from the timeline.',
    size: { w: 3, h: 5 },
    minSize: { w: 3, h: 4 },
    maxSize: { w: 4, h: 7 },
  },
  {
    id: 'recent-achievements',
    title: 'Recent Achievements',
    description: 'Latest completed courses with grade and credit badges.',
    size: { w: 3, h: 4 },
    minSize: { w: 3, h: 3 },
    maxSize: { w: 5, h: 5 },
  },
  {
    id: 'workload-forecast',
    title: 'Workload Forecast',
    description: 'Planned credits for upcoming study periods.',
    size: { w: 5, h: 3 },
    minSize: { w: 4, h: 3 },
    maxSize: { w: 7, h: 4 },
  },
  {
    id: 'graduation-countdown',
    title: 'Graduation Countdown',
    description: 'Credits remaining, days remaining, and pace pressure.',
    size: { w: 3, h: 2 },
    minSize: { w: 3, h: 2 },
    maxSize: { w: 4, h: 3 },
  },
];

export const DEFAULT_DASHBOARD_LAYOUT: DashboardWidgetLayout[] = [
  { id: 'degree-completion', x: 0, y: 0, w: 7, h: 4 },
  { id: 'moodle-deadlines', x: 7, y: 0, w: 3, h: 5 },
  { id: 'active-courses', x: 0, y: 4, w: 7, h: 4 },
  { id: 'semester-stats', x: 7, y: 5, w: 3, h: 3 },
  { id: 'grade-trend', x: 0, y: 8, w: 5, h: 4 },
  { id: 'credits-velocity', x: 5, y: 8, w: 5, h: 3 },
];
