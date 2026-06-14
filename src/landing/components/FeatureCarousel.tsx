import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

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

  function selectFeature(nextIndex: number) {
    setFeatureState((currentState) => {
      if (nextIndex === currentState.index) {
        return currentState;
      }

      return {
        direction: nextIndex > currentState.index ? 1 : -1,
        index: nextIndex,
      };
    });
  }

  useEffect(() => {
    if (cards.length < 2 || isPaused || shouldReduceMotion) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setFeatureState((currentState) => ({
        direction: 1,
        index: (currentState.index + 1) % cards.length,
      }));
    }, 4200);

    return () => window.clearInterval(intervalId);
  }, [cards.length, isPaused, shouldReduceMotion]);

  if (!activeCard) {
    return null;
  }

  return (
    <div
      className="landing-feature-carousel"
      onBlur={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="landing-feature-card-window">
        <AnimatePresence custom={featureState.direction} initial={false} mode="wait">
          <motion.article
            animate={{ filter: 'blur(0px)', opacity: 1, x: 0 }}
            className="landing-feature-card-active landing-interactive-card"
            exit={{
              filter: shouldReduceMotion ? 'blur(0px)' : 'blur(6px)',
              opacity: 0,
              x: shouldReduceMotion ? 0 : featureState.direction * -18,
            }}
            initial={{
              filter: shouldReduceMotion ? 'blur(0px)' : 'blur(8px)',
              opacity: 0,
              x: shouldReduceMotion ? 0 : featureState.direction * 28,
            }}
            key={activeCard.title}
            transition={{ bounce: 0, duration: 0.36, type: 'spring' }}
          >
            <span>{String(activeIndex + 1).padStart(2, '0')}</span>
            <h3>{activeCard.title}</h3>
            <p>{activeCard.body}</p>
          </motion.article>
        </AnimatePresence>
      </div>

      <div className="landing-feature-controls" aria-label="Feature carousel">
        {cards.map((card, index) => (
          <button
            aria-label={`Show ${card.title}`}
            className={index === activeIndex ? 'is-active' : undefined}
            key={card.title}
            onClick={() => selectFeature(index)}
            type="button"
          >
            <span>{String(index + 1).padStart(2, '0')}</span>
            <strong>{card.title}</strong>
          </button>
        ))}
      </div>
    </div>
  );
};
