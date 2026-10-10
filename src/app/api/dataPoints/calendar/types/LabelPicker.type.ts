import type { LocalizedText } from './LocalizedText.type';

export type LabelPicker = (value: LocalizedText | null | undefined) => string | null;
