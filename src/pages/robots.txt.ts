import type { APIRoute } from 'astro';

// Generated so the sitemap URL always matches the deployed site and base path.
export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL('sitemap-index.xml', site!.href.replace(/\/?$/, '/'));
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap.href}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
