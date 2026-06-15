export type LandingRoadmapItem = {
  label: string;
  featured?: boolean;
};

export type LandingRoadmapColumn = {
  version: string;
  title: string;
  body?: string;
  status: string;
  tone: 'shipped' | 'current' | 'planned';
  items: LandingRoadmapItem[];
};

export type LandingPolicySection = {
  title: string;
  body: string[];
};

export type LandingTranslation = {
  nav: {
    features: string;
    privacy: string;
    roadmap: string;
    install: string;
    home: string;
    addToChrome: string;
    backToSisu: string;
  };
  hero: {
    badge: string;
    shipped: string;
    titleStart: string;
    titleAccent: string;
    body: string;
    addToChromeFree: string;
    sourceCode: string;
    seeChanged: string;
    activeUsers: string;
    mobileNote: string;
  };
  features: {
    kicker: string;
    title: string;
    body: string;
    cards: {
      title: string;
      body: string;
    }[];
  };
  privacy: {
    kicker: string;
    title: string;
    body: string;
    points: string[];
  };
  roadmap: {
    kicker: string;
    title: string;
    body: string;
    columns: LandingRoadmapColumn[];
  };
  support: {
    kicker: string;
    title: string;
    body: string;
    aria: string;
    action: string;
    hint: string;
  };
  universities: {
    kicker: string;
    title: string;
    installTitle: string;
    installBody: string;
    steps: string[];
    confirmed: string;
    confirmedNote: string;
  };
  footer: {
    copyright: string;
    affiliation: string;
    privacyPolicy: string;
    sourceCode: string;
    supportDevelopment: string;
    contact: string;
    myGithub: string;
  };
  policy: {
    kicker: string;
    title: string;
    effectiveDate: string;
    intro: string;
    sections: LandingPolicySection[];
  };
  preview: {
    dashboard: string;
    timeline: string;
    moodleDeadlines: string;
    activeCourses: string;
    thisSemester: string;
    live: string;
    spring: string;
    timelineBody: string;
    reset: string;
    confirm: string;
    due: string;
    periods: string[];
    summerRange: string;
    regularRange: string;
    creditsCurrent: string;
  };
  releasePreview: {
    aria: string;
    kicker: string;
    title: string;
    version: string;
    structure: {
      code: string;
      title: string;
      credits: string;
      done: string;
      ready: string;
    };
    checklist: string[];
    cards: {
      eyebrow: string;
      title: string;
      body: string;
      meta: string;
    }[];
  };
  heroShowcase: {
    aria: string;
    ghostTitle: string;
    ghostTabs: {
      plan: string;
      timing: string;
      registration: string;
    };
    ghostRows: {
      label: string;
      value: string;
      tone: 'muted' | 'warn' | 'danger';
    }[];
    productKicker: string;
    productTitle: string;
    productStatus: string;
    structure: {
      label: string;
      title: string;
      credits: string;
      meta: string;
    };
    panels: {
      label: string;
      title: string;
      body: string;
      stat: string;
    }[];
    command: {
      label: string;
      title: string;
      body: string;
    };
    signals: {
      users: string;
      local: string;
      sisu: string;
    };
  };
};

export const landingTranslation: LandingTranslation = {
  nav: {
    features: 'Features',
    privacy: 'Privacy',
    roadmap: 'Roadmap',
    install: 'Install',
    home: 'Home',
    addToChrome: 'Add to Chrome',
    backToSisu: 'Back to Sisu+',
  },
  hero: {
    badge: 'New',
    shipped: 'v{{version}} just shipped',
    titleStart: 'The Sisu we deserve,',
    titleAccent: 'finally.',
    body: 'A browser extension that fixes Sisu. Dashboard, study timeline, structure of studies, registrations. Everything that used to take too long, now in one place. For students, by student.',
    addToChromeFree: 'Add to Chrome - free',
    sourceCode: 'Source code',
    seeChanged: 'See what changed',
    activeUsers: '25+ active Chrome users',
    mobileNote: 'Sisu+ experience is not yet optimized for mobile devices.',
  },
  features: {
    kicker: "What's inside",
    title: 'Less digging, more knowing what to do next.',
    body: 'Sisu hides a lot. Course details across different pages, deadlines buried in Moodle, your study plan in tabs that do not connect. Sisu+ puts it all in one place.',
    cards: [
      {
        title: 'Dashboard that starts useful',
        body: 'Credits, grades, study right, active courses, and deadlines are pulled into one quiet overview.',
      },
      {
        title: 'Timeline you can edit',
        body: 'Move planned courses between periods, review the changes, then confirm the updated timing back to Sisu.',
      },
      {
        title: 'Warnings when they matter',
        body: 'Prerequisite and timing issues stay out of the way until you start changing the plan.',
      },
      {
        title: 'Structure of studies',
        body: 'Your full degree plan in one view. See which courses count where, check enrollment status, pick your completion method. Course versions are in there too.',
      },
      {
        title: 'Course details without the clicking',
        body: 'Grade, grading scale, completion method, attainment date. Everything that used to take three clicks is on one card.',
      },
      {
        title: 'Registrations in one place',
        body: 'Enrol, withdraw, or cancel from Sisu+. No more hunting for the right page in Sisu.',
      },
    ],
  },
  privacy: {
    kicker: 'Your browser, your data',
    title: 'Your data stays on your computer. Full stop.',
    body: 'Sisu+ works directly inside Sisu - no account, no server, no one storing your study plan somewhere else. Everything stays in your browser, exactly where you left it.',
    points: [
      'Works inside Sisu, right in your browser tab',
      'Reads your courses and schedule the same way you do',
      'Saves your settings on your device, not on our servers',
      'Your data never leaves your computer',
    ],
  },
  roadmap: {
    kicker: "What's coming",
    title: 'From useful upgrade to complete study workspace.',
    body: 'Sisu+ is moving in clear release steps: v1.2 cleaned up course management, v2.0 brings the larger study-planning experience together, and the next updates focus on calendar depth, mobile polish, and smarter planning guidance.',
    columns: [
      {
        version: 'v1.2',
        title: 'Course management',
        status: 'Shipped',
        tone: 'shipped',
        items: [
          { label: 'Structure of studies' },
          { label: 'Attainments and course details' },
          { label: 'Registrations' },
          { label: 'Course version management' },
          { label: 'Finnish language' },
        ],
      },
      {
        version: 'v2.0',
        title: 'Complete study workspace',
        body: 'Even better way to handle your studies.',
        status: 'Shipping now',
        tone: 'current',
        items: [
          { label: 'Support for EVERY university', featured: true },
          { label: 'Even better visual experience' },
          { label: 'Redesigned dashboard widgets' },
          { label: 'Degree structure overview' },
          { label: 'Smoother registration flow' },
          { label: 'Notifications for registrations and deadlines' },
        ],
      },
      {
        version: 'Future',
        title: 'Upcoming updates',
        body: 'On the board, shaped by what you request.',
        status: 'Planned',
        tone: 'planned',
        items: [
          { label: 'Community-driven updates', featured: true },
          { label: 'Calendar view' },
          { label: 'Mobile layout polish' },
          { label: 'Smarter timeline guidance' },
          { label: 'More university-specific polish' },
        ],
      },
    ],
  },
  support: {
    kicker: 'Support the project',
    title: 'Enjoy Sisu+ and want to support development?',
    body: 'Get me a strawberry-lime energy drink on Ko-fi and I will deliver new features even quicker! It helps cover the small costs and late-night polish passes that keep Sisu+ moving.',
    aria: 'Support Sisu+ development on Ko-fi',
    action: 'Feed me batteries',
    hint: 'Support development via Ko-fi',
  },
  universities: {
    kicker: 'Where it works',
    title: 'Your university, your Sisu+.',
    installTitle: 'Install Sisu+. Your campus is already in.',
    installBody: 'A 30-second setup - grant access, pick your university - and Sisu+ activates every time.',
    steps: ['Install', 'Grant access once', 'Open Sisu'],
    confirmed: 'Confirmed',
    confirmedNote: 'Any university running Sisu works automatically.',
  },
  footer: {
    copyright: 'Released under the MIT License.',
    affiliation: 'Not affiliated with any supported university or Funidata Oy.',
    privacyPolicy: 'Privacy policy',
    sourceCode: 'Source code',
    supportDevelopment: 'Support development',
    contact: 'Contact',
    myGithub: 'My GitHub',
  },
  policy: {
    kicker: 'Privacy policy',
    title: 'Privacy Policy for Sisu+',
    effectiveDate: 'Effective date: April 26, 2026',
    intro: 'Sisu+ is a browser extension that improves the Sisu student planning experience.',
    sections: [
      {
        title: 'Data handled by the extension',
        body: [
          "Sisu+ may access data from the user's active Sisu session, including study plans, courses, credits, enrolments, progress information, and related study planning data available to the logged-in user on supported Sisu domains such as https://sisu.lut.fi and https://sisu.lab.fi.",
          'Sisu+ may temporarily read Sisu authorization headers and required session cookies in order to request Sisu API data on behalf of the logged-in user.',
          'If the user enables Moodle deadline integration, Sisu+ stores the Moodle calendar URL provided by the user and uses it to fetch calendar and deadline data.',
          'Sisu+ stores extension preferences, settings, enabled or disabled state, and Moodle configuration in Chrome storage.',
        ],
      },
      {
        title: 'How data is used',
        body: [
          'The data is used only to provide Sisu+ features inside the browser, including dashboard views, study progress, timeline planning, course information, and optional Moodle deadline display.',
        ],
      },
      {
        title: 'Data sharing',
        body: [
          'Sisu+ does not sell user data.',
          'Sisu+ does not use user data for advertising.',
          "Sisu+ does not send user data to the developer's own servers.",
          "Sisu+ communicates with Sisu and Moodle only as needed to provide the extension's user-facing features.",
        ],
      },
      {
        title: 'Data storage',
        body: [
          "Sisu+ stores settings and temporary session information using Chrome's extension storage APIs. Authentication and session data is used only to access Sisu data for the current browser session.",
        ],
      },
      {
        title: 'Remote code',
        body: ['Sisu+ does not execute remote JavaScript or remote code.'],
      },
      {
        title: 'Contact',
        body: ['For questions about this privacy policy, contact contact@matt-pasek.dev.'],
      },
    ],
  },
  preview: {
    dashboard: 'Dashboard',
    timeline: 'Timeline',
    moodleDeadlines: 'Moodle Deadlines',
    activeCourses: 'Active Courses',
    thisSemester: 'This Semester',
    live: 'LIVE',
    spring: 'Spring 2026',
    timelineBody: 'Drag courses, check credits, then confirm back to Sisu.',
    reset: 'Reset',
    confirm: 'Confirm',
    due: 'Due {{date}}',
    periods: ['Period 3', 'Period 4', 'Summer', 'Period 1'],
    summerRange: 'Jun - Aug',
    regularRange: 'Mar - May',
    creditsCurrent: '12 / 100 cr',
  },
  releasePreview: {
    aria: 'Sisu+ release highlights preview',
    kicker: 'Release view',
    title: 'The plan finally behaves like one plan.',
    version: 'v1.2',
    structure: {
      code: 'BSc Computer Science',
      title: 'Structure of studies',
      credits: '124 / 180 cr',
      done: 'done',
      ready: 'ready',
    },
    checklist: [
      'Core studies counted in the right module',
      'Completion method selected before enrolment',
      'Course version update ready for 2027-2028',
    ],
    cards: [
      {
        eyebrow: 'Update Courses',
        title: 'New versions without hunting through Sisu',
        body: 'See outdated planned courses, compare the target version, and update the plan in one focused flow.',
        meta: '3 updates',
      },
      {
        eyebrow: 'Completion Method',
        title: 'Pick the right route before you register',
        body: 'Degree-study methods stay visible on the course card, so exam and lecture options stop disappearing.',
        meta: 'method 2',
      },
      {
        eyebrow: 'Registrations',
        title: 'Enroll, withdraw, or cancel from the same place',
        body: 'Course implementations sit next to the plan context instead of another Sisu page you have to find.',
        meta: 'open now',
      },
    ],
  },
  heroShowcase: {
    aria: 'Visual showcase of Sisu+ organizing scattered Sisu study planning features',
    ghostTitle: 'sisu.university.fi/student',
    ghostTabs: {
      plan: 'Plan',
      timing: 'Timing',
      registration: 'Registration',
    },
    ghostRows: [
      { label: 'Course version', value: 'hidden', tone: 'muted' },
      { label: 'Moodle deadline', value: 'elsewhere', tone: 'warn' },
      { label: 'Completion method', value: '3 clicks', tone: 'danger' },
      { label: 'Course details', value: 'new tab', tone: 'muted' },
    ],
    productKicker: 'Sisu+ layer',
    productTitle: 'One study command center.',
    productStatus: 'Live in Sisu',
    structure: {
      label: 'Structure of studies',
      title: 'Computer Science BSc',
      credits: '124 / 180 cr',
      meta: 'degree progress',
    },
    panels: [
      {
        label: 'Timeline',
        title: 'Drag courses between periods',
        body: 'Move the plan, check warnings, confirm back to Sisu.',
        stat: '12 cr',
      },
      {
        label: 'Course Versions',
        title: 'Outdated courses, caught early',
        body: 'Spot old planned versions before registration or timing gets messy.',
        stat: 'review',
      },
      {
        label: 'Register',
        title: 'Enrollment where context lives',
        body: 'Pick an implementation without leaving your plan.',
        stat: 'open',
      },
    ],
    command: {
      label: 'What changed',
      title: 'Sisu stops feeling scattered.',
      body: 'Deadlines, progress, course details, versions, and registration actions come forward when you need them.',
    },
    signals: {
      users: '25+ active users',
      local: 'No account or server',
      sisu: 'Runs inside Sisu',
    },
  },
};
