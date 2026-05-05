import { useMachine } from '@xstate/react';
import { useEffect, useState, useRef } from 'react';
import { gamePhaseMachine } from './machine/gamePhaseMachine';
import { TheNet } from './components/TheNet';
import { WorldMap } from './components/WorldMap';
import { useTerminalStore } from './store/terminalStore';
import { useCyberdeckStore } from './store/cyberdeckStore';
import { useMeatspaceStore } from './store/meatspaceStore';
import { useRoutingStore } from './store/routingStore';
import { useMissionStore } from './store/missionStore';
import { sfx } from './utils/sfx';
import { ShopPanel } from './components/ShopPanel';
import { TechiePanel } from './components/TechiePanel';
import { TuningPanel } from './components/TuningPanel';
import { ProgrammingPanel } from './components/ProgrammingPanel';
import { BrainwarePanel } from './components/BrainwarePanel';
import RipperdocPanel from './components/RipperdocPanel';
import FixerPanel from './components/FixerPanel';
import { CharacterCreation } from './components/CharacterCreation';

export default function App() {
  const [state, send] = useMachine(gamePhaseMachine);
  const [bootLog, setBootLog] = useState([]);

  const [showLeftPanel, setShowLeftPanel] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [showProgramming, setShowProgramming] = useState(false);
  const [showTechie, setShowTechie] = useState(false);
  const [showTuning, setShowTuning] = useState(false);
  const [showRipperdoc, setShowRipperdoc] = useState(false);
  const [showFixer, setShowFixer] = useState(false);
  const [showBrainware, setShowBrainware] = useState(false);
  const [showCharacterCreation, setShowCharacterCreation] = useState(false);

  const [showFoodMenu, setShowFoodMenu] = useState(false);
  const foodMenuRef = useRef(null);

  const [showHousingMenu, setShowHousingMenu] = useState(false);
  const housingMenuRef = useRef(null);

  const [showUtilityMenu, setShowUtilityMenu] = useState(false);
  const utilityMenuRef = useRef(null);

  const [rivalEncounter, setRivalEncounter] = useState(null);

  const meatspace = useMeatspaceStore();
  const cyberdeck = useCyberdeckStore();
  const terminalLogs = useTerminalStore((state) => state.logs);
  const { resetRoute } = useRoutingStore();
  const missionStore = useMissionStore();

  const handleAction = (type) => {
    sfx.click();
    send({ type });
    setShowLeftPanel(false);
    setShowRightPanel(false);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (foodMenuRef.current && !foodMenuRef.current.contains(event.target)) {
        setShowFoodMenu(false);
      }
      if (housingMenuRef.current && !housingMenuRef.current.contains(event.target)) {
        setShowHousingMenu(false);
      }
      if (utilityMenuRef.current && !utilityMenuRef.current.contains(event.target)) {
        setShowUtilityMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [foodMenuRef, housingMenuRef, utilityMenuRef]);

  useEffect(() => {
    if (state.matches('safehouse')) {
      const currentTraceRisk = useRoutingStore.getState().traceRisk;
      if (currentTraceRisk >= 20) {
        sfx.error();
        send({ type: 'TRIGGER_RAID' });
        return;
      }

      useMeatspaceStore.getState().heal();
      resetRoute();
      
      // Phase 17: End immersion mode and calculate penalties
      const meatspaceStore = useMeatspaceStore.getState();
      if (meatspaceStore.isImmersionMode) {
        const result = meatspaceStore.endImmersion();
        useTerminalStore.getState().addLog(`> ${result.message}`);
        if (meatspaceStore.systemShockActive) {
          useTerminalStore.getState().addLog(`> SYSTEM SHOCK ACTIVE. -${meatspaceStore.int}/${meatspaceStore.ref} FOR ${meatspaceStore.systemShockHours}h.`);
        }
      }
      // Process system shock countdown if active
      if (meatspaceStore.systemShockActive) {
        meatspaceStore.processSystemShock();
      }

      const currentMission = useMissionStore.getState();
      if (currentMission.activeJob && currentMission.payloadSecured) {
        sfx.loot();
        useMeatspaceStore.getState().addFunds(currentMission.activeJob.payout);
        useTerminalStore.getState().addLog(`> INCOMING TRANSMISSION: FIXER PAYMENT CONFIRMED.`);
        useTerminalStore.getState().addLog(`> TRANSFERRING ${currentMission.activeJob.payout} eb TO UNREGISTERED ACCOUNT.`);

        currentMission.clearJob();
        currentMission.generateJobs();
      }
    }

    if (state.matches('jacking_in')) {
      const logs = [
        "> INITIATING NEURAL HANDSHAKE...",
        "> BYPASSING CORTICAL FILTERS...",
        "> IHARA-GRUBB ALGORITHM ENGAGED...",
        "> SENSORY TRANSFER COMPLETE."
      ];

      let delay = 0;
      logs.forEach((log) => {
        setTimeout(() => {
          setBootLog(prev => [...prev, log]);
          sfx.click();
        }, delay += 800);
      });

      const finishTimer = setTimeout(() => {
        send({ type: 'CONNECTION_ESTABLISHED' });
      }, 4000);

      return () => clearTimeout(finishTimer);
    } else {
      setBootLog([]);
    }
  }, [state.value, send, resetRoute]);

  useEffect(() => {
    if (missionStore.availableJobs.length === 0) {
      useMissionStore.getState().generateJobs();
    }
  }, [missionStore.availableJobs.length]);

  return (
      <div className="h-screen w-screen bg-terminal-black text-neon-green flex flex-col overflow-hidden crt-flicker relative">
        <div className="crt-overlay pointer-events-none z-50"></div>

        {/* MOBILE HEADER */}
        <div className="md:hidden flex justify-between items-center p-3 border-b border-neon-green/30 bg-black z-40 text-xs sm:text-sm font-bold tracking-widest">
          <button onClick={() => {setShowLeftPanel(!showLeftPanel); setShowRightPanel(false);}} className="border border-neon-green px-2 py-1 active:bg-neon-green active:text-black">[ MEATSPACE ]</button>
          <span className="text-red-500 animate-pulse">SYS_OS</span>
          <button onClick={() => {setShowRightPanel(!showRightPanel); setShowLeftPanel(false);}} className="border border-neon-green px-2 py-1 active:bg-neon-green active:text-black">[ CYBERDECK ]</button>
        </div>

        {/* DESKTOP LAYOUT WRAPPER */}
        <div className="flex-1 flex overflow-hidden">

        {/* LEFT PANEL: MEATSPACE */}
        <div className={`w-[240px] flex-shrink-0 bg-black/95 border-r border-neon-green/30 p-4 flex flex-col gap-4 overflow-y-auto scrollbar-hide shadow-2xl md:relative
        ${showLeftPanel || true ? '' : 'hidden'} md:block`}>

          <div className="flex justify-between items-center border-b border-neon-green pb-2">
            <h2 className="text-xl font-bold uppercase tracking-widest text-shadow-glow">Meatspace</h2>
            <button className="md:hidden text-red-500 border border-red-500 px-3 py-1 font-bold" onClick={() => setShowLeftPanel(false)}>X</button>
          </div>
          <p>&gt; HANDLE: {meatspace.handle}</p>
          <p>&gt; INT: {meatspace.int} | REF: {meatspace.ref}</p>
          <p>&gt; INTERFACE: +{meatspace.interfaceLvl}</p>
          {meatspace.interfaceType !== 'default' && (
              <p className={`text-xs font-bold ${meatspace.interfaceType === 'interfacePlugs' ? 'text-red-400' : 'text-gray-400'}`}>
                &gt; NEURAL: {meatspace.interfaceType === 'interfacePlugs' ? 'INTERFACE PLUGS (+1 ALL / +50% DMG)' : 'TRODE SET (-1 ALL / SAFE)'}
              </p>
          )}
          <p className={`mt-2 font-bold ${meatspace.health <= 3 ? 'text-red-500 animate-pulse' : 'text-neon-green'}`}>
            {meatspace.isFBC ? (
              <>
                <p className="text-xs font-bold text-orange-400">&gt; SDP (STRUCTURAL):</p>
                <div className="text-xs text-gray-400 grid grid-cols-2 gap-1 ml-2">
                  <span>HEAD: {meatspace.sdp?.head || 0}</span>
                  <span>L.ARM: {meatspace.sdp?.lArm || 0}</span>
                  <span>R.ARM: {meatspace.sdp?.rArm || 0}</span>
                  <span>L.LEG: {meatspace.sdp?.lLeg || 0}</span>
                  <span>R.LEG: {meatspace.sdp?.rLeg || 0}</span>
                  <span>TORSO: {meatspace.sdp?.torso || 0}</span>
                </div>
                {meatspace.currentChassis && (
                  <p className="text-xs text-cyan-400 mt-1">[ {meatspace.ownedChassis?.find(c => c.id === meatspace.currentChassis)?.name || 'UNKNOWN'} ]</p>
                )}
              </>
            ) : (
              <p className={`mt-2 font-bold ${meatspace.health <= 3 ? 'text-red-500 animate-pulse' : 'text-neon-green'}`}>
                &gt; NEURAL HP: {meatspace.health} / {meatspace.maxHealth}
              </p>
            )}
          </p>
          <p className="mt-4 text-yellow-400 font-bold">&gt; FUNDS: {meatspace.funds} eb</p>

          {/* HOUSING INFO */}
          <div className="mt-3 border-t border-neon-green/30 pt-3">
            {meatspace.isStreet ? (
              <p className="text-xs text-red-400 font-bold">&gt; HOMELESS (NO SAFEHOUSE)</p>
            ) : (
              <>
                <p className="text-xs font-bold text-neon-green">&gt; HOUSING:</p>
                <p className="text-xs text-gray-400">
                  {meatspace.housingType === 'coffin' && 'COFFIN/CUBE (Combat Zone)'}
                  {meatspace.housingType === 'apartment' && 'STUDIO APARTMENT (Moderate Zone)'}
                  {meatspace.housingType === 'penthouse' && 'CORPORATE PENTHOUSE (High Zone)'}
                </p>
                <p className="text-xs text-gray-400">
                  Rent: {meatspace.housingCost} eb/month | Due in: {Math.max(0, meatspace.daysPerMonth - meatspace.daysPassedInMonth)} days
                </p>
                {meatspace.housingType === 'penthouse' && (
                  <p className="text-xs text-cyan-400">[CLEAN LANDLINE: -2 TRACE RISK]</p>
                )}
              </>
            )}
          </div>

          {/* HUNGER INFO */}
          <div className="mt-3 border-t border-neon-green/30 pt-3">
            <p className="text-xs font-bold text-neon-green">&gt; HUNGER:</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-full bg-gray-900 h-2 border border-gray-600">
                <div 
                  className={`h-full transition-all ${meatspace.hunger > 30 ? 'bg-green-600' : meatspace.hunger > 0 ? 'bg-yellow-600' : 'bg-red-600 animate-pulse'}`}
                  style={{ width: `${meatspace.hunger}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 w-12">{meatspace.hunger}%</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Diet: {meatspace.foodType === 'kibble' && 'KIBBLE (50 eb)'}
              {meatspace.foodType === 'prepack' && 'PREPACK (150 eb)'}
              {meatspace.foodType === 'fresh' && 'FRESH (500 eb)'}
            </p>
            {meatspace.starvingDays > 0 && (
              <p className="text-xs text-red-400 animate-pulse">
                STARVING: {meatspace.starvingDays} DAYS! -1 INT/REF AT 3 DAYS
              </p>
            )}
            {meatspace.freshFoodBonus && (
              <p className="text-xs text-green-400">FRESH FOOD BONUS: +1 {meatspace.freshFoodBonus.stat.toUpperCase()}</p>
            )}
          </div>

          {/* SLEEP INFO */}
          <div className="mt-3 border-t border-neon-green/30 pt-3">
            <p className="text-xs font-bold text-neon-green">&gt; SLEEP:</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-full bg-gray-900 h-2 border border-gray-600">
                <div 
                  className={`h-full transition-all ${meatspace.sleep > 30 ? 'bg-blue-600' : meatspace.sleep > 0 ? 'bg-yellow-600' : 'bg-red-600 animate-pulse'}`}
                  style={{ width: `${meatspace.sleep}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 w-12">{meatspace.sleep}%</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Hours Awake: {meatspace.hoursAwake} | Stimulants: {meatspace.stimulants}
            </p>
            {meatspace.hoursAwake > 16 && (
              <p className="text-xs text-red-400 animate-pulse">
                DEPRIVATION: -{Math.floor((meatspace.hoursAwake - 16) / 8)} INT/REF PER 8h
              </p>
            )}
            {meatspace.isStimulated && (
              <p className="text-xs text-purple-400">STIMULANT ACTIVE (+8h Awake, -10 Sleep)</p>
            )}
          </div>

          {/* TELECOM INFO */}
          <div className="mt-3 border-t border-neon-green/30 pt-3">
            <p className="text-xs font-bold text-neon-green">&gt; TELECOM:</p>
            <p className="text-xs text-gray-400">
              Bill: {meatspace.telecomBill} eb | Routing Time: {meatspace.routingMinutes} min
            </p>
            <p className="text-xs text-gray-400">
              Landline: {meatspace.housingCost > 0 ? 'ACTIVE' : 'INACTIVE'}
            </p>
          </div>

          {/* IMMERSION HARDWARE INFO */}
          <div className="mt-3 border-t border-neon-green/30 pt-3">
            <p className="text-xs font-bold text-purple-400">&gt; IMMERSION:</p>
            {meatspace.hasBodyweightSystem ? (
              <>
                <p className="text-xs text-gray-400">
                  BODYWEIGHT: EQUIPPED
                </p>
                <p className="text-xs text-gray-400">
                  Nutrient Packs: {meatspace.nutrientPacks} | Max: {meatspace.hasDataCreche ? '96h' : '72h'}
                </p>
                {meatspace.systemShockActive && (
                  <p className="text-xs text-red-400 font-bold animate-pulse">
                    SYSTEM SHOCK: -{meatspace.int}/{meatspace.ref} FOR {meatspace.systemShockHours}h
                  </p>
                )}
              </>
            ) : (
              <p className="text-xs text-gray-500">NO IMMERSION SYSTEM</p>
            )}
            {meatspace.crecheInstalled && (
              <p className="text-xs text-purple-400">[DATA CRECHE: ACTIVE]</p>
            )}
          </div>

          {/* INSTALLED CYBERWARE */}
          {meatspace.cyberware && meatspace.cyberware.length > 0 && (
            <div className="mt-4 border-t border-neon-green/30 pt-3">
              <p className="text-xs font-bold text-cyan-400 mb-2">&gt; CYBERWARE:</p>
              <div className="space-y-1">
                {meatspace.cyberware.map((ware) => (
                  <div key={ware.id} className="text-xs flex justify-between items-center border border-cyan-500/30 bg-cyan-900/10 px-2 py-1">
                    <span className="text-cyan-300">{ware.name}</span>
                    {ware.humanityCost > 0 && (
                      <span className="text-red-400 text-[10px]">-{ware.humanityCost} HUM</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {missionStore.activeJob && (
              <div className={`mt-4 border p-2 ${missionStore.activeJob.isHeist ? 'border-orange-500/50 bg-orange-900/20' : 'border-blue-500/50 bg-blue-900/20'}`}>
                <p className={`font-bold text-sm mb-1 uppercase ${missionStore.activeJob.isHeist ? 'text-orange-400' : 'text-blue-400'}`}>
                  {missionStore.activeJob.isHeist ? 'HEIST CONTRACT' : 'ACTIVE CONTRACT'}
                </p>
                <p className="text-xs opacity-80">{missionStore.activeJob.title}</p>
                <p className="text-xs opacity-80 mt-1">TARGET: {missionStore.activeJob.targetLdlName}</p>
                {missionStore.activeJob.isHeist && missionStore.activeJob.turnLimit && (
                    <p className="text-xs font-bold text-red-400 mt-1">
                      TURNS: {missionStore.activeJob.turnLimit}
                    </p>
                )}
                <p className={`text-xs font-bold mt-2 ${missionStore.payloadSecured ? 'text-neon-green animate-pulse' : 'text-red-400'}`}>
                  STATUS: {missionStore.payloadSecured ? 'PAYLOAD SECURED. RETURN.' : 'PENDING EXTRACTION'}
                </p>
              </div>
          )}
        </div>

        {/* CENTER VIEWPORT */}
        <div className="flex-1 p-2 md:p-4 flex items-center justify-center relative z-0 overflow-hidden min-w-0">
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#00ffcc_1px,transparent_1px),linear-gradient(to_bottom,#00ffcc_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
          <div className="relative text-center w-full flex justify-center pointer-events-auto h-full items-center overflow-y-auto">

            {state.matches('raid') && (
                <div className="flex flex-col items-center justify-center w-full max-w-lg bg-black/90 border-4 border-red-600 p-6 shadow-[0_0_50px_#dc262680]">
                  <h1 className="text-3xl sm:text-4xl font-bold bg-red-600 text-black w-full py-2 tracking-widest mb-4 animate-pulse">NETWATCH RAID</h1>
                  <p className="text-sm sm:text-base mb-4 text-red-400">WARNING: CRITICAL TRACE THRESHOLD EXCEEDED.</p>
                  <p className="text-sm sm:text-base mb-6">Corporate security has triangulated your physical IP address. Heavily armed Netwatch operatives are breaching the Safehouse door.</p>

                  <div className="flex flex-col gap-4 w-full">
                    <button
                        onClick={() => {
                          if (meatspace.funds >= 2000) {
                            meatspace.deductFunds(2000);
                            resetRoute();
                            sfx.loot();
                            useTerminalStore.getState().addLog(`> FUNDS TRANSFERRED. NEW SIN GENERATED. CRISIS AVERTED.`);
                            send({ type: 'SURVIVED_RAID' });
                          } else {
                            sfx.error();
                            useTerminalStore.getState().addLog("> ERROR: INSUFFICIENT FUNDS FOR BRIBE.");
                          }
                        }}
                        className="bg-black text-yellow-400 border-2 border-yellow-400 p-4 hover:bg-yellow-400 hover:text-black font-bold transition-all text-sm sm:text-base"
                    >
                      [ BURN SIN & BRIBE COPS (2000 eb) ]
                    </button>
                    <button
                        onClick={() => {
                          sfx.flatline();
                          localStorage.clear();
                          window.location.reload();
                        }}
                        className="bg-black text-red-500 border border-red-500/50 p-4 hover:bg-red-500 hover:text-black font-bold transition-all text-sm sm:text-base"
                    >
                      [ SURRENDER (PERMANENT SAVE WIPE) ]
                    </button>
                  </div>
                </div>
            )}

            {state.matches('safehouse') && (
                <div className="flex flex-col items-center gap-4 sm:gap-6 w-full max-w-sm px-4">
                  <h1 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-4 animate-pulse text-red-500 tracking-widest">SYSTEM READY</h1>
                  <button onClick={() => handleAction('OPEN_NAVIGATOR')} className="bg-green-950 text-white w-full px-4 py-4 sm:px-8 text-xl sm:text-2xl font-bold border-2 border-neon-green shadow-[0_0_15px_#00ffcc] hover:bg-neon-green hover:text-black transition-all cursor-pointer">
                    [ RUN THE NET ]
                  </button>
                  <div className="flex flex-col sm:flex-row gap-4 w-full">
                    <button onClick={() => handleAction('OPEN_JOBS')} className="bg-black text-blue-400 w-full px-4 py-3 border border-blue-400/50 hover:bg-blue-400 hover:text-black transition-all cursor-pointer">
                      [ FIXER JOBS ]
                    </button>
                    <button onClick={() => handleAction('OPEN_SHOP')} className="bg-black text-neon-green w-full px-4 py-3 border border-neon-green/50 hover:bg-neon-green hover:text-black transition-all cursor-pointer">
                      [ BLACK MARKET ]
                    </button>
                  </div>
                  <button onClick={() => { sfx.click(); setShowProgramming(true); }} className="bg-black text-purple-400 w-full px-4 py-3 border border-purple-400/50 hover:bg-purple-400 hover:text-black transition-all cursor-pointer">
                    [ CUSTOM PROGRAMMING ]
                  </button>
                  <button onClick={() => { sfx.click(); setShowTechie(true); }} className={`w-full px-4 py-3 border transition-all cursor-pointer ${meatspace.isFBC ? 'bg-black text-orange-400 border-orange-400/50 hover:bg-orange-400 hover:text-black' : 'bg-black text-yellow-400 border-yellow-400/50 hover:bg-yellow-400 hover:text-black'}`}>
                    [ TECHIE VISIT ]
                  </button>
                  <button onClick={() => { sfx.click(); setShowTuning(true); }} className="bg-black text-orange-400 w-full px-4 py-3 border border-orange-400/50 hover:bg-orange-400 hover:text-black transition-all cursor-pointer">
                    [ HARDWARE TUNING ]
                  </button>
                  {meatspace.isFBC && meatspace.ownedChassis.length > 1 && (
                    <button 
                      onClick={() => {
                        sfx.click();
                        // Show chassis swap modal
                        const chassisOptions = meatspace.ownedChassis.map(c => `${c.name} (${c.id === meatspace.currentChassis ? 'ACTIVE' : 'IDLE'})`).join(', ');
                        useTerminalStore.getState().addLog(`> OWNED CHASSIS: ${chassisOptions}`);
                      }}
                      className="bg-black text-cyan-400 w-full px-4 py-2 border border-cyan-400/50 hover:bg-cyan-400 hover:text-black transition-all cursor-pointer text-xs"
                    >
                      [ SWAP CHASSIS ]
                    </button>
                  )}
                  <button onClick={() => { sfx.click(); setShowBrainware(true); }} className="bg-black text-pink-400 w-full px-4 py-3 border border-pink-400/50 hover:bg-pink-400 hover:text-black transition-all cursor-pointer">
                    [ BRAINWARE ]
                  </button>
                  <button onClick={() => { sfx.click(); setShowRipperdoc(true); }} className="bg-black text-red-400 w-full px-4 py-3 border border-red-400/50 hover:bg-red-400 hover:text-black transition-all cursor-pointer">
                    [ RIPPERDOC ]
                  </button>
                  <button onClick={() => { sfx.click(); setShowFixer(true); }} className="bg-black text-orange-400 w-full px-4 py-3 border border-orange-400/50 hover:bg-orange-400 hover:text-black transition-all cursor-pointer">
                    [ FIXER ]
                  </button>
                  <button 
                    onClick={() => {
                      sfx.click();
                      const meatspace = useMeatspaceStore.getState();
                      // Check and pay rent if due
                      if (meatspace.daysPassedInMonth >= meatspace.daysPerMonth) {
                        if (meatspace.funds >= meatspace.housingCost) {
                          meatspace.deductFunds(meatspace.housingCost);
                          useTerminalStore.getState().addLog(`> RENT PAID: ${meatspace.housingCost} eb. NEW MONTH STARTED.`);
                        } else {
                          useMeatspaceStore.setState({ isStreet: true, housingType: 'street', housingCost: 0, daysPassedInMonth: 0 });
                          useTerminalStore.getState().addLog(`> WARNING: RENT UNPAID. SAFEHOUSE LOST. HOMELESS.`);
                        }
                        useMeatspaceStore.setState({ daysPassedInMonth: 0 });
                      } else {
                        useMeatspaceStore.setState({ daysPassedInMonth: meatspace.daysPassedInMonth + 1 });
                        useTerminalStore.getState().addLog(`> TIME PASSED. DAYS: ${meatspace.daysPassedInMonth + 1}/${meatspace.daysPerMonth}.`);
                        // Process hunger each day
                        useMeatspaceStore.getState().processDayHunger();
                        // Process sleep each day
                        useMeatspaceStore.getState().processDaySleep();
                      }
                    }} 
                    className="bg-black text-gray-400 w-full px-4 py-3 border border-gray-500/50 hover:bg-gray-500 hover:text-black transition-all cursor-pointer"
                  >
                    [ PASS DAY ]
                  </button>
                  <div className="relative w-full" ref={foodMenuRef}>
                    <button 
                      onClick={() => {
                        sfx.click();
                        setShowFoodMenu(!showFoodMenu);
                      }} 
                      className="bg-black text-yellow-400 w-full px-4 py-3 border border-yellow-500/50 hover:bg-yellow-500 hover:text-black transition-all cursor-pointer font-bold flex justify-between items-center"
                    >
                      <span>[ EAT ]</span>
                      <span>{showFoodMenu ? '▲' : '▼'}</span>
                    </button>
                    
                    {showFoodMenu && (
                      <div className="absolute top-full left-0 w-full bg-black border-2 border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.3)] z-50 mt-1 animate-dropdown">
                        <div className="p-2 border-b border-yellow-500/30 bg-yellow-500/10 flex justify-between items-center">
                          <span className="text-[10px] font-bold text-yellow-500 tracking-tighter uppercase">Nutrition Status</span>
                          <span className="text-[10px] font-bold text-yellow-500 uppercase">HUNGER: {meatspace.hunger}%</span>
                        </div>
                        
                        <div className="flex flex-col">
                          <button 
                            onClick={() => {
                              sfx.click();
                              const result = useMeatspaceStore.getState().eatFood('prepack');
                              useTerminalStore.getState().addLog(`> ${result.message}`);
                              setShowFoodMenu(false);
                            }} 
                            disabled={meatspace.funds < 150}
                            className={`px-4 py-3 text-left transition-all flex justify-between items-center border-b border-yellow-500/20 last:border-0
                              ${meatspace.funds >= 150 ? 'text-yellow-400 hover:bg-yellow-500/20 cursor-pointer' : 'text-gray-600 cursor-not-allowed opacity-50'}`}
                          >
                            <div className="flex flex-col">
                              <span className="font-bold text-sm">○ PREPACK</span>
                              <span className="text-[10px] opacity-70">+60 HUNGER</span>
                            </div>
                            <span className="font-bold text-xs">150 eb</span>
                          </button>

                          <button 
                            onClick={() => {
                              sfx.click();
                              const result = useMeatspaceStore.getState().eatFood('kibble');
                              useTerminalStore.getState().addLog(`> ${result.message}`);
                              setShowFoodMenu(false);
                            }} 
                            disabled={meatspace.funds < 50}
                            className={`px-4 py-3 text-left transition-all flex justify-between items-center border-b border-yellow-500/20 last:border-0
                              ${meatspace.funds >= 50 ? 'text-orange-400 hover:bg-orange-500/20 cursor-pointer' : 'text-gray-600 cursor-not-allowed opacity-50'}`}
                          >
                            <div className="flex flex-col">
                              <span className="font-bold text-sm">○ KIBBLE</span>
                              <span className="text-[10px] opacity-70">-1 HUMANITY</span>
                            </div>
                            <span className="font-bold text-xs">50 eb</span>
                          </button>

                          <button 
                            onClick={() => {
                              sfx.click();
                              const result = useMeatspaceStore.getState().eatFood('fresh');
                              useTerminalStore.getState().addLog(`> ${result.message}`);
                              setShowFoodMenu(false);
                            }} 
                            disabled={meatspace.funds < 500}
                            className={`px-4 py-3 text-left transition-all flex justify-between items-center
                              ${meatspace.funds >= 500 ? 'text-green-400 hover:bg-green-500/20 cursor-pointer' : 'text-gray-600 cursor-not-allowed opacity-50'}`}
                          >
                            <div className="flex flex-col">
                              <span className="font-bold text-sm">○ FRESH</span>
                              <span className="text-[10px] opacity-70">+1 INT (24H)</span>
                            </div>
                            <span className="font-bold text-xs">500 eb</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => {
                      sfx.click();
                      useMeatspaceStore.getState().rest();
                      useTerminalStore.getState().addLog(`> RESTED. SLEEP RESTORED TO 100%.`);
                    }} 
                    className="bg-black text-blue-400 w-full px-4 py-2 border border-blue-500/50 hover:bg-blue-500 hover:text-black transition-all cursor-pointer text-xs"
                  >
                    [ REST (FULLY RESTORE SLEEP) ]
                  </button>
                  <button 
                    onClick={() => {
                      sfx.click();
                      const result = useMeatspaceStore.getState().useStimulant();
                      useTerminalStore.getState().addLog(`> ${result.message}`);
                    }} 
                    disabled={meatspace.stimulants <= 0}
                    className={`w-full px-4 py-2 border text-xs transition-all cursor-pointer ${meatspace.stimulants > 0 ? 'bg-black text-purple-400 border-purple-500/50 hover:bg-purple-500 hover:text-black' : 'bg-gray-900 text-gray-500 border-gray-700 cursor-not-allowed'}`}
                  >
                    [ USE STIMULANT ]
                  </button>
                  <button 
                    onClick={() => {
                      sfx.click();
                      const result = useMeatspaceStore.getState().buyStimulants(1);
                      useTerminalStore.getState().addLog(`> ${result.message}`);
                    }} 
                    disabled={meatspace.funds < 100}
                    className={`w-full px-4 py-2 border text-xs transition-all cursor-pointer ${meatspace.funds >= 100 ? 'bg-black text-pink-400 border-pink-500/50 hover:bg-pink-500 hover:text-black' : 'bg-gray-900 text-gray-500 border-gray-700 cursor-not-allowed'}`}
                  >
                    [ BUY STIMULANT (100 eb) ]
                  </button>
                  <div className="relative w-full" ref={utilityMenuRef}>
                    <button 
                      onClick={() => {
                        sfx.click();
                        setShowUtilityMenu(!showUtilityMenu);
                      }} 
                      className={`w-full px-4 py-3 border transition-all cursor-pointer font-bold flex justify-between items-center ${meatspace.telecomBill > 0 ? 'bg-black text-teal-400 border-teal-500/50 hover:bg-teal-500 hover:text-black' : 'bg-black text-gray-500 border-gray-700 hover:bg-gray-800'}`}
                    >
                      <span>[ UTILITIES ]</span>
                      <span>{showUtilityMenu ? '▲' : '▼'}</span>
                    </button>
                    
                    {showUtilityMenu && (
                      <div className="absolute top-full left-0 w-full bg-black border-2 border-teal-500 shadow-[0_0_20px_rgba(20,184,166,0.3)] z-50 mt-1 animate-dropdown">
                        <div className="p-2 border-b border-teal-500/30 bg-teal-500/10 flex justify-between items-center">
                          <span className="text-[10px] font-bold text-teal-500 uppercase">Utility Status</span>
                          <span className="text-[10px] font-bold text-teal-500 uppercase">TELECOM: {meatspace.telecomBill} eb ({meatspace.routingMinutes} min)</span>
                        </div>
                        
                        <div className="flex flex-col">
                          <button 
                            onClick={() => {
                              sfx.click();
                              const result = useMeatspaceStore.getState().payTelecomBill();
                              useTerminalStore.getState().addLog(`> ${result.message}`);
                              setShowUtilityMenu(false);
                            }} 
                            disabled={meatspace.telecomBill <= 0 || meatspace.funds < meatspace.telecomBill}
                            className={`px-4 py-3 text-left transition-all flex justify-between items-center border-b border-teal-500/20 last:border-0
                              ${meatspace.telecomBill > 0 && meatspace.funds >= meatspace.telecomBill ? 'text-teal-400 hover:bg-teal-500/20 cursor-pointer' : 'text-gray-600 cursor-not-allowed opacity-50'}`}
                          >
                            <div className="flex flex-col">
                              <span className="font-bold text-sm">○ PAY TELECOM BILL</span>
                              <span className="text-[10px] opacity-70">Clear all charges</span>
                            </div>
                            <span className="font-bold text-xs">{meatspace.telecomBill} eb</span>
                          </button>

                          <button 
                            onClick={() => {
                              sfx.click();
                              const result = useMeatspaceStore.getState().utilityFraud();
                              useTerminalStore.getState().addLog(`> ${result.message}`);
                              setShowUtilityMenu(false);
                            }} 
                            disabled={meatspace.telecomBill <= 0}
                            className={`px-4 py-3 text-left transition-all flex justify-between items-center
                              ${meatspace.telecomBill > 0 ? 'text-red-400 hover:bg-red-500/20 cursor-pointer' : 'text-gray-600 cursor-not-allowed opacity-50'}`}
                          >
                            <div className="flex flex-col">
                              <span className="font-bold text-sm">○ UTILITY FRAUD</span>
                              <span className="text-[10px] opacity-70">Prog+D10 vs 20</span>
                            </div>
                            <span className="font-bold text-xs">FREE</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  {!meatspace.isStreet && (
                    <div className="relative w-full" ref={housingMenuRef}>
                      <button 
                        onClick={() => {
                          sfx.click();
                          setShowHousingMenu(!showHousingMenu);
                        }} 
                        className="bg-black text-cyan-400 w-full px-4 py-3 border border-cyan-500/50 hover:bg-cyan-500 hover:text-black transition-all cursor-pointer font-bold flex justify-between items-center"
                      >
                        <span>[ HOUSING ]</span>
                        <span>{showHousingMenu ? '▲' : '▼'}</span>
                      </button>
                      
                      {showHousingMenu && (
                        <div className="absolute top-full left-0 w-full bg-black border-2 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)] z-50 mt-1 animate-dropdown">
                          <div className="p-2 border-b border-cyan-500/30 bg-cyan-500/10 flex justify-between items-center">
                            <span className="text-[10px] font-bold text-cyan-500 uppercase">Housing Status</span>
                            <span className="text-[10px] font-bold text-cyan-500 uppercase">RENT: {meatspace.housingCost} eb/mo</span>
                          </div>
                          
                          <div className="flex flex-col">
                            <button 
                              onClick={() => {
                                sfx.click();
                                if (meatspace.housingType !== 'coffin') {
                                  if (meatspace.funds >= 200) {
                                    useMeatspaceStore.getState().deductFunds(200);
                                    useMeatspaceStore.setState({ housingType: 'apartment', housingCost: 200 });
                                    useTerminalStore.getState().addLog(`> HOUSING: STUDIO APARTMENT (200 eb/month).`);
                                  } else {
                                    useTerminalStore.getState().addLog(`> INSUFFICIENT FUNDS.`);
                                    sfx.error();
                                  }
                                }
                                setShowHousingMenu(false);
                              }} 
                              disabled={meatspace.housingType === 'coffin' && meatspace.funds < 200}
                              className={`px-4 py-3 text-left transition-all flex justify-between items-center border-b border-cyan-500/20
                                ${meatspace.housingType === 'coffin' ? (meatspace.funds >= 200 ? 'text-cyan-400 hover:bg-cyan-500/20 cursor-pointer' : 'text-gray-600 cursor-not-allowed opacity-50') : 'text-cyan-700 cursor-not-allowed opacity-30'}`}
                            >
                              <div className="flex flex-col">
                                <span className="font-bold text-sm">○ COFFIN/CUBE</span>
                                <span className="text-[10px] opacity-70">Combat Zone</span>
                              </div>
                              <span className="font-bold text-xs">{meatspace.housingType === 'coffin' ? 'CURRENT' : '150 eb/mo'}</span>
                            </button>

                            <button 
                              onClick={() => {
                                sfx.click();
                                if (meatspace.housingType !== 'apartment') {
                                  if (meatspace.funds >= (meatspace.housingType === 'penthouse' ? 100 : 200)) {
                                    const cost = meatspace.housingType === 'penthouse' ? 100 : 200;
                                    useMeatspaceStore.getState().deductFunds(cost);
                                    useMeatspaceStore.setState({ housingType: 'apartment', housingCost: 200 });
                                    useTerminalStore.getState().addLog(`> HOUSING: STUDIO APARTMENT (200 eb/month).`);
                                  } else {
                                    useTerminalStore.getState().addLog(`> INSUFFICIENT FUNDS.`);
                                    sfx.error();
                                  }
                                }
                                setShowHousingMenu(false);
                              }} 
                              disabled={meatspace.housingType === 'apartment'}
                              className={`px-4 py-3 text-left transition-all flex justify-between items-center border-b border-cyan-500/20
                                ${meatspace.housingType === 'apartment' ? 'text-cyan-400 cursor-not-allowed opacity-50' : (meatspace.funds >= 200 ? 'text-cyan-400 hover:bg-cyan-500/20 cursor-pointer' : 'text-gray-600 cursor-not-allowed opacity-50')}`}
                            >
                              <div className="flex flex-col">
                                <span className="font-bold text-sm">○ STUDIO APARTMENT</span>
                                <span className="text-[10px] opacity-70">Moderate Zone | +Data Creche</span>
                              </div>
                              <span className="font-bold text-xs">{meatspace.housingType === 'apartment' ? 'CURRENT' : '200 eb/mo'}</span>
                            </button>

                            <button 
                              onClick={() => {
                                sfx.click();
                                if (meatspace.housingType !== 'penthouse') {
                                  if (meatspace.funds >= (meatspace.housingType === 'apartment' ? 3000 : 1000)) {
                                    const cost = meatspace.housingType === 'apartment' ? 3000 : 1000;
                                    useMeatspaceStore.getState().deductFunds(cost);
                                    useMeatspaceStore.setState({ housingType: 'penthouse', housingCost: 1000 });
                                    useTerminalStore.getState().addLog(`> HOUSING: CORPORATE PENTHOUSE (1000 eb/month).`);
                                  } else {
                                    useTerminalStore.getState().addLog(`> INSUFFICIENT FUNDS.`);
                                    sfx.error();
                                  }
                                }
                                setShowHousingMenu(false);
                              }} 
                              disabled={meatspace.housingType === 'penthouse'}
                              className={`px-4 py-3 text-left transition-all flex justify-between items-center
                                ${meatspace.housingType === 'penthouse' ? 'text-cyan-400 cursor-not-allowed opacity-50' : (meatspace.funds >= (meatspace.housingType === 'apartment' ? 3000 : 1000) ? 'text-cyan-400 hover:bg-cyan-500/20 cursor-pointer' : 'text-gray-600 cursor-not-allowed opacity-50')}`}
                            >
                              <div className="flex flex-col">
                                <span className="font-bold text-sm">○ CORPORATE PENTHOUSE</span>
                                <span className="text-[10px] opacity-70">High Zone | Clean Landline (-2 Trace)</span>
                              </div>
                              <span className="font-bold text-xs">{meatspace.housingType === 'penthouse' ? 'CURRENT' : '1000 eb/mo'}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {/* Phase 17: Bodyweight & Data Creche */}
                  {!meatspace.hasDataCreche && !meatspace.isStreet && (
                    <button 
                      onClick={() => {
                        sfx.click();
                        const result = useMeatspaceStore.getState().purchaseDataCreche();
                        useTerminalStore.getState().addLog(`> ${result.message}`);
                      }}
                      disabled={meatspace.funds < 10000 || meatspace.housingType === 'coffin'}
                      className={`w-full px-4 py-2 border text-xs transition-all cursor-pointer ${meatspace.funds >= 10000 && meatspace.housingType !== 'coffin' ? 'bg-black text-purple-400 border-purple-500/50 hover:bg-purple-500 hover:text-black' : 'bg-gray-900 text-gray-500 border-gray-700 cursor-not-allowed'}`}
                    >
                      [ INSTALL DATA CRECHE (10000 eb) ]
                    </button>
                  )}
                  {meatspace.hasDataCreche && (
                    <p className="text-xs text-purple-400 text-center border border-purple-500/30 p-1 bg-purple-900/20">
                      DATA CRECHE: {meatspace.crecheInstalled ? 'INSTALLED (+96h, +1 SPD/+4 MU/+4 WALL)' : 'NOT INSTALLED'}
                    </p>
                  )}
                  <button 
                    onClick={() => {
                      sfx.click();
                      const result = useMeatspaceStore.getState().buyNutrientPacks(1);
                      useTerminalStore.getState().addLog(`> ${result.message}`);
                    }}
                    disabled={!meatspace.hasBodyweightSystem || meatspace.funds < 100}
                    className={`w-full px-4 py-2 border text-xs transition-all cursor-pointer ${meatspace.hasBodyweightSystem && meatspace.funds >= 100 ? 'bg-black text-orange-400 border-orange-500/50 hover:bg-orange-500 hover:text-black' : 'bg-gray-900 text-gray-500 border-gray-700 cursor-not-allowed'}`}
                  >
                    [ BUY NUTRIENT PACK (100 eb) ]
                  </button>
                  <button 
                    onClick={() => {
                      if (confirm('Start character creation?')) {
                        sfx.click();
                        setShowCharacterCreation(true);
                      }
                    }} 
                    className="w-full px-4 py-3 border border-red-500/50 hover:bg-red-500 hover:text-black transition-all cursor-pointer text-xs font-bold mt-2"
                  >
                    [ NEW CHARACTER ]
                  </button>
                </div>
            )}

            {state.matches('jobs') && (
                <div className="flex flex-col items-center w-full max-w-2xl max-h-full overflow-y-auto bg-black/90 border-2 border-blue-500 p-4 sm:p-6 shadow-[0_0_30px_#3b82f640]">
                  <div className="flex justify-between items-center w-full border-b border-blue-500 pb-2 mb-4">
                    <h2 className="text-lg sm:text-2xl font-bold tracking-widest text-blue-400 text-left">BBS: JOBS</h2>
                    <button onClick={() => { sfx.click(); useMissionStore.getState().generateJobs(); }} className="text-xs sm:text-sm border border-blue-500 px-2 py-1 hover:bg-blue-500 hover:text-black transition-colors">
                      [ REFRESH ]
                    </button>
                  </div>

                  <div className="w-full flex flex-col gap-4 mb-4 text-left">
                    {missionStore.activeJob ? (
                        <div className="border border-red-500/50 p-4 bg-red-900/10">
                          <p className="text-red-500 font-bold mb-2">WARNING: ACTIVE CONTRACT.</p>
                          <p className="text-sm mb-4">Complete your current mission or abandon it to accept new ones.</p>
                          <button onClick={() => { sfx.error(); useMissionStore.getState().abandonJob(); }} className="border border-red-500 text-red-500 px-4 py-2 hover:bg-red-500 hover:text-black w-full sm:w-auto">
                            [ ABANDON CONTRACT ]
                          </button>
                        </div>
                    ) : (
                        missionStore.availableJobs.map(job => (
                            <div key={job.id} className={`border p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 group hover:bg-blue-500/10 transition-colors ${job.isHeist ? 'border-orange-500/30' : 'border-blue-500/30'}`}>
                              <div>
                                <span className={`font-bold text-base sm:text-lg ${job.isHeist ? 'text-orange-400' : 'text-white'}`}>{job.title}</span>
                                <p className="text-xs opacity-70 mt-1">Target: <span className="text-blue-300 font-bold">{job.targetLdlName}</span> (Sec: {job.secLevel})</p>
                                {job.isHeist && (
                                    <p className="text-xs text-red-400 font-bold mt-1">⏱ {job.turnLimit} TURNS TIME LIMIT</p>
                                )}
                              </div>
                              <button
                                  onClick={() => { sfx.click(); useMissionStore.getState().acceptJob(job); }}
                                  className={`border px-4 py-2 hover:bg-yellow-400 hover:text-black cursor-pointer font-bold w-full sm:w-auto text-sm ${job.isHeist ? 'border-orange-400 text-orange-400' : 'border-yellow-400 text-yellow-400'}`}
                              >
                                [ ACCEPT: {job.payout} eb ]
                              </button>
                            </div>
                        ))
                    )}
                  </div>

                  <div className="flex w-full justify-start border-t border-blue-500/30 pt-4 mt-auto">
                    <button onClick={() => handleAction('LEAVE_JOBS')} className="border border-red-500 text-red-500 px-6 py-2 hover:bg-red-500 hover:text-black cursor-pointer transition-colors w-full sm:w-auto">
                      [ DISCONNECT ]
                    </button>
                  </div>
                </div>
            )}

            {state.matches('shop') && (
                <ShopPanel onClose={() => handleAction('LEAVE_SHOP')} />
            )}

            {state.matches('navigator') && (
                <WorldMap onExecute={() => {
                  if (Math.random() < 0.2) {
                    const rivalNames = ['BlackICE_Baron', 'Zero_Cool', 'Acid_Burn', 'Razor_Eddie', 'Data_Wraith'];
                    const rivalInt = Math.floor(Math.random() * 5) + 5;
                    const rivalInterface = Math.floor(Math.random() * 4) + 2;
                    const rivalDeck = Math.floor(Math.random() * 3);
                    const rivalProg = Math.floor(Math.random() * 4) + 2;
                    const payoff = Math.floor(Math.random() * 300) + 100;
                    setRivalEncounter({ name: rivalNames[Math.floor(Math.random() * rivalNames.length)], int: rivalInt, interfaceLvl: rivalInterface, deckBonus: rivalDeck, progStr: rivalProg, payoff });
                    sfx.error();
                    useTerminalStore.getState().addLog('> ALERT: RIVAL NETRUNNER INTERCEPTED YOUR SIGNAL!');
                    send({ type: 'RIVAL_ENCOUNTER' });
                  } else {
                    handleAction('INITIATE_LINK');
                  }
                }} onAbort={() => handleAction('CANCEL')} />
            )}

            {state.matches('rival_encounter') && rivalEncounter && (() => {
              const resolveFight = () => {
                const { int, interfaceLvl, takeDamage, health, interfaceType } = useMeatspaceStore.getState();
                const { combatBonus, activeAction } = useCyberdeckStore.getState();
                const addLog = useTerminalStore.getState().addLog;
                const playerRoll = Math.floor(Math.random() * 10) + 1;
                const rivalRoll = Math.floor(Math.random() * 10) + 1;
                const progStr = activeAction ? activeAction.strength : 0;
                const interfaceBonus = interfaceType === 'interfacePlugs' ? 1 : interfaceType === 'trodes' ? -1 : 0;
                const attackTotal = playerRoll + int + interfaceLvl + progStr + combatBonus + interfaceBonus;
                const defenseTotal = rivalRoll + rivalEncounter.int + rivalEncounter.interfaceLvl + rivalEncounter.progStr + rivalEncounter.deckBonus;

                addLog(`> RIVAL COMBAT: ${rivalEncounter.name.toUpperCase()}`);
                addLog(`> YOU: D10(${playerRoll}) + INT(${int}) + INTF(${interfaceLvl}) + PROG(${progStr}) + DECK(+${combatBonus})${interfaceBonus !== 0 ? ` + IFACE(${interfaceBonus})` : ''} = ${attackTotal}`);
                addLog(`> RIVAL: D10(${rivalRoll}) + INT(${rivalEncounter.int}) + INTF(${rivalEncounter.interfaceLvl}) + PROG(${rivalEncounter.progStr}) + DECK(+${rivalEncounter.deckBonus}) = ${defenseTotal}`);

                if (attackTotal > defenseTotal) {
                  sfx.loot();
                  const loot = Math.floor(Math.random() * 500) + 200;
                  addLog(`> RIVAL DISCONNECTED! DATA PILFERED: ${loot} eb.`);
                  useMeatspaceStore.getState().addFunds(loot);
                } else {
                  sfx.damage();
                  const damage = Math.floor(Math.random() * 3) + 1;
                  addLog(`> RIVAL OVERPOWERED YOUR DEFENSES! ${damage} NEURAL DAMAGE.`);
                  takeDamage(damage);
                  if (useMeatspaceStore.getState().health <= 0) {
                    sfx.flatline();
                    useTerminalStore.getState().addLog('> FLATLINE. RIVAL NETRUNNER WIPED YOUR DECK.');
                    send({ type: 'LOSE_TO_RIVAL' });
                    return;
                  }
                }
                setRivalEncounter(null);
                send({ type: 'FIGHT_RIVAL' });
              };

              const resolveFlee = () => {
                sfx.click();
                useRoutingStore.getState().addTraceRisk(2);
                useTerminalStore.getState().addLog('> CONNECTION SEVERED. RIVAL LOGGED YOUR SIGNAL. +2 TRACE.');
                setRivalEncounter(null);
                send({ type: 'FLEE_RIVAL' });
              };

              const resolvePay = () => {
                const { funds, deductFunds } = useMeatspaceStore.getState();
                const addLog = useTerminalStore.getState().addLog;
                if (funds >= rivalEncounter.payoff) {
                  deductFunds(rivalEncounter.payoff);
                  sfx.loot();
                  addLog(`> BRIBE SENT: ${rivalEncounter.payoff} eb. RIVAL DISAPPEARED FROM YOUR SIGNAL.`);
                } else {
                  sfx.error();
                  addLog(`> ERROR: INSUFFICIENT FUNDS FOR BRIBE. RIVAL LAUGHS AND ATTACKS.`);
                  resolveFight();
                  return;
                }
                setRivalEncounter(null);
                send({ type: 'PAY_RIVAL' });
              };

              return (
                  <div className="flex flex-col items-center justify-center w-full max-w-lg bg-black/90 border-4 border-red-600 p-6 shadow-[0_0_50px_#dc262680]">
                    <h1 className="text-2xl sm:text-3xl font-bold bg-red-600 text-black w-full py-2 tracking-widest mb-4 animate-pulse">RIVAL ENCOUNTER</h1>
                    <p className="text-sm sm:text-base mb-2 text-red-400">INTERCEPTED SIGNAL FROM: <span className="text-white font-bold">{rivalEncounter.name}</span></p>
                    <p className="text-xs sm:text-sm mb-6 opacity-80">A hostile Netrunner has hijacked your LDL relay. They demand you disconnect — or else.</p>

                    <div className="flex flex-col gap-4 w-full">
                      <button onClick={resolveFight} className="bg-black text-red-400 border-2 border-red-500 p-3 hover:bg-red-500 hover:text-black font-bold transition-all text-sm sm:text-base">
                        [ FIGHT — DEPLOY COUNTER-INTRUSION ]
                      </button>
                      <button onClick={resolveFlee} className="bg-black text-yellow-400 border-2 border-yellow-500 p-3 hover:bg-yellow-400 hover:text-black font-bold transition-all text-sm sm:text-base">
                        [ FLEE — SEVER CONNECTION (+2 TRACE) ]
                      </button>
                      <button onClick={resolvePay} className="bg-black text-blue-400 border-2 border-blue-500 p-3 hover:bg-blue-500 hover:text-black font-bold transition-all text-sm sm:text-base">
                        [ PAY BRIBE ({rivalEncounter.payoff} eb) ]
                      </button>
                    </div>
                  </div>
              );
            })()}

            {state.matches('jacking_in') && (
                <div className="text-left font-mono text-base sm:text-xl space-y-4 px-4">
                  <h2 className="text-red-500 font-bold mb-4 animate-pulse">WARNING: LETHAL FEEDBACK ENABLED</h2>
                  {bootLog.map((log, i) => (
                      <p key={i}>{log}</p>
                  ))}
                  <span className="animate-pulse">_</span>
                </div>
            )}

            {state.matches('net') && (
                <TheNet onJackOut={() => handleAction('JACK_OUT')} />
            )}

          </div>
        </div>

        {/* RIGHT PANEL: CYBERDECK */}
        <div className={`w-[240px] flex-shrink-0 bg-black/95 border-l border-neon-green/30 p-4 flex flex-col gap-4 overflow-y-auto scrollbar-hide shadow-2xl md:relative
        ${showRightPanel || true ? '' : 'hidden'} md:block`}>

          <div className="flex justify-between items-center border-b border-neon-green pb-2">
            <button className="md:hidden text-red-500 border border-red-500 px-3 py-1 font-bold" onClick={() => setShowRightPanel(false)}>X</button>
            <h2 className="text-xl font-bold uppercase tracking-widest text-right">Cyberdeck</h2>
          </div>
          {(() => {
            const effectiveStats = useCyberdeckStore.getState().getEffectiveDeckStats();
            const isCreche = effectiveStats.deckType === 'creche';
            return (
              <>
                <p className={isCreche ? 'text-purple-400 font-bold' : ''}>
                  &gt; MODEL: {effectiveStats.deckModel}{isCreche ? ' (CRECHE)' : ''}
                </p>
                <p className={isCreche ? 'text-purple-400' : ''}>
                  &gt; MEMORY: {cyberdeck.usedMu} / {effectiveStats.maxMu} MU
                </p>
                {isCreche && <p className="text-xs text-purple-400">[+1 SPEED, +4 WALLS]</p>}
              </>
            );
          })()}
          {cyberdeck.combatBonus > 0 && (
              <p className="text-yellow-400 font-bold">&gt; DECK COMBAT BONUS: +{cyberdeck.combatBonus}</p>
          )}
          {cyberdeck.coprocessors > 0 && (
              <p className="text-teal-400 font-bold">&gt; COPROCESSORS: {cyberdeck.coprocessors} ({cyberdeck.coprocessors} EXTRA ACTION{cyberdeck.coprocessors > 1 ? 'S' : ''})</p>
          )}
          {cyberdeck.isCellular && (
              <p className="text-green-300 font-bold">&gt; CELLULAR DECK: ACTIVE (ORBITAL LAUNCH ENABLED)</p>
          )}
          <div className="mt-4">
            <p className="mb-2 text-sm opacity-70">LOADED PROGRAMS (CLICK TO TOGGLE):</p>
            <ul className="space-y-2">
              {cyberdeck.programs.map((prog) => {
                // NEW: UI check for the split architecture
                const isPassiveType = prog.type === 'stealth' || prog.type === 'defense';
                const isRunning = isPassiveType
                    ? cyberdeck.activePassives.some(p => p.id === prog.id)
                    : cyberdeck.activeAction?.id === prog.id;

                const statusTag = isPassiveType ? (isRunning ? '[RUNNING]' : '') : (isRunning ? '[EQUIPPED]' : '');

                return (
                    <li
                        key={prog.id}
                        onClick={() => { sfx.click(); cyberdeck.toggleProgram(prog.id); setShowRightPanel(false); }}
                        className={`border p-3 sm:p-2 cursor-pointer transition-colors font-bold text-sm sm:text-base flex justify-between
                    ${isRunning ? 'bg-neon-green text-black border-neon-green shadow-[0_0_10px_#00ffcc]' : 'border-neon-green/50 text-neon-green hover:bg-neon-green/20'}`}
                    >
                      <span>* {prog.name} (STR: {prog.strength})</span>
                      <span className="text-xs pt-1">{statusTag}</span>
                    </li>
                );
              })}
            </ul>
          </div>
        </div>
        </div>

        {/* BOTTOM PANEL: TERMINAL LOG */}
        <div 
          className="border-t border-neon-green/30 p-2 sm:p-4 font-mono text-[10px] sm:text-sm bg-black z-20 flex-shrink-0"
          style={{ height: '140px' }}
        >
          <div className="h-full overflow-y-auto scrollbar-hide">
            <div className="opacity-70">
              {terminalLogs.map((log, index) => (
                  <p key={index} className={log.includes('WARNING') || log.includes('FAILED') || log.includes('CRITICAL') || log.includes('FLATLINE') || log.includes('ERROR') || log.includes('RAID') ? 'text-red-400' : 'text-neon-green'}>
                    {log}
                  </p>
              ))}
              <p className="animate-pulse">&gt; _</p>
            </div>
          </div>
        </div>

        {/* PROGRAMMING PANEL */}
        {showProgramming && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80">
            <ProgrammingPanel onClose={() => setShowProgramming(false)} />
          </div>
        )}

        {/* TECHIE PANEL */}
        {showTechie && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80">
            <TechiePanel onClose={() => setShowTechie(false)} />
          </div>
        )}

        {/* BRAINWARE PANEL */}
        {showBrainware && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80">
            <BrainwarePanel onClose={() => setShowBrainware(false)} />
          </div>
        )}

        {/* TUNING PANEL */}
        {showTuning && (
          <TuningPanel onClose={() => setShowTuning(false)} />
        )}

        {/* RIPPERDOC PANEL */}
        {showRipperdoc && (
          <RipperdocPanel onClose={() => setShowRipperdoc(false)} />
        )}

{/* FIXER PANEL */}
        {showFixer && (
          <FixerPanel onClose={() => setShowFixer(false)} />
        )}

        {/* CHARACTER CREATION MODAL */}
        {showCharacterCreation && (
          <CharacterCreation 
            onClose={() => setShowCharacterCreation(false)} 
            onStart={() => setShowCharacterCreation(false)} 
          />
        )}
      </div>
    );
}