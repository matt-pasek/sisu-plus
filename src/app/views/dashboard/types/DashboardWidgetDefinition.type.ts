import type { DashboardWidgetId } from './DashboardWidgetId.type';
import type { WidgetSize } from './WidgetSize.type';

export interface DashboardWidgetDefinition {
  id: DashboardWidgetId;
  title: string;
  description: string;
  size: WidgetSize;
  minSize: WidgetSize;
  maxSize: WidgetSize;
}
