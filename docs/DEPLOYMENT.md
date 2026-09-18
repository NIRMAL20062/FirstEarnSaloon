# Deployment

Hosting is Vercel (see `CLAUDE.md`). Two ways to do it:

## Option A — let Claude deploy it directly (fastest)

Vercel CLI can deploy straight from this folder without needing GitHub at
all. Generate a token at **https://vercel.com/account/tokens** → "Create
Token" → paste it into chat (or into a file — your call), and Claude will:

1. Push every value from `.env.local` to the Vercel project as environment
   variables.
2. Run `vercel --prod` to build and deploy.
3. Hand back the live URL.

Two things worth doing right after, back in `.env.local` *and* in the
Vercel project's environment variables:

- Set `NEXT_PUBLIC_SITE_URL` to the real deployed URL (it starts as
  `http://localhost:3000` — the QR code on the settings page is built from
  this, so it needs to point at the live domain, not localhost).
- Deploy again after changing it (`vercel --prod`), since env var changes
  don't apply to already-built deployments.

## Option B — do it yourself via GitHub + the Vercel dashboard

1. Push this repo to a new GitHub repo (`git remote add origin <url>` then
   `git push -u origin master`).
2. **vercel.com/new** → Import the repo → it auto-detects Next.js.
3. Before the first deploy, add every variable from `.env.local` under
   Environment Variables (set `NEXT_PUBLIC_SITE_URL` to what Vercel is
   about to give you as the production domain).
4. Deploy. Every future `git push` to the default branch auto-deploys.

## Either way, also do this once

- **Firebase Console → Authentication → Settings → Authorized domains** —
  add your Vercel domain (e.g. `your-app.vercel.app`), or Google/email
  sign-in will be rejected on the live site (it only works from
  `localhost` and domains you've explicitly authorized).

## Troubleshooting

**`/api/**` requests return a 500 with a completely empty body** (not
JSON, not any of this app's own error messages) — this happened during
initial setup and turned out to be `firebase-admin` crashing Vercel's
serverless function bundler on import. It's no longer a dependency of
this project at all (see CLAUDE.md § "Why not firebase-admin"); if
something similar happens again with a *different* package, the same
"strip the dependency down to something dependency-free" approach is more
reliable than trying to configure around the bundler.

**A `git push` to `main` doesn't seem to update the live site** — check
the Vercel project's Deployments tab: the "Source" shown for the current
Production deployment names the exact commit it was built from. If it's
behind your latest push, either the GitHub App integration lost access to
the repo (Project Settings → Git) or the build for the newer commit failed
silently — check that commit's own build log rather than assuming the
push simply didn't arrive.
