import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const EARTH_LDLS = ['ldl_seattle', 'ldl_nightcity', 'ldl_chicago', 'ldl_ny', 'ldl_la', 'ldl_atlanta', 'ldl_detroitsu', 'ldl_boston', 'ldl_denver', 'ldl_houston', 'ldl_miami', 'ldl_phoenix', 'ldl_portland', 'ldl_sandiego', 'ldl_tampa', 'ldl_london', 'ldl_paris', 'ldl_berlin', 'ldl_rome', 'ldl_madrid', 'ldl_amsterdam', 'ldl_stockholm', 'ldl_vienna', 'ldl_prague', 'ldl_warsaw', 'ldl_helsinki', 'ldl_dublin', 'ldl_brussels', 'ldl_zurich', 'ldl_munich', 'ldl_milan', 'ldl_barcelona', 'ldl_lisbon', 'ldl_copenhagen', 'ldl_athens', 'ldl_bucharest', 'ldl_moscow', 'ldl_kiev', 'ldl_stpetersburg', 'ldl_minsk', 'ldl_istanbul', 'ldl_ankara', 'ldl_cairo', 'ldl_johannesburg', 'ldj_nairobi', 'ldl_lagos', 'ldl_kinshasa', 'ldl_luanda', 'ldl_addisababa', 'ldl_dakar', 'ldl_accra', 'ldl_tunis', 'ldl_algiers', 'ldl_casablanca', 'ldl_maputo', 'ldl_kampala', 'ldl_hongkong', 'ldl_tokyo', 'ldl_seoul', 'ldl_taipei', 'ldl_shanghai', 'ldl_beijing', 'ldl_mumbai', 'ldl_bangkok', 'ldl_manila', 'ldl_singapore', 'ldl_jakarta', 'ldl_kualalumpur', 'ldl_saigon', 'ldl_kolkata', 'ldl_delhi', 'ldl_bangalore', 'ldl_chennai', 'ldl_hyderabad', 'ldl_riyadh', 'ldl_tehran', 'ldl_dubai', 'ldl_abadan', 'ldl_baghdad', 'ldl_telaviv', 'ldl_kuwait', 'ldl_doha', 'ldl_bahrain', 'ldl_kyoto', 'ldl_osaka', 'ldl_nagoya', 'ldl_fukuoka', 'ldl_yokohama', 'ldl_hiroshima', 'ldl_sapporo', 'ldl_kobe'];

export const useRoutingStore = create(
  persist(
    (set, get) => ({
      currentLdl: null,
      routeHistory: [],
      traceDefense: 0,
      traceRisk: 0,

      netwatchPatrols: {},
      
      initPatrols: () => set((state) => {
        const patrolCount = 3 + Math.floor(state.traceRisk / 10);
        const patrols = {};
        const availableLdls = EARTH_LDLS.slice(0, 10);
        
        for (let i = 0; i < Math.min(patrolCount, 5); i++) {
          const ldlId = availableLdls[Math.floor(Math.random() * availableLdls.length)];
          patrols[ldlId] = { 
            isElite: Math.random() > 0.6,
            turnsActive: Math.floor(Math.random() * 10) + 1
          };
        }
        return { netwatchPatrols: patrols };
      }),

      movePatrols: () => set((state) => {
        const patrols = { ...state.netwatchPatrols };
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
        
        return { netwatchPatrols: patrols };
      }),

      hasPatrolAtLdl: (ldlId) => {
        const state = get();
        return !!state.netwatchPatrols[ldlId];
      },

      removePatrolAtLdl: (ldlId) => set((state) => {
        const patrols = { ...state.netwatchPatrols };
        delete patrols[ldlId];
        return { netwatchPatrols: patrols };
      }),

      setStartingLdl: (id) => set({
        currentLdl: id,
        routeHistory: [id],
        traceDefense: 0,
        traceRisk: 0
      }),

      jumpToLdl: (id, traceDefenseGain) => set((state) => {
        const hasPatrol = !!state.netwatchPatrols[id];
        
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
          traceDefense: state.traceDefense + traceDefenseGain
        };
      }),

      addTraceRisk: (amount) => set((state) => {
        // Penthouse gives -2 base trace risk (clean landline)
        const { useMeatspaceStore } = require('../store/meatspaceStore');
        const housingType = useMeatspaceStore.getState().housingType;
        const penthouseReduction = housingType === 'penthouse' ? 2 : 0;
        const finalAmount = Math.max(1, amount - penthouseReduction);
        return { traceRisk: state.traceRisk + finalAmount };
      }),

      reduceTraceDefense: (amount) => set((state) => ({
        traceDefense: Math.max(0, state.traceDefense - amount)
      })),

      reduceTraceRisk: (amount) => set((state) => ({
        traceRisk: Math.max(0, state.traceRisk - amount)
      })),

      resetRoute: () => set({ currentLdl: null, routeHistory: [], traceDefense: 0, traceRisk: 0 })
    }),
    {
      name: 'routing-storage',
      version: 1,
      partialize: (state) => ({
        currentLdl: state.currentLdl,
        routeHistory: state.routeHistory,
        traceDefense: state.traceDefense,
        traceRisk: state.traceRisk,
        netwatchPatrols: state.netwatchPatrols
      })
    }
  )
);