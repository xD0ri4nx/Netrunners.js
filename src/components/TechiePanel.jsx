import { useState } from 'react';
import { useCyberdeckStore } from '../store/cyberdeckStore';
import { useMeatspaceStore } from '../store/meatspaceStore';
import { useTerminalStore } from '../store/terminalStore';
import { sfx } from '../utils/sfx';
import cyberware from '../data/cyberware';

export function TechiePanel({ onClose }) {
  const [activeTab, setActiveTab] = useState('deck');
  const [repairItem, setRepairItem] = useState(null);
  const [isRepairing, setIsRepairing] = useState(false);
  const [repairDays, setRepairDays] = useState(0);

  const funds = useMeatspaceStore(state => state.funds);
  const deductFunds = useMeatspaceStore(state => state.deductFunds);
  const addLog = useTerminalStore(state => state.addLog);

  const meatspace = useMeatspaceStore();
  const cyberdeck = useCyberdeckStore();

  const handleStartRepair = (cost, days, name, effect) => {
    if (funds < cost) {
      sfx.error();
      addLog('> INSUFFICIENT FUNDS.');
      return;
    }
    sfx.click();
    deductFunds(cost);
    setRepairDays(days);
    setIsRepairing(true);
    setRepairItem({ name, effect });
    addLog(`> REPAIR STARTED: ${name.toUpperCase()}.`);
    addLog(`> COST: ${cost} eb | DAYS: ${days}.`);
  };

  const handleFinishDay = () => {
    const daysLeft = repairDays - 1;
    if (daysLeft <= 0) {
      sfx.loot();
      if (repairItem?.effect) repairItem.effect();
      addLog(`> REPAIR COMPLETE: ${repairItem.name.toUpperCase()}.`);
      setIsRepairing(false);
      setRepairItem(null);
    } else {
      setRepairDays(daysLeft);
      addLog(`> REPAIR IN PROGRESS... ${daysLeft} DAYS REMAINING.`);
    }
  };

  const isFBC = useMeatspaceStore.getState().isFBC;
  const interfaceType = useMeatspaceStore.getState().interfaceType;
  const isCellular = useCyberdeckStore.getState().isCellular;
  const ownedUpgrades = {
    interfacePlugs: interfaceType === 'interfacePlugs',
    trodes: interfaceType === 'trodes',
    cellular: isCellular
  };

  const tabs = [
    { id: 'deck', label: 'DECK' },
    { id: 'neural', label: 'NEURAL' },
    { id: 'cyberware', label: 'CYBERWARE' },
    ...(isFBC ? [{ id: 'fbc', label: 'FBC REPAIR' }] : []),
    { id: 'upgrades', label: 'UPGRADES' }
  ];

  const renderDeckTab = () => (
    <div className="space-y-4">
      <div className="p-3 border border-yellow-500/30 bg-yellow-900/10">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-yellow-400 font-bold">DECK INTEGRITY</span>
          <span className={`font-mono ${cyberdeck.deckHealth > 30 ? 'text-neon-green' : 'text-red-500'}`}>
            {cyberdeck.deckHealth}% / {cyberdeck.maxDeckHealth}%
          </span>
        </div>
        <div className="w-full bg-gray-900 h-4 border border-yellow-500/30">
          <div
            className={`h-full ${cyberdeck.deckHealth > 60 ? 'bg-neon-green' : cyberdeck.deckHealth > 30 ? 'bg-yellow-500' : 'bg-red-500'}`}
            style={{ width: `${(cyberdeck.deckHealth / cyberdeck.maxDeckHealth) * 100}%` }}
          />
        </div>
        {cyberdeck.deckCrashes > 0 && (
          <p className="text-xs text-red-400 mt-2 animate-pulse">
            WARNING: {cyberdeck.deckCrashes} CRITICAL CRASH{cyberdeck.deckCrashes > 1 ? 'ES' : ''}. MAX MU: {cyberdeck.maxMu}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2">
        {[
          { id: 'patch', name: 'Patch Firmware', cost: 200, days: 1, desc: '+30% integrity', effect: () => cyberdeck.repairDeck(30) },
          { id: 'rebuild', name: 'Rebuild Logic', cost: 500, days: 3, desc: '+60% integrity', effect: () => cyberdeck.repairDeck(60) },
          { id: 'full', name: 'Full Restore', cost: 1000, days: 7, desc: '+100% integrity + reset crashes', effect: () => { cyberdeck.repairDeck(100); cyberdeck.resetDeckCrashes(); } },
          { id: 'mu', name: 'Replace Components', cost: 800, days: 5, desc: '+1 max MU', effect: () => cyberdeck.reduceMaxMu(-1) }
        ].map(opt => (
          <button
            key={opt.id}
            onClick={() => handleStartRepair(opt.cost, opt.days, opt.name, opt.effect)}
            disabled={funds < opt.cost || isRepairing}
            className="text-left p-3 border border-yellow-500/30 hover:bg-yellow-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex justify-between">
              <span className="text-yellow-400 font-bold">{opt.name}</span>
              <span className="text-yellow-400">{opt.cost} eb / {opt.days} days</span>
            </div>
            <div className="text-xs text-gray-400 mt-1">{opt.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderNeuralTab = () => {
    const neuralDamage = meatspace.maxHealth - meatspace.health;
    return (
      <div className="space-y-4">
        <div className="p-3 border border-pink-500/30 bg-pink-900/10">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-pink-400 font-bold">NEURAL DAMAGE</span>
            <span className={`font-mono ${neuralDamage <= 0 ? 'text-neon-green' : 'text-red-500'}`}>
              {neuralDamage} damage
            </span>
          </div>
          <div className="text-xs text-gray-400">
            INT: {meatspace.int} | REF: {meatspace.ref}
            {neuralDamage > 0 && <span className="text-red-400 ml-2">(-{Math.floor(neuralDamage/2)} to rolls)</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {[
            { id: 'therapy', name: 'Neural Therapy', cost: 500, days: 3, desc: '-3 neural damage', effect: () => meatspace.healNeuralDamage(3) },
            { id: 'full', name: 'Full Neural Restore', cost: 1500, days: 10, desc: 'Clear all neural damage', effect: () => { 
              const dmg = meatspace.maxHealth - meatspace.health; 
              if (dmg > 0) meatspace.healNeuralDamage(dmg); 
            }}
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => handleStartRepair(opt.cost, opt.days, opt.name, opt.effect)}
              disabled={funds < opt.cost || isRepairing || (opt.id === 'therapy' && neuralDamage < 3) || (opt.id === 'full' && neuralDamage <= 0)}
              className="text-left p-3 border border-pink-500/30 hover:bg-pink-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex justify-between">
                <span className="text-pink-400 font-bold">{opt.name}</span>
                <span className="text-pink-400">{opt.cost} eb / {opt.days} days</span>
              </div>
              <div className="text-xs text-gray-400 mt-1">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderCyberwareTab = () => (
    <div className="space-y-4">
      <div className="p-3 border border-cyan-500/30 bg-cyan-900/10 flex justify-between items-center">
        <div>
          <span className="text-cyan-400 font-bold">HUMANITY: </span>
          <span className={meatspace.humanity <= 30 ? 'text-red-400' : meatspace.humanity <= 50 ? 'text-yellow-400' : 'text-neon-green'}>
            {meatspace.humanity}/{meatspace.maxHumanity}
          </span>
        </div>
        <div className="text-xs">
          {meatspace.cyberpsychosisLevel >= 3 && <span className="text-red-500 animate-pulse">⚠ CRITICAL</span>}
          {meatspace.cyberpsychosisLevel === 2 && <span className="text-yellow-400">⚠ ACTIVE</span>}
          {meatspace.cyberpsychosisLevel === 1 && <span className="text-orange-400">⚠ EARLY</span>}
          {meatspace.cyberpsychosisLevel === 0 && <span className="text-neon-green">✓ STABLE</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
        {cyberware.map(ware => {
          const isInstalled = meatspace.cyberware.some(w => w.id === ware.id);
          const canAfford = funds >= ware.cost;
          
          return (
            <div key={ware.id} className={`p-2 border ${isInstalled ? 'border-green-500/50 bg-green-900/20' : 'border-cyan-500/30'} ${!canAfford && !isInstalled ? 'opacity-50' : ''}`}>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-cyan-300 font-bold text-sm">{ware.name}</span>
                  <div className="text-xs text-gray-400">{ware.desc}</div>
                  {ware.humanityCost > 0 && (
                    <div className="text-xs text-red-400">-{ware.humanityCost} HUM</div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-yellow-400 text-sm">{ware.cost} eb</div>
                  {isInstalled ? (
                    <button
                      onClick={() => {
                        const refund = Math.floor(ware.cost * 0.5);
                        if (confirm(`Remove ${ware.name}? Refund: ${refund} eb`)) {
                          meatspace.removeCyberware(ware.id);
                          meatspace.addFunds(refund);
                          addLog(`> REMOVED ${ware.name.toUpperCase()}. REFUND: ${refund} eb.`);
                          sfx.click();
                        }
                      }}
                      className="text-xs text-red-400 hover:text-red-300 underline"
                    >
                      [REMOVE]
                    </button>
                  ) : (
                    canAfford && (
                      <button
                        onClick={() => {
                          meatspace.deductFunds(ware.cost);
                          meatspace.installCyberware(ware);
                          addLog(`> INSTALLED ${ware.name.toUpperCase()}.`);
                          sfx.loot();
                        }}
                        className="text-xs text-neon-green hover:text-green-300 underline"
                      >
                        [INSTALL]
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderFbcTab = () => {
    const sdp = meatspace.sdp || { head: 0, lArm: 0, rArm: 0, lLeg: 0, rLeg: 0, torso: 0 };
    const maxSdp = meatspace.maxSdp || { head: 30, lArm: 20, rArm: 20, lLeg: 20, rLeg: 20, torso: 40 };
    
    const parts = [
      { id: 'head', name: 'Head', costPerPoint: 20, daysPer10: 2, current: sdp.head, max: maxSdp.head },
      { id: 'torso', name: 'Torso', costPerPoint: 15, daysPer10: 1.5, current: sdp.torso, max: maxSdp.torso },
      { id: 'lArm', name: 'L.Arm', costPerPoint: 10, daysPer10: 1, current: sdp.lArm, max: maxSdp.lArm },
      { id: 'rArm', name: 'R.Arm', costPerPoint: 10, daysPer10: 1, current: sdp.rArm, max: maxSdp.rArm },
      { id: 'lLeg', name: 'L.Leg', costPerPoint: 10, daysPer10: 1, current: sdp.lLeg, max: maxSdp.lLeg },
      { id: 'rLeg', name: 'R.Leg', costPerPoint: 10, daysPer10: 1, current: sdp.rLeg, max: maxSdp.rLeg }
    ];

    return (
      <div className="space-y-4">
        <div className="p-3 border border-orange-500/30 bg-orange-900/10">
          <div className="text-orange-400 font-bold mb-2">STRUCTURAL DAMAGE POINTS (SDP)</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {parts.map(p => (
              <div key={p.id} className="flex justify-between">
                <span className="text-gray-400">{p.name}:</span>
                <span className={p.current < p.max ? 'text-yellow-400' : 'text-neon-green'}>
                  {p.current}/{p.max}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-gray-400 mb-2">INDIVIDUAL PART REPAIR:</div>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {parts.map(p => {
            const damage = p.max - p.current;
            if (damage <= 0) return null;
            const cost = damage * p.costPerPoint;
            const days = Math.ceil((damage * p.daysPer10) / 10);
            
            return (
              <button
                key={p.id}
                onClick={() => handleStartRepair(cost, days, `Repair ${p.name}`, () => {
                  const newSdp = { ...meatspace.sdp };
                  newSdp[p.id] = Math.min(p.max, newSdp[p.id] + damage);
                  meatspace.setState({ sdp: newSdp });
                })}
                disabled={funds < cost || isRepairing}
                className="text-left p-2 border border-orange-500/30 hover:bg-orange-500/10 disabled:opacity-50 text-xs"
              >
                <span className="text-orange-400 font-bold">{p.name}</span>
                <div className="text-gray-400">+{damage} SDP</div>
                <div className="text-orange-400">{cost} eb / {days}d</div>
              </button>
            );
          })}
        </div>

        <div className="text-xs text-gray-400 mb-2">BULK REPAIRS:</div>
        <div className="grid grid-cols-1 gap-2">
          {[
            { id: 'spot', name: 'Spot Repair', cost: 500, days: 2, desc: '+10 random SDP' },
            { id: 'section', name: 'Section Overhaul', cost: 2000, days: 5, desc: '+25 distributed SDP' },
            { id: 'full', name: 'Full Systems', cost: 5000, days: 14, desc: '+75 distributed SDP' },
            { id: 'complete', name: 'Complete Rebuild', cost: 15000, days: 30, desc: 'Full restore all parts' }
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => {
                const effect = () => {
                  const currentSdp = meatspace.sdp;
                  const currentMaxSdp = meatspace.maxSdp;
                  
                  if (opt.id === 'complete') {
                    meatspace.setState({ sdp: { ...currentMaxSdp } });
                  } else {
                    let repairAmount = opt.id === 'spot' ? 10 : opt.id === 'section' ? 25 : 75;
                    const newSdp = { ...currentSdp };
                    const locations = Object.keys(newSdp);
                    
                    while (repairAmount > 0 && locations.length > 0) {
                      const randomLoc = locations[Math.floor(Math.random() * locations.length)];
                      if (newSdp[randomLoc] < currentMaxSdp[randomLoc]) {
                        newSdp[randomLoc]++;
                        repairAmount--;
                      } else {
                        locations.splice(locations.indexOf(randomLoc), 1);
                      }
                    }
                    meatspace.setState({ sdp: newSdp });
                  }
                };
                handleStartRepair(opt.cost, opt.days, opt.name, effect);
              }}
              disabled={funds < opt.cost || isRepairing}
              className="text-left p-3 border border-orange-500/30 hover:bg-orange-500/10 disabled:opacity-50"
            >
              <div className="flex justify-between">
                <span className="text-orange-400 font-bold">{opt.name}</span>
                <span className="text-orange-400">{opt.cost} eb / {opt.days} days</span>
              </div>
              <div className="text-xs text-gray-400 mt-1">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderUpgradesTab = () => {
    const upgrades = [
      { id: 'interface_plugs', name: 'Interface Plugs', cost: 1500, show: interfaceType !== 'interfacePlugs', desc: '+1 ALL, +50% neural dmg' },
      { id: 'trodes', name: 'Trode Set', cost: 20, show: interfaceType !== 'trodes' && interfaceType !== 'interfacePlugs', desc: '-1 ALL, safe (no extra dmg)' },
      { id: 'memory', name: 'Memory Expansion +1', cost: 500, show: true, desc: '+1 max MU' },
      { id: 'coprocessor', name: 'Coprocessor', cost: 3000, show: true, desc: 'Extra action per turn' },
      { id: 'speed', name: 'Speed Chip', cost: 3000, show: true, desc: 'Move 2 cells per turn' },
      { id: 'ripple', name: 'Ripple System', cost: 4000, show: true, desc: '+1 trace defense per jump' },
      { id: 'cellular', name: 'Cellular Mod', cost: 4000, show: !isCellular, desc: 'Orbital LDL launch, -1 trace risk' },
      { id: 'scramble', name: 'Scramble Chip', cost: 5000, show: true, desc: 'Emergency jack-out, no trace penalty' }
    ];

    return (
      <div className="grid grid-cols-1 gap-2">
        {upgrades.filter(u => u.show).map(upg => (
          <button
            key={upg.id}
            onClick={() => {
              sfx.click();
              if (funds < upg.cost) {
                addLog(`> INSUFFICIENT FUNDS.`);
                sfx.error();
                return;
              }
              
              deductFunds(upg.cost);
              
              switch (upg.id) {
                case 'interface_plugs':
                  meatspace.setInterfaceType('interfacePlugs');
                  break;
                case 'trodes':
                  meatspace.setInterfaceType('trodes');
                  break;
                case 'memory':
                  cyberdeck.upgradeMu(1);
                  break;
                case 'coprocessor':
                  cyberdeck.addCoprocessor();
                  break;
                case 'speed':
                  cyberdeck.addSpeed();
                  break;
                case 'ripple':
                  cyberdeck.addRipple();
                  break;
                case 'cellular':
                  cyberdeck.setCellular(true);
                  break;
                case 'scramble':
                  addLog(`> SCRAMBLE CHIP INSTALLED. EMERGENCY JACK-OUT NOW HAS NO TRACE PENALTY.`);
                  break;
              }
              
              addLog(`> ${upg.name.toUpperCase()} INSTALLED.`);
              sfx.loot();
            }}
            disabled={funds < upg.cost || isRepairing}
            className="text-left p-3 border border-purple-500/30 hover:bg-purple-500/10 disabled:opacity-50"
          >
            <div className="flex justify-between">
              <span className="text-purple-400 font-bold">{upg.name}</span>
              <span className="text-yellow-400">{upg.cost} eb</span>
            </div>
            <div className="text-xs text-gray-400 mt-1">{upg.desc}</div>
          </button>
        ))}
        
        {upgrades.filter(u => u.show).length === 0 && (
          <div className="text-center text-gray-500 p-4">
            All upgrades installed.
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    if (isRepairing) {
      return (
        <div className="text-center py-8">
          <div className="text-2xl font-bold text-yellow-400 mb-4 animate-pulse">
            REPAIRING: {repairItem?.name?.toUpperCase()}
          </div>
          <div className="text-sm text-gray-400 mb-4">
            DAYS REMAINING: {repairDays}
          </div>
          <button
            onClick={handleFinishDay}
            className="bg-yellow-500 text-black px-4 py-2 font-bold hover:bg-yellow-400"
          >
            [ PASS DAY ]
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'deck': return renderDeckTab();
      case 'neural': return renderNeuralTab();
      case 'cyberware': return renderCyberwareTab();
      case 'fbc': return renderFbcTab();
      case 'upgrades': return renderUpgradesTab();
      default: return null;
    }
  };

  return (
    <div className="bg-black border-2 border-neon-green p-4 shadow-[0_0_30px_#00ffcc40] max-w-2xl w-full max-h-[80vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold tracking-widest text-neon-green">TECHIE VISIT</h3>
        <button onClick={onClose} className="text-neon-green hover:text-black hover:bg-neon-green px-2 py-1 border border-neon-green transition-colors text-sm">
          [ CLOSE ]
        </button>
      </div>

      <div className="flex gap-1 mb-4 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); sfx.click(); }}
            className={`px-3 py-2 text-xs font-bold border transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-neon-green text-black border-neon-green'
                : 'border-neon-green/30 text-neon-green hover:bg-neon-green/20'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="text-xs text-gray-400 mb-4">
        FUNDS: <span className="text-yellow-400">{funds} eb</span>
      </div>

      {renderContent()}
    </div>
  );
}