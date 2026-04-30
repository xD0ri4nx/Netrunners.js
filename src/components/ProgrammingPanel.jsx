import { useState } from 'react';
import { useMeatspaceStore } from '../store/meatspaceStore';
import { useCyberdeckStore } from '../store/cyberdeckStore';
import { useTerminalStore } from '../store/terminalStore';
import { sfx } from '../utils/sfx';

const PROGRAM_TEMPLATES = [
  { id: 'custom_sword', name: 'Sword', type: 'anti-ice', strength: 4, baseCost: 300, baseDays: 2 },
  { id: 'custom_hammer', name: 'Hammer', type: 'intrusion', strength: 4, baseCost: 400, baseDays: 3 },
  { id: 'custom_decrypt', name: 'Decrypt v1.0', type: 'utility', strength: 4, baseCost: 350, baseDays: 2 },
  { id: 'custom_shield', name: 'Shield', type: 'defense', strength: 3, baseCost: 150, baseDays: 1 },
  { id: 'custom_armor', name: 'Armor', type: 'defense', strength: 4, baseCost: 170, baseDays: 2 },
  { id: 'custom_invisibility', name: 'Invisibility', type: 'stealth', strength: 3, baseCost: 500, baseDays: 4 },
  { id: 'custom_brainwipe', name: 'Brainwipe', type: 'anti-ice', strength: 3, baseCost: 600, baseDays: 5 },
  { id: 'custom_liche', name: 'Liche', type: 'anti-ice', strength: 4, baseCost: 700, baseDays: 5 },
  { id: 'custom_krash', name: 'Krash', type: 'anti-system', strength: 0, baseCost: 800, baseDays: 6 },
  { id: 'custom_viral15', name: 'Viral 15', type: 'anti-system', strength: 0, baseCost: 600, baseDays: 5 },
  { id: 'custom_imp', name: 'Imp', type: 'daemon', strength: 2, baseCost: 300, baseDays: 3 },
  { id: 'custom_balron', name: 'Balron', type: 'daemon', strength: 5, baseCost: 1200, baseDays: 8 },
  { id: 'custom_flak', name: 'Flak', type: 'defense', strength: 4, baseCost: 180, baseDays: 2 },
];

export function ProgrammingPanel({ onClose }) {
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [isCompiling, setIsCompiling] = useState(false);

  const programming = useMeatspaceStore(state => state.programming);
  const funds = useMeatspaceStore(state => state.funds);
  const isProgramming = useMeatspaceStore(state => state.isProgramming);
  const programmingDays = useMeatspaceStore(state => state.programmingDays);
  const pendingProgram = useMeatspaceStore(state => state.pendingProgram);
  const programs = useCyberdeckStore(state => state.programs);
  const addProgram = useCyberdeckStore(state => state.addProgram);
  const startProgramming = useMeatspaceStore(state => state.startProgramming);
  const cancelProgramming = useMeatspaceStore(state => state.cancelProgramming);
  const completeProgramming = useMeatspaceStore(state => state.completeProgramming);
  const deductFunds = useMeatspaceStore(state => state.deductFunds);
  const addLog = useTerminalStore(state => state.addLog);

  const handleStartCompile = () => {
    if (!selectedProgram) return;

    const existing = programs.find(p => p.id === selectedProgram.id);
    if (existing) {
      sfx.error();
      addLog("> ERROR: PROGRAM ALREADY IN MEMORY.");
      return;
    }

    if (funds < selectedProgram.cost) {
      sfx.error();
      addLog("> ERROR: INSUFFICIENT FUNDS.");
      return;
    }

    sfx.click();
    deductFunds(selectedProgram.cost);
    startProgramming(selectedProgram, selectedProgram.days);
    setIsCompiling(true);
    addLog(`> COMPILATION STARTED: ${selectedProgram.name.toUpperCase()}.`);
    addLog(`> TIME REQUIRED: ${selectedProgram.days} DAYS. COST: ${selectedProgram.cost} eb.`);
  };

  const handleFinishDay = () => {
    if (!isProgramming) return;

    const daysLeft = programmingDays - 1;
    if (daysLeft <= 0) {
      sfx.loot();
      completeProgramming();
      addLog(`> COMPILATION COMPLETE: ${pendingProgram.name.toUpperCase()} ADDED TO DECK.`);
      setIsCompiling(false);
      setSelectedProgram(null);
    } else {
      useMeatspaceStore.setState({ programmingDays: daysLeft });
      addLog(`> COMPILATION IN PROGRESS... ${daysLeft} DAYS REMAINING.`);
    }
  };

  const handleCancel = () => {
    if (isProgramming) {
      sfx.error();
      cancelProgramming();
      addLog("> COMPILATION CANCELLED.");
      setIsCompiling(false);
    }
    setSelectedProgram(null);
  };

  return (
    <div className="bg-black border-2 border-neon-green p-4 shadow-[0_0_30px_#00ffcc40] max-w-2xl w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold tracking-widest text-neon-green">CUSTOM PROGRAMMING</h3>
        <button onClick={onClose} className="text-neon-green hover:text-black hover:bg-neon-green px-2 py-1 border border-neon-green transition-colors text-sm">
          [ CLOSE ]
        </button>
      </div>

      {isProgramming ? (
        <div className="text-center py-8">
          <div className="text-2xl font-bold text-neon-green mb-4 animate-pulse">
            COMPILING: {pendingProgram?.name?.toUpperCase()}
          </div>
          <div className="text-sm text-gray-400 mb-4">
            DAYS REMAINING: {programmingDays}
          </div>
          <div className="w-full bg-gray-900 h-4 mb-4 border border-neon-green/30">
            <div
              className="bg-neon-green h-full transition-all duration-500"
              style={{ width: `${((pendingProgram?.days - programmingDays) / pendingProgram?.days) * 100}%` }}
            />
          </div>
          <div className="flex gap-2 justify-center">
            <button
              onClick={handleFinishDay}
              className="bg-neon-green text-black px-4 py-2 font-bold hover:bg-green-400 transition-colors text-sm"
            >
              [ PASS DAY ]
            </button>
            <button
              onClick={handleCancel}
              className="bg-black border border-red-500 text-red-500 px-4 py-2 font-bold hover:bg-red-500 hover:text-black transition-colors text-sm"
            >
              [ CANCEL ]
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-400 mb-4">
            Programming Skill: {programming} | Higher skill = lower cost and faster compilation
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 max-h-64 overflow-y-auto">
            {PROGRAM_TEMPLATES.map(template => {
              const cost = Math.max(50, template.baseCost - (programming * 20));
              const days = Math.max(1, template.baseDays - Math.floor(programming / 3));
              const isSelected = selectedProgram?.id === template.id;

              return (
                <button
                  key={template.id}
                  onClick={() => {
                    setSelectedProgram({ ...template, cost, days });
                    sfx.click();
                  }}
                  className={`text-left p-2 border transition-colors text-xs ${
                    isSelected
                      ? 'bg-neon-green/20 border-neon-green'
                      : 'border-neon-green/30 hover:bg-neon-green/10'
                  }`}
                >
                  <div className="font-bold text-neon-green">{template.name}</div>
                  <div className="text-gray-400">
                    {template.type} | STR: {template.strength || 'N/A'} | Cost: {cost} eb | Days: {days}
                  </div>
                </button>
              );
            })}
          </div>

          {selectedProgram && (
            <div className="flex gap-2 justify-center">
              <button
                onClick={handleStartCompile}
                className="bg-neon-green text-black px-4 py-2 font-bold hover:bg-green-400 transition-colors text-sm"
              >
                [ START COMPILATION: {selectedProgram.cost} eb, {selectedProgram.days} DAYS ]
              </button>
              <button
                onClick={() => setSelectedProgram(null)}
                className="bg-black border border-red-500 text-red-500 px-4 py-2 font-bold hover:bg-red-500 hover:text-black transition-colors text-sm"
              >
                [ CLEAR ]
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
