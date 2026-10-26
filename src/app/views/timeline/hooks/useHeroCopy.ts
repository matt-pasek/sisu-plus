import { useMemo } from 'react';
import type { StudyPeriodInfo } from '@/app/api/dataPoints/getStudyPeriodMap';
import { formatCredits } from '@/app/helpers/formatCredits';
import { getTermShortTitle } from '@/app/helpers/getSemesterTitle';
import { getTerm } from '@/app/helpers/getTerm';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import type { AccentText, HeroCopy, HeroStats, HeroTile } from '@/app/views/timeline/types';
import { ACCENT_MARK, splitAccent } from '@/app/views/timeline/util/accentText';
import { getLoadChart } from '@/app/views/timeline/util/loadChart';

type Translate = ReturnType<typeof useTranslationWithPrefix>['t'];

const TERM_KEY = { autumn: 'hero.termAutumn', spring: 'hero.termSpring' } as const;

const termPhrase = (t: Translate, period: StudyPeriodInfo): string => {
  const { season, year } = getTerm(period);
  return t(TERM_KEY[season], { year });
};

const getHeadline = (t: Translate, stats: HeroStats): AccentText => {
  const { outlook } = stats;
  switch (outlook.kind) {
    case 'graduating':
      return splitAccent(t('hero.graduating', { accent: ACCENT_MARK }), termPhrase(t, outlook.period));
    case 'short':
      return splitAccent(
        t('hero.short', { accent: ACCENT_MARK }),
        t('hero.shortAccent', { credits: formatCredits(outlook.credits) }),
      );
    case 'met':
      return splitAccent(t('hero.met', { accent: ACCENT_MARK }), t('hero.metAccent'));
    case 'open':
      return splitAccent(t('hero.planEnds', { accent: ACCENT_MARK }), termPhrase(t, outlook.endsIn));
    case 'empty':
      return splitAccent(t('hero.empty'), '');
  }
};

const getSpan = (t: Translate, stats: HeroStats): string | null => {
  if (!stats.span) return null;
  const from = getTermShortTitle(stats.span.from);
  const to = getTermShortTitle(stats.span.to);
  return from === to ? from : t('hero.span', { from, to });
};

const getTiles = (t: Translate, stats: HeroStats): HeroTile[] => {
  const { heaviest, averagePace, neededPerPeriod, target, projectedPercent } = stats;
  const tiles: (HeroTile | null)[] = [
    {
      id: 'projected',
      label: t('hero.projectedLabel'),
      value: formatCredits(stats.projectedCredits),
      sub:
        target !== null && projectedPercent !== null
          ? t('hero.projectedSub', { pct: projectedPercent, target: formatCredits(target) })
          : '',
      tone: 'accent',
    },
    heaviest && {
      id: 'heaviest',
      label: t('hero.heaviest'),
      value: formatCredits(heaviest.credits),
      sub: t('hero.heaviestSub', { period: heaviest.period.name, term: getTermShortTitle(heaviest.period) }),
      tone: 'neutral',
    },
    averagePace !== null
      ? {
          id: 'pace',
          label: t('hero.pace'),
          value: formatCredits(averagePace),
          sub: t(stats.paceKind === 'earned' ? 'hero.paceEarnedSub' : 'hero.paceSub'),
          tone: 'neutral',
        }
      : null,
    neededPerPeriod !== null && target !== null
      ? {
          id: 'needed',
          label: t('hero.needed'),
          value: formatCredits(neededPerPeriod),
          sub: t('hero.neededSub', { target: formatCredits(target) }),
          tone: 'neutral',
        }
      : null,
  ];
  return tiles.filter((tile): tile is HeroTile => tile !== null);
};

export const useHeroCopy = (stats: HeroStats, issueCount: number): HeroCopy => {
  const { t } = useTranslationWithPrefix('views.timeline');

  return useMemo(() => {
    const isEmpty = stats.outlook.kind === 'empty';
    const periodsLeft = stats.remainingPeriods > 0 ? t('hero.periodsLeft', { count: stats.remainingPeriods }) : null;
    const scheduled = isEmpty ? null : t('hero.scheduled', { credits: formatCredits(stats.scheduledCredits) });
    const eyebrowItems = [getSpan(t, stats), periodsLeft, scheduled].filter((item): item is string => item !== null);

    return {
      eyebrowLabel: t('hero.eyebrow'),
      eyebrowItems,
      headline: getHeadline(t, stats),
      hint: isEmpty ? t('hero.emptyHint') : null,
      projection: {
        value: String(stats.projectedCredits),
        target: stats.target === null ? null : String(stats.target),
        label: t('hero.projected'),
      },
      tiles: isEmpty ? [] : getTiles(t, stats),
      loadChart: getLoadChart(stats.loads, stats.neededPerPeriod),
      neededPerPeriod: stats.neededPerPeriod,
      periodsLeft,
      issues: issueCount > 0 ? t('toolbar.issue', { count: issueCount }) : null,
    };
  }, [issueCount, stats, t]);
};
