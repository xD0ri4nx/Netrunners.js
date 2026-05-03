import { useState, useEffect } from 'react';
import { useMeatspaceStore } from '../store/meatspaceStore';
import { useCyberdeckStore } from '../store/cyberdeckStore';
import { useTerminalStore } from '../store/terminalStore';
import { sfx } from '../utils/sfx';

const PROGRAM_TEMPLATES = [
  { id: 'sword', name: 'Sword', type: 'anti-ice', strength: 4, function: 'Attack', difficulty: 14 },
  { id: 'hammer', name: 'Hammer', type: 'intrusion', strength: 4, function: 'Breach', difficulty: 12 },
  { id: 'jackhammer', name: 'Jackhammer', type: 'intrusion', strength: 2, function: 'Breach', difficulty: 8 },
  { id: 'decrypt', name: 'Decrypt v1.0', type: 'utility', strength: 4, function: 'Utility', difficulty: 14 },
  { id: 'shield', name: 'Shield', type: 'defense', strength: 3, function: 'Defense', difficulty: 11 },
  { id: 'armor', name: 'Armor', type: 'defense', strength: 4, function: 'Defense', difficulty: 14 },
  { id: 'flak', name: 'Flak', type: 'defense', strength: 4, function: 'Defense', difficulty: 14 },
  { id: 'invisibility', name: 'Invisibility', type: 'stealth', strength: 3, function: 'Stealth', difficulty: 12 },
  { id: 'brainwipe', name: 'Brainwipe', type: 'anti-ice', strength: 3, function: 'Attack', difficulty: 18 },
  { id: 'liche', name: 'Liche', type: 'anti-ice', strength: 4, function: 'Attack', difficulty: 20 },
  { id: 'krash', name: 'Krash', type: 'anti-system', strength: 0, function: 'System', difficulty: 16 },
  { id: 'viral15', name: 'Viral 15', type: 'anti-system', strength: 0, function: 'System', difficulty: 12 },
  { id: 'imp', name: 'Imp', type: 'daemon', strength: 2, function: 'Daemon', difficulty: 10 },
  { id: 'balron', name: 'Balron', type: 'daemon', strength: 5, function: 'Daemon', difficulty: 24 },
];

const DEMON_TEMPLATES = [
  { id: 'demon_minion', name: 'Minion Demon', baseDifficulty: 15, baseStrength: 4, description: 'Links 2 programs, -2 STR total' },
  { id: 'demon_warden', name: 'Warden Demon', baseDifficulty: 20, baseStrength: 6, description: 'Links 3 programs, -3 STR total' },
  { id: 'demon_overlord', name: 'Overlord Demon', baseDifficulty: 28, baseStrength: 8, description: 'Links 4 programs, -4 STR total' },
];

const DAEMON_OPTIONS = [
  { id: 'recognition', name: 'Recognition', difficulty: 5, description: 'Basic daemon awareness' },
  { id: 'movement', name: 'Movement', difficulty: 5, description: 'Autonomous movement capability' },
  { id: 'pseudointellect', name: 'Pseudointellect', difficulty: 10, description: 'Basic AI decision making' },
  { id: 'disguise', name: 'Disguise', difficulty: 10, description: 'Fool defensive programs' },
  { id: 'doppleganger', name: 'Doppleganger', difficulty: 20, description: 'Absorb destroyed program functions' },
];

const TYPE_COLORS = {
  'anti-ice': 'text-red-400 border-red-500/50',
  'anti-system': 'text-orange-400 border-orange-500/50',
  'intrusion': 'text-yellow-400 border-yellow-500/50',
  'utility': 'text-blue-400 border-blue-500/50',
  'stealth': 'text-purple-400 border-purple-500/50',
  'defense': 'text-teal-400 border-teal-500/50',
  'daemon': 'text-cyan-400 border-cyan-500/50'
};

export function ProgrammingPanel({ onClose }) {
  const [activeTab, setActiveTab] = useState('programs');
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [selectedDemon, setSelectedDemon] = useState(null);
  const [linkedPrograms, setLinkedPrograms] = useState([]);
  const [selectedDaemonOptions, setSelectedDaemonOptions] = useState([]);
  const [isIndependentDaemon, setIsIndependentDaemon] = useState(false);
  const [codeOptimization, setCodeOptimization] = useState(false);

  const int = useMeatspaceStore(state => state.int);
  const programming = useMeatspaceStore(state => state.programming);
  const interfaceType = useMeatspaceStore(state => state.interfaceType);
  const interfaceBonus = interfaceType === 'interfacePlugs' ? 1 : interfaceType === 'trodes' ? -1 : 0;
  const funds = useMeatspaceStore(state => state.funds);
  const isProgramming = useMeatspaceStore(state => state.isProgramming);
  const programmingDays = useMeatspaceStore(state => state.programmingDays);
  const pendingProgram = useMeatspaceStore(state => state.pendingProgram);
  const chipStorage = useMeatspaceStore(state => state.chipStorage);
  const copyProgramToChip = useMeatspaceStore(state => state.copyProgramToChip);
  const pirateProgram = useMeatspaceStore(state => state.pirateProgram);
  const removeChipFromStorage = useMeatspaceStore(state => state.removeChipFromStorage);
  const installChip = useMeatspaceStore(state => state.installChip);
  const deductFunds = useMeatspaceStore(state => state.deductFunds) ?? (() => {});
  const compilationSuccess = useMeatspaceStore(state => state.compilationSuccess) ?? null;
  const programs = useCyberdeckStore(state => state.programs) ?? [];
  const removeProgram = useCyberdeckStore(state => state.removeProgram) ?? (() => {});
  const startProgramming = useMeatspaceStore(state => state.startProgramming) ?? (() => {});
  const cancelProgramming = useMeatspaceStore(state => state.cancelProgramming) ?? (() => {});
  const completeProgramming = useMeatspaceStore(state => state.completeProgramming) ?? (() => {});
  const clearCompletedProgram = useMeatspaceStore(state => state.clearCompletedProgram) ?? (() => {});
  const completedProgram = useMeatspaceStore(state => state.completedProgram) ?? null;
  const chipInstallResult = useMeatspaceStore(state => state.chipInstallResult) ?? null;
  const clearChipInstallResult = useMeatspaceStore(state => state.clearChipInstallResult) ?? (() => {});
  const setCompilationSuccess = useMeatspaceStore(state => state.setCompilationSuccess) ?? (() => {});
  const addLog = useTerminalStore(state => state.addLog) ?? (() => {});
  const rollSkillCheck = useMeatspaceStore(state => state.rollSkillCheck) ?? (() => 0);
  const calculateCompilationCost = useMeatspaceStore(state => state.calculateCompilationCost) ?? (() => 0);
  const calculateCompilationTime = useMeatspaceStore(state => state.calculateCompilationTime) ?? (() => 1);
  const getProgramMuCost = useCyberdeckStore(state => state.getProgramMuCost) ?? (() => 1);
  const addProgram = useCyberdeckStore(state => state.addProgram) ?? (() => {});
  const installChipFromStore = useMeatspaceStore(state => state.installChip) ?? (() => {});

  // Handle completed programs from compilation
  useEffect(() => {
    if (completedProgram && addProgram && addLog && clearCompletedProgram) {
      try {
        addProgram(completedProgram);
        addLog(`> COMPILATION COMPLETE: ${completedProgram.name.toUpperCase()} ADDED TO DECK.`);
        clearCompletedProgram();
      } catch (e) {
        console.error('Error adding completed program:', e);
      }
    }
  }, [completedProgram, addProgram, addLog, clearCompletedProgram]);

  // Handle chip installation results
  useEffect(() => {
    if (chipInstallResult && addProgram && addLog && clearChipInstallResult) {
      try {
        addProgram(chipInstallResult);
        addLog(`> CHIP INSTALLED: ${chipInstallResult.name.toUpperCase()}.`);
        clearChipInstallResult();
      } catch (e) {
        console.error('Error installing chip:', e);
      }
    }
  }, [chipInstallResult, addProgram, addLog, clearChipInstallResult]);

  const getProgramStats = (template) => {
    let adjustedDifficulty = template.difficulty;
    let adjustedMu = getProgramMuCost(adjustedDifficulty);
    
    if (codeOptimization && selectedProgram?.id === template.id) {
      adjustedDifficulty += 10;
      adjustedMu = Math.ceil(adjustedMu / 2);
    }
    
    const cost = calculateCompilationCost(adjustedDifficulty, template.type);
    const days = calculateCompilationTime(adjustedDifficulty);
    
    return { difficulty: adjustedDifficulty, muCost: adjustedMu, cost, days };
  };

  const getDemonStats = (demonTemplate) => {
    let subprogramDiff = 0;
    linkedPrograms.forEach(progId => {
      const prog = PROGRAM_TEMPLATES.find(p => p.id === progId);
      if (prog) subprogramDiff += prog.difficulty;
    });
    
    let linkedMu = 0;
    linkedPrograms.forEach(progId => {
      const prog = PROGRAM_TEMPLATES.find(p => p.id === progId);
      if (prog) linkedMu += getProgramMuCost(prog.difficulty);
    });
    
    const subprogramDifficulty = Math.floor(subprogramDiff / 2);
    const optionsDifficulty = selectedDaemonOptions.reduce((sum, opt) => {
      const optData = DAEMON_OPTIONS.find(o => o.id === opt);
      return sum + (optData?.difficulty || 0);
    }, 0);
    
    let totalDifficulty = demonTemplate.baseDifficulty + subprogramDifficulty + optionsDifficulty;
    let totalStrength = demonTemplate.baseStrength - linkedPrograms.length;
    
    if (codeOptimization) {
      totalDifficulty += 10;
      linkedMu = Math.ceil(linkedMu / 2);
    }
    
    const muCost = isIndependentDaemon 
      ? linkedMu + 2 
      : Math.max(1, Math.floor(linkedMu / 2));
    
    const cost = calculateCompilationCost(totalDifficulty, 'daemon');
    const days = calculateCompilationTime(totalDifficulty);
    
    return { 
      difficulty: totalDifficulty, 
      muCost, 
      cost, 
      days,
      totalStrength,
      subprogramDifficulty,
      optionsDifficulty
    };
  };

  const toggleLinkedProgram = (progId) => {
    if (linkedPrograms.includes(progId)) {
      setLinkedPrograms(linkedPrograms.filter(id => id !== progId));
    } else {
      setLinkedPrograms([...linkedPrograms, progId]);
    }
  };

  const toggleDaemonOption = (optId) => {
    if (selectedDaemonOptions.includes(optId)) {
      setSelectedDaemonOptions(selectedDaemonOptions.filter(id => id !== optId));
    } else {
      setSelectedDaemonOptions([...selectedDaemonOptions, optId]);
    }
  };

  const calculateSuccessChance = (difficulty) => {
    const minRoll = int + programming + interfaceBonus + 1;
    const maxRoll = int + programming + interfaceBonus + 10;
    const avgRoll = int + programming + interfaceBonus + 5.5;
    
    if (minRoll >= difficulty) return '100%';
    if (maxRoll < difficulty) return '0%';
    
    const successRange = maxRoll - minRoll + 1;
    const failCount = Math.max(0, difficulty - minRoll);
    const successCount = successRange - failCount;
    const percentage = Math.round((successCount / successRange) * 100);
    return `${percentage}%`;
  };

  const getSuccessColor = (difficulty) => {
    const total = int + programming + interfaceBonus + 5.5;
    if (total >= difficulty + 5) return 'text-neon-green';
    if (total >= difficulty - 3) return 'text-yellow-400';
    return 'text-red-400';
  };

  const handleStartCompile = () => {
    if (!selectedProgram) return;

    const stats = getProgramStats(selectedProgram);

    const existing = programs.find(p => p.id === `custom_${selectedProgram.id}`);
    if (existing) {
      sfx.error();
      addLog("> ERROR: PROGRAM ALREADY IN MEMORY.");
      return;
    }

    if (funds < stats.cost) {
      sfx.error();
      addLog("> ERROR: INSUFFICIENT FUNDS.");
      return;
    }

    sfx.click();
    deductFunds(stats.cost);
    
    const newProgram = {
      id: `custom_${selectedProgram.id}_${Date.now()}`,
      name: selectedProgram.name,
      type: selectedProgram.type,
      strength: selectedProgram.strength,
      difficulty: stats.difficulty,
      muCost: stats.muCost,
      marketValue: stats.cost,
      isCustom: true,
      compiledAt: Date.now()
    };
    
    startProgramming(newProgram, stats.days);
    addLog(`> COMPILATION STARTED: ${selectedProgram.name.toUpperCase()}.`);
    addLog(`> DIFFICULTY: ${stats.difficulty} | MU: ${stats.muCost} | COST: ${stats.cost} eb | TIME: ${stats.days} DAYS.`);
    addLog(`> SKILL CHECK: INT(${int}) + Programming(${programming}) + Interface(${interfaceBonus}) + D10 >= ${stats.difficulty}`);
  };

  const handleStartDemonCompile = () => {
    if (!selectedDemon || linkedPrograms.length === 0) return;

    const stats = getDemonStats(selectedDemon);

    if (funds < stats.cost) {
      sfx.error();
      addLog("> ERROR: INSUFFICIENT FUNDS.");
      return;
    }

    sfx.click();
    deductFunds(stats.cost);

    const linkedProgramNames = linkedPrograms.map(id => {
      const prog = PROGRAM_TEMPLATES.find(p => p.id === id);
      return prog?.name || id;
    });

    const newDemon = {
      id: `custom_demon_${selectedDemon.id}_${Date.now()}`,
      name: `${selectedDemon.name} [${linkedProgramNames.join(', ')}]`,
      type: 'daemon',
      isDemon: true,
      isIndependent: isIndependentDaemon,
      strength: stats.totalStrength,
      difficulty: stats.difficulty,
      muCost: stats.muCost,
      marketValue: stats.cost,
      isCustom: true,
      compiledAt: Date.now(),
      linkedPrograms: [...linkedPrograms],
      linkedOptions: [...selectedDaemonOptions]
    };

    startProgramming(newDemon, stats.days);
    addLog(`> DEMON COMPILATION STARTED: ${selectedDemon.name.toUpperCase()}.`);
    addLog(`> LINKED: ${linkedProgramNames.join(', ')}`);
    addLog(`> DIFFICULTY: ${stats.difficulty} (Base ${selectedDemon.baseDifficulty} + Subprogs ${stats.subprogramDifficulty} + Options ${stats.optionsDifficulty})`);
    addLog(`> FINAL STRENGTH: ${stats.totalStrength} (Base ${selectedDemon.baseStrength} - ${linkedPrograms.length} linked)`);
    addLog(`> MU: ${stats.muCost} | COST: ${stats.cost} eb | TIME: ${stats.days} DAYS.`);
  };

  const handleFinishDay = () => {
    if (!isProgramming) return;

    if (programmingDays <= 1) {
      const result = rollSkillCheck(pendingProgram.difficulty);
      setCompilationSuccess(result.success);
      if (result.success) {
        sfx.loot();
        addLog(`> SKILL CHECK: ${result.total} (${result.roll} + ${int} + ${programming} + ${interfaceBonus}) >= ${result.difficulty} - SUCCESS`);
      } else {
        sfx.error();
        addLog(`> SKILL CHECK: ${result.total} (${result.roll} + ${int} + ${programming} + ${interfaceBonus}) < ${result.difficulty} - FAILURE`);
      }
      completeProgramming();
    } else {
      useMeatspaceStore.setState({ programmingDays: programmingDays - 1 });
      addLog(`> COMPILATION IN PROGRESS... ${programmingDays - 1} DAYS REMAINING.`);
    }
  };

  const handleCancel = () => {
    if (isProgramming) {
      sfx.error();
      cancelProgramming();
      addLog("> COMPILATION CANCELLED.");
    }
    setSelectedProgram(null);
    setSelectedDemon(null);
    setLinkedPrograms([]);
    setSelectedDaemonOptions([]);
    setIsIndependentDaemon(false);
    setCodeOptimization(false);
  };

  // Progress calculation for compilation
  const compilationTotalDays = pendingProgram?.days || 1;
  const compilationProgress = ((compilationTotalDays - programmingDays) / compilationTotalDays) * 100;

  return (
    <div className="bg-black border-2 border-neon-green p-4 shadow-[0_0_30px_#00ffcc40] max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold tracking-widest text-neon-green">CUSTOM PROGRAMMING</h3>
        <button onClick={onClose} className="text-neon-green hover:text-black hover:bg-neon-green px-2 py-1 border border-neon-green transition-colors text-sm">
          [ CLOSE ]
        </button>
      </div>

      {/* TABS */}
      <div className="flex gap-2 mb-4 border-b border-neon-green/30 pb-2">
        <button
          onClick={() => { setActiveTab('programs'); setSelectedDemon(null); setLinkedPrograms([]); setSelectedDaemonOptions([]); }}
          className={`px-3 py-1 text-xs font-bold border transition-colors ${activeTab === 'programs' ? 'bg-neon-green text-black border-neon-green' : 'border-neon-green/50 text-neon-green hover:bg-neon-green/20'}`}
        >
          [ PROGRAMS ]
        </button>
        <button
          onClick={() => { setActiveTab('demons'); setSelectedProgram(null); }}
          className={`px-3 py-1 text-xs font-bold border transition-colors ${activeTab === 'demons' ? 'bg-neon-green text-black border-neon-green' : 'border-neon-green/50 text-neon-green hover:bg-neon-green/20'}`}
        >
          [ DEMONS ]
        </button>
        <button
          onClick={() => { setActiveTab('chips'); setSelectedProgram(null); setSelectedDemon(null); }}
          className={`px-3 py-1 text-xs font-bold border transition-colors ${activeTab === 'chips' ? 'bg-neon-green text-black border-neon-green' : 'border-neon-green/50 text-neon-green hover:bg-neon-green/20'}`}
        >
          [ DATA CHIPS ]
        </button>
      </div>

      {isProgramming ? (
        <div className="text-center py-8">
          <div className="text-2xl font-bold text-neon-green mb-4 animate-pulse">
            COMPILING: {pendingProgram?.name?.toUpperCase()}
          </div>
          <div className="text-sm text-gray-400 mb-2">
            DAYS REMAINING: {programmingDays}
          </div>
          <div className="text-xs text-gray-500 mb-4">
            DIFFICULTY: {pendingProgram?.difficulty} | MU COST: {pendingProgram?.muCost}
          </div>
          <div className="w-full bg-gray-900 h-4 mb-4 border border-neon-green/30">
            <div
              className="bg-neon-green h-full transition-all duration-500"
              style={{ width: `${compilationProgress}%` }}
            />
          </div>
          <div className="flex gap-2 justify-center">
            <button
              onClick={handleFinishDay}
              className="bg-neon-green text-black px-4 py-2 font-bold hover:bg-green-400 transition-colors text-sm"
            >
              [ PASS DAY / COMPLETE ]
            </button>
            <button
              onClick={handleCancel}
              className="bg-black border border-red-500 text-red-500 px-4 py-2 font-bold hover:bg-red-500 hover:text-black transition-colors text-sm"
            >
              [ CANCEL ]
            </button>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            INT({int}) + Programming({programming}) + Interface({interfaceBonus}) + D10 vs Difficulty({pendingProgram?.difficulty})
          </div>
        </div>
      ) : (
        <>
          <div className="text-xs text-gray-400 mb-3 flex justify-between">
            <span>INT: {int} | Programming: {programming} | Interface: {interfaceBonus >= 0 ? `+${interfaceBonus}` : interfaceBonus}</span>
            <span>Funds: {funds} eb</span>
          </div>

          <div className="flex-1 overflow-y-auto mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PROGRAM_TEMPLATES.map(template => {
                const stats = getProgramStats(template);
                const isSelected = selectedProgram?.id === template.id;
                const isOwned = programs.some(p => p.name === template.name);
                const successChance = calculateSuccessChance(stats.difficulty);

                return (
                  <button
                    key={template.id}
                    onClick={() => {
                      if (!isOwned) {
                        setSelectedProgram(template);
                        setCodeOptimization(false);
                        sfx.click();
                      }
                    }}
                    disabled={isOwned}
                    className={`text-left p-2 border transition-colors text-xs ${isOwned ? 'opacity-40 cursor-not-allowed' : ''} ${
                      isSelected
                        ? 'bg-neon-green/20 border-neon-green'
                        : TYPE_COLORS[template.type] || 'border-neon-green/30 hover:bg-neon-green/10'
                    }`}
                  >
                    <div className="font-bold text-neon-green">{template.name} {isOwned && '[OWNED]'}</div>
                    <div className="text-gray-400">
                      {template.type} | STR: {template.strength || 'N/A'} | Diff: {stats.difficulty} | MU: {stats.muCost}
                    </div>
                    <div className="text-gray-500">
                      Cost: {stats.cost} eb | Time: {stats.days} days | Success: <span className={getSuccessColor(stats.difficulty)}>{successChance}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedProgram && (
            <div className="border-t border-neon-green/30 pt-4 mt-2">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-bold text-neon-green text-sm">{selectedProgram.name}</div>
                  <div className="text-xs text-gray-400">
                    {selectedProgram.type} | Function: {selectedProgram.function}
                  </div>
                </div>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={codeOptimization}
                    onChange={(e) => setCodeOptimization(e.target.checked)}
                    className="accent-neon-green"
                  />
                  <span className="text-gray-400">Code Optimization (-50% MU, +10 Diff)</span>
                </label>
              </div>

              {(() => {
                const stats = getProgramStats(selectedProgram);
                const successChance = calculateSuccessChance(stats.difficulty);
                return (
                  <div className="bg-gray-900/50 p-3 mb-3 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Difficulty:</span>
                      <span className="text-neon-green">{stats.difficulty}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Memory Units:</span>
                      <span className="text-neon-green">{stats.muCost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Compilation Cost:</span>
                      <span className="text-yellow-400">{stats.cost} eb</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Time Required:</span>
                      <span className="text-neon-green">{stats.days} days ({stats.difficulty * 6} hours)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Success Chance:</span>
                      <span className={getSuccessColor(stats.difficulty)}>{successChance}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Skill Check:</span>
                      <span className="text-gray-300">{`INT(${int}) + Programming(${programming}) + Interface(${interfaceBonus}) + D10 >= ${stats.difficulty}`}</span>
                    </div>
                  </div>
                );
              })()}

              <div className="flex gap-2 justify-center">
                <button
                  onClick={handleStartCompile}
                  disabled={funds < getProgramStats(selectedProgram).cost}
                  className="bg-neon-green text-black px-4 py-2 font-bold hover:bg-green-400 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  [ START COMPILATION ]
                </button>
                <button
                  onClick={() => { setSelectedProgram(null); setCodeOptimization(false); }}
                  className="bg-black border border-red-500 text-red-500 px-4 py-2 font-bold hover:bg-red-500 hover:text-black transition-colors text-sm"
                >
                  [ CLEAR ]
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* DEMONS TAB */}
      {activeTab === 'demons' && !isProgramming && (
        <div className="flex-1 overflow-y-auto mb-4">
          <div className="text-xs text-gray-400 mb-3">
            Demons compile multiple programs together. Linked programs take half MU, but Demon STR decreases by 1 per linked program.
          </div>

          {/* Select Demon Base */}
          <div className="mb-4">
            <div className="text-xs font-bold text-cyan-400 mb-2">SELECT DEMON FRAMEWORK:</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
              {DEMON_TEMPLATES.map(demon => (
                <button
                  key={demon.id}
                  onClick={() => { setSelectedDemon(demon); setLinkedPrograms([]); setSelectedDaemonOptions([]); }}
                  className={`text-left p-2 border text-xs transition-colors ${
                    selectedDemon?.id === demon.id 
                      ? 'bg-cyan-900/30 border-cyan-500' 
                      : 'border-cyan-500/30 hover:bg-cyan-900/10'
                  }`}
                >
                  <div className="font-bold text-cyan-300">{demon.name}</div>
                  <div className="text-gray-400">Base Diff: {demon.baseDifficulty} | Base STR: {demon.baseStrength}</div>
                  <div className="text-gray-500">{demon.description}</div>
                </button>
              ))}
            </div>

            {/* Independent Daemon Toggle */}
            <label className="flex items-center gap-2 text-xs cursor-pointer mb-4">
              <input
                type="checkbox"
                checked={isIndependentDaemon}
                onChange={(e) => { setIsIndependentDaemon(e.target.checked); setSelectedDaemonOptions([]); }}
                className="accent-cyan-400"
              />
              <span className="text-cyan-400">Independent Daemon (Requires Recognition, Movement, Pseudointellect)</span>
            </label>
          </div>

          {/* Link Programs */}
          {selectedDemon && (
            <div className="mb-4">
              <div className="text-xs font-bold text-cyan-400 mb-2">LINK PROGRAMS ({linkedPrograms.length} linked):</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 mb-3 max-h-32 overflow-y-auto">
                {PROGRAM_TEMPLATES.map(prog => {
                  const isLinked = linkedPrograms.includes(prog.id);
                  return (
                    <button
                      key={prog.id}
                      onClick={() => toggleLinkedProgram(prog.id)}
                      className={`text-left p-1 border text-[10px] transition-colors ${
                        isLinked ? 'bg-cyan-900/50 border-cyan-400 text-cyan-300' : 'border-cyan-500/30 text-gray-400'
                      }`}
                    >
                      {isLinked ? '●' : '○'} {prog.name} (Diff: {prog.difficulty})
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Daemon Options */}
          {selectedDemon && isIndependentDaemon && (
            <div className="mb-4">
              <div className="text-xs font-bold text-cyan-400 mb-2">DAEMON OPTIONS:</div>
              <div className="grid grid-cols-2 gap-1 mb-2">
                {DAEMON_OPTIONS.map(opt => {
                  const isSelected = selectedDaemonOptions.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      onClick={() => toggleDaemonOption(opt.id)}
                      className={`text-left p-1 border text-[10px] transition-colors ${
                        isSelected ? 'bg-cyan-900/50 border-cyan-400 text-cyan-300' : 'border-cyan-500/30 text-gray-400'
                      }`}
                    >
                      {isSelected ? '●' : '○'} {opt.name} (+{opt.difficulty}) - {opt.description}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Demon Stats */}
          {selectedDemon && linkedPrograms.length > 0 && (() => {
            const stats = getDemonStats(selectedDemon);
            const successChance = calculateSuccessChance(stats.difficulty);
            return (
              <div className="border-t border-cyan-500/30 pt-4">
                <div className="bg-gray-900/50 p-3 mb-3 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Difficulty:</span>
                    <span className="text-cyan-400">{stats.difficulty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Final Strength:</span>
                    <span className="text-cyan-400">{stats.totalStrength}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Memory Units:</span>
                    <span className="text-cyan-400">{stats.muCost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Compilation Cost:</span>
                    <span className="text-yellow-400">{stats.cost} eb</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Time Required:</span>
                    <span className="text-cyan-400">{stats.days} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Success Chance:</span>
                    <span className={getSuccessColor(stats.difficulty)}>{successChance}</span>
                  </div>
                </div>

                <div className="flex gap-2 justify-center">
                  <button
                    onClick={handleStartDemonCompile}
                    disabled={funds < stats.cost}
                    className="bg-cyan-600 text-black px-4 py-2 font-bold hover:bg-cyan-500 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    [ COMPILE DEMON ]
                  </button>
                  <button
                    onClick={() => { setSelectedDemon(null); setLinkedPrograms([]); setSelectedDaemonOptions([]); setIsIndependentDaemon(false); }}
                    className="bg-black border border-red-500 text-red-500 px-4 py-2 font-bold hover:bg-red-500 hover:text-black transition-colors text-sm"
                  >
                    [ CLEAR ]
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* DATA CHIPS TAB */}
      {activeTab === 'chips' && !isProgramming && (
        <div className="flex-1 overflow-y-auto mb-4">
          <div className="text-xs text-gray-400 mb-3">
            Store programs on data chips (1 MU per chip). Copy costs 10 eb. Protected programs (Anti-ICE, Anti-System) require Task Diff 28 to pirate.
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* Copy to Chip */}
            <div className="border border-neon-green/30 p-3">
              <div className="text-xs font-bold text-neon-green mb-2">COPY PROGRAM TO CHIP (10 eb):</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                {programs.map(prog => {
                  const isProtected = prog.type === 'anti-ice' || prog.type === 'anti-system';
                  return (
                    <button
                      key={prog.id}
                      onClick={() => {
                        if (funds >= 10) {
                          copyProgramToChip(prog, 10);
                          deductFunds(10);
                          sfx.loot();
                          addLog(`> PROGRAM COPIED TO CHIP: ${prog.name.toUpperCase()}.`);
                        } else {
                          sfx.error();
                          addLog("> ERROR: INSUFFICIENT FUNDS FOR COPY.");
                        }
                      }}
                      disabled={funds < 10}
                      className="text-left p-2 border text-xs border-neon-green/30 hover:bg-neon-green/10 disabled:opacity-50"
                    >
                      <div className="text-neon-green">{prog.name}</div>
                      <div className="text-gray-500">{isProtected ? '[PROTECTED]' : `[${prog.muCost || 1} MU]`}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chip Storage */}
            <div className="border border-yellow-500/30 p-3">
              <div className="text-xs font-bold text-yellow-400 mb-2">CHIP STORAGE ({chipStorage.length} chips):</div>
              {chipStorage.length === 0 ? (
                <div className="text-xs text-gray-500 py-2">No chips in storage.</div>
              ) : (
                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                  {chipStorage.map(chip => {
                    const isProtected = chip.type === 'anti-ice' || chip.type === 'anti-system';
                    const isPirated = chip.isPirated;
                    return (
                      <div key={chip.chipId} className="flex justify-between items-center p-2 border border-yellow-500/30 bg-yellow-900/10">
                        <div className="text-left">
                          <div className="text-yellow-300 text-xs font-bold">{chip.name}</div>
                          <div className="text-gray-500 text-[10px]">
                            {isProtected ? 'PROTECTED' : `${chip.muCost || 1} MU`} {isPirated ? '[PIrated]' : ''}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {isProtected && !isPirated && (
                            <button
                              onClick={() => {
                                const result = pirateProgram(chip);
                                if (result.success) {
                                  sfx.loot();
                                  addLog(`> PIRACY SUCCESS: ${chip.name.toUpperCase()}. (${result.roll} >= ${result.difficulty})`);
                                } else {
                                  sfx.error();
                                  addLog(`> PIRACY FAILED: ${chip.name.toUpperCase()}. (${result.roll} < ${result.difficulty}) - CHIP DESTROYED.`);
                                  removeChipFromStorage(chip.chipId);
                                }
                              }}
                              className="text-[10px] px-2 py-1 border border-red-500 text-red-400 hover:bg-red-500 hover:text-black"
                            >
                              [PIRate]
                            </button>
                          )}
                          <button
                            onClick={() => {
                              const chipMu = chip.muCost || 1;
                              const usedMu = useCyberdeckStore.getState().usedMu;
                              const maxMu = useCyberdeckStore.getState().maxMu;
                              
                              if (usedMu + chipMu > maxMu) {
                                sfx.error();
                                addLog("> ERROR: INSUFFICIENT DECK MEMORY.");
                                return;
                              }
                              
                              installChipFromStore(chip.chipId);
                              sfx.click();
                            }}
                            className="text-[10px] px-2 py-1 border border-neon-green text-neon-green hover:bg-neon-green hover:text-black"
                          >
                            [INSTALL]
                          </button>
                          <button
                            onClick={() => {
                              removeChipFromStorage(chip.chipId);
                              sfx.click();
                              addLog(`> CHIP DISCARDED: ${chip.name.toUpperCase()}.`);
                            }}
                            className="text-[10px] px-2 py-1 border border-red-500 text-red-500 hover:bg-red-500 hover:text-black"
                          >
                            [X]
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}