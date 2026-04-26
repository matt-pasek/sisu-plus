export type TimelineValidationWarningType = 'period' | 'prerequisite';

export interface TimelineValidationWarning {
  id: string;
  message: string;
  type: TimelineValidationWarningType;
}
