import { pickLabel } from '@/app/api/resolvers/helpers/pickLabel';
import type { LabelPicker } from './types';

export const pickCalendarLabel: LabelPicker = (value) => (value ? pickLabel(value) : null);
