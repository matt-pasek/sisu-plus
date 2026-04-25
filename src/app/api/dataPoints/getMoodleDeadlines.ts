import { parseIcsCalendar } from '@ts-ics/schema-zod';
import { useSisuQuery } from '@/app/hooks/useSisuQuery';
import { IcsCalendar } from 'ts-ics';

interface MoodleDeadlinesResponse {
  deadlines?: IcsCalendar;
  deadlinesLoading: boolean;
}

export const getMoodleDeadlines = (): MoodleDeadlinesResponse => {
  const { data: deadlines, isLoading: deadlinesLoading } = useSisuQuery(['moodle-deadlines'], async () => {
    const moodleDeadlines = await new Promise<string>((resolve) =>
      chrome.runtime.sendMessage({ type: 'GET_MOODLE' }, resolve),
    );

    return parseIcsCalendar(moodleDeadlines);
  });

  return { deadlines: deadlines, deadlinesLoading };
};
