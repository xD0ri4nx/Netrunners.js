import { create } from 'zustand';

export const useMeatspaceStore = create((set) => ({
  handle: 'Unknown',
  int: 8,
  ref: 6,
  interfaceLvl: 4, 
  funds: 1500,
  
  // NEW: Neural Health System
  health: 10,
  maxHealth: 10,

  addFunds: (amount) => set((state) => ({ funds: state.funds + amount })),
  
  // NEW: Damage and Healing actions
  takeDamage: (amount) => set((state) => ({ health: Math.max(0, state.health - amount) })),
  heal: () => set((state) => ({ health: state.maxHealth }))
}));