import React from 'react';
import { useDroppable } from '@dnd-kit/react';
import type { DashboardWidgetLayout } from '../types';
import { DASHBOARD_WIDGET_DRAG_TYPE } from '../util/dndHandlers';

interface Props {
  previewLayout: DashboardWidgetLayout | null;
  previewValid: boolean;
  x: number;
  y: number;
  isEditMode: boolean;
}

export const DashboardCell: React.FC<Props> = ({ previewLayout, previewValid, x, y, isEditMode }) => {
  const { ref, isDropTarget } = useDroppable({
    id: `dashboard-cell:${x}:${y}`,
    accept: DASHBOARD_WIDGET_DRAG_TYPE,
    data: { kind: 'dashboard-cell', x, y },
  });
  const isInPreview =
    previewLayout != null &&
    x >= previewLayout.x &&
    x < previewLayout.x + previewLayout.w &&
    y >= previewLayout.y &&
    y < previewLayout.y + previewLayout.h;

  return (
    <div
      ref={ref}
      className={`rounded-lg border border-dashed transition-[border-color,background-color,box-shadow,opacity] duration-200 ${
        isInPreview
          ? previewValid
            ? 'border-accent/80 bg-accent/15 shadow-[inset_0_0_18px_rgba(65,150,72,0.1)]'
            : 'border-danger/80 bg-danger/10 shadow-[inset_0_0_18px_rgba(240,107,107,0.1)]'
          : isDropTarget
            ? 'border-accent bg-accent/10 shadow-[inset_0_0_18px_rgba(65,150,72,0.08)]'
            : isEditMode
              ? 'border-border/55 bg-container/15'
              : 'pointer-events-none border-transparent opacity-0'
      }`}
      style={{ gridColumn: x + 1, gridRow: y + 1 }}
    />
  );
};
