export type LandingRoadmapColumn = {
  version: string;
  title: string;
  status: string;
  items: string[];
  current?: boolean;
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
    live: string;
    requestTitle: string;
    requestBody: string;
    steps: string[];
    emailStrong: string;
    emailRest: string;
    action: string;
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
    body: 'A browser extension that reimagines your Sisu experience. Cleaner dashboard, study timeline, Moodle integration, and more. For students, by student.',
    addToChromeFree: 'Add to Chrome - free',
    sourceCode: 'Source code',
    seeChanged: 'See what changed',
    mobileNote: 'Sisu+ experience is not yet optimized for mobile devices.',
  },
  features: {
    kicker: 'Dashboard and timeline',
    title: 'Less digging, more knowing what to do next.',
    body: 'The first release tackles the stuff that costs you the most time: checking where you stand, keeping up with Moodle deadlines, and moving courses around without accidentally breaking your prerequisites.',
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
    title: 'Fixing the things that actually slow you down.',
    body: "The plan is pretty straightforward: fewer clicks to find what you need, clearer course info, and a timeline that doesn't make you guess. Supported universities first, then more campuses as requests come in.",
    columns: [
      {
        version: 'v1.0.0',
        title: 'Initial release',
        status: 'Shipping now',
        items: ['Personal dashboard', 'Moodle deadline view', 'Editable study timeline', 'Prerequisite warnings'],
        current: true,
      },
      {
        version: 'Next',
        title: 'More planning help',
        status: 'In progress',
        items: [
          'Cleaner course details',
          'Calendar-first study planning',
          'Better empty states',
          'More timeline guidance',
        ],
      },
      {
        version: 'Later',
        title: 'Campus expansion',
        status: 'Planned',
        items: ['More Sisu universities', 'Feedback-led improvements', 'Mobile layout polish', 'Faster setup'],
      },
    ],
  },
  support: {
    kicker: 'Support the project',
    title: 'Enjoy Sisu+ and want to support development?',
    body: 'Get me a strawberry-lime energy drink on Ko-fi and I will deliver new features even quicker! It helps cover the small costs and late-night polish passes that keep Sisu+ moving.',
    aria: 'Support Sisu+ development on Ko-fi',
    action: 'Feed me with batteries',
    hint: '(Ko-fi opens in a new tab)',
  },
  universities: {
    kicker: 'Where it works',
    title: 'Your university, your Sisu+.',
    live: 'Live universities',
    requestTitle: 'Want it at your university?',
    requestBody:
      'Sisu+ is built to support Finnish universities running Sisu. If your university is not listed, send me the Sisu URL and I can check support.',
    steps: [
      'with your university name and Sisu URL',
      'We collaborate to make sure everything works',
      'Your campus gets the same cleaner dashboard and timeline',
    ],
    emailStrong: 'Email me',
    emailRest: 'with your university name and Sisu URL',
    action: 'Email me to add your university',
  },
  footer: {
    copyright: 'All rights reserved.',
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
};
