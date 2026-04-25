import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LDL_DATABASE } from '../data/ldlDatabase';

const CORPS = ['Arasaka', 'Militech', 'Petrochem', 'Biotechnica', 'Kang Tao', 'Zetatech', 'Orbital Air'];
const JOB_TYPES = ['Extract R&D Data', 'Sabotage HR Records', 'Steal Financial Ledgers', 'Plant Blackmail Virus', 'Wipe Security Logs'];

export const useMissionStore = create(
  persist(
    (set) => ({
      availableJobs: [],
      activeJob: null,
      payloadSecured: false,

      generateJobs: () => {
        const ldlKeys = Object.keys(LDL_DATABASE);
        const newJobs = Array.from({ length: 3 }).map((_, i) => {
          const targetLdl = ldlKeys[Math.floor(Math.random() * ldlKeys.length)];
          const corp = CORPS[Math.floor(Math.random() * CORPS.length)];
          const type = JOB_TYPES[Math.floor(Math.random() * JOB_TYPES.length)];
          
          // Harder Dataforts (Deep Space) pay exponentially more
          const basePayout = LDL_DATABASE[targetLdl].sec * 800;
          const payout = basePayout + Math.floor(Math.random() * 1000);

          return {
            id: `job_${Date.now()}_${i}`,
            title: `[${corp}] ${type}`,
            targetLdl: targetLdl,
            targetLdlName: LDL_DATABASE[targetLdl].name,
            payout: payout,
            secLevel: LDL_DATABASE[targetLdl].sec
          };
        });
        set({ availableJobs: newJobs });
      },

      acceptJob: (job) => set({ activeJob: job, payloadSecured: false }),
      securePayload: () => set({ payloadSecured: true }),
      clearJob: () => set({ activeJob: null, payloadSecured: false }),
      abandonJob: () => set({ activeJob: null, payloadSecured: false })
    }),
    {
      name: 'mission-storage'
    }
  )
);