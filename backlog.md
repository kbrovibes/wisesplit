# backlog

Things we deliberately did **not** build in v0.1.0 — captured so they aren't lost.

## Near-term (v0.2.x)
- [ ] **Wire Supabase persistence** — schema + RLS already shipped in `supabase/schema.sql`. Need to: (1) create the project on a fresh Supabase account (free tier), (2) enable Google OAuth provider, (3) replace `lib/store/data.ts` with a thin repository that hits `supabase-js` when env vars are present and falls back to the existing localStorage Zustand store otherwise. Today entries persist only in the current browser; this is what makes them cross-device. Owner: karthik will create the account; agent wires the code.
- [ ] Scheduled reminders via Supabase Edge Function + cron (email via Resend free tier)
- [ ] Push notifications via Web Push (requires VAPID keys, server)
- [ ] Multi-language (i18n via `next-intl` — strings already extracted to `lib/i18n/en.ts`)
- [ ] Receipt OCR — out of scope (no raster images by design); could add an "itemized via paste" flow
- [ ] Friend requests with confirmation flow (currently auto-accept)
- [ ] Recurring expense generator (data model exists; UI stubbed)
- [ ] Per-group default currency
- [ ] Profile photo via DiceBear-style SVG avatar generator (monogram works for v0.1)

## Medium-term
- [ ] Apple / Microsoft / Magic-link auth
- [ ] Native mobile via Capacitor wrapping the PWA
- [ ] Web share target — share a receipt screenshot into wisesplit to log
- [ ] Plaid / open-banking imports
- [ ] AI-suggested categories per expense
- [ ] Conversational add: "we just had dinner, split with sam and priya, $84" via local LLM (no server cost)

## Hosting
- [ ] Custom domain (e.g. `wisesplit.app`) — currently `wisesplit-three.vercel.app` because `wisesplit` and `wisesplit-two` were taken globally

## Nice-to-have polish
- [ ] Confetti SVG burst when a group settles to zero
- [ ] Per-user custom accent color
- [ ] Drag-to-reorder groups
- [ ] Print-friendly stylesheet for monthly statements
- [ ] PDF export of a group's full history (via `pdf-lib` in the browser)
- [ ] Sound on key actions (toggleable; default off)

## Investigations
- [ ] Compare `@supabase/ssr` vs plain `supabase-js` for static export (currently plain)
- [ ] Investigate `Origin Private File System` for offline write queue persistence
- [ ] Evaluate CRDT-based offline sync (Yjs / Automerge) for group collaboration
