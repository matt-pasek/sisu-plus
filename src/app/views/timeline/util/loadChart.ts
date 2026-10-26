import { getTerm } from '@/app/helpers/getTerm';
import type { LoadBar, LoadChart, LoadTermGroup, PeriodLoad } from '@/app/views/timeline/types';

/** The tallest mark stops short of the top so its value label and glow have room. */
const HEADROOM = 0.9;

export const getPeriodTick = (name: string): string => {
  const number = /^\s*(\d+)/.exec(name);
  return number ? number[1] : name.trim().charAt(0).toUpperCase();
};

const appendBar = (groups: LoadTermGroup[], load: PeriodLoad, bar: LoadBar): LoadTermGroup[] => {
  const term = getTerm(load.period);
  const key = `${term.season}-${term.year}`;
  const last = groups[groups.length - 1];
  if (last?.key === key) return [...groups.slice(0, -1), { ...last, bars: [...last.bars, bar] }];
  return [...groups, { key, term, bars: [bar] }];
};

export const getLoadChart = (loads: PeriodLoad[], needed: number | null): LoadChart => {
  if (loads.length === 0) return { groups: [], neededRatio: null };

  const tallest = Math.max(...loads.map((load) => load.credits));
  const scale = Math.max(tallest, needed ?? 0) / HEADROOM;
  const toRatio = (credits: number) => (scale > 0 ? credits / scale : 0);
  const heaviestAhead = Math.max(0, ...loads.filter((load) => !load.isPast).map((load) => load.credits));
  const heaviestIndex =
    heaviestAhead > 0 ? loads.findIndex((load) => !load.isPast && load.credits === heaviestAhead) : -1;

  const groups = loads.reduce<LoadTermGroup[]>(
    (acc, load, index) =>
      appendBar(acc, load, {
        locator: load.period.locator,
        period: load.period,
        tick: getPeriodTick(load.period.name),
        credits: load.credits,
        ratio: toRatio(load.credits),
        isHeaviest: index === heaviestIndex,
        isPast: load.isPast,
      }),
    [],
  );

  return { groups, neededRatio: needed === null ? null : toRatio(needed) };
};
