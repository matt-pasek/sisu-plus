import type { Session } from './types';

// Some universities (LUT) publish every week of a subgroup as its own study event, so the subgroup is the series.
export const seriesKeyOf = (session: Session): string =>
  session.groupId ? `group:${session.courseKey}:${session.groupId}` : `event:${session.seriesId}`;
