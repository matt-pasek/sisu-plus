import type { RecurrenceRule } from '@/app/schedule';

export const REPEAT_OPTIONS: RecurrenceRule[] = ['NEVER', 'DAILY', 'WEEKLY', 'EVERY_SECOND_WEEK', 'MONTHLY'];

const TIME_VALUE = /^(\d{2}):(\d{2})$/;

const pad = (value: number): string => String(value).padStart(2, '0');

export const minutesToTimeValue = (minutes: number): string => `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;

export const timeValueToMinutes = (value: string): number | null => {
  const match = value.match(TIME_VALUE);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours < 24 && minutes < 60 ? hours * 60 + minutes : null;
};

export const parseRepeat = (value: string): RecurrenceRule =>
  REPEAT_OPTIONS.find((option) => option === value) ?? 'NEVER';
