import type { LayerPrefsPatch } from './LayerPrefsPatch.type';

export interface LayerControls {
  showCancelled: boolean;
  showNotes: boolean;
  notesFailed: boolean;
  onChange: (patch: LayerPrefsPatch) => void;
  onRetryNotes: () => void;
}
