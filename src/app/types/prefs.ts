import { DashboardWidgetLayout, DEFAULT_DASHBOARD_LAYOUT } from '@/app/views/dashboard/components/dashboardWidgets';

export interface SisuPrefs {
  sisuPlusActive: boolean;
  moodleToken: string | null;
  dashboardLayout: DashboardWidgetLayout[];
  sisuPlusOnboardingCompleted: boolean;
  sisuPlusOnboardingStep: number;
}

export const DEFAULT_PREFS: SisuPrefs = {
  sisuPlusActive: false,
  moodleToken: null,
  dashboardLayout: DEFAULT_DASHBOARD_LAYOUT,
  sisuPlusOnboardingCompleted: false,
  sisuPlusOnboardingStep: 0,
};
