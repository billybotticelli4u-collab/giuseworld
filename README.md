# GIUSE WORLD

The artist's digital home — an Astro site with a free visual CMS, built so it can run for years with near-zero cost and no developer needed for day-to-day content.

## What it costs to run

| Piece | Tool | Cost |
|---|---|---|
| Site framework | Astro (static) | Free |
| CMS / admin panel | Keystatic | Free (open source) |
| Hosting + CDN + SSL + DDoS | Cloudflare Pages | Free |
| Fonts | Playfair + Inter, self-hosted | Free, no Google requests |
| Analytics | Cloudflare Web Analytics | Free, cookieless |
| Newsletter | Buttondown free tier (≤100 subs) | Free to start |
| Payments | PayPal / Ko-fi hosted links | Free (only transaction %) |
| **Domain** | giuseworld.com | **~€10–15/yr — the only fixed cost** |

No WordPress, no ACF Pro licence, no SiteGround, no Plausible subscription, no paid Vimeo required.

## Run it locally

```bash
npm install
npm run dev      # site at http://localhost:4321  •  CMS at http://localhost:4321/keystatic
```

In the CMS (`/keystatic`) the artist can create Tracce, Sessioni, Storie, Riflessioni and Elementi,
edit site settings (Gate track, Mecenate counter, founders, PayPal links, manifesto), and link
content together with autocomplete. Saving writes plain Markdown files — there is no database.

## Deploy free (Cloudflare Pages)

1. Push this folder to a GitHub repo.
2. Cloudflare Pages → Create project → connect the repo.
3. Build command `npm run build`, output directory `dist`.
4. Point the domain's DNS at Cloudflare. SSL, CDN and DDoS protection are automatic and free.

**To let the artist edit live from any browser** (no laptop), change `storage` in
`keystatic.config.tsx` from `{ kind: 'local' }` to `{ kind: 'github', repo: 'user/giuseworld' }`
and install the Keystatic GitHub app. Edits then commit straight from `/keystatic` and the site
rebuilds itself.

## Before go-live (the only manual setup)

- **Audio:** drop the real MP3s into `public/audio/` and set the path on each Traccia. Self-hosted,
  so the visitor never leaves the site.
- **PayPal:** paste the three subscription links into site settings. Use PayPal **hosted
  subscription links** (redirect to PayPal, pay, return) — *not* the on-page PayPal JS SDK buttons,
  which load third-party scripts/cookies and would break the cookie-free / no-banner setup.
- **Newsletter:** paste your Buttondown form action into site settings. The signup form already has
  a honeypot, so no captcha / third-party cookie is needed.
- **Analytics:** paste your Cloudflare Web Analytics token into `src/layouts/Base.astro`. The audio
  player already emits `play`, `pause`, `listen_25/50/75/100` and `ended` events.

## How the brief's rules are implemented

- **Empty blocks vanish** — every optional block renders only if it has content.
- **Relations live only on the Traccia** (sez. 5). The reverse link appears automatically on
  Sessioni / Storie / Riflessioni / Elementi via an inverse query — no double data entry.
- **Timeline** is generated automatically from every dated content type, newest first, with the
  brief's tie-break order (Traccia > Sessione > Storia > Riflessione).
- **Internal nav** (← precedente / successiva →) runs in chronological order; the archive and
  Timeline run newest-first. Missing ends hide their link.
- **Cookie-free by design** — self-hosted fonts, no Google Fonts, cookieless analytics, no on-page
  payment SDK. A cookie banner is therefore not required.
- **Palette & type** match sezione 7 exactly (no pure black/white). The Gate has the dark vignette
  and the seed-to-tree animation (CSS, respects reduced-motion).
- **Elementi** template has a commented slot ready for the future "Acquista" button (e-commerce phase 2).

## What's seeded

Minimum launch content per sez. 8.12: 1 Traccia (manifesto, linked to everything), 1 Sessione,
1 Storia, 3 Riflessioni, 2 Elementi. Replace with the real material.

## Enable live editing (CMS) — optional, when you want in-browser editing

The public site ships as pure static (deploys anywhere free). To turn on the
Keystatic admin at `/keystatic`, add an adapter + integrations:

```bash
npm i @astrojs/vercel       # or @astrojs/cloudflare for Cloudflare Pages
```
Then in `astro.config.mjs`:
```js
import vercel from '@astrojs/vercel';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
export default defineConfig({
  site: 'https://www.giuseworld.com',
  output: 'static',
  adapter: vercel(),
  integrations: [react(), keystatic()],
});
```
`keystatic.config.tsx` is already written. For live editing from any browser,
set its storage to `{ kind: 'github', repo: 'user/giuseworld' }`.

## Get it online (≈2 minutes)

**Vercel (you already use it):** from this folder run
```bash
npm install
npx vercel            # log in once, accept the detected Astro settings
```
You get a live `*.vercel.app` URL immediately. `npx vercel --prod` promotes it.

**Cloudflare Pages (drag & drop):** run `npm run build`, then in the Cloudflare
dashboard → Workers & Pages → Create → Pages → Upload assets → drop the `dist`
folder. Free `*.pages.dev` URL in under a minute.

Point `giuseworld.com` at whichever you pick; SSL/CDN/DDoS are automatic on both.
