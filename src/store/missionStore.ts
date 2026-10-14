import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LDL_DATABASE } from '../data/ldlDatabase';
import type { Job } from '../types/game.types';

const CORPS = ['Kurokawa Corp', 'Militech', 'SomaChem', 'Biotechnica', 'Kang Tao', 'Z-Tech', 'Aether Orbital'];
const JOB_TYPES = ['Extract R&D Data', 'Sabotage HR Records', 'Steal Financial Ledgers', 'Plant Blackmail Virus', 'Wipe Security Logs'];
const HEIST_TYPES = ['Disable Security Grid', 'Blast Door Breach Support', 'Turret Override Protocol', 'Camera Loop Injection', 'Physical Extraction Cover'];

interface MissionState {
  availableJobs: Job[];
  activeJob: Job | null;
  payloadSecured: boolean;
  generateJobs: () => void;
  acceptJob: (job: Job) => void;
  securePayload: () => void;
  failPayload: () => void;
  clearJob: () => void;
  abandonJob: () => void;
  incrementObjectives: () => void;
  resetMissions: () => void;
}

export const useMissionStore = create<MissionState>()(
  persist(
    (set) => ({
      availableJobs: [] as Job[],
      activeJob: null as Job | null,
      payloadSecured: false,

      generateJobs: () => {
        const ldlKeys = Object.keys(LDL_DATABASE);
        const newJobs: Job[] = [];

        for (let i = 0; i < 3; i++) {
          const targetLdl = ldlKeys[Math.floor(Math.random() * ldlKeys.length)];
          const corp = CORPS[Math.floor(Math.random() * CORPS.length)];
          const isHeist = Math.random() < 0.3;

          if (isHeist) {
            const type = HEIST_TYPES[Math.floor(Math.random() * HEIST_TYPES.length)];
            const basePayout = LDL_DATABASE[targetLdl].sec * 1200;
            const payout = basePayout + Math.floor(Math.random() * 1500);
            const turnLimit = Math.floor(Math.random() * 10) + 25;

            newJobs.push({
              id: `job_${Date.now()}_${i}`,
              title: `[${corp}] PHYSICAL: ${type}`,
              targetLdl: targetLdl,
              targetLdlName: LDL_DATABASE[targetLdl].name,
              payout: payout,
              secLevel: LDL_DATABASE[targetLdl].sec,
              isHeist: true,
              turnLimit: turnLimit,
              objectivesCompleted: 0
            });
          } else {
            const type = JOB_TYPES[Math.floor(Math.random() * JOB_TYPES.length)];
            const basePayout = LDL_DATABASE[targetLdl].sec * 800;
            const payout = basePayout + Math.floor(Math.random() * 1000);

            newJobs.push({
              id: `job_${Date.now()}_${i}`,
              title: `[${corp}] ${type}`,
              targetLdl: targetLdl,
              targetLdlName: LDL_DATABASE[targetLdl].name,
              payout: payout,
              secLevel: LDL_DATABASE[targetLdl].sec,
              isHeist: false
            });
          }
        }
        set({ availableJobs: newJobs });
      },

      acceptJob: (job: Job) => set({ activeJob: job, payloadSecured: false }),
      securePayload: () => set({ payloadSecured: true }),
      failPayload: () => set({ activeJob: null, payloadSecured: false }),
      clearJob: () => set({ activeJob: null, payloadSecured: false }),
      abandonJob: () => set({ activeJob: null, payloadSecured: false }),
      incrementObjectives: () => set((state: MissionState) => ({
        activeJob: state.activeJob ? { ...state.activeJob, objectivesCompleted: (state.activeJob.objectivesCompleted || 0) + 1 } : null
      })),
      resetMissions: () => set({ availableJobs: [], activeJob: null, payloadSecured: false })
    }),
    {
      name: 'mission-storage'
    }
  )
);
