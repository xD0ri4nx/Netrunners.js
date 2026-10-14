import { useMeatspaceStore } from '../store/meatspaceStore';
import { useCyberdeckStore } from '../store/cyberdeckStore';
import { useRoutingStore } from '../store/routingStore';
import { sfx } from '../utils/sfx';
import type { LagToggleMode } from '../shared/multiplayerTypes';

export function MeatspacePanel() {
  const meatspace = useMeatspaceStore();
  const cyberdeck = useCyberdeckStore();
  const routing = useRoutingStore();

  const handleToggleMode = (mode: LagToggleMode) => {
    sfx.click();
    meatspace.setLagToggleMode(mode);
  };

  // Check current location latency penalties if routing exists
  const currentLdl = routing.currentLdl;
  const isOffWorld =
    currentLdl === 'orbit' ||
    currentLdl === 'luna' ||
    currentLdl === 'mars' ||
    currentLdl === 'apex_ring' ||
    currentLdl === 'crystal_pal';

  const isMismatched = meatspace.hasLagSwitch && meatspace.lagToggleMode === 'space' && !isOffWorld;

  return (
    <div className="border border-neon-green/30 bg-black/60 p-3 text-xs font-mono space-y-3">
      {/* LAG-SWITCH HARDWARE CONTROLLER */}
      {meatspace.hasLagSwitch && (
        <div className="border border-yellow-500/40 p-2.5 bg-yellow-900/10">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-yellow-400">HARDWARE LAG-SWITCH</span>
            <span className="text-[10px] text-gray-400">NEURAL BYPASS</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleToggleMode('earth')}
              className={`py-1.5 px-2 border text-center font-bold cursor-pointer transition-colors ${
                meatspace.lagToggleMode === 'earth'
                  ? 'border-neon-green bg-neon-green text-black'
                  : 'border-neon-green/40 text-neon-green/80 hover:border-neon-green'
              }`}
            >
              [ EARTH MODE ]
            </button>
            <button
              onClick={() => handleToggleMode('space')}
              className={`py-1.5 px-2 border text-center font-bold cursor-pointer transition-colors ${
                meatspace.lagToggleMode === 'space'
                  ? 'border-yellow-400 bg-yellow-400 text-black'
                  : 'border-yellow-500/40 text-yellow-400/80 hover:border-yellow-400'
              }`}
            >
              [ DEEP SPACE MODE ]
            </button>
          </div>

          {/* WARNING NOTICES */}
          {isMismatched && (
            <div className="mt-2 text-[10px] text-red-400 border border-red-500/40 p-1.5 bg-red-950/20 font-bold">
              [!] WARNING: DEEP SPACE MODE ENGAGED ON TERRESTRIAL LINK. ARTIFICIAL LATENCY INDUCED (-4 REF, -2 INTERFACE).
            </div>
          )}

          {meatspace.lagToggleMode === 'earth' && isOffWorld && (
            <div className="mt-2 text-[10px] text-yellow-400 border border-yellow-500/40 p-1.5 bg-yellow-950/20 font-bold">
              [!] NOTICE: SEVERE LIGHT-LAG IN EFFECT. TOGGLE TO DEEP SPACE MODE TO ENGAGE HARDWARE BUFFERING.
            </div>
          )}
        </div>
      )}

      {/* HARDWARE BUFFER TELEMETRY */}
      {(cyberdeck.hasTightbeamMaser || cyberdeck.hasInitiativeBuffer || cyberdeck.hasInterfaceBuffer) && (
        <div className="border border-cyan-500/30 p-2 bg-cyan-950/10 space-y-1 text-[10px]">
          <div className="font-bold text-cyan-400">SIGNAL BUFFERS & TELEMETRY:</div>
          {cyberdeck.hasTightbeamMaser && <div className="text-gray-300">&gt; TIGHTBEAM MASER ARRAY: ONLINE</div>}
          {cyberdeck.hasInitiativeBuffer && <div className="text-gray-300">&gt; TIME-LAG BUFFER (REF): ACTIVE (MAX -2)</div>}
          {cyberdeck.hasInterfaceBuffer && <div className="text-gray-300">&gt; TIME-LAG BUFFER (INTF): ACTIVE (MAX -2)</div>}
        </div>
      )}

      {/* COSMETIC ICON BADGE */}
      <div className="flex justify-between items-center text-[10px] border-t border-neon-green/20 pt-2">
        <span className="text-gray-400">NEURAL AVATAR:</span>
        <span className="text-neon-green font-bold">[{meatspace.equippedIconTier || 'SIMPLE'}]</span>
      </div>
    </div>
  );
}
