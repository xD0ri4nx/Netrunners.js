import { create } from 'zustand';

export const useRoutingStore = create((set) => ({
  currentLdl: null,
  routeHistory: [],
  traceDefense: 0,
  traceRisk: 0,

  setStartingLdl: (id) => set({
    currentLdl: id,
    routeHistory: [id],
    traceDefense: 0,
    traceRisk: 0
  }),

  jumpToLdl: (id, traceDefenseGain) => set((state) => ({
    currentLdl: id,
    routeHistory: [...state.routeHistory, id],
    traceDefense: state.traceDefense + traceDefenseGain
  })),

  addTraceRisk: (amount) => set((state) => ({
    traceRisk: state.traceRisk + amount
  })),

  reduceTraceDefense: (amount) => set((state) => ({
    traceDefense: Math.max(0, state.traceDefense - amount)
  })),

  reduceTraceRisk: (amount) => set((state) => ({
    traceRisk: Math.max(0, state.traceRisk - amount)
  })),

  resetRoute: () => set({ currentLdl: null, routeHistory: [], traceDefense: 0, traceRisk: 0 })
}));