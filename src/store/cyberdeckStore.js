import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCyberdeckStore = create(
    persist(
        (set) => ({
    deckModel: 'Zetatech Paraline',
    maxMu: 5,
    usedMu: 0,
    speed: 1,
    dataWalls: 3,
    coprocessors: 0,
    isCellular: false,
    deckHealth: 100,
    maxDeckHealth: 100,
    deckCrashes: 0,

    programs: [
        { id: 'prog_decrypt', name: 'Decrypt v1.0', type: 'utility', strength: 4 },
        { id: 'prog_sword', name: 'Sword', type: 'anti-ice', strength: 4 }
    ],

    activeAction: null,
    activePassives: [],

    toggleProgram: (id) => set((state) => {
        const prog = state.programs.find(p => p.id === id);
        if (!prog) return state;

        if (prog.type === 'stealth' || prog.type === 'defense') {
            const isRunning = state.activePassives.some(p => p.id === id);
            if (isRunning) {
                return { activePassives: state.activePassives.filter(p => p.id !== id) };
            } else {
                return { activePassives: [...state.activePassives, prog] };
            }
        } else {
            if (state.activeAction?.id === id) {
                return { activeAction: null };
            } else {
                return { activeAction: prog };
            }
        }
    }),

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

    equipDeck: (model, mu, speed, dataWalls) => set({
        deckModel: model,
        maxMu: mu,
        usedMu: 0,
        speed: speed,
        dataWalls: dataWalls
    }),

    addSpeed: () => set((state) => ({
        speed: state.speed + 1
    })),

    addDataWalls: () => set((state) => ({
        dataWalls: state.dataWalls + 1
    })),

    addRipple: () => set((state) => ({
        ripple: (state.ripple || 0) + 1
    })),

    addCoprocessor: () => set((state) => ({
        coprocessors: state.coprocessors + 1
    })),

    setCellular: (isCellular) => set({ isCellular }),

    damageDeck: (amount) => set((state) => ({
        deckHealth: Math.max(0, state.deckHealth - amount),
        deckCrashes: state.deckCrashes + 1
    })),

    repairDeck: (amount) => set((state) => ({
        deckHealth: Math.min(state.maxDeckHealth, state.deckHealth + amount)
    })),

    resetDeckCrashes: () => set({ deckCrashes: 0 }),

    reduceMaxMu: (amount) => set((state) => ({
        maxMu: Math.max(1, state.maxMu - amount)
    }))
        }),
        {
            name: 'cyberdeck-storage'
        }
    )
);