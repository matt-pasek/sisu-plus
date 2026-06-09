import { DEFAULT_LOCALE, Locale } from '@/app/locales/locale';
import type { UniversityConfig } from './universityConfig';
import { DashboardWidgetLayout, HeroStatId, HeroPanelId } from '@/app/views/dashboard/types';
import { DEFAULT_DASHBOARD_LAYOUT } from '@/app/views/dashboard/constants/widgetDefinitions.const';
import { DEFAULT_HERO_PANEL, DEFAULT_HERO_STATS } from '@/app/views/dashboard/constants/heroDefinitions.const';

export interface SisuPrefs {
  locale: Locale;
  sisuPlusActive: boolean;
  moodleToken: string | null;
  dashboardLayout: DashboardWidgetLayout[];
  heroStats: HeroStatId[];
  heroPanel: HeroPanelId;
  sisuPlusOnboardingCompleted: boolean;
  sisuPlusOnboardingStep: number;
  universityConfig: UniversityConfig | null;
}

export const DEFAULT_PREFS: SisuPrefs = {
  locale: DEFAULT_LOCALE,
  sisuPlusActive: false,
  moodleToken: null,
  dashboardLayout: DEFAULT_DASHBOARD_LAYOUT,
  heroStats: DEFAULT_HERO_STATS,
  heroPanel: DEFAULT_HERO_PANEL,
  sisuPlusOnboardingCompleted: false,
  sisuPlusOnboardingStep: 0,
  universityConfig: null,
};
