import React, { useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  HERO_FADE_SECONDS,
  HERO_FOLD_SECONDS,
  HERO_STRIP_HEIGHT,
  TIMELINE_HERO_ID,
} from '@/app/views/timeline/constants/hero.const';
import { useHeroCopy } from '@/app/views/timeline/hooks/useHeroCopy';
import type { HeroStats } from '@/app/views/timeline/types';
import { HeroExpanded } from './HeroExpanded.comp';
import { HeroStrip } from './HeroStrip.comp';

interface Props {
  stats: HeroStats;
  issueCount: number;
  folded: boolean;
  ready: boolean;
  onToggle: () => void;
}

const EASE = [0.25, 1, 0.5, 1] as const;

/**
 * Folding swaps two layouts stacked in one grid cell and only clips the wrapper's height.
 * The canvas inside the expanded layout is never transformed, clipped by clip-path or
 * resized mid-fold, and it unmounts with the expanded layout, so a folded hero renders nothing.
 */
export const TimelineHero: React.FC<Props> = ({ stats, issueCount, folded, ready, onToggle }) => {
  const copy = useHeroCopy(stats, issueCount);
  const shouldReduceMotion = useReducedMotion();
  const [isFolding, setIsFolding] = useState(false);
  const focusRequest = useRef(false);
  const fold = shouldReduceMotion ? { duration: 0 } : { duration: HERO_FOLD_SECONDS, ease: EASE };
  const fade = shouldReduceMotion ? { duration: 0 } : { duration: HERO_FADE_SECONDS, ease: EASE };

  if (!ready) return <div className="shrink-0" style={{ height: HERO_STRIP_HEIGHT }} />;

  return (
    <motion.div
      id={TIMELINE_HERO_ID}
      className="shrink-0"
      initial={false}
      animate={{ height: folded ? HERO_STRIP_HEIGHT : 'auto' }}
      transition={fold}
      onAnimationStart={() => setIsFolding(true)}
      onAnimationComplete={() => setIsFolding(false)}
      style={{ overflow: isFolding ? 'hidden' : 'visible' }}
    >
      <div className="grid">
        <AnimatePresence initial={false}>
          <motion.div
            key={folded ? 'strip' : 'full'}
            className="self-start [grid-area:1/1]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fade}
          >
            {folded ? (
              <HeroStrip copy={copy} onToggle={onToggle} focusRequest={focusRequest} />
            ) : (
              <HeroExpanded copy={copy} onToggle={onToggle} focusRequest={focusRequest} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
