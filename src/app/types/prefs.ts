import { DashboardWidgetLayout, DEFAULT_DASHBOARD_LAYOUT } from '@/app/views/dashboard/util/widgetsHandlers';
import { DEFAULT_LOCALE, Locale } from '@/app/locales/locale';
import type { UniversityConfig } from './universityConfig';

export type HeroStatId = 'grade-avg' | 'active-courses' | 'credits-left' | 'study-right' | 'urgent-deadlines';

export interface SisuPrefs {
  locale: Locale;
  sisuPlusActive: boolean;
  moodleToken: string | null;
  dashboardLayout: DashboardWidgetLayout[];
  heroStats: HeroStatId[];
  sisuPlusOnboardingCompleted: boolean;
  sisuPlusOnboardingStep: number;
  universityConfig: UniversityConfig | null;
}

export const DEFAULT_PREFS: SisuPrefs = {
  locale: DEFAULT_LOCALE,
  sisuPlusActive: false,
  moodleToken: null,
  dashboardLayout: DEFAULT_DASHBOARD_LAYOUT,
  heroStats: ['grade-avg', 'active-courses', 'credits-left'],
  sisuPlusOnboardingCompleted: false,
  sisuPlusOnboardingStep: 0,
  universityConfig: null,
};
