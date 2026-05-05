import { useState } from 'react';
import { useMeatspaceStore } from '../store/meatspaceStore';
import cyberware from '../data/cyberware';

const FBC_CHASSIS = [
  { id: 'fbc_gemini', name: 'Gemini', category: 'chromebook2', cost: 55000, desc: 'Human-passing chassis. Bypasses security. No inherent armor.', baseStats: { ref: 10, ma: 10, body: 12, sp: 0 }, sdp: { head: 30, lArm: 20, rArm: 20, lLeg: 20, rLeg: 20, torso: 40 } },
  { id: 'fbc_alpha', name: 'Alpha Class', category: 'chromebook2', cost: 58000, desc: 'Standard combat/solo conversion. Heavily armored.', baseStats: { ref: 10, ma: 10, body: 12, sp: 25 }, sdp: { head: 30, lArm: 20, rArm: 20, lLeg: 20, rLeg: 20, torso: 40 } },
  { id: 'fbc_wingman', name: 'Wingman', category: 'chromebook2', cost: 54000, desc: 'Aerospace pilot. Immune to high G-forces.', baseStats: { ref: 15, ma: 10, body: 12, sp: 25 }, sdp: { head: 30, lArm: 20, rArm: 20, lLeg: 20, rLeg: 20, torso: 40 } },
  { id: 'fbc_eclipse', name: 'Eclipse', category: 'chromebook2', cost: 76000, desc: 'Espionage chassis. Radar-absorbent, silent joints.', baseStats: { ref: 10, ma: 12, body: 10, sp: 15 }, sdp: { head: 30, lArm: 20, rArm: 20, lLeg: 20, rLeg: 20, torso: 40 } },
  { id: 'fbc_aquarius', name: 'Aquarius', category: 'chromebook2', cost: 65000, desc: 'Deep-sea operations. Sonar, pressure resistant.', baseStats: { ref: 8, ma: 10, body: 12, sp: 15 }, special: 'underwater', sdp: { head: 30, lArm: 20, rArm: 20, lLeg: 20, rLeg: 20, torso: 50 } },
  { id: 'fbc_fireman', name: 'Fireman', category: 'chromebook2', cost: 60000, desc: 'Hazard/rescue. Immune to heat and toxins.', baseStats: { ref: 8, ma: 10, body: 14, sp: 20 }, sdp: { head: 30, lArm: 30, rArm: 30, lLeg: 30, rLeg: 30, torso: 50 } },
  { id: 'fbc_samson', name: 'Samson', category: 'chromebook2', cost: 40000, desc: 'Heavy industrial. Massive lifting capacity.', baseStats: { ref: 6, ma: 8, body: 18, sp: 15 }, sdp: { head: 30, lArm: 40, rArm: 40, lLeg: 50, rLeg: 50, torso: 60 } },
  { id: 'fbc_wiseman', name: 'Wiseman', category: 'chromebook3', cost: 90000, desc: 'Netrunner chassis. Extra MU, Firestarter immune.', baseStats: { ref: 10, ma: 10, body: 12, sp: 15 }, special: 'firestarterImmune', sdp: { head: 30, lArm: 20, rArm: 20, lLeg: 20, rLeg: 20, torso: 40 } },
  { id: 'fbc_dragoon', name: 'Dragoon', category: 'chromebook3', cost: 120000, desc: 'Military tank. Mount heavy weapons.', baseStats: { ref: 15, ma: 25, body: 20, sp: 40 }, sdp: { head: 40, lArm: 50, rArm: 50, lLeg: 50, rLeg: 50, torso: 60 } },
  { id: 'fbc_spyder', name: 'Spyder', category: 'chromebook3', cost: 118110, desc: 'Multi-limbed. Wall-crawling capability.', baseStats: { ref: 12, ma: 20, body: 12, sp: 30 }, sdp: { head: 30, lArm: 20, rArm: 20, lLeg: 20, rLeg: 20, torso: 40 } },
  { id: 'fbc_copernicus', name: 'Copernicus', category: 'deepspace', cost: 60000, desc: 'Space exploration. Radiation/EMP shielded.', baseStats: { ref: 11, ma: 10, body: 12, sp: 25 }, special: 'space', sdp: { head: 30, lArm: 20, rArm: 20, lLeg: 20, rLeg: 20, torso: 40 } },
  { id: 'fbc_burroughs', name: 'Burroughs', category: 'deepspace', cost: 65000, desc: 'Mars operations. Sandstorm resistant.', baseStats: { ref: 10, ma: 10, body: 12, sp: 30 }, special: 'mars', sdp: { head: 30, lArm: 30, rArm: 30, lLeg: 40, rLeg: 40, torso: 50 } },
];

export default function RipperdocPanel({ onClose }) {
  const { funds, deductFunds, installCyberware, cyberware: installed, humanity, maxHumanity, cyberpsychosisLevel, isFBC, currentChassis, ownedChassis, sdp, maxSdp, convertToFBC, purchaseChassis, swapChassis, repairSDP } = useMeatspaceStore();
  const [selected, setSelected] = useState(null);
  const [showFBCPanel, setShowFBCPanel] = useState(false);
  const [repairAmount, setRepairAmount] = useState(10);

  const handleInstall = (ware) => {
    if (funds < ware.cost) return alert('Insufficient Eurobucks!');
    if (installed.find(w => w.id === ware.id)) return alert('Already installed!');
    deductFunds(ware.cost);
    installCyberware(ware);
  };

  const handleConvertToFBC = (chassisId) => {
    const cost = 30000;
    if (funds < cost) return alert('Insufficient Eurobucks! Conversion costs 30,000 eb.');
    const result = useMeatspaceStore.getState().convertToFBC(chassisId, cost);
    alert(result.message);
  };

  const handleBuyChassis = (chassisId) => {
    const chassis = FBC_CHASSIS.find(c => c.id === chassisId);
    if (funds < chassis.cost) return alert(`Insufficient Eurobucks! ${chassis.name} costs ${chassis.cost} eb.`);
    const result = useMeatspaceStore.getState().purchaseChassis(chassisId);
    alert(result.message);
  };

  const handleSwapChassis = (chassisId) => {
    const result = useMeatspaceStore.getState().swapChassis(chassisId);
    alert(result.message);
  };

  const handleRepair = () => {
    const result = useMeatspaceStore.getState().repairSDP(repairAmount, 10);
    alert(result.message);
  };

  const getCpWarning = () => {
    if (cyberpsychosisLevel >= 3) return '⚠ CYBERPSYCHOSIS CRITICAL - RECKLESS ACTIONS FORCED';
    if (cyberpsychosisLevel >= 2) return '⚠ CYBERPSYCHOSIS ACTIVE - HALLUCINATIONS & PENALTIES';
    if (cyberpsychosisLevel >= 1) return '⚠ EARLY CYBERPSYCHOSIS - UI GLITCHES DETECTED';
    return null;
  };

  const currentSDPTotal = Object.values(sdp).reduce((a, b) => a + b, 0);
  const maxSDPTotal = Object.values(maxSdp).reduce((a, b) => a + b, 0);
  const repairable = maxSDPTotal - currentSDPTotal;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-cyan-500 rounded-lg max-w-4xl w-full max-h-[85vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-cyan-400 text-xl font-bold">[ RIPPERDOC CLINIC ]</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        <div className="mb-4 p-3 bg-gray-800 rounded">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-300">Funds: <span className="text-green-400">{funds} eb</span></span>
            {isFBC ? (
              <span className="text-cyan-400">SDP: {currentSDPTotal}/{maxSDPTotal}</span>
            ) : (
              <span className="text-gray-300">Humanity: <span className={humanity <= 30 ? 'text-red-400' : humanity <= 50 ? 'text-yellow-400' : 'text-green-400'}>{humanity}/{maxHumanity}</span></span>
            )}
          </div>
          {isFBC && currentChassis && (
            <div className="text-xs text-cyan-400 mb-1">CHASSIS: {currentChassis}</div>
          )}
          {!isFBC && cyberpsychosisLevel > 0 && (
            <div className="text-red-400 text-xs font-bold animate-pulse">{getCpWarning()}</div>
          )}
        </div>

        {/* FBC Toggle Button */}
        <div className="mb-4">
          <button
            onClick={() => setShowFBCPanel(!showFBCPanel)}
            className={`w-full py-2 px-4 border rounded font-bold text-sm ${isFBC ? 'border-cyan-500 bg-cyan-900/30 text-cyan-400' : 'border-red-500 bg-red-900/30 text-red-400'}`}
          >
            {isFBC ? '[ FBC STATUS ]' : '[ CONVERT TO FBC ]'}
          </button>
        </div>

        {/* FBC Panel */}
        {showFBCPanel && (
          <div className="mb-4 p-3 bg-gray-800 rounded border border-cyan-500/50">
            {!isFBC ? (
              <>
                <h3 className="text-cyan-400 text-sm font-bold mb-2">SELECT INITIAL CHASSIS (30,000 eb)</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  {FBC_CHASSIS.map(chassis => (
                    <button
                      key={chassis.id}
                      onClick={() => handleConvertToFBC(chassis.id)}
                      disabled={funds < 30000}
                      className="border border-gray-600 bg-gray-700 p-2 rounded text-left hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="text-cyan-300 text-xs font-bold">{chassis.name}</div>
                      <div className="text-gray-400 text-[10px]">{chassis.desc}</div>
                      <div className="text-yellow-400 text-[10px]">REF:{chassis.baseStats.ref} MA:{chassis.baseStats.ma} BODY:{chassis.baseStats.body} SP:{chassis.baseStats.sp}</div>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                {/* Current FBC Status */}
                <div className="mb-3 p-2 bg-gray-700 rounded">
                  <h3 className="text-cyan-400 text-sm font-bold mb-2">CURRENT CHASSIS</h3>
                  {ownedChassis.map(ch => (
                    <div key={ch.id} className={`text-xs p-1 ${ch.id === currentChassis ? 'text-green-400 bg-green-900/30' : 'text-gray-400'}`}>
                      {ch.id === currentChassis ? '► ' : '  '}{ch.name} (REF:{ch.baseStats.ref} MA:{ch.baseStats.ma} BODY:{ch.baseStats.body})
                    </div>
                  ))}
                </div>

                {/* Swap Chassis */}
                {ownedChassis.length > 1 && (
                  <div className="mb-3">
                    <h3 className="text-cyan-400 text-xs font-bold mb-1">SWAP CHASSIS</h3>
                    <select 
                      onChange={(e) => e.target.value && handleSwapChassis(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 text-xs p-2"
                      defaultValue=""
                    >
                      <option value="">Select chassis...</option>
                      {ownedChassis.map(ch => (
                        <option key={ch.id} value={ch.id}>{ch.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Buy New Chassis */}
                <div className="mb-3">
                  <h3 className="text-cyan-400 text-xs font-bold mb-1">BUY NEW CHASSIS</h3>
                  <div className="grid grid-cols-2 gap-1 max-h-24 overflow-y-auto">
                    {FBC_CHASSIS.filter(c => !ownedChassis.some(owned => owned.id === c.id)).map(chassis => (
                      <button
                        key={chassis.id}
                        onClick={() => handleBuyChassis(chassis.id)}
                        disabled={funds < chassis.cost}
                        className="border border-gray-600 bg-gray-700 p-1 rounded text-left hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="text-cyan-300 text-xs">{chassis.name}</span>
                        <span className="text-yellow-400 text-xs ml-1">{chassis.cost}eb</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Repair SDP */}
                <div className="mb-2">
                  <h3 className="text-cyan-400 text-xs font-bold mb-1">REPAIR SDP ({repairable} repairable)</h3>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={repairAmount}
                      onChange={(e) => setRepairAmount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="bg-gray-700 border border-gray-600 text-xs p-1 w-16"
                      min={1}
                      max={repairable}
                    />
                    <button
                      onClick={handleRepair}
                      disabled={repairable <= 0 || funds < repairAmount * 10}
                      className="bg-cyan-700 text-white text-xs px-3 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      REPAIR ({repairAmount * 10} eb)
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Cyberware Section */}
        {!isFBC && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {cyberware.map((ware) => {
                const isInstalled = installed.find(w => w.id === ware.id);
                const canAfford = funds >= ware.cost;
                return (
                  <div key={ware.id} className={`border rounded p-3 ${isInstalled ? 'border-green-600 bg-green-900/20' : 'border-gray-700 bg-gray-800'} ${selected?.id === ware.id ? 'ring-2 ring-cyan-500' : ''}`}>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-cyan-300 font-bold text-sm">{ware.name}</h3>
                      <span className="text-yellow-400 text-xs">{ware.cost} eb</span>
                    </div>
                    <p className="text-gray-400 text-xs mb-2">{ware.description}</p>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-red-400">Humanity: -{ware.humanityCost}</span>
                      {ware.bonuses && (
                        <span className="text-green-400">
                          {Object.entries(ware.bonuses).map(([k, v]) => `+${v} ${k.toUpperCase()}`).join(' ')}
                        </span>
                      )}
                    </div>
                    {isInstalled ? (
                      <div className="mt-2 text-green-400 text-xs">✓ INSTALLED</div>
                    ) : (
                      <button
                        onClick={() => handleInstall(ware)}
                        disabled={!canAfford}
                        className={`mt-2 w-full py-1 rounded text-xs font-bold ${canAfford ? 'bg-cyan-700 hover:bg-cyan-600 text-white' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                      >
                        {canAfford ? 'INSTALL' : 'INSUFFICIENT FUNDS'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {installed.length > 0 && (
              <div className="mt-4 p-3 bg-gray-800 rounded">
                <h3 className="text-cyan-300 text-sm mb-2">Installed Cyberware:</h3>
                {installed.map(w => (
                  <div key={w.id} className="text-xs text-gray-300">{w.name} (Humanity: -{w.humanityCost})</div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}