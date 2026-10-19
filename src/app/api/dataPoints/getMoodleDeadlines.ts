import { parseIcsCalendar } from '@ts-ics/schema-zod';
import type { IcsCalendar } from 'ts-ics';
import { useChromeStorage } from '@/app/hooks/useChromeStorage';
import { useSisuQuery } from '@/app/hooks/useSisuQuery';

interface MoodleDeadlinesResponse {
  deadlines?: IcsCalendar;
  deadlinesLoading: boolean;
  missingToken?: boolean;
  deadlinesError: boolean;
  refetchDeadlines: () => void;
}

export const getMoodleDeadlines = (): MoodleDeadlinesResponse => {
  const [prefs, , isLoaded] = useChromeStorage();

  const query = useSisuQuery(
    ['moodle-deadlines', prefs.moodleToken],
    async () => {
      if (!prefs.moodleToken) return false;

      const moodleDeadlines = await new Promise<string>((resolve) =>
        chrome.runtime.sendMessage({ type: 'GET_MOODLE' }, resolve),
      );

      return parseIcsCalendar(moodleDeadlines);
    },
    { enabled: isLoaded },
  );
  const refetchDeadlines = () => {
    void query.refetch();
  };

  if (query.data === false) {
    return { deadlinesLoading: false, missingToken: true, deadlinesError: false, refetchDeadlines };
  }
  return {
    deadlines: query.data,
    deadlinesLoading: !isLoaded || query.isLoading,
    missingToken: false,
    deadlinesError: query.isError,
    refetchDeadlines,
  };
};
