import { useMachine } from '@xstate/react';
import { useEffect, useState } from 'react';
import { gamePhaseMachine } from './machine/gamePhaseMachine';
import { TheNet } from './components/TheNet';
import { useTerminalStore } from './store/terminalStore';
import { useCyberdeckStore } from './store/cyberdeckStore';
import { useMeatspaceStore } from './store/meatspaceStore';

export default function App() {
  const [state, send] = useMachine(gamePhaseMachine);
  const [bootLog, setBootLog] = useState([]);

  useEffect(() => {
    // Auto-heal when you flatline and wake up in the safehouse
    if (state.matches('safehouse')) {
      useMeatspaceStore.getState().heal();
    }

    if (state.matches('jacking_in')) {
      const logs = [
        "> INITIATING NEURAL HANDSHAKE...",
        "> BYPASSING CORTICAL FILTERS...",
        "> IHARA-GRUBB ALGORITHM ENGAGED...",
        "> SENSORY TRANSFER COMPLETE."
      ];
      
      let delay = 0;
      logs.forEach((log, index) => {
        setTimeout(() => setBootLog(prev => [...prev, log]), delay += 800);
      });

      const finishTimer = setTimeout(() => {
        send({ type: 'CONNECTION_ESTABLISHED' });
      }, 4000);

      return () => clearTimeout(finishTimer);
    } else {
      setBootLog([]); 
    }
  }, [state.value, send]);

  return (
    <div className="h-screen w-screen bg-terminal-black text-neon-green grid grid-cols-[300px_1fr_300px] grid-rows-[1fr_150px] overflow-hidden">
      
      {/* LEFT PANEL: Character Sheet */}
      <div className="border-r border-neon-green/30 p-4 col-start-1 row-start-1 flex flex-col gap-4 bg-black/80 z-10">
        <h2 className="text-xl font-bold border-b border-neon-green pb-2 uppercase tracking-widest text-shadow-glow">Meatspace</h2>
        
        <p>&gt; HANDLE: {useMeatspaceStore(state => state.handle)}</p>
        <p>&gt; INT: {useMeatspaceStore(state => state.int)} | REF: {useMeatspaceStore(state => state.ref)}</p>
        <p>&gt; INTERFACE: +{useMeatspaceStore(state => state.interfaceLvl)}</p>
        
        {/* Neural Health Display */}
        <p className={`mt-2 font-bold ${useMeatspaceStore(state => state.health) <= 3 ? 'text-red-500 animate-pulse' : 'text-neon-green'}`}>
          &gt; NEURAL HP: {useMeatspaceStore(state => state.health)} / {useMeatspaceStore(state => state.maxHealth)}
        </p>

        <p className="mt-4 text-yellow-400 font-bold">&gt; FUNDS: {useMeatspaceStore(state => state.funds)} eb</p>
      </div>

      {/* CENTER VIEWPORT: Dynamic Routing via XState */}
      <div className="p-4 col-start-2 row-start-1 flex items-center justify-center relative">
        
        {/* FIX: 'pointer-events-none' ensures the background doesn't block clicks */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#00ffcc_1px,transparent_1px),linear-gradient(to_bottom,#00ffcc_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
        
        {/* FIX: 'relative z-10' pulls the UI menus to the front */}
        <div className="relative z-10 text-center w-full flex justify-center">
          
          {state.matches('safehouse') && (
            <div className="flex flex-col items-center">
              <h1 className="text-3xl font-bold mb-8 animate-pulse text-red-500 tracking-widest">SYSTEM READY</h1>
              <button 
                onClick={() => send({ type: 'OPEN_NAVIGATOR' })}
                className="bg-green-950 text-white px-8 py-4 text-2xl font-bold border-2 border-neon-green shadow-[0_0_15px_#00ffcc] hover:bg-neon-green hover:text-black transition-all cursor-pointer"
              >
                [ RUN THE NET ]
              </button>
            </div>
          )}

          {state.matches('navigator') && (
            <div className="flex flex-col items-center w-full max-w-lg bg-black/90 border-2 border-neon-green p-6 shadow-[0_0_30px_#00ffcc40]">
              <h2 className="text-2xl font-bold mb-4 border-b border-neon-green w-full text-center pb-2 tracking-widest">LDL ROUTING PROTOCOL</h2>
              <p className="mb-6 opacity-70 text-sm text-left w-full">&gt; SELECT REGIONAL GRID STARTING POINT:</p>
              
              <div className="w-full flex flex-col gap-3 mb-8 font-mono">
                <button className="border border-neon-green/50 p-3 hover:bg-neon-green hover:text-black flex justify-between cursor-pointer transition-colors text-left group">
                  <span className="font-bold">[ Night City Grid ]</span> 
                  <span className="opacity-70 group-hover:opacity-100 group-hover:text-black">Trace Mod: +0 (Cost: 0 eb)</span>
                </button>
                <button className="border border-neon-green/50 p-3 hover:bg-neon-green hover:text-black flex justify-between cursor-pointer transition-colors text-left group">
                  <span className="font-bold">[ Tokyo Chiba ]</span> 
                  <span className="opacity-70 group-hover:opacity-100 group-hover:text-black">Trace Mod: -2 (Cost: 150 eb)</span>
                </button>
              </div>

              <div className="flex gap-4 w-full justify-between">
                <button 
                  onClick={() => send({ type: 'CANCEL' })} 
                  className="border border-red-500 text-red-500 px-6 py-2 hover:bg-red-500 hover:text-black cursor-pointer transition-colors"
                >
                  [ ABORT ]
                </button>
                <button 
                  onClick={() => send({ type: 'INITIATE_LINK' })} 
                  className="bg-green-950 text-white px-6 py-2 border-2 border-neon-green hover:bg-neon-green hover:text-black font-bold cursor-pointer transition-colors"
                >
                  [ EXECUTE ROUTE ]
                </button>
              </div>
            </div>
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
            <TheNet onJackOut={() => send({ type: 'JACK_OUT' })} />
          )}

        </div>
      </div>

      {/* RIGHT PANEL: Cyberdeck */}
      <div className="border-l border-neon-green/30 p-4 col-start-3 row-start-1 flex flex-col gap-4 bg-black/80 z-10">
        <h2 className="text-xl font-bold border-b border-neon-green pb-2 uppercase tracking-widest">Cyberdeck</h2>
        
        <p>&gt; MODEL: {useCyberdeckStore(state => state.deckModel)}</p>
        <p>&gt; MEMORY: {useCyberdeckStore(state => state.usedMu)} / {useCyberdeckStore(state => state.maxMu)} MU</p>
        
        <div className="mt-4">
          <p className="mb-2 text-sm opacity-70">LOADED PROGRAMS (CLICK TO EQUIP):</p>
          <ul className="space-y-2">
            {useCyberdeckStore(state => state.programs).map((prog) => {
              const isActive = useCyberdeckStore(state => state.activeProgram?.id) === prog.id;
              return (
                <li 
                  key={prog.id}
                  onClick={() => useCyberdeckStore.getState().setActiveProgram(prog.id)}
                  className={`border p-2 cursor-pointer transition-colors font-bold ${
                    isActive 
                      ? 'bg-neon-green text-black border-neon-green shadow-[0_0_10px_#00ffcc]'
                      : 'border-neon-green/50 text-neon-green hover:bg-neon-green/20'
                  }`}
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
          {useTerminalStore((state) => state.logs).map((log, index) => (
            <p key={index} className={log.includes('WARNING') || log.includes('FAILED') || log.includes('CRITICAL') || log.includes('FLATLINE') ? 'text-red-400' : 'text-neon-green'}>
              {log}
            </p>
          ))}
          <p className="animate-pulse">&gt; _</p>
        </div>
      </div>

    </div>
  );
}