import { useState } from 'react';
import { useCyberdeckStore } from '../store/cyberdeckStore';
import { useMeatspaceStore } from '../store/meatspaceStore';
import { useTerminalStore } from '../store/terminalStore';
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
    { id: 'addon_printer', name: 'Printer', type: 'printer', cost: 300, desc: 'Hardcopy output device.' },
    { id: 'addon_voxbox', name: 'Vox Box', type: 'voxbox', cost: 300, desc: 'Voice input/output device.' },
    { id: 'addon_scanner', name: 'Scanner', type: 'scanner', cost: 100, desc: 'Basic scanning device (100eb/sq ft).' },
    { id: 'addon_interface_cables', name: 'Interface Cables', type: 'interface_cables', cost: 20, desc: 'Standard connection cables (20-30eb).' },
    { id: 'addon_low_impedance', name: 'Low Impedance Cables', type: 'low_impedance', cost: 60, desc: 'Premium signal cables.' },
    { id: 'addon_terminal', name: 'Terminal', type: 'terminal', cost: 400, desc: 'Full workstation terminal.' },
    { id: 'addon_scramble', name: 'Scramble Chip', type: 'scramble', cost: 5000, desc: 'Emergency jack-out without trace penalty. Permanent install.' },
    { id: 'addon_speed', name: 'Speed Chip', type: 'speed', cost: 3000, desc: 'Move 2 cells per turn instead of 1.' },
    { id: 'addon_ripple', name: 'Ripple System', type: 'ripple', cost: 4000, desc: '+1 trace defense per successful routing jump.' },
    { id: 'addon_timelag_interface', name: 'Time-Lag Buffer (Interface)', type: 'timelag_interface', cost: 350, desc: 'Reduces space-run Interface penalty to flat -2. Aftermarket board.' },
    { id: 'addon_timelag_reflex', name: 'Time-Lag Buffer (Reflex)', type: 'timelag_reflex', cost: 350, desc: 'Reduces space-run REF/Initiative penalty to flat -2. Aftermarket board.' },
  ],
  hardware: [
    { id: 'hw_chipreader', name: 'Chipreader', type: 'peripheral', subType: 'chipreader', cost: 800, desc: '1 free consumable program slot (does not use MU). 1-use per run.' },
    { id: 'hw_hardened', name: 'Hardened Circuitry', type: 'peripheral', subType: 'hardened', cost: 3500, desc: 'Immunity to Firestarter deck-damage effects.' },
    { id: 'hw_videoboard', name: 'Videoboard', type: 'peripheral', subType: 'videoboard', cost: 1200, desc: '+1 to ambush detection/evasion. Visual link to physical surroundings.' },
    { id: 'hw_optical', name: 'Optical Deck', type: 'peripheral', subType: 'optical', cost: 5000, desc: 'Reveals hidden ICE within 2 tiles. Reduces fog-of-war.' },
{ id: 'hw_bodyweight', name: 'Bodyweight Lifesupport', type: 'peripheral', subType: 'bodyweight', cost: 5000, desc: 'Portable immersion system. Freezes hunger/sleep. 72h limit. Uses nutrient packs (100 eb).' },
    { id: 'hw_nutrient', name: 'Nutrient Pack', type: 'consumable', subType: 'nutrient', cost: 100, desc: 'Consumable for Bodyweight system. Lasts 24h. Buy in bulk.' },
  ],
  upgrades: [
    { id: 'upgrade_mu1', name: 'MU Upgrade +1', amount: 1, cost: 500, desc: 'Increase max MU by 1.' },
    { id: 'upgrade_speed', name: 'Speed Upgrade +1', amount: 1, cost: 2000, desc: 'Increase deck speed by +1 (max 5).' },
    { id: 'upgrade_datawall', name: 'Data Wall Upgrade +1', amount: 1, cost: 1000, desc: 'Increase data wall strength by +1 (max 10).' },
  ],
  safehouse: [
    { id: 'sh_creche', name: 'Data Creche', type: 'safehouse', subType: 'creche', cost: 10000, desc: 'Safehouse installation (apt/penthouse). Overrides deck: +1 Speed, +12 MU, +4 Walls. 96h immersion. Videoboard alert for external threats.' },
  ],
  fbc: [
    { id: 'fbc_gemini', name: 'Gemini', type: 'fbc', subType: 'chassis', cost: 55000, desc: 'Human-passing. Bypasses security. SDP: Head30/Arms20/Legs20/Torso40', stats: 'REF10 MA10 BODY12 SP0' },
    { id: 'fbc_alpha', name: 'Alpha Class', type: 'fbc', subType: 'chassis', cost: 58000, desc: 'Standard combat. Heavily armored. SDP: Head30/Arms20/Legs20/Torso40', stats: 'REF10 MA10 BODY12 SP25' },
    { id: 'fbc_wingman', name: 'Wingman', type: 'fbc', subType: 'chassis', cost: 54000, desc: 'Aerospace pilot. Immune to G-forces. SDP: Head30/Arms20/Legs20/Torso40', stats: 'REF15 MA10 BODY12 SP25' },
    { id: 'fbc_eclipse', name: 'Eclipse', type: 'fbc', subType: 'chassis', cost: 76000, desc: 'Espionage. Radar-absorbent, silent. SDP: Head30/Arms20/Legs20/Torso40', stats: 'REF10 MA12 BODY10 SP15' },
    { id: 'fbc_aquarius', name: 'Aquarius', type: 'fbc', subType: 'chassis', cost: 65000, desc: 'Deep-sea. Sonar, pressure resistant. SDP: Head30/Arms20/Legs20/Torso50. SPECIAL: Underwater ops', stats: 'REF8 MA10 BODY12 SP15' },
    { id: 'fbc_fireman', name: 'Fireman', type: 'fbc', subType: 'chassis', cost: 60000, desc: 'Hazard/rescue. Heat/toxin immune. SDP: Head30/Arms30/Legs30/Torso50', stats: 'REF8 MA10 BODY14 SP20' },
    { id: 'fbc_samson', name: 'Samson', type: 'fbc', subType: 'chassis', cost: 40000, desc: 'Industrial. Massive lifting. SDP: Head30/Arms40/Legs50/Torso60', stats: 'REF6 MA8 BODY18 SP15' },
    { id: 'fbc_wiseman', name: 'Wiseman', type: 'fbc', subType: 'chassis', cost: 90000, desc: 'Netrunner. Extra MU, Firestarter immune! SDP: Head30/Arms20/Legs20/Torso40', stats: 'REF10 MA10 BODY12 SP15' },
    { id: 'fbc_dragoon', name: 'Dragoon', type: 'fbc', subType: 'chassis', cost: 120000, desc: 'Military tank. Mount heavy weapons. SDP: Head40/Arms50/Legs50/Torso60', stats: 'REF15 MA25 BODY20 SP40' },
    { id: 'fbc_spyder', name: 'Spyder', type: 'fbc', subType: 'chassis', cost: 118110, desc: 'Multi-limbed. Wall-crawling. SDP: Head30/Arms20/Legs20/Torso40', stats: 'REF12 MA20 BODY12 SP30' },
    { id: 'fbc_copernicus', name: 'Copernicus', type: 'fbc', subType: 'chassis', cost: 60000, desc: 'Space. Radiation/EMP shielded. SDP: Head30/Arms20/Legs20/Torso40', stats: 'REF11 MA10 BODY12 SP25' },
    { id: 'fbc_burroughs', name: 'Burroughs', type: 'fbc', subType: 'chassis', cost: 65000, desc: 'Mars. Sandstorm resistant. SDP: Head30/Arms30/Legs40/Torso50', stats: 'REF10 MA10 BODY12 SP30' },
  ],
  fbc_upgrades: [
    { id: 'fbc_overclock_ref', name: 'Overclock REF +1', type: 'fbc', subType: 'overclock_ref', cost: 5000, desc: 'Permanently increase REF by 1 (max +2).' },
    { id: 'fbc_overclock_ma', name: 'Overclock MA +1', type: 'fbc', subType: 'overclock_ma', cost: 5000, desc: 'Permanently increase MA by 1 (max +2).' },
    { id: 'fbc_overclock_body', name: 'Overclock BODY +1', type: 'fbc', subType: 'overclock_body', cost: 5000, desc: 'Permanently increase BODY by 1 (max +2).' },
    { id: 'fbc_ccpl', name: 'CCPL Retrofit', type: 'fbc', subType: 'ccpl', cost: 15000, desc: 'Cyber-Steroids: 3x BODY. Enables ACPA armor equip.' },
    { id: 'fbc_quickmounts', name: 'Quick-Mounts', type: 'fbc', subType: 'quickmounts', cost: 8000, desc: 'Hot-swap weapons without Ripperdoc.' },
    { id: 'fbc_hardened', name: 'Hardened Shielding', type: 'fbc', subType: 'hardened', cost: 12000, desc: 'Immunity to EMP/microwave weapons.' },
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
      case 'hardware':
        if (product.type === 'peripheral') {
          const peripherals = useCyberdeckStore.getState().peripherals;
          if (peripherals[product.subType]) {
            sfx.error();
            return;
          }
          useCyberdeckStore.getState().installPeripheral(product.subType);
        } else if (product.subType === 'bodyweight') {
          const hasBodyweight = useMeatspaceStore.getState().hasBodyweightSystem;
          if (hasBodyweight) { sfx.error(); return; }
          useMeatspaceStore.getState().purchaseBodyweightSystem();
        } else if (product.subType === 'nutrient') {
          const result = useMeatspaceStore.getState().buyNutrientPacks(1);
          if (!result.success) { sfx.error(); return; }
        }
        break;
      case 'safehouse':
        if (product.subType === 'creche') {
          const hasCreche = useMeatspaceStore.getState().hasDataCreche;
          if (hasCreche) { sfx.error(); return; }
          const result = useMeatspaceStore.getState().purchaseDataCreche();
          if (!result.success) { sfx.error(); return; }
        }
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
        } else if (product.type === 'timelag_interface') {
          const hasTimelagInterface = useMeatspaceStore.getState().timelagInterface;
          if (hasTimelagInterface) { sfx.error(); return; }
          useMeatspaceStore.getState().setTimelagInterface(true);
          sfx.loot();
        } else if (product.type === 'timelag_reflex') {
          const hasTimelagReflex = useMeatspaceStore.getState().timelagReflex;
          if (hasTimelagReflex) { sfx.error(); return; }
          useMeatspaceStore.getState().setTimelagReflex(true);
          sfx.loot();
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
      case 'fbc':
        if (product.subType === 'chassis') {
          const isFBC = useMeatspaceStore.getState().isFBC;
          if (!isFBC) {
            // First FBC purchase - convert to FBC
            const result = useMeatspaceStore.getState().convertToFBC(product.id, product.cost);
            if (!result.success) { sfx.error(); return; }
            useTerminalStore.getState().addLog(`> ${result.message}`);
          } else {
            // Additional chassis purchase
            const result = useMeatspaceStore.getState().purchaseChassis(product.id);
            if (!result.success) { sfx.error(); return; }
            useTerminalStore.getState().addLog(`> ${result.message}`);
          }
        }
        break;
      case 'fbc_upgrades':
        const meatspace = useMeatspaceStore.getState();
        if (!meatspace.isFBC) { sfx.error(); return; }
        
        if (product.subType === 'overclock_ref') {
          const result = meatspace.upgradeFBCStat('ref', 1, product.cost);
          if (!result.success) { sfx.error(); return; }
          useTerminalStore.getState().addLog(`> ${result.message}`);
        } else if (product.subType === 'overclock_ma') {
          const result = meatspace.upgradeFBCStat('ma', 1, product.cost);
          if (!result.success) { sfx.error(); return; }
          useTerminalStore.getState().addLog(`> ${result.message}`);
        } else if (product.subType === 'overclock_body') {
          const result = meatspace.upgradeFBCStat('body', 1, product.cost);
          if (!result.success) { sfx.error(); return; }
          useTerminalStore.getState().addLog(`> ${result.message}`);
        } else if (product.subType === 'ccpl') {
          const result = meatspace.purchaseFBCUpgrade('ccpl', product.cost);
          if (!result.success) { sfx.error(); return; }
          useTerminalStore.getState().addLog(`> ${result.message}`);
        } else if (product.subType === 'quickmounts') {
          const result = meatspace.purchaseFBCUpgrade('quickMounts', product.cost);
          if (!result.success) { sfx.error(); return; }
          useTerminalStore.getState().addLog(`> ${result.message}`);
        } else if (product.subType === 'hardened') {
          const result = meatspace.purchaseFBCUpgrade('hardened', product.cost);
          if (!result.success) { sfx.error(); return; }
          useTerminalStore.getState().addLog(`> ${result.message}`);
        }
        break;
    }
  };

  const filters = [
    { id: 'programs', label: 'SOFTWARE' },
    { id: 'cyberdecks', label: 'CYBERDECKS' },
    { id: 'hardware', label: 'HARDWARE' },
    { id: 'options', label: 'OPTIONS' },
    { id: 'upgrades', label: 'UPGRADES' },
    { id: 'safehouse', label: 'SAFEHOUSE' },
    { id: 'fbc', label: 'FBC CHASSIS' },
    { id: 'fbc_upgrades', label: 'FBC UPGRADES' }
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
      'ripple': 'text-teal-400',
      'peripheral': 'text-amber-400'
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
        {activeFilter === 'safehouse' && 'Safehouse Installations - Permanent base upgrades'}
        {activeFilter === 'hardware' && 'Peripherals & Gear - Chipreaders, Bodyweight, etc.'}
        {activeFilter === 'fbc' && 'Full Body Conversion Chassis - Replace flesh with machine (IRREVERSIBLE)'}
        {activeFilter === 'fbc_upgrades' && 'FBC Upgrades - Overclock, CCPL, Quick-Mounts, Hardened Shielding'}
      </p>

      {/* PRODUCT GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {PRODUCTS[activeFilter].map(product => {
          const isAffordable = funds >= product.cost;
          const alreadyOwned = activeFilter === 'programs' && programs.some(p => p.id === product.id);
          const hardwareOwned = activeFilter === 'hardware' && useCyberdeckStore.getState().peripherals[product.subType];
          const currentDeck = activeFilter === 'cyberdecks' && product.model === deckModel;
          const bodyweightOwned = activeFilter === 'hardware' && product.subType === 'bodyweight' && useMeatspaceStore.getState().hasBodyweightSystem;
          const crecheOwned = activeFilter === 'safehouse' && product.subType === 'creche' && useMeatspaceStore.getState().hasDataCreche;
          const isSelected = selectedProduct?.id === product.id;
          const isOwned = alreadyOwned || hardwareOwned || currentDeck || bodyweightOwned || crecheOwned;

          return (
            <button
              key={product.id}
              onClick={() => { sfx.click(); setSelectedProduct(product); }}
              disabled={!isAffordable || isOwned}
              className={`text-left p-3 border transition-colors
                ${isSelected ? 'bg-neon-green/20 border-neon-green' : 'border-neon-green/30 hover:bg-neon-green/10'}
                ${(!isAffordable || isOwned) ? 'opacity-50 cursor-not-allowed' : ''}
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
              {isOwned && (
                <div className="text-xs text-red-400 mt-1 font-bold">
                  {hardwareOwned || bodyweightOwned || crecheOwned ? 'INSTALLED' : alreadyOwned ? 'ALREADY OWNED' : currentDeck ? 'CURRENT DECK' : 'OWNED'}
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
