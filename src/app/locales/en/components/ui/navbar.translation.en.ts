export type NavbarTranslation = {
  creditsUnit: string;
  links: {
    dashboard: string;
    timeline: string;
    structure: string;
    registration: string;
  };
  notificationBell: {
    aria: string;
    empty: string;
    markAll: string;
    relative: {
      daysAgo: string;
      hoursAgo: string;
      justNow: string;
      minutesAgo: string;
    };
    title: string;
  };
};

export const navbarTranslation: NavbarTranslation = {
  creditsUnit: 'cr',
  links: {
    dashboard: 'Dashboard',
    timeline: 'Timeline',
    structure: 'Structure',
    registration: 'Registration',
  },
  notificationBell: {
    aria: 'Notifications',
    empty: 'No notifications',
    markAll: 'Mark all read',
    relative: {
      daysAgo: '{{count}}d ago',
      hoursAgo: '{{count}}h ago',
      justNow: 'Just now',
      minutesAgo: '{{count}}m ago',
    },
    title: 'Notifications',
  },
};
