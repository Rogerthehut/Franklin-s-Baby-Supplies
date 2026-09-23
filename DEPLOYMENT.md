# Deploying to Cloudflare Workers

This app builds to a Cloudflare Worker (Next.js via `vinext`). It uses a real
D1 database for products and orders, a real R2 bucket for product photos, and
Stripe for checkout. None of that is optional once you want the catalogue and
checkout to work in production; the setup below creates the real resources
and secrets for that.

## Create the D1 database and R2 bucket (one-off, per Cloudflare account)

```
npx wrangler login
npx wrangler d1 create franklins-db
npx wrangler r2 bucket create franklins-images
```

`wrangler d1 create` prints a `database_id`. Open `vite.config.ts` and
replace `SITE_CREATOR_PLACEHOLDER_DATABASE_ID` with that real ID, and change
`database_name`/`bucket_name` in the same file to match what you created
above (`franklins-db` / `franklins-images`, or your own names). `.openai/hosting.json`
already has `"d1": "DB", "r2": "BUCKET"`, matching the binding names the code
expects; leave those two values as they are.

Apply the schema to the real database:

```
pnpm run build
npx wrangler d1 execute franklins-db --remote --config dist/server/wrangler.json --file drizzle/0000_brown_stellaris.sql
```

Optionally seed the starting catalogue (the same 12 products the concept
preview ships with, with their photos already uploaded to R2):

```
npx wrangler d1 execute franklins-db --remote --config dist/server/wrangler.json --file drizzle/seed_products.sql
for f in nappies wipes milk snacks sleepsuit shoes carseat pram; do
  npx wrangler r2 object put "franklins-images/img_seed_${f}.png" --remote --file "public/seed/${f}.png" --ct image/png
done
```

Skip the seed step if you'd rather start with an empty catalogue and add
products yourself through `/admin`.

## Required secrets

Set these as Worker secrets, once, from your own machine (they persist on
the Worker across every future deploy, so this isn't part of the CI
pipeline below):

```
npx wrangler secret put ADMIN_TOKEN --config dist/server/wrangler.json
npx wrangler secret put STRIPE_SECRET_KEY --config dist/server/wrangler.json
npx wrangler secret put STRIPE_WEBHOOK_SECRET --config dist/server/wrangler.json
```

- `ADMIN_TOKEN`: a password of your choosing that gates `/admin`. Pick
  something long and random; anyone with it can add, edit and remove
  products and see order emails.
- `STRIPE_SECRET_KEY`: from your Stripe dashboard (**Developers → API keys**).
  Use a test-mode key until you're ready to take real payments, then swap in
  the live key.
- `STRIPE_WEBHOOK_SECRET`: create a webhook endpoint in Stripe pointing at
  `https://<your-worker-url>/api/webhooks/stripe`, listening for the
  `checkout.session.completed` event, and use the signing secret Stripe
  gives you. This is what turns a completed Stripe payment into a real order
  record and stock deduction; checkout will still redirect to Stripe without
  it, but paid orders won't be recorded on your side.

## One-off manual deploy

```
pnpm install
pnpm run build
npx wrangler login        # opens a browser to authorise your Cloudflare account
npx wrangler deploy --config dist/server/wrangler.json
```

`wrangler deploy` will print the live `*.workers.dev` URL once it finishes.

## Automatic deploy on every push to `main`

A GitHub Actions workflow is already set up at
`.github/workflows/deploy-cloudflare.yml`. It builds and deploys on every
push to `main`. To activate it, add two repository secrets:

1. Go to **Settings → Secrets and variables → Actions** on this GitHub repo.
2. Add `CLOUDFLARE_ACCOUNT_ID`, found on the right-hand sidebar of any page
   in the [Cloudflare dashboard](https://dash.cloudflare.com).
3. Add `CLOUDFLARE_API_TOKEN`, created at **My Profile → API Tokens →
   Create Token**, using the **"Edit Cloudflare Workers"** template (this
   scopes it to Workers deploys only, not full account access).

Once both secrets are set, the next push to `main` deploys automatically.

## Optional: Trustpilot reviews widget

A Trustpilot "Mini" TrustBox is wired into the footer
(`components/trustpilot-widget.tsx`), but stays hidden until it's configured —
it needs a real Trustpilot Business account:

1. Sign up at [business.trustpilot.com](https://business.trustpilot.com) and
   claim/verify your business.
2. In the Trustpilot dashboard, find your **Business Unit ID** (under
   **Integrations → Widgets**, or in the URL of your Trustpilot profile page).
3. Set two repository variables (not secrets — these values are public,
   they end up in the page HTML either way) at **Settings → Secrets and
   variables → Actions → Variables** on this GitHub repo:
   - `VITE_TRUSTPILOT_BUSINESS_UNIT_ID` — the ID from step 2
   - `VITE_TRUSTPILOT_REVIEW_URL` — your public Trustpilot review page,
     e.g. `https://www.trustpilot.com/review/franklinsbabysupplies.co.uk`
4. For local dev, add the same two as `VITE_TRUSTPILOT_BUSINESS_UNIT_ID=...`
   and `VITE_TRUSTPILOT_REVIEW_URL=...` in a `.env.local` file at the repo
   root (already gitignored via `.env*`).

Push to `main` (or rebuild locally) once set — the widget renders nothing at
all until `VITE_TRUSTPILOT_BUSINESS_UNIT_ID` is present, so there's no broken
placeholder shown to customers in the meantime.

## Notes

- `.openai/hosting.json` declares the D1 and R2 binding names the code
  expects (`DB` and `BUCKET`). The database ID and bucket name themselves
  live in `vite.config.ts`, set up in the "Create the D1 database and R2
  bucket" section above.
- The repo's README describes an optional "Sign in with ChatGPT" auth
  helper (`app/chatgpt-auth.ts`) and a mock-auth dev mode. Those routes are
  normally injected by the OpenAI "Sites" hosting platform this starter was
  originally built for; they are **not** implemented by this repo, and the
  current homepage doesn't use them. If you later add pages gated by
  `requireChatGPTUser()`, you'll need to implement real authentication
  yourself (or remove that dependency), since deploying to your own
  Cloudflare account doesn't get you that platform's auth for free.
- Custom domain: once deployed, add your own domain under the Worker's
  **Triggers → Custom Domains** in the Cloudflare dashboard.
