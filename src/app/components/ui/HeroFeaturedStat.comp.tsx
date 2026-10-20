import React from 'react';
import type { HeroStatTileData, HeroStatTone } from './types';

const SURFACE: Record<HeroStatTone, string> = {
  accent: 'bg-lighterGreen/7 shadow-[inset_0_0_0_1px_rgba(82,201,137,0.2)]',
  neutral: 'bg-background/42 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.055)]',
  warn: 'bg-warn/10 shadow-[inset_0_0_0_1px_rgba(240,168,77,0.22)]',
};

const VALUE_COLOR: Record<HeroStatTone, string> = {
  accent: 'text-lighterGreen',
  neutral: 'text-offwhite',
  warn: 'text-warn',
};

const SUB_COLOR: Record<HeroStatTone, string> = {
  accent: 'text-lighterGreen/45',
  neutral: 'text-lightGrey/50',
  warn: 'text-warn/45',
};

interface Props {
  stat: HeroStatTileData;
}

export const HeroFeaturedStat: React.FC<Props> = ({ stat }) => (
  <div className={`min-w-28 rounded-xl px-4 py-3.5 backdrop-blur-sm ${SURFACE[stat.tone]}`}>
    <p className="font-mono text-[9px] font-semibold tracking-[0.12em] text-lightGrey uppercase">{stat.label}</p>
    <p className={`mt-2 text-[30px] leading-none font-bold tabular-nums ${VALUE_COLOR[stat.tone]}`}>{stat.value}</p>
    {stat.sub && <p className={`mt-1.5 text-[11px] ${SUB_COLOR[stat.tone]}`}>{stat.sub}</p>}
  </div>
);
