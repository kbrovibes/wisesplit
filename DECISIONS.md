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
