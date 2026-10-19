import React from 'react';
import { formatCredits } from '@/app/helpers/formatCredits';
import { getTermTitle } from '@/app/helpers/getSemesterTitle';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import type { HeroStats as HeroStatsData } from '@/app/views/timeline/util/heroStats';

interface Props {
  stats: HeroStatsData;
  showGraduation: boolean;
  variant: 'full' | 'strip';
}

interface StatItem {
  key: string;
  value: string;
  label: string;
}

export const HeroStats: React.FC<Props> = ({ stats, showGraduation, variant }) => {
  const { t } = useTranslationWithPrefix('views.timeline');
  const { graduation } = stats;
  const graduationValue = !showGraduation
    ? null
    : graduation?.kind === 'period'
      ? getTermTitle(graduation.period)
      : graduation?.kind === 'short' && graduation.credits > 0
        ? t('hero.short', { credits: formatCredits(graduation.credits) })
        : null;

  const items: StatItem[] = [
    { key: 'scheduled', value: formatCredits(stats.scheduledCredits), label: t('hero.scheduled') },
    ...(stats.heaviest
      ? [
          {
            key: 'heaviest',
            value: formatCredits(stats.heaviest.credits),
            label: t('hero.heaviest', { period: stats.heaviest.period.name }),
          },
        ]
      : []),
    ...(graduationValue ? [{ key: 'graduation', value: graduationValue, label: t('hero.graduation') }] : []),
  ];

  if (variant === 'strip') {
    return (
      <ul className="flex min-w-0 flex-nowrap items-baseline gap-x-5">
        {items.map((item) => (
          <li key={item.key} className="flex min-w-0 items-baseline gap-1.5 whitespace-nowrap">
            <span className="text-sm font-semibold text-offwhite tabular-nums">{item.value}</span>
            <span className="min-w-0 truncate text-xs text-lightGrey">{item.label}</span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className="flex flex-wrap gap-x-8 gap-y-3">
      {items.map((item) => (
        <li key={item.key} className="flex flex-col gap-0.5">
          <span className="text-2xl leading-none font-semibold text-offwhite tabular-nums">{item.value}</span>
          <span className="text-xs text-lightGrey">{item.label}</span>
        </li>
      ))}
    </ul>
  );
};
