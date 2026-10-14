import type { TargetLocation, ComputedLagPenalties, LagHardwareState } from "../shared/multiplayerTypes";
import { calculateAuthoritativeLagPenalties } from "../shared/lagCalculator";
import { useCyberdeckStore } from "./cyberdeckStore";
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useMeatspaceStore } from './meatspaceStore';

const EARTH_LDLS = ['ldl_seattle', 'ldl_nightcity', 'ldl_chicago', 'ldl_ny', 'ldl_la', 'ldl_atlanta', 'ldl_detroit', 'ldl_boston', 'ldl_denver', 'ldl_houston', 'ldl_miami', 'ldl_phoenix', 'ldl_portland', 'ldl_sandiego', 'ldl_tampa', 'ldl_london', 'ldl_paris', 'ldl_berlin', 'ldl_rome', 'ldl_madrid', 'ldl_amsterdam', 'ldl_stockholm', 'ldl_vienna', 'ldl_prague', 'ldl_warsaw', 'ldl_helsinki', 'ldl_dublin', 'ldl_brussels', 'ldl_zurich', 'ldl_munich', 'ldl_milan', 'ldl_barcelona', 'ldl_lisbon', 'ldl_copenhagen', 'ldl_athens', 'ldl_bucharest', 'ldl_moscow', 'ldl_kiev', 'ldl_stpetersburg', 'ldl_minsk', 'ldl_istanbul', 'ldl_ankara', 'ldl_cairo', 'ldl_johannesburg', 'ldl_nairobi', 'ldl_lagos', 'ldl_kinshasa', 'ldl_luanda', 'ldl_addisababa', 'ldl_dakar', 'ldl_accra', 'ldl_tunis', 'ldl_algiers', 'ldl_casablanca', 'ldl_maputo', 'ldl_kampala', 'ldl_hongkong', 'ldl_tokyo', 'ldl_seoul', 'ldl_taipei', 'ldl_shanghai', 'ldl_beijing', 'ldl_mumbai', 'ldl_bangkok', 'ldl_manila', 'ldl_singapore', 'ldl_jakarta', 'ldl_kualalumpur', 'ldl_saigon', 'ldl_kolkata', 'ldl_delhi', 'ldl_bangalore', 'ldl_chennai', 'ldl_hyderabad', 'ldl_riyadh', 'ldl_tehran', 'ldl_dubai', 'ldl_abadan', 'ldl_baghdad', 'ldl_telaviv', 'ldl_kuwait', 'ldl_doha', 'ldl_bahrain', 'ldl_kyoto', 'ldl_osaka', 'ldl_nagoya', 'ldl_fukuoka', 'ldl_yokohama', 'ldl_hiroshima', 'ldl_sapporo', 'ldl_kobe'];

interface RoutingState {
  cyclerOpen: boolean;
  nextCyclerMins: number;
  currentLdl: string | null;
  routeHistory: string[];
  traceDefense: number;
  traceRisk: number;
  gridsecPatrols: Record<string, { isElite: boolean; turnsActive: number }>;
  interceptionLdl: string | null;
  isAldrinCyclerActive: boolean;
  completedOrbitalUplink: boolean;

  rollAldrinCycler: () => boolean;
  evaluateRoutePenalties: (target: TargetLocation) => ComputedLagPenalties;

  initPatrols: () => void;
  clearInterception: () => void;
  movePatrols: () => void;
  hasPatrolAtLdl: (ldlId: string) => boolean;
  removePatrolAtLdl: (ldlId: string) => void;
  setStartingLdl: (id: string) => void;
  jumpToLdl: (id: string, traceDefenseGain: number) => void;
  addTraceRisk: (amount: number) => void;
  addTraceDefense: (amount: number) => void;
  setCycler: (open: boolean, mins?: number) => void;
  tickCycler: () => void;
  reduceTraceDefense: (amount: number) => void;
  reduceTraceRisk: (amount: number) => void;
  resetRoute: () => void;
}

export const useRoutingStore = create<RoutingState>()(
  persist(
    (set, get) => ({
      cyclerOpen: true,
      nextCyclerMins: 0,
      currentLdl: null as string | null,
      routeHistory: [] as string[],
      traceDefense: 0,
      traceRisk: 0,

      gridsecPatrols: {},

      interceptionLdl: null as string | null,
      isAldrinCyclerActive: false,
      completedOrbitalUplink: false,

      rollAldrinCycler: () => {
        const isActive = Math.random() < 0.5;
        set({ isAldrinCyclerActive: isActive });
        return isActive;
      },

      evaluateRoutePenalties: (target: TargetLocation) => {
        const meat = useMeatspaceStore.getState();
        const deck = useCyberdeckStore.getState();
        const routing = get();
        const hardware: LagHardwareState = {
          hasLagSwitch: meat.hasLagSwitch ?? false,
          lagToggleMode: meat.lagToggleMode ?? "earth",
          hasTightbeamMaser: deck.hasTightbeamMaser ?? false,
          hasInitiativeBuffer: deck.hasInitiativeBuffer ?? false,
          hasInterfaceBuffer: deck.hasInterfaceBuffer ?? false,
          isAldrinCyclerActive: routing.isAldrinCyclerActive ?? false,
          completedOrbitalUplink: routing.completedOrbitalUplink ?? false,
        };
        return calculateAuthoritativeLagPenalties(target, hardware);
      },

      clearInterception: () => set({ interceptionLdl: null }),
      
      initPatrols: () => set((state: RoutingState) => {
        const patrolCount = 3 + Math.floor(state.traceRisk / 10);
        const patrols: Record<string, { isElite: boolean; turnsActive: number }> = {};
        const availableLdls = EARTH_LDLS.slice(0, 10);
        
        for (let i = 0; i < Math.min(patrolCount, 5); i++) {
          const ldlId = availableLdls[Math.floor(Math.random() * availableLdls.length)];
          patrols[ldlId] = { 
            isElite: Math.random() > 0.6,
            turnsActive: Math.floor(Math.random() * 10) + 1
          };
        }
        return { gridsecPatrols: patrols };
      }),

      movePatrols: () => set((state: RoutingState) => {
        const patrols = { ...state.gridsecPatrols };
        const patrolIds = Object.keys(patrols);
        
        patrolIds.forEach(id => {
          patrols[id].turnsActive += 1;
          
          const randomMove = Math.floor(Math.random() * EARTH_LDLS.length);
          const newLdl = EARTH_LDLS[randomMove];
          delete patrols[id];
          patrols[newLdl] = { isElite: patrols[id]?.isElite || Math.random() > 0.6, turnsActive: 1 };
        });
        
        const patrolCount = 3 + Math.floor(state.traceRisk / 10);
        while (Object.keys(patrols).length < Math.min(patrolCount, 5)) {
          const ldlId = EARTH_LDLS[Math.floor(Math.random() * EARTH_LDLS.length)];
          if (!patrols[ldlId]) {
            patrols[ldlId] = { isElite: Math.random() > 0.6, turnsActive: 1 };
          }
        }
        
        return { gridsecPatrols: patrols };
      }),

      hasPatrolAtLdl: (ldlId: string): boolean => {
        const state = get();
        return !!state.gridsecPatrols[ldlId];
      },

      removePatrolAtLdl: (ldlId: string) => set((state: RoutingState) => {
        const patrols = { ...state.gridsecPatrols };
        delete patrols[ldlId];
        return { gridsecPatrols: patrols };
      }),

      setStartingLdl: (id: string) => set((state: RoutingState) => {
        const patch: Partial<RoutingState> = {
          currentLdl: id,
          routeHistory: [id],
          traceDefense: 0,
          traceRisk: 0
        };
        if (Object.keys(state.gridsecPatrols).length === 0) {
          const patrolCount = 3;
          const patrols: Record<string, { isElite: boolean; turnsActive: number }> = {};
          const availableLdls = EARTH_LDLS.slice(0, 10);
          for (let i = 0; i < patrolCount; i++) {
            const ldlId = availableLdls[Math.floor(Math.random() * availableLdls.length)];
            patrols[ldlId] = {
              isElite: Math.random() > 0.6,
              turnsActive: Math.floor(Math.random() * 10) + 1
            };
          }
          patch.gridsecPatrols = patrols;
        }
        return patch;
      }),

      jumpToLdl: (id: string, traceDefenseGain: number) => set((state: RoutingState) => {
        const hasPatrol = !!state.gridsecPatrols[id];
        
        if (hasPatrol) {
          return { 
            currentLdl: id, 
            routeHistory: [...state.routeHistory, id],
            interceptionLdl: id
          };
        }
        
        return {
          currentLdl: id,
          routeHistory: [...state.routeHistory, id],
          traceDefense: state.traceDefense + traceDefenseGain,
          interceptionLdl: null
        };
      }),

      addTraceRisk: (amount: number) => set((state: RoutingState) => {
        // Penthouse gives -2 base trace risk (clean landline)
        const housingType = useMeatspaceStore.getState().housingType;
        const penthouseReduction = housingType === 'penthouse' ? 2 : 0;
        const finalAmount = Math.max(1, amount - penthouseReduction);
        return { traceRisk: state.traceRisk + finalAmount };
      }),

      addTraceDefense: (amount: number) => set((state: RoutingState) => ({
        traceDefense: state.traceDefense + amount
      })),

      reduceTraceDefense: (amount: number) => set((state: RoutingState) => ({
        traceDefense: Math.max(0, state.traceDefense - amount)
      })),

      reduceTraceRisk: (amount: number) => set((state: RoutingState) => ({
        traceRisk: Math.max(0, state.traceRisk - amount)
      })),

      setCycler: (open, mins = 0) => set({ cyclerOpen: open, nextCyclerMins: mins }),
      tickCycler: () => set((state) => {
        if (state.cyclerOpen) return {};
        const mins = Math.max(0, state.nextCyclerMins - 1);
        return mins <= 0 ? { nextCyclerMins: 0, cyclerOpen: true } : { nextCyclerMins: mins };
      }),
      resetRoute: () => set({ currentLdl: null, routeHistory: [], traceDefense: 0, traceRisk: 0 })
    }),
    {
      name: 'routing-storage',
      version: 1,
      partialize: (state: RoutingState) => ({
        currentLdl: state.currentLdl,
        routeHistory: state.routeHistory,
        traceDefense: state.traceDefense,
        traceRisk: state.traceRisk,
        cyclerOpen: state.cyclerOpen,
        nextCyclerMins: state.nextCyclerMins,
        gridsecPatrols: state.gridsecPatrols
      })
    }
  )
);
