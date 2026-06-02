"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Download, XCircle } from "@/components/icons";

type BeforeInstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

export function InstallAndOffline() {
  const [installEvt, setInstallEvt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [offline, setOffline] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onBI = (e: Event) => { e.preventDefault(); setInstallEvt(e as BeforeInstallPromptEvent); };
    const onInstalled = () => { setInstalled(true); setInstallEvt(null); };
    const onOnline = () => setOffline(false);
    const onOffline = () => setOffline(true);
    window.addEventListener("beforeinstallprompt", onBI);
    window.addEventListener("appinstalled", onInstalled);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    setOffline(!navigator.onLine);
    const seen = localStorage.getItem("ws-install-dismissed");
    if (seen) setDismissed(true);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBI);
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  const install = async () => {
    if (!installEvt) return;
    await installEvt.prompt();
    await installEvt.userChoice;
    setInstallEvt(null);
  };
  const dismiss = () => {
    setDismissed(true);
    try { localStorage.setItem("ws-install-dismissed", "1"); } catch {}
  };

  return (
    <>
      {offline && (
        <div className="fixed top-2 left-1/2 -translate-x-1/2 z-[55] px-3 h-8 rounded-full bg-[var(--warning-soft)] text-[var(--warning)] text-xs font-medium flex items-center gap-2 border border-[var(--warning)]/30 ws-slide-up">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--warning)] animate-pulse"/>
          Offline — your changes save locally and sync when you're back.
        </div>
      )}
      {installEvt && !installed && !dismissed && (
        <div className="fixed bottom-20 sm:bottom-4 right-4 z-[55] ws-elev p-4 max-w-xs ws-slide-up flex items-start gap-3">
          <div className="h-9 w-9 grid place-items-center rounded-[var(--radius-md)] bg-[var(--accent-soft)] text-[var(--accent-ink)] shrink-0">
            <Download className="h-4 w-4"/>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Install wisesplit</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Add to your home screen. Works offline.</p>
            <div className="mt-2 flex items-center gap-2">
              <Button size="sm" variant="primary" onClick={install}>Install</Button>
              <Button size="sm" variant="ghost" onClick={dismiss}>Not now</Button>
            </div>
          </div>
          <button onClick={dismiss} aria-label="Dismiss" className="text-[var(--text-faint)] hover:text-[var(--text)]">
            <XCircle className="h-4 w-4"/>
          </button>
        </div>
      )}
    </>
  );
}
