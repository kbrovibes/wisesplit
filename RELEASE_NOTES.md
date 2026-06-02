# Release Notes

## v0.1.0 — 2026-06-01 — *"Hello, world"*

The first cut. Everything you need to split a check, none of the things you don't.

### Highlights
- **Sign in with Google** (Supabase OAuth, PKCE).
- **Groups & friends** with one-on-one ledgers.
- **Expenses** with equal / unequal / percent / share / exact splitting.
- **Settle up** with debt-graph minimization — fewer transactions than Splitwise.
- **Search** with three modes: substring, fuzzy (Fuse.js), and regex.
- **Quick add**: type "dinner with sam $48 yesterday" and we parse it.
- **Multi-currency**, formatted via `Intl.NumberFormat`.
- **Light, dark, and system theme** with persisted preference and zero flash.
- **PWA**: installable, works offline, shell cached on first visit.
- **Pure SVG** illustrations, icons, charts, avatars — sharp on every screen.
- **Keyboard-first**: `N` new expense, `G` quick-nav, `/` search, `Cmd+K` command palette.
- **Zero analytics. Zero tracking. Zero ads.**

### Notable absences (on purpose)
- No raster image uploads. Receipts can be linked via URL or attached as notes — SVG-only is a design commitment.
- No background-sent reminders. Reminders open your mail client or Web Share — honest about what the static app can do.

### What's next
See [backlog.md](./backlog.md).
