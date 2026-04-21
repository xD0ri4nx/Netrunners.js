import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useMeatspaceStore = create(
  persist(
    (set) => ({
      handle: 'Unknown',
      int: 8,
      ref: 6,
      interfaceLvl: 4, 
      funds: 1500,
      health: 10,
      maxHealth: 10,

      addFunds: (amount) => set((state) => ({ funds: state.funds + amount })),
      takeDamage: (amount) => set((state) => ({ health: Math.max(0, state.health - amount) })),
      heal: () => set((state) => ({ health: state.maxHealth })),
      deductFunds: (amount) => set((state) => ({ funds: Math.max(0, state.funds - amount) }))
    }),
    {
      name: 'meatspace-storage', // The unique key used in localStorage
    }
  )
);