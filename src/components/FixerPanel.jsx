import { useState } from 'react';
import { useMeatspaceStore } from '../store/meatspaceStore';
import { useMissionStore } from '../store/missionStore';
import { sfx } from '../utils/sfx';

const FIXERS = [
  { id: 'yakuza', name: 'Yakuza Boss', faction: 'arasaka', color: 'text-red-400', bg: 'bg-red-900/20', border: 'border-red-500', desc: 'Arasaka loyalists. High-risk, high-reward contracts.' },
  { id: 'militech_rep', name: 'Militech Liaison', faction: 'militech', color: 'text-green-400', bg: 'bg-green-900/20', border: 'border-green-500', desc: 'Military-grade operations. Permanent damage contracts.' },
  { id: 'nomad', name: 'Nomad Outcast', faction: 'petrochem', color: 'text-yellow-400', bg: 'bg-yellow-900/20', border: 'border-yellow-500', desc: 'Independent runner. Information brokering specialist.' },
  { id: 'biotech', name: 'Bio-Mercenary', faction: 'biotechnica', color: 'text-purple-400', bg: 'bg-purple-900/20', border: 'border-purple-500', desc: 'Biotechnica specialist. Heist-focused contracts.' },
  { id: 'euro', name: 'Eurospace Broker', faction: 'eurospace', color: 'text-blue-400', bg: 'bg-blue-900/20', border: 'border-blue-500', desc: 'Orbital specialist. Deep space datafort expertise.' },
  { id: 'sov', name: 'SovSpace Handler', faction: 'sovspace', color: 'text-gray-400', bg: 'bg-gray-900/20', border: 'border-gray-500', desc: 'Luna/Mars specialist. Harsh environment bonuses.' }
];

export default function FixerPanel({ onClose }) {
  const { factionReputation, funds, deductFunds, addFunds } = useMeatspaceStore();
  const { availableJobs, acceptJob, activeJob } = useMissionStore();
  const [selectedFixer, setSelectedFixer] = useState(null);
  const [brokerFile, setBrokerFile] = useState(null);

  const handleBroker = (file) => {
    if (!file || !selectedFixer) return;
    const faction = selectedFixer.faction;
    const rep = factionReputation[faction] || 0;
    
    if (file.faction !== faction) {
      useMeatspaceStore.getState().updateFactionRep(faction, -5);
      useMeatspaceStore.getState().updateFactionRep(file.faction, 10);
      sfx.click();
      useTerminalStore.getState().addLog(`> INFORMATION BROKERED TO ${selectedFixer.name.toUpperCase()}. ${faction.toUpperCase()} REP -5, ${file.faction.toUpperCase()} REP +10.`);
    }
    setBrokerFile(null);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-cyan-500 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-cyan-400 text-xl font-bold">[ FACTION FIXERS ]</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
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
                  <div className="mt-2 text-xs text-yellow-400 font-bold">★ VIP ACCESS UNLOCKED</div>
                )}
              </div>
            );
          })}
        </div>

        {selectedFixer && (
          <div className="border border-gray-700 rounded p-4 bg-black/50">
            <h3 className={`font-bold mb-2 ${selectedFixer.color}`}>{selectedFixer.name} - Contracts</h3>
            <div className="space-y-2">
              {availableJobs.filter(j => j.targetLdlName.includes(selectedFixer.faction) || Math.random() > 0.5).slice(0, 3).map(job => (
                <div key={job.id} className="border border-gray-600 p-2 rounded text-xs">
                  <div className="font-bold text-white">{job.title}</div>
                  <div className="text-gray-400">Target: {job.targetLdlName} | Payout: {job.payout} eb</div>
                  <button onClick={() => { sfx.click(); acceptJob(job); }}
                    className="mt-2 bg-cyan-700 hover:bg-cyan-600 px-3 py-1 rounded text-white text-[10px]">
                    ACCEPT
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-gray-700 pt-3">
              <h4 className="text-yellow-400 text-xs font-bold mb-2">Information Brokering</h4>
              <p className="text-gray-400 text-[10px] mb-2">Sell extracted files to this fixer. Changes faction reputations.</p>
              <button onClick={() => setBrokerFile({ faction: 'arasaka', name: 'Grey File' })}
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
