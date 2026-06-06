"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsStore {
  mode: "simulated" | "live";
  setMode: (m: "simulated" | "live") => void;
  playbookApiKey: string;
  setPlaybookApiKey: (k: string) => void;
  defaultSymbol: string;
  setDefaultSymbol: (s: string) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      mode: "simulated",
      setMode: (mode) => set({ mode }),
      playbookApiKey: "",
      setPlaybookApiKey: (playbookApiKey) => set({ playbookApiKey }),
      defaultSymbol: "BTCUSDT",
      setDefaultSymbol: (defaultSymbol) => set({ defaultSymbol }),
    }),
    { name: "btg-settings" }
  )
);
