/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { widgetsOverlap } from '../util/widgetLayout';
import {
  DASHBOARD_COLUMNS,
  DASHBOARD_ROWS,
  DASHBOARD_WIDGETS,
  DEFAULT_DASHBOARD_LAYOUT,
} from './widgetDefinitions.const';

describe('DEFAULT_DASHBOARD_LAYOUT', () => {
  test('puts Next Class top-right', () => {
    expect(DEFAULT_DASHBOARD_LAYOUT.find((item) => item.id === 'next-class')).toEqual({
      id: 'next-class',
      x: 7,
      y: 0,
      w: 3,
      h: 3,
    });
  });

  test('has no overlaps and fits the grid', () => {
    DEFAULT_DASHBOARD_LAYOUT.forEach((item, index) => {
      expect(item.x + item.w).toBeLessThanOrEqual(DASHBOARD_COLUMNS);
      expect(item.y + item.h).toBeLessThanOrEqual(DASHBOARD_ROWS);
      DEFAULT_DASHBOARD_LAYOUT.slice(index + 1).forEach((other) => expect(widgetsOverlap(item, other)).toBe(false));
    });
  });

  test('respects every widget size limit', () => {
    DEFAULT_DASHBOARD_LAYOUT.forEach((item) => {
      const definition = DASHBOARD_WIDGETS.find((widget) => widget.id === item.id);
      expect(definition).toBeDefined();
      expect(item.w).toBeGreaterThanOrEqual(definition?.minSize.w ?? 0);
      expect(item.h).toBeGreaterThanOrEqual(definition?.minSize.h ?? 0);
      expect(item.w).toBeLessThanOrEqual(definition?.maxSize.w ?? 0);
      expect(item.h).toBeLessThanOrEqual(definition?.maxSize.h ?? 0);
    });
  });
});
