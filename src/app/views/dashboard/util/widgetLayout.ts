import type { DashboardWidgetDefinition, DashboardWidgetId, DashboardWidgetLayout } from '../types';
import { DASHBOARD_COLUMNS, DASHBOARD_ROWS, DASHBOARD_WIDGETS, DASHBOARD_WIDGET_IDS } from './widgetDefinitions';

export const isDashboardWidgetId = (id: string): id is DashboardWidgetId =>
  DASHBOARD_WIDGET_IDS.has(id as DashboardWidgetId);

export const sanitizeDashboardLayout = (layout: DashboardWidgetLayout[]): DashboardWidgetLayout[] =>
  layout.filter((item) => isDashboardWidgetId(item.id));

export const getWidgetDefinition = (id: DashboardWidgetId): DashboardWidgetDefinition =>
  DASHBOARD_WIDGETS.find((widget) => widget.id === id)!;

export const getHiddenWidgets = (layout: DashboardWidgetLayout[]): DashboardWidgetDefinition[] => {
  const visible = new Set(layout.map((item) => item.id));
  return DASHBOARD_WIDGETS.filter((widget) => !visible.has(widget.id));
};

export const clampWidgetLayout = (item: DashboardWidgetLayout): DashboardWidgetLayout => {
  const definition = getWidgetDefinition(item.id);
  const w = Math.min(Math.max(item.w, definition.minSize.w), Math.min(definition.maxSize.w, DASHBOARD_COLUMNS));
  const h = Math.min(Math.max(item.h, definition.minSize.h), Math.min(definition.maxSize.h, DASHBOARD_ROWS));
  return {
    ...item,
    w,
    h,
    x: Math.min(Math.max(item.x, 0), DASHBOARD_COLUMNS - w),
    y: Math.min(Math.max(item.y, 0), DASHBOARD_ROWS - h),
  };
};

export const widgetsOverlap = (first: DashboardWidgetLayout, second: DashboardWidgetLayout): boolean =>
  first.x < second.x + second.w &&
  first.x + first.w > second.x &&
  first.y < second.y + second.h &&
  first.y + first.h > second.y;

export const canPlaceDashboardWidget = (
  layout: DashboardWidgetLayout[],
  candidate: DashboardWidgetLayout,
  ignoreId?: DashboardWidgetId,
): boolean => {
  const clamped = clampWidgetLayout(candidate);
  return !layout.some((item) => item.id !== ignoreId && widgetsOverlap(item, clamped));
};

export const findOpenDashboardSlot = (
  layout: DashboardWidgetLayout[],
  id: DashboardWidgetId,
): DashboardWidgetLayout | null => {
  const definition = getWidgetDefinition(id);
  const candidate = clampWidgetLayout({ id, x: 0, y: 0, ...definition.size });

  for (let y = 0; y <= DASHBOARD_ROWS - candidate.h; y += 1) {
    for (let x = 0; x <= DASHBOARD_COLUMNS - candidate.w; x += 1) {
      const next = { ...candidate, x, y };
      if (canPlaceDashboardWidget(layout, next)) return next;
    }
  }

  return null;
};
