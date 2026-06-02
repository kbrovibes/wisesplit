/* eslint-disable react/display-name */
import type { SVGProps } from "react";

const Base = (path: React.ReactNode, viewBox = "0 0 24 24") => {
  const Icon = (props: SVGProps<SVGSVGElement>) => (
    <svg
      viewBox={viewBox}
      width={20}
      height={20}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {path}
    </svg>
  );
  return Icon;
};

export const Plus       = Base(<><path d="M12 5v14M5 12h14"/></>);
export const Minus      = Base(<path d="M5 12h14"/>);
export const Check      = Base(<path d="M5 12l5 5 9-11"/>);
export const X          = Base(<><path d="M6 6l12 12M18 6l-12 12"/></>);
export const ChevronDown= Base(<path d="M6 9l6 6 6-6"/>);
export const ChevronRight = Base(<path d="M9 6l6 6-6 6"/>);
export const ChevronLeft  = Base(<path d="M15 6l-6 6 6 6"/>);
export const ChevronUp    = Base(<path d="M6 15l6-6 6 6"/>);
export const ArrowRight = Base(<><path d="M5 12h14M13 6l6 6-6 6"/></>);
export const ArrowUp    = Base(<><path d="M12 19V5M6 11l6-6 6 6"/></>);
export const ArrowDown  = Base(<><path d="M12 5v14M6 13l6 6 6-6"/></>);
export const Search     = Base(<><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></>);
export const Sun        = Base(<><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></>);
export const Moon       = Base(<path d="M21 13A8 8 0 0 1 11 3a8 8 0 1 0 10 10z"/>);
export const Monitor    = Base(<><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></>);
export const Home       = Base(<><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></>);
export const Users      = Base(<><circle cx="9" cy="8" r="3.2"/><path d="M2 20c0-3.5 3.1-6 7-6s7 2.5 7 6"/><circle cx="17" cy="9" r="2.6"/><path d="M16 20c0-2.8 2.2-4.5 5-4.5"/></>);
export const User       = Base(<><circle cx="12" cy="8" r="3.5"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/></>);
export const Group      = Base(<><circle cx="8" cy="9" r="3"/><circle cx="16" cy="9" r="3"/><path d="M2 20c0-3 2.7-5 6-5s6 2 6 5M10 20c0-3 2.7-5 6-5s6 2 6 5"/></>);
export const Activity   = Base(<path d="M3 12h4l3-7 4 14 3-7h4"/>);
export const Settings   = Base(<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></>);
export const Bell       = Base(<><path d="M6 8a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 19a2 2 0 0 0 4 0"/></>);
export const Send       = Base(<><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/></>);
export const Share      = Base(<><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.2 11.2l7.6-4M8.2 12.8l7.6 4"/></>);
export const Trash      = Base(<><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></>);
export const Edit       = Base(<><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></>);
export const Copy       = Base(<><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>);
export const Download   = Base(<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5M12 15V3"/></>);
export const Upload     = Base(<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5M12 3v12"/></>);
export const Plane      = Base(<path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l4-1 4 1v-1.5L14 19v-5.5z"/>);
export const Food       = Base(<><path d="M3 11a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4M3 11h18l-1 2a4 4 0 0 1-4 3H8a4 4 0 0 1-4-3z"/><path d="M12 7V3"/></>);
export const Coffee     = Base(<><path d="M3 8h14v6a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z"/><path d="M17 10h2a3 3 0 1 1 0 6h-2"/><path d="M6 3v3M10 3v3M14 3v3"/></>);
export const Cart       = Base(<><path d="M3 4h2l2.5 11.5A2 2 0 0 0 9.5 17H18a2 2 0 0 0 2-1.5L21 8H6"/><circle cx="10" cy="20" r="1.5"/><circle cx="17" cy="20" r="1.5"/></>);
export const Car        = Base(<><path d="M5 11l2-5h10l2 5M3 16h18v-3a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3z"/><circle cx="7" cy="17" r="1.5"/><circle cx="17" cy="17" r="1.5"/></>);
export const Gift       = Base(<><rect x="3" y="9" width="18" height="11" rx="1"/><path d="M3 13h18M12 9v11"/><path d="M12 9c-3 0-5-2-5-4s2-3 5 0c3-3 5-2 5 0s-2 4-5 4z"/></>);
export const Book       = Base(<><path d="M4 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4z"/><path d="M20 4h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8z"/></>);
export const Film       = Base(<><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 8h4M3 12h4M3 16h4M17 8h4M17 12h4M17 16h4M8 4v16M16 4v16"/></>);
export const Briefcase  = Base(<><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/></>);
export const Tag        = Base(<><path d="M20 12l-7 7a2 2 0 0 1-3 0L3 11V4h7l10 8z"/><circle cx="8" cy="8" r="1.5"/></>);
export const Filter     = Base(<path d="M3 5h18l-7 9v6l-4-2v-4z"/>);
export const Calendar   = Base(<><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></>);
export const Clock      = Base(<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>);
export const CheckCircle= Base(<><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/></>);
export const XCircle    = Base(<><circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/></>);
export const Info       = Base(<><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/></>);
export const Sparkle    = Base(<path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z M19 16l.7 2 2 .8-2 .8L19 22l-.7-2.4-2-.8 2-.8z"/>);
export const Globe      = Base(<><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></>);
export const Wallet     = Base(<><path d="M3 7a2 2 0 0 1 2-2h14v4H5a2 2 0 0 1-2-2z"/><path d="M3 7v10a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1H5"/><circle cx="17" cy="13" r="1.4"/></>);
export const Repeat     = Base(<><path d="M17 2l4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></>);
export const Logout     = Base(<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></>);
export const Menu_      = Base(<><path d="M3 6h18M3 12h18M3 18h18"/></>);
export const Dot        = Base(<circle cx="12" cy="12" r="1.7" fill="currentColor" stroke="none"/>);
export const PieChart   = Base(<><path d="M21.2 15A9 9 0 1 1 9 2.8V12h12.2z"/><path d="M13 2a9 9 0 0 1 9 9h-9z"/></>);
export const BarChart   = Base(<><path d="M3 20V10M9 20V4M15 20v-7M21 20V8"/></>);
export const Cmd        = Base(<><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 9h6v6H9z"/><path d="M9 9V7a2 2 0 1 0-2 2h2zM15 9V7a2 2 0 1 1 2 2h-2zM9 15v2a2 2 0 1 1-2-2h2zM15 15v2a2 2 0 1 0 2-2h-2z"/></>);
export const Spark      = Base(<path d="M5 15c3 0 3-6 6-6s3 6 6 6 3-4 6-4" />);
export const Mail       = Base(<><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></>);

export const CategoryIcon = {
  Food: Food,
  Coffee: Coffee,
  Groceries: Cart,
  Transport: Car,
  Travel: Plane,
  Home: Home,
  Entertainment: Film,
  Gifts: Gift,
  Books: Book,
  Work: Briefcase,
  Other: Tag,
} as const;

export type CategoryName = keyof typeof CategoryIcon;
export const CATEGORIES: CategoryName[] = ["Food", "Groceries", "Transport", "Travel", "Home", "Entertainment", "Gifts", "Books", "Work", "Other"];

export function CategoryGlyph({ name, className }: { name?: string | null; className?: string }) {
  const key = (CATEGORIES as readonly string[]).includes(name ?? "") ? (name as CategoryName) : "Other";
  const Icon = CategoryIcon[key];
  return <Icon className={className} />;
}
