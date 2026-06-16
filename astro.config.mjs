import { defineConfig } from 'astro/config';

// Public site: pure static output — host-agnostic, deploys free to Vercel,
// Cloudflare Pages, or Netlify with zero config and no adapter.
//
// To enable the Keystatic CMS admin (/keystatic) for live in-browser editing,
// see "Enable live editing" in README.md (adds react + keystatic + an adapter).
export default defineConfig({
  site: 'https://www.giuseworld.com',
  trailingSlash: 'ignore',
});
