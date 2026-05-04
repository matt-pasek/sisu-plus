import { DashboardWidgetLayout, DEFAULT_DASHBOARD_LAYOUT } from '@/app/views/dashboard/components/dashboardWidgets';
import { DEFAULT_LOCALE, Locale } from '@/app/locales/locale';

export interface SisuPrefs {
  locale: Locale;
  sisuPlusActive: boolean;
  moodleToken: string | null;
  dashboardLayout: DashboardWidgetLayout[];
  sisuPlusOnboardingCompleted: boolean;
  sisuPlusOnboardingStep: number;
}

export const DEFAULT_PREFS: SisuPrefs = {
  locale: DEFAULT_LOCALE,
  sisuPlusActive: false,
  moodleToken: null,
  dashboardLayout: DEFAULT_DASHBOARD_LAYOUT,
  sisuPlusOnboardingCompleted: false,
  sisuPlusOnboardingStep: 0,
};
