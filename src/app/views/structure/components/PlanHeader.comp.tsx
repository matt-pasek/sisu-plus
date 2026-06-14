import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { getModuleColorObject } from '@/app/theme/moduleColors';
import type { SectionData } from '@/app/views/structure/types';
import Threads from '@/app/views/structure/components/Threads.comp';

interface Props {
  planName: string;
  curriculumPeriodName: string | null;
  degreeProgramName: string | null;
  sections: SectionData[];
  planModifiedOn: string | null;
  studyRightUntil: string | null;
  totalCompleted: number;
  totalTarget: number;
  degreeMinimumCredits: number | null;
}

export const PlanHeader: React.FC<Props> = ({
  degreeMinimumCredits,
  planName,
  curriculumPeriodName,
  degreeProgramName,
  sections,
  planModifiedOn,
  studyRightUntil,
  totalCompleted,
  totalTarget,
}) => {
  const { t } = useTranslationWithPrefix('views.structure');
  const prefersReducedMotion = useReducedMotion();
  const remaining = Math.max(totalTarget - totalCompleted, 0);
  const earnedPercent = totalTarget > 0 ? Math.min(Math.max(totalCompleted / totalTarget, 0), 1) * 100 : 0;
  const milestonePercent =
    degreeMinimumCredits != null && totalTarget > 0
      ? Math.min(Math.max(degreeMinimumCredits / totalTarget, 0), 1)
      : null;

  return (
    <motion.section
      className="sisu-structure__hero relative overflow-hidden rounded-[20px] bg-container shadow-[0_1px_0_rgba(255,255,255,0.05)_inset,0_32px_64px_-44px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.06)]"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 10, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="absolute inset-0 h-full w-full">
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(65,150,72,0.07) 0%, transparent 40%, rgba(45,180,160,0.04) 70%, rgba(65,150,72,0.06) 100%)',
          }}
        />
        <div
          className="absolute -top-1/4 right-[-8%] h-[75%] w-[45%]"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(45,180,160,0.12) 0%, rgba(45,180,160,0.03) 45%, transparent 70%)',
            filter: 'blur(40px)',
            animation: 'heroAurora1 14s ease-in-out infinite',
          }}
        />
        <div
          className="absolute bottom-[-15%] left-[-5%] h-[55%] w-[35%]"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(65,150,72,0.10) 0%, rgba(40,100,60,0.03) 50%, transparent 70%)',
            filter: 'blur(50px)',
            animation: 'heroAurora2 18s ease-in-out infinite',
          }}
        />
        <div
          className="absolute bottom-0 left-1/4 h-[30%] w-[50%]"
          style={{
            background: 'radial-gradient(ellipse at center bottom, rgba(45,180,160,0.08) 0%, transparent 60%)',
            filter: 'blur(30px)',
            animation: 'heroAurora3 12s ease-in-out infinite',
          }}
        />
        <Threads color={[65, 150, 72]} amplitude={3} distance={0.5} />
      </div>
      <div className="relative px-5 py-7 sm:px-8 sm:py-8 lg:px-10">
        <motion.div
          className="flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1], delay: 0.06 }}
        >
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <span className="rounded-md border border-accent/60 px-2.5 py-1 font-mono text-[11px] font-bold tracking-[0.12em] text-accent uppercase shadow-[0_0_0_1px_rgba(65,150,72,0.55)]">
                {t('header.primaryBadge')}
              </span>
              <span className="font-mono text-[13px] tracking-[0.02em] text-offwhite/50">{planName}</span>
            </div>
            <h1 className="max-w-195 text-[34px] leading-[0.98] font-bold tracking-normal text-balance text-offwhite sm:text-[44px] lg:text-[52px]">
              {degreeProgramName || t('header.planLabel')}
            </h1>
            <p className="mt-3 text-[15px] text-lightGrey">
              {curriculumPeriodName} &middot; {t('header.modifiedOn', { date: planModifiedOn })}
            </p>
          </div>

          <div className="shrink-0 lg:text-right">
            <div className="font-mono text-[52px] leading-none font-bold tracking-normal text-offwhite sm:text-[64px]">
              {totalCompleted}
              <span className="text-[0.46em] font-semibold text-lightGrey"> / {totalTarget}</span>
            </div>
            <div className="mt-2 text-[13px] text-lightGrey">
              {t('header.creditsEarned')} &middot;{' '}
              <span className="font-semibold text-lighterGreen">
                {t('header.curriculumPercent', { count: Math.round(earnedPercent) })}
              </span>
            </div>
          </div>
        </motion.div>

        <div className="relative mt-8">
          <div className="relative h-12.5 overflow-hidden rounded-[14px] border border-white/15 bg-white/5 backdrop-blur-[2px]">
            <div
              className="sisu-widget-bar-x flex h-full gap-0.75 overflow-hidden rounded-[14px] transition-[width] duration-700 ease-out"
              style={{ width: `${earnedPercent}%` }}
            >
              {sections.map((section) => {
                const color = getModuleColorObject(section.moduleId);
                return (
                  <div
                    key={section.moduleId}
                    className="relative min-w-2"
                    style={{ flexGrow: section.completedCredits, backgroundColor: color.value }}
                    title={`${section.name} - ${section.completedCredits} cr`}
                  >
                    {section.completedCredits >= 12 && (
                      <span className="absolute top-1/2 left-3 -translate-y-1/2 font-mono text-[12px] font-bold text-background/80">
                        {section.completedCredits}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          {milestonePercent != null && (
            <motion.div
              className="absolute -top-2.25 -bottom-2.25 z-10 w-px bg-offwhite/75 shadow-[0_0_0_2px_rgba(13,13,17,0.9),0_0_12px_rgba(221,221,240,0.2)]"
              style={{ left: `${milestonePercent * 100}%` }}
              title={t('header.milestoneWithCredits', { count: degreeMinimumCredits })}
              initial={prefersReducedMotion ? false : { opacity: 0, scaleY: 0.2, y: 4 }}
              animate={{ opacity: 1, scaleY: 1, y: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1], delay: 0.26 }}
            >
              <span className="absolute bottom-[calc(100%+6px)] left-1/2 hidden -translate-x-1/2 rounded-md bg-offwhite px-2 py-1 font-mono text-[10px] font-bold whitespace-nowrap text-background shadow-[0_8px_20px_rgba(0,0,0,0.3)] sm:block">
                {t('header.milestoneWithCredits', { count: degreeMinimumCredits })}
              </span>
            </motion.div>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-[13px] text-lightGrey">
          <span>
            {t('header.toDegreeMinimum', {
              count: degreeMinimumCredits != null ? Math.max(degreeMinimumCredits - totalCompleted, 0) : remaining,
            })}
          </span>
          {studyRightUntil && (
            <>
              <span className="opacity-50">&middot;</span>
              <span>
                {t('header.studyRightUntil')} <b className="font-mono font-semibold text-offwhite">{studyRightUntil}</b>
              </span>
            </>
          )}
        </div>
      </div>
    </motion.section>
  );
};
