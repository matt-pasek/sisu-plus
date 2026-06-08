import React, { useMemo, useState } from 'react';
import { getUserDetails } from '@/app/api/dataPoints/getUserDetails';
import { useChromeStorage } from '@/app/hooks/useChromeStorage';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import type { HeroStatId } from '@/app/types/prefs';
import { getCurrentPeriodLabel } from '@/app/views/dashboard/util';
import GradientBlinds from '@/app/views/dashboard/components/hero/GradientBlinds.comp';
import { DashboardControlButton } from '@/app/views/dashboard/components/DashboardControlButton.comp';

interface StudyRightEnd {
  year: string;
  until: string;
}

interface DashboardHeroProps {
  creditsDone: number;
  totalTarget: number;
  gradeAverage: number | null;
  gradedCount: number;
  activeCoursesCount: number;
  studyRightEnd: StudyRightEnd | null;
  upcomingDeadlines: number;
}

interface HeroStat {
  id: HeroStatId;
  label: string;
  value: string;
  tone: 'accent' | 'neutral' | 'warn';
}

const DEFAULT_HERO_STATS: HeroStatId[] = ['grade-avg', 'active-courses', 'credits-left'];

const getPreferredName = (userDetails: { callName?: string; firstNames?: string } | undefined): string | null => {
  if (userDetails?.callName) return userDetails.callName;
  return userDetails?.firstNames?.split(' ')[0] ?? null;
};

const getGreetingKey = (): 'hero.greetingMorning' | 'hero.greetingAfternoon' | 'hero.greetingEvening' => {
  const hour = new Date().getHours();
  if (hour < 12) return 'hero.greetingMorning';
  if (hour < 18) return 'hero.greetingAfternoon';
  return 'hero.greetingEvening';
};

const formatCredits = (value: number, unit: string): string => {
  const rounded = Math.round(value * 10) / 10;
  return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)} ${unit}`;
};

const HeroRing: React.FC<{ done: number; total: number }> = ({ done, total }) => {
  const { t } = useTranslationWithPrefix('views.dashboard');
  const pct = total > 0 ? Math.min(done / total, 1) : 0;
  const r = 88;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;

  return (
    <div className="relative grid size-48 shrink-0 place-items-center xl:size-56">
      <svg
        aria-label={t('widgets.degreeCompletion.aria', { percent: Math.round(pct * 100) })}
        className="size-48 -rotate-90 drop-shadow-[0_0_22px_rgba(82,201,137,0.28)] xl:size-56"
        role="img"
        viewBox="0 0 208 208"
      >
        <defs>
          <filter id="dashboard-hero-ring-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx="104" cy="104" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10" />
        <circle
          className="sisu-widget-ring transition-[stroke-dasharray] duration-700 ease-out"
          cx="104"
          cy="104"
          fill="none"
          filter="url(#dashboard-hero-ring-glow)"
          r={r}
          stroke="var(--color-lighterGreen)"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          strokeWidth="10"
          style={
            {
              '--sisu-ring-from': `${circ}`,
              '--sisu-ring-to': 0,
            } as React.CSSProperties
          }
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[38px] leading-none font-bold text-offwhite tabular-nums xl:text-[44px]">
          {total > 0 ? `${Math.round(pct * 100)}%` : '-'}
        </span>
        <span className="mt-1.5 font-mono text-[10px] font-semibold tracking-[0.12em] text-lightGrey uppercase">
          {t('widgets.degreeCompletion.complete')}
        </span>
      </div>
    </div>
  );
};

export const DashboardHero: React.FC<DashboardHeroProps> = ({
  activeCoursesCount,
  creditsDone,
  gradeAverage,
  gradedCount,
  studyRightEnd,
  totalTarget,
  upcomingDeadlines,
}) => {
  const { t } = useTranslationWithPrefix('views.dashboard');
  const { t: tUtil } = useTranslationWithPrefix('util');
  const [prefs, setPrefs, isPrefsLoaded] = useChromeStorage();
  const { userDetails, loadingDetails } = getUserDetails();
  const [isEditingHero, setIsEditingHero] = useState(false);
  const unit = tUtil('credits.short');
  const selectedStats = prefs.heroStats?.length ? prefs.heroStats : DEFAULT_HERO_STATS;
  const selectedSet = useMemo(() => new Set(selectedStats), [selectedStats]);
  const displayName = getPreferredName(userDetails) ?? t('hero.studentFallback');

  const creditsLeft = Math.max(totalTarget - creditsDone, 0);
  const stats: HeroStat[] = [
    {
      id: 'grade-avg',
      label: t('hero.stats.gradeAvg'),
      value:
        gradeAverage != null ? gradeAverage.toFixed(1) : gradedCount > 0 ? '-' : t('widgets.degreeCompletion.noneYet'),
      tone: 'accent',
    },
    {
      id: 'active-courses',
      label: t('hero.stats.activeCourses'),
      value: activeCoursesCount.toString(),
      tone: 'neutral',
    },
    {
      id: 'credits-left',
      label: t('hero.stats.creditsLeft'),
      value: formatCredits(creditsLeft, unit),
      tone: creditsLeft > 0 ? 'neutral' : 'accent',
    },
    {
      id: 'study-right',
      label: t('hero.stats.studyRight'),
      value: studyRightEnd?.year ?? '-',
      tone: 'neutral',
    },
    {
      id: 'urgent-deadlines',
      label: t('hero.stats.urgentDeadlines'),
      value: upcomingDeadlines.toString(),
      tone: upcomingDeadlines > 0 ? 'warn' : 'neutral',
    },
  ];
  const visibleStats = stats.filter((stat) => selectedSet.has(stat.id));

  const toggleStat = (id: HeroStatId) => {
    const isSelected = selectedSet.has(id);
    if (isSelected && selectedStats.length <= 2) return;
    if (!isSelected && selectedStats.length >= 4) return;
    setPrefs({ heroStats: isSelected ? selectedStats.filter((stat) => stat !== id) : [...selectedStats, id] });
  };

  const chipToneClass: Record<HeroStat['tone'], string> = {
    accent: 'bg-lighterGreen/10 text-lighterGreen shadow-[inset_0_0_0_1px_rgba(82,201,137,0.22)]',
    neutral: 'bg-background/42 text-offwhite shadow-[inset_0_0_0_1px_rgba(255,255,255,0.055)]',
    warn: 'bg-warn/10 text-warn shadow-[inset_0_0_0_1px_rgba(240,168,77,0.22)]',
  };

  if (loadingDetails) return null;

  return (
    <section
      className="relative min-h-80 overflow-hidden rounded-2xl bg-container shadow-[0_1px_3px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.045),0_24px_60px_-34px_rgba(0,0,0,0.9)] md:min-h-[360px]"
      data-dashboard-hero
    >
      <div className="pointer-events-none absolute inset-0 mask-[linear-gradient(90deg,transparent_0%,black_13%,black_88%,transparent_100%)] opacity-95">
        <GradientBlinds
          gradientColors={['#1f5f36', '#52c989', '#b7ffd0']}
          angle={18}
          noise={0.32}
          blindCount={18}
          blindMinWidth={92}
          spotlightPosition={[0.58, 0.55]}
          spotlightRadius={0.62}
          spotlightSoftness={1.45}
          spotlightOpacity={0.82}
          distortAmount={0.12}
          shineDirection="left"
          mixBlendMode="screen"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_48%,rgba(82,201,137,0.16),transparent_30%),linear-gradient(90deg,rgba(21,21,28,0.96)_0%,rgba(21,21,28,0.74)_28%,rgba(21,21,28,0.42)_55%,rgba(21,21,28,0.9)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-background/55 to-transparent" />

      <div className="relative flex min-h-80 flex-col gap-7 px-7 py-8 md:min-h-90 md:px-10 md:py-10 lg:flex-row lg:items-center lg:justify-between lg:gap-10 xl:px-12">
        <div className="min-w-0 flex-1">
          <div className="flex max-w-4xl flex-wrap items-center gap-3 lg:pr-6">
            <p className="font-mono text-[10px] font-semibold tracking-[0.12em] text-lightGrey uppercase">
              {getCurrentPeriodLabel(t)}
            </p>
          </div>

          <h1 className="mt-6 max-w-5xl text-[2.8rem] leading-[0.98] font-semibold tracking-tight text-balance text-offwhite md:text-[4rem] xl:text-[4.8rem]">
            {t(getGreetingKey())} <span className="text-lighterGreen">{displayName}.</span>
          </h1>

          <div className="mt-8 flex flex-wrap gap-3">
            {visibleStats.map((stat) => (
              <div
                key={stat.id}
                className={`min-w-38 rounded-xl px-4 py-3.5 backdrop-blur-sm ${chipToneClass[stat.tone]}`}
              >
                <p className="font-mono text-[9px] font-semibold tracking-[0.12em] text-lightGrey uppercase">
                  {stat.label}
                </p>
                <p className="mt-2 text-2xl leading-none font-semibold tabular-nums">{stat.value}</p>
              </div>
            ))}
          </div>

          {isEditingHero && (
            <div className="mt-5 flex max-w-4xl flex-wrap gap-2 rounded-xl bg-background/65 p-2 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)] backdrop-blur-md">
              {stats.map((stat) => {
                const isSelected = selectedSet.has(stat.id);
                const isDisabled =
                  !isPrefsLoaded ||
                  (isSelected && selectedStats.length <= 2) ||
                  (!isSelected && selectedStats.length >= 4);
                return (
                  <button
                    key={stat.id}
                    aria-pressed={isSelected}
                    className={`flex min-h-9 items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-[background-color,color,opacity,transform] duration-150 active:scale-[0.96] ${
                      isSelected
                        ? 'bg-lighterGreen/15 text-lighterGreen'
                        : 'bg-container2 text-lightGrey hover:text-offwhite'
                    } ${isDisabled ? 'cursor-not-allowed opacity-55' : 'cursor-pointer hover:bg-offwhite/10'}`}
                    disabled={isDisabled}
                    onClick={() => toggleStat(stat.id)}
                    type="button"
                  >
                    <span className="grid size-4 place-items-center rounded-full bg-background/60">
                      {isSelected && (
                        <svg
                          aria-hidden="true"
                          className="size-3"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.4"
                          viewBox="0 0 24 24"
                        >
                          <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    {stat.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-center gap-5 self-center lg:self-auto">
          <HeroRing done={creditsDone} total={totalTarget} />
          <div className="hidden min-w-32 flex-col md:flex">
            <span className="font-mono text-[10px] font-semibold tracking-[0.12em] text-lightGrey uppercase">
              {t('widgets.degreeCompletion.creditsLabel')}
            </span>
            <span className="mt-3 text-2xl font-semibold text-offwhite tabular-nums">
              {t('hero.creditsLabel', { done: creditsDone, total: totalTarget })}
            </span>
            <span className="mt-2 text-sm text-lightGrey">
              {studyRightEnd?.until ?? t('widgets.degreeCompletion.noneYet')}
            </span>
          </div>
        </div>
      </div>

      <DashboardControlButton
        active={isEditingHero}
        ariaLabel={isEditingHero ? t('hero.doneEditing') : t('hero.editHero')}
        className="absolute top-5 right-5 z-10"
        onClick={() => setIsEditingHero((current) => !current)}
        tooltip={isEditingHero ? t('hero.doneEditing') : t('hero.editHero')}
      >
        {isEditingHero ? (
          <svg
            aria-hidden="true"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.3"
            viewBox="0 0 24 24"
          >
            <path d="M5 12.5 9.5 17 19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg
            aria-hidden="true"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              d="m14.5 5 4.5 4.5M4 20l4.2-1 10.1-10.1a3.2 3.2 0 0 0-4.5-4.5L3.7 14.5 3 20h1Z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </DashboardControlButton>
    </section>
  );
};
