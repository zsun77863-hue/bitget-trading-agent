"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Strategy, ExecutionRecord, Position } from "@/types";

interface StrategyStore {
  strategies: Strategy[];
  addStrategy: (s: Strategy) => void;
  updateStrategy: (id: string, patch: Partial<Strategy>) => void;
  removeStrategy: (id: string) => void;
  clearAll: () => void;
}

export const useStrategyStore = create<StrategyStore>()(
  persist(
    (set) => ({
      strategies: [],
      addStrategy: (s) => set((st) => ({ strategies: [s, ...st.strategies].slice(0, 100) })),
      updateStrategy: (id, patch) =>
        set((st) => ({ strategies: st.strategies.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      removeStrategy: (id) => set((st) => ({ strategies: st.strategies.filter((x) => x.id !== id) })),
      clearAll: () => set({ strategies: [] }),
    }),
    { name: "btg-strategies" }
  )
);

interface TradeStore {
  executions: ExecutionRecord[];
  positions: Position[];
  balance: number;
  addExecution: (e: ExecutionRecord) => void;
  setPositions: (p: Position[]) => void;
  setBalance: (b: number) => void;
  clear: () => void;
}

export const useTradeStore = create<TradeStore>()(
  persist(
    (set) => ({
      executions: [],
      positions: [],
      balance: 10000,
      addExecution: (e) => set((st) => ({ executions: [e, ...st.executions].slice(0, 500) })),
      setPositions: (positions) => set({ positions }),
      setBalance: (balance) => set({ balance }),
      clear: () => set({ executions: [], positions: [], balance: 10000 }),
    }),
    { name: "btg-trades" }
  )
);
