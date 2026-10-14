import { useState } from 'react';
import { useMeatspaceStore } from '../store/meatspaceStore';
import { useCyberdeckStore } from '../store/cyberdeckStore';
import { useTerminalStore } from '../store/terminalStore';
import { sfx } from '../utils/sfx';
import {
  COSMETIC_ICON_TIERS,
  IDENTITY_UTILITY_CATALOG,
} from '../shared/daemonCatalog';
import type { IconTier, IdentityUtilityType } from '../shared/multiplayerTypes';

interface TechieClinicProps {
  onClose: () => void;
}

export function TechieClinic({ onClose }: TechieClinicProps) {
  const meatspace = useMeatspaceStore();
  const cyberdeck = useCyberdeckStore();
  const addLog = useTerminalStore((state) => state.addLog);
  const [activeTab, setActiveTab] = useState<'HARDWARE' | 'ICONS' | 'UTILITIES' | 'DAEMONS'>('HARDWARE');

  const credits = meatspace.funds;
  const remainingMu = Math.max(0, cyberdeck.maxMu - cyberdeck.usedMu);

  const handleBuyLagSwitch = () => {
    sfx.click();
    const res = meatspace.buyNeuralLagSwitch();
    addLog(`> ${res.message}`);
    if (res.success) sfx.loot();
    else sfx.error();
  };

  const handleBuyTightbeam = () => {
    sfx.click();
    const res = cyberdeck.buyTightbeamMaser();
    addLog(`> ${res.message}`);
    if (res.success) sfx.loot();
    else sfx.error();
  };

  const handleBuyInitiativeBuffer = () => {
    sfx.click();
    const res = cyberdeck.buyInitiativeBuffer();
    addLog(`> ${res.message}`);
    if (res.success) sfx.loot();
    else sfx.error();
  };

  const handleBuyInterfaceBuffer = () => {
    sfx.click();
    const res = cyberdeck.buyInterfaceBuffer();
    addLog(`> ${res.message}`);
    if (res.success) sfx.loot();
    else sfx.error();
  };

  const handleBuyIcon = (tier: IconTier) => {
    sfx.click();
    const res = meatspace.buyCosmeticIcon(tier);
    addLog(`> ${res.message}`);
    if (res.success) sfx.loot();
    else sfx.error();
  };

  const handleBuyUtility = (type: IdentityUtilityType) => {
    sfx.click();
    const res = cyberdeck.buyIdentityUtility(type);
    addLog(`> ${res.message}`);
    if (res.success) sfx.loot();
    else sfx.error();
  };

  const handleToggleUtility = (type: IdentityUtilityType) => {
    sfx.click();
    const res = cyberdeck.toggleIdentityUtility(type);
    addLog(`> ${res.message}`);
  };

  const handleAcquireDaemon = (preset: 'cuckoo' | 'proteus', method: 'buy' | 'compile') => {
    sfx.click();
    const res = cyberdeck.acquireDaemon(preset, method);
    addLog(`> ${res.message}`);
    if (res.success) sfx.loot();
    else sfx.error();
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-2 sm:p-4 font-mono">
      <div className="border-2 border-neon-green/80 bg-black/95 p-4 sm:p-6 max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-[0_0_35px_rgba(0,255,204,0.3)]">
        {/* HEADER */}
        <div className="flex justify-between items-center border-b border-neon-green/40 pb-3 mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-widest text-neon-green">
              TECHIE CLINIC // SPEC-OPS UPGRADES
            </h2>
            <p className="text-xs text-gray-400">HARDWARE BUFFERS, COSMETIC ICONS, UTILITIES AND DAEMONS</p>
          </div>
          <button
            onClick={() => {
              sfx.click();
              onClose();
            }}
            className="border border-red-500 text-red-400 px-3 py-1 text-xs hover:bg-red-500 hover:text-black font-bold tracking-wider cursor-pointer"
          >
            [X] CLOSE
          </button>
        </div>

        {/* METRICS BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 p-2 border border-neon-green/30 bg-black/60 text-xs font-bold">
          <div>
            <span className="text-gray-400">BALANCE: </span>
            <span className="text-yellow-400">{credits} cr</span>
          </div>
          <div>
            <span className="text-gray-400">CYBERDECK MU: </span>
            <span className={remainingMu > 0 ? 'text-neon-green' : 'text-red-400'}>
              {cyberdeck.usedMu}/{cyberdeck.maxMu} ({remainingMu} FREE)
            </span>
          </div>
          <div>
            <span className="text-gray-400">EQUIPPED ICON: </span>
            <span className="text-cyan-400">{meatspace.equippedIconTier || 'SIMPLE'}</span>
          </div>
          <div>
            <span className="text-gray-400">LAG-SWITCH: </span>
            <span className={meatspace.hasLagSwitch ? 'text-neon-green' : 'text-gray-500'}>
              {meatspace.hasLagSwitch ? `ONLINE [${meatspace.lagToggleMode.toUpperCase()}]` : 'NOT INSTALLED'}
            </span>
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-2 border-b border-neon-green/30 pb-2 mb-4 text-xs font-bold overflow-x-auto">
          {(['HARDWARE', 'ICONS', 'UTILITIES', 'DAEMONS'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                sfx.click();
                setActiveTab(tab);
              }}
              className={`px-3 py-1 border cursor-pointer transition-colors ${
                activeTab === tab
                  ? 'border-neon-green bg-neon-green text-black font-bold'
                  : 'border-neon-green/40 text-neon-green hover:border-neon-green'
              }`}
            >
              [ {tab} ]
            </button>
          ))}
        </div>

        {/* TAB 1: HARDWARE */}
        {activeTab === 'HARDWARE' && (
          <div className="space-y-3">
            <div className="border border-neon-green/30 p-3 bg-black/40 flex justify-between items-center">
              <div>
                <div className="font-bold text-sm text-neon-green">Neural Lag-Switch</div>
                <div className="text-xs text-gray-400">
                  Allows manual toggling between Earth Mode and Deep Space Mode to mitigate light-lag.
                </div>
                <div className="text-xs text-yellow-400 font-bold mt-1">COST: 600 cr</div>
              </div>
              <button
                disabled={meatspace.hasLagSwitch || credits < 600}
                onClick={handleBuyLagSwitch}
                className="border border-neon-green px-3 py-2 text-xs font-bold hover:bg-neon-green hover:text-black disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-neon-green cursor-pointer"
              >
                {meatspace.hasLagSwitch ? '[ INSTALLED ]' : '[ BUY (600 cr) ]'}
              </button>
            </div>

            <div className="border border-neon-green/30 p-3 bg-black/40 flex justify-between items-center">
              <div>
                <div className="font-bold text-sm text-neon-green">Tightbeam Maser Array</div>
                <div className="text-xs text-gray-400">
                  Enables direct orbital relay routing and off-world Netrunning (LEO, Ring, Luna, Mars).
                </div>
                <div className="text-xs text-yellow-400 font-bold mt-1">COST: 1,500 cr</div>
              </div>
              <button
                disabled={cyberdeck.hasTightbeamMaser || credits < 1500}
                onClick={handleBuyTightbeam}
                className="border border-neon-green px-3 py-2 text-xs font-bold hover:bg-neon-green hover:text-black disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-neon-green cursor-pointer"
              >
                {cyberdeck.hasTightbeamMaser ? '[ INSTALLED ]' : '[ BUY (1,500 cr) ]'}
              </button>
            </div>

            <div className="border border-neon-green/30 p-3 bg-black/40 flex justify-between items-center">
              <div>
                <div className="font-bold text-sm text-neon-green">Time-Lag Buffer (Initiative)</div>
                <div className="text-xs text-gray-400">
                  Pre-computes incoming packets to cap light-lag REF penalties at -2.
                </div>
                <div className="text-xs text-yellow-400 font-bold mt-1">COST: 350 cr</div>
              </div>
              <button
                disabled={cyberdeck.hasInitiativeBuffer || credits < 350}
                onClick={handleBuyInitiativeBuffer}
                className="border border-neon-green px-3 py-2 text-xs font-bold hover:bg-neon-green hover:text-black disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-neon-green cursor-pointer"
              >
                {cyberdeck.hasInitiativeBuffer ? '[ INSTALLED ]' : '[ BUY (350 cr) ]'}
              </button>
            </div>

            <div className="border border-neon-green/30 p-3 bg-black/40 flex justify-between items-center">
              <div>
                <div className="font-bold text-sm text-neon-green">Time-Lag Buffer (Interface)</div>
                <div className="text-xs text-gray-400">
                  Pre-computes sensory packets to cap light-lag Interface skill penalties at -2.
                </div>
                <div className="text-xs text-yellow-400 font-bold mt-1">COST: 350 cr</div>
              </div>
              <button
                disabled={cyberdeck.hasInterfaceBuffer || credits < 350}
                onClick={handleBuyInterfaceBuffer}
                className="border border-neon-green px-3 py-2 text-xs font-bold hover:bg-neon-green hover:text-black disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-neon-green cursor-pointer"
              >
                {cyberdeck.hasInterfaceBuffer ? '[ INSTALLED ]' : '[ BUY (350 cr) ]'}
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: COSMETIC ICONS */}
        {activeTab === 'ICONS' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(Object.keys(COSMETIC_ICON_TIERS) as IconTier[]).map((tier) => {
              const item = COSMETIC_ICON_TIERS[tier];
              const isOwned = meatspace.ownedIconTiers?.includes(tier);
              const isEquipped = meatspace.equippedIconTier === tier;
              return (
                <div
                  key={tier}
                  className={`border p-3 flex flex-col justify-between ${
                    isEquipped
                      ? 'border-neon-green bg-neon-green/10'
                      : isOwned
                      ? 'border-cyan-500/50 bg-black/40'
                      : 'border-gray-700 bg-black/20'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm text-neon-green">{item.name}</span>
                      <span className="text-[10px] text-yellow-400">DIFF: {item.difficulty}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">{item.description}</div>
                  </div>
                  <div className="mt-3 flex justify-between items-center border-t border-gray-800 pt-2">
                    <span className="text-xs text-yellow-400 font-bold">{item.creditCost} cr</span>
                    <button
                      onClick={() => handleBuyIcon(tier)}
                      disabled={!isOwned && credits < item.creditCost}
                      className="border border-neon-green px-2 py-1 text-xs font-bold hover:bg-neon-green hover:text-black disabled:opacity-40 cursor-pointer"
                    >
                      {isEquipped ? '[ EQUIPPED ]' : isOwned ? '[ EQUIP ]' : `[ BUY (${item.creditCost} cr) ]`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: IDENTITY UTILITIES */}
        {activeTab === 'UTILITIES' && (
          <div className="space-y-3">
            {IDENTITY_UTILITY_CATALOG.map((util) => {
              const owned = cyberdeck.ownedUtilities.find((u) => u.id === util.id);
              const isOwned = !!owned;
              const isActive = owned?.active ?? false;
              return (
                <div
                  key={util.id}
                  className={`border p-3 flex justify-between items-center ${
                    isActive ? 'border-neon-green bg-neon-green/10' : 'border-gray-700 bg-black/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-neon-green">{util.name}</span>
                      <span className="text-xs text-cyan-400 font-bold">STR {util.strength}</span>
                      <span className="text-xs text-purple-400">{util.muCost} MU</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Identity masking program. Provides stealth/evasion against roaming GridSec sysops.
                    </div>
                    <div className="text-xs text-yellow-400 font-bold mt-1">COST: {util.creditCost} cr</div>
                  </div>
                  <div className="flex gap-2">
                    {isOwned ? (
                      <button
                        onClick={() => handleToggleUtility(util.id)}
                        className={`border px-3 py-1.5 text-xs font-bold cursor-pointer ${
                          isActive
                            ? 'border-neon-green bg-neon-green text-black'
                            : 'border-neon-green/60 text-neon-green hover:bg-neon-green hover:text-black'
                        }`}
                      >
                        {isActive ? '[ ACTIVE ]' : '[ STANDBY ]'}
                      </button>
                    ) : (
                      <button
                        disabled={credits < util.creditCost || remainingMu < util.muCost}
                        onClick={() => handleBuyUtility(util.id)}
                        className="border border-neon-green px-3 py-1.5 text-xs font-bold hover:bg-neon-green hover:text-black disabled:opacity-40 cursor-pointer"
                      >
                        [ BUY ({util.creditCost} cr) ]
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 4: DAEMONS */}
        {activeTab === 'DAEMONS' && (
          <div className="space-y-4">
            {/* CUCKOO BIRD */}
            <div className="border border-yellow-500/40 p-4 bg-yellow-900/10">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base font-bold text-yellow-400">Cuckoo Bird Daemon</h3>
                  <p className="text-xs text-gray-300 mt-1">
                    Autonomous stealth infiltration daemon. Base STR 9, Op STR 5 (4 subprograms).
                  </p>
                  <div className="text-xs text-gray-400 mt-2 space-y-0.5">
                    <div>SUBPROGRAMS: Disguise, Intrusion, Decryption, Utility</div>
                    <div>SPECS: 7 MU footprint | INT 6 | Difficulty 58 | 348 Coding Hours</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-yellow-400">1,450 cr</span>
                </div>
              </div>
              <div className="mt-4 flex gap-2 justify-end">
                <button
                  onClick={() => handleAcquireDaemon('cuckoo', 'compile')}
                  className="border border-purple-400 text-purple-300 px-3 py-1.5 text-xs font-bold hover:bg-purple-400 hover:text-black cursor-pointer"
                >
                  [ COMPILE TO DECK ]
                </button>
                <button
                  disabled={credits < 1450}
                  onClick={() => handleAcquireDaemon('cuckoo', 'buy')}
                  className="border border-yellow-400 text-yellow-400 px-3 py-1.5 text-xs font-bold hover:bg-yellow-400 hover:text-black disabled:opacity-40 cursor-pointer"
                >
                  [ BUY PRE-COMPILED (1,450 cr) ]
                </button>
              </div>
            </div>

            {/* PROTEUS */}
            <div className="border border-purple-500/40 p-4 bg-purple-900/10">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base font-bold text-purple-400">Proteus Protocol Daemon</h3>
                  <p className="text-xs text-gray-300 mt-1">
                    Elite autonomous combat & shape-shifting daemon. Base STR 16, Op STR 10 (6 subprograms).
                  </p>
                  <div className="text-xs text-gray-400 mt-2 space-y-0.5">
                    <div>SUBPROGRAMS: Disguise, Invisibility, Intrusion, Decryption, Utility, Killer V2</div>
                    <div>SPECS: 4 MU (Code Optimized) | INT 6 | Difficulty 122 | 732 Coding Hours</div>
                    <div className="text-cyan-400">FEATURES: Conversational Ability, Doppelganger Absorption</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-purple-400">3,050 cr</span>
                </div>
              </div>
              <div className="mt-4 flex gap-2 justify-end">
                <button
                  onClick={() => handleAcquireDaemon('proteus', 'compile')}
                  className="border border-purple-400 text-purple-300 px-3 py-1.5 text-xs font-bold hover:bg-purple-400 hover:text-black cursor-pointer"
                >
                  [ COMPILE TO DECK ]
                </button>
                <button
                  disabled={credits < 3050}
                  onClick={() => handleAcquireDaemon('proteus', 'buy')}
                  className="border border-purple-400 text-purple-400 px-3 py-1.5 text-xs font-bold hover:bg-purple-400 hover:text-black disabled:opacity-40 cursor-pointer"
                >
                  [ BUY PRE-COMPILED (3,050 cr) ]
                </button>
              </div>
            </div>

            {/* COMPILED DAEMONS LIST */}
            {cyberdeck.compiledDaemons.length > 0 && (
              <div className="border border-neon-green/30 p-3 bg-black/60 mt-4">
                <h4 className="text-xs font-bold text-neon-green mb-2">COMPILED DAEMONS IN DECK STORAGE:</h4>
                <div className="space-y-1">
                  {cyberdeck.compiledDaemons.map((d) => (
                    <div
                      key={d.id}
                      className="text-xs flex justify-between items-center border border-gray-800 p-2 bg-black/40"
                    >
                      <span className="font-bold text-white">{d.name}</span>
                      <span className="text-gray-400">
                        OP STR: {d.operationalStrength} | {d.muFootprint} MU | STATUS: {d.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
