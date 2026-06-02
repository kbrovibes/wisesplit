"use client";

import { create } from "zustand";

type State = {
  paletteOpen: boolean;
  setPaletteOpen: (open: boolean) => void;
  newExpenseOpen: boolean;
  setNewExpenseOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
};

export const useUI = create<State>((set) => ({
  paletteOpen: false,
  setPaletteOpen: (open) => set({ paletteOpen: open }),
  newExpenseOpen: false,
  setNewExpenseOpen: (open) => set({ newExpenseOpen: open }),
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}));
