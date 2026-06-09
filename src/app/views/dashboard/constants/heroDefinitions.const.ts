import { HeroPanelId, HeroStatId } from '@/app/views/dashboard/types';

export interface HeroStat {
  id: HeroStatId;
  label: string;
  value: string;
  sub: string;
  tone: 'accent' | 'neutral' | 'warn';
}

export const PANEL_MODES: { id: HeroPanelId; labelKey: string }[] = [
  { id: 'ring', labelKey: 'hero.panel.ring' },
  { id: 'upcoming', labelKey: 'hero.panel.upcoming' },
  { id: 'grade-trend', labelKey: 'hero.panel.gradeTrend' },
  { id: 'credit-velocity', labelKey: 'hero.panel.creditVelocity' },
  { id: 'calendar', labelKey: 'hero.panel.calendar' },
];

export const DEFAULT_HERO_STATS: HeroStatId[] = ['grade-avg', 'active-courses', 'credits-left'];

export const DEFAULT_HERO_PANEL: HeroPanelId = 'ring';
