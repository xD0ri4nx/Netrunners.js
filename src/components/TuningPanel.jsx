import { useMeatspaceStore } from '../store/meatspaceStore';
import { useCyberdeckStore } from '../store/cyberdeckStore';
import { useTerminalStore } from '../store/terminalStore';

const TUNE_OPTIONS = [
    { id: 'speed', name: 'OVERCLOCK SPEED', desc: '+1 Speed permanently', difficulty: 20, cost: 1000 },
    { id: 'mu', name: 'EXPAND MU', desc: '+2 Max MU permanently', difficulty: 25, cost: 500 },
    { id: 'datawalls', name: 'HARDWIRE DEFENSE', desc: '+1 Data Walls permanently', difficulty: 22, cost: 750 }
];

export function TuningPanel({ onClose }) {
    const meatspace = useMeatspaceStore();
    const cyberdeck = useCyberdeckStore();
    const addLog = useTerminalStore(s => s.addLog);

    const tech = meatspace.tech || 5;
    const cyberdeckDesign = meatspace.skills?.cyberdeckDesign || 1;
    const skillTotal = tech + cyberdeckDesign;
    const tuningLimit = cyberdeck.getTuningLimit();
    const canTune = cyberdeck.canTune();

    const handleTune = (tuneId) => {
        const tuneType = TUNE_OPTIONS.find(t => t.id === tuneId);
        if (!tuneType) return;

        if (meatspace.funds < tuneType.cost) {
            addLog(`> INSUFFICIENT FUNDS FOR ${tuneType.name.toUpperCase()}.`);
            return;
        }

        if (!canTune) {
            addLog(`> TUNING LIMIT REACHED. MAX ${tuningLimit} UPGRADES.`);
            return;
        }

        useMeatspaceStore.getState().deductFunds(tuneType.cost);
        const result = cyberdeck.performTune(tuneId);
        
        addLog(`> ${tuneType.name.toUpperCase()}: ROLL ${result.roll} + ${skillTotal} = ${result.total} (${result.fumble ? 'FUMBLE' : result.success ? 'SUCCESS' : 'FAIL'})`);
        
        if (result.message) {
            addLog(`> ${result.message}`);
        }

        if (result.success || result.fumble) {
            if (!result.success) {
                if (result.message.includes('DESTROYED')) {
                    addLog(`> WARNING: DECK DESTROYED. PURCHASE NEW DECK TO CONTINUE.`);
                }
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border-2 border-orange-500 max-w-lg w-full rounded-lg p-6 shadow-[0_0_30px_rgba(249,115,22,0.3)]">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-orange-400 text-xl font-bold">[ HARDWARE TUNING ]</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
                </div>

                <div className="mb-4 p-3 bg-gray-800 rounded">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-300">Funds: <span className="text-green-400">{meatspace.funds} eb</span></span>
                        <span className="text-orange-400">TUNES: {cyberdeck.tuningCount}/{tuningLimit}</span>
                    </div>
                    <div className="text-xs text-gray-400">
                        TECH + Cyberdeck Design = <span className="text-yellow-400">{tech} + {cyberdeckDesign} = {skillTotal}</span>
                    </div>
                </div>

                <div className="mb-4 p-2 bg-red-900/30 border border-red-500/50 rounded">
                    <p className="text-red-400 text-xs font-bold">⚠ FUMBLE RISK: 10%</p>
                    <p className="text-gray-400 text-[10px]">Rolling a 1 triggers severity table. Can destroy deck permanently.</p>
                </div>

                <div className="space-y-2 mb-4">
                    {TUNE_OPTIONS.map(tune => {
                        const successChance = cyberdeck.getTuningSuccessChance(tune.difficulty);
                        const disabled = !canTune || meatspace.funds < tune.cost;
                        
                        return (
                            <button
                                key={tune.id}
                                onClick={() => handleTune(tune.id)}
                                disabled={disabled}
                                className={`w-full p-3 border rounded text-left transition-colors ${
                                    disabled
                                        ? 'border-gray-700 bg-gray-800 opacity-50 cursor-not-allowed'
                                        : 'border-orange-500/50 bg-gray-800 hover:bg-orange-900/30'
                                }`}
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="text-orange-300 font-bold text-sm">{tune.name}</div>
                                        <div className="text-gray-400 text-xs">{tune.desc}</div>
                                        <div className="text-gray-500 text-[10px]">Diff {tune.difficulty} | Cost: {tune.cost} eb</div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-sm font-bold ${successChance >= 60 ? 'text-green-400' : successChance >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                                            {successChance}%
                                        </div>
                                        <div className="text-[10px] text-gray-500">success</div>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {cyberdeck.tuningHistory.length > 0 && (
                    <div className="p-2 bg-gray-800 rounded">
                        <p className="text-orange-400 text-xs font-bold mb-1">TUNING HISTORY:</p>
                        {cyberdeck.tuningHistory.map((t, i) => (
                            <div key={i} className="text-gray-400 text-xs">
                                +{t.bonus} {t.stat.toUpperCase()} ({t.type})
                            </div>
                        ))}
                    </div>
                )}

                <button
                    onClick={onClose}
                    className="w-full mt-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded"
                >
                    CLOSE
                </button>
            </div>
        </div>
    );
}