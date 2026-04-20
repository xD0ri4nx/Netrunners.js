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

    // 1. Build the Corporate Datafortress (A structured 9x9 walled compound)
    const fortStartX = 3;
    const fortStartY = 2;
    const fortSize = 9;

    // Draw the outer Data Walls
    for (let y = fortStartY; y < fortStartY + fortSize; y++) {
      for (let x = fortStartX; x < fortStartX + fortSize; x++) {
        // Only draw walls on the perimeter
        if (x === fortStartX || x === fortStartX + fortSize - 1 || 
            y === fortStartY || y === fortStartY + fortSize - 1) {
            
          // Leave a gap for the Code Gate at the bottom center
          if (x === 7 && y === fortStartY + fortSize - 1) continue;

          world.add({
            position: { x, y },
            render: { char: '#', color: 'text-green-800' },
            isWall: true
          });
        }
      }
    }

    // 2. Place the Code Gate (The front door)
    world.add({
      position: { x: 7, y: fortStartY + fortSize - 1 }, // Coordinate [7, 10]
      render: { char: '[', color: 'text-yellow-500' },
      isCodeGate: true,
      isWall: true // Acts as a wall until decrypted
    });

    // 3. Place the Central CPU (2x2 Grid in the middle)
    const cpuPositions = [
      {x: 6, y: 5}, {x: 7, y: 5},
      {x: 6, y: 6}, {x: 7, y: 6}
    ];
    cpuPositions.forEach(pos => {
      world.add({
        position: pos,
        render: { char: 'C', color: 'text-purple-500 animate-pulse' },
        isCPU: true,
        isWall: true // You can't walk THROUGH a CPU
      });
    });

    // 4. Place Memory Units (Data Storage) attached to the CPU
    const memoryPositions = [
      {x: 5, y: 5}, {x: 8, y: 5}, // Left and Right of CPU
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

    // 5. Spawn the Player outside the Datafort
    world.add({
      id: 'player',
      position: { x: 7, y: 13 },
      render: { char: '@', color: 'text-neon-green' },
      isPlayer: true
    });

    // 6. Tactical ICE Placement (Like the tabletop rules)
    // Place a Hellhound guarding the outside of the Code Gate
    world.add({
      position: { x: 7, y: 11 },
      render: { char: 'H', color: 'text-red-500' },
      isIce: true,
      name: 'Hellhound'
    });

    // Place a Pit Bull patrolling inside the CPU room
    world.add({
      position: { x: 7, y: 7 },
      render: { char: 'P', color: 'text-red-500' },
      isIce: true,
      name: 'Pit Bull'
    });

    setTick(t => t + 1); 
  }, []);

  const handleCellClick = (targetX, targetY) => {
    const player = world.with('isPlayer').entities[0];
    if (!player) return;

    // TTRPG Rule: Must be orthogonally adjacent
    const dx = Math.abs(targetX - player.position.x);
    const dy = Math.abs(targetY - player.position.y);
    if (dx + dy !== 1) return;

    // See what exists at the clicked tile
    const entitiesAtTarget = world.with('position').entities.filter(
      (ent) => ent.position.x === targetX && ent.position.y === targetY
    );

    // Identify exactly what we are clicking on
    const hitCodeGate = entitiesAtTarget.find((ent) => ent.isCodeGate);
    const hitMemory = entitiesAtTarget.find((ent) => ent.isMemory);
    const hitIce = entitiesAtTarget.find((ent) => ent.isIce);
    const hitCPU = entitiesAtTarget.find((ent) => ent.isCPU);
    
    // A Generic Wall is a wall that ISN'T a special interactive node
    const hitGenericWall = entitiesAtTarget.find((ent) => ent.isWall && !ent.isCodeGate && !ent.isMemory && !ent.isCPU);
    
    // We can only move into the space if there are no solid objects
    const isSolid = entitiesAtTarget.some((ent) => ent.isWall || ent.isIce || ent.isCPU);

    // ACTION 1: Move into an empty space
    if (!isSolid) {
      player.position.x = targetX;
      player.position.y = targetY;
      setTick((t) => t + 1);
    }
    
    // ACTION 2: Hit a Generic Wall or CPU
    if (hitGenericWall || hitCPU) {
      useTerminalStore.getState().addLog("> WARNING: SOLID ARCHITECTURE DETECTED. ACCESS DENIED.");
    }

    // ACTION 3: Interact with a Code Gate
    if (hitCodeGate) {
      const activeProgram = useCyberdeckStore.getState().activeProgram;
      const addLog = useTerminalStore.getState().addLog;

      if (!activeProgram) {
        addLog("> CODE GATE DETECTED. SELECT A PROGRAM TO BYPASS.");
      } else if (activeProgram.type === 'utility') {
        addLog(`> EXECUTING ${activeProgram.name.toUpperCase()}...`);
        world.remove(hitCodeGate);
        addLog("> DECRYPT SUCCESSFUL. CODE GATE OPENED.");
        setTick((t) => t + 1);
      } else {
        addLog(`> ERROR: ${activeProgram.name.toUpperCase()} IS NOT A DECRYPTION UTILITY.`);
      }
    }

    // ACTION 4: Interact with a Memory Unit
    if (hitMemory) {
      useTerminalStore.getState().addLog("> MEMORY UNIT ACCESSED. DOWNLOADING PAYLOAD...");
      useTerminalStore.getState().addLog("> ACQUIRED: 500 Eurobucks & Encrypted Corp File.");
      
      // Inject the stolen money directly into your Meatspace bank account!
      useMeatspaceStore.getState().addFunds(500);
      
      hitMemory.render.color = 'text-gray-700'; 
      hitMemory.isMemory = false; 
      setTick((t) => t + 1);
    }

    // ACTION 5: Initiate Cybercombat with ICE
    if (hitIce) {
      const activeProgram = useCyberdeckStore.getState().activeProgram;
      const addLog = useTerminalStore.getState().addLog;

      // 1. Validation: Do we have a program equipped?
      if (!activeProgram) {
        addLog(`> WARNING: ${hitIce.name.toUpperCase()} DETECTED. NO COMBAT PROGRAM SELECTED!`);
        return; // Stops the attack execution
      }

      // 2. Validation: Is it the right type of program?
      if (activeProgram.type !== 'anti-ice') {
        addLog(`> ERROR: ${activeProgram.name.toUpperCase()} IS INEFFECTIVE AGAINST BLACK ICE.`);
        return; // Stops the attack execution
      }

      addLog(`> INITIATING COMBAT SEQUENCE WITH ${activeProgram.name.toUpperCase()}...`);
      
      // 3. Simulate Tabletop D10 Rolls
      const playerRoll = Math.floor(Math.random() * 10) + 1;
      const iceRoll = Math.floor(Math.random() * 10) + 1;
      
      // Pull strength dynamically from your armed program!
      const programStr = activeProgram.strength; 
      const iceStr = hitIce.name === 'Pit Bull' ? 3 : 5; 
      
      // FETCH MEATSPACE STATS
      const { int, interfaceLvl } = useMeatspaceStore.getState();

      // THE TRUE MIKE PONDSMITH FORMULA: 1D10 + INT + INTERFACE + PROGRAM STR
      const attackTotal = playerRoll + int + interfaceLvl + programStr;
      const defenseTotal = iceRoll + iceStr;

      // Print the full equation to the terminal
      addLog(`> ${activeProgram.name.toUpperCase()}: D10(${playerRoll}) + INT(${int}) + INTF(${interfaceLvl}) + STR(${programStr}) = ${attackTotal}`);
      addLog(`> TARGET DEFENSE: D10(${iceRoll}) + STR(${iceStr}) = ${defenseTotal}`);

      // 4. Resolve Combat
      if (attackTotal > defenseTotal) {
        addLog("> BREACH SUCCESSFUL. TARGET DEREZZED.");
        world.remove(hitIce);
        setTick((t) => t + 1);
      } else {
        addLog("> ATTACK FAILED. WARNING: ICE COUNTER-TRACE DETECTED.");
      }
    }
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