# Deploying to Cloudflare Workers

This app builds to a Cloudflare Worker (Next.js via `vinext`). It has no
database or authentication dependency on the site itself, so a plain
Cloudflare Workers deploy under your own account works without any extra
setup beyond the two secrets below.

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

## Notes

- `.openai/hosting.json` (D1/R2 binding config) was missing from the
  exported zip and has been recreated with both bindings set to `null`,
  since the current site doesn't use a database or object storage. Add real
  binding names there (and matching resources in your Cloudflare account)
  if you build features that need them.
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
