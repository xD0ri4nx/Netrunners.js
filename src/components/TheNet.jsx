import { useEffect, useState } from 'react';
import { world } from '../ecs/world';
import { useTerminalStore } from '../store/terminalStore';
import { useCyberdeckStore } from '../store/cyberdeckStore';
import { useMeatspaceStore } from '../store/meatspaceStore';
import { useMissionStore } from '../store/missionStore';
import { useRoutingStore } from '../store/routingStore';
import { sfx } from '../utils/sfx';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

const GRID_SIZE = 15;

export function TheNet({ onJackOut }) {
  const [, setTick] = useState(0);

  useEffect(() => {
    world.clear();
    const fortMap = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill('SPACE'));

    const w1 = Math.floor(Math.random() * 3) + 7; 
    const h1 = Math.floor(Math.random() * 3) + 7; 
    const x1 = Math.floor(Math.random() * (11 - w1)) + 2; 
    const y1 = Math.floor(Math.random() * (11 - h1)) + 2;

    const w2 = Math.floor(Math.random() * 3) + 5;
    const h2 = Math.floor(Math.random() * 3) + 5;
    const intersectX = Math.floor(Math.random() * w1) + x1;
    const intersectY = Math.floor(Math.random() * h1) + y1;
    let x2 = Math.max(2, Math.min(intersectX - Math.floor(Math.random() * w2), 12 - w2));
    let y2 = Math.max(2, Math.min(intersectY - Math.floor(Math.random() * h2), 12 - h2));

    const rects = [
      { x: x1, y: y1, w: w1, h: h1 },
      { x: x2, y: y2, w: w2, h: h2 }
    ];

    rects.forEach(r => {
      for(let y = r.y; y < r.y + r.h; y++) {
         for(let x = r.x; x < r.x + r.w; x++) {
            fortMap[y][x] = 'FLOOR';
         }
      }
    });

    const walls = [];
    const floors = [];

    for (let y = 1; y < GRID_SIZE - 1; y++) {
      for (let x = 1; x < GRID_SIZE - 1; x++) {
        if (fortMap[y][x] === 'FLOOR') {
          const isPerimeter =
            fortMap[y-1][x] === 'SPACE' || fortMap[y+1][x] === 'SPACE' ||
            fortMap[y][x-1] === 'SPACE' || fortMap[y][x+1] === 'SPACE' ||
            fortMap[y-1][x-1] === 'SPACE' || fortMap[y+1][x+1] === 'SPACE' ||
            fortMap[y+1][x-1] === 'SPACE' || fortMap[y-1][x+1] === 'SPACE';

          if (isPerimeter) walls.push({ x, y });
          else floors.push({ x, y });
        }
      }
    }

    let maxY = 0;
    walls.forEach(w => { if (w.y > maxY) maxY = w.y; });
    const bottomWalls = walls.filter(w => w.y === maxY).sort((a, b) => a.x - b.x);
    const gatePos = bottomWalls[Math.floor(bottomWalls.length / 2)]; 

    walls.forEach(w => {
       if (w.x === gatePos.x && w.y === gatePos.y) return; 
       world.add({ position: { x: w.x, y: w.y }, render: { char: '#', color: 'text-green-800' }, isWall: true });
    });

    world.add({ position: gatePos, render: { char: '[', color: 'text-yellow-500' }, isCodeGate: true, isWall: true });
    world.add({ id: 'player', position: { x: gatePos.x, y: gatePos.y + 1 }, render: { char: '@', color: 'text-neon-green' }, isPlayer: true });

    const shuffle = (array) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    };
    shuffle(floors);

    if (floors.length > 0) {
       world.add({ position: floors.pop(), render: { char: 'C', color: 'text-purple-500 animate-pulse' }, isCPU: true, isWall: true });
    }

    const numMemory = Math.floor(Math.random() * 2) + 1; 
    for(let i = 0; i < numMemory; i++) {
       if (floors.length === 0) break;
       world.add({ position: floors.pop(), render: { char: 'M', color: 'text-blue-400' }, isMemory: true, isWall: true });
    }

    const icePool = ['Hellhound', 'Pit Bull', 'Bloodhound'];
    const numIce = Math.floor(Math.random() * 2) + 1;
    for(let i = 0; i < numIce; i++) {
       if (floors.length === 0) break;
       const type = icePool[Math.floor(Math.random() * icePool.length)];
       world.add({ position: floors.pop(), render: { char: type === 'Pit Bull' ? 'P' : type === 'Hellhound' ? 'H' : 'B', color: 'text-red-500' }, isIce: true, name: type });
    }

    setTick(t => t + 1); 
  }, []);

  const executeEnemyTurn = () => {
    const player = world.with('isPlayer').entities[0];
    if (!player) return;

    const iceEntities = world.with('isIce').entities;
    const addLog = useTerminalStore.getState().addLog;
    const { int, interfaceLvl, takeDamage } = useMeatspaceStore.getState();
    const { activeProgram, combatBonus } = useCyberdeckStore.getState();

    iceEntities.forEach(ice => {
      const iceStr = ice.name === 'Pit Bull' ? 3 : ice.name === 'Bloodhound' ? 4 : 5;

      // NEW: Passive Lore-Accurate Detection Routine
      if (activeProgram && activeProgram.type === 'stealth') {
        const playerHideRoll = Math.floor(Math.random() * 10) + 1;
        const iceDetectRoll = Math.floor(Math.random() * 10) + 1;
        
        const hideTotal = playerHideRoll + int + interfaceLvl + activeProgram.strength + combatBonus;
        const detectTotal = iceDetectRoll + iceStr;

        if (hideTotal > detectTotal) {
          // ICE fails to detect the invisible runner and skips its entire turn!
          return; 
        } else {
          // ICE pierces the stealth and acts normally. We log it so the player knows their stealth failed!
          const isAdjacent = Math.abs(ice.position.x - player.position.x) + Math.abs(ice.position.y - player.position.y) === 1;
          if (isAdjacent) {
             addLog(`> ALERT: ${ice.name.toUpperCase()} HAS PIERCED YOUR STEALTH CLOAK!`);
          }
        }
      }

      const isAdjacent = () => Math.abs(ice.position.x - player.position.x) + Math.abs(ice.position.y - player.position.y) === 1;

      const executeIceAttack = () => {
        addLog(`> ALERT: ${ice.name.toUpperCase()} INITIATED ATTACK!`);
        
        const iceRoll = Math.floor(Math.random() * 10) + 1;
        const playerRoll = Math.floor(Math.random() * 10) + 1;
        const progStr = activeProgram && activeProgram.type !== 'stealth' ? activeProgram.strength : 0;
        
        const attackTotal = iceRoll + iceStr;
        const defenseTotal = playerRoll + int + interfaceLvl + progStr + combatBonus;

        addLog(`> ICE ATTACK: D10(${iceRoll}) + STR(${iceStr}) = ${attackTotal}`);
        addLog(`> DEFENSE: D10(${playerRoll}) + INT(${int}) + INTF(${interfaceLvl}) + PROG(${progStr}) + DECK(+${combatBonus}) = ${defenseTotal}`);

        if (attackTotal > defenseTotal) {
             const damage = Math.floor(Math.random() * 3) + 1; 
             addLog(`> CRITICAL: YOU TOOK ${damage} NEURAL DAMAGE FROM ${ice.name.toUpperCase()}!`);
             takeDamage(damage);
             sfx.damage();

             if (useMeatspaceStore.getState().health === 0) {
                 addLog(`> FLATLINE DETECTED. EMERGENCY CORTICAL DISCONNECT TRIGGERED.`);
                 sfx.flatline();
                 setTimeout(() => onJackOut(), 1500); 
             }
        } else {
             addLog("> EVASION SUCCESSFUL. ICE ATTACK BLOCKED.");
             sfx.attack();
        }
      };

      if (isAdjacent()) {
          executeIceAttack();
          return;
      }

      let moveX = ice.position.x;
      let moveY = ice.position.y;
      if (ice.position.x < player.position.x) moveX++;
      else if (ice.position.x > player.position.x) moveX--;

      const isXBlocked = world.with('position').entities.some(e => 
        e.position.x === moveX && e.position.y === ice.position.y && 
        (e.isWall || e.isIce || e.isCPU || e.isPlayer || e.isCodeGate || e.isMemory)
      );

      if (!isXBlocked && moveX !== ice.position.x) {
          ice.position.x = moveX;
      } else {
          if (ice.position.y < player.position.y) moveY++;
          else if (ice.position.y > player.position.y) moveY--;

          const isYBlocked = world.with('position').entities.some(e => 
            e.position.x === ice.position.x && e.position.y === moveY && 
            (e.isWall || e.isIce || e.isCPU || e.isPlayer || e.isCodeGate || e.isMemory)
          );

          if (!isYBlocked && moveY !== ice.position.y) {
              ice.position.y = moveY;
          }
      }

      if (isAdjacent()) {
          executeIceAttack();
      }
    });
  };

  const handleCellClick = (targetX, targetY) => {
    const player = world.with('isPlayer').entities[0];
    if (!player) return;

    const dx = Math.abs(targetX - player.position.x);
    const dy = Math.abs(targetY - player.position.y);
    if (dx + dy !== 1) return;

    const entitiesAtTarget = world.with('position').entities.filter(
      (ent) => ent.position.x === targetX && ent.position.y === targetY
    );

    const hitCodeGate = entitiesAtTarget.find((ent) => ent.isCodeGate);
    const hitMemory = entitiesAtTarget.find((ent) => ent.isMemory);
    const hitIce = entitiesAtTarget.find((ent) => ent.isIce);
    const hitCPU = entitiesAtTarget.find((ent) => ent.isCPU);
    const hitGenericWall = entitiesAtTarget.find((ent) => ent.isWall && !ent.isCodeGate && !ent.isMemory && !ent.isCPU);
    const isSolid = entitiesAtTarget.some((ent) => ent.isWall || ent.isIce || ent.isCPU);

    let turnSpent = false;

    if (!isSolid) {
      player.position.x = targetX;
      player.position.y = targetY;
      sfx.move();
      turnSpent = true;
    }
    
    if (hitGenericWall || hitCPU) {
      sfx.error();
      useTerminalStore.getState().addLog("> WARNING: SOLID ARCHITECTURE DETECTED. ACCESS DENIED.");
    }

    if (hitCodeGate) {
      const activeProgram = useCyberdeckStore.getState().activeProgram;
      const addLog = useTerminalStore.getState().addLog;

      if (!activeProgram) {
        sfx.error();
        addLog("> CODE GATE DETECTED. SELECT A PROGRAM TO BYPASS.");
        turnSpent = true;
      } else if (activeProgram.type === 'utility') {
        sfx.loot();
        addLog(`> EXECUTING ${activeProgram.name.toUpperCase()}...`);
        world.remove(hitCodeGate);
        addLog("> DECRYPT SUCCESSFUL. CODE GATE OPENED.");
        turnSpent = true;
      } else {
        sfx.error();
        addLog(`> ERROR: ${activeProgram.name.toUpperCase()} IS NOT A DECRYPTION UTILITY.`);
        turnSpent = true;
      }
    }

    if (hitMemory) {
      sfx.loot();
      
      const missionStore = useMissionStore.getState();
      const currentLdl = useRoutingStore.getState().currentLdl;
      const addLog = useTerminalStore.getState().addLog;
      
      if (missionStore.activeJob && !missionStore.payloadSecured && currentLdl === missionStore.activeJob.targetLdl) {
        addLog(`> TARGET IDENTIFIED. DOWNLOADING: ${missionStore.activeJob.title}...`);
        addLog(`> MISSION CRITICAL FILE SECURED. JACK OUT TO CLAIM PAYOUT.`);
        missionStore.securePayload();
      } else {
        addLog("> MEMORY UNIT ACCESSED. DOWNLOADING PAYLOAD...");
        addLog("> ACQUIRED: 500 Eurobucks & Encrypted Corp File.");
        useMeatspaceStore.getState().addFunds(500);
      }
      
      hitMemory.render.color = 'text-gray-700'; 
      hitMemory.isMemory = false; 
      hitMemory.isWall = false; 
      turnSpent = true;
    }

    if (hitIce) {
      const { activeProgram, combatBonus } = useCyberdeckStore.getState();
      const addLog = useTerminalStore.getState().addLog;

      if (!activeProgram) {
        sfx.error();
        addLog(`> WARNING: ${hitIce.name.toUpperCase()} DETECTED. NO PROGRAM SELECTED!`);
        turnSpent = true; 
      } else if (activeProgram.type === 'anti-ice') {
        addLog(`> INITIATING COMBAT SEQUENCE WITH ${activeProgram.name.toUpperCase()}...`);
        
        const playerRoll = Math.floor(Math.random() * 10) + 1;
        const iceRoll = Math.floor(Math.random() * 10) + 1;
        const iceStr = hitIce.name === 'Pit Bull' ? 3 : hitIce.name === 'Bloodhound' ? 4 : 5;
        const programStr = activeProgram.strength; 
        
        const { int, interfaceLvl } = useMeatspaceStore.getState();
        
        const attackTotal = playerRoll + int + interfaceLvl + programStr + combatBonus;
        const defenseTotal = iceRoll + iceStr;

        addLog(`> ${activeProgram.name.toUpperCase()}: D10(${playerRoll}) + INT(${int}) + INTF(${interfaceLvl}) + PROG(${programStr}) + DECK(+${combatBonus}) = ${attackTotal}`);
        addLog(`> TARGET DEFENSE: D10(${iceRoll}) + STR(${iceStr}) = ${defenseTotal}`);

        if (attackTotal > defenseTotal) {
          sfx.attack();
          addLog("> BREACH SUCCESSFUL. TARGET DEREZZED.");
          world.remove(hitIce);
        } else {
          sfx.error();
          addLog("> ATTACK FAILED. WARNING: ICE COUNTER-TRACE DETECTED.");
        }
        turnSpent = true;
      } else if (activeProgram.type === 'stealth') {
        addLog(`> EXECUTING ${activeProgram.name.toUpperCase()}... INITIATING EVASION.`);
        
        const playerRoll = Math.floor(Math.random() * 10) + 1;
        const iceRoll = Math.floor(Math.random() * 10) + 1;
        const iceStr = hitIce.name === 'Pit Bull' ? 3 : hitIce.name === 'Bloodhound' ? 4 : 5;
        const programStr = activeProgram.strength; 
        
        const { int, interfaceLvl } = useMeatspaceStore.getState();
        
        const evasionTotal = playerRoll + int + interfaceLvl + programStr + combatBonus;
        const detectionTotal = iceRoll + iceStr;

        addLog(`> EVASION: D10(${playerRoll}) + INT(${int}) + INTF(${interfaceLvl}) + PROG(${programStr}) + DECK(+${combatBonus}) = ${evasionTotal}`);
        addLog(`> ICE DETECTION: D10(${iceRoll}) + STR(${iceStr}) = ${detectionTotal}`);

        if (evasionTotal > detectionTotal) {
          sfx.move();
          addLog("> EVASION SUCCESSFUL. SLIPPING PAST BLACK ICE.");
          const tempX = player.position.x;
          const tempY = player.position.y;
          player.position.x = hitIce.position.x;
          player.position.y = hitIce.position.y;
          hitIce.position.x = tempX;
          hitIce.position.y = tempY;
        } else {
          sfx.error();
          addLog("> EVASION FAILED. YOU HAVE BEEN DETECTED.");
        }
        turnSpent = true;
      } else {
        sfx.error();
        addLog(`> ERROR: ${activeProgram.name.toUpperCase()} IS INEFFECTIVE AGAINST BLACK ICE.`);
        turnSpent = true; 
      }
    }

    if (turnSpent) {
      if (useMeatspaceStore.getState().health > 0) {
          executeEnemyTurn();
      }
    }
    
    setTick((t) => t + 1);
  };

  const renderableEntities = world.with('position', 'render');

  return (
    <div className="flex flex-col items-center w-full h-full relative overflow-hidden">
      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={3}
        centerOnInit={true}
        wheel={{ step: 0.1 }}
        pinch={{ step: 5 }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <div className="absolute top-2 right-2 z-50 flex gap-2 opacity-70 hover:opacity-100">
              <button className="bg-black/80 border border-neon-green text-neon-green w-8 h-8 font-bold" onClick={() => zoomIn()}>+</button>
              <button className="bg-black/80 border border-neon-green text-neon-green w-8 h-8 font-bold" onClick={() => zoomOut()}>-</button>
              <button className="bg-black/80 border border-neon-green text-neon-green px-2 h-8 font-bold text-xs" onClick={() => resetTransform()}>RESET</button>
            </div>

            <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full flex items-center justify-center">
              <div 
                className="grid gap-[1px] bg-green-900/20 border-2 border-neon-green/50 p-1 shadow-[0_0_20px_#00ffcc20]"
                style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1.5rem)`, gridTemplateRows: `repeat(${GRID_SIZE}, 1.5rem)` }}
              >
                {Array.from({ length: GRID_SIZE }).map((_, y) => 
                  Array.from({ length: GRID_SIZE }).map((_, x) => {
                    const entityHere = renderableEntities.entities.find(e => e.position.x === x && e.position.y === y);
                    const player = world.with('isPlayer').entities[0];
                    const isAdjacent = player && (Math.abs(x - player.position.x) + Math.abs(y - player.position.y) === 1);

                    return (
                      <div 
                        key={`${x}-${y}`} 
                        onClick={() => handleCellClick(x, y)}
                        className={`w-6 h-6 flex items-center justify-center border border-green-900/30 font-bold select-none
                          ${isAdjacent && !entityHere ? 'cursor-pointer hover:bg-neon-green/20' : ''}
                          ${isAdjacent && entityHere ? 'cursor-crosshair hover:bg-red-500/20' : ''}
                          ${!isAdjacent ? 'bg-black/80' : 'bg-black'}
                        `}
                      >
                        {entityHere ? (
                          <span className={`${entityHere.render.color} text-shadow-glow pointer-events-none`}>{entityHere.render.char}</span>
                        ) : (
                          <span className="text-green-900/20 pointer-events-none">.</span> 
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>

      <div className="absolute bottom-4 z-50">
        <button onClick={onJackOut} className="bg-black border border-red-500 text-red-500 px-4 py-2 hover:bg-red-500 hover:text-black cursor-pointer transition-colors font-bold text-sm sm:text-base shadow-2xl">
          [ EMERGENCY JACK OUT ]
        </button>
      </div>
    </div>
  );
}