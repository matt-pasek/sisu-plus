import { parseIcsCalendar } from '@ts-ics/schema-zod';
import { useSisuQuery } from '@/app/hooks/useSisuQuery';
import { IcsCalendar } from 'ts-ics';
import { useChromeStorage } from '@/app/hooks/useChromeStorage';

interface MoodleDeadlinesResponse {
  deadlines?: IcsCalendar;
  deadlinesLoading: boolean;
  missingToken?: boolean;
}

export const getMoodleDeadlines = (): MoodleDeadlinesResponse => {
  const [prefs] = useChromeStorage();

  const { data: deadlines, isLoading: deadlinesLoading } = useSisuQuery(
    ['moodle-deadlines', prefs.moodleToken],
    async () => {
      if (!prefs.moodleToken) return false;

      const moodleDeadlines = await new Promise<string>((resolve) =>
        chrome.runtime.sendMessage({ type: 'GET_MOODLE' }, resolve),
      );

      return parseIcsCalendar(moodleDeadlines);
    },
  );

  if (deadlines === false) return { deadlinesLoading: false, missingToken: true };
  return { deadlines: deadlines, deadlinesLoading, missingToken: false };
};
