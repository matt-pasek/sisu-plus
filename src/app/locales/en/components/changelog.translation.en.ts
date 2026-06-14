export type ChangelogTranslation = {
  ui: {
    whatsNew: string;
    close: string;
    prevPage: string;
    nextPage: string;
    pause: string;
    resume: string;
    exploreNew: string;
    maybeLater: string;
    linkCopied: string;
    tellFriends: string;
    done: string;
    replay: string;
    allOtherUniversities: string;
    shareText: string;
  };
  pages: {
    intro: {
      eyebrow: string;
      titlePrefix: string;
      title: string;
      body: string;
      tag0: string;
      tag1: string;
      badge: string;
    };
    universities: {
      eyebrow: string;
      title: string;
      body: string;
      tag0: string;
      tag1: string;
      tag2: string;
    };
    dashboard: {
      eyebrow: string;
      title: string;
      body: string;
      tag0: string;
      tag1: string;
      tag2: string;
    };
    structure: {
      eyebrow: string;
      title: string;
      body: string;
      tag0: string;
      tag1: string;
      tag2: string;
    };
    registration: {
      eyebrow: string;
      title: string;
      body: string;
      tag0: string;
      tag1: string;
      tag2: string;
    };
    notifications: {
      eyebrow: string;
      title: string;
      body: string;
      tag0: string;
      tag1: string;
    };
    outro: {
      eyebrow: string;
      titlePrefix: string;
      title: string;
      titleSuffix: string;
      primaryCta: string;
    };
  };
};

export const changelogTranslation: ChangelogTranslation = {
  ui: {
    whatsNew: "What's new",
    close: 'Close changelog',
    prevPage: 'Previous page',
    nextPage: 'Next page',
    pause: 'Pause changelog',
    resume: 'Resume changelog',
    exploreNew: "Explore what's new",
    maybeLater: 'Maybe later',
    linkCopied: 'Link copied!',
    tellFriends: 'Tell your friends',
    done: 'Done',
    replay: 'Replay',
    allOtherUniversities: '+ all other universities',
    shareText:
      "Did you hear about Sisu+? It makes Sisu better and improves the experience! And now it works at every Finnish university running Sisu. Better study planning, and it's free.",
  },
  pages: {
    intro: {
      eyebrow: "What's new",
      titlePrefix: 'The biggest update',
      title: 'Sisu+ 2.0.',
      body: 'Four new ways to see your whole degree — your timeline, your structure, your courses, your week. All in one place.',
      tag0: 'Major release',
      tag1: 'June 2026',
      badge: 'MAJOR RELEASE · JUNE 2026',
    },
    universities: {
      eyebrow: 'For everyone',
      title: 'Built for every university',
      body: 'Sisu+ now runs at Aalto, Tampere, Helsinki, Jyväskylä, and every other Finnish university on Sisu. One extension, every campus.',
      tag0: 'All universities',
      tag1: 'Free',
      tag2: 'One install',
    },
    dashboard: {
      eyebrow: 'Dashboard',
      title: 'Redesigned from scratch',
      body: 'New widgets show your credit progress, active enrolments, upcoming deadlines, and study period summary — all on one screen, no digging required.',
      tag0: 'New widgets',
      tag1: 'Credit tracker',
      tag2: 'Period view',
    },
    structure: {
      eyebrow: 'Structure',
      title: 'Your degree, laid bare',
      body: "Every module, every requirement, every credit — mapped as a navigable tree. See exactly what's done, what's missing, and what's still possible.",
      tag0: 'Degree map',
      tag1: 'Requirements',
      tag2: 'Progress',
    },
    registration: {
      eyebrow: 'Registration',
      title: 'Register, sorted',
      body: 'Sisu+ walks you through open implementations, checks timing conflicts, and lets you enrol without bouncing between tabs. The same registration flow, finally smooth.',
      tag0: 'Course enrolment',
      tag1: 'Conflict check',
      tag2: 'Faster flow',
    },
    notifications: {
      eyebrow: 'Coming soon',
      title: 'Never miss a window',
      body: "Notifications will alert you when registration opens, deadlines approach, or your plan drifts. Always on top of what's coming — without checking manually.",
      tag0: 'Alerts',
      tag1: 'Deadlines',
    },
    outro: {
      eyebrow: "That's Sisu+ 2.0",
      titlePrefix: 'Ready when',
      title: 'you ',
      titleSuffix: 'are.',
      primaryCta: "Explore what's new",
    },
  },
};
