import { useState, useMemo } from 'react';
import { useMeatspaceStore } from '../store/meatspaceStore';
import { useMissionStore } from '../store/missionStore';
import { useTerminalStore } from '../store/terminalStore';
import { sfx } from '../utils/sfx';
import type { FixerData, Job } from '../types/game.types';

const FIXERS: FixerData[] = [
  { id: 'yakuza', name: 'Yakuza Boss', faction: 'kurokawa', color: 'text-red-400', bg: 'bg-red-900/20', border: 'border-red-500', desc: 'Kurokawa Corp loyalists. High-risk, high-reward contracts.' },
  { id: 'militech_rep', name: 'Militech Liaison', faction: 'militech', color: 'text-green-400', bg: 'bg-green-900/20', border: 'border-green-500', desc: 'Military-grade operations. Permanent damage contracts.' },
  { id: 'nomad', name: 'Nomad Outcast', faction: 'somachem', color: 'text-yellow-400', bg: 'bg-yellow-900/20', border: 'border-yellow-500', desc: 'Independent runner. Information brokering specialist.' },
  { id: 'biotech', name: 'Bio-Mercenary', faction: 'biotechnica', color: 'text-purple-400', bg: 'bg-purple-900/20', border: 'border-purple-500', desc: 'Biotechnica specialist. Heist-focused contracts.' },
  { id: 'euro', name: 'Eurospace Broker', faction: 'eurospace', color: 'text-blue-400', bg: 'bg-blue-900/20', border: 'border-blue-500', desc: 'Orbital specialist. Deep space datafort expertise.' },
  { id: 'sov', name: 'SovSpace Handler', faction: 'sovspace', color: 'text-gray-400', bg: 'bg-gray-900/20', border: 'border-gray-500', desc: 'Luna/Mars specialist. Harsh environment bonuses.' }
];

export default function FixerPanel({ onClose }: { onClose: () => void }) {
  const { factionReputation } = useMeatspaceStore();
  const { availableJobs, acceptJob } = useMissionStore();
  const [selectedFixer, setSelectedFixer] = useState<FixerData | null>(null);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-cyan-500 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-cyan-400 text-xl font-bold">[ FACTION FIXERS ]</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">[X]</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {FIXERS.map(fixer => {
            const rep = factionReputation[fixer.faction] || 0;
            const loyalty = rep >= 50 ? 'MAX' : rep >= 30 ? 'HIGH' : rep >= 10 ? 'MED' : rep >= 0 ? 'LOW' : 'HOSTILE';
            return (
              <div key={fixer.id} onClick={() => setSelectedFixer(fixer)}
                className={`border p-3 rounded cursor-pointer transition-all ${selectedFixer?.id === fixer.id ? 'ring-2 ring-cyan-500' : ''} ${fixer.border} ${fixer.bg}`}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className={`font-bold text-sm ${fixer.color}`}>{fixer.name}</h3>
                  <span className={`text-[10px] px-2 py-1 rounded ${rep >= 0 ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
                    {loyalty} ({rep})
                  </span>
                </div>
                <p className="text-gray-400 text-xs">{fixer.desc}</p>
                {rep >= 50 && (
                  <div className="mt-2 text-xs text-yellow-400 font-bold">[*] VIP ACCESS UNLOCKED</div>
                )}
              </div>
            );
          })}
        </div>

        {selectedFixer && (
          <div className="border border-gray-700 rounded p-4 bg-black/50">
            <h3 className={`font-bold mb-2 ${selectedFixer.color}`}>{selectedFixer.name} - Contracts</h3>
            <div className="space-y-2">
              <FixerContracts selectedFixer={selectedFixer} availableJobs={availableJobs} acceptJob={acceptJob} />
            </div>
            <div className="mt-4 border-t border-gray-700 pt-3">
              <h4 className="text-yellow-400 text-xs font-bold mb-2">Information Brokering</h4>
              <p className="text-gray-400 text-[10px] mb-2">Sell extracted files to this fixer. Changes faction reputations.</p>
              <button onClick={() => {
                if (!selectedFixer) return;
                const faction = selectedFixer.faction;
                useMeatspaceStore.getState().updateFactionRep(faction, -5);
                useMeatspaceStore.getState().updateFactionRep('kurokawa', 10);
                sfx.click();
                useTerminalStore.getState().addLog(`> GREY FILE BROKERED TO ${selectedFixer.name.toUpperCase()}. ${faction.toUpperCase()} REP -5, KUROKAWA CORP REP +10.`);
              }}
                className="bg-yellow-900 hover:bg-yellow-800 text-yellow-400 px-3 py-1 rounded text-[10px]">
                BROKER SAMPLE FILE
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const isJobMatch = (job: Job, fixer: FixerData): boolean => {
  if (job.targetLdlName.includes(fixer.faction)) return true;
  let hash = 0;
  const str = `${job.id}-${fixer.name}`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return (hash & 1) === 0;
};

function FixerContracts({ selectedFixer, availableJobs, acceptJob }: { selectedFixer: FixerData; availableJobs: Job[]; acceptJob: (job: Job) => void }) {
  const jobs = useMemo(
    () => availableJobs.filter(j => isJobMatch(j, selectedFixer)).slice(0, 3),
    [availableJobs, selectedFixer]
  );
  return (
    <>
      {jobs.map(job => (
        <div key={job.id} className="border border-gray-600 p-2 rounded text-xs">
          <div className="font-bold text-white">{job.title}</div>
          <div className="text-gray-400">Target: {job.targetLdlName} | Payout: {job.payout} cr</div>
          <button onClick={() => { sfx.click(); acceptJob(job); }}
            className="mt-2 bg-cyan-700 hover:bg-cyan-600 px-3 py-1 rounded text-white text-[10px]">
            ACCEPT
          </button>
        </div>
      ))}
    </>
  );
}
