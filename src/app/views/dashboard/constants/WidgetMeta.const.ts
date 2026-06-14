import { WidgetIcon } from '@/app/views/dashboard/components/widget/WidgetIcon.comp';
import { DashboardWidgetId } from '@/app/views/dashboard/types/DashboardWidgetId.type';

type WidgetIconName = Parameters<typeof WidgetIcon>[0]['name'];

interface WidgetMeta {
  icon: WidgetIconName;
  eyebrowKey: string;
}

export const WIDGET_META: Record<DashboardWidgetId, WidgetMeta> = {
  'degree-completion': { icon: 'degree', eyebrowKey: 'degreeCompletion' },
  'active-courses': { icon: 'courses', eyebrowKey: 'activeCourses' },
  'moodle-deadlines': { icon: 'moodle', eyebrowKey: 'moodleDeadlines' },
  'semester-stats': { icon: 'stats', eyebrowKey: 'semesterStats' },
  'grade-trend': { icon: 'grade', eyebrowKey: 'gradeTrend' },
  'credits-velocity': { icon: 'velocity', eyebrowKey: 'creditsVelocity' },
  'timeline-peek': { icon: 'timeline', eyebrowKey: 'timelinePeek' },
  'recent-achievements': { icon: 'trophy', eyebrowKey: 'recentAchievements' },
  'workload-forecast': { icon: 'workload', eyebrowKey: 'workloadForecast' },
  'grade-donut': { icon: 'donut', eyebrowKey: 'gradeDonut' },
  'credit-pace': { icon: 'pace', eyebrowKey: 'creditPace' },
  'next-exam': { icon: 'exam', eyebrowKey: 'nextExam' },
  'upcoming-registrations': { icon: 'registration', eyebrowKey: 'upcomingRegistrations' },
  'course-map': { icon: 'map', eyebrowKey: 'courseMap' },
};
