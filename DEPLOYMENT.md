# Self-hosting DVow2026

This is a **TanStack Start v1** app (React 19 + TypeScript + Vite 7 + Tailwind v4)
with a Supabase backend (database, auth, guest access codes, event settings).

It is a **server-rendered app**, not a static site. It needs a host that can run a
JS server/edge runtime (Cloudflare Workers, Netlify, Vercel, Node server, Docker).

---

## 1. Get the code

Connect the project to GitHub from the Lovable editor (top-right GitHub button), then:

```sh
git clone <your-repo-url>
cd <repo>
npm install       # or bun install
```

## 2. Backend (database + auth)

You can either keep using the existing managed backend, or run your own Supabase
project. For your own project:

1. Create a Supabase project.
2. Apply the SQL in `supabase/migrations/` **in filename order** (SQL editor or
   `supabase db push` with the Supabase CLI).
3. In Auth settings: disable anonymous sign-ups, keep email confirmation on, and
   add Google OAuth credentials if you want Google sign-in.
4. The first host account that signs up at `/auth` claims the admin role via the
   `claim_admin()` function.

## 3. Environment variables

Copy `.env.example` to `.env` and fill in your project's URL and publishable key.
Set the same variables in your hosting provider's dashboard.

`VITE_*` variables are baked into the browser bundle at build time, so they must be
set **before** `npm run build`. Never put the service-role key in a `VITE_*` variable.

## 4. Build and run locally

```sh
npm run build     # production build
npm run preview   # serve the production build locally
```

## 5. Deploy

The build targets Cloudflare Workers by default (via nitro). Pick one:

- **Cloudflare Workers/Pages** — default target, no config change needed.
  Build command `npm run build`, then deploy with `npx wrangler deploy`.
- **Netlify** — build `npm run build`, set the nitro preset to `netlify`
  (`NITRO_PRESET=netlify npm run build`).
- **Vercel** — `NITRO_PRESET=vercel npm run build`.
- **Node / Docker / VPS** — `NITRO_PRESET=node_server npm run build`, then run the
  generated server entry with Node behind Nginx or a process manager.

## 6. Domain and SSL

Point your domain's DNS at your host and let it issue the TLS certificate.
If you'd rather not manage any of this, publish from Lovable and attach the same
domain in Project Settings → Domains — SSL is automatic there.

## Notes

- `src/routeTree.gen.ts` is generated — never edit it by hand.
- Do not commit `.env`; commit `.env.example` only.
- Guest access codes are normalized (uppercased, non-alphanumerics stripped) in the
  database functions, so `LILAC-4821` and `lilac4821` both work.
