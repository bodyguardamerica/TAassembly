# Tabletop Armory — Assembly Guide Viewer
## Project Build Plan for Claude Code

---

## Project Overview

Build a static web application hosted on **Vercel** that displays PDF assembly instruction guides for Tabletop Armory products. The site lives at `assembly.tabletoparmory.store` and is fully self-maintaining — dropping a PDF into the repo automatically makes it appear on the site with no code changes required.

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | **Next.js 14 (App Router)** | Already used by Ron on Vercel; static export support |
| Hosting | **Vercel (free hobby tier)** | Auto-deploy from GitHub on push |
| PDF Rendering | **PDF.js (`pdfjs-dist`)** | Mozilla's open source, browser-native, no backend |
| PDF Discovery | **Node.js `fs` at build time** | Scans `/public/pdfs/` folder, generates static manifest |
| Styling | **Tailwind CSS** | Utility-first, fast to build, no extra config |
| Fonts | **Google Fonts** — `Cinzel` (display/headers) + `Raleway` (body) | Matches brand's medieval/tactical aesthetic |

---

## Brand & Design Spec

### Color Palette (from Tabletop Armory logo)

```css
--color-bg:         #1C1A18;   /* near-black charcoal — primary background */
--color-surface:    #272320;   /* slightly lighter — cards, panels */
--color-border:     #3D3530;   /* subtle warm dark border */
--color-tan:        #B89878;   /* logo tan/khaki — primary accent */
--color-brown:      #5C2A08;   /* logo dark brown — secondary accent */
--color-steel:      #C0BDB8;   /* sword silver — highlights, icons */
--color-text:       #F0EDE8;   /* warm off-white — body text */
--color-muted:      #8A8078;   /* muted warm gray — secondary text */
```

### Aesthetic Direction

- **Dark, tactical, refined** — like a well-crafted armory, not a sterile software app
- Warm charcoal backgrounds with tan/bronze accents throughout
- Subtle texture: a very faint noise/grain overlay on the background (CSS or SVG filter)
- All interactive elements (cards, buttons) have warm hover states with gentle transitions
- NO generic purple gradients, no white backgrounds, no Inter font

### Typography

- **Cinzel** — section headers, product titles, "ASSEMBLY GUIDES" label
- **Raleway** — body text, descriptions, UI labels
- Load both from Google Fonts in `layout.tsx`

---

## Repository Structure

```
tabletop-assembly/
├── public/
│   └── pdfs/
│       └── example-product.pdf     ← Drop PDFs here; site auto-updates
├── src/
│   └── app/
│       ├── layout.tsx               ← Root layout: fonts, metadata, global styles
│       ├── page.tsx                 ← Landing page: guide listing grid
│       ├── globals.css              ← Tailwind base + CSS custom properties
│       └── viewer/
│           └── [slug]/
│               └── page.tsx         ← PDF viewer page for each guide
├── lib/
│   └── getPdfs.ts                   ← Build-time PDF scanner utility
├── next.config.js                   ← Static export config + PDF.js worker alias
├── tailwind.config.ts               ← Tailwind theme extending brand colors
├── package.json
└── vercel.json                      ← Vercel routing config (if needed)
```

---

## Core Feature: Dynamic PDF Discovery

The site **automatically discovers PDFs** at build time. No `guides.json` to maintain.

### `lib/getPdfs.ts`

```typescript
// Runs at build time (Node.js context)
// Scans /public/pdfs/, returns array of guide metadata

import fs from 'fs'
import path from 'path'

export type GuideEntry = {
  slug: string        // URL-safe filename without extension: "warmachine-warcaster-base"
  filename: string    // original filename: "warmachine-warcaster-base.pdf"
  title: string       // human-readable: "Warmachine Warcaster Base"
  url: string         // "/pdfs/warmachine-warcaster-base.pdf"
}

export function getPdfs(): GuideEntry[] {
  const pdfDir = path.join(process.cwd(), 'public', 'pdfs')
  
  if (!fs.existsSync(pdfDir)) return []
  
  return fs
    .readdirSync(pdfDir)
    .filter(f => f.toLowerCase().endsWith('.pdf'))
    .map(filename => {
      const base = filename.replace(/\.pdf$/i, '')
      const slug = base.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      const title = base
        .replace(/[-_]+/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase())
      return {
        slug,
        filename,
        title,
        url: `/pdfs/${filename}`
      }
    })
    .sort((a, b) => a.title.localeCompare(b.title))
}
```

**How to name PDFs:** Use kebab-case for best results.
- `warmachine-warcaster-base.pdf` → title: "Warmachine Warcaster Base"
- `movement-tray-10mm.pdf` → title: "Movement Tray 10Mm" (acceptable)

---

## Page: Landing / Guide Listing (`src/app/page.tsx`)

### Layout

```
┌─────────────────────────────────────────────────────┐
│  [TA Logo SVG or text lockup]                       │
│  ASSEMBLY GUIDES                   [Cinzel, tan]    │
│  ─────────────────────────────────────────────────  │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ 📄        │  │ 📄        │  │ 📄        │         │
│  │ Product   │  │ Product   │  │ Product   │         │
│  │ Name      │  │ Name      │  │ Name      │         │
│  │           │  │           │  │           │         │
│  │ [View]    │  │ [View]    │  │ [View]    │         │
│  └──────────┘  └──────────┘  └──────────┘          │
│                                                     │
│  © Tabletop Armory                                  │
└─────────────────────────────────────────────────────┘
```

### Behavior

- Responsive grid: 1 col mobile → 2 col tablet → 3 col desktop
- Each card shows the guide title and a "View Guide" button
- Card hover: slight border color lift to `--color-tan`, subtle scale transform
- Empty state: if no PDFs found, show a friendly message: "No guides available yet."
- This is a **server component** — `getPdfs()` runs at build time via `generateStaticParams`

---

## Page: PDF Viewer (`src/app/viewer/[slug]/page.tsx`)

### Layout

```
┌─────────────────────────────────────────────────────┐
│  ← Back to Guides    [Product Title]  [↓ Download]  │
│  ─────────────────────────────────────────────────  │
│                                                     │
│  ┌──────── PDF VIEWER (PDF.js canvas) ────────────┐ │
│  │                                                │ │
│  │              [rendered PDF page]               │ │
│  │                                                │ │
│  └────────────────────────────────────────────────┘ │
│                                                     │
│  [◀ Prev]   Page 2 of 5   [Next ▶]                  │
└─────────────────────────────────────────────────────┘
```

### Behavior

- **PDF.js** renders the PDF client-side in a `<canvas>` element
- Pagination controls for multi-page PDFs
- **Download button** — direct `<a href="/pdfs/filename.pdf" download>` link, no JS needed
- "Back to Guides" link returns to the landing page
- PDF worker: use `pdfjs-dist/build/pdf.worker.min.js` copied to `/public/` via next.config.js

### Static Generation

```typescript
// Generate static pages for every PDF at build time
export async function generateStaticParams() {
  return getPdfs().map(g => ({ slug: g.slug }))
}
```

---

## PDF.js Integration Notes

### Installation

```bash
npm install pdfjs-dist
```

### Worker Setup (`next.config.js`)

```javascript
const CopyPlugin = require('copy-webpack-plugin')

module.exports = {
  output: 'export',   // static export for Vercel
  webpack: (config) => {
    config.plugins.push(
      new CopyPlugin({
        patterns: [{
          from: 'node_modules/pdfjs-dist/build/pdf.worker.min.js',
          to: '../public/pdf.worker.min.js',
        }],
      })
    )
    return config
  },
}
```

### Viewer Component (client component)

```typescript
'use client'
// Initialize once:
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'

// Load and render:
const pdf = await pdfjsLib.getDocument(pdfUrl).promise
const page = await pdf.getPage(pageNumber)
const viewport = page.getViewport({ scale: 1.5 })
// render to canvas...
```

The viewer component must be `'use client'` — wrap it in a server component shell for the route.

---

## Styling Implementation

### `tailwind.config.ts` — extend theme

```typescript
theme: {
  extend: {
    colors: {
      bg:      '#1C1A18',
      surface: '#272320',
      border:  '#3D3530',
      tan:     '#B89878',
      brown:   '#5C2A08',
      steel:   '#C0BDB8',
      text:    '#F0EDE8',
      muted:   '#8A8078',
    },
    fontFamily: {
      display: ['Cinzel', 'serif'],
      body:    ['Raleway', 'sans-serif'],
    }
  }
}
```

### `globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background-color: #1C1A18;
  color: #F0EDE8;
  font-family: 'Raleway', sans-serif;
}

/* Subtle grain texture overlay */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,..."); /* SVG noise pattern */
  opacity: 0.03;
  pointer-events: none;
  z-index: 9999;
}
```

---

## Deployment: Vercel Setup

### Step 1 — GitHub Repo

Create a new GitHub repo named `tabletop-assembly` and push the project.

### Step 2 — Vercel Project

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import the `tabletop-assembly` GitHub repo
3. Framework preset: **Next.js**
4. No environment variables needed
5. Deploy

### Step 3 — Custom Domain

In Vercel project → Settings → Domains → Add `assembly.tabletoparmory.store`

### Step 4 — DNS Record

In your DNS provider (Cloudflare or registrar), add:

| Type | Name | Value |
|---|---|---|
| CNAME | `assembly` | `cname.vercel-dns.com` |

This does **not** affect `tabletoparmory.store` (Shopify) in any way.

---

## Workflow: Adding a New PDF Guide

1. Add the PDF to `/public/pdfs/your-product-name.pdf`
2. `git add . && git commit -m "add: your-product-name assembly guide"`
3. `git push`
4. Vercel auto-deploys in ~30 seconds
5. The new guide card appears on the landing page automatically

No code changes. No config files to edit.

---

## Package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

---

## Dependencies

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "pdfjs-dist": "^4.4.168"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.3.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "copy-webpack-plugin": "^12.0.0"
  }
}
```

---

## Accessibility & UX Requirements

- All interactive elements keyboard-navigable
- Download button has descriptive `aria-label`: "Download [Product Name] PDF"
- PDF canvas has `aria-label` for screen readers
- Loading state shown while PDF renders (spinner or skeleton using `--color-tan`)
- Error state if PDF fails to load: friendly message with download link as fallback

---

## What Claude Code Should Produce

Deliver a complete, runnable project with these files — all production-ready, no placeholders:

1. `package.json`
2. `next.config.js`
3. `tailwind.config.ts`
4. `postcss.config.js`
5. `tsconfig.json`
6. `src/app/layout.tsx`
7. `src/app/globals.css`
8. `src/app/page.tsx`
9. `src/app/viewer/[slug]/page.tsx`
10. `src/components/PdfViewer.tsx` (client component)
11. `lib/getPdfs.ts`
12. `public/pdfs/.gitkeep` (empty placeholder so the folder is committed)
13. `.gitignore`
14. `README.md` with the "how to add a PDF" workflow

The project should run with `npm install && npm run dev` with no additional setup.
