import { useEffect, useState } from 'react';
import { world } from '../ecs/world';
import { useTerminalStore } from '../store/terminalStore';
import { useCyberdeckStore } from '../store/cyberdeckStore';
import { useMeatspaceStore } from '../store/meatspaceStore';

const GRID_SIZE = 15;

export function TheNet({ onJackOut }) {
  const [, setTick] = useState(0);

  useEffect(() => {
    world.clear();
    const fortStartX = 3;
    const fortStartY = 2;
    const fortSize = 9;

    for (let y = fortStartY; y < fortStartY + fortSize; y++) {
      for (let x = fortStartX; x < fortStartX + fortSize; x++) {
        if (x === fortStartX || x === fortStartX + fortSize - 1 || 
            y === fortStartY || y === fortStartY + fortSize - 1) {
          if (x === 7 && y === fortStartY + fortSize - 1) continue;

          world.add({
            position: { x, y },
            render: { char: '#', color: 'text-green-800' },
            isWall: true
          });
        }
      }
    }

    world.add({
      position: { x: 7, y: fortStartY + fortSize - 1 }, 
      render: { char: '[', color: 'text-yellow-500' },
      isCodeGate: true,
      isWall: true 
    });

    const cpuPositions = [
      {x: 6, y: 5}, {x: 7, y: 5},
      {x: 6, y: 6}, {x: 7, y: 6}
    ];
    cpuPositions.forEach(pos => {
      world.add({
        position: pos,
        render: { char: 'C', color: 'text-purple-500 animate-pulse' },
        isCPU: true,
        isWall: true 
      });
    });

    const memoryPositions = [
      {x: 5, y: 5}, {x: 8, y: 5}, 
      {x: 5, y: 6}, {x: 8, y: 6}
    ];
    memoryPositions.forEach(pos => {
      world.add({
        position: pos,
        render: { char: 'M', color: 'text-blue-400' },
        isMemory: true,
        isWall: true
      });
    });

    world.add({
      id: 'player',
      position: { x: 7, y: 13 },
      render: { char: '@', color: 'text-neon-green' },
      isPlayer: true
    });

    world.add({
      position: { x: 7, y: 11 },
      render: { char: 'H', color: 'text-red-500' },
      isIce: true,
      name: 'Hellhound'
    });

    world.add({
      position: { x: 7, y: 7 },
      render: { char: 'P', color: 'text-red-500' },
      isIce: true,
      name: 'Pit Bull'
    });

    setTick(t => t + 1); 
  }, []);

  const executeEnemyTurn = () => {
    const player = world.with('isPlayer').entities[0];
    if (!player) return;

    const iceEntities = world.with('isIce').entities;
    const addLog = useTerminalStore.getState().addLog;
    const { int, interfaceLvl, takeDamage, health } = useMeatspaceStore.getState();
    const activeProgram = useCyberdeckStore.getState().activeProgram;

    iceEntities.forEach(ice => {
      const isAdjacent = () => Math.abs(ice.position.x - player.position.x) + Math.abs(ice.position.y - player.position.y) === 1;

      const executeIceAttack = () => {
        addLog(`> ALERT: ${ice.name.toUpperCase()} INITIATED ATTACK!`);
        
        const iceRoll = Math.floor(Math.random() * 10) + 1;
        const playerRoll = Math.floor(Math.random() * 10) + 1;
        const iceStr = ice.name === 'Pit Bull' ? 3 : 5;
        const progStr = activeProgram ? activeProgram.strength : 0;

        const attackTotal = iceRoll + iceStr;
        const defenseTotal = playerRoll + int + interfaceLvl + progStr;

        addLog(`> ICE ATTACK: D10(${iceRoll}) + STR(${iceStr}) = ${attackTotal}`);
        addLog(`> DEFENSE: D10(${playerRoll}) + INT(${int}) + INTF(${interfaceLvl}) + STR(${progStr}) = ${defenseTotal}`);

        // NEW: Lethal Damage Logic
        if (attackTotal > defenseTotal) {
             // Roll 1D3 for Neural Damage
             const damage = Math.floor(Math.random() * 3) + 1; 
             addLog(`> CRITICAL: YOU TOOK ${damage} NEURAL DAMAGE FROM ${ice.name.toUpperCase()}!`);
             
             takeDamage(damage);

             // Flatline Check
             if (useMeatspaceStore.getState().health === 0) {
                 addLog(`> FLATLINE DETECTED. EMERGENCY CORTICAL DISCONNECT TRIGGERED.`);
                 // Force the player out of the Net after a 1.5 second delay so they can read the message
                 setTimeout(() => onJackOut(), 1500); 
             }

        } else {
             addLog("> EVASION SUCCESSFUL. ICE ATTACK BLOCKED.");
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
      turnSpent = true;
    }
    
    if (hitGenericWall || hitCPU) {
      useTerminalStore.getState().addLog("> WARNING: SOLID ARCHITECTURE DETECTED. ACCESS DENIED.");
    }

    if (hitCodeGate) {
      const activeProgram = useCyberdeckStore.getState().activeProgram;
      const addLog = useTerminalStore.getState().addLog;

      if (!activeProgram) {
        addLog("> CODE GATE DETECTED. SELECT A PROGRAM TO BYPASS.");
      } else if (activeProgram.type === 'utility') {
        addLog(`> EXECUTING ${activeProgram.name.toUpperCase()}...`);
        world.remove(hitCodeGate);
        addLog("> DECRYPT SUCCESSFUL. CODE GATE OPENED.");
        turnSpent = true;
      } else {
        addLog(`> ERROR: ${activeProgram.name.toUpperCase()} IS NOT A DECRYPTION UTILITY.`);
      }
    }

    if (hitMemory) {
      useTerminalStore.getState().addLog("> MEMORY UNIT ACCESSED. DOWNLOADING PAYLOAD...");
      useTerminalStore.getState().addLog("> ACQUIRED: 500 Eurobucks & Encrypted Corp File.");
      useMeatspaceStore.getState().addFunds(500);
      hitMemory.render.color = 'text-gray-700'; 
      hitMemory.isMemory = false; 
      turnSpent = true;
    }

    if (hitIce) {
      const activeProgram = useCyberdeckStore.getState().activeProgram;
      const addLog = useTerminalStore.getState().addLog;

      if (!activeProgram) {
        addLog(`> WARNING: ${hitIce.name.toUpperCase()} DETECTED. NO COMBAT PROGRAM SELECTED!`);
        return; 
      }

      if (activeProgram.type !== 'anti-ice') {
        addLog(`> ERROR: ${activeProgram.name.toUpperCase()} IS INEFFECTIVE AGAINST BLACK ICE.`);
        return; 
      }

      addLog(`> INITIATING COMBAT SEQUENCE WITH ${activeProgram.name.toUpperCase()}...`);
      
      const playerRoll = Math.floor(Math.random() * 10) + 1;
      const iceRoll = Math.floor(Math.random() * 10) + 1;
      const programStr = activeProgram.strength; 
      const iceStr = hitIce.name === 'Pit Bull' ? 3 : 5; 
      
      const { int, interfaceLvl } = useMeatspaceStore.getState();
      const attackTotal = playerRoll + int + interfaceLvl + programStr;
      const defenseTotal = iceRoll + iceStr;

      addLog(`> ${activeProgram.name.toUpperCase()}: D10(${playerRoll}) + INT(${int}) + INTF(${interfaceLvl}) + STR(${programStr}) = ${attackTotal}`);
      addLog(`> TARGET DEFENSE: D10(${iceRoll}) + STR(${iceStr}) = ${defenseTotal}`);

      if (attackTotal > defenseTotal) {
        addLog("> BREACH SUCCESSFUL. TARGET DEREZZED.");
        world.remove(hitIce);
      } else {
        addLog("> ATTACK FAILED. WARNING: ICE COUNTER-TRACE DETECTED.");
      }
      turnSpent = true;
    }

    if (turnSpent) {
      // Don't let ICE attack if the player is already dead
      if (useMeatspaceStore.getState().health > 0) {
          executeEnemyTurn();
      }
    }
    
    setTick((t) => t + 1);
  };

  const renderableEntities = world.with('position', 'render');

  return (
    <div className="flex flex-col items-center w-full h-full justify-center">
      <div 
        className="grid gap-[1px] bg-green-900/20 border-2 border-neon-green/50 p-1 shadow-[0_0_20px_#00ffcc20]"
        style={{ 
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1.5rem)`,
          gridTemplateRows: `repeat(${GRID_SIZE}, 1.5rem)`
        }}
      >
        {Array.from({ length: GRID_SIZE }).map((_, y) => 
          Array.from({ length: GRID_SIZE }).map((_, x) => {
            const entityHere = renderableEntities.entities.find(
              (e) => e.position.x === x && e.position.y === y
            );
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
                  <span className={`${entityHere.render.color} text-shadow-glow pointer-events-none`}>
                    {entityHere.render.char}
                  </span>
                ) : (
                  <span className="text-green-900/20 pointer-events-none">.</span> 
                )}
              </div>
            );
          })
        )}
      </div>

      <button 
        onClick={onJackOut}
        className="mt-8 border border-red-500 text-red-500 px-4 py-2 hover:bg-red-500 hover:text-black cursor-pointer transition-colors"
      >
        [ EMERGENCY JACK OUT ]
      </button>
    </div>
  );
}