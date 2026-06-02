"use client";

import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { MobileNav } from "./MobileNav";
import { CommandPalette } from "./CommandPalette";
import { ExpenseDialog } from "@/components/expense/ExpenseDialog";
import { InstallAndOffline } from "./InstallAndOffline";
import { useTheme } from "@/lib/store/theme";
import { useEffect } from "react";
import { useShortcuts } from "@/hooks/useShortcuts";

export function AppShell({ title, subtitle, actions, children }: { title?: React.ReactNode; subtitle?: React.ReactNode; actions?: React.ReactNode; children: React.ReactNode }) {
  const hydrate = useTheme((s) => s.hydrate);
  useEffect(() => { hydrate(); }, [hydrate]);
  useShortcuts();
  return (
    <div className="min-h-screen flex w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title={title} subtitle={subtitle} actions={actions} />
        <main className="flex-1 px-4 sm:px-6 py-6 max-w-[1280px] w-full mx-auto">{children}</main>
        <MobileNav />
      </div>
      <CommandPalette />
      <ExpenseDialog />
      <InstallAndOffline />
    </div>
  );
}
