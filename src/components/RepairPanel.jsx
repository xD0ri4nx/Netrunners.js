import { useState } from 'react';
import { useCyberdeckStore } from '../store/cyberdeckStore';
import { useMeatspaceStore } from '../store/meatspaceStore';
import { useTerminalStore } from '../store/terminalStore';
import { sfx } from '../utils/sfx';

export function RepairPanel({ onClose }) {
  const [repairType, setRepairType] = useState(null);
  const [isRepairing, setIsRepairing] = useState(false);
  const [repairDays, setRepairDays] = useState(0);

  const deckHealth = useCyberdeckStore(state => state.deckHealth);
  const maxDeckHealth = useCyberdeckStore(state => state.maxDeckHealth);
  const deckCrashes = useCyberdeckStore(state => state.deckCrashes);
  const maxMu = useCyberdeckStore(state => state.maxMu);
  const funds = useMeatspaceStore(state => state.funds);
  const deductFunds = useMeatspaceStore(state => state.deductFunds);
  const repairDeck = useCyberdeckStore(state => state.repairDeck);
  const reduceMaxMu = useCyberdeckStore(state => state.reduceMaxMu);
  const resetDeckCrashes = useCyberdeckStore(state => state.resetDeckCrashes);
  const addLog = useTerminalStore(state => state.addLog);

  const REPAIR_OPTIONS = [
    {
      id: 'patch',
      name: 'PATCH FIRMWARE',
      description: 'Restore 30% deck integrity',
      cost: 200,
      days: 1,
      effect: () => repairDeck(30)
    },
    {
      id: 'rebuild',
      name: 'REBUILD LOGIC',
      description: 'Restore 60% deck integrity',
      cost: 500,
      days: 3,
      effect: () => repairDeck(60)
    },
    {
      id: 'full_restore',
      name: 'FULL RESTORE',
      description: 'Restore 100% deck integrity',
      cost: 1000,
      days: 7,
      effect: () => { repairDeck(100); resetDeckCrashes(); }
    },
    {
      id: 'upgrade_mu',
      name: 'REPLACE COMPONENTS',
      description: `Restore 1 max MU (lost from crashes)`,
      cost: 800,
      days: 5,
      effect: () => reduceMaxMu(-1)
    },
    {
      id: 'heal_neural',
      name: 'NEURAL THERAPY',
      description: 'Restore 3 neural damage (clinic visit)',
      cost: 500,
      days: 3,
      effect: () => useMeatspaceStore.getState().healNeuralDamage(3)
    }
  ];

  const handleStartRepair = () => {
    if (!repairType) return;

    if (funds < repairType.cost) {
      sfx.error();
      addLog("> ERROR: INSUFFICIENT FUNDS.");
      return;
    }

    sfx.click();
    deductFunds(repairType.cost);
    setRepairDays(repairType.days);
    setIsRepairing(true);
    addLog(`> REPAIR STARTED: ${repairType.name.toUpperCase()}.`);
    addLog(`> TIME REQUIRED: ${repairType.days} DAYS. COST: ${repairType.cost} eb.`);
  };

  const handleFinishDay = () => {
    const daysLeft = repairDays - 1;
    if (daysLeft <= 0) {
      sfx.loot();
      repairType.effect();
      addLog(`> REPAIR COMPLETE: ${repairType.name.toUpperCase()}.`);
      setIsRepairing(false);
      setRepairType(null);
    } else {
      setRepairDays(daysLeft);
      addLog(`> REPAIR IN PROGRESS... ${daysLeft} DAYS REMAINING.`);
    }
  };

  const healthPercent = (deckHealth / maxDeckHealth) * 100;
  const healthColor = deckHealth > 60 ? 'bg-neon-green' : deckHealth > 30 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="bg-black border-2 border-yellow-500 p-4 shadow-[0_0_30px_#eab30840] max-w-2xl w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold tracking-widest text-yellow-400">DECK REPAIR BAY</h3>
        <button onClick={onClose} className="text-yellow-400 hover:text-black hover:bg-yellow-400 px-2 py-1 border border-yellow-400 transition-colors text-sm">
          [ CLOSE ]
        </button>
      </div>

      {/* DECK STATUS */}
      <div className="mb-6 p-3 border border-yellow-500/30 bg-yellow-900/10">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-yellow-400 font-bold">DECK INTEGRITY</span>
          <span className={`font-mono ${deckHealth > 30 ? 'text-neon-green' : 'text-red-500'}`}>
            {deckHealth}% / {maxDeckHealth}%
          </span>
        </div>
        <div className="w-full bg-gray-900 h-4 mb-2 border border-yellow-500/30">
          <div
            className={`h-full transition-all duration-500 ${healthColor}`}
            style={{ width: `${healthPercent}%` }}
          />
        </div>
        {deckCrashes > 0 && (
          <p className="text-xs text-red-400 animate-pulse">
            WARNING: {deckCrashes} CRITICAL CRASH{deckCrashes > 1 ? 'ES' : ''} DETECTED. MAX MU REDUCED.
          </p>
        )}
        <p className="text-xs text-gray-400 mt-2">
          Current Max MU: {maxMu} | Firestarter attacks degrade deck integrity
        </p>
      </div>

      {isRepairing ? (
        <div className="text-center py-8">
          <div className="text-2xl font-bold text-yellow-400 mb-4 animate-pulse">
            REPAIRING: {repairType?.name?.toUpperCase()}
          </div>
          <div className="text-sm text-gray-400 mb-4">
            DAYS REMAINING: {repairDays}
          </div>
          <div className="w-full bg-gray-900 h-4 mb-4 border border-yellow-500/30">
            <div
              className="bg-yellow-500 h-full transition-all duration-500"
              style={{ width: `${((repairType?.days - repairDays) / repairType?.days) * 100}%` }}
            />
          </div>
          <button
            onClick={handleFinishDay}
            className="bg-yellow-500 text-black px-4 py-2 font-bold hover:bg-yellow-400 transition-colors text-sm"
          >
            [ PASS DAY ]
          </button>
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-400 mb-4">
            Select repair type. Higher quality repairs take longer but restore more integrity.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 max-h-64 overflow-y-auto">
            {REPAIR_OPTIONS.map(option => {
              const isSelected = repairType?.id === option.id;
              const canAfford = funds >= option.cost;

              return (
                <button
                  key={option.id}
                  onClick={() => { setRepairType(option); sfx.click(); }}
                  className={`text-left p-2 border transition-colors text-xs ${
                    isSelected
                      ? 'bg-yellow-500/20 border-yellow-400'
                      : canAfford
                        ? 'border-yellow-500/30 hover:bg-yellow-500/10'
                        : 'border-gray-700 opacity-50 cursor-not-allowed'
                  }`}
                  disabled={!canAfford}
                >
                  <div className="font-bold text-yellow-400">{option.name}</div>
                  <div className="text-gray-400 mt-1">
                    {option.description}
                  </div>
                  <div className="text-gray-500 mt-1">
                    Cost: {option.cost} eb | Days: {option.days}
                  </div>
                </button>
              );
            })}
          </div>

          {repairType && (
            <div className="flex gap-2 justify-center">
              <button
                onClick={handleStartRepair}
                className="bg-yellow-500 text-black px-4 py-2 font-bold hover:bg-yellow-400 transition-colors text-sm"
              >
                [ START REPAIR: {repairType.cost} eb, {repairType.days} DAYS ]
              </button>
              <button
                onClick={() => setRepairType(null)}
                className="bg-black border border-red-500 text-red-500 px-4 py-2 font-bold hover:bg-red-500 hover:text-black transition-colors text-sm"
              >
                [ CLEAR ]
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
