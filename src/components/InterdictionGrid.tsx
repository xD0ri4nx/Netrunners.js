import { useState, useEffect, useRef } from 'react';
import { useCyberdeckStore } from '../store/cyberdeckStore';
import { useMeatspaceStore } from '../store/meatspaceStore';
import { useTerminalStore } from '../store/terminalStore';
import { useRoutingStore } from '../store/routingStore';
import { sfx } from '../utils/sfx';

const GRID_SIZE = 8;

const rollD10 = (): number => Math.floor(Math.random() * 10) + 1;
const rollLoot = (): number => Math.floor(Math.random() * 500) + 500;

export function InterdictionGrid({ onWin, onEscape, onTimeout }: { onWin: () => void; onEscape: () => void; onTimeout: () => void }) {
  const [playerPos, setPlayerPos] = useState<{ x: number; y: number }>({ x: 4, y: 4 });
  const [enemyPos, setEnemyPos] = useState<{ x: number; y: number }>({ x: 4, y: 1 });
  const [turnCount, setTurnCount] = useState(0);
  const [maxTurns] = useState(5);
  const [combatLog, setCombatLog] = useState<string[]>(['> GRIDSEC INTERDICTION DETECTED!', '> ELITE OPERATIVE ENGAGED. SURVIVE 5 TURNS OR FLATLINE.']);
  const [playerHP, setPlayerHP] = useState(8);
  const [enemyHP, setEnemyHP] = useState(10);
  const [turnSpent, setTurnSpent] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  const { activeAction, activePassives } = useCyberdeckStore.getState();
  const { int, interfaceLvl, interfaceType } = useMeatspaceStore.getState();
  const addLog = useTerminalStore.getState().addLog;
  
  const interfaceBonus = interfaceType === 'interfacePlugs' ? 1 : interfaceType === 'trodes' ? -1 : 0;
  const stealthProg = activePassives.find(p => p.type === 'stealth');

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [combatLog]);

  const addCombatLog = (msg: string): void => {
    setCombatLog(prev => [...prev, msg]);
    addLog(msg);
  };

  const getDistance = (p1: { x: number; y: number }, p2: { x: number; y: number }): number => Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);

  const isAdjacent = (): boolean => getDistance(playerPos, enemyPos) === 1;

  const handlePlayerMove = (dx: number, dy: number): void => {
    if (turnSpent) return;
    
    const newX = Math.max(0, Math.min(GRID_SIZE - 1, playerPos.x + dx));
    const newY = Math.max(0, Math.min(GRID_SIZE - 1, playerPos.y + dy));
    
    if (newX === enemyPos.x && newY === enemyPos.y) {
      sfx.click();
      handleCombat();
      return;
    }
    
    setPlayerPos({ x: newX, y: newY });
    setTurnSpent(true);
    setTurnCount(prev => prev + 1);
    
    if (turnCount >= maxTurns) {
      setTimeout(handleTimeout, 1000);
    } else {
      setTimeout(enemyTurn, 300);
    }
  };

  const handleCombat = (): void => {
    if (!activeAction) {
      sfx.error();
      addCombatLog('> ERROR: NO COMBAT PROGRAM EQUIPPED!');
      setTurnSpent(true);
      setTimeout(enemyTurn, 500);
      return;
    }

    const playerRoll = rollD10();
    const enemyRoll = rollD10();
    const enemySTR = 6;
    
    const progStr = activeAction.strength || 4;
    const attackTotal = playerRoll + int + interfaceLvl + progStr + interfaceBonus;
    const enemyDefense = enemyRoll + enemySTR;

    addCombatLog(`> COMBAT: D10(${playerRoll}) + INT(${int}) + INTF(${interfaceLvl}) + PROG(${progStr}) + IFACE(${interfaceBonus}) = ${attackTotal}`);
    addCombatLog(`> ENEMY DEFENSE: D10(${enemyRoll}) + STR(${enemySTR}) = ${enemyDefense}`);

    if (attackTotal > enemyDefense) {
      sfx.attack();
      const damage = Math.max(1, Math.floor((attackTotal - enemyDefense) / 2));
      const newEnemyHP = enemyHP - damage;
      setEnemyHP(newEnemyHP);
      addCombatLog(`> STRIKE! GRIDSEC OPERATIVE TAKES ${damage} DAMAGE. (HP: ${newEnemyHP}/10)`);
      
      if (newEnemyHP <= 0) {
        sfx.loot();
        const loot = rollLoot();
        useMeatspaceStore.getState().addFunds(loot);
        useRoutingStore.getState().addTraceDefense(20);
        const currentLdl = useRoutingStore.getState().currentLdl;
        if (currentLdl) {
          useRoutingStore.getState().removePatrolAtLdl(currentLdl);
        }
        addCombatLog(`> TARGET NEUTRALIZED. LOOT: ${loot} cr. TRACE DEFENSE +20.`);
        setTimeout(onWin, 1500);
        return;
      }
    } else {
      sfx.error();
      addCombatLog('> ATTACK BLOCKED BY GRIDSEC DEFENSES.');
    }

    setTurnSpent(true);
    setTimeout(enemyTurn, 500);
  };

  const enemyTurn = (): void => {
    const dist = getDistance(playerPos, enemyPos);
    
    if (dist === 1) {
      const enemyRoll = rollD10();
      const playerRoll = rollD10();
      const enemySTR = 6;
      const attackTotal = enemyRoll + enemySTR;
      const defenseTotal = playerRoll + int + interfaceLvl + interfaceBonus;

      addCombatLog(`> GRIDSEC COUNTER-ATTACK! D10(${enemyRoll}) + STR(${enemySTR}) = ${attackTotal}`);
      addCombatLog(`> DEFENSE: D10(${playerRoll}) + INT(${int}) + INTF(${interfaceLvl}) + IFACE(${interfaceBonus}) = ${defenseTotal}`);

      if (attackTotal > defenseTotal) {
        sfx.damage();
        const damage = Math.max(1, Math.floor((attackTotal - defenseTotal) / 2));
        const newPlayerHP = playerHP - damage;
        setPlayerHP(newPlayerHP);
        addCombatLog(`> HIT! SUFFERED ${damage} NEURAL DAMAGE. (HP: ${newPlayerHP}/8)`);
        
        if (newPlayerHP <= 0) {
          sfx.flatline();
          addCombatLog('> CRITICAL SYSTEM FAILURE. DECK DUMPED.');
          setTimeout(() => {
            useMeatspaceStore.getState().takeNeuralDamage(5);
            onEscape();
          }, 1500);
          return;
        }
      } else {
        addCombatLog('> GRIDSEC ATTACK DEFLECTED.');
      }
    } else {
      const dx = Math.sign(playerPos.x - enemyPos.x);
      const dy = Math.sign(playerPos.y - enemyPos.y);
      
      if (Math.abs(playerPos.x - enemyPos.x) > Math.abs(playerPos.y - enemyPos.y)) {
        setEnemyPos(prev => ({ ...prev, x: prev.x + dx }));
      } else {
        setEnemyPos(prev => ({ ...prev, y: prev.y + dy }));
      }
      addCombatLog('> GRIDSEC OPERATIVE CLOSING DISTANCE...');
    }

    setTurnSpent(false);
  };

  const handleEscape = (): void => {
    const roll = rollD10();
    const stealthBonus = stealthProg ? stealthProg.strength || 2 : 0;
    const escapeTotal = roll + int + stealthBonus;

    addCombatLog(`> ESCAPE ATTEMPT: D10(${roll}) + INT(${int}) + STEALTH(${stealthBonus}) = ${escapeTotal} vs DC: 14`);

    if (escapeTotal >= 14) {
      sfx.click();
      addCombatLog('> EMERGENCY DISCONNECT SUCCESSFUL! SIGNAL TRACED.');
      useRoutingStore.getState().addTraceRisk(3);
      setTimeout(onEscape, 1000);
    } else {
      sfx.error();
      addCombatLog('> DISCONNECT FAILED! GRIDSEC INTERCEPTION ACTIVE.');
      setTurnSpent(true);
      setTimeout(enemyTurn, 500);
    }
  };

  const handleTimeout = (): void => {
    sfx.loot();
    addCombatLog('> TRACE DILUTED! TIME WINDOW EXPIRED. SURVIVED INTERDICTION.');
    useRoutingStore.getState().addTraceDefense(10);
    setTimeout(onTimeout, 1000);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl bg-black/95 border-2 border-red-500 p-4 shadow-[0_0_30px_#ff003340] z-50">
      <div className="flex justify-between items-center w-full border-b border-red-500/50 pb-2 mb-4">
        <h2 className="text-xl font-bold tracking-widest text-red-500 animate-pulse">GRIDSEC INTERDICTION</h2>
        <div className="flex gap-4 text-xs font-bold font-mono">
          <span className="text-neon-green">RUNNER HP: {playerHP}/8</span>
          <span className="text-red-400">OPERATIVE HP: {enemyHP}/10</span>
          <span className="text-yellow-400">TURNS: {turnCount}/{maxTurns}</span>
        </div>
      </div>

      <div className="grid grid-cols-8 gap-1 bg-black/60 p-2 border border-red-500/30 mb-4 select-none">
        {Array.from({ length: GRID_SIZE }).map((_, y) => (
          Array.from({ length: GRID_SIZE }).map((_, x) => {
            const isPlayer = playerPos.x === x && playerPos.y === y;
            const isEnemy = enemyPos.x === x && enemyPos.y === y;
            const inRange = getDistance({ x, y }, playerPos) === 1;

            return (
              <div
                key={`${x}-${y}`}
                onClick={() => inRange && !turnSpent ? handlePlayerMove(x - playerPos.x, y - playerPos.y) : null}
                className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center font-mono font-bold text-sm border transition-colors
                  ${isPlayer ? 'bg-green-600 text-black border-neon-green shadow-[0_0_10px_#00ffcc]' : ''}
                  ${isEnemy ? 'bg-red-600 text-black border-red-500 shadow-[0_0_10px_#ff0033]' : ''}
                  ${!isPlayer && !isEnemy && inRange ? 'bg-red-900/30 border-red-500/50 hover:bg-red-900/50 cursor-pointer' : 'bg-gray-900/40 border-gray-800'}
                `}
              >
                {isPlayer ? '@' : isEnemy ? 'N' : inRange ? '!' : '.'}
              </div>
            );
          })
        ))}
      </div>

      <div className="w-full flex gap-2 mb-4">
        <button
          onClick={handleCombat}
          disabled={turnSpent || !isAdjacent()}
          className="flex-1 bg-red-950 border border-red-500 text-red-400 py-2 font-mono font-bold hover:bg-red-900 hover:text-white transition-colors disabled:opacity-40 cursor-pointer"
        >
          [ EXECUTE OFFENSIVE ICE ]
        </button>
        <button
          onClick={handleEscape}
          disabled={turnSpent}
          className="flex-1 bg-yellow-950 border border-yellow-500 text-yellow-400 py-2 font-mono font-bold hover:bg-yellow-900 hover:text-black transition-colors disabled:opacity-40 cursor-pointer"
        >
          [ EMERGENCY SLIP (DC: 14) ]
        </button>
      </div>

      <div className="w-full h-32 bg-black/80 border border-red-500/30 p-2 overflow-y-auto font-mono text-xs text-red-400 space-y-1">
        {combatLog.map((log, idx) => (
          <div key={idx} className="opacity-90">{log}</div>
        ))}
        <div ref={logEndRef} />
      </div>
    </div>
  );
}
