import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCyberdeckStore = create(
  persist(
    (set) => ({
      deckModel: 'Zetatech Paraline',
      maxMu: 5,
      usedMu: 2, 
      combatBonus: 0, // NEW: Passive deck bonus
      programs: [
        { id: 'prog_decrypt', name: 'Decrypt v1.0', type: 'utility', strength: 4 },
        { id: 'prog_sword', name: 'Sword', type: 'anti-ice', strength: 4 }
      ],
      activeProgram: null,

      setActiveProgram: (id) => set((state) => ({
        activeProgram: state.programs.find(p => p.id === id) || null
      })),

      addProgram: (program) => set((state) => {
         if (state.usedMu < state.maxMu) {
            return {
              programs: [...state.programs, program],
              usedMu: state.usedMu + 1
            };
         }
         return state;
      }),

      upgradeMu: (amount) => set((state) => ({
        maxMu: state.maxMu + amount
      })),

      // NEW: Equip a new Cyberdeck
      equipDeck: (model, mu, bonus) => set({
        deckModel: model,
        maxMu: mu,
        combatBonus: bonus
      })
    }),
    {
      name: 'cyberdeck-storage'
    }
  )
);