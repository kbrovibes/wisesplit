"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Logo } from "@/components/shell/Logo";
import { Button } from "@/components/ui/Button";
import { ArrowRight, ChevronRight, Search, Sparkle, Wallet, CheckCircle, Globe, Bell } from "@/components/icons";
import { HeroIllustration } from "@/components/illustrations";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useTheme } from "@/lib/store/theme";
import { Kbd } from "@/components/ui/Kbd";

export default function Landing() {
  const hydrate = useTheme((s) => s.hydrate);
  useEffect(() => { hydrate(); }, [hydrate]);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] ws-grain">
      <header className="px-6 sm:px-10 h-16 flex items-center justify-between border-b border-[var(--border)]">
        <Logo size={22} />
        <nav className="hidden sm:flex items-center gap-6 text-sm text-[var(--text-muted)]">
          <a href="#features" className="hover:text-[var(--text)]">Features</a>
          <a href="#why" className="hover:text-[var(--text)]">Why</a>
          <a href="https://github.com/k4rthikr/wisesplit" target="_blank" rel="noreferrer" className="hover:text-[var(--text)]">GitHub</a>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/dashboard">
            <Button variant="primary" size="md" className="!px-4">Open app <ArrowRight className="h-4 w-4"/></Button>
          </Link>
        </div>
      </header>

      <section className="px-6 sm:px-10 pt-16 pb-20 max-w-6xl w-full mx-auto">
        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-2 px-2.5 h-7 rounded-full bg-[var(--accent-soft)] text-[var(--accent-ink)] text-xs font-medium tracking-wide">
              <Sparkle className="h-3.5 w-3.5" /> free forever · no ads · no tracking
            </span>
            <h1 className="mt-4 font-display text-5xl sm:text-6xl font-semibold tracking-tight leading-[1.04]">
              Split bills,<br/>
              <span className="text-[var(--accent)]">beautifully.</span>
            </h1>
            <p className="mt-5 text-[17px] text-[var(--text-muted)] max-w-xl leading-relaxed">
              Every Splitwise feature, none of the paywalls — wrapped in a UI that
              feels like it belongs in 2026. Fuzzy search every transaction, settle
              up with fewer transfers, install as a PWA, and never see an ad.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="/dashboard">
                <Button variant="primary" size="lg" className="!h-12 !px-5">
                  Try it now <ChevronRight className="h-4 w-4"/>
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="lg" className="!h-12 !px-5">
                  See the demo
                </Button>
              </Link>
              <span className="text-xs text-[var(--text-faint)] ml-2">
                runs locally without sign-in · <Kbd>⌘K</Kbd> to navigate
              </span>
            </div>
          </div>
          <div className="relative">
            <HeroIllustration className="w-full h-auto text-[var(--text)]" />
          </div>
        </div>
      </section>

      <section id="features" className="px-6 sm:px-10 py-16 border-t border-[var(--border)] bg-[var(--bg-sunk)]/40">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl font-semibold tracking-tight">Everything Splitwise charges for. Free.</h2>
          <p className="text-[var(--text-muted)] mt-2 max-w-xl">A comparison, since marketing pages are supposed to do this.</p>

          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Feature icon={<Search className="h-4 w-4" />} title="Search that works"
              desc="Substring, fuzzy (Fuse.js), and regex modes over every expense, group, and friend." />
            <Feature icon={<Sparkle className="h-4 w-4" />} title="Quick-add by typing"
              desc='Type "dinner with sam $48 yesterday" and we parse the amount, date, and people.' />
            <Feature icon={<Wallet className="h-4 w-4" />} title="Smarter settle-up"
              desc="Debt-graph minimization picks the fewest transfers instead of pairwise nudges." />
            <Feature icon={<Globe className="h-4 w-4" />} title="Multi-currency, free"
              desc="USD, EUR, GBP, INR, JPY, and more. Splitwise gates this. We don't." />
            <Feature icon={<Bell className="h-4 w-4" />} title="Honest reminders"
              desc="Open your mail or Web Share to send a nudge. No background spam, ever." />
            <Feature icon={<CheckCircle className="h-4 w-4" />} title="Installable PWA"
              desc="Works offline, installs to your home screen, caches the shell. SVG everywhere." />
          </div>
        </div>
      </section>

      <section id="why" className="px-6 sm:px-10 py-20 border-t border-[var(--border)]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight">Why we built this</h2>
          <p className="text-[var(--text-muted)] mt-3 leading-relaxed">
            Splitwise gates genuinely useful features — recurring expenses, currency conversion,
            itemized splits, charts — behind <em>Pro</em>, and the free experience shows ads to
            everyone else. It doesn't need to be that way. wisesplit is open source, hosted on
            GitHub Pages, fueled by a free Supabase tier. Forever.
          </p>
          <div className="mt-7 flex items-center justify-center gap-3">
            <Link href="/dashboard"><Button variant="primary" size="lg" className="!h-12 !px-5">Open the app</Button></Link>
            <a href="https://github.com/k4rthikr/wisesplit" target="_blank" rel="noreferrer">
              <Button variant="outline" size="lg" className="!h-12 !px-5">Star on GitHub</Button>
            </a>
          </div>
        </div>
      </section>

      <footer className="px-6 sm:px-10 py-8 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--text-muted)]">
        <Logo size={18} className="opacity-90" />
        <div className="flex items-center gap-4">
          <span>v0.1.0</span>
          <a href="https://github.com/k4rthikr/wisesplit" target="_blank" rel="noreferrer" className="hover:text-[var(--text)]">GitHub</a>
          <a href="https://github.com/k4rthikr/wisesplit/blob/main/RELEASE_NOTES.md" target="_blank" rel="noreferrer" className="hover:text-[var(--text)]">Releases</a>
          <a href="https://github.com/k4rthikr/wisesplit/blob/main/backlog.md" target="_blank" rel="noreferrer" className="hover:text-[var(--text)]">Backlog</a>
        </div>
      </footer>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="ws-card p-5">
      <div className="h-8 w-8 grid place-items-center rounded-[var(--radius-md)] bg-[var(--accent-soft)] text-[var(--accent-ink)] mb-3">{icon}</div>
      <h3 className="font-display font-semibold tracking-tight">{title}</h3>
      <p className="text-sm text-[var(--text-muted)] mt-1 leading-relaxed">{desc}</p>
    </div>
  );
}
