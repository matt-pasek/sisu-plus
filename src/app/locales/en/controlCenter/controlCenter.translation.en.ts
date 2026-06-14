export type ControlCenterTranslation = {
  activate: {
    descriptionActive: string;
    descriptionPaused: string;
    title: string;
    helperActive: string;
    helperPaused: string;
  };
  footer: {
    madeWithLove: string;
    by: string;
    contact: string;
  };
  moodle: {
    checkUrl: string;
    connectedHelper: string;
    label: string;
    validUrl: string;
  };
  notifications: {
    back: string;
    body: string;
    delivery: {
      both: string;
      'in-app': string;
      off: string;
      'out-of-app': string;
    };
    dev: {
      desktop: string;
      inApp: string;
      permission: {
        check: string;
        current: string;
        queueUnread: string;
        queued: string;
        request: string;
        result: string;
        title: string;
      };
      send: string;
      title: string;
    };
    entry: {
      body: string;
      title: string;
    };
    eyebrow: string;
    lead: {
      body: string;
      options: Record<0 | 15 | 30 | 60 | 120 | 1440, string>;
      title: string;
    };
    never: string;
    nudge: {
      body: string;
      dismiss: string;
      open: string;
      title: string;
    };
    stats: {
      moodle: string;
      moodleValue: string;
      sisu: string;
      sisuValue: string;
      unread: string;
      unreadCount: string;
    };
    title: string;
    types: {
      'moodle-deadline': { body: string; title: string };
      'registration-close': { body: string; title: string };
      'registration-open': { body: string; title: string };
      'sisu-sync': { body: string; title: string };
    };
    unread: {
      empty: string;
      markAll: string;
      title: string;
    };
  };
  onboarding: {
    back: string;
    complete: string;
    finishSetup: string;
    firstRunSetup: string;
    continue: string;
    progressLabel: string;
    skip: string;
    steps: string[];
    turnOn: string;
    welcome: {
      title: string;
      body: string;
      cardTitle: string;
      cardBody: string;
    };
    control: {
      title: string;
      body: string;
      currentMode: string;
      activeMode: string;
      nativeMode: string;
    };
    switchOn: {
      title: string;
      body: string;
      status: string;
      active: string;
      paused: string;
    };
    notifications: {
      body: string;
      delivery: {
        desktop: string;
        inApp: string;
      };
      enable: string;
      enabledTitle: string;
      enabledBody: string;
      enabledButton: string;
      manageHint: string;
      looksGood: string;
      title: string;
      types: {
        'moodle-deadline': { title: string };
        'registration-close': { title: string };
        'registration-open': { title: string };
        'sisu-sync': { title: string };
      };
    };
    views: {
      title: string;
      dashboardTitle: string;
      dashboardBody: string;
      timelineTitle: string;
      timelineBody: string;
      structureTitle: string;
      structureBody: string;
      registrationTitle: string;
      registrationBody: string;
    };
    moodle: {
      title: string;
      body: string;
      openExport: string;
      urlLabel: string;
      validHint: string;
      invalidHint: string;
    };
  };
  pausedNotice: string;
  status: {
    active: string;
    paused: string;
  };
  title: string;
  tip: {
    dormantTitle: string;
    dormantBody: string;
    planningTitle: string;
    planningBody: string;
    structureTitle: string;
    structureBody: string;
    enrolmentsTitle: string;
    enrolmentsBody: string;
    dashboardTitle: string;
    dashboardBody: string;
  };
  toggle: {
    open: string;
    close: string;
  };
};

export const controlCenterTranslation: ControlCenterTranslation = {
  activate: {
    descriptionActive: 'A quiet layer for planning, deadlines, and study pace.',
    descriptionPaused: 'Paused. Native Sisu is visible behind this control.',
    title: 'Activate SISU+',
    helperActive: 'Replace the native student pages.',
    helperPaused: 'Switch back to the enhanced dashboard.',
  },
  footer: {
    madeWithLove: 'SISU+ v{{version}} made with love',
    by: 'by',
    contact: 'contact',
  },
  moodle: {
    checkUrl: 'Check URL',
    connectedHelper: 'Paste Moodle’s exported calendar link once. SISU+ uses it only for deadline widgets.',
    label: 'Moodle Sync',
    validUrl: 'Calendar URL',
  },
  notifications: {
    back: 'Back',
    body: 'Choose which study events can interrupt you, and where they should appear.',
    delivery: {
      both: 'Both',
      'in-app': 'In-app',
      off: 'Off',
      'out-of-app': 'Desktop',
    },
    dev: {
      desktop: 'Fire desktop notification',
      inApp: 'Fire in-app toast',
      permission: {
        check: 'Check status',
        current: 'Current: {{status}}',
        queueUnread: 'Queue unread',
        queued: 'Test unread queued',
        request: 'Request',
        result: 'Result: {{status}}',
        title: 'Permission',
      },
      send: 'Send',
      title: 'Dev tools',
    },
    entry: {
      body: 'Delivery modes, unread items, and sync status',
      title: 'Notification settings',
    },
    eyebrow: 'Notifications',
    lead: {
      body: 'How early SISU+ should warn before a registration window opens.',
      options: {
        0: 'At opening',
        15: '15 min before',
        30: '30 min before',
        60: '1 hour before',
        120: '2 hours before',
        1440: '1 day before',
      },
      title: 'Registration-open lead time',
    },
    never: 'Never',
    nudge: {
      body: 'Pick which deadlines and registration windows should become reminders before the first one fires.',
      dismiss: 'Later',
      open: 'Set up',
      title: 'Study reminders are ready.',
    },
    stats: {
      moodle: 'Moodle fetch',
      moodleValue: 'Moodle: {{value}}',
      sisu: 'Sisu sync',
      sisuValue: 'Sisu: {{value}}',
      unread: 'Unread',
      unreadCount: '{{count}} unread',
    },
    title: 'Notification dashboard',
    types: {
      'moodle-deadline': {
        body: 'Deadline reminders from the Moodle calendar export, 24 hours and 1 hour before due time.',
        title: 'Moodle deadlines',
      },
      'registration-close': {
        body: 'A 24-hour warning before a registration window closes when you are not enrolled.',
        title: 'Registration closes',
      },
      'registration-open': {
        body: 'Grouped reminders when one or more planned courses open for registration.',
        title: 'Registration opens',
      },
      'sisu-sync': {
        body: 'A quiet reminder to open Sisu when cached registration data is more than five days old.',
        title: 'Sisu sync nudge',
      },
    },
    unread: {
      empty: 'No unread in-app notifications.',
      markAll: 'Mark all read',
      title: 'Unread in-app',
    },
  },
  onboarding: {
    back: 'Back',
    complete: 'Confirm',
    finishSetup: 'Finish setup',
    firstRunSetup: 'First run setup',
    continue: 'Continue',
    progressLabel: 'Onboarding progress',
    skip: 'Skip',
    steps: ['Welcome', 'Control', 'Switch on', 'Alerts', 'Views', 'Moodle'],
    turnOn: 'Turn on SISU+',
    welcome: {
      title: 'Sisu stays untouched until you choose to switch.',
      body: 'After installation, SISU+ starts paused. This control center lets you turn the enhanced interface on, configure Moodle deadlines, and come back to native Sisu whenever you need it.',
      cardTitle: 'You are in control',
      cardBody: 'The enhanced dashboard only replaces student pages after you activate it.',
    },
    control: {
      title: 'Meet the control center',
      body: 'This floating button is the steady place for SISU+ state. Open it to pause the extension, resume it, or update Moodle sync without hunting through browser extension menus.',
      currentMode: 'Current mode',
      activeMode: 'SISU+ is active',
      nativeMode: 'Native Sisu is active',
    },
    switchOn: {
      title: 'Switch to the enhanced interface.',
      body: 'SISU+ will reload the student page once, then continue the tour inside the enhanced dashboard. You can pause it again from this same control center.',
      status: 'Status',
      active: 'SISU+ is already active.',
      paused: 'SISU+ is currently paused.',
    },
    notifications: {
      body: "SISU+ can alert you when registrations open, close, or when Moodle deadlines approach. Enable browser notifications to get alerts even when Sisu isn't open.",
      delivery: {
        desktop: 'Desktop',
        inApp: 'In-app',
      },
      enable: 'Enable browser notifications',
      enabledTitle: 'Notifications on',
      enabledBody: "You'll get alerts for deadlines and registrations even when Sisu isn't open.",
      enabledButton: 'Browser notifications on',
      manageHint: 'You can adjust delivery settings anytime from the control center.',
      looksGood: 'Looks good',
      title: 'Stay on top of deadlines',
      types: {
        'moodle-deadline': { title: 'Moodle deadlines' },
        'registration-close': { title: 'Registration closes' },
        'registration-open': { title: 'Registration opens' },
        'sisu-sync': { title: 'Sisu sync nudge' },
      },
    },
    views: {
      title: 'Four views, one study plan.',
      dashboardTitle: 'Dashboard',
      dashboardBody: 'A customizable overview for active courses, credits, deadlines, grade progress, and study pace.',
      timelineTitle: 'Timeline',
      timelineBody: 'A semester-by-semester planning board where you can move courses and catch prerequisite issues.',
      structureTitle: 'Structure',
      structureBody: 'Your degree modules, requirements, and credit progress laid out in one hierarchical view.',
      registrationTitle: 'Registration',
      registrationBody: 'Browse course implementations, check availability, and enrol in one place.',
    },
    moodle: {
      title: 'Connect Moodle deadlines',
      body: 'Open Moodle calendar export, choose all events and a custom date range, then paste the generated URL here.',
      openExport: 'Open Moodle calendar export',
      urlLabel: 'Moodle calendar URL',
      validHint: 'You can finish now, or leave this empty and add it later from the control center.',
      invalidHint: 'The URL should come from Moodle calendar export and include a calendar path.',
    },
  },
  pausedNotice: 'Paused mode keeps this control isolated while Sisu handles the page.',
  status: {
    active: 'Active',
    paused: 'Paused',
  },
  title: 'SISU+',
  tip: {
    dormantTitle: 'Ready when you are',
    dormantBody: 'SISU+ stays dormant while paused, letting you interact with Sisu as usual.',
    planningTitle: 'Planning made easy',
    planningBody: 'SISU+ keeps track of prerequisites and planned teaching periods.',
    structureTitle: 'Know your degree',
    structureBody: 'Required modules and credits at a glance — spot gaps early.',
    enrolmentsTitle: 'Enrol with confidence',
    enrolmentsBody: 'Browse implementations, pick the right one, and enrol.',
    dashboardTitle: 'Make it your own',
    dashboardBody: 'Dashboard widgets can be resized from their edges in edit mode.',
  },
  toggle: {
    open: 'Open SISU+ controls',
    close: 'Close SISU+ controls',
  },
};
