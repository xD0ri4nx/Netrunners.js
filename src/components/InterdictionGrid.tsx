import { useState, useEffect, useRef } from 'react';
import { useCyberdeckStore } from '../store/cyberdeckStore';
import { useMeatspaceStore } from '../store/meatspaceStore';
import { useTerminalStore } from '../store/terminalStore';
import { useRoutingStore } from '../store/routingStore';
import { sfx } from '../utils/sfx';

const GRID_SIZE = 8;

const rollD10 = (): number => rollD10();
const rollLoot = (): number => rollLoot();

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
        addCombatLog(`> TARGET NEUTRALIZED. LOOT: ${loot} CR. TRACE DEFENSE +20.`);
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
    if (enemyHP <= 0) return;

    const dist = getDistance(enemyPos, playerPos);
    
    if (stealthProg && dist > 1) {
      const playerRoll = rollD10();
      const enemyRoll = rollD10();
      const evasion = playerRoll + int + interfaceLvl + stealthProg.strength + interfaceBonus;
      const detection = enemyRoll + 5;
      
      addCombatLog(`> INVISIBILITY: EVASION(${evasion}) vs DETECTION(${detection})`);
      
      if (evasion > detection) {
        addCombatLog('> STEALTH PREVENTS DETECTION. OPERATIVE PATROLS.');
      } else {
        enemyAttack();
      }
    } else {
      enemyAttack();
    }
  };

  const enemyAttack = (): void => {
    const dist = getDistance(enemyPos, playerPos);
    
    if (dist > 1) {
      const newX = playerPos.x > enemyPos.x ? enemyPos.x + 1 : enemyPos.x - 1;
      const newY = playerPos.y > enemyPos.y ? enemyPos.y + 1 : enemyPos.y - 1;
      const clampedX = Math.max(0, Math.min(GRID_SIZE - 1, newX));
      const clampedY = Math.max(0, Math.min(GRID_SIZE - 1, newY));
      setEnemyPos({ x: clampedX, y: clampedY });
      addCombatLog('> GRIDSEC OPERATIVE ADVANCING.');
    } else {
      const playerRoll = rollD10();
      const enemyRoll = rollD10();
      const enemySTR = 6;
      
      const defenseTotal = playerRoll + int + interfaceLvl + (activeAction?.strength || 0) + interfaceBonus;
      const attackTotal = enemyRoll + enemySTR;
      
      addCombatLog(`> GRIDSEC ATTACK: D10(${enemyRoll}) + STR(${enemySTR}) = ${attackTotal}`);
      addCombatLog(`> PLAYER DEFENSE: D10(${playerRoll}) + INT(${int}) + INTF(${interfaceLvl}) + PROG(${activeAction?.strength || 0}) = ${defenseTotal}`);
      
      if (attackTotal > defenseTotal) {
        const damage = Math.max(1, attackTotal - defenseTotal);
        const newHP = playerHP - damage;
        setPlayerHP(newHP);
        addCombatLog(`> HIT! YOU TAKE ${damage} NEURAL DAMAGE. (HP: ${newHP}/8)`);
        
        if (newHP <= 0) {
          sfx.flatline();
          addCombatLog('> FLATLINE. INTERDICTION FAILED.');
          useRoutingStore.getState().addTraceRisk(10);
          setTimeout(onTimeout, 1500);
          return;
        }
      } else {
        addCombatLog('> DEFENSE SUCCESSFUL. ATTACK BLOCKED.');
      }
    }
    
    setTurnSpent(false);
  };

  const handleTimeout = (): void => {
    sfx.error();
    addCombatLog('> TIME EXPIRED. FORCED DISCONNECT.');
    useRoutingStore.getState().addTraceRisk(10);
    onTimeout();
  };

  const handleEscape = (): void => {
    sfx.click();
    useRoutingStore.getState().addTraceRisk(5);
    addCombatLog('> EMERGENCY DISCONNECT. TRACING INCOMPLETE. +5 RISK.');
    onEscape();
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-4">
      <div className="border-2 border-red-500 p-4 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-red-500 tracking-widest">[!] GRIDSEC INTERDICTION [!]</h2>
          <div className="text-red-400 font-bold">TURNS: {turnCount}/{maxTurns}</div>
        </div>

        <div className="text-xs text-gray-400 mb-2">
          SURVIVE {maxTurns} TURNS OR DEFEAT THE OPERATIVE TO ESCAPE
        </div>

        <div className="grid grid-cols-8 gap-0.5 bg-gray-900 p-1 mb-4">
          {Array(GRID_SIZE).fill(null).map((_, y) => (
            Array(GRID_SIZE).fill(null).map((_, x) => {
              const isPlayer = playerPos.x === x && playerPos.y === y;
              const isEnemy = enemyPos.x === x && enemyPos.y === y;
              const dist = getDistance({ x, y }, enemyPos);
              const inRange = dist <= 2;
              
              return (
                <div
                  key={`${x}-${y}`}
                  className={`w-8 h-8 flex items-center justify-center text-xs font-bold
                    ${isPlayer ? 'bg-green-600 text-black' : ''}
                    ${isEnemy ? 'bg-red-600 text-black animate-pulse' : ''}
                    ${!isPlayer && !isEnemy && inRange ? 'bg-red-900/30' : 'bg-gray-800'}
                  `}
                  onClick={() => {
                    if (isAdjacent()) handleCombat();
                  }}
                >
                  {isPlayer ? '@' : isEnemy ? 'N' : inRange ? '!' : '.'}
                </div>
              );
            })
          ))}
        </div>

        <div className="flex justify-between mb-4 text-xs">
          <div className="text-green-400">YOUR HP: {playerHP}/8</div>
          <div className="text-red-400">OPERATIVE HP: {enemyHP}/10</div>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => handlePlayerMove(-1, 0)}
            disabled={turnSpent}
            className="px-3 py-1 border border-neon-green text-neon-green disabled:opacity-30 text-xs"
          >
            ← MOVE
          </button>
          <button
            onClick={() => handlePlayerMove(0, -1)}
            disabled={turnSpent}
            className="px-3 py-1 border border-neon-green text-neon-green disabled:opacity-30 text-xs"
          >
            ↑ MOVE
          </button>
          <button
            onClick={() => handlePlayerMove(0, 1)}
            disabled={turnSpent}
            className="px-3 py-1 border border-neon-green text-neon-green disabled:opacity-30 text-xs"
          >
            ↓ MOVE
          </button>
          <button
            onClick={() => handlePlayerMove(1, 0)}
            disabled={turnSpent}
            className="px-3 py-1 border border-neon-green text-neon-green disabled:opacity-30 text-xs"
          >
            MOVE →
          </button>
          <button
            onClick={handleCombat}
            disabled={turnSpent || !isAdjacent()}
            className="px-3 py-1 border border-red-500 text-red-500 disabled:opacity-30 text-xs"
          >
            ATTACK
          </button>
          <button
            onClick={handleEscape}
            className="px-3 py-1 border border-yellow-500 text-yellow-500 text-xs"
          >
            ESCAPE (+5 RISK)
          </button>
        </div>

        <div className="h-32 overflow-y-auto bg-black border border-gray-700 p-2 text-xs font-mono">
          {combatLog.map((msg, i) => (
            <div key={i} className="text-neon-green">{msg}</div>
          ))}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  );
}
