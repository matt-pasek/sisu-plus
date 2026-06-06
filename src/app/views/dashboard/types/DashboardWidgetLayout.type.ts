import type { DashboardWidgetId } from './DashboardWidgetId.type';
import type { WidgetSize } from './WidgetSize.type';

export interface DashboardWidgetLayout extends WidgetSize {
  id: DashboardWidgetId;
  x: number;
  y: number;
}
