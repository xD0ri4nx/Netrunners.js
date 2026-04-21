import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCyberdeckStore = create(
  persist(
    (set) => ({
      deckModel: "Zetatech Paraline",
      maxMu: 5,
      usedMu: 2,
      programs: [
        { id: 'prog_decrypt', name: 'Decrypt v1.0', type: 'utility', strength: 4 },
        { id: 'prog_sword', name: 'Sword', type: 'anti-ice', strength: 4 }
      ],
      activeProgram: null,

      setActiveProgram: (programId) => set((state) => ({
        activeProgram: state.programs.find(p => p.id === programId) || null
      })),

      addProgram: (program) => set((state) => {
        if (state.programs.some(p => p.id === program.id)) return state;
        return { programs: [...state.programs, program] };
      }),

      upgradeMu: (amount) => set((state) => ({
        maxMu: state.maxMu + amount
      }))
    }),
    {
      name: 'cyberdeck-storage', // The unique key used in localStorage
    }
  )
);