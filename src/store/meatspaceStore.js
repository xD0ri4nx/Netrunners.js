import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useMeatspaceStore = create(
  persist(
    (set) => ({
      handle: 'Unknown',
      int: 8,
      ref: 6,
      interfaceLvl: 4,
      programming: 3,
      funds: 1500,
      health: 10,
      maxHealth: 10,
      interfaceType: 'default',
      isProgramming: false,
      programmingDays: 0,
      pendingProgram: null,

      addFunds: (amount) => set((state) => ({ funds: state.funds + amount })),
      takeDamage: (amount) => set((state) => ({
        health: Math.max(0, state.health - (state.interfaceType === 'interfacePlugs' ? Math.ceil(amount * 1.5) : amount))
      })),
      heal: () => set((state) => ({ health: state.maxHealth })),
      deductFunds: (amount) => set((state) => ({ funds: Math.max(0, state.funds - amount) })),
      setInterfaceType: (type) => set({ interfaceType: type }),
      setUpgradeProgramming: (level) => set({ programming: level }),
      startProgramming: (program, days) => set({ isProgramming: true, programmingDays: days, pendingProgram: program }),
      cancelProgramming: () => set({ isProgramming: false, programmingDays: 0, pendingProgram: null }),
      completeProgramming: () => set((state) => {
        const program = state.pendingProgram;
        return {
          isProgramming: false,
          programmingDays: 0,
          pendingProgram: null,
          programs: program ? [...state.programs, program] : state.programs
        };
      })
    }),
    {
      name: 'meatspace-storage',
    }
  )
);