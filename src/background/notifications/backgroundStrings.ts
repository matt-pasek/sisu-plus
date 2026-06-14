import type { Locale } from '@/app/locales/locale';
import { DEFAULT_LOCALE, isLocale } from '@/app/locales/locale';

export interface NotificationStrings {
  moodleTitleTomorrow: string;
  moodleTitleHour: string;
  leadTime: (minutes: number) => string;
  registrationOpenTitleSingle: (lead: string) => string;
  registrationOpenTitleMulti: (lead: string) => string;
  registrationOpenBodySingle: (name: string, lead: string) => string;
  registrationOpenBodyMulti: (count: number, lead: string) => string;
  registrationCloseTitle: string;
  registrationCloseBody: (name: string) => string;
  sisuSyncTitle: string;
  sisuSyncBody: string;
}

const EN: NotificationStrings = {
  moodleTitleTomorrow: 'Moodle deadline tomorrow',
  moodleTitleHour: 'Moodle deadline in 1 hour',
  leadTime: (m) => {
    if (m >= 1440) return 'in 1 day';
    const h = m / 60;
    if (m >= 60) return `in ${h} hour${h === 1 ? '' : 's'}`;
    return `in ${m} minutes`;
  },
  registrationOpenTitleSingle: (lead) => (lead ? `Registration opens ${lead}` : 'Registration opens'),
  registrationOpenTitleMulti: (lead) => (lead ? `Registrations open ${lead}` : 'Registrations open'),
  registrationOpenBodySingle: (name, lead) => `${name} opens for registration${lead ? ` ${lead}` : ''}.`,
  registrationOpenBodyMulti: (count, lead) => `${count} courses open for registration${lead ? ` ${lead}` : ''}.`,
  registrationCloseTitle: 'Registration closes soon',
  registrationCloseBody: (name) => `${name} closes for registration tomorrow.`,
  sisuSyncTitle: 'Sisu+ needs a fresh sync',
  sisuSyncBody: 'Open Sisu to refresh registration windows and course data.',
};

const FI: NotificationStrings = {
  moodleTitleTomorrow: 'Moodle-deadline huomenna',
  moodleTitleHour: 'Moodle-deadline tunnin päästä',
  leadTime: (m) => {
    if (m >= 1440) return 'päivän päästä';
    const h = m / 60;
    if (m >= 60) return `${h === 1 ? 'tunnin' : `${h} tunnin`} päästä`;
    return `${m} minuutin päästä`;
  },
  registrationOpenTitleSingle: (lead) => (lead ? `Ilmoittautuminen avautuu ${lead}` : 'Ilmoittautuminen avautuu'),
  registrationOpenTitleMulti: (lead) => (lead ? `Ilmoittautumiset avautuvat ${lead}` : 'Ilmoittautumiset avautuvat'),
  registrationOpenBodySingle: (name, lead) =>
    lead ? `${name} avautuu ilmoittautumiselle ${lead}.` : `${name} avautuu ilmoittautumiselle.`,
  registrationOpenBodyMulti: (count, lead) =>
    lead ? `${count} kurssia avautuu ilmoittautumiselle ${lead}.` : `${count} kurssia avautuu ilmoittautumiselle.`,
  registrationCloseTitle: 'Ilmoittautuminen sulkeutuu pian',
  registrationCloseBody: (name) => `${name} sulkeutuu ilmoittautumiselle huomenna.`,
  sisuSyncTitle: 'Sisu+ tarvitsee päivityksen',
  sisuSyncBody: 'Avaa Sisu päivittääksesi ilmoittautumisikkunat ja kurssitiedot.',
};

const STRINGS: Record<Locale, NotificationStrings> = { en: EN, fi: FI };

export const getNotificationStrings = (locale: Locale): NotificationStrings => STRINGS[locale];

export const getBackgroundLocale = async (): Promise<Locale> => {
  const result = await chrome.storage.sync.get({ locale: DEFAULT_LOCALE });
  const locale = result.locale as unknown;
  return isLocale(locale) ? locale : DEFAULT_LOCALE;
};
