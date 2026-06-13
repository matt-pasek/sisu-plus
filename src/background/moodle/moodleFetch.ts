export const fetchMoodleCalendar = async (): Promise<string> => {
  const { moodleToken } = await chrome.storage.sync.get('moodleToken');

  if (typeof moodleToken !== 'string' || !moodleToken.trim()) {
    throw new Error('Missing Moodle calendar URL');
  }

  const response = await fetch(moodleToken);
  if (!response.ok) throw new Error('Moodle calendar fetch failed');
  return response.text();
};
