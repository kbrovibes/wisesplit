# wisesplit — Build Plan

> A delightful, free-forever Splitwise replacement. Beautiful, minimal, artistic.
> Everything Splitwise does, but without the paywall and with a UI that feels like it belongs in 2026.

## 1. Mission

Build a webapp that:
- Tracks shared expenses across friends and groups
- Splits any way (equal, share, percent, exact)
- Settles up debts with smart minimization
- Reminds people about what they owe
- Searches every transaction (substring, fuzzy, regex)
- Looks like a piece of art — sleek, monochrome-leaning with one accent, generous whitespace
- Works offline, installs as a PWA, ships on GitHub Pages
- Costs the user $0 forever

## 2. Feature parity with Splitwise (and beyond)

### Parity (free in wisesplit)
| Feature                       | Splitwise (free) | Splitwise (Pro) | wisesplit |
| ----------------------------- | :--------------: | :-------------: | :-------: |
| Add expense                   | ✓                | ✓               | ✓         |
| Equal / unequal / % / shares  | ✓                | ✓               | ✓         |
| Groups                        | ✓                | ✓               | ✓         |
| Friends list                  | ✓                | ✓               | ✓         |
| Activity feed                 | ✓                | ✓               | ✓         |
| Comments on expenses          | ✓                | ✓               | ✓         |
| Settle up                     | ✓                | ✓               | ✓         |
| Record payment                | ✓                | ✓               | ✓         |
| Multi-currency                | partial          | ✓               | ✓ free    |
| Receipts (attachments)        | ✗                | ✓               | ✓ free (SVG-only — no raster uploads, by design) |
| Recurring expenses            | ✗                | ✓               | ✓ free    |
| Itemized expenses             | ✗                | ✓               | ✓ free    |
| Categories                    | ✓                | ✓               | ✓         |
| Charts & insights             | ✗                | ✓               | ✓ free    |
| CSV / JSON export             | partial          | ✓               | ✓ free    |
| Debt simplification           | ✓                | ✓               | ✓ (improved) |
| Notifications & reminders     | ✓                | ✓               | ✓         |
| Search                        | partial          | partial         | ✓ (fuzzy + regex + filters) |

### Beyond Splitwise
- **Fuzzy + regex search** across every expense field (Fuse.js for fuzzy, native RegExp for regex mode).
- **Quick-add natural language**: type "dinner with sam $48" and parse.
- **Keyboard-first**: `N` new expense, `G` go-to, `/` search, `?` shortcuts, `J/K` navigate.
- **Smart settle suggestions**: minimum-transaction debt graph minimization, with a visual.
- **Tags + custom labels** per expense (Splitwise only has categories).
- **Bulk operations**: select many, settle / categorize / delete in one shot.
- **Beautiful empty states** — every screen has a tiny SVG illustration.
- **Light + dark + system theme**, persists, no FOUC.
- **Offline-first PWA** — service worker caches the shell, queues writes.
- **Custom SVG charts** — no Chart.js, no images.
- **Animated SVG icons** (Lottie-free, plain CSS/SVG).
- **No tracking, no ads, no data sale.**

## 3. Tech stack (decisions in DECISIONS.md)

- **Framework**: Next.js 16 (App Router) with `output: 'export'` for static hosting on GitHub Pages.
- **Language**: TypeScript.
- **Styling**: Tailwind CSS v4 + custom CSS variables for theme tokens. No component library — bespoke components for a distinctive look.
- **Auth + DB**: Supabase (Google OAuth via PKCE on the client; Postgres with Row-Level-Security for data).
- **State**: TanStack Query for server state, Zustand for UI state.
- **Search**: Fuse.js (fuzzy) + native `RegExp` (regex).
- **Forms**: React Hook Form + Zod.
- **Charts**: Hand-rolled SVG components.
- **PWA**: `manifest.webmanifest` + custom service worker (no `next-pwa` — keep static export clean).
- **Deploy**: GitHub Pages via GitHub Actions on push to `main`.
- **Repo**: GitHub public repo `wisesplit` under user's account.

## 4. Architecture

```
wisesplit/
├── app/                       # Next.js App Router
│   ├── (marketing)/           # public landing
│   ├── (app)/                 # authenticated app
│   │   ├── dashboard/
│   │   ├── groups/[id]/
│   │   ├── friends/[id]/
│   │   ├── expenses/[id]/
│   │   ├── activity/
│   │   ├── search/
│   │   └── settings/
│   ├── auth/callback/         # supabase OAuth return
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                    # primitives (Button, Input, Dialog, Sheet, Menu, ...)
│   ├── illustrations/         # SVG components, hand-drawn
│   ├── icons/                 # SVG icon set
│   ├── charts/                # SVG charts (Spark, Donut, Bar, Stack)
│   ├── expense/               # ExpenseCard, ExpenseForm, SplitEditor
│   ├── group/
│   ├── friend/
│   └── shell/                 # AppShell, Sidebar, Topbar, CommandPalette
├── lib/
│   ├── supabase/              # client, types
│   ├── db/                    # repository functions
│   ├── search/                # fuzzy + regex engines
│   ├── debt/                  # graph minimization algo
│   ├── currency/
│   ├── nlp/                   # natural-language expense parser
│   └── utils/
├── hooks/
├── public/
│   ├── manifest.webmanifest
│   ├── sw.js
│   ├── favicon.svg
│   └── og.svg
├── styles/
│   └── tokens.css             # design tokens (light + dark)
├── .github/workflows/
│   └── deploy.yml             # GitHub Pages deploy
├── README.md
├── RELEASE_NOTES.md
├── backlog.md
├── DECISIONS.md
└── package.json
```

## 5. Data model (Supabase / Postgres)

```sql
profiles      (id uuid pk = auth.uid, name, avatar_svg_id, default_currency, created_at)
groups        (id, name, icon_svg_id, color, created_by, created_at)
group_members (group_id, user_id, joined_at)  -- composite pk
friends       (user_id, friend_user_id, created_at)  -- composite pk, bidirectional
expenses      (id, group_id nullable, paid_by, amount_cents, currency, description, category,
                tags text[], occurred_at, created_by, created_at, deleted_at)
splits        (expense_id, user_id, share_cents, share_type, share_value)
payments      (id, from_user, to_user, amount_cents, currency, note, occurred_at, group_id nullable)
comments      (id, expense_id, author, body, created_at)
reminders     (id, owner, target_user, expense_id nullable, due_at, sent_at, channel)
recurring     (id, template_expense jsonb, cadence, next_run_at, owner)
```

All tables: Row-Level-Security so a user only sees rows where they're a participant.

## 6. Task list (1–2 minute granularity)

### Phase 0 — Repo & scaffold (do first, single-threaded)
- [ ] 0.1 Write PLAN.md, DECISIONS.md, backlog.md scaffolds
- [ ] 0.2 `pnpm create next-app` with TS, Tailwind, App Router, no src/
- [ ] 0.3 Configure `next.config.ts` for static export + base path
- [ ] 0.4 Install deps: supabase-js, fuse.js, zustand, tanstack-query, react-hook-form, zod, clsx, tailwind-merge, date-fns
- [ ] 0.5 Create design-tokens.css with light + dark CSS variables
- [ ] 0.6 Create `app/layout.tsx` with theme provider + font setup (Inter + display)
- [ ] 0.7 Add favicon.svg, og.svg, apple-touch.svg, manifest.webmanifest
- [ ] 0.8 README.md skeleton
- [ ] 0.9 RELEASE_NOTES.md v0.1.0 entry
- [ ] 0.10 backlog.md with deferred items
- [ ] 0.11 `git init`, first commit
- [ ] 0.12 Create GitHub repo via `gh repo create`, push
- [ ] 0.13 Add `.github/workflows/deploy.yml` for GitHub Pages
- [ ] 0.14 Enable GitHub Pages via `gh api` (source = gh-actions)

### Phase 1 — Foundation (parallel safe after 0)
- [ ] 1.1 lib/supabase/client.ts (browser client, PKCE)
- [ ] 1.2 Supabase schema migrations (SQL)
- [ ] 1.3 RLS policies
- [ ] 1.4 lib/db/repository.ts (typed CRUD)
- [ ] 1.5 lib/auth/useUser.ts hook
- [ ] 1.6 app/auth/callback/page.tsx
- [ ] 1.7 components/shell/AuthGate.tsx
- [ ] 1.8 lib/currency.ts (format, parse, multi-currency table)
- [ ] 1.9 lib/debt/minimize.ts (graph debt simplification)
- [ ] 1.10 lib/search/fuzzy.ts (Fuse wrapper)
- [ ] 1.11 lib/search/regex.ts (safe RegExp runner)
- [ ] 1.12 lib/nlp/parseExpense.ts (rough NL parser)

### Phase 2 — Design system (parallel)
- [ ] 2.1 components/ui/Button.tsx (variants: primary, ghost, danger)
- [ ] 2.2 components/ui/Input.tsx + textarea
- [ ] 2.3 components/ui/Dialog.tsx (no Radix — bespoke)
- [ ] 2.4 components/ui/Sheet.tsx
- [ ] 2.5 components/ui/Menu.tsx (dropdown)
- [ ] 2.6 components/ui/Tabs.tsx
- [ ] 2.7 components/ui/Avatar.tsx (SVG monogram generator)
- [ ] 2.8 components/ui/Badge.tsx, Tag.tsx
- [ ] 2.9 components/ui/Toast.tsx
- [ ] 2.10 components/ui/Tooltip.tsx
- [ ] 2.11 components/ui/Skeleton.tsx
- [ ] 2.12 components/ui/EmptyState.tsx
- [ ] 2.13 components/ui/ThemeToggle.tsx (light/dark/system)

### Phase 3 — Icon + illustration set (parallel)
- [ ] 3.1 components/icons/index.tsx — 40 line icons (food, travel, home, gift, plus, search, etc.)
- [ ] 3.2 components/illustrations/EmptyExpenses.tsx
- [ ] 3.3 components/illustrations/EmptyGroups.tsx
- [ ] 3.4 components/illustrations/EmptyFriends.tsx
- [ ] 3.5 components/illustrations/Settled.tsx
- [ ] 3.6 components/illustrations/Welcome.tsx (landing hero)
- [ ] 3.7 components/illustrations/Offline.tsx
- [ ] 3.8 components/illustrations/CategoryGlyphs.tsx (10 categories)

### Phase 4 — Shell + navigation
- [ ] 4.1 components/shell/AppShell.tsx
- [ ] 4.2 components/shell/Sidebar.tsx (responsive collapse)
- [ ] 4.3 components/shell/Topbar.tsx (search field + user menu)
- [ ] 4.4 components/shell/CommandPalette.tsx (Cmd+K)
- [ ] 4.5 components/shell/MobileNav.tsx (bottom tab bar)
- [ ] 4.6 hooks/useKeyboard.ts (N, G, /, ?, J/K)

### Phase 5 — Marketing / landing
- [ ] 5.1 app/(marketing)/page.tsx — hero, features, screenshot SVGs
- [ ] 5.2 "Sign in with Google" CTA → Supabase OAuth
- [ ] 5.3 Footer with GitHub link, version

### Phase 6 — Dashboard
- [ ] 6.1 app/(app)/dashboard/page.tsx — overview cards
- [ ] 6.2 components/dashboard/BalanceCard.tsx ("you owe / are owed")
- [ ] 6.3 components/dashboard/RecentActivity.tsx
- [ ] 6.4 components/dashboard/MonthlySpark.tsx (SVG sparkline)
- [ ] 6.5 components/dashboard/CategoryDonut.tsx (SVG donut)

### Phase 7 — Expense flow
- [ ] 7.1 components/expense/ExpenseCard.tsx
- [ ] 7.2 components/expense/ExpenseList.tsx
- [ ] 7.3 components/expense/ExpenseForm.tsx (modal/sheet)
- [ ] 7.4 components/expense/SplitEditor.tsx (equal/unequal/%/shares/exact)
- [ ] 7.5 components/expense/CategoryPicker.tsx
- [ ] 7.6 components/expense/CurrencyPicker.tsx
- [ ] 7.7 components/expense/CommentsThread.tsx
- [ ] 7.8 app/(app)/expenses/[id]/page.tsx (detail)
- [ ] 7.9 Edit + delete + undo toast
- [ ] 7.10 Quick-add: parse "dinner with sam $48" → prefill form

### Phase 8 — Groups
- [ ] 8.1 app/(app)/groups/page.tsx — list
- [ ] 8.2 app/(app)/groups/[id]/page.tsx — detail w/ tabs (Expenses, Balances, Settle, Activity)
- [ ] 8.3 components/group/GroupCard.tsx
- [ ] 8.4 components/group/CreateGroupDialog.tsx
- [ ] 8.5 components/group/InviteSheet.tsx (share link)
- [ ] 8.6 components/group/BalancesTable.tsx
- [ ] 8.7 components/group/SettleUpView.tsx (uses lib/debt/minimize)

### Phase 9 — Friends
- [ ] 9.1 app/(app)/friends/page.tsx
- [ ] 9.2 app/(app)/friends/[id]/page.tsx (one-on-one ledger)
- [ ] 9.3 components/friend/AddFriendDialog.tsx
- [ ] 9.4 components/friend/FriendCard.tsx

### Phase 10 — Activity + search
- [ ] 10.1 app/(app)/activity/page.tsx
- [ ] 10.2 app/(app)/search/page.tsx
- [ ] 10.3 components/search/SearchBar.tsx (modes: text, fuzzy, regex)
- [ ] 10.4 components/search/SearchResults.tsx
- [ ] 10.5 components/search/Filters.tsx (date range, category, group, amount)

### Phase 11 — Payments + reminders
- [ ] 11.1 components/payment/RecordPaymentDialog.tsx
- [ ] 11.2 components/reminder/ReminderSheet.tsx
- [ ] 11.3 lib/reminders.ts (mailto:/share link generation)
- [ ] 11.4 components/reminder/RemindButton.tsx (per friend / per expense)

### Phase 12 — Settings
- [ ] 12.1 app/(app)/settings/page.tsx
- [ ] 12.2 Profile editor (name, default currency)
- [ ] 12.3 Theme picker
- [ ] 12.4 Export data (CSV + JSON)
- [ ] 12.5 Import data (JSON)
- [ ] 12.6 Delete account flow

### Phase 13 — PWA + offline
- [ ] 13.1 public/sw.js — cache-first for shell, network-first for API
- [ ] 13.2 Register SW from layout
- [ ] 13.3 components/shell/InstallPrompt.tsx
- [ ] 13.4 Offline indicator
- [ ] 13.5 Write-queue for offline mutations

### Phase 14 — Polish + QA
- [ ] 14.1 Animations: page transitions, list enter/exit, button press
- [ ] 14.2 Accessibility: focus rings, ARIA, keyboard tab order
- [ ] 14.3 Loading states everywhere
- [ ] 14.4 Error boundaries with illustrations
- [ ] 14.5 Lighthouse pass (PWA + a11y + perf > 95)
- [ ] 14.6 Visual probe agent — review every page on light + dark, mobile + desktop
- [ ] 14.7 Type-check + build + fix any errors
- [ ] 14.8 Update RELEASE_NOTES, backlog

### Phase 15 — Ship
- [ ] 15.1 Push to GitHub, GH Actions builds + deploys
- [ ] 15.2 Verify live URL renders
- [ ] 15.3 Final README polish with screenshots (SVG)

## 7. Parallelization plan

After Phase 0 (sequential), spawn 4 worker agents in parallel:
- **Agent A — Foundation & Data**: Phases 1, 11 (lib + supabase + debt minimization)
- **Agent B — Design System**: Phases 2, 3, 4 (UI primitives, icons, shell)
- **Agent C — Core App Pages**: Phases 5, 6, 7, 8, 9, 10, 12
- **Agent D — PWA & Polish**: Phases 13, 14

Then **Agent E — Visual probe**: open every page in both themes, capture delight signals, file any UI fixes.
