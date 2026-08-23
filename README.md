<div align="center">

<img src="public/favicon.svg" width="72" height="72" alt="wisesplit logo" />

# wisesplit

**Split bills, beautifully.** Free forever. Every Splitwise feature, none of the paywalls — and a UI that feels like it belongs in 2026.

[**Landing page**](https://kbrovibes.github.io/wisesplit/landing/) · [Live (Vercel)](https://wisesplit-three.vercel.app/) · [Live (GH Pages)](https://kbrovibes.github.io/wisesplit/) · [Release notes](./RELEASE_NOTES.md) · [Backlog](./backlog.md) · [Decisions](./DECISIONS.md)

</div>

---

## What it does

- **Track shared expenses** across friends and groups.
- **Split any way**: equal, percent, share-based, or exact amounts.
- **Settle up smartly** — debt-graph minimization beats Splitwise's pairwise approach.
- **Search everything** with three modes: substring, fuzzy (Fuse.js), regex.
- **Quick add**: type `"dinner with sam $48 yesterday"` and we parse it.
- **Multi-currency** with proper `Intl` formatting.
- **Light, dark, and system theme** with zero flash on load.
- **Installable PWA**, offline-first.
- **Pure SVG** — every icon, illustration, chart, and avatar. No raster images, anywhere.
- **Keyboard-first** — `N` new expense, `/` search, `⌘K` command palette.
- **Zero analytics, zero tracking, zero ads.** Forever.

## Why

Splitwise gates the genuinely useful features (recurring, itemized, currency conversion, charts) behind Pro and shows ads to the rest. The free experience is loud and average. We can do better.

## Tech

| | |
|---|---|
| Framework | **Next.js 16** (App Router, static export) |
| Hosting | **GitHub Pages** via GitHub Actions |
| Auth + DB | **Supabase** — Google OAuth (PKCE), Postgres with RLS |
| Style | Tailwind v4 + bespoke CSS-variable design tokens |
| State | TanStack Query + Zustand |
| Search | Fuse.js + native `RegExp` |
| Charts | Hand-rolled SVG |
| PWA | Custom manifest + service worker |

Full architectural decisions in [`DECISIONS.md`](./DECISIONS.md).

## Running locally

```bash
npm install
cp .env.example .env.local   # optional — without it, demo mode uses localStorage
npm run dev
```

Open <http://localhost:3000>. Works fully without Supabase configured (demo mode loads a seeded ledger you can play with).

### Bringing your own Supabase

1. Create a project at <https://supabase.com>.
2. Open the SQL editor and paste `lib/supabase/schema.sql`.
3. Enable the Google OAuth provider in Auth → Providers.
4. Copy the project URL and anon key into `.env.local`.

That's it.

## Deploying

`main` branch pushes auto-deploy to GitHub Pages via `.github/workflows/deploy.yml`. Set repo secrets `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` if you want live auth on the deployed copy.

## Project structure

```
app/             # Next.js routes (App Router)
components/      # ui primitives, icons, illustrations, shell
lib/             # supabase, debt math, search, currency, nlp
public/          # favicon, manifest, service worker, landing/ (the /landing/ page)
```

## Keyboard

| Shortcut | Action |
|---|---|
| `⌘K` / `Ctrl+K` | Command palette |
| `/` | Focus search |
| `N` | New expense |
| `G` then `D/G/F/S` | Go to Dashboard / Groups / Friends / Settings |
| `?` | Show shortcuts |

## License

MIT — fork it, host it, brand it. Just don't charge people for what should be free.
