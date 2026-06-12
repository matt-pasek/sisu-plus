import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { type IcsCalendar } from 'ts-ics';
import { getUserDetails } from '@/app/api/dataPoints/getUserDetails';
import type { RegistrationCourse } from '@/app/api/dataPoints/getRegistrationCourses';
import { getCourseDisplayName, getUpcomingExamItems } from '@/app/views/dashboard/util/registrationWidgetData';
import { useChromeStorage } from '@/app/hooks/useChromeStorage';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { getCurrentPeriodLabel } from '@/app/views/dashboard/util';
import GradientBlinds from '@/app/views/dashboard/components/hero/GradientBlinds.comp';
import { DashboardControlButton } from '@/app/views/dashboard/components/DashboardControlButton.comp';
import { HeroPanel } from './HeroPanel.comp';
import type { DashboardCompletedCourse, HeroStatId, HeroPanelId } from '@/app/views/dashboard/types';
import type { SemesterCreditSummary } from '@/app/api/dataPoints/getCreditsByPeriod';
import {
  DEFAULT_HERO_PANEL,
  DEFAULT_HERO_STATS,
  HeroStat,
  PANEL_MODES,
} from '@/app/views/dashboard/constants/heroDefinitions.const';
import { formatShortDate } from '@/app/views/dashboard/util/formatShortDate';

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
  deadlines?: IcsCalendar;
  completedCourses?: DashboardCompletedCourse[];
  semesters?: SemesterCreditSummary[];
  registrationCourses?: RegistrationCourse[];
}

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

const FeaturedStatTile: React.FC<{ stat: HeroStat }> = ({ stat }) => {
  const toneStyles = {
    accent: 'bg-lighterGreen/7 shadow-[inset_0_0_0_1px_rgba(82,201,137,0.2)]',
    neutral: 'bg-background/42 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.055)]',
    warn: 'bg-warn/10 shadow-[inset_0_0_0_1px_rgba(240,168,77,0.22)]',
  };
  const valueColor = {
    accent: 'text-lighterGreen',
    neutral: 'text-offwhite',
    warn: 'text-warn',
  };
  const subColor = {
    accent: 'text-lighterGreen/45',
    neutral: 'text-lightGrey/50',
    warn: 'text-warn/45',
  };

  return (
    <div className={`min-w-28 rounded-xl px-4 py-3.5 backdrop-blur-sm ${toneStyles[stat.tone]}`}>
      <p className="font-mono text-[9px] font-semibold tracking-[0.12em] text-lightGrey uppercase">{stat.label}</p>
      <p className={`mt-2 text-[30px] leading-none font-bold tabular-nums ${valueColor[stat.tone]}`}>{stat.value}</p>
      {stat.sub && <p className={`mt-1.5 text-[11px] ${subColor[stat.tone]}`}>{stat.sub}</p>}
    </div>
  );
};

const PlainStatTile: React.FC<{ stat: HeroStat }> = ({ stat }) => {
  const valueColor = {
    accent: 'text-lighterGreen',
    neutral: 'text-offwhite',
    warn: 'text-warn',
  };

  return (
    <div className="relative px-4 py-3.5">
      <div className="absolute inset-y-2 left-0 w-px bg-linear-to-b from-transparent via-white/6 to-transparent" />
      <p className="font-mono text-[9px] font-semibold tracking-[0.12em] text-lightGrey/70 uppercase">{stat.label}</p>
      <p className={`mt-2 text-[24px] leading-none font-semibold tabular-nums ${valueColor[stat.tone]}`}>
        {stat.value}
      </p>
      {stat.sub && <p className="mt-1.5 text-[11px] text-lightGrey/50">{stat.sub}</p>}
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
  deadlines,
  completedCourses,
  semesters,
  registrationCourses,
}) => {
  const { t } = useTranslationWithPrefix('views.dashboard');
  const { t: tUtil } = useTranslationWithPrefix('util');
  const [prefs, setPrefs, isPrefsLoaded] = useChromeStorage();
  const { userDetails, loadingDetails } = getUserDetails();
  const [isEditingHero, setIsEditingHero] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const unit = tUtil('credits.short');

  const selectedStats = prefs.heroStats?.length ? prefs.heroStats : DEFAULT_HERO_STATS;
  const selectedSet = useMemo(() => new Set(selectedStats), [selectedStats]);
  const selectedPanel: HeroPanelId = prefs.heroPanel ?? DEFAULT_HERO_PANEL;
  const displayName = getPreferredName(userDetails) ?? t('hero.studentFallback');
  const creditsLeft = Math.max(totalTarget - creditsDone, 0);

  const nextDue = useMemo(() => {
    const now = Date.now();

    const nextMoodle = deadlines?.events
      ? (Object.values(deadlines.events)
          .filter((ev) => ev.end?.date && ev.end.date.getTime() > now)
          .sort((a, b) => a.end!.date!.getTime() - b.end!.date!.getTime())[0] ?? null)
      : null;

    const nextExamItem = getUpcomingExamItems(registrationCourses ?? []).at(0) ?? null;

    const moodleTime = nextMoodle?.end?.date?.getTime() ?? Infinity;
    const examTime = nextExamItem ? new Date(nextExamItem.startsAt).getTime() : Infinity;

    if (moodleTime === Infinity && examTime === Infinity) return null;

    if (examTime <= moodleTime) {
      return { date: new Date(nextExamItem!.startsAt), label: getCourseDisplayName(nextExamItem!.course) };
    }
    return { date: nextMoodle!.end!.date!, label: nextMoodle!.summary ?? '' };
  }, [deadlines, registrationCourses]);

  const completionPct = totalTarget > 0 ? Math.round((creditsDone / totalTarget) * 100) : 0;

  const stats: HeroStat[] = [
    {
      id: 'grade-avg',
      label: t('hero.stats.gradeAvg'),
      value:
        gradeAverage != null ? gradeAverage.toFixed(1) : gradedCount > 0 ? '-' : t('widgets.degreeCompletion.noneYet'),
      sub: gradedCount > 0 ? t('widgets.degreeCompletion.gradedCount', { count: gradedCount }) : '',
      tone: 'accent',
    },
    {
      id: 'active-courses',
      label: t('hero.stats.activeCourses'),
      value: activeCoursesCount.toString(),
      sub: t('hero.statSubs.enrolled'),
      tone: 'neutral',
    },
    {
      id: 'credits-left',
      label: t('hero.stats.creditsLeft'),
      value: formatCredits(creditsLeft, unit),
      sub: t('hero.statSubs.toTarget'),
      tone: creditsLeft > 0 ? 'neutral' : 'accent',
    },
    {
      id: 'study-right',
      label: t('hero.stats.studyRight'),
      value: studyRightEnd?.year ?? '-',
      sub: studyRightEnd?.until ?? '',
      tone: 'neutral',
    },
    {
      id: 'urgent-deadlines',
      label: t('hero.stats.urgentDeadlines'),
      value: upcomingDeadlines.toString(),
      sub: t('hero.statSubs.thisWeek'),
      tone: upcomingDeadlines > 0 ? 'warn' : 'neutral',
    },
    {
      id: 'completion-pct',
      label: t('hero.stats.completionPct'),
      value: totalTarget > 0 ? `${completionPct}%` : '-',
      sub: t('hero.statSubs.ofDegree'),
      tone: 'neutral',
    },
    {
      id: 'credits-done',
      label: t('hero.stats.creditsDone'),
      value: formatCredits(creditsDone, unit),
      sub: totalTarget > 0 ? t('hero.statSubs.ofCredits', { total: totalTarget }) : '',
      tone: 'neutral',
    },
    {
      id: 'next-due',
      label: t('hero.stats.nextDue'),
      value: nextDue ? formatShortDate(nextDue.date) : '-',
      sub: nextDue?.label ?? '',
      tone: 'neutral',
    },
    {
      id: 'credits-this-period',
      label: t('hero.stats.creditsThisPeriod'),
      value: '-',
      sub: t('hero.statSubs.thisPeriod'),
      tone: 'neutral',
    },
  ];

  const visibleStats = stats.filter((stat) => selectedSet.has(stat.id));
  const [featuredStat, ...plainStats] = visibleStats;

  const toggleStat = (id: HeroStatId) => {
    const isSelected = selectedSet.has(id);
    if (isSelected && selectedStats.length <= 2) return;
    if (!isSelected && selectedStats.length >= 4) return;
    setPrefs({
      heroStats: isSelected ? selectedStats.filter((stat) => stat !== id) : [...selectedStats, id],
    });
  };

  const togglePanel = (id: HeroPanelId) => setPrefs({ heroPanel: id });

  if (loadingDetails) return null;

  return (
    <section
      className="relative min-h-80 overflow-hidden rounded-2xl bg-container shadow-[0_1px_3px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.045),0_24px_60px_-34px_rgba(0,0,0,0.9)] md:min-h-90"
      data-dashboard-hero
    >
      <div className="pointer-events-none absolute inset-0 mask-[linear-gradient(90deg,transparent_0%,black_13%,black_88%,transparent_100%)] opacity-95">
        <GradientBlinds
          gradientColors={['#1f5f36', '#52c989', '#b7ffd0']}
          angle={18}
          noise={0.76}
          blindCount={18}
          blindMinWidth={92}
          spotlightPosition={[0.58, 0.55]}
          spotlightRadius={0.62}
          spotlightSoftness={1.45}
          spotlightOpacity={0.82}
          distortAmount={0.12}
          shineDirection="left"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_48%,rgba(82,201,137,0.16),transparent_30%),linear-gradient(90deg,rgba(21,21,28,0.96)_0%,rgba(21,21,28,0.74)_28%,rgba(21,21,28,0.42)_55%,rgba(21,21,28,0.9)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-background/55 to-transparent" />

      <div className="relative flex min-h-80 flex-col gap-7 px-7 py-8 md:min-h-90 md:px-10 md:py-10 lg:flex-row lg:items-center lg:justify-between lg:gap-10 xl:px-12">
        <div className="min-w-0 flex-1">
          <div className="flex max-w-4xl flex-wrap items-center gap-3 lg:pr-6">
            <p className="font-mono text-[13px] font-semibold tracking-[0.02em] text-lightGrey/80 uppercase">
              {prefs.universityConfig && (
                <>
                  <span className="text-lighterGreen/70">{prefs.universityConfig.name}</span>
                  <span className="mx-2 text-lightGrey/30">·</span>
                </>
              )}
              {getCurrentPeriodLabel(t)}
            </p>
          </div>

          <h1 className="mt-6 max-w-5xl text-[2.8rem] leading-[0.98] font-semibold tracking-tight text-balance text-offwhite md:text-[4rem] xl:text-[4.8rem]">
            {t(getGreetingKey())} <span className="text-lighterGreen">{displayName}.</span>
          </h1>

          <div className="mt-8 flex w-fit flex-wrap items-stretch gap-1.5 backdrop-blur-[2px]">
            {featuredStat && <FeaturedStatTile stat={featuredStat} />}
            {plainStats.map((stat) => (
              <PlainStatTile key={stat.id} stat={stat} />
            ))}
          </div>

          <AnimatePresence>
            {isEditingHero && (
              <motion.div
                key="edit-controls"
                animate={{ opacity: 1, height: 'auto' }}
                exit={{
                  opacity: 0,
                  height: 0,
                  transition: { duration: prefersReducedMotion ? 0.01 : 0.22, ease: [0.4, 0, 1, 1] },
                }}
                initial={{ opacity: 0, height: 0 }}
                style={{ overflow: 'hidden' }}
                transition={{ duration: prefersReducedMotion ? 0.01 : 0.32, ease: [0.22, 1, 0.36, 1] }}
                className="mt-5 space-y-3"
              >
                <motion.div
                  animate="show"
                  initial="hidden"
                  variants={{ hidden: {}, show: { transition: { staggerChildren: 0.028, delayChildren: 0.08 } } }}
                  className="flex max-w-4xl flex-wrap gap-2 rounded-xl bg-background/65 p-2 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)] backdrop-blur-md"
                >
                  {stats.map((stat) => {
                    const isSelected = selectedSet.has(stat.id);
                    const isDisabled =
                      !isPrefsLoaded ||
                      (isSelected && selectedStats.length <= 2) ||
                      (!isSelected && selectedStats.length >= 4);
                    return (
                      <motion.button
                        key={stat.id}
                        variants={
                          prefersReducedMotion
                            ? {}
                            : {
                                hidden: { opacity: 0, y: 5, scale: 0.9 },
                                show: {
                                  opacity: 1,
                                  y: 0,
                                  scale: 1,
                                  transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] },
                                },
                              }
                        }
                        aria-pressed={isSelected}
                        className={`flex min-h-9 items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-[background-color,color,opacity] duration-150 active:scale-[0.96] ${
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
                      </motion.button>
                    );
                  })}
                </motion.div>

                <motion.div
                  animate="show"
                  initial="hidden"
                  variants={{ hidden: {}, show: { transition: { staggerChildren: 0.035, delayChildren: 0.15 } } }}
                  className="flex max-w-4xl flex-wrap items-center gap-2 rounded-xl bg-background/65 p-2 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)] backdrop-blur-md"
                >
                  <span className="px-1 font-mono text-[9px] font-semibold tracking-[0.12em] text-lightGrey/60 uppercase">
                    {t('hero.editPanel')}
                  </span>
                  {PANEL_MODES.map(({ id, labelKey }) => {
                    const isActive = selectedPanel === id;
                    return (
                      <motion.button
                        key={id}
                        variants={
                          prefersReducedMotion
                            ? {}
                            : {
                                hidden: { opacity: 0, y: 5, scale: 0.9 },
                                show: {
                                  opacity: 1,
                                  y: 0,
                                  scale: 1,
                                  transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] },
                                },
                              }
                        }
                        aria-pressed={isActive}
                        className={`flex min-h-9 items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-[background-color,color,opacity] duration-150 active:scale-[0.96] ${
                          isActive
                            ? 'bg-lighterGreen/15 text-lighterGreen'
                            : 'cursor-pointer bg-container2 text-lightGrey hover:bg-offwhite/10 hover:text-offwhite'
                        } ${!isPrefsLoaded ? 'cursor-not-allowed opacity-55' : ''}`}
                        disabled={!isPrefsLoaded}
                        onClick={() => togglePanel(id)}
                        type="button"
                      >
                        <span className="grid size-4 place-items-center rounded-full bg-background/60">
                          {isActive && (
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
                        {t(labelKey as Parameters<typeof t>[0])}
                      </motion.button>
                    );
                  })}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex shrink-0 items-center justify-center self-center lg:self-auto">
          <HeroPanel
            mode={selectedPanel}
            done={creditsDone}
            total={totalTarget}
            deadlines={deadlines}
            completedCourses={completedCourses}
            semesters={semesters}
            gradeAverage={gradeAverage}
          />
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
