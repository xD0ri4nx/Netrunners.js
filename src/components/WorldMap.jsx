import { useState } from 'react';
import { useRoutingStore } from '../store/routingStore';
import { useTerminalStore } from '../store/terminalStore';
import { useCyberdeckStore } from '../store/cyberdeckStore';
import { LDL_DATABASE, CORP_THEMES } from '../data/ldlDatabase';
import { sfx } from '../utils/sfx';

export function WorldMap({ onExecute, onAbort }) {
  const [activeRegion, setActiveRegion] = useState('na'); // Default to North America

  const currentLdl = useRoutingStore(state => state.currentLdl);
  const routeHistory = useRoutingStore(state => state.routeHistory);
  const traceDefense = useRoutingStore(state => state.traceDefense);
  const traceRisk = useRoutingStore(state => state.traceRisk);
  const setStartingLdl = useRoutingStore(state => state.setStartingLdl);
  const jumpToLdl = useRoutingStore(state => state.jumpToLdl);
  const addTraceRisk = useRoutingStore(state => state.addTraceRisk);

  const isCellular = useCyberdeckStore(state => state.isCellular);

  const addLog = useTerminalStore(state => state.addLog);

  const ldlNodes = Object.values(LDL_DATABASE);

  const REGION_TABS = [
    { id: 'na', label: 'N.AMERICA' },
    { id: 'sa', label: 'S.AMERICA' },
    { id: 'euro', label: 'EUROPE' },
    { id: 'asia', label: 'PACIFICA' },
    { id: 'equat', label: 'EQUATORIAL' },
    { id: 'space', label: 'DEEP SPACE' },
    { id: 'wild', label: 'WILD ZONE' }
  ];

  const handleNodeClick = (targetId) => {
    sfx.click();
    const target = LDL_DATABASE[targetId];

    if (!currentLdl) {
      if (target.region !== 'earth' && !isCellular) {
        sfx.error();
        addLog("> ERROR: LAUNCH POINT MUST BE EARTH-BASED. UPGRADE TO CELLULAR DECK FOR ORBITAL LAUNCH.");
        return;
      }
      if (isCellular && target.region !== 'earth') {
        const reducedTrace = Math.max(0, target.traceMod - 1);
        setStartingLdl(targetId);
        addLog(`> CELLULAR DECK ACTIVE. ORBITAL ROUTING INITIATED AT ${target.name.toUpperCase()}. TRACE RISK REDUCED.`);
        return;
      }
      setStartingLdl(targetId);
      addLog(`> ROUTING INITIATED AT ${target.name.toUpperCase()}.`);
      return;
    }

    const current = LDL_DATABASE[currentLdl];

    if (routeHistory.includes(targetId)) {
      addLog("> ERROR: NODE ALREADY IN ROUTE PATH.");
      return;
    }

    const distance = Math.sqrt(Math.pow(target.x - current.x, 2) + Math.pow(target.y - current.y, 2));
    if (distance > 5.8) { 
      sfx.error();
      addLog("> DISTANCE EXCEEDS 5 SPACES. INTERMEDIATE LDL REQUIRED.");
      return;
    }

    if (target.region === 'orbit' && current.region === 'earth' && !current.isEquatorial) {
      sfx.error();
      addLog("> ORBITAL INSERTION DENIED. MUST LAUNCH FROM EQUATORIAL GRID.");
      return;
    }
    
    const targetIsDeepSpace = target.region === 'luna' || target.region === 'mars';
    const currentIsDeepSpace = current.region === 'luna' || current.region === 'mars';
    
    if (targetIsDeepSpace && current.region !== 'orbit' && !currentIsDeepSpace) {
      sfx.error();
      addLog("> DEEP SPACE TRANSMISSION FAILED. REQUIRES ORBITAL RELAY.");
      return;
    }

    if (target.isGhostTown) {
      addLog(`> WARNING: ENTERING GHOST TOWN: ${target.name.toUpperCase()}...`);
      addLog(`> SECURITY LEVEL: ${target.sec} (FERAL ICE ZONE)`);
      const roll = Math.floor(Math.random() * 10) + 1;
      if (roll >= target.sec) {
        sfx.loot();
        const defenseGain = isCellular ? target.traceDefense + 1 : target.traceDefense;
        jumpToLdl(targetId, defenseGain);
        addLog(`> BYPASS SUCCESSFUL. NO TRACE DEFENSE GAINED.`);
      } else {
        sfx.damage();
        const penalty = Math.floor(Math.random() * 6) + 1;
        addTraceRisk(penalty);
        addLog(`> FERAL ICE DETECTED! TRACE PLANTED: +${penalty} TRACE RISK.`);
      }
      return;
    }

    addLog(`> BYPASSING ${target.name.toUpperCase()} SECURITY (SEC: ${target.sec})...`);
    const roll = Math.floor(Math.random() * 10) + 1;

    if (roll >= target.sec) {
      sfx.loot();
      const defenseGain = isCellular ? target.traceDefense + 1 : target.traceDefense;
      jumpToLdl(targetId, defenseGain);
      if (isCellular) {
        addLog(`> CELLULAR DECK BOOST. TRACE DEFENSE INCREASED BY ${defenseGain} (DEF: ${useRoutingStore.getState().traceDefense}).`);
      } else {
        addLog(`> SCAM SUCCESSFUL. TRACE DEFENSE INCREASED BY ${defenseGain}. (CURRENT DEF: ${useRoutingStore.getState().traceDefense})`);
      }
    } else {
      sfx.damage();
      const penalty = Math.floor(Math.random() * 6) + 1;
      addTraceRisk(penalty);
      addLog(`> SCAM FAILED! CORPORATE ALERT TRIGGERED. +${penalty} TRACE RISK.`);
    }
  };

  return (
    <div className="flex flex-col items-center w-full h-full max-w-4xl bg-black/90 border-2 border-neon-green p-4 shadow-[0_0_30px_#00ffcc40] z-50">
      <div className="flex justify-between items-center w-full border-b border-neon-green pb-2 mb-4">
        <h2 className="text-xl font-bold tracking-widest text-shadow-glow">NAVIGATOR V1.4</h2>
        <div className="flex gap-4 text-xs sm:text-sm font-bold">
          <span className="text-teal-400">DEFENSE: {traceDefense}</span>
          <span className="text-red-500 animate-pulse">RISK: {traceRisk}</span>
        </div>
      </div>

      {/* REGION TABS */}
      <div className="w-full flex flex-wrap gap-2 mb-4">
        {REGION_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => { sfx.click(); setActiveRegion(tab.id); }}
            className={`flex-1 min-w-[80px] text-[10px] sm:text-xs font-bold px-2 py-1 border transition-colors ${activeRegion === tab.id ? 'bg-neon-green text-black border-neon-green' : 'border-neon-green/30 text-neon-green hover:bg-neon-green/20'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="relative w-full h-[350px] sm:h-[400px] border border-neon-green/30 bg-green-900/10 overflow-hidden mb-4 rounded">
        
        {/* Route Lines Layer */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {routeHistory.map((id, index) => {
            if (index === 0) return null;
            const prev = LDL_DATABASE[routeHistory[index - 1]];
            const curr = LDL_DATABASE[id];
            return (
              <line 
                key={`${prev.id}-${curr.id}`}
                x1={`${(prev.x / 20) * 100}%`} y1={`${(prev.y / 24) * 100}%`} 
                x2={`${(curr.x / 20) * 100}%`} y2={`${(curr.y / 24) * 100}%`} 
                stroke="#00ffcc" strokeWidth="2" opacity="0.6"
              />
            );
          })}
        </svg>

        {/* Nodes Layer */}
        {ldlNodes.map(node => {
          const isCurrent = currentLdl === node.id;
          const isVisited = routeHistory.includes(node.id);
          const isActiveRegion = node.group === activeRegion;

          return (
            <div 
              key={node.id}
              onClick={() => isActiveRegion ? handleNodeClick(node.id) : null}
              className={`absolute w-4 h-4 -ml-2 -mt-2 rounded-full transition-all z-20 
                ${isActiveRegion ? 'pointer-events-auto hover:scale-150 cursor-pointer' : 'pointer-events-none opacity-20'}
                ${node.isGhostTown ? 'bg-purple-900 border-2 border-purple-500 animate-pulse' :
                  isCurrent ? 'bg-white shadow-[0_0_15px_#ffffff] animate-pulse opacity-100' : 
                  isVisited ? 'bg-green-700 opacity-100' : 
                  node.region === 'earth' ? 'bg-neon-green hover:bg-white' : 
                  node.region === 'orbit' ? 'bg-blue-400 hover:bg-white' : 'bg-red-500 hover:bg-white'}
              `}
              style={{ left: `${(node.x / 20) * 100}%`, top: `${(node.y / 24) * 100}%` }}
              title={`${node.name}\nSec: ${node.sec}${node.corp && CORP_THEMES[node.corp] ? '\nCorp: ' + CORP_THEMES[node.corp].name : ''}${node.isGhostTown ? '\nGHOST TOWN: Feral ICE' : ''}`}
            >
              <span className={`absolute left-6 top-1/2 -translate-y-1/2 whitespace-nowrap font-mono text-[9px] sm:text-[10px] ${node.isGhostTown ? 'text-purple-400' : 'text-neon-green'} drop-shadow-md pointer-events-none ${isActiveRegion ? 'opacity-80' : 'opacity-0'}`}>
                {node.name}
              </span>
            </div>
          );
        })}

        {/* Atmosphere Decor Layer (Only visible in SPACE tab) */}
        {activeRegion === 'space' && (
          <>
            <div className="absolute top-[50%] w-full border-t border-dashed border-blue-500/30 pointer-events-none z-10">
               <span className="absolute text-[8px] text-blue-500/50 p-1 pointer-events-none">ORBITAL LAYER</span>
            </div>
            <div className="absolute top-[80%] w-full border-t border-dashed border-red-500/30 pointer-events-none z-10">
               <span className="absolute text-[8px] text-red-500/50 p-1 pointer-events-none">DEEP SPACE</span>
            </div>
          </>
        )}
      </div>

      <div className="flex gap-4 w-full justify-between mt-auto">
        <button 
          onClick={onAbort} 
          className="border border-red-500 text-red-500 px-6 py-2 hover:bg-red-500 hover:text-black cursor-pointer transition-colors z-50 pointer-events-auto text-sm sm:text-base"
        >
          [ ABORT ROUTE ]
        </button>
        <button 
          onClick={onExecute}
          disabled={!currentLdl}
          className={`px-4 sm:px-6 py-2 border-2 font-bold cursor-pointer transition-colors z-50 pointer-events-auto text-sm sm:text-base
            ${currentLdl ? 'bg-green-950 text-white border-neon-green hover:bg-neon-green hover:text-black' : 'bg-gray-900 border-gray-700 text-gray-500 cursor-not-allowed'}
          `}
        >
          [ EXECUTE DATAFORT BREACH ]
        </button>
      </div>
    </div>
  );
}