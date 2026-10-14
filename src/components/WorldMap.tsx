import { useMultiplayerStore } from "../store/multiplayerStore";
import type { TargetLocation, PlayerRole } from "../shared/multiplayerTypes";
import { useState, useRef, useEffect, MouseEvent } from 'react';
import { useRoutingStore } from '../store/routingStore';
import { useTerminalStore } from '../store/terminalStore';
import { useCyberdeckStore } from '../store/cyberdeckStore';
import { useMeatspaceStore } from '../store/meatspaceStore';
import { LDL_DATABASE, CORP_THEMES, getSubNodes } from '../data/ldlDatabase';
import { sfx } from '../utils/sfx';
const rollD10 = (): number => rollD10();
const rollD6 = (): number => rollD6();

export function WorldMap({ onExecute, onAbort, onIntercept }: { onExecute: () => void; onAbort: () => void; onIntercept?: () => void }) {
  const [activeRegion, setActiveRegion] = useState<string>('na');
  const [showSubNodes, setShowSubNodes] = useState<boolean>(() => {
    if (useRoutingStore.getState().currentLdl) return false;
    const home = useMeatspaceStore.getState().homeLdl || "night_city";
    return getSubNodes(home).length > 0;
  });
  const [selectedMainLdl, setSelectedMainLdl] = useState<string | null>(() => {
    if (useRoutingStore.getState().currentLdl) return null;
    const home = useMeatspaceStore.getState().homeLdl || "night_city";
    return getSubNodes(home).length > 0 ? home : null;
  });
  const [showSpaceMap, setShowSpaceMap] = useState<boolean>(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [scrollPos, setScrollPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - scrollPos.x, y: e.clientY - scrollPos.y });
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !mapRef.current) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    const maxX = mapRef.current.scrollWidth - mapRef.current.clientWidth;
    const maxY = mapRef.current.scrollHeight - mapRef.current.clientHeight;
    const clampedX = Math.max(0, Math.min(newX, maxX));
    const clampedY = Math.max(0, Math.min(newY, maxY));
    setScrollPos({ x: clampedX, y: clampedY });
    mapRef.current.scrollLeft = clampedX;
    mapRef.current.scrollTop = clampedY;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const isAldrinCyclerActive = useRoutingStore((state) => state.isAldrinCyclerActive);
  const mpStore = useMultiplayerStore();
  const connect = useMultiplayerStore((state) => state.connect);
  const [showMultiplayer, setShowMultiplayer] = useState<boolean>(false);
  const [joinSessionId, setJoinSessionId] = useState<string>("");
  const [selectedTarget, setSelectedTarget] = useState<TargetLocation>("EARTH");
  const [selectedRole, setSelectedRole] = useState<PlayerRole>("NETRUNNER");
  const currentLdl = useRoutingStore(state => state.currentLdl);
  const routeHistory = useRoutingStore(state => state.routeHistory);
  const traceDefense = useRoutingStore(state => state.traceDefense);
  const traceRisk = useRoutingStore(state => state.traceRisk);
  const setStartingLdl = useRoutingStore(state => state.setStartingLdl);
  const jumpToLdl = useRoutingStore(state => state.jumpToLdl);
  const cyclerOpen = useRoutingStore(state => state.cyclerOpen);
  const nextCyclerMins = useRoutingStore(state => state.nextCyclerMins);
  const gridsecPatrols = useRoutingStore(state => state.gridsecPatrols);
  const addTraceRisk = useRoutingStore(state => state.addTraceRisk);

  const isCellular = useCyberdeckStore(state => state.isCellular);

  const addLog = useTerminalStore((state: { addLog: (m: string) => void }) => state.addLog);

  const isSpaceMap = showSpaceMap;
  
  const earthLdlNodes = Object.values(LDL_DATABASE).filter((ldl) => ldl.isMain && ldl.region !== 'orbit' && ldl.region !== 'luna' && ldl.region !== 'mars');
  const spaceLdlNodes = Object.values(LDL_DATABASE).filter((ldl) => ldl.isMain && (ldl.region === 'orbit' || ldl.region === 'luna' || ldl.region === 'mars'));
  const ldlNodes = isSpaceMap ? spaceLdlNodes : earthLdlNodes;

  useEffect(() => {
    useRoutingStore.getState().rollAldrinCycler();
  }, []);

  useEffect(() => {
    if (useRoutingStore.getState().currentLdl) return;
    const home = useMeatspaceStore.getState().homeLdl || 'night_city';
    if (LDL_DATABASE[home]?.group === 'wild' && !useCyberdeckStore.getState().peripherals.radioRelay) {
      useTerminalStore.getState().addLog('> ERROR: CAMPED IN THE OPEN WITH NO RADIO RELAY UPLINK. CANNOT NETRUN FROM OUTSIDE CITIES.');
      return;
    }
    if (getSubNodes(home).length > 0) {
      useTerminalStore.getState().addLog(`> LOCAL GRID DETECTED: ${(LDL_DATABASE[home]?.name ?? home).toUpperCase()}. SELECT ENTRY POINT.`);
    } else {
      setStartingLdl(home);
      useTerminalStore.getState().addLog(`> JACKING IN FROM PHYSICAL LOCATION: ${(LDL_DATABASE[home]?.name ?? home).toUpperCase()}.`);
    }
  }, [setStartingLdl]);

  // Orbital nodes (y 25..31) are spread across the full map height so each layer is readable.
  const spaceY = (y: number): number => ((y - 25) / 6) * 92 + 4;
  const earthY = (y: number): number => (y / 24) * 100;
  // Orbital x 13..20 is centered into a middle band so nodes sit mid-map.
  const spaceX = (x: number): number => ((x - 13) / 7) * 44 + 28;
  const earthX = (x: number): number => (x / 20) * 100;

  const currentLdlData = currentLdl ? LDL_DATABASE[currentLdl] : null;
  const canAccessSpace = currentLdlData && currentLdlData.isEquatorial;

  const REGION_TABS = [
    { id: 'na', label: 'N.AMERICA' },
    { id: 'sa', label: 'S.AMERICA' },
    { id: 'euro', label: 'EUROPE' },
    { id: 'asia', label: 'PACIFICA' },
    { id: 'equat', label: 'EQUATORIAL' },
    { id: 'wild', label: 'WILD ZONE' }
  ];

  const handleSpaceClick = () => {
    if (!canAccessSpace) {
      sfx.error();
      addLog("> ERROR: ORBITAL ACCESS REQUIRES EQUATORIAL GRID.");
      return;
    }
    sfx.click();
    const st = useRoutingStore.getState();
    if (st.currentLdl && LDL_DATABASE[st.currentLdl]?.region === 'earth') {
      const gain = (isCellular ? LDL_DATABASE['leo_dock'].traceDefense + 1 : LDL_DATABASE['leo_dock'].traceDefense);
      jumpToLdl('leo_dock', gain);
      addLog(`> ORBITAL INSERTION VIA LOW EARTH ORBIT. TRACE DEFENSE +${gain}.`);
    }
    setShowSpaceMap(true);
    setActiveRegion('space');
    addLog("> LAUNCHING TO ORBITAL GRID...");
  };

  const handleReturnToEarth = () => {
    sfx.click();
    const backLink = currentLdlData?.backLink || 'nairobi';
    setShowSpaceMap(false);
    setActiveRegion('equat');
    setStartingLdl(backLink);
    addLog(`> RETURNING TO EARTH VIA ${LDL_DATABASE[backLink]?.name.toUpperCase()}...`);
  };

  const checkCycler = (target: { region: string; name: string }): boolean => {
    if (target.region === 'mars' && !useRoutingStore.getState().cyclerOpen) {
      const mins = useRoutingStore.getState().nextCyclerMins;
      sfx.error();
      addLog(`> MARS TRANSFER DENIED: EARTH-MARS CYCLER NOT ACCEPTING PUBLIC TRAFFIC. NEXT WINDOW IN ${mins} MIN.`);
      return false;
    }
    return true;
  };

  // Cycler countdown ticks while the orbital map is open (future: gates Mars access)
  useEffect(() => {
    if (!showSpaceMap) return;
    const id = setInterval(() => useRoutingStore.getState().tickCycler(), 60000);
    return () => clearInterval(id);
  }, [showSpaceMap]);

  const checkInterception = (targetId: string) => {
    const st = useRoutingStore.getState();
    if (st.hasPatrolAtLdl(targetId) || st.interceptionLdl === targetId) {
      addLog(`> WARNING: GRIDSEC PATROL AT ${LDL_DATABASE[targetId]?.name.toUpperCase()}. INTERDICTION IMMINENT.`);
      onIntercept?.();
      return true;
    }
    return false;
  };

  const handleNodeClick = (targetId: string) => {
    sfx.click();
    const target = LDL_DATABASE[targetId];
    
    const subNodesForLdl = getSubNodes(targetId);
    if (!currentLdl && subNodesForLdl.length > 0) {
      setSelectedMainLdl(targetId);
      setShowSubNodes(true);
      addLog(`> ${target.name.toUpperCase()} DETECTED. SUB-NODES AVAILABLE.`);
      return;
    }

    const deck = useCyberdeckStore.getState();
    const routingState = useRoutingStore.getState();
    const hasOffWorldHardware = deck.hasTightbeamMaser || routingState.completedOrbitalUplink || isCellular;

    if (target.region !== "earth" && !hasOffWorldHardware) {
      sfx.error();
      addLog("> ERROR: ORBITAL UPLINK NODE OR TIGHTBEAM MASER ARRAY REQUIRED FOR OFF-WORLD ROUTING.");
      return;
    }

    if (isSpaceMap) {
      if (!currentLdl) {
        setStartingLdl(targetId);
        addLog(`> ORBITAL NAVIGATOR SET: ${target.name.toUpperCase()}.`);
        return;
      }
      if (!checkCycler(target)) return;
      const gain = isCellular ? target.traceDefense + 1 : target.traceDefense;
      jumpToLdl(targetId, gain);
      addLog(`> ORBITAL TRANSFER TO ${target.name.toUpperCase()}. TRACE DEFENSE +${gain}.`);
      checkInterception(targetId);
      return;
    }

    if (!currentLdl) {
      const home = useMeatspaceStore.getState().homeLdl || 'night_city';
      const isHomeTurf = targetId === home || target.parentLdl === home;
      if (target.region !== 'earth' && !isCellular) {
        sfx.error();
        addLog("> ERROR: LAUNCH POINT MUST BE EARTH-BASED. UPGRADE TO CELLULAR DECK FOR ORBITAL LAUNCH.");
        return;
      }
      if (isCellular && target.region !== 'earth') {
        setStartingLdl(targetId);
        addLog(`> CELLULAR DECK ACTIVE. ORBITAL ROUTING INITIATED AT ${target.name.toUpperCase()}. TRACE RISK REDUCED.`);
        return;
      }
      if (!isHomeTurf) {
        sfx.error();
        addLog(`> ERROR: MUST JACK IN FROM PHYSICAL LOCATION (${(LDL_DATABASE[home]?.name ?? home).toUpperCase()}).`);
        return;
      }
      if (LDL_DATABASE[targetId]?.group === 'wild' && !useCyberdeckStore.getState().peripherals.radioRelay) {
        sfx.error();
        addLog('> ERROR: RADIO RELAY UPLINK REQUIRED TO NETRUN FROM THE OPEN ROAD.');
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
      const roll = rollD10();
      if (roll >= target.sec) {
        if (!checkCycler(target)) return;
        sfx.loot();
        const defenseGain = isCellular ? target.traceDefense + 1 : target.traceDefense;
        jumpToLdl(targetId, defenseGain);
        addLog(`> BYPASS SUCCESSFUL. NO TRACE DEFENSE GAINED.`);
        checkInterception(targetId);
      } else {
        sfx.damage();
        const penalty = rollD6();
        addTraceRisk(penalty);
        addLog(`> FERAL ICE DETECTED! TRACE PLANTED: +${penalty} TRACE RISK.`);
      }
      return;
    }

    addLog(`> BYPASSING ${target.name.toUpperCase()} SECURITY (SEC: ${target.sec})...`);
    const roll = rollD10();

    if (roll >= target.sec) {
      sfx.loot();
      const defenseGain = isCellular ? target.traceDefense + 1 : target.traceDefense;
      jumpToLdl(targetId, defenseGain);
      if (checkInterception(targetId)) return;
      if (isCellular) {
        addLog(`> CELLULAR DECK BOOST. TRACE DEFENSE INCREASED BY ${defenseGain} (DEF: ${useRoutingStore.getState().traceDefense}).`);
      } else {
        addLog(`> SCAM SUCCESSFUL. TRACE DEFENSE INCREASED BY ${defenseGain}. (CURRENT DEF: ${useRoutingStore.getState().traceDefense})`);
      }
    } else {
      sfx.damage();
      const penalty = rollD6();
      addTraceRisk(penalty);
      addLog(`> SCAM FAILED! CORPORATE ALERT TRIGGERED. +${penalty} TRACE RISK.`);
    }
  };

  return (
    <div className="flex flex-col items-center w-full h-full max-w-4xl bg-black/90 border-2 border-neon-green p-4 shadow-[0_0_30px_#00ffcc40] z-50">
      <div className="flex justify-between items-center w-full border-b border-neon-green pb-2 mb-4">
        <h2 className="text-xl font-bold tracking-widest text-shadow-glow">NAVIGATOR {isSpaceMap ? 'V1.5 - ORBITAL' : 'V1.4'}</h2>
        <div className="flex gap-4 text-xs sm:text-sm font-bold items-center">
          {isAldrinCyclerActive && (
            <span className="border border-cyan-400 text-cyan-300 px-2 py-0.5 text-xs font-bold animate-pulse bg-cyan-950/40">
              [ ALDRIN CYCLER RELAY - 0 LAG ]
            </span>
          )}
          <button
            onClick={() => {
              sfx.click();
              setShowMultiplayer(!showMultiplayer);
              if (mpStore.status === "DISCONNECTED") {
                connect();
              }
            }}
            className="border border-purple-400 text-purple-300 hover:bg-purple-400 hover:text-black px-2 py-0.5 text-xs cursor-pointer font-bold"
          >
            [ MULTIPLAYER: {mpStore.status} ]
          </button>
          <span className="text-teal-400">DEFENSE: {traceDefense}</span>
          <span className="text-red-500 animate-pulse">RISK: {traceRisk}</span>
          {isSpaceMap && (
            <span className={cyclerOpen ? 'text-green-400' : 'text-yellow-400 animate-pulse'}>
              CYCLER: {cyclerOpen ? 'IN POSITION — BOARDING' : `T-${nextCyclerMins} MIN`}
            </span>
          )}
        </div>
      </div>
      {showMultiplayer && (
        <div className="w-full border-2 border-purple-500/60 bg-black/95 p-3 mb-3 text-xs z-50">
          <div className="flex justify-between items-center border-b border-purple-500/30 pb-2 mb-2 font-bold text-purple-400">
            <span>GRIDRUNNER 20XX // MULTIPLAYER RELAY</span>
            <span>RTT: {mpStore.rtt}ms | STATUS: {mpStore.status}</span>
          </div>
          {mpStore.error && (
            <div className="text-red-400 mb-2 border border-red-500/30 p-1 bg-red-950/20 font-bold">
              [!] {mpStore.error}
            </div>
          )}
          {(mpStore.status === "DISCONNECTED" || mpStore.status === "ERROR") && (
            <div className="mb-2">
              <button
                onClick={() => connect()}
                className="border border-purple-400 text-purple-300 px-2 py-1 text-xs hover:bg-purple-400 hover:text-black font-bold cursor-pointer"
              >
                [ CONNECT TO RELAY ]
              </button>
            </div>
          )}
          {mpStore.sessionId ? (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-neon-green font-bold">ACTIVE SESSION: {mpStore.sessionId}</span>
                <span className="text-cyan-400 font-bold">ROLE: {mpStore.role}</span>
              </div>
              {mpStore.penalties?.warningMessage && (
                <div className="text-yellow-400 text-[10px]">{mpStore.penalties.warningMessage}</div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => mpStore.jackOut()}
                  className="border border-red-500 text-red-400 px-3 py-1 font-bold hover:bg-red-500 hover:text-black cursor-pointer"
                >
                  [ JACK OUT ]
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2 border border-gray-800 p-2 bg-black/40">
                <div className="font-bold text-neon-green">CREATE NEW SESSION</div>
                <div className="flex gap-2 items-center">
                  <span className="text-gray-400">TARGET:</span>
                  <select
                    value={selectedTarget}
                    onChange={(e) => setSelectedTarget(e.target.value as TargetLocation)}
                    className="bg-black border border-neon-green/40 text-neon-green px-2 py-0.5 text-xs"
                  >
                    <option value="EARTH">EARTH</option>
                    <option value="GEO_ORBIT">GEO_ORBIT</option>
                    <option value="APEX_RING">APEX_RING</option>
                    <option value="LUNA">LUNA</option>
                    <option value="MARS">MARS</option>
                  </select>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="text-gray-400">ROLE:</span>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as PlayerRole)}
                    className="bg-black border border-neon-green/40 text-neon-green px-2 py-0.5 text-xs"
                  >
                    <option value="NETRUNNER">NETRUNNER</option>
                    <option value="SYSOP">SYSOP</option>
                  </select>
                </div>
                <button
                  onClick={() => mpStore.createSession(selectedTarget, selectedRole)}
                  className="w-full border border-neon-green text-neon-green py-1 font-bold hover:bg-neon-green hover:text-black cursor-pointer"
                >
                  [ CREATE SESSION ]
                </button>
              </div>

              <div className="space-y-2 border border-gray-800 p-2 bg-black/40">
                <div className="font-bold text-cyan-400">JOIN EXISTING SESSION</div>
                <input
                  type="text"
                  placeholder="SESSION ID"
                  value={joinSessionId}
                  onChange={(e) => setJoinSessionId(e.target.value)}
                  className="w-full bg-black border border-cyan-500/40 text-cyan-400 px-2 py-1 text-xs"
                />
                <button
                  disabled={!joinSessionId.trim()}
                  onClick={() => mpStore.joinSession(joinSessionId.trim(), selectedRole)}
                  className="w-full border border-cyan-400 text-cyan-400 py-1 font-bold hover:bg-cyan-400 hover:text-black disabled:opacity-40 cursor-pointer"
                >
                  [ JOIN AS {selectedRole} ]
                </button>
              </div>
            </div>
          )}
        </div>
      )}

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

      <div 
        ref={mapRef}
        className="relative w-full h-[350px] sm:h-[400px] border border-neon-green/30 bg-green-900/10 overflow-hidden mb-4 rounded cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="min-w-[120%] min-h-[120%] relative">
        
        {/* Route Lines Layer */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {routeHistory.map((id, index) => {
            if (index === 0) return null;
            const prev = LDL_DATABASE[routeHistory[index - 1]];
            const curr = LDL_DATABASE[id];
            const prevIsSpace = prev.region === 'orbit' || prev.region === 'luna' || prev.region === 'mars';
            const currIsSpace = curr.region === 'orbit' || curr.region === 'luna' || curr.region === 'mars';
            if (isSpaceMap && !(prevIsSpace && currIsSpace)) return null;
            if (!isSpaceMap && (prevIsSpace || currIsSpace)) return null;
            const prevY = isSpaceMap && prevIsSpace ? spaceY(prev.y) : earthY(prev.y);
            const currY = isSpaceMap && currIsSpace ? spaceY(curr.y) : earthY(curr.y);
            return (
              <line 
                key={`${prev.id}-${curr.id}`}
                x1={`${isSpaceMap ? spaceX(prev.x) : earthX(prev.x)}%`} y1={`${prevY}%`} 
                x2={`${isSpaceMap ? spaceX(curr.x) : earthX(curr.x)}%`} y2={`${currY}%`} 
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
          const hasPatrol = !!gridsecPatrols[node.id];

          const isSpaceRegion = node.region === 'orbit' || node.region === 'luna' || node.region === 'mars';
              const xPos = isSpaceMap ? spaceX(node.x) : earthX(node.x);
              const yPos = isSpaceMap ? spaceY(node.y) : earthY(node.y);
              return (
                <div 
                  key={node.id}
                  onClick={() => isActiveRegion ? handleNodeClick(node.id) : null}
                  className={`absolute w-4 h-4 -ml-2 -mt-2 rounded-full transition-all z-20 
                    ${isActiveRegion ? 'pointer-events-auto hover:scale-150 cursor-pointer' : 'pointer-events-none opacity-20'}
                    ${node.isGhostTown ? 'bg-purple-900 border-2 border-purple-500 animate-pulse' :
                      isCurrent ? 'bg-white shadow-[0_0_15px_#ffffff] animate-pulse opacity-100' : 
                      isVisited ? 'bg-green-700 opacity-100' : 
                      isSpaceRegion ? 'bg-blue-400 hover:bg-white' : 'bg-neon-green hover:bg-white'}
                  `}
                  style={{ left: `${xPos}%`, top: `${yPos}%` }}
                title={`${node.name}\nSec: ${node.sec}${node.corp && CORP_THEMES[node.corp] ? '\nCorp: ' + CORP_THEMES[node.corp].name : ''}${node.isGhostTown ? '\nGHOST TOWN: Feral ICE' : ''}${hasPatrol ? '\n[!] GRIDSEC PATROL' : ''}`}
              >
                {hasPatrol && (
                  <span className="absolute -inset-1 rounded-full border-2 border-red-500 animate-ping pointer-events-none" />
                )}
                {hasPatrol && (
                  <span className="absolute -inset-1 rounded-full border border-red-500 pointer-events-none" />
                )}
                <span className={`absolute left-6 top-1/2 -translate-y-1/2 whitespace-nowrap font-mono font-bold text-[10px] sm:text-xs ${node.isGhostTown ? 'text-purple-300' : 'text-neon-green'} drop-shadow-md pointer-events-none ${isActiveRegion ? 'opacity-100 bg-black/70 px-1' : 'opacity-0'}`}>
                  {node.name}
                </span>
              </div>
            );
        })}

        {/* Atmosphere Decor Layer (Only visible in SPACE tab) */}
        {activeRegion === 'space' && (
          <>
            <div className="absolute top-[0%] w-full border-t-2 border-dashed border-cyan-400 pointer-events-none z-10">
               <span className="absolute text-[10px] sm:text-xs font-bold text-cyan-400 bg-black/70 px-1 pointer-events-none">LOW EARTH ORBIT</span>
            </div>
            <div className="absolute top-[29%] w-full border-t-2 border-dashed border-blue-400 pointer-events-none z-10">
               <span className="absolute text-[10px] sm:text-xs font-bold text-blue-400 bg-black/70 px-1 pointer-events-none">ORBITAL STATIONS</span>
            </div>
            <div className="absolute top-[59%] w-full border-t-2 border-dashed border-purple-400 pointer-events-none z-10">
               <span className="absolute text-[10px] sm:text-xs font-bold text-purple-400 bg-black/70 px-1 pointer-events-none">APEX ORBITAL RING — CISLUNAR GATE</span>
            </div>
            <div className="absolute top-[75%] w-full border-t-2 border-dashed border-gray-300 pointer-events-none z-10">
               <span className="absolute text-[10px] sm:text-xs font-bold text-gray-200 bg-black/70 px-1 pointer-events-none">LUNA</span>
            </div>
            <div className="absolute top-[90%] w-full border-t-2 border-dashed border-red-500 pointer-events-none z-10">
               <span className="absolute text-[10px] sm:text-xs font-bold text-red-400 bg-black/70 px-1 pointer-events-none">MARS — CYCLER {cyclerOpen ? 'IN POSITION' : `T-${nextCyclerMins} MIN`}</span>
            </div>
          </>
        )}
        </div>
      </div>

      {/* SUB-NODE SELECTION MODAL */}
      {showSubNodes && selectedMainLdl && (
        <div className="absolute inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-black border-2 border-neon-green p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-neon-green mb-4">
              {LDL_DATABASE[selectedMainLdl]?.name} - SUB-NODES
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Select a sub-network or access the main corporate grid directly.
            </p>
            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
              {getSubNodes(selectedMainLdl).map(subNode => (
                <button
                  key={subNode.id}
                  onClick={() => {
                    sfx.click();
                    const home = useMeatspaceStore.getState().homeLdl || 'night_city';
                    if (subNode.id !== home && subNode.parentLdl !== home) {
                      sfx.error();
                      addLog(`> ERROR: MUST JACK IN FROM PHYSICAL LOCATION (${(LDL_DATABASE[home]?.name ?? home).toUpperCase()}).`);
                      return;
                    }
                    setShowSubNodes(false);
                    setStartingLdl(subNode.id);
                    addLog(`> WEEFLERUNNER NODE DETECTED. JACKING IN TO ${subNode.name.toUpperCase()}...`);
                  }}
                  className={`w-full text-left p-3 border transition-colors
                    ${subNode.isWeefle ? 'border-pink-500/50 hover:bg-pink-900/30 text-pink-300' : 
                      subNode.isGhostTown ? 'border-purple-500/50 hover:bg-purple-900/30 text-purple-300' : 
                      'border-neon-green/50 hover:bg-neon-green/20 text-neon-green'}
                  `}
                >
                  <div className="font-bold text-sm">{subNode.name}</div>
                  <div className="text-xs opacity-70">Security: {subNode.sec} {subNode.isWeefle ? '| WEEFLERUNNER GRID' : ''}{subNode.isGhostTown ? '| GHOST TOWN' : ''}</div>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  sfx.click();
                  const home = useMeatspaceStore.getState().homeLdl || 'night_city';
                  if (selectedMainLdl !== home) {
                    sfx.error();
                    addLog(`> ERROR: MUST JACK IN FROM PHYSICAL LOCATION (${(LDL_DATABASE[home]?.name ?? home).toUpperCase()}).`);
                    return;
                  }
                  setShowSubNodes(false);
                  const target = LDL_DATABASE[selectedMainLdl];
                  setStartingLdl(selectedMainLdl);
                  addLog(`> ROUTING INITIATED AT ${target.name.toUpperCase()}.`);
                }}
                className="flex-1 border border-neon-green text-neon-green py-2 hover:bg-neon-green hover:text-black transition-colors"
              >
                [ MAIN GRID ]
              </button>
              <button
                onClick={() => {
                  sfx.click();
                  setShowSubNodes(false);
                  setSelectedMainLdl(null);
                }}
                className="flex-1 border border-gray-500 text-gray-400 py-2 hover:bg-gray-800 transition-colors"
              >
                [ CANCEL ]
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-4 w-full justify-between mt-auto">
        {isSpaceMap ? (
          <button 
            onClick={handleReturnToEarth}
            className="border border-blue-400 text-blue-400 px-6 py-2 hover:bg-blue-400 hover:text-black cursor-pointer transition-colors z-50 pointer-events-auto text-sm sm:text-base"
          >
            [ RETURN TO EARTH ]
          </button>
        ) : (
          <button 
            onClick={onAbort} 
            className="border border-red-500 text-red-500 px-6 py-2 hover:bg-red-500 hover:text-black cursor-pointer transition-colors z-50 pointer-events-auto text-sm sm:text-base"
          >
            [ ABORT ROUTE ]
          </button>
        )}
        
        {isSpaceMap ? (
          <button 
            onClick={onExecute}
            disabled={!currentLdl}
            className={`px-4 sm:px-6 py-2 border-2 font-bold cursor-pointer transition-colors z-50 pointer-events-auto text-sm sm:text-base
              ${currentLdl ? 'bg-blue-950 text-white border-blue-400 hover:bg-blue-400 hover:text-black' : 'bg-gray-900 border-gray-700 text-gray-500 cursor-not-allowed'}
            `}
          >
            [ INITIATE ORBITAL BREACH ]
          </button>
        ) : (
          <>
            {canAccessSpace && (
              <button 
                onClick={handleSpaceClick}
                className="border border-cyan-400 text-cyan-400 px-4 py-2 hover:bg-cyan-400 hover:text-black cursor-pointer transition-colors z-50 pointer-events-auto text-sm sm:text-base animate-pulse"
              >
                [ LAUNCH TO ORBIT ]
              </button>
            )}
            <button 
              onClick={onExecute}
              disabled={!currentLdl}
              className={`px-4 sm:px-6 py-2 border-2 font-bold cursor-pointer transition-colors z-50 pointer-events-auto text-sm sm:text-base
                ${currentLdl ? 'bg-green-950 text-white border-neon-green hover:bg-neon-green hover:text-black' : 'bg-gray-900 border-gray-700 text-gray-500 cursor-not-allowed'}
              `}
            >
              [ EXECUTE DATAFORT BREACH ]
            </button>
          </>
        )}
      </div>
    </div>
  );
}
