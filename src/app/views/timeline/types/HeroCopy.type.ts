import type { AccentText } from './AccentText.type';
import type { HeroProjection } from './HeroProjection.type';
import type { HeroTile } from './HeroTile.type';
import type { LoadChart } from './LoadChart.type';

export interface HeroCopy {
  eyebrowLabel: string;
  eyebrowItems: string[];
  headline: AccentText;
  hint: string | null;
  projection: HeroProjection;
  tiles: HeroTile[];
  loadChart: LoadChart;
  neededPerPeriod: number | null;
  periodsLeft: string | null;
  issues: string | null;
}
