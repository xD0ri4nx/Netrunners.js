import { useCyberdeckStore } from '../store/cyberdeckStore';
import { useMeatspaceStore } from '../store/meatspaceStore';
import { useTerminalStore } from '../store/terminalStore';
import { sfx } from '../utils/sfx';

export function BrainwarePanel({ onClose }) {
  const deckModel = useCyberdeckStore(state => state.deckModel);
  const deckType = useCyberdeckStore(state => state.deckType);
  const equipBrainwareDeck = useCyberdeckStore(state => state.equipBrainwareDeck);
  const installNeuralCyberware = useCyberdeckStore(state => state.installNeuralCyberware);
  const neuralCyberware = useCyberdeckStore(state => state.neuralCyberware) || {
    neuralProcessor: false,
    chipwareSocket: false,
    brainWall: false,
    psychosisRisk: 0
  };
  const funds = useMeatspaceStore(state => state.funds);
  const deductFunds = useMeatspaceStore(state => state.deductFunds);
  const addLog = useTerminalStore(state => state.addLog);

  const BRAINWARE_DECKS = [
    {
      id: 'neural_mk1',
      name: 'Neural Cyberdeck Mk I',
      mu: 8,
      speed: 2,
      cost: 5000,
      description: 'Implanted directly in brain. +2 interface bonus. No trodes penalty.'
    },
    {
      id: 'neural_mk2',
      name: 'Neural Cyberdeck Mk II',
      mu: 10,
      speed: 3,
      cost: 10000,
      description: 'Advanced neural interface. +2 interface, +1 speed base.'
    },
    {
      id: 'bio_interface',
      name: 'Bio-Interface Deck',
      mu: 12,
      speed: 2,
      cost: 15000,
      description: 'Organic neural lace. Immune to ICE speed reduction.'
    }
  ];

  const NEURAL_CYBERWARE = [
    {
      id: 'neuralProcessor',
      name: 'Neural Processor',
      cost: 3000,
      description: '+1 Speed permanently',
      installed: neuralCyberware.neuralProcessor
    },
    {
      id: 'chipwareSocket',
      name: 'Chipware Socket',
      cost: 5000,
      description: '+2 MU capacity',
      installed: neuralCyberware.chipwareSocket
    },
    {
      id: 'brainWall',
      name: 'Brain Wall',
      cost: 4000,
      description: '+2 trace defense',
      installed: neuralCyberware.brainWall
    }
  ];

  const handleEquipDeck = (deck) => {
    if (funds < deck.cost) {
      sfx.error();
      addLog("> ERROR: INSUFFICIENT FUNDS FOR BRAINWARE DECK.");
      return;
    }
    sfx.loot();
    deductFunds(deck.cost);
    equipBrainwareDeck(deck.name, deck.mu, deck.speed);
    addLog(`> INSTALLED: ${deck.name.toUpperCase()}. MU: ${deck.mu} | SPEED: ${deck.speed}.`);
    addLog("> WARNING: BRAINWARE DETECTED. PSYCHOSIS RISK INCREASED.");
  };

  const handleInstallCyberware = (ware) => {
    if (funds < ware.cost) {
      sfx.error();
      addLog("> ERROR: INSUFFICIENT FUNDS.");
      return;
    }
    if (ware.installed) {
      sfx.error();
      addLog(`> ERROR: ${ware.name.toUpperCase()} ALREADY INSTALLED.`);
      return;
    }
    sfx.loot();
    deductFunds(ware.cost);
    installNeuralCyberware(ware.id);
    addLog(`> IMPLANTED: ${ware.name.toUpperCase()}.`);
    addLog("> WARNING: NEURAL OVERLOAD RISK +1.");
  };

  return (
    <div className="bg-black border-2 border-purple-500 p-4 shadow-[0_0_30px_#a855f740] max-w-2xl w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold tracking-widest text-purple-400">BRAINWARE BLOWOUT</h3>
        <button onClick={onClose} className="text-purple-400 hover:text-black hover:bg-purple-400 px-2 py-1 border border-purple-400 transition-colors text-sm">
          [ CLOSE ]
        </button>
      </div>

      <div className="mb-4 p-3 border border-purple-500/30 bg-purple-900/10">
        <p className="text-xs text-purple-400 mb-2">CURRENT DECK: {deckModel} ({deckType === 'brainware' ? 'BRAINWARE' : 'TRADITIONAL'})</p>
        {deckType === 'brainware' && (
          <p className="text-xs text-yellow-400 animate-pulse">WARNING: PSYCHOSIS RISK ACTIVE</p>
        )}
      </div>

      <h4 className="text-sm font-bold text-purple-300 mb-2">BRAINWARE DECKS</h4>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-6">
        {BRAINWARE_DECKS.map(deck => {
          const canAfford = funds >= deck.cost;
          const isEquipped = deckModel === deck.name;
          return (
            <div key={deck.id} className={`p-2 border text-xs ${isEquipped ? 'border-purple-400 bg-purple-900/20' : 'border-purple-500/30'}`}>
              <div className="font-bold text-purple-400 mb-1">{deck.name}</div>
              <div className="text-gray-400 mb-2">{deck.description}</div>
              <div className="text-gray-500 mb-2">Cost: {deck.cost} eb</div>
              {!isEquipped && (
                <button
                  onClick={() => handleEquipDeck(deck)}
                  disabled={!canAfford}
                  className={`w-full py-1 text-xs font-bold border transition-colors ${canAfford ? 'border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-black' : 'border-gray-700 text-gray-700 cursor-not-allowed'}`}
                >
                  [ INSTALL ]
                </button>
              )}
              {isEquipped && (
                <div className="text-center text-purple-400 text-xs font-bold">EQUIPPED</div>
              )}
            </div>
          );
        })}
      </div>

      <h4 className="text-sm font-bold text-purple-300 mb-2">NEURAL CYBERWARE</h4>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {NEURAL_CYBERWARE.map(ware => {
          const canAfford = funds >= ware.cost;
          return (
            <div key={ware.id} className={`p-2 border text-xs ${ware.installed ? 'border-green-500 bg-green-900/20' : 'border-purple-500/30'}`}>
              <div className="font-bold text-purple-400 mb-1">{ware.name}</div>
              <div className="text-gray-400 mb-2">{ware.description}</div>
              <div className="text-gray-500 mb-2">Cost: {ware.cost} eb</div>
              {!ware.installed && (
                <button
                  onClick={() => handleInstallCyberware(ware)}
                  disabled={!canAfford}
                  className={`w-full py-1 text-xs font-bold border transition-colors ${canAfford ? 'border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-black' : 'border-gray-700 text-gray-700 cursor-not-allowed'}`}
                >
                  [ IMPLANT ]
                </button>
              )}
              {ware.installed && (
                <div className="text-center text-green-400 text-xs font-bold">INSTALLED</div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-500 mt-4 italic">
        * Brainware from Chromebook 4: Brainware Blowout. Neural cyberware increases psychosis risk.
      </p>
    </div>
  );
}
