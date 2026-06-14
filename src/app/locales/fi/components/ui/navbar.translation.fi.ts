import { NavbarTranslation } from '@/app/locales/en/components/ui/navbar.translation.en';

export const navbarTranslation: NavbarTranslation = {
  creditsUnit: 'op',
  links: {
    dashboard: 'Etusivu',
    timeline: 'Aikajana',
    structure: 'Rakenne',
    registration: 'Ilmoittautuminen',
  },
  notificationBell: {
    aria: 'Ilmoitukset',
    empty: 'Ei ilmoituksia',
    markAll: 'Merkitse luetuiksi',
    relative: {
      daysAgo: '{{count}} pv sitten',
      hoursAgo: '{{count}} h sitten',
      justNow: 'Juuri nyt',
      minutesAgo: '{{count}} min sitten',
    },
    title: 'Ilmoitukset',
  },
};
