# Tabletop Armory — Assembly Guide Viewer

Static site hosted at `assembly.tabletoparmory.store`. Displays PDF assembly guides for Tabletop Armory products.

## Adding a New Guide

1. Drop the PDF into `/public/pdfs/your-product-name.pdf`
   - Use kebab-case filenames for clean titles: `warmachine-warcaster-base.pdf`
2. Commit and push:
   ```bash
   git add public/pdfs/your-product-name.pdf
   git commit -m "add: your-product-name assembly guide"
   git push
   ```
3. Vercel auto-deploys in ~30 seconds — the new card appears automatically.

No code changes. No config files to edit.

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build & Deploy

Vercel handles this automatically on every push to `main`. To build locally:

```bash
npm run build
```

Output goes to `/out/` (static HTML export).
