import React from 'react';
import { useDraggable } from '@dnd-kit/react';
import { AnimatePresence, motion, useAnimationControls } from 'motion/react';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { Widget } from './Widget.comp';
import { DASHBOARD_COLUMNS } from '../util/widgetDefinitions';
import { DASHBOARD_WIDGET_DRAG_TYPE, getDashboardWidgetDragData } from '../util/dndHandlers';
import type { DashboardWidgetId, DashboardWidgetLayout } from '../types';

type ResizeAxis = 'x' | 'y' | 'both';

const getResizeBlockedMotion = (axis: ResizeAxis) => {
  const offset = 5;
  return {
    x: axis === 'y' ? undefined : [0, offset, -offset, offset / 2, 0],
    y: axis === 'x' ? undefined : [0, offset, -offset, offset / 2, 0],
    transition: { duration: 0.22, ease: 'easeOut' as const },
  };
};

interface Props {
  children: React.ReactNode;
  header: React.ReactNode;
  isEditMode: boolean;
  item: DashboardWidgetLayout;
  onRemove: (id: DashboardWidgetId) => void;
  onResize: (id: DashboardWidgetId, delta: Partial<Pick<DashboardWidgetLayout, 'w' | 'h'>>) => boolean;
}

export const DashboardWidgetShell: React.FC<Props> = ({ children, header, isEditMode, item, onRemove, onResize }) => {
  const { t } = useTranslationWithPrefix('views.dashboard');
  const { ref, isDragging } = useDraggable({
    id: `dashboard-widget:${item.id}`,
    type: DASHBOARD_WIDGET_DRAG_TYPE,
    data: getDashboardWidgetDragData(item.id),
    disabled: !isEditMode,
  });
  const title = t(`widgets.titles.${item.id.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase())}`);
  const blockedResizeControls = useAnimationControls();

  const animateResizeBlocked = (axis: ResizeAxis) => {
    void blockedResizeControls.start(getResizeBlockedMotion(axis));
  };

  const applyResize = (axis: ResizeAxis, patch: Partial<Pick<DashboardWidgetLayout, 'w' | 'h'>>) => {
    const accepted = onResize(item.id, patch);
    if (!accepted) animateResizeBlocked(axis);
  };

  const startResizeDrag =
    (axis: ResizeAxis): React.PointerEventHandler<HTMLButtonElement> =>
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      event.currentTarget.setPointerCapture(event.pointerId);

      const shell = event.currentTarget.closest('[data-dashboard-widget-shell]');
      const grid = shell?.parentElement;
      if (!grid) return;

      const gridRect = grid.getBoundingClientRect();
      const gridStyles = window.getComputedStyle(grid);
      const columnGap = Number.parseFloat(gridStyles.columnGap || gridStyles.gap || '0') || 0;
      const rowGap = Number.parseFloat(gridStyles.rowGap || gridStyles.gap || '0') || 0;
      const columnStep = (gridRect.width - columnGap * (DASHBOARD_COLUMNS - 1)) / DASHBOARD_COLUMNS + columnGap;
      const rowStep = 72 + rowGap;
      const startX = event.clientX;
      const startY = event.clientY;
      const startItem = item;
      let lastColumns = 0;
      let lastRows = 0;

      const handleMove = (moveEvent: PointerEvent) => {
        const columnDelta = axis === 'y' ? 0 : Math.round((moveEvent.clientX - startX) / columnStep);
        const rowDelta = axis === 'x' ? 0 : Math.round((moveEvent.clientY - startY) / rowStep);
        if (columnDelta === lastColumns && rowDelta === lastRows) return;
        lastColumns = columnDelta;
        lastRows = rowDelta;
        const patch: Partial<Pick<DashboardWidgetLayout, 'w' | 'h'>> = {};
        if (axis !== 'y') patch.w = startItem.w + columnDelta;
        if (axis !== 'x') patch.h = startItem.h + rowDelta;
        applyResize(axis, patch);
      };

      const handleUp = () => {
        window.removeEventListener('pointermove', handleMove);
        window.removeEventListener('pointerup', handleUp);
        window.removeEventListener('pointercancel', handleUp);
      };

      window.addEventListener('pointermove', handleMove);
      window.addEventListener('pointerup', handleUp);
      window.addEventListener('pointercancel', handleUp);
    };

  const editActions = isEditMode ? (
    <div className="flex items-center gap-1.5">
      <button
        aria-label={t('widgets.actions.shrink', { title })}
        className="flex size-9 items-center justify-center rounded-lg bg-container2 text-lightGrey transition-[background-color,color,transform] duration-150 hover:bg-offwhite/10 hover:text-offwhite active:scale-[0.96]"
        onClick={() => applyResize('both', { w: item.w - 1, h: item.h - 1 })}
        onPointerDown={(event) => event.stopPropagation()}
        type="button"
      >
        -
      </button>
      <button
        aria-label={t('widgets.actions.grow', { title })}
        className="flex size-9 items-center justify-center rounded-lg bg-container2 text-lightGrey transition-[background-color,color,transform] duration-150 hover:bg-offwhite/10 hover:text-offwhite active:scale-[0.96]"
        onClick={() => applyResize('both', { w: item.w + 1, h: item.h + 1 })}
        onPointerDown={(event) => event.stopPropagation()}
        type="button"
      >
        +
      </button>
      <button
        aria-label={t('widgets.actions.remove', { title })}
        className="flex size-9 items-center justify-center rounded-lg bg-danger/15 text-danger transition-[background-color,transform] duration-150 hover:bg-danger/25 active:scale-[0.96]"
        onClick={() => onRemove(item.id)}
        onPointerDown={(event) => event.stopPropagation()}
        type="button"
      >
        x
      </button>
    </div>
  ) : null;

  return (
    <motion.div
      layout
      initial={false}
      ref={ref}
      animate={blockedResizeControls}
      data-dashboard-widget-shell
      transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
      className={`relative min-h-0 transition-[opacity,scale,filter] duration-200 ${
        isEditMode ? 'cursor-grab touch-none active:scale-[0.96] active:cursor-grabbing' : ''
      } ${isDragging ? 'z-30 scale-[1.02] opacity-45' : 'z-10'}`}
      style={{
        gridColumn: `${item.x + 1} / span ${item.w}`,
        gridRow: `${item.y + 1} / span ${item.h}`,
      }}
    >
      <Widget actions={editActions} header={header} loading={false}>
        {children}
      </Widget>

      <AnimatePresence initial={false}>
        {isEditMode && (
          <>
            <motion.div
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              className="absolute -right-2 -bottom-2 z-20 rounded-full bg-accent/90 px-2.5 py-1 font-mono text-[10px] font-semibold text-offwhite shadow-[0_8px_20px_rgba(0,0,0,0.35)]"
              exit={{ opacity: 0, scale: 0.96, filter: 'blur(4px)' }}
              initial={{ opacity: 0, scale: 0.96, filter: 'blur(4px)' }}
              transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
            >
              {item.w}x{item.h}
            </motion.div>
            <motion.div
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              className="pointer-events-none absolute inset-0 rounded-2xl border border-accent/45 bg-background/10 shadow-[0_0_0_1px_rgba(65,150,72,0.18),0_14px_38px_rgba(0,0,0,0.32)]"
              exit={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
              initial={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
              transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
            />
            <button
              aria-label={t('widgets.actions.resizeHorizontally', { title })}
              className="absolute top-14 -right-2 bottom-10 z-20 w-4 cursor-ew-resize rounded-full transition-[background-color,opacity] duration-150 hover:bg-accent/25"
              onPointerDown={startResizeDrag('x')}
              type="button"
            />
            <button
              aria-label={t('widgets.actions.resizeVertically', { title })}
              className="absolute right-10 -bottom-2 left-10 z-20 h-4 cursor-ns-resize rounded-full transition-[background-color,opacity] duration-150 hover:bg-accent/25"
              onPointerDown={startResizeDrag('y')}
              type="button"
            />
            <button
              aria-label={t('widgets.actions.resize', { title })}
              className="absolute -right-2 -bottom-2 z-30 size-7 cursor-nwse-resize rounded-full border border-accent/50 bg-accent/25 shadow-[0_8px_20px_rgba(0,0,0,0.35)] transition-[background-color,scale] duration-150 hover:bg-accent/40 active:scale-[0.96]"
              onPointerDown={startResizeDrag('both')}
              type="button"
            />
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
