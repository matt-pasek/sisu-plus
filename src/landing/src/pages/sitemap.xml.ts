import { buildSitemapXml } from '@/landing/landingSeo';

export const GET = () =>
  new Response(buildSitemapXml(), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
