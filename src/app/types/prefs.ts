import { DEFAULT_LOCALE, Locale } from '@/app/locales/locale';
import type { UniversityConfig } from './universityConfig';
import { DashboardWidgetLayout, HeroStatId, HeroPanelId } from '@/app/views/dashboard/types';
import { DEFAULT_DASHBOARD_LAYOUT } from '@/app/views/dashboard/constants/widgetDefinitions.const';
import { DEFAULT_HERO_PANEL, DEFAULT_HERO_STATS } from '@/app/views/dashboard/constants/heroDefinitions.const';
import type { NotificationPrefs } from '@/app/types/NotificationPrefs.type';

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  delivery: {
    'moodle-deadline': 'in-app',
    'registration-close': 'in-app',
    'registration-open': 'in-app',
    'sisu-sync': 'in-app',
  },
  registrationOpenLeadMinutes: 0,
};

export interface SisuPrefs {
  locale: Locale;
  sisuPlusActive: boolean;
  moodleToken: string | null;
  dashboardLayout: DashboardWidgetLayout[];
  heroStats: HeroStatId[];
  heroPanel: HeroPanelId;
  lastSeenChangelogVersion: string | null;
  notificationNudgeDismissed: boolean;
  notificationPrefs: NotificationPrefs;
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
  lastSeenChangelogVersion: null,
  notificationNudgeDismissed: false,
  notificationPrefs: DEFAULT_NOTIFICATION_PREFS,
  sisuPlusOnboardingCompleted: false,
  sisuPlusOnboardingStep: 0,
  universityConfig: null,
};
