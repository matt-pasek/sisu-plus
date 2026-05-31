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
      syncNotice: string;
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
    views: {
      title: string;
      dashboardTitle: string;
      dashboardBody: string;
      timelineTitle: string;
      timelineBody: string;
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
  onboarding: {
    back: 'Back',
    complete: 'Confirm',
    finishSetup: 'Finish setup',
    firstRunSetup: 'First run setup',
    continue: 'Continue',
    progressLabel: 'Onboarding progress',
    skip: 'Skip',
    steps: ['Welcome', 'Control', 'Switch on', 'Views', 'Moodle'],
    turnOn: 'Turn on SISU+',
    welcome: {
      title: 'Sisu stays untouched until you choose to switch.',
      body: 'After installation, SISU+ starts paused. This control center lets you turn the enhanced interface on, configure Moodle deadlines, and come back to native Sisu whenever you need it.',
      cardTitle: 'You are in control',
      cardBody: 'The enhanced dashboard only replaces student pages after you activate it.',
      syncNotice: 'First-run state and setup progress are saved in Chrome sync.',
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
    views: {
      title: 'Two views, one study plan.',
      dashboardTitle: 'Dashboard',
      dashboardBody: 'A customizable overview for active courses, credits, deadlines, grade progress, and study pace.',
      timelineTitle: 'Timeline',
      timelineBody: 'A semester-by-semester planning board where you can move courses and catch prerequisite issues.',
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
    dashboardTitle: 'Make it your own',
    dashboardBody: 'Dashboard widgets can be resized from their edges in edit mode.',
  },
  toggle: {
    open: 'Open SISU+ controls',
    close: 'Close SISU+ controls',
  },
};
