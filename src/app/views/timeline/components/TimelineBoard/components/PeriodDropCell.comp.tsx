import React from 'react';
import { useDroppable } from '@dnd-kit/react';
import { shapeIntersection } from '@dnd-kit/collision';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { PeriodCreditSummary } from '@/app/api/dataPoints/getCreditsByPeriod';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { TIMELINE_COURSE_DRAG_TYPE } from '@/app/views/timeline/util/dndHandlers';

interface Props {
  index: number;
  hasHighlightedDropPeriods: boolean;
  isActiveDropTarget: boolean;
  isHighlighted: boolean;
  isDragging: boolean;
  period: PeriodCreditSummary;
  rowCount: number;
}

export const PeriodDropCell: React.FC<Props> = ({
  index,
  hasHighlightedDropPeriods,
  isActiveDropTarget,
  isHighlighted,
  isDragging,
  period,
  rowCount,
}) => {
  const { t } = useTranslationWithPrefix('views.timeline');
  const shouldReduceMotion = useReducedMotion();
  const { ref, isDropTarget: isDirectDropTarget } = useDroppable({
    id: `period:${period.periodLocator}`,
    accept: TIMELINE_COURSE_DRAG_TYPE,
    data: { kind: 'timeline-period', periodLocator: period.periodLocator },
    collisionDetector: shapeIntersection,
  });

  const isDropTarget = isDirectDropTarget || isActiveDropTarget;

  return (
    <div
      ref={ref}
      data-flip-id={`drop-cell:${period.periodLocator}`}
      className={`relative overflow-hidden rounded-lg border border-dashed transition-[border-color,background-color,box-shadow,scale] duration-200 ease-out ${
        isDropTarget
          ? 'z-30 scale-[1.01] border-accent bg-accent/10 shadow-[0_0_0_1px_rgba(65,150,72,0.28),inset_0_0_24px_rgba(65,150,72,0.06)]'
          : isDragging && hasHighlightedDropPeriods && isHighlighted
            ? 'z-20 border-accent/60 bg-accent/10 shadow-[inset_0_0_0_1px_rgba(65,150,72,0.16)]'
            : isDragging && hasHighlightedDropPeriods
              ? 'border-border bg-background/20 opacity-45'
              : isDragging
                ? 'border-border2 bg-container/25 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]'
                : 'border-border bg-background/30'
      }`}
      style={{ gridColumn: index + 1, gridRow: `1 / span ${rowCount}` }}
    >
      <AnimatePresence initial={false}>
        {(isDropTarget || (isDragging && isHighlighted)) && (
          <motion.div
            key={isDropTarget ? 'drop-here' : 'offered-here'}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            className="pointer-events-none absolute inset-x-3 top-2 z-40 rounded-md border border-accent/60 bg-accent px-2 py-1.5 text-center text-xs font-semibold text-offwhite shadow-[0_8px_20px_rgba(0,0,0,0.28)]"
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -3, filter: 'blur(2px)' }}
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -3, filter: 'blur(2px)' }}
            transition={{ duration: shouldReduceMotion ? 0.01 : 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            {isDropTarget ? t('board.dropHere') : t('board.offeredHere')}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
