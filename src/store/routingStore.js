import { create } from 'zustand';

export const useRoutingStore = create((set) => ({
  currentLdl: null,
  routeHistory: [],
  totalTrace: 0,
  
  setStartingLdl: (id) => set({ 
    currentLdl: id, 
    routeHistory: [id], 
    totalTrace: 0 
  }),

  jumpToLdl: (id, addedTrace) => set((state) => ({
    currentLdl: id,
    routeHistory: [...state.routeHistory, id],
    totalTrace: state.totalTrace + addedTrace
  })),

  addPenaltyTrace: (amount) => set((state) => ({
    totalTrace: state.totalTrace + amount
  })),

  resetRoute: () => set({ currentLdl: null, routeHistory: [], totalTrace: 0 })
}));