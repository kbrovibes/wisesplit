/* Hand-drawn-feeling SVG illustrations.
   Single accent color, derived from CSS variables so they themes correctly. */

import type { SVGProps } from "react";

const baseProps: SVGProps<SVGSVGElement> = {
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  strokeWidth: 1.5,
};

export function HeroIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 480 320" className={className} aria-hidden>
      <defs>
        <linearGradient id="h_g1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <circle cx="240" cy="170" r="140" fill="url(#h_g1)" />

      {/* receipt card */}
      <g transform="translate(70 50)" {...baseProps} stroke="var(--text)">
        <path d="M0 12c0-6.6 5.4-12 12-12h126c6.6 0 12 5.4 12 12v200l-22-12-22 12-22-12-22 12-22-12-22 12-22-12V12z" fill="var(--bg-elev)"/>
        <path d="M22 36h106M22 56h78M22 76h94M22 96h60M22 116h84M22 136h70" stroke="var(--text-faint)"/>
        <circle cx="120" cy="170" r="14" fill="var(--accent)" stroke="none"/>
        <path d="M114 170l4 4 8-8" stroke="var(--bg-elev)" strokeWidth="2"/>
      </g>

      {/* pie slice */}
      <g transform="translate(260 100)" {...baseProps} stroke="var(--text)">
        <circle cx="80" cy="80" r="78" fill="var(--bg-elev)"/>
        <path d="M80 80L80 2A78 78 0 0 1 158 80z" fill="var(--accent)" stroke="none"/>
        <path d="M80 80L158 80A78 78 0 0 1 110 152z" fill="var(--accent)" opacity="0.55" stroke="none"/>
        <circle cx="80" cy="80" r="36" fill="var(--bg-elev)" />
      </g>

      {/* coin */}
      <g transform="translate(370 40)" {...baseProps} stroke="var(--text)">
        <ellipse cx="30" cy="30" rx="28" ry="28" fill="var(--bg-elev)" />
        <text x="30" y="38" textAnchor="middle" fontFamily="var(--font-display)" fontSize="22" fill="var(--text)" stroke="none">$</text>
      </g>
      {/* coin 2 */}
      <g transform="translate(40 230)" {...baseProps} stroke="var(--text)">
        <ellipse cx="30" cy="30" rx="28" ry="28" fill="var(--accent)" stroke="none"/>
        <text x="30" y="38" textAnchor="middle" fontFamily="var(--font-display)" fontSize="22" fill="white" stroke="none">€</text>
      </g>
      {/* sparkle */}
      <g transform="translate(290 30)" stroke="var(--accent)" strokeWidth="2" fill="none">
        <path d="M14 0v10M14 18v10M0 14h10M18 14h10"/>
      </g>
    </svg>
  );
}

export function EmptyExpenses({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 160" className={className} aria-hidden>
      <rect x="40" y="20" width="140" height="120" rx="10" fill="var(--bg-elev)" stroke="var(--border-strong)" strokeWidth="1.5"/>
      <path d="M58 50h104M58 70h82M58 90h104M58 110h60" stroke="var(--border-strong)" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="170" cy="115" r="20" fill="var(--accent)"/>
      <path d="M162 115l5 5 11-12" stroke="var(--bg-elev)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function EmptyGroups({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 160" className={className} aria-hidden>
      <circle cx="80" cy="90" r="34" fill="var(--accent-soft)" stroke="var(--border-strong)" strokeWidth="1.5"/>
      <circle cx="140" cy="90" r="34" fill="var(--bg-elev)" stroke="var(--border-strong)" strokeWidth="1.5"/>
      <text x="80" y="98" textAnchor="middle" fontFamily="var(--font-display)" fontSize="22" fill="var(--accent-ink)">A</text>
      <text x="140" y="98" textAnchor="middle" fontFamily="var(--font-display)" fontSize="22" fill="var(--text)">B</text>
    </svg>
  );
}

export function EmptyFriends({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 160" className={className} aria-hidden>
      <circle cx="110" cy="80" r="40" fill="var(--accent)" />
      <text x="110" y="90" textAnchor="middle" fontFamily="var(--font-display)" fontSize="36" fill="white">+</text>
    </svg>
  );
}

export function Settled({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 160" className={className} aria-hidden>
      <circle cx="110" cy="80" r="56" fill="var(--positive-soft)" stroke="var(--positive)" strokeWidth="1.5"/>
      <path d="M85 82l16 16 36-36" stroke="var(--positive)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}

export function Offline({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 160" className={className} aria-hidden>
      <path d="M30 90c20-25 60-40 80-40s60 15 80 40" stroke="var(--border-strong)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M60 100c12-15 30-22 50-22s38 7 50 22" stroke="var(--border-strong)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M88 110c6-7 16-11 22-11s16 4 22 11" stroke="var(--accent)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <circle cx="110" cy="124" r="5" fill="var(--accent)"/>
      <path d="M30 30l160 100" stroke="var(--negative)" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}
