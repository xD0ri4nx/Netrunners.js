import { useState } from 'react';
import { useMeatspaceStore } from '../store/meatspaceStore';
import cyberware from '../data/cyberware';

export default function RipperdocPanel({ onClose }) {
  const { funds, deductFunds, installCyberware, cyberware: installed, humanity, maxHumanity, cyberpsychosisLevel } = useMeatspaceStore();
  const [selected, setSelected] = useState(null);

  const handleInstall = (ware) => {
    if (funds < ware.cost) return alert('Insufficient Eurobucks!');
    if (installed.find(w => w.id === ware.id)) return alert('Already installed!');
    deductFunds(ware.cost);
    installCyberware(ware);
  };

  const getCpWarning = () => {
    if (cyberpsychosisLevel >= 3) return '⚠ CYBERPSYCHOSIS CRITICAL - RECKLESS ACTIONS FORCED';
    if (cyberpsychosisLevel >= 2) return '⚠ CYBERPSYCHOSIS ACTIVE - HALLUCINATIONS & PENALTIES';
    if (cyberpsychosisLevel >= 1) return '⚠ EARLY CYBERPSYCHOSIS - UI GLITCHES DETECTED';
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-cyan-500 rounded-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-cyan-400 text-xl font-bold">[ RIPPERDOC CLINIC ]</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        <div className="mb-4 p-3 bg-gray-800 rounded">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-300">Funds: <span className="text-green-400">{funds} eb</span></span>
            <span className="text-gray-300">Humanity: <span className={humanity <= 30 ? 'text-red-400' : humanity <= 50 ? 'text-yellow-400' : 'text-green-400'}>{humanity}/{maxHumanity}</span></span>
          </div>
          {cyberpsychosisLevel > 0 && (
            <div className="text-red-400 text-xs font-bold animate-pulse">{getCpWarning()}</div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {cyberware.map((ware) => {
            const isInstalled = installed.find(w => w.id === ware.id);
            const canAfford = funds >= ware.cost;
            return (
              <div key={ware.id} className={`border rounded p-3 ${isInstalled ? 'border-green-600 bg-green-900/20' : 'border-gray-700 bg-gray-800'} ${selected?.id === ware.id ? 'ring-2 ring-cyan-500' : ''}`}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-cyan-300 font-bold text-sm">{ware.name}</h3>
                  <span className="text-yellow-400 text-xs">{ware.cost} eb</span>
                </div>
                <p className="text-gray-400 text-xs mb-2">{ware.description}</p>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-red-400">Humanity: -{ware.humanityCost}</span>
                  {ware.bonuses && (
                    <span className="text-green-400">
                      {Object.entries(ware.bonuses).map(([k, v]) => `+${v} ${k.toUpperCase()}`).join(' ')}
                    </span>
                  )}
                </div>
                {isInstalled ? (
                  <div className="mt-2 text-green-400 text-xs">✓ INSTALLED</div>
                ) : (
                  <button
                    onClick={() => handleInstall(ware)}
                    disabled={!canAfford}
                    className={`mt-2 w-full py-1 rounded text-xs font-bold ${canAfford ? 'bg-cyan-700 hover:bg-cyan-600 text-white' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                  >
                    {canAfford ? 'INSTALL' : 'INSUFFICIENT FUNDS'}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {installed.length > 0 && (
          <div className="mt-4 p-3 bg-gray-800 rounded">
            <h3 className="text-cyan-300 text-sm mb-2">Installed Cyberware:</h3>
            {installed.map(w => (
              <div key={w.id} className="text-xs text-gray-300">{w.name} (Humanity: -{w.humanityCost})</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
