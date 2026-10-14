import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useMeatspaceStore } from './meatspaceStore';

export interface Position { type: 'long' | 'short'; amount: number; avgPrice: number; }

interface StockState {
  prices: Record<string, number>;
  positions: Record<string, Position>;
  tick: () => void;
  invest: (corp: string, amount: number, type: 'long' | 'short') => boolean;
  settle: (corp: string) => number;
  settleAll: () => number;
  shock: (corp: string, dir: -1 | 1) => void;
}

export const STOCKS = [
  { id: 'kurokawa', name: 'Kurokawa Corp', base: 150, volatility: 0.03 },
  { id: 'militech', name: 'Militech', base: 120, volatility: 0.035 },
  { id: 'somachem', name: 'SomaChem', base: 90, volatility: 0.025 },
  { id: 'biotechnica', name: 'Biotechnica', base: 110, volatility: 0.028 },
  { id: 'eurospace', name: 'Eurospace', base: 100, volatility: 0.02 },
  { id: 'sovspace', name: 'SovSpace', base: 80, volatility: 0.04 },
];

const initialPrices = STOCKS.reduce((a, s) => ({ ...a, [s.id]: s.base }), {} as Record<string, number>);

export const useStockStore = create<StockState>()(
  persist(
    (set, get) => ({
      prices: initialPrices,
      positions: {},
      tick: () => set((s) => {
        const next = { ...s.prices };
        for (const st of STOCKS) {
          const change = (Math.random() - 0.5) * 2 * st.volatility * (next[st.id] ?? st.base);
          next[st.id] = Math.max(10, Math.min(500, Math.round(((next[st.id] ?? st.base) + change) * 100) / 100));
        }
        return { prices: next };
      }),
      invest: (corp, amount, type) => {
        const price = get().prices[corp];
        if (!price) return false;
        const ms = useMeatspaceStore.getState();
        if (ms.funds < amount) return false;
        ms.deductFunds(amount);
        set((s) => {
          const prev = s.positions[corp];
          const pos: Position = prev && prev.type === type
            ? { type, amount: prev.amount + amount, avgPrice: (prev.avgPrice * prev.amount + price * amount) / (prev.amount + amount) }
            : { type, amount, avgPrice: price };
          return { positions: { ...s.positions, [corp]: pos } };
        });
        return true;
      },
      settle: (corp) => {
        const pos = get().positions[corp];
        const price = get().prices[corp];
        if (!pos || !price) return 0;
        const payout = Math.max(0, Math.round(pos.type === 'long' ? pos.amount * (price / pos.avgPrice) : pos.amount * (2 - price / pos.avgPrice)));
        useMeatspaceStore.getState().addFunds(payout);
        set((s) => { const p = { ...s.positions }; delete p[corp]; return { positions: p }; });
        return payout;
      },
      settleAll: () => {
        const { positions, prices } = get();
        let total = 0;
        for (const [corp, pos] of Object.entries(positions)) {
          const price = prices[corp];
          if (!price) continue;
          total += Math.max(0, Math.round(pos.type === 'long' ? pos.amount * (price / pos.avgPrice) : pos.amount * (2 - price / pos.avgPrice)));
        }
        if (total > 0) useMeatspaceStore.getState().addFunds(total);
        set({ positions: {} });
        return total;
      },
      shock: (corp, dir) => set((s) => {
        const cur = s.prices[corp];
        if (cur === undefined) return s;
        const next = dir === -1 ? cur * 0.7 : cur * 1.2;
        return { prices: { ...s.prices, [corp]: Math.max(10, Math.min(500, Math.round(next * 100) / 100)) } };
      }),
    }),
    { name: 'stock-store', partialize: (s) => ({ positions: s.positions, prices: s.prices }) }
  )
);
