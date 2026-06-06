import type { DashboardWidgetId } from '@/app/views/dashboard/util/widgetsHandlers';

export const DASHBOARD_WIDGET_DRAG_TYPE = 'dashboard-widget';

export interface DashboardWidgetDragData {
  kind: 'dashboard-widget';
  widgetId: DashboardWidgetId;
}

export interface DashboardCellDropData {
  kind: 'dashboard-cell';
  x: number;
  y: number;
}

export const getDashboardWidgetDragData = (widgetId: DashboardWidgetId): DashboardWidgetDragData => ({
  kind: 'dashboard-widget',
  widgetId,
});

export const isDashboardWidgetDragData = (value: unknown): value is DashboardWidgetDragData => {
  return (
    typeof value === 'object' &&
    value != null &&
    'kind' in value &&
    value.kind === 'dashboard-widget' &&
    'widgetId' in value &&
    typeof value.widgetId === 'string'
  );
};

export const isDashboardCellDropData = (value: unknown): value is DashboardCellDropData => {
  return (
    typeof value === 'object' &&
    value != null &&
    'kind' in value &&
    value.kind === 'dashboard-cell' &&
    'x' in value &&
    typeof value.x === 'number' &&
    'y' in value &&
    typeof value.y === 'number'
  );
};
