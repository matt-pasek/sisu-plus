import type { HeroStatTileData } from '@/app/components/ui/types';

export interface HeroTile extends HeroStatTileData {
  id: 'projected' | 'heaviest' | 'pace' | 'needed';
}
