import React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { StudyPeriodInfo } from '@/app/api/dataPoints/getStudyPeriodMap';
import { Panel } from '@/app/components/ui/Panel.comp';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { HeroStats } from '@/app/views/timeline/components/hero/HeroStats.comp';
import { TrajectoryChart } from '@/app/views/timeline/components/hero/TrajectoryChart.comp';
import { TrajectorySparkline } from '@/app/views/timeline/components/hero/TrajectorySparkline.comp';
import type { HeroStats as HeroStatsData } from '@/app/views/timeline/util/heroStats';

interface Props {
  stats: HeroStatsData;
  periodsByLocator: Map<string, StudyPeriodInfo>;
  showGraduation: boolean;
  folded: boolean;
  ready: boolean;
  onToggle: () => void;
}

const EASE = [0.25, 1, 0.5, 1] as const;
const STRIP_HEIGHT = 40;

export const TimelineHero: React.FC<Props> = ({ stats, periodsByLocator, showGraduation, folded, ready, onToggle }) => {
  const { t } = useTranslationWithPrefix('views.timeline');
  const shouldReduceMotion = useReducedMotion();
  const hasChart = stats.trajectory.length > 0;

  const transition = shouldReduceMotion ? { duration: 0 } : { duration: 0.28, ease: EASE };
  const fadeProps = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition,
  };

  return (
    <Panel className="shrink-0">
      <div className="relative">
        {ready ? (
          <motion.div
            className="relative overflow-hidden"
            initial={false}
            animate={{ height: folded ? STRIP_HEIGHT : 'auto' }}
            transition={transition}
          >
            <AnimatePresence initial={false} mode="popLayout">
              {folded ? (
                <motion.div key="strip" {...fadeProps}>
                  <div className="flex h-10 items-center gap-5 pr-12 pl-4">
                    <HeroStats stats={stats} showGraduation={showGraduation} variant="strip" />
                    {hasChart && (
                      <div className="ml-auto hidden w-[120px] shrink-0 sm:block">
                        <TrajectorySparkline points={stats.trajectory} target={stats.target} />
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div key="full" {...fadeProps}>
                  <div className="flex items-center gap-x-10 gap-y-4 py-4 pr-12 pl-5">
                    <div className="flex min-w-0 flex-col gap-3">
                      <h2 className="text-lg font-semibold text-offwhite">
                        {t('hero.title')} <span className="text-lighterGreen">{t('hero.titleAccent')}</span>
                      </h2>
                      <HeroStats stats={stats} showGraduation={showGraduation} variant="full" />
                    </div>
                    {hasChart && (
                      <div className="ml-auto self-center max-lg:hidden">
                        <TrajectoryChart
                          points={stats.trajectory}
                          target={stats.target}
                          periodsByLocator={periodsByLocator}
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="h-10" />
        )}
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={!folded}
          aria-label={folded ? t('hero.unfold') : t('hero.fold')}
          title={folded ? t('hero.unfold') : t('hero.fold')}
          className="absolute top-2 right-2 flex size-6 cursor-pointer items-center justify-center rounded-md text-lightGrey transition-colors hover:bg-container2 hover:text-offwhite focus-visible:outline-2 focus-visible:outline-lighterGreen"
        >
          <svg
            viewBox="0 0 16 16"
            className={`size-4 transition-transform ${folded ? '' : 'rotate-180'}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M4 6l4 4 4-4" />
          </svg>
        </button>
      </div>
    </Panel>
  );
};
