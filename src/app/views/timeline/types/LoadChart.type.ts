import type { LoadTermGroup } from './LoadTermGroup.type';

export interface LoadChart {
  groups: LoadTermGroup[];
  /** Where the credits-needed-per-period line sits, on the bars' scale. */
  neededRatio: number | null;
}
