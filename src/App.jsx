import { useMachine } from '@xstate/react';
import { useEffect, useState } from 'react';
import { gamePhaseMachine } from './machine/gamePhaseMachine';
import { TheNet } from './components/TheNet';
import { WorldMap } from './components/WorldMap';
import { useTerminalStore } from './store/terminalStore';
import { useCyberdeckStore } from './store/cyberdeckStore';
import { useMeatspaceStore } from './store/meatspaceStore';
import { useRoutingStore } from './store/routingStore';
import { sfx } from './utils/sfx';

export default function App() {
  const [state, send] = useMachine(gamePhaseMachine);
  const [bootLog, setBootLog] = useState([]);

  const meatspace = useMeatspaceStore();
  const cyberdeck = useCyberdeckStore();
  const terminalLogs = useTerminalStore((state) => state.logs);
  const { resetRoute } = useRoutingStore();

  const handleAction = (type) => {
    sfx.click();
    send({ type });
  };

  useEffect(() => {
    if (state.matches('safehouse')) {
      useMeatspaceStore.getState().heal();
      resetRoute(); // Clear the route history when returning to safehouse
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

  const handlePurchase = (itemType, cost, payload) => {
    const { funds, deductFunds } = useMeatspaceStore.getState();
    const { addProgram, upgradeMu, programs } = useCyberdeckStore.getState();
    const addLog = useTerminalStore.getState().addLog;

    if (funds < cost) {
      sfx.error();
      addLog("> ERROR: INSUFFICIENT FUNDS.");
      return;
    }

    if (itemType === 'program') {
      if (programs.some(p => p.id === payload.id)) {
        sfx.error();
        addLog("> ERROR: PROGRAM ALREADY IN MEMORY.");
        return;
      }
      deductFunds(cost);
      addProgram(payload);
      sfx.loot();
      addLog(`> TRANSACTION COMPLETE: ${payload.name} DOWNLOADED TO DECK.`);
    }

    if (itemType === 'hardware') {
      deductFunds(cost);
      upgradeMu(payload.amount);
      sfx.loot();
      addLog(`> TRANSACTION COMPLETE: CYBERDECK MU UPGRADED.`);
    }
  };

  return (
    <div className="h-screen w-screen bg-terminal-black text-neon-green grid grid-cols-[300px_1fr_300px] grid-rows-[1fr_150px] overflow-hidden crt-flicker relative">
      <div className="crt-overlay"></div>
      
      {/* LEFT PANEL */}
      <div className="border-r border-neon-green/30 p-4 col-start-1 row-start-1 flex flex-col gap-4 bg-black/80 z-10">
        <h2 className="text-xl font-bold border-b border-neon-green pb-2 uppercase tracking-widest text-shadow-glow">Meatspace</h2>
        <p>&gt; HANDLE: {meatspace.handle}</p>
        <p>&gt; INT: {meatspace.int} | REF: {meatspace.ref}</p>
        <p>&gt; INTERFACE: +{meatspace.interfaceLvl}</p>
        <p className={`mt-2 font-bold ${meatspace.health <= 3 ? 'text-red-500 animate-pulse' : 'text-neon-green'}`}>
          &gt; NEURAL HP: {meatspace.health} / {meatspace.maxHealth}
        </p>
        <p className="mt-4 text-yellow-400 font-bold">&gt; FUNDS: {meatspace.funds} eb</p>
      </div>

      {/* CENTER VIEWPORT */}
      <div className="p-4 col-start-2 row-start-1 flex items-center justify-center relative z-50">
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#00ffcc_1px,transparent_1px),linear-gradient(to_bottom,#00ffcc_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
        <div className="relative text-center w-full flex justify-center pointer-events-auto h-full items-center">
          
          {state.matches('safehouse') && (
            <div className="flex flex-col items-center gap-6">
              <h1 className="text-3xl font-bold mb-4 animate-pulse text-red-500 tracking-widest">SYSTEM READY</h1>
              <button onClick={() => handleAction('OPEN_NAVIGATOR')} className="bg-green-950 text-white w-full px-8 py-4 text-2xl font-bold border-2 border-neon-green shadow-[0_0_15px_#00ffcc] hover:bg-neon-green hover:text-black transition-all cursor-pointer">
                [ RUN THE NET ]
              </button>
              <button onClick={() => handleAction('OPEN_SHOP')} className="bg-black text-neon-green w-full px-8 py-4 text-xl border border-neon-green/50 hover:bg-neon-green hover:text-black transition-all cursor-pointer">
                [ BLACK MARKET ]
              </button>
            </div>
          )}

          {state.matches('shop') && (
             <div className="flex flex-col items-center w-full max-w-2xl bg-black/90 border-2 border-neon-green p-6 shadow-[0_0_30px_#00ffcc40]">
              <h2 className="text-2xl font-bold mb-4 border-b border-neon-green w-full text-center pb-2 tracking-widest text-yellow-400">BBS: THE AFTERLIFE</h2>
              <p className="mb-6 opacity-70 text-sm text-left w-full">&gt; SECURE CONNECTION ESTABLISHED. ENCRYPTED WARES AVAILABLE:</p>
              <div className="w-full flex flex-col gap-4 mb-8 font-mono text-left">
                <div className="border border-neon-green/30 p-4 flex justify-between items-center group hover:bg-neon-green/10 transition-colors">
                  <div>
                    <span className="font-bold text-lg text-red-400">Killer v2.0 (Anti-ICE)</span> 
                    <p className="text-xs opacity-70 mt-1">Military-grade offense. STR: 6.</p>
                  </div>
                  <button onClick={() => handlePurchase('program', 800, { id: 'prog_killer', name: 'Killer v2.0', type: 'anti-ice', strength: 6 })} className="border border-yellow-400 text-yellow-400 px-4 py-2 hover:bg-yellow-400 hover:text-black cursor-pointer font-bold">
                    [ BUY: 800 eb ]
                  </button>
                </div>
                <div className="border border-neon-green/30 p-4 flex justify-between items-center group hover:bg-neon-green/10 transition-colors">
                  <div>
                    <span className="font-bold text-lg text-blue-400">Memory Expansion Chip</span> 
                    <p className="text-xs opacity-70 mt-1">Upgrades deck capacity by +1 MU.</p>
                  </div>
                  <button onClick={() => handlePurchase('hardware', 1000, { amount: 1 })} className="border border-yellow-400 text-yellow-400 px-4 py-2 hover:bg-yellow-400 hover:text-black cursor-pointer font-bold">
                    [ BUY: 1000 eb ]
                  </button>
                </div>
              </div>
              <div className="flex w-full justify-start border-t border-neon-green/30 pt-4">
                <button onClick={() => handleAction('LEAVE_SHOP')} className="border border-red-500 text-red-500 px-6 py-2 hover:bg-red-500 hover:text-black cursor-pointer transition-colors">
                  [ DISCONNECT ]
                </button>
              </div>
            </div>
          )}

          {state.matches('navigator') && (
            <WorldMap 
              onExecute={() => handleAction('INITIATE_LINK')} 
              onAbort={() => handleAction('CANCEL')} 
            />
          )}

          {state.matches('jacking_in') && (
            <div className="text-left font-mono text-xl space-y-4">
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

      {/* RIGHT PANEL: Cyberdeck */}
      <div className="border-l border-neon-green/30 p-4 col-start-3 row-start-1 flex flex-col gap-4 bg-black/80 z-10">
        <h2 className="text-xl font-bold border-b border-neon-green pb-2 uppercase tracking-widest">Cyberdeck</h2>
        <p>&gt; MODEL: {cyberdeck.deckModel}</p>
        <p>&gt; MEMORY: {cyberdeck.usedMu} / {cyberdeck.maxMu} MU</p>
        <div className="mt-4">
          <p className="mb-2 text-sm opacity-70">LOADED PROGRAMS (CLICK TO EQUIP):</p>
          <ul className="space-y-2">
            {cyberdeck.programs.map((prog) => {
              const isActive = cyberdeck.activeProgram?.id === prog.id; 
              return (
                <li 
                  key={prog.id}
                  onClick={() => { sfx.click(); cyberdeck.setActiveProgram(prog.id); }}
                  className={`border p-2 cursor-pointer transition-colors font-bold ${isActive ? 'bg-neon-green text-black border-neon-green shadow-[0_0_10px_#00ffcc]' : 'border-neon-green/50 text-neon-green hover:bg-neon-green/20'}`}
                >
                  * {prog.name} (STR: {prog.strength})
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* BOTTOM PANEL: Terminal Log */}
      <div className="border-t border-neon-green/30 p-4 col-span-3 row-start-2 font-mono text-sm overflow-y-auto flex flex-col justify-end bg-black z-20">
        <div className="opacity-70 flex flex-col justify-end h-full">
          {terminalLogs.map((log, index) => (
            <p key={index} className={log.includes('WARNING') || log.includes('FAILED') || log.includes('CRITICAL') || log.includes('FLATLINE') || log.includes('ERROR') ? 'text-red-400' : 'text-neon-green'}>
              {log}
            </p>
          ))}
          <p className="animate-pulse">&gt; _</p>
        </div>
      </div>
    </div>
  );
}