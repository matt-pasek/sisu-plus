import { DashboardTranslation, dashboardTranslation } from '@/app/locales/en/views/dashboard/dashboard.translation.en';
import {
  RegistrationTranslation,
  registrationTranslation,
} from '@/app/locales/en/views/registration/registration.translation.en';
import { StructureTranslation, structureTranslation } from '@/app/locales/en/views/structure/structure.translation.en';
import { TimelineTranslation, timelineTranslation } from '@/app/locales/en/views/timeline/timeline.translation.en';

export type ViewsTranslation = {
  dashboard: DashboardTranslation;
  registration: RegistrationTranslation;
  structure: StructureTranslation;
  timeline: TimelineTranslation;
};

export const viewsTranslation: ViewsTranslation = {
  dashboard: dashboardTranslation,
  registration: registrationTranslation,
  structure: structureTranslation,
  timeline: timelineTranslation,
};
