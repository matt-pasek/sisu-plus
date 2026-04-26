import { DashboardWidgetLayout, DEFAULT_DASHBOARD_LAYOUT } from '@/app/views/dashboard/components/dashboardWidgets';

export interface SisuPrefs {
  sisuPlusActive: boolean;
  moodleToken: string | null;
  dashboardLayout: DashboardWidgetLayout[];
}

export const DEFAULT_PREFS: SisuPrefs = {
  sisuPlusActive: true,
  moodleToken: null,
  dashboardLayout: DEFAULT_DASHBOARD_LAYOUT,
};
