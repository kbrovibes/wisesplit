# Decisions log

Decisions I made autonomously while building wisesplit. We can revisit any of these.

## 2026-06-01

### D-001 — Hosting: GitHub Pages (static export)
**Decision**: Deploy as a fully static Next.js export to GitHub Pages.
**Why**: User asked for GitHub Pages support and "always free." A static export with Supabase (auth + DB on the client) means zero server cost forever.
**Trade-off**: No server-side rendering, no server-side secrets. All auth via Supabase PKCE, all data via Supabase JS client with RLS.
**Revisit if**: We need server-side features (e.g., scheduled reminders need a cron). Could move to Vercel free tier or add a tiny Supabase Edge Function.

### D-002 — Auth: Supabase + Google OAuth (PKCE)
**Decision**: Use Supabase for auth + DB. Google OAuth via PKCE flow, no client secret needed.
**Why**: Works fully from a static site. Free tier covers thousands of users. RLS gives a clean security model.
**Trade-off**: User pays $0 forever; we (the user) own one Supabase project.
**Revisit if**: User wants self-hosted Postgres or a different provider.

### D-003 — No component library, hand-rolled UI
**Decision**: No shadcn/ui, no Radix, no Headless UI. Build primitives from scratch.
**Why**: User wants a distinctive, "feels like art" UI. Component libraries trend toward sameness. Bespoke gives identity.
**Trade-off**: A bit more code; a11y must be done by hand.
**Revisit if**: Time is short — we can add Radix primitives behind our visual layer.

### D-004 — No raster images, ever
**Decision**: SVG-only. All illustrations, icons, charts, avatars (monograms), favicon — pure SVG.
**Why**: User asked for it. SVG scales, themes nicely, stays sharp on every device, gzips small.
**Trade-off**: We can't accept receipt photo uploads. We'll let users attach a note instead. Documented as a feature, not a bug.

### D-005 — Tailwind v4 with CSS-variable design tokens
**Decision**: Use Tailwind v4 + a `:root` token sheet for theme. `[data-theme="dark"]` flips variables.
**Why**: Cleanest theming story; no JS flash on first paint when we set theme attr before hydration.

### D-006 — Search: Fuse.js + native RegExp
**Decision**: Fuse.js for fuzzy, native `RegExp` (with a safe-eval guard) for regex mode.
**Why**: Splitwise's search is terrible. Ours should let power users grep their lives.

### D-007 — Reminders: client-side only (mailto + Web Share)
**Decision**: No background email sending. Reminders generate a `mailto:` or `navigator.share` payload.
**Why**: Static-hosted; no server to schedule sends. Honest, transparent — user actually clicks "send."
**Revisit if**: We add a Supabase Edge Function for scheduled email later.

### D-008 — Database access: client-side with RLS
**Decision**: All reads/writes go through `supabase-js` from the browser with strict RLS.
**Why**: Static export friendly; user owns their own data through the cookie-bound session.

### D-009 — Naming: wisesplit (lowercase, no hyphen)
**Decision**: Project name is `wisesplit`. Repo: `wisesplit`. Display name: "wisesplit" in lower-case for the wordmark, with a tiny dot accent.

### D-010 — Theme: monochrome + single accent
**Decision**: Neutral grays for surface, one accent color (`#5b6cff` — a calm indigo) used sparingly. Dark mode uses warmer near-black (`#0c0c0e`).
**Why**: Linear / Notion / Vercel aesthetic. User asked for art, not Bootstrap.

### D-011 — Currency: store cents + ISO code; format on render
**Decision**: All money stored as integer cents + ISO 4217 code. Format via `Intl.NumberFormat`.

### D-012 — Date library: date-fns
**Decision**: date-fns (tree-shakeable) over moment/dayjs.

### D-013 — Forms: React Hook Form + Zod
**Decision**: RHF + Zod resolvers. Zod schemas double as DB-write validators.

### D-014 — State: TanStack Query + Zustand
**Decision**: TanStack Query for everything Supabase. Zustand for tiny UI state (theme, command-palette open).

### D-015 — No analytics, no tracking
**Decision**: Zero third-party scripts. No GA, no Plausible, nothing.
**Why**: User said "best experience ever." That includes not being spied on.

### D-016 — License: MIT
**Decision**: Permissive. Anyone can fork and self-host.

### D-017 — GitHub account: kbrovibes
**Decision**: Repo lives at `github.com/kbrovibes/wisesplit`, served at `kbrovibes.github.io/wisesplit/`.
**Why**: That's the `gh` CLI's active account on this machine. To move to `k4rthikr/wisesplit`, transfer the repo or rerun `gh repo create` against that account; `basePath = /wisesplit` in `next.config.ts` stays the same as long as the repo is named `wisesplit`.

### D-020 — Production URL: wisesplit-three.vercel.app
**Decision**: Vercel auto-assigned `wisesplit-three.vercel.app` because the `wisesplit` and `wisesplit-two` subdomains were already taken globally. Functional name, slightly off-brand. Backlog item: register `wisesplit.app` or similar custom domain and point Vercel at it.

### D-018 — Vercel as the primary host; GH Pages as mirror
**Decision**: Deploy to Vercel as the canonical host (no basePath, custom domains available, edge cache). Keep GH Pages deploy alive as a free mirror.
**Why**: User has unlimited projects on Hobby tier; Vercel gives a cleaner URL (`wisesplit.vercel.app`) and a path to server-side features later (Workflow DevKit for scheduled reminders, Server Actions for write-paths under RLS). Static export still works, so both hosts serve the same artifact for v0.1.
**Implementation**: `next.config.ts` now defaults `basePath = ""`; the GH Pages workflow explicitly sets `NEXT_PUBLIC_BASE_PATH=/wisesplit`. Manifest uses relative paths so it works in either scope.

### D-019 — Supabase wiring deferred to v0.2
**Decision**: Ship v0.1 with localStorage-only persistence on both hosts. Wire Supabase once user provisions a fresh Supabase account.
**Why**: Existing org is at the 2-project free-tier cap and user wants to keep `snobaddy` + `stonkbro` active. Backlog entry covers the work.
