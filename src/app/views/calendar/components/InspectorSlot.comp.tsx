import React, { type PropsWithChildren } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

const EASE_OUT_QUART = [0.25, 1, 0.5, 1] as const;

interface Props extends PropsWithChildren {
  slotKey: string | null;
}

export const InspectorSlot: React.FC<Props> = ({ slotKey, children }) => {
  const shouldReduceMotion = useReducedMotion();
  const offset = shouldReduceMotion ? 0 : 20;
  return (
    <div className={`relative grid min-h-0 min-w-0 lg:overflow-hidden lg:pl-4 ${slotKey ? '' : 'max-lg:hidden'}`}>
      <AnimatePresence initial={false} mode="popLayout">
        {slotKey && (
          <motion.div
            key={slotKey}
            className="grid min-h-0 grid-rows-[minmax(0,1fr)] lg:w-[316px]"
            initial={{ opacity: 0, x: offset }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: offset / 2 }}
            transition={{ duration: shouldReduceMotion ? 0.12 : 0.22, ease: EASE_OUT_QUART }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
