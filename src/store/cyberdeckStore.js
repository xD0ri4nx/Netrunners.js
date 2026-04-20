// src/store/cyberdeckStore.js
import { create } from 'zustand';

export const useCyberdeckStore = create((set) => ({
  deckModel: "Zetatech Paraline",
  maxMu: 5,
  usedMu: 2,
  
  // The actual programs loaded into your deck's memory
  programs: [
    { id: 'prog_decrypt', name: 'Decrypt v1.0', type: 'utility', strength: 4 },
    { id: 'prog_sword', name: 'Sword', type: 'anti-ice', strength: 4 }
  ],
  
  // Which program is currently "armed" and ready to fire
  activeProgram: null,

  // Action to click and equip a program
  setActiveProgram: (programId) => set((state) => ({
    activeProgram: state.programs.find(p => p.id === programId) || null
  }))
}));