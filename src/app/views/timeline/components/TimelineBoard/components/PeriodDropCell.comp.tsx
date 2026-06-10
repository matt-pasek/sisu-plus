import React from 'react';
import { useDroppable } from '@dnd-kit/react';
import { shapeIntersection } from '@dnd-kit/collision';
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
      <div
        className={`pointer-events-none absolute inset-x-3 top-2 z-40 rounded-md border border-accent/60 bg-accent px-2 py-1.5 text-center text-xs font-semibold text-offwhite shadow-[0_8px_20px_rgba(0,0,0,0.28)] transition-[opacity,scale,filter] duration-200 ease-[cubic-bezier(0.2,0,0,1)] ${
          isDropTarget || (isDragging && isHighlighted)
            ? 'blur-0 scale-100 opacity-100'
            : 'scale-[0.25] opacity-0 blur-xs'
        }`}
      >
        {isDropTarget ? t('board.dropHere') : t('board.offeredHere')}
      </div>
    </div>
  );
};
