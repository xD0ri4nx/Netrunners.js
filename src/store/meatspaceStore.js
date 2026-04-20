// src/store/meatspaceStore.js
import { create } from 'zustand';

export const useMeatspaceStore = create((set) => ({
  handle: 'Unknown',
  int: 8,
  ref: 6,
  interfaceLvl: 4, 
  funds: 1500,

  // Action to dynamically add looted Eurobucks
  addFunds: (amount) => set((state) => ({ funds: state.funds + amount }))
}));