import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/Toast";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const display = Sora({ subsets: ["latin"], variable: "--font-display", display: "swap" });

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: { default: "wisesplit · split bills, beautifully", template: "%s · wisesplit" },
  description:
    "Track shared expenses with friends. Equal, percent, share, or exact splits. Search every transaction. Free forever, no ads, no tracking.",
  applicationName: "wisesplit",
  manifest: `${basePath}/manifest.webmanifest`,
  icons: {
    icon: [{ url: `${basePath}/favicon.svg`, type: "image/svg+xml" }],
    apple: [{ url: `${basePath}/apple-touch-icon.svg` }],
  },
  openGraph: {
    title: "wisesplit",
    description: "Split bills, beautifully. Free forever.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf9" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0c0e" },
  ],
  width: "device-width",
  initialScale: 1,
};

const themeBootstrap = `
  (function(){try{
    var s=localStorage.getItem('ws-theme');
    var m=window.matchMedia('(prefers-color-scheme: dark)').matches;
    var t=s==='dark'||s==='light'?s:(m?'dark':'light');
    document.documentElement.setAttribute('data-theme',t);
  }catch(e){document.documentElement.setAttribute('data-theme','light');}})();
`;

const swBootstrap = `
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('${basePath}/sw.js').catch(function(){});
    });
  }
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sans.variable} ${display.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body className="min-h-screen flex flex-col">
        <Providers>{children}</Providers>
        <Toaster />
        <script dangerouslySetInnerHTML={{ __html: swBootstrap }} />
      </body>
    </html>
  );
}
