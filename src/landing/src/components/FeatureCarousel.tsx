import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Easing } from 'motion';

export type LandingFeatureCard = { title: string; body: string };

interface Props {
  cards: LandingFeatureCard[];
}

export const FeatureCarousel: React.FC<Props> = ({ cards }) => {
  const [featureState, setFeatureState] = useState({ direction: 1, index: 0 });
  const [isPaused, setIsPaused] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const activeIndex = featureState.index;
  const activeCard = cards[activeIndex];
  const cardTransition = {
    duration: shouldReduceMotion ? 0.01 : 0.32,
    ease: [0.16, 1, 0.3, 1] as Easing,
    type: 'tween' as const,
  };

  function selectFeature(nextIndex: number) {
    setFeatureState((s) => {
      if (nextIndex === s.index) return s;
      return { direction: nextIndex > s.index ? 1 : -1, index: nextIndex };
    });
  }

  function selectNextFeature() {
    if (cards.length < 2 || isPaused || shouldReduceMotion) return;
    setFeatureState((s) => ({ direction: 1, index: (s.index + 1) % cards.length }));
  }

  if (!activeCard) return null;

  return (
    <div
      className="grid gap-4 self-center"
      onBlur={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div>
        <motion.article
          key={activeCard.title}
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: shouldReduceMotion ? 1 : 0.72, y: shouldReduceMotion ? 0 : 8 }}
          transition={cardTransition}
          className="relative flex h-[clamp(18.5rem,28vw,22rem)] flex-col justify-end overflow-hidden rounded-2xl border border-white/8 bg-white/[0.035] p-[clamp(1.45rem,3vw,2.25rem)] shadow-[0_16px_50px_rgba(0,0,0,0.18)] transition-[border-color,background-color,box-shadow,transform] duration-220 hover:-translate-y-0.75 hover:border-lighterGreen/16 hover:bg-white/4.5 hover:shadow-[0_18px_56px_rgba(0,0,0,0.24),0_0_0_1px_rgba(82,201,137,0.04)]"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-[-30%] bg-[radial-gradient(circle_at_12%_16%,rgba(82,201,137,0.16),transparent_30%),radial-gradient(circle_at_86%_0%,rgba(126,101,255,0.1),transparent_34%)] opacity-[0.95]"
          />
          <span className="absolute top-[clamp(1.45rem,3vw,2.25rem)] left-[clamp(1.45rem,3vw,2.25rem)] font-mono text-[0.82rem] font-bold tracking-[0.12em] text-[rgba(120,213,150,0.78)]">
            {String(activeIndex + 1).padStart(2, '0')}
          </span>
          <h3 className="relative m-0 max-w-[24rem] text-[clamp(1.65rem,3vw,2.45rem)] leading-[1.05] font-bold text-balance text-offwhite">
            {activeCard.title}
          </h3>
          <p className="relative mt-4 max-w-140 text-[1.02rem] leading-[1.65] text-pretty text-offwhite/52">
            {activeCard.body}
          </p>
        </motion.article>
      </div>

      <div className="grid grid-cols-2 gap-[0.55rem]" aria-label="Feature carousel">
        {cards.map((card, index) => (
          <motion.button
            key={card.title}
            aria-label={`Show ${card.title}`}
            type="button"
            onClick={() => selectFeature(index)}
            whileHover={shouldReduceMotion ? undefined : { y: index === activeIndex ? 0 : -2 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
            transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1], type: 'tween' }}
            className={[
              'relative grid min-h-[3.15rem] cursor-pointer grid-cols-[auto_minmax(0,1fr)] items-center gap-[0.7rem] overflow-hidden rounded-[10px] border px-[0.82rem] py-[0.72rem] text-left transition-[background-color,border-color,color,box-shadow] duration-180 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lighterGreen/75',
              index === activeIndex
                ? 'border-lighterGreen/30 bg-lighterGreen/9 text-offwhite shadow-[0_12px_34px_rgba(0,0,0,0.16)]'
                : 'border-white/6.5 bg-white/[0.022] text-offwhite/62 hover:border-lighterGreen/16 hover:bg-white/[0.038] hover:text-offwhite/82',
            ].join(' ')}
          >
            {index === activeIndex && (
              <motion.span
                key={`${activeIndex}-${isPaused ? 'paused' : 'playing'}`}
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-px origin-left bg-lighterGreen/70 shadow-[0_0_16px_rgba(82,201,137,0.36)]"
                initial={{ scaleX: isPaused || shouldReduceMotion ? 1 : 0 }}
                animate={{ scaleX: 1 }}
                onAnimationComplete={selectNextFeature}
                transition={{ duration: isPaused || shouldReduceMotion ? 0.01 : 4.2, ease: 'linear' }}
              />
            )}
            <span className="font-mono text-[0.72rem] font-bold tracking-[0.08em] text-[rgba(120,213,150,0.62)]">
              {String(index + 1).padStart(2, '0')}
            </span>
            <strong className="overflow-hidden text-[0.88rem] font-semibold text-ellipsis whitespace-nowrap">
              {card.title}
            </strong>
          </motion.button>
        ))}
      </div>
    </div>
  );
};
