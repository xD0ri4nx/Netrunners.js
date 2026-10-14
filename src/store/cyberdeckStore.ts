import type { DaemonPayloadState, IdentityUtilityProgram, IdentityUtilityType } from "../shared/multiplayerTypes";
import { createCuckooBirdDaemon, createProteusDaemon, IDENTITY_UTILITY_CATALOG } from "../shared/daemonCatalog";
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useMeatspaceStore } from './meatspaceStore';
import type { Program } from '../types/game.types';

interface NeuralCyberware {
  neuralProcessor: boolean;
  chipwareSocket: boolean;
  brainWall: boolean;
  psychosisRisk: number;
}

interface Peripherals {
  [key: string]: boolean;
  chipreader: boolean;
  hardened: boolean;
  videoboard: boolean;
  optical: boolean;
}

interface TuningHistoryEntry {
  type: string;
  stat: string;
  bonus: number;
}

interface EffectiveDeckStats {
  speed: number;
  maxMu: number;
  dataWalls: number;
  deckModel: string | null;
  deckType: string;
}

interface TuneResult {
  success: boolean;
  fumble?: boolean;
  roll?: number;
  total?: number;
  message: string;
}

interface CyberdeckState {
  deckModel: string | null;
  deckType: string;
  maxMu: number;
  usedMu: number;
  speed: number;
  dataWalls: number;
  coprocessors: number;
  isCellular: boolean;
  deckHealth: number;
  maxDeckHealth: number;
  deckCrashes: number;
  tuningCount: number;
  tuningHistory: TuningHistoryEntry[];
  neuralCyberware: NeuralCyberware;
  peripherals: Peripherals;
  chipSlot: string | null;
  chipProgram: Program | null;
  programs: Program[];
  activeAction: Program | null;
  activePassives: Program[];
  funds: number;
  combatBonus: number;
  ripple: number;
  hasTightbeamMaser: boolean;
  hasInitiativeBuffer: boolean;
  hasInterfaceBuffer: boolean;
  ownedUtilities: IdentityUtilityProgram[];
  compiledDaemons: DaemonPayloadState[];

  buyTightbeamMaser: () => { success: boolean; message: string };
  buyInitiativeBuffer: () => { success: boolean; message: string };
  buyInterfaceBuffer: () => { success: boolean; message: string };
  buyIdentityUtility: (type: IdentityUtilityType) => { success: boolean; message: string };
  toggleIdentityUtility: (type: IdentityUtilityType) => { success: boolean; message: string };
  acquireDaemon: (preset: "cuckoo" | "proteus", method: "buy" | "compile") => { success: boolean; message: string };

  toggleProgram: (id: string) => void;
  addProgram: (program: Program) => void;
  removeProgram: (programId: string) => void;
  getProgramMuCost: (difficulty: number) => number;
  upgradeMu: (amount: number) => void;
  equipDeck: (model: string, mu: number, speed: number, dataWalls: number) => void;
  equipBrainwareDeck: (model: string, mu: number, speed: number) => void;
  installNeuralCyberware: (type: string) => void;
  increasePsychosisRisk: (amount: number) => void;
  addSpeed: () => void;
  addDataWalls: () => void;
  addRipple: () => void;
  addCoprocessor: () => void;
  setCellular: (isCellular: boolean) => void;
  damageDeck: (amount: number) => void;
  repairDeck: (amount: number) => void;
  resetDeckCrashes: () => void;
  reduceMaxMu: (amount: number) => void;
  installPeripheral: (type: string) => void;
  removePeripheral: (type: string) => void;
  equipChip: (program: Program) => void;
  consumeChip: () => void;
  hasPeripheral: (type: string) => boolean;
  getEffectiveAction: () => Program | null;
  getEffectiveDeckStats: () => EffectiveDeckStats;
  resetDeck: () => void;
  getTuningLimit: () => number;
  canTune: () => boolean;
  getTuningSuccessChance: (difficulty: number) => number;
  performTune: (tuneType: string) => TuneResult;
  brickDeck: () => void;
}

export const useCyberdeckStore = create<CyberdeckState>()(
  persist(
    (set, get) => ({
      deckModel: 'Z-Tech Paraline',
      deckType: 'traditional',
      maxMu: 5,
      usedMu: 0,
      speed: 1,
      dataWalls: 3,
      coprocessors: 0,
      isCellular: false,
      deckHealth: 100,
      maxDeckHealth: 100,
      deckCrashes: 0,
      tuningCount: 0,
      tuningHistory: [] as TuningHistoryEntry[],
      neuralCyberware: {
        neuralProcessor: false,
        chipwareSocket: false,
        brainWall: false,
        psychosisRisk: 0
      },

      peripherals: {
        chipreader: false,
        hardened: false,
        videoboard: false,
        optical: false
      },

      chipSlot: null as string | null,
      chipProgram: null as Program | null,

      programs: [
        { id: 'prog_decrypt', name: 'Decrypt v1.0', type: 'utility', strength: 4, difficulty: 14, muCost: 1, marketValue: 140, isCustom: false },
        { id: 'prog_sword', name: 'Sword', type: 'anti-ice', strength: 4, difficulty: 14, muCost: 1, marketValue: 350, isCustom: false }
      ],

      activeAction: null as Program | null,
      activePassives: [] as Program[],
      funds: 0,
      combatBonus: 0,
      ripple: 0,
      hasTightbeamMaser: false,
      hasInitiativeBuffer: false,
      hasInterfaceBuffer: false,
      ownedUtilities: [] as IdentityUtilityProgram[],
      compiledDaemons: [] as DaemonPayloadState[],

      toggleProgram: (id: string) => set((state: CyberdeckState) => {
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

      addProgram: (program: Program) => set((state: CyberdeckState) => {
        const muCost = program.muCost || 1;
        if (state.usedMu + muCost <= state.maxMu) {
          return {
            programs: [...state.programs, program],
            usedMu: state.usedMu + muCost
          };
        }
        return state;
      }),

      removeProgram: (programId: string) => set((state: CyberdeckState) => {
        const program = state.programs.find(p => p.id === programId);
        if (!program) return state;
        const muCost = program.muCost || 1;
        return {
          programs: state.programs.filter(p => p.id !== programId),
          usedMu: Math.max(0, state.usedMu - muCost),
          activeAction: state.activeAction?.id === programId ? null : state.activeAction,
          activePassives: state.activePassives.filter(p => p.id !== programId)
        };
      }),

      getProgramMuCost: (difficulty: number): number => {
        if (difficulty <= 15) return 1;
        if (difficulty <= 20) return 2;
        if (difficulty <= 25) return 3;
        if (difficulty <= 30) return 4;
        if (difficulty <= 35) return 5;
        if (difficulty <= 40) return 6;
        return 7;
      },

      upgradeMu: (amount: number) => set((state: CyberdeckState) => ({
        maxMu: state.maxMu + amount
      })),

      equipDeck: (model: string, mu: number, speed: number, dataWalls: number) => set({
        deckModel: model,
        deckType: 'traditional',
        maxMu: mu,
        usedMu: 0,
        speed: speed,
        dataWalls: dataWalls
      }),
      equipBrainwareDeck: (model: string, mu: number, speed: number) => set({
        deckModel: model,
        deckType: 'brainware',
        maxMu: mu,
        usedMu: 0,
        speed: speed,
        dataWalls: 0
      }),
      installNeuralCyberware: (type: string) => set((state: CyberdeckState) => ({
        neuralCyberware: {
          neuralProcessor: false,
          chipwareSocket: false,
          brainWall: false,
          psychosisRisk: 0,
          ...state.neuralCyberware,
          [type]: true
        }
      })),
      increasePsychosisRisk: (amount: number) => set((state: CyberdeckState) => ({
        neuralCyberware: {
          ...state.neuralCyberware,
          psychosisRisk: state.neuralCyberware.psychosisRisk + amount
        }
      })),

      addSpeed: () => set((state: CyberdeckState) => ({
        speed: state.speed + 1
      })),

      addDataWalls: () => set((state: CyberdeckState) => ({
        dataWalls: state.dataWalls + 1
      })),

      addRipple: () => set((state: CyberdeckState) => ({
        ripple: (state.ripple || 0) + 1
      })),

      addCoprocessor: () => set((state: CyberdeckState) => ({
        coprocessors: state.coprocessors + 1
      })),

      setCellular: (isCellular: boolean) => set({ isCellular }),

      damageDeck: (amount: number) => set((state: CyberdeckState) => ({
        deckHealth: Math.max(0, state.deckHealth - amount),
        deckCrashes: state.deckCrashes + 1
      })),

      repairDeck: (amount: number) => set((state: CyberdeckState) => ({
        deckHealth: Math.min(state.maxDeckHealth, state.deckHealth + amount)
      })),

      resetDeckCrashes: () => set({ deckCrashes: 0 }),

      reduceMaxMu: (amount: number) => set((state: CyberdeckState) => ({
        maxMu: Math.max(1, state.maxMu - amount)
      })),

      installPeripheral: (type: string) => set((state: CyberdeckState) => ({
        peripherals: { ...state.peripherals, [type]: true }
      })),

      removePeripheral: (type: string) => set((state: CyberdeckState) => ({
        peripherals: { ...state.peripherals, [type]: false }
      })),

      equipChip: (program: Program) => set({ chipProgram: program }),

      consumeChip: () => set({ chipProgram: null }),

      hasPeripheral: (type: string): boolean => {
        const state = get();
        return state.peripherals[type] || false;
      },

      getEffectiveAction: (): Program | null => {
        const state = get();
        return state.chipProgram || state.activeAction;
      },

      getEffectiveDeckStats: (): EffectiveDeckStats => {
        const state = get();
        const meatspaceState = useMeatspaceStore.getState();
        
        if (meatspaceState.crecheInstalled) {
          return {
            speed: state.speed + 1,
            maxMu: 12,
            dataWalls: state.dataWalls + 4,
            deckModel: 'Data Creche',
            deckType: 'creche'
          };
        }
        
        return {
          speed: state.speed,
          maxMu: state.maxMu,
          dataWalls: state.dataWalls,
          deckModel: state.deckModel,
          deckType: state.deckType
        };
      },

      resetDeck: () => set({
        deckModel: 'Z-Tech Paraline',
        deckType: 'traditional',
        maxMu: 5,
        usedMu: 0,
        speed: 1,
        dataWalls: 3,
        coprocessors: 0,
        isCellular: false,
        deckHealth: 100,
        maxDeckHealth: 100,
        deckCrashes: 0,
        neuralCyberware: {
          neuralProcessor: false,
          chipwareSocket: false,
          brainWall: false,
          psychosisRisk: 0
        },
        peripherals: {
          chipreader: false,
          hardened: false,
          videoboard: false,
          optical: false
        },
        chipSlot: null as string | null,
        chipProgram: null as Program | null,
        programs: [
          { id: 'prog_decrypt', name: 'Decrypt v1.0', type: 'utility', strength: 4, difficulty: 14, muCost: 1, marketValue: 140, isCustom: false },
          { id: 'prog_sword', name: 'Sword', type: 'anti-ice', strength: 4, difficulty: 14, muCost: 1, marketValue: 350, isCustom: false }
        ],
        activeAction: null as Program | null,
        activePassives: [] as Program[],
        tuningCount: 0,
        tuningHistory: [] as TuningHistoryEntry[]
      }),

      getTuningLimit: (): number => {
        const state = get();
        const deckTier = state.deckType === 'traditional' ? 4 : state.deckType === 'brainware' ? 3 : 2;
        return 2 + Math.floor(deckTier / 2);
      },

      canTune: (): boolean => {
        const state = get();
        return state.tuningCount < state.getTuningLimit();
      },

      getTuningSuccessChance: (difficulty: number): number => {
        const tech = useMeatspaceStore.getState().tech || 5;
        const cyberdeckDesign = useMeatspaceStore.getState().skills?.cyberdeckDesign || 1;
        const total = tech + cyberdeckDesign;
        const successChance = Math.max(0, Math.min(90, (total * 5 + 5) - difficulty + 5));
        return successChance;
      },

      performTune: (tuneType: string): TuneResult => {
        const state = get();
        const tech = useMeatspaceStore.getState().tech || 5;
        const cyberdeckDesign = useMeatspaceStore.getState().skills?.cyberdeckDesign || 1;
        const roll = Math.floor(Math.random() * 10) + 1;
        const total = roll + tech + cyberdeckDesign;
        
        const tuneConfigs: Record<string, { difficulty: number; cost: number; stat: string; bonus: number; name: string }> = {
          speed: { difficulty: 20, cost: 1000, stat: 'speed', bonus: 1, name: 'OVERCLOCK SPEED' },
          mu: { difficulty: 25, cost: 500, stat: 'maxMu', bonus: 2, name: 'EXPAND MU' },
          datawalls: { difficulty: 22, cost: 750, stat: 'dataWalls', bonus: 1, name: 'HARDWIRE DEFENSE' }
        };
        
        const config = tuneConfigs[tuneType];
        if (!config) return { success: false, message: 'INVALID TUNE TYPE' };
        
        if (state.funds < config.cost) return { success: false, message: `INSUFFICIENT FUNDS (${config.cost} cr)` };
        
        if (!state.canTune()) return { success: false, message: 'TUNING LIMIT REACHED' };

        if (roll === 1) {
          const fumbleRoll = Math.floor(Math.random() * 10) + 1;
          const result: TuneResult = { success: false, fumble: true, roll, total, message: '' };
          
          if (fumbleRoll <= 4) {
            result.message = `FUMBLE! SCORCHED TRACES. ${config.cost} cr WASTED.`;
          } else if (fumbleRoll <= 7) {
            const damage = 40;
            state.damageDeck(damage);
            result.message = `FUMBLE! BLOWN CAPACITORS. DECK -${damage}% HEALTH.`;
          } else if (fumbleRoll <= 9) {
            state.reduceMaxMu(1);
            result.message = `FUMBLE! MOTHERBOARD WARP. -1 MAX MU.`;
          } else {
            state.brickDeck();
            result.message = `FUMBLE! TOTAL BRICK. DECK DESTROYED.`;
          }
          return result;
        }
        
        if (total >= config.difficulty) {
          const currentStat = state[config.stat as keyof CyberdeckState] as number;
          const newValue = (currentStat || 0) + config.bonus;
          set({
            [config.stat]: newValue,
            tuningCount: state.tuningCount + 1,
            tuningHistory: [...state.tuningHistory, { type: tuneType, stat: config.stat, bonus: config.bonus }]
          });
          return { success: true, roll, total, message: `${config.name} SUCCESS! +${config.bonus} ${config.stat.toUpperCase()}.` };
        }
        
        return { success: false, roll, total, message: `${config.name} FAILED (${total} < ${config.difficulty}). ${config.cost} cr WASTED.` };
      },

      buyTightbeamMaser: () => {
        const meatspace = useMeatspaceStore.getState();
        if (get().hasTightbeamMaser) return { success: false, message: "TIGHTBEAM MASER ARRAY ALREADY INSTALLED." };
        if (meatspace.funds < 1500) return { success: false, message: "INSUFFICIENT FUNDS (1,500 cr REQUIRED)." };
        meatspace.deductFunds(1500);
        set({ hasTightbeamMaser: true });
        return { success: true, message: "TIGHTBEAM MASER ARRAY INSTALLED. DEEP SPACE UPLINK ESTABLISHED." };
      },

      buyInitiativeBuffer: () => {
        const meatspace = useMeatspaceStore.getState();
        if (get().hasInitiativeBuffer) return { success: false, message: "INITIATIVE TIME-LAG BUFFER ALREADY INSTALLED." };
        if (meatspace.funds < 350) return { success: false, message: "INSUFFICIENT FUNDS (350 cr REQUIRED)." };
        meatspace.deductFunds(350);
        set({ hasInitiativeBuffer: true });
        return { success: true, message: "TIME-LAG BUFFER (INITIATIVE) INSTALLED. LIGHT-LAG REF PENALTY CAPPED AT -2." };
      },

      buyInterfaceBuffer: () => {
        const meatspace = useMeatspaceStore.getState();
        if (get().hasInterfaceBuffer) return { success: false, message: "INTERFACE TIME-LAG BUFFER ALREADY INSTALLED." };
        if (meatspace.funds < 350) return { success: false, message: "INSUFFICIENT FUNDS (350 cr REQUIRED)." };
        meatspace.deductFunds(350);
        set({ hasInterfaceBuffer: true });
        return { success: true, message: "TIME-LAG BUFFER (INTERFACE) INSTALLED. LIGHT-LAG INTF PENALTY CAPPED AT -2." };
      },

      buyIdentityUtility: (type: IdentityUtilityType) => {
        const meatspace = useMeatspaceStore.getState();
        const catalogItem = IDENTITY_UTILITY_CATALOG.find((u) => u.id === type);
        if (!catalogItem) return { success: false, message: "UTILITY NOT FOUND IN CATALOG." };
        const state = get();
        if (state.ownedUtilities.some((u) => u.id === type)) {
          return { success: false, message: "IDENTITY UTILITY ALREADY OWNED." };
        }
        if (state.usedMu + catalogItem.muCost > state.maxMu) {
          return { success: false, message: "INSUFFICIENT MEMORY UNITS (" + catalogItem.muCost + " MU REQUIRED)." };
        }
        if (meatspace.funds < catalogItem.creditCost) {
          return { success: false, message: "INSUFFICIENT FUNDS (" + catalogItem.creditCost + " cr REQUIRED)." };
        }
        meatspace.deductFunds(catalogItem.creditCost);
        set({
          ownedUtilities: [...state.ownedUtilities, { ...catalogItem, active: false }],
          usedMu: state.usedMu + catalogItem.muCost,
        });
        return { success: true, message: catalogItem.name.toUpperCase() + " UTILITY ACQUIRED (" + catalogItem.muCost + " MU)." };
      },

      toggleIdentityUtility: (type: IdentityUtilityType) => {
        const state = get();
        const existing = state.ownedUtilities.find((u) => u.id === type);
        if (!existing) return { success: false, message: "UTILITY NOT INSTALLED." };
        const newActive = !existing.active;
        set({
          ownedUtilities: state.ownedUtilities.map((u) => (u.id === type ? { ...u, active: newActive } : u)),
        });
        return { success: true, message: existing.name.toUpperCase() + (newActive ? " ACTIVATED." : " DEACTIVATED.") };
      },

      acquireDaemon: (preset: "cuckoo" | "proteus", method: "buy" | "compile") => {
        const meatspace = useMeatspaceStore.getState();
        const state = get();
        const daemon = preset === "cuckoo" ? createCuckooBirdDaemon("player") : createProteusDaemon("player");
        if (method === "buy") {
          if (meatspace.funds < daemon.marketCost) {
            return { success: false, message: "INSUFFICIENT FUNDS (" + daemon.marketCost + " cr REQUIRED)." };
          }
          meatspace.deductFunds(daemon.marketCost);
          set({ compiledDaemons: [...state.compiledDaemons, daemon] });
          return { success: true, message: daemon.name.toUpperCase() + " PURCHASED FROM BLACK MARKET (" + daemon.marketCost + " cr)." };
        } else {
          set({ compiledDaemons: [...state.compiledDaemons, daemon] });
          return { success: true, message: daemon.name.toUpperCase() + " COMPILED TO DECK (" + daemon.difficulty + " DIFF, " + daemon.codingHours + "h)." };
        }
      },

      brickDeck: () => set({
        deckModel: null,
        deckHealth: 0,
        maxDeckHealth: 100,
        speed: 0,
        maxMu: 0,
        dataWalls: 0,
        programs: [],
        activeAction: null as Program | null,
        activePassives: [] as Program[],
        tuningCount: 0,
        tuningHistory: [] as TuningHistoryEntry[]
      })
    }),
    {
      name: 'cyberdeck-storage',
      version: 3,
      migrate: ((persistedState: unknown, version: number) => {
        const ps = persistedState as Record<string, unknown>;
        const v = version as number;
        if (v === 0 || v === 1) {
          return {
            ...(ps as object),
            deckType: 'traditional',
            neuralCyberware: {
              neuralProcessor: false,
              chipwareSocket: false,
              brainWall: false,
              psychosisRisk: 0
            },
            peripherals: {
              chipreader: false,
              hardened: false,
              videoboard: false,
              optical: false
            },
            chipSlot: null as string | null,
            chipProgram: null
          };
        }
        if (v === 2) {
          return {
            ...(ps as object),
            peripherals: {
              chipreader: false,
              hardened: false,
              videoboard: false,
              optical: false
            },
            chipSlot: null as string | null,
            chipProgram: null
          };
        }
        return ps;
      }) as unknown as (persistedState: unknown, version: number) => CyberdeckState,
    }
  )
);
