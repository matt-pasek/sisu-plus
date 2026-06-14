import { copyFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { renderToString } from 'react-dom/server';
import i18n from '@/app/i18n';
import {
  buildCanonicalUrl,
  buildHreflangLinks,
  buildLandingJsonLd,
  buildOpenGraphImageUrl,
  LANDING_OG_IMAGE_ALT,
  buildRobotsTxt,
  buildSitemapXml,
  LandingRoute,
  landingRoutes,
  localizedPageMetadata,
} from '@/landing/landingSeo';
import { LandingApp } from '../src/landing/LandingApp';

const outDir = 'dist-landing';
const rootElement = '<div id="landing-root"></div>';
const chromeStoreUrl = import.meta.env?.VITE_CHROME_WEB_STORE_URL?.trim() || undefined;
const ogImageSourcePath = 'src/landing/assets/og-image.png';

async function prerenderLanding() {
  const template = await Bun.file(join(outDir, 'index.html')).text();

  for (const route of landingRoutes) {
    await i18n.changeLanguage(route.locale);

    const appHtml = renderToString(<LandingApp route={route} />);
    const html = injectLandingHtml(template, route, appHtml);
    const outputPath = getOutputPath(route);

    await mkdir(dirname(outputPath), { recursive: true });
    await Bun.write(outputPath, html);
  }

  await Bun.write(join(outDir, 'robots.txt'), buildRobotsTxt());
  await Bun.write(join(outDir, 'sitemap.xml'), buildSitemapXml());
  await copyFile(ogImageSourcePath, join(outDir, 'og-image.png'));
}

function injectLandingHtml(template: string, route: LandingRoute, appHtml: string): string {
  const metadata = localizedPageMetadata[route.locale][route.kind];
  const alternates = buildHreflangLinks(route.kind)
    .map(
      (alternate) => `<link rel="alternate" hreflang="${alternate.hreflang}" href="${escapeHtml(alternate.href)}" />`,
    )
    .join('\n    ');
  const jsonLd = JSON.stringify(buildLandingJsonLd(route.locale, chromeStoreUrl));
  const openGraphImageUrl = buildOpenGraphImageUrl();

  return template
    .replace(/<html lang="[^"]*">/, `<html lang="${route.locale}">`)
    .replace(/<title>.*?<\/title>/s, `<title>${escapeHtml(metadata.title)}</title>`)
    .replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/>/s,
      `<meta name="description" content="${escapeHtml(metadata.description)}" />`,
    )
    .replace(
      '</head>',
      `    <link rel="canonical" href="${escapeHtml(buildCanonicalUrl(route))}" />
    ${alternates}
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Sisu+" />
    <meta property="og:title" content="${escapeHtml(metadata.title)}" />
    <meta property="og:description" content="${escapeHtml(metadata.description)}" />
    <meta property="og:url" content="${escapeHtml(buildCanonicalUrl(route))}" />
    <meta property="og:image" content="${escapeHtml(openGraphImageUrl)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${escapeHtml(LANDING_OG_IMAGE_ALT)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(metadata.title)}" />
    <meta name="twitter:description" content="${escapeHtml(metadata.description)}" />
    <meta name="twitter:image" content="${escapeHtml(openGraphImageUrl)}" />
    <meta name="twitter:image:alt" content="${escapeHtml(LANDING_OG_IMAGE_ALT)}" />
    <script type="application/ld+json">${escapeScriptJson(jsonLd)}</script>
  </head>`,
    )
    .replace(rootElement, `<div id="landing-root">${appHtml}</div>`);
}

function getOutputPath(route: LandingRoute): string {
  if (route.path === '/') {
    return join(outDir, 'index.html');
  }

  return join(outDir, route.path, 'index.html');
}

function escapeHtml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

function escapeScriptJson(value: string): string {
  return value.replaceAll('<', '\\u003c');
}

await prerenderLanding();
