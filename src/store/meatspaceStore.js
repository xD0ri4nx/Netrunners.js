import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useMeatspaceStore = create(
  persist(
    (set, get) => ({
      handle: 'Unknown',
      int: 8,
      ref: 6,
      interfaceLvl: 4,
      programming: 3,
      funds: 1500,
      neuralDamage: 0,
      maxInt: 8,
      interfaceType: 'default',
      timelagInterface: false,
      timelagReflex: false,
      isProgramming: false,
      programmingDays: 0,
      pendingProgram: null,
      ip: 0,
      totalIpEarned: 0,
       skills: {
         interface: 4,
         programming: 3,
         electronics: 2,
         cryptography: 1,
         librarySearch: 2,
         handgun: 3,
         brawling: 2
       },
       humanity: 100,
       maxHumanity: 100,
       cyberware: [],
       cyberpsychosisLevel: 0,
       riots: 0,
       factionReputation: {
         arasaka: 0,
         militech: 0,
         petrochem: 0,
         biotechnica: 0,
         eurospace: 0,
         sovspace: 0
       },
       vipMarketUnlocked: false,

      addFunds: (amount) => set((state) => ({ funds: state.funds + amount })),
      takeNeuralDamage: (amount) => set((state) => ({
        neuralDamage: Math.min(state.maxInt - 2, state.neuralDamage + amount)
      })),
      getCurrentInt: () => {
        const state = get();
        const neuralDamage = state.neuralDamage || 0;
        const maxInt = state.maxInt || 8;
        return Math.max(2, maxInt - neuralDamage);
      },
      healNeuralDamage: (amount) => set((state) => ({
        neuralDamage: Math.max(0, state.neuralDamage - amount)
      })),
      heal: () => set((state) => ({ health: state.maxHealth })),
      deductFunds: (amount) => set((state) => ({ funds: Math.max(0, state.funds - amount) })),
      setInterfaceType: (type) => set({ interfaceType: type }),
      setUpgradeProgramming: (level) => set((state) => ({
        programming: level,
        skills: { ...state.skills, programming: level }
      })),
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
      }),
      addIp: (amount) => set((state) => ({
        ip: state.ip + amount,
        totalIpEarned: state.totalIpEarned + amount
      })),
      increaseSkill: (skillName, points = 1) => set((state) => {
        const cost = points * 100;
        if (state.ip >= cost && state.skills[skillName] !== undefined) {
          const newSkills = { ...state.skills, [skillName]: state.skills[skillName] + points };
          return {
            ip: state.ip - cost,
            skills: newSkills,
            interfaceLvl: newSkills.interface,
            programming: newSkills.programming
          };
        }
        return state;
      }),
      resetIp: () => set({ ip: 0, totalIpEarned: 0 }),
       setTimelagInterface: (value) => set({ timelagInterface: value }),
       setTimelagReflex: (value) => set({ timelagReflex: value }),
       installCyberware: (ware) => set((state) => {
         const newHumanity = Math.max(0, state.humanity - ware.humanityCost);
         const newCyberware = [...state.cyberware, ware];
         const cpLevel = newHumanity <= 30 ? 3 : newHumanity <= 50 ? 2 : newHumanity <= 70 ? 1 : 0;
         return {
           cyberware: newCyberware,
           humanity: newHumanity,
           cyberpsychosisLevel: cpLevel,
           riots: cpLevel >= 3 ? state.riots + 1 : state.riots
         };
       }),
       removeCyberware: (wareId) => set((state) => {
         const ware = state.cyberware.find(w => w.id === wareId);
         if (!ware) return state;
         const newCyberware = state.cyberware.filter(w => w.id !== wareId);
         const newHumanity = Math.min(state.maxHumanity, state.humanity + ware.humanityCost);
         const cpLevel = newHumanity <= 30 ? 3 : newHumanity <= 50 ? 2 : newHumanity <= 70 ? 1 : 0;
         return {
           cyberware: newCyberware,
           humanity: newHumanity,
           cyberpsychosisLevel: cpLevel
         };
       }),
       getCyberwareBonus: (stat) => {
         const state = get();
         return state.cyberware.reduce((total, w) => total + (w.bonuses?.[stat] || 0), 0);
       },
       getCyberpsychosisEffects: () => {
         const state = get();
         const level = state.cyberpsychosisLevel;
         return {
           uiGlitches: level >= 1,
           hallucinations: level >= 2,
           forcedReckless: level >= 3,
           detectionPenalty: level >= 2 ? -2 : level >= 1 ? -1 : 0,
           evasionPenalty: level >= 2 ? -2 : 0
         };
       },
       updateFactionRep: (faction, amount) => set((state) => {
         const newRep = { ...state.factionReputation };
         newRep[faction] = Math.max(-100, Math.min(100, (newRep[faction] || 0) + amount));
         const vipUnlocked = Object.values(newRep).some(r => r >= 50);
         return { factionReputation: newRep, vipMarketUnlocked: vipUnlocked };
       }),
       getFactionWantedLevel: (faction) => {
         const state = get();
         const rep = state.factionReputation[faction] || 0;
         if (rep <= -50) return 3;
         if (rep <= -20) return 2;
         if (rep < 0) return 1;
         return 0;
       },
       getEnemyBonus: (faction) => {
         const state = get();
         const rep = state.factionReputation[faction] || 0;
         if (rep <= -50) return 3;
         if (rep <= -20) return 2;
         if (rep < 0) return 1;
         return 0;
       },
       getFactionPerks: (faction) => {
         const state = get();
         const rep = state.factionReputation[faction] || 0;
         return {
           vipAccess: rep >= 50,
           discount: rep >= 30 ? 0.2 : rep >= 20 ? 0.1 : 0,
           iceBuff: rep <= -30 ? Math.abs(rep) / 20 : 0
         };
       }
     }),
     {
       name: 'meatspace-storage',
       version: 4,
             migrate: (persistedState, version) => {
         if (version === 0 || version === 1) {
           return {
             ...persistedState,
             neuralDamage: 0,
             maxInt: persistedState.int || 8,
             ip: 0,
             totalIpEarned: 0,
             timelagInterface: false,
             timelagReflex: false,
             skills: {
               interface: persistedState.interfaceLvl || 4,
               programming: persistedState.programming || 3,
               electronics: 2,
               cryptography: 1,
               librarySearch: 2,
               handgun: 3,
               brawling: 2
             },
             humanity: 100,
             maxHumanity: 100,
             cyberware: [],
             cyberpsychosisLevel: 0,
             riots: 0,
             factionReputation: {
               arasaka: 0,
               militech: 0,
               petrochem: 0,
               biotechnica: 0,
               eurospace: 0,
               sovspace: 0
             },
             vipMarketUnlocked: false
           };
         }
         if (version === 2) {
           return {
             ...persistedState,
             timelagInterface: persistedState.timelagInterface || false,
             timelagReflex: persistedState.timelagReflex || false,
             humanity: persistedState.humanity || 100,
             maxHumanity: persistedState.maxHumanity || 100,
             cyberware: persistedState.cyberware || [],
             cyberpsychosisLevel: persistedState.cyberpsychosisLevel || 0,
             riots: persistedState.riots || 0,
             factionReputation: {
               arasaka: 0,
               militech: 0,
               petrochem: 0,
               biotechnica: 0,
               eurospace: 0,
               sovspace: 0
             },
             vipMarketUnlocked: false
           };
         }
         if (version === 3) {
           return {
             ...persistedState,
             factionReputation: persistedState.factionReputation || {
               arasaka: 0,
               militech: 0,
               petrochem: 0,
               biotechnica: 0,
               eurospace: 0,
               sovspace: 0
             },
             vipMarketUnlocked: persistedState.vipMarketUnlocked || false
           };
         }
         return persistedState;
       }
     }
  )
);