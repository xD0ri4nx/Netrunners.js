import { useState } from 'react';
import { useCyberdeckStore } from '../store/cyberdeckStore';
import { useMeatspaceStore } from '../store/meatspaceStore';
import { sfx } from '../utils/sfx';

const PRODUCTS = {
  programs: [
    { id: 'prog_killer', name: 'Killer v2.0', type: 'anti-ice', strength: 6, mu: 1, cost: 800, desc: 'Military-grade offense. STR: 6.' },
    { id: 'prog_sword', name: 'Sword', type: 'anti-ice', strength: 4, mu: 1, cost: 300, desc: 'Standard combat program. STR: 4.' },
    { id: 'prog_brainwipe', name: 'Brainwipe', type: 'anti-ice', strength: 3, mu: 1, cost: 2000, desc: 'Degrades ICE cognition: -1D6 STR on hit. STR: 3.' },
    { id: 'prog_liche', name: 'Liche', type: 'anti-ice', strength: 4, mu: 1, cost: 2500, desc: 'Reprograms ICE as allied daemon. STR: 4.' },
    { id: 'prog_hammer', name: 'Hammer', type: 'intrusion', strength: 4, mu: 1, cost: 400, desc: 'Brute-force walls. Deals 2D6 to wall STR. Alerts ICE. STR: 4, 1 MU.' },
    { id: 'prog_jackhammer', name: 'Jackhammer', type: 'intrusion', strength: 2, mu: 2, cost: 360, desc: 'Quieter wall breach. Deals 1D6 to wall STR. STR: 2, 2 MU.' },
    { id: 'prog_decrypt', name: 'Decrypt v1.0', type: 'utility', strength: 4, mu: 1, cost: 350, desc: 'Opens Code Gates. STR: 4.' },
    { id: 'prog_krash', name: 'Krash', type: 'anti-system', strength: 0, mu: 2, cost: 800, desc: 'Crashes CPU for 1D6+1 turns. One-use. STR: 3, 2 MU.' },
    { id: 'prog_viral15', name: 'Viral 15', type: 'anti-system', strength: 0, mu: 2, cost: 600, desc: 'Wipes Memory nodes clean. One-use. STR: 4, 2 MU.' },
    { id: 'prog_imp', name: 'Imp', type: 'daemon', strength: 2, mu: 1, cost: 300, desc: 'Deploy allied entity. Fights ICE independently. STR: 2, 1 MU.' },
    { id: 'prog_balron', name: 'Balron', type: 'daemon', strength: 5, mu: 3, cost: 1200, desc: 'Powerful allied entity. Fights ICE independently. STR: 5, 3 MU.' },
    { id: 'prog_invis', name: 'Invisibility', type: 'stealth', strength: 5, mu: 1, cost: 1500, desc: 'Evade ICE to slip past. STR: 5.' },
    { id: 'prog_armor', name: 'Armor', type: 'defense', strength: 4, mu: 2, cost: 170, desc: 'Stops attacks on success, -3 dmg on fail. STR: 4, 2 MU.' },
    { id: 'prog_shield', name: 'Shield', type: 'defense', strength: 3, mu: 1, cost: 150, desc: 'Stops direct attacks completely on success. STR: 3, 1 MU.' },
    { id: 'prog_flak', name: 'Flak', type: 'defense', strength: 4, mu: 2, cost: 180, desc: '-2 to ICE Detection rolls. -1 dmg mitigation. STR: 4, 2 MU.' },
  ],
  cyberdecks: [
    { id: 'deck_zetatech', model: 'Zetatech Paraline', mu: 5, speed: 1, dataWalls: 3, cost: 0, desc: 'Standard issue. MU: 5 | Speed: 1 | Wall STR: 3' },
    { id: 'deck_fuchi4', model: 'Fuchi Cyber-4', mu: 10, speed: 1, dataWalls: 4, cost: 5000, desc: 'Mid-tier. MU: 10 | Speed: 1 | Wall STR: 4' },
    { id: 'deck_raven', model: 'Raven Microcyber', mu: 15, speed: 2, dataWalls: 5, cost: 10000, desc: 'High-end. MU: 15 | Speed: 2 | Wall STR: 5' },
    { id: 'deck_deckman', model: 'Deckman Portable', mu: 3, speed: 1, dataWalls: 2, cost: 2000, desc: 'Portable. MU: 3 | Speed: 1 | Wall STR: 2' },
    { id: 'deck_cyber-1', model: 'Cyber-1 Console', mu: 20, speed: 3, dataWalls: 6, cost: 20000, desc: 'Elite. MU: 20 | Speed: 3 | Wall STR: 6' },
  ],
  options: [
    { id: 'addon_cellular', name: 'Cellular Mod', type: 'cellular', cost: 4000, desc: 'Launch from orbital LDLs directly. Reduces trace risk by 1 per jump.' },
    { id: 'addon_coprocessor', name: 'Coprocessor Module', type: 'coprocessor', cost: 3000, desc: 'Execute 2 player actions for every 1 enemy turn. Stacks per purchase.' },
    { id: 'addon_memory', name: 'Memory Expansion Chip', type: 'memory', cost: 1000, desc: 'Upgrades deck capacity by +1 MU.' },
    { id: 'addon_interface_plugs', name: 'Interface Plugs', type: 'interface', cost: 1500, desc: '+1 to ALL rolls, +50% neural damage taken. Surgical install.' },
    { id: 'addon_trodes', name: 'Trode Set', type: 'interface', cost: 20, desc: '-1 to ALL rolls, safe (no extra neural damage). Non-invasive.' },
    { id: 'addon_keyboard', name: 'Keyboard', type: 'keyboard', cost: 100, desc: 'Standard input device for deck operation.' },
    { id: 'addon_videoboard', name: 'Videoboard', type: 'videoboard', cost: 100, desc: 'Per sq. ft. Visual display output for deck.' },
    { id: 'addon_printer', name: 'Printer', type: 'printer', cost: 300, desc: 'Hardcopy output device.' },
    { id: 'addon_chipreader', name: 'Chipreader', type: 'chipreader', cost: 100, desc: 'Reads standard data chips.' },
    { id: 'addon_extrachips', name: 'Extra Chips', type: 'extrachips', cost: 10, desc: 'Per chip. Additional storage media.' },
    { id: 'addon_voxbox', name: 'Vox Box', type: 'voxbox', cost: 300, desc: 'Voice input/output device.' },
    { id: 'addon_scanner', name: 'Scanner', type: 'scanner', cost: 100, desc: 'Basic scanning device (100eb/sq ft).' },
    { id: 'addon_interface_cables', name: 'Interface Cables', type: 'interface_cables', cost: 20, desc: 'Standard connection cables (20-30eb).' },
    { id: 'addon_low_impedance', name: 'Low Impedance Cables', type: 'low_impedance', cost: 60, desc: 'Premium signal cables.' },
    { id: 'addon_terminal', name: 'Terminal', type: 'terminal', cost: 400, desc: 'Full workstation terminal.' },
    { id: 'addon_scramble', name: 'Scramble Chip', type: 'scramble', cost: 5000, desc: 'Emergency jack-out without trace penalty. Permanent install.' },
    { id: 'addon_speed', name: 'Speed Chip', type: 'speed', cost: 3000, desc: 'Move 2 cells per turn instead of 1.' },
    { id: 'addon_ripple', name: 'Ripple System', type: 'ripple', cost: 4000, desc: '+1 trace defense per successful routing jump.' },
  ],
  upgrades: [
    { id: 'upgrade_mu1', name: 'MU Upgrade +1', amount: 1, cost: 500, desc: 'Increase max MU by 1.' },
    { id: 'upgrade_speed', name: 'Speed Upgrade +1', amount: 1, cost: 2000, desc: 'Increase deck speed by +1 (max 5).' },
    { id: 'upgrade_datawall', name: 'Data Wall Upgrade +1', amount: 1, cost: 1000, desc: 'Increase data wall strength by +1 (max 10).' },
  ]
};

export function ShopPanel({ onClose }) {
  const [activeFilter, setActiveFilter] = useState('programs');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const funds = useMeatspaceStore(state => state.funds);
  const deductFunds = useMeatspaceStore(state => state.deductFunds);
  const addProgram = useCyberdeckStore(state => state.addProgram);
  const programs = useCyberdeckStore(state => state.programs);
  const equipDeck = useCyberdeckStore(state => state.equipDeck);
  const deckModel = useCyberdeckStore(state => state.deckModel);
  const addCoprocessor = useCyberdeckStore(state => state.addCoprocessor);
  const setCellular = useCyberdeckStore(state => state.setCellular);
  const upgradeMu = useCyberdeckStore(state => state.upgradeMu);
  const setInterfaceType = useMeatspaceStore(state => state.setInterfaceType);
  const interfaceType = useMeatspaceStore(state => state.interfaceType);

  const handlePurchase = (product) => {
    if (funds < product.cost) {
      sfx.error();
      return;
    }

    sfx.loot();
    deductFunds(product.cost);

    switch (activeFilter) {
      case 'programs':
        if (programs.some(p => p.id === product.id)) {
          sfx.error();
          return;
        }
        addProgram({ ...product, id: product.id });
        break;
      case 'cyberdecks':
        if (deckModel === product.model) {
          sfx.error();
          return;
        }
        equipDeck(product.model, product.mu, product.speed, product.dataWalls);
        break;
      case 'options':
        if (product.type === 'cellular') {
          if (useCyberdeckStore.getState().isCellular) {
            sfx.error();
            return;
          }
          setCellular(true);
        } else if (product.type === 'coprocessor') {
          addCoprocessor();
        } else if (product.type === 'memory') {
          upgradeMu(1);
        } else if (product.type === 'speed') {
          useCyberdeckStore.getState().addSpeed();
        } else if (product.type === 'ripple') {
          useCyberdeckStore.getState().addRipple();
        } else if (product.type === 'scramble') {
          // Scramble Chip - permanent install, no trace penalty on jack-out
          // This would need a state flag in meatspace/cyberdeck store
        } else if (product.type === 'interface') {
          if (product.id.includes('plugs') && interfaceType === 'interfacePlugs') {
            sfx.error();
            return;
          }
          if (product.id.includes('trodes') && interfaceType === 'trodes') {
            sfx.error();
            return;
          }
          setInterfaceType(product.id.includes('plugs') ? 'interfacePlugs' : 'trodes');
        }
        break;
      case 'upgrades':
        if (product.id === 'upgrade_speed') {
          const currentSpeed = useCyberdeckStore.getState().speed;
          if (currentSpeed >= 5) { sfx.error(); return; }
          useCyberdeckStore.getState().addSpeed();
        } else if (product.id === 'upgrade_datawall') {
          const currentWalls = useCyberdeckStore.getState().dataWalls;
          if (currentWalls >= 10) { sfx.error(); return; }
          useCyberdeckStore.getState().addDataWalls();
        } else {
          upgradeMu(product.amount);
        }
        break;
    }
  };

  const filters = [
    { id: 'programs', label: 'SOFTWARE' },
    { id: 'cyberdecks', label: 'CYBERDECKS' },
    { id: 'options', label: 'OPTIONS' },
    { id: 'upgrades', label: 'UPGRADES' }
  ];

  const getTypeColor = (type) => {
    const colors = {
      'anti-ice': 'text-red-400',
      'intrusion': 'text-yellow-500',
      'utility': 'text-blue-400',
      'anti-system': 'text-pink-400',
      'daemon': 'text-cyan-400',
      'stealth': 'text-purple-400',
      'defense': 'text-green-400',
      'cellular': 'text-blue-500',
      'coprocessor': 'text-yellow-400',
      'memory': 'text-cyan-300',
      'interface': 'text-orange-400',
      'scramble': 'text-pink-500',
      'speed': 'text-green-300',
      'ripple': 'text-teal-400'
    };
    return colors[type] || 'text-gray-400';
  };

  return (
    <div className="bg-black border-2 border-neon-green p-4 sm:p-6 shadow-[0_0_30px_#00ffcc40] max-w-4xl w-full max-h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg sm:text-2xl font-bold tracking-widest text-yellow-400">BBS: AFTERLIFE</h2>
        <button onClick={onClose} className="text-neon-green hover:text-black hover:bg-neon-green px-2 py-1 border border-neon-green transition-colors text-sm">
          [ CLOSE ]
        </button>
      </div>

      {/* FILTER TABS */}
      <div className="flex flex-wrap gap-2 mb-4">
        {filters.map(filter => (
          <button
            key={filter.id}
            onClick={() => { sfx.click(); setActiveFilter(filter.id); setSelectedProduct(null); }}
            className={`px-3 py-2 text-xs sm:text-sm font-bold border transition-colors
              ${activeFilter === filter.id
                ? 'bg-neon-green text-black border-neon-green'
                : 'border-neon-green/30 text-neon-green hover:bg-neon-green/20'
              }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-400 mb-4 border-b border-neon-green/30 pb-2">
        {activeFilter === 'programs' && 'Software & Programs - Equip in your cyberdeck'}
        {activeFilter === 'cyberdecks' && 'Cyberdeck Models - Base hardware for NET running'}
        {activeFilter === 'options' && 'Hardware Options - Per sourcebook rules'}
        {activeFilter === 'upgrades' && 'Deck Upgrades - Increase MU or combat bonus'}
      </p>

      {/* PRODUCT GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {PRODUCTS[activeFilter].map(product => {
          const isAffordable = funds >= product.cost;
          const alreadyOwned = activeFilter === 'programs' && programs.some(p => p.id === product.id);
          const currentDeck = activeFilter === 'cyberdecks' && product.model === deckModel;
          const isSelected = selectedProduct?.id === product.id;

          return (
            <button
              key={product.id}
              onClick={() => { sfx.click(); setSelectedProduct(product); }}
              disabled={!isAffordable || alreadyOwned || currentDeck}
              className={`text-left p-3 border transition-colors
                ${isSelected ? 'bg-neon-green/20 border-neon-green' : 'border-neon-green/30 hover:bg-neon-green/10'}
                ${(!isAffordable || alreadyOwned || currentDeck) ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <div className="font-bold text-sm sm:text-base mb-1 flex justify-between">
                <span className={product.type ? getTypeColor(product.type) : 'text-neon-green'}>
                  {product.name}
                </span>
                <span className="text-yellow-400">{product.cost} eb</span>
              </div>
              <div className="text-xs text-gray-400">
                {product.desc}
                {activeFilter === 'programs' && product.mu && ` | ${product.mu} MU`}
                {product.strength && ` | STR: ${product.strength}`}
              </div>
              {(alreadyOwned || currentDeck) && (
                <div className="text-xs text-red-400 mt-1 font-bold">
                  {alreadyOwned ? 'ALREADY OWNED' : 'CURRENT DECK'}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* PURCHASE BUTTON */}
      {selectedProduct && (
        <div className="flex justify-center border-t border-neon-green/30 pt-4">
          <button
            onClick={() => handlePurchase(selectedProduct)}
            className="bg-yellow-400 text-black px-6 py-3 font-bold hover:bg-yellow-300 transition-colors text-sm sm:text-base"
          >
            [ BUY: {selectedProduct.name} — {selectedProduct.cost} eb ]
          </button>
        </div>
      )}
    </div>
  );
}
