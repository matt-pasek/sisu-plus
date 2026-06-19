import { DEFAULT_LOCALE, Locale } from '@/app/locales/locale';

export type LandingRouteKind = 'home' | 'privacy';

export type LandingRoute = {
  kind: LandingRouteKind;
  locale: Locale;
  path: string;
};

export type LandingAlternateLink = {
  hreflang: Locale | 'x-default';
  href: string;
};

export type LandingPageMetadata = {
  title: string;
  description: string;
  canonicalUrl: string;
};

export const LANDING_ORIGIN = 'https://sisu-plus.matt-pasek.dev';
export const CHROME_WEB_STORE_URL = 'https://chromewebstore.google.com/detail/sisu+/oaimdmdjlgfgfigmblpolficgleijcoe';
export const FIREFOX_WEB_STORE_URL = 'https://addons.mozilla.org/en-GB/firefox/addon/sisu/';
export const LANDING_OG_IMAGE_PATH = '/og-image.png';
export const LANDING_OG_IMAGE_ALT =
  'Sisu+ landing page preview showing a dark dashboard interface and the headline The Sisu we deserve, finally.';

export const landingRoutes: LandingRoute[] = [
  { kind: 'home', locale: 'en', path: '/en/' },
  { kind: 'home', locale: 'fi', path: '/fi/' },
  { kind: 'privacy', locale: 'en', path: '/en/privacy' },
  { kind: 'privacy', locale: 'fi', path: '/fi/privacy' },
];

export const localizedPageMetadata: Record<Locale, Record<LandingRouteKind, LandingPageMetadata>> = {
  en: {
    home: {
      title: 'Sisu+ - Better Sisu dashboard, study timeline and course registration',
      description:
        'Sisu+ is a free browser extension for Finnish university students using Sisu. Track credits, Moodle deadlines, study timelines, course details and registrations in one place.',
      canonicalUrl: `${LANDING_ORIGIN}/en/`,
    },
    privacy: {
      title: 'Sisu+ Privacy Policy',
      description:
        'Read how Sisu+ handles study planning data locally in your browser without sending your Sisu data to developer servers.',
      canonicalUrl: `${LANDING_ORIGIN}/en/privacy`,
    },
  },
  fi: {
    home: {
      title: 'Sisu+ - Parempi Sisu-etusivu, opintoaikajana ja ilmoittautumiset',
      description:
        'Sisu+ on ilmainen selainlaajennus suomalaisille korkeakouluopiskelijoille. Se kokoaa opintopisteet, Moodle-määräajat, opintoaikajanan, kurssitiedot ja ilmoittautumiset yhteen näkymään.',
      canonicalUrl: `${LANDING_ORIGIN}/fi/`,
    },
    privacy: {
      title: 'Sisu+:n tietosuojakäytäntö',
      description:
        'Lue, miten Sisu+ käsittelee opintosuunnittelun tietoja paikallisesti selaimessasi lähettämättä Sisu-tietojasi kehittäjän palvelimille.',
      canonicalUrl: `${LANDING_ORIGIN}/fi/privacy`,
    },
  },
};

export function getRoutePath(locale: Locale, kind: LandingRouteKind): string {
  if (kind === 'privacy') {
    return `/${locale}/privacy`;
  }

  return `/${locale}/`;
}

export function getLandingRoute(pathname: string): LandingRoute {
  const normalizedPath = normalizePath(pathname);

  if (normalizedPath === '/privacy') {
    return { kind: 'privacy', locale: DEFAULT_LOCALE, path: '/en/privacy' };
  }

  const route = landingRoutes.find((landingRoute) => normalizePath(landingRoute.path) === normalizedPath);

  if (route) {
    return route;
  }

  return { kind: 'home', locale: DEFAULT_LOCALE, path: '/' };
}

export function buildCanonicalUrl(route: LandingRoute): string {
  return localizedPageMetadata[route.locale][route.kind].canonicalUrl;
}

export function buildHreflangLinks(kind: LandingRouteKind): LandingAlternateLink[] {
  return [
    { hreflang: 'en', href: `${LANDING_ORIGIN}${getRoutePath('en', kind)}` },
    { hreflang: 'fi', href: `${LANDING_ORIGIN}${getRoutePath('fi', kind)}` },
    { hreflang: 'x-default', href: `${LANDING_ORIGIN}/en/` },
  ];
}

export function buildLandingJsonLd(
  locale: Locale,
  chromeStoreUrl = CHROME_WEB_STORE_URL,
  firefoxStoreUrl = FIREFOX_WEB_STORE_URL,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Sisu+',
    applicationCategory: 'BrowserApplication',
    operatingSystem: 'Chrome, Firefox',
    browserRequirements: 'Requires Firefox, Google Chrome or a Chromium-based browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
    },
    creator: {
      '@type': 'Person',
      name: 'Mateusz Pasek',
      url: 'https://matt-pasek.dev',
    },
    sameAs: ['https://github.com/matt-pasek/sisu-plus', chromeStoreUrl, firefoxStoreUrl],
    inLanguage: locale,
  };
}

export function buildOpenGraphImageUrl(): string {
  return `${LANDING_ORIGIN}${LANDING_OG_IMAGE_PATH}`;
}

export function buildRobotsTxt(): string {
  return `User-agent: *\nAllow: /\n\nSitemap: ${LANDING_ORIGIN}/sitemap.xml\n`;
}

export function buildSitemapXml(): string {
  const urls = landingRoutes
    .map((route) => {
      const alternates = buildHreflangLinks(route.kind)
        .map(
          (alternate) =>
            `    <xhtml:link rel="alternate" hreflang="${alternate.hreflang}" href="${escapeXml(alternate.href)}" />`,
        )
        .join('\n');

      return `  <url>
    <loc>${escapeXml(`${LANDING_ORIGIN}${route.path}`)}</loc>
${alternates}
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
    ${urls}
    </urlset>
  `;
}

function normalizePath(pathname: string): string {
  const withoutQuery = pathname.split(/[?#]/)[0] || '/';
  if (withoutQuery === '/') {
    return '/';
  }

  return withoutQuery.replace(/\/$/, '');
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}
