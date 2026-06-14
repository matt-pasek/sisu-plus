import React from 'react';
import { useDraggable } from '@dnd-kit/react';
import { useAnimationControls } from 'motion/react';
import {
  TimelineCourseCard,
  type TimelineCourseCardProps,
} from '@/app/views/timeline/components/TimelineCourseCard.comp';
import { getCourseDragData, TIMELINE_COURSE_DRAG_TYPE } from '@/app/views/timeline/util/dndHandlers';

interface Props extends TimelineCourseCardProps {
  disabled?: boolean;
}

export const DraggableTimelineCourseCard: React.FC<Props> = ({ disabled = false, className = '', ...props }) => {
  const { ref, isDragging } = useDraggable({
    id: `course:${props.course.courseUnitId}`,
    type: TIMELINE_COURSE_DRAG_TYPE,
    data: getCourseDragData(props.course, props.dragPeriodCount),
    disabled,
  });
  const dragBlockedControls = useAnimationControls();
  const handlePointerDown: React.PointerEventHandler<HTMLDivElement> = (event) => {
    props.onPointerDown?.(event);
    if (!disabled) return;
    void dragBlockedControls.start({
      x: [0, -3, 3, -2, 2, 0],
      transition: { duration: 0.22, ease: 'easeOut' },
    });
  };

  return (
    <TimelineCourseCard
      {...props}
      className={`${disabled ? 'cursor-not-allowed opacity-85' : 'cursor-grab touch-none active:scale-[0.96] active:cursor-grabbing'} ${
        isDragging ? 'scale-[1.02] opacity-45 shadow-[0_12px_24px_rgba(0,0,0,0.28)]' : ''
      } ${className}`}
      dragBlockedControls={dragBlockedControls}
      onPointerDown={handlePointerDown}
      style={{
        ...props.style,
        cursor: disabled ? 'not-allowed' : props.style?.cursor,
        userSelect: disabled ? props.style?.userSelect : 'none',
      }}
      ref={ref}
    />
  );
};
