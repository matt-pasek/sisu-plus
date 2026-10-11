import type { RecurringSeries } from '@/app/schedule';
import type { LabelPicker, StudyEventLike } from './types';

export const toSeries = (studyEvent: StudyEventLike, fallbackId: string, label: LabelPicker): RecurringSeries => ({
  id: studyEvent.id ?? fallbackId,
  startTime: studyEvent.startTime,
  duration: studyEvent.duration,
  recursEvery: studyEvent.recursEvery,
  recursUntil: studyEvent.recursUntil?.slice(0, 10),
  exceptions: studyEvent.exceptions,
  cancellations: studyEvent.cancellations,
  locationIds: studyEvent.locationIds,
  occurrences: studyEvent.events?.map((event) => ({
    start: event.start,
    end: event.end,
    duration: event.duration,
    excluded: event.excluded,
    cancelled: event.cancelled,
    irregularLocationIds: event.irregularLocationIds ?? undefined,
    notice: label(event.notice),
  })),
});
