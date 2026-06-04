export type OnboardingTranslation = {
  title: {
    kicker: string;
  };
  welcome: {
    headlineLine1: string;
    headlineLine2: string;
    body: string;
    cta: string;
  };
  university: {
    headline: string;
    body: string;
    quickPickLabel: string;
    inputPlaceholder: string;
    inputAriaLabel: string;
    groupAriaLabel: string;
    cta: string;
  };
  permission: {
    headline: string;
    headlineRe: string;
    body: string;
    bodyRe: string;
    denied: string;
    ctaTryAgain: string;
    ctaGranted: string;
    ctaAllow: string;
    back: string;
  };
  success: {
    headlineWord1: string;
    headlineWord2: string;
    body: string;
    openSisu: string;
    close: string;
  };
};

export const onboardingTranslation: OnboardingTranslation = {
  title: {
    kicker: 'STUDY SYSTEMS, QUIETLY UPGRADED',
  },
  welcome: {
    headlineLine1: 'A better Sisu,',
    headlineLine2: 'built for you.',
    body: "Sisu+ sits on top of your university's Sisu portal and turns it into something <bold>you actually want to use.</bold> Let's get you set up, it takes about 30 seconds.",
    cta: 'Get started',
  },
  university: {
    headline: 'Where do you study?',
    body: "Enter your Sisu portal URL and we'll configure everything automatically.",
    quickPickLabel: 'Quick pick:',
    inputPlaceholder: 'sisu.youruni.fi',
    inputAriaLabel: 'Your Sisu URL',
    groupAriaLabel: 'Sisu URL input',
    cta: 'Continue',
  },
  permission: {
    headline: 'Allow access',
    headlineRe: 'Re-grant access',
    body: "Sisu+ needs permission to access your university's Sisu and Moodle portals.",
    bodyRe: 'Your Sisu+ config synced from another device. Grant access to {{domain}} to continue.',
    denied: 'Permission was denied. Sisu+ needs access to both domains to work. Try again below.',
    ctaTryAgain: 'Try again',
    ctaGranted: 'Access granted',
    ctaAllow: 'Allow access',
    back: 'Back',
  },
  success: {
    headlineWord1: "You're",
    headlineWord2: 'in.',
    body: 'Head to your Sisu portal. Sisu+ will activate automatically once you log in.',
    openSisu: 'Open Sisu',
    close: 'Close',
  },
};
