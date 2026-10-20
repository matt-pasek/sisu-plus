import React from 'react';
import type { HeroStatTileData, HeroStatTone } from './types';

const VALUE_COLOR: Record<HeroStatTone, string> = {
  accent: 'text-lighterGreen',
  neutral: 'text-offwhite',
  warn: 'text-warn',
};

interface Props {
  stat: HeroStatTileData;
}

export const HeroPlainStat: React.FC<Props> = ({ stat }) => (
  <div className="relative px-4 py-3.5">
    <div className="absolute inset-y-2 left-0 w-px bg-linear-to-b from-transparent via-white/6 to-transparent" />
    <p className="font-mono text-[9px] font-semibold tracking-[0.12em] text-lightGrey/70 uppercase">{stat.label}</p>
    <p className={`mt-2 text-[24px] leading-none font-semibold tabular-nums ${VALUE_COLOR[stat.tone]}`}>{stat.value}</p>
    {stat.sub && <p className="mt-1.5 text-[11px] text-lightGrey/50">{stat.sub}</p>}
  </div>
);
