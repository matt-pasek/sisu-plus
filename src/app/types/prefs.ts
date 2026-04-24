export interface SisuPrefs {
  sisuPlusActive: boolean;
  moodleToken: string | null;
}

export const DEFAULT_PREFS: SisuPrefs = {
  sisuPlusActive: true,
  moodleToken: null,
};
