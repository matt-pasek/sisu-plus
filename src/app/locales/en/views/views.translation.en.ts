import { CalendarTranslation, calendarTranslation } from '@/app/locales/en/views/calendar/calendar.translation.en';
import { DashboardTranslation, dashboardTranslation } from '@/app/locales/en/views/dashboard/dashboard.translation.en';
import {
  RegistrationTranslation,
  registrationTranslation,
} from '@/app/locales/en/views/registration/registration.translation.en';
import { StructureTranslation, structureTranslation } from '@/app/locales/en/views/structure/structure.translation.en';
import { TimelineTranslation, timelineTranslation } from '@/app/locales/en/views/timeline/timeline.translation.en';

export type ViewsTranslation = {
  calendar: CalendarTranslation;
  dashboard: DashboardTranslation;
  registration: RegistrationTranslation;
  structure: StructureTranslation;
  timeline: TimelineTranslation;
};

export const viewsTranslation: ViewsTranslation = {
  calendar: calendarTranslation,
  dashboard: dashboardTranslation,
  registration: registrationTranslation,
  structure: structureTranslation,
  timeline: timelineTranslation,
};
