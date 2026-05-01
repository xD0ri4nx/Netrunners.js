import { useMachine } from '@xstate/react';
import { useEffect, useState } from 'react';
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
import { RepairPanel } from './components/RepairPanel';
import { BrainwarePanel } from './components/BrainwarePanel';
import RipperdocPanel from './components/RipperdocPanel';
import FixerPanel from './components/FixerPanel';
import StockTicker from './components/StockTicker';

export default function App() {
  const [state, send] = useMachine(gamePhaseMachine);
  const [bootLog, setBootLog] = useState([]);

  const [showLeftPanel, setShowLeftPanel] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [showProgramming, setShowProgramming] = useState(false);
  const [showRepair, setShowRepair] = useState(false);
  const [showBrainware, setShowBrainware] = useState(false);
  const [showRipperdoc, setShowRipperdoc] = useState(false);
  const [showFixer, setShowFixer] = useState(false);

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
    if (state.matches('safehouse')) {
      const currentTraceRisk = useRoutingStore.getState().traceRisk;
      if (currentTraceRisk >= 20) {
        sfx.error();
        send({ type: 'TRIGGER_RAID' });
        return;
      }

      useMeatspaceStore.getState().healNeuralDamage(100);
      resetRoute();

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
      <div className="h-screen w-screen bg-terminal-black text-neon-green flex flex-col md:grid md:grid-cols-[280px_1fr_280px] lg:grid-cols-[300px_1fr_300px] md:grid-rows-[1fr_150px] overflow-hidden crt-flicker relative">
        <div className="crt-overlay pointer-events-none z-50"></div>

        {/* MOBILE HEADER */}
        <div className="md:hidden flex justify-between items-center p-3 border-b border-neon-green/30 bg-black z-40 text-xs sm:text-sm font-bold tracking-widest">
          <button onClick={() => {setShowLeftPanel(!showLeftPanel); setShowRightPanel(false);}} className="border border-neon-green px-2 py-1 active:bg-neon-green active:text-black">[ MEATSPACE ]</button>
          <span className="text-red-500 animate-pulse">SYS_OS</span>
          <button onClick={() => {setShowRightPanel(!showRightPanel); setShowLeftPanel(false);}} className="border border-neon-green px-2 py-1 active:bg-neon-green active:text-black">[ CYBERDECK ]</button>
        </div>

        {/* LEFT PANEL: MEATSPACE */}
        <div className={`fixed inset-y-0 left-0 w-4/5 max-w-sm bg-black/95 border-r border-neon-green/30 p-4 flex flex-col gap-4 z-50 transform transition-transform duration-300 overflow-y-auto shadow-2xl md:relative md:translate-x-0 md:w-auto md:bg-black/80 md:col-start-1 md:row-start-1 md:shadow-none
        ${showLeftPanel ? 'translate-x-0' : '-translate-x-full'}`}>

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
            &gt; NEURAL HP: {meatspace.health} / {meatspace.maxHealth}
          </p>
          <p className="mt-4 text-yellow-400 font-bold">&gt; FUNDS: {meatspace.funds} eb</p>

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
        <div className="flex-1 p-2 md:p-4 md:col-start-2 md:row-start-1 flex items-center justify-center relative z-0 overflow-hidden">
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
                  <div className="w-full bg-black/80 border border-neon-green/50 p-3 text-xs font-mono">
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400">IP AVAILABLE:</span>
                      <span className="text-yellow-400">{useMeatspaceStore.getState().ip} IP</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400">INT (Current/Max):</span>
                      <span className="text-neon-green">{useMeatspaceStore.getState().getCurrentInt()}/{useMeatspaceStore.getState().maxInt}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400">Neural Damage:</span>
                      <span className="text-red-400">{useMeatspaceStore.getState().neuralDamage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">REF:</span>
                      <span className="text-neon-green">{useMeatspaceStore.getState().ref}</span>
                    </div>
                    <div className="mt-2 border-t border-neon-green/30 pt-2">
                      <p className="text-gray-500 text-[10px] mb-1">SKILLS:</p>
                      {Object.entries(useMeatspaceStore.getState().skills).map(([skill, val]) => (
                        <div key={skill} className="flex justify-between">
                          <span className="text-gray-400 capitalize">{skill}:</span>
                          <span className="text-cyan-400">{val} <button onClick={() => useMeatspaceStore.getState().increaseSkill(skill)} className="text-[10px] text-yellow-500 hover:text-yellow-300 ml-1">[+]</button></span>
                        </div>
                      ))}
                    </div>
                  </div>
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
                  <button onClick={() => { sfx.click(); send({ type: 'OPEN_REPAIR' }); }} className="bg-black text-yellow-400 w-full px-4 py-3 border border-yellow-400/50 hover:bg-yellow-400 hover:text-black transition-all cursor-pointer">
                    [ REPAIR DECK ]
                  </button>
                  <button onClick={() => { sfx.click(); setShowBrainware(true); }} className="bg-black text-purple-400 w-full px-4 py-3 border border-purple-400/50 hover:bg-purple-400 hover:text-black transition-all cursor-pointer">
                    [ BRAINWARE BLOWOUT ]
                  </button>
                  <button onClick={() => { sfx.click(); setShowRipperdoc(true); }} className="bg-black text-pink-400 w-full px-4 py-3 border border-pink-400/50 hover:bg-pink-400 hover:text-black transition-all cursor-pointer">
                    [ RIPPERDOC CLINIC ]
                  </button>
                  <button onClick={() => { sfx.click(); setShowFixer(true); }} className="bg-black text-yellow-400 w-full px-4 py-3 border border-yellow-400/50 hover:bg-yellow-400 hover:text-black transition-all cursor-pointer">
                    [ FACTION FIXERS ]
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
                const { activeAction } = useCyberdeckStore.getState();
                const addLog = useTerminalStore.getState().addLog;
                const playerRoll = Math.floor(Math.random() * 10) + 1;
                const rivalRoll = Math.floor(Math.random() * 10) + 1;
                const progStr = activeAction ? activeAction.strength : 0;
                const interfaceBonus = interfaceType === 'interfacePlugs' ? 1 : interfaceType === 'trodes' ? -1 : 0;
                const attackTotal = playerRoll + int + interfaceLvl + progStr + interfaceBonus;
                const defenseTotal = rivalRoll + rivalEncounter.int + rivalEncounter.interfaceLvl + rivalEncounter.progStr + rivalEncounter.deckBonus;

                addLog(`> RIVAL COMBAT: ${rivalEncounter.name.toUpperCase()}`);
                addLog(`> YOU: D10(${playerRoll}) + INT(${int}) + INTF(${interfaceLvl}) + PROG(${progStr}) + DECK(+0)${interfaceBonus !== 0 ? ` + IFACE(${interfaceBonus})` : ''} = ${attackTotal}`);
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
        <div className={`fixed inset-y-0 right-0 w-4/5 max-w-sm bg-black/95 border-l border-neon-green/30 p-4 flex flex-col gap-4 z-50 transform transition-transform duration-300 overflow-y-auto shadow-2xl md:relative md:translate-x-0 md:w-auto md:bg-black/80 md:col-start-3 md:row-start-1 md:shadow-none
        ${showRightPanel ? 'translate-x-0' : 'translate-x-full'}`}>

          <div className="flex justify-between items-center border-b border-neon-green pb-2">
            <button className="md:hidden text-red-500 border border-red-500 px-3 py-1 font-bold" onClick={() => setShowRightPanel(false)}>X</button>
            <h2 className="text-xl font-bold uppercase tracking-widest text-right">Cyberdeck</h2>
          </div>
          <p>&gt; MODEL: {cyberdeck.deckModel}</p>
          <p>&gt; MEMORY: {cyberdeck.usedMu} / {cyberdeck.maxMu} MU</p>
          {false && (
              <p className="text-yellow-400 font-bold">&gt; DECK SPEED: +{cyberdeck.speed}</p>
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

        {/* BOTTOM PANEL: TERMINAL LOG */}
        <div className="h-40 md:h-auto border-t border-neon-green/30 p-2 sm:p-4 md:col-span-3 md:row-start-2 font-mono text-[10px] sm:text-sm overflow-y-auto flex flex-col justify-end bg-black z-20">
          <div className="opacity-70 flex flex-col justify-end min-h-full">
            {terminalLogs.map((log, index) => (
                <p key={index} className={log.includes('WARNING') || log.includes('FAILED') || log.includes('CRITICAL') || log.includes('FLATLINE') || log.includes('ERROR') || log.includes('RAID') ? 'text-red-400' : 'text-neon-green'}>
                  {log}
                </p>
            ))}
            <p className="animate-pulse">&gt; _</p>
          </div>
        </div>

        {/* PROGRAMMING PANEL */}
        {showProgramming && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80">
            <ProgrammingPanel onClose={() => setShowProgramming(false)} />
          </div>
        )}

        {/* REPAIR PANEL */}
        {showRepair && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80">
            <RepairPanel onClose={() => setShowRepair(false)} />
          </div>
        )}
        {showBrainware && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80">
            <BrainwarePanel onClose={() => setShowBrainware(false)} />
          </div>
        )}
        {showRipperdoc && (
          <RipperdocPanel onClose={() => setShowRipperdoc(false)} />
        )}
        {showFixer && (
          <FixerPanel onClose={() => setShowFixer(false)} />
        )}
      </div>
  );
}