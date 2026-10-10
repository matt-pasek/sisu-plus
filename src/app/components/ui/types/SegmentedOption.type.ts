import type { ReactNode } from 'react';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  badge?: ReactNode;
  disabled?: boolean;
}
