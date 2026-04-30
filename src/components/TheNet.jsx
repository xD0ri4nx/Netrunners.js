import { useEffect, useState, useMemo } from 'react';
import { world } from '../ecs/world';
import { useTerminalStore } from '../store/terminalStore';
import { useCyberdeckStore } from '../store/cyberdeckStore';
import { useMeatspaceStore } from '../store/meatspaceStore';
import { useMissionStore } from '../store/missionStore';
import { useRoutingStore } from '../store/routingStore';
import { LDL_DATABASE, CORP_THEMES } from '../data/ldlDatabase';
import { sfx } from '../utils/sfx';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

const GRID_SIZE = 15;

export function TheNet({ onJackOut }) {
  const [, setTick] = useState(0);
  const [controllerMenu, setControllerMenu] = useState(null);
  const [turnCount, setTurnCount] = useState(0);
  const [pendingAction, setPendingAction] = useState(null);

  const currentLdl = useRoutingStore(state => state.currentLdl);

  const theme = useMemo(() => {
    if (currentLdl && LDL_DATABASE[currentLdl]) {
      const corpName = LDL_DATABASE[currentLdl].corp;
      if (corpName && CORP_THEMES[corpName]) {
        return CORP_THEMES[corpName];
      }
    }
    return null;
  }, [currentLdl]);

  const generateFort = (isSubgrid) => {
    world.clear();
    const fortMap = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill('SPACE'));
    const addLog = useTerminalStore.getState().addLog;

    const currentLdl = useRoutingStore.getState().currentLdl;
    const isGhostTown = currentLdl && LDL_DATABASE[currentLdl]?.isGhostTown;

    if (theme && !isSubgrid && !isGhostTown) {
      addLog(`> CONNECTED TO ${theme.name.toUpperCase()} DATAFORT. IHARA-GRUBB TRANSFORMATION ACTIVE.`);
    } else if (isGhostTown && !isSubgrid) {
      addLog(`> WARNING: ENTERING GHOST TOWN: ${LDL_DATABASE[currentLdl].name.toUpperCase()}...`);
      addLog(`> FERAL BLACK ICE DETECTED. NO CORPORATE SECURITY.`);
    }

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

    const shuffle = (array) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    };
    shuffle(floors);

    if (isSubgrid) {
      const midIdx = Math.floor(floors.length / 2);
      const playerPos = floors.splice(midIdx, 1)[0];
      world.add({ id: 'player', position: playerPos, render: { char: '@', color: 'text-neon-green' }, isPlayer: true });
    } else {
      let maxY = 0;
      walls.forEach(w => { if (w.y > maxY) maxY = w.y; });
      const bottomWalls = walls.filter(w => w.y === maxY).sort((a, b) => a.x - b.x);
      const gatePos = bottomWalls[Math.floor(bottomWalls.length / 2)];

      walls.forEach(w => {
        if (w.x === gatePos.x && w.y === gatePos.y) return;
        const wallStr = Math.floor(Math.random() * 5) + 3;
        world.add({ position: { x: w.x, y: w.y }, render: { char: theme ? theme.wallChar : '#', color: theme ? theme.wallColor : 'text-green-800' }, isWall: true, wallStr });
      });

      world.add({ position: gatePos, render: { char: theme ? theme.gateChar : '[', color: theme ? theme.gateColor : 'text-yellow-500' }, isCodeGate: true, isWall: true });
      world.add({ id: 'player', position: { x: gatePos.x, y: gatePos.y + 1 }, render: { char: '@', color: 'text-neon-green' }, isPlayer: true });
    }

    if (floors.length > 0) {
      world.add({ position: floors.pop(), render: { char: theme ? theme.cpuChar : 'C', color: theme ? theme.cpuColor : 'text-purple-500 animate-pulse' }, isCPU: true, isWall: true });
    }

    const numMemory = isSubgrid ? Math.floor(Math.random() * 3) + 2 : Math.floor(Math.random() * 2) + 1;
    for(let i = 0; i < numMemory; i++) {
      if (floors.length === 0) break;
      const roll = Math.random();
      const fileType = roll < 0.6 ? 'grey' : roll < 0.85 ? 'black' : 'bbs';
      const color = fileType === 'grey' ? 'text-blue-400' : fileType === 'black' ? 'text-red-600' : 'text-yellow-400';
      world.add({ position: floors.pop(), render: { char: theme ? theme.memoryChar : 'M', color }, isMemory: true, isWall: true, fileType });
    }

    if (!isSubgrid && Math.random() < 0.5 && floors.length > 0) {
      const controllerTypes = ['cameras', 'blastDoors', 'turrets'];
      const type = controllerTypes[Math.floor(Math.random() * controllerTypes.length)];
      const defense = Math.floor(Math.random() * 3) + 4;
      world.add({
        position: floors.pop(),
        render: { char: theme ? theme.controllerChar : 'O', color: theme ? theme.controllerColor : 'text-teal-400 animate-pulse' },
        isController: true,
        controllerType: type,
        defense
      });
    }

    const feralIcePool = ['Feral Hellhound', 'Feral Pit Bull', 'Feral Bloodhound', 'Feral Firestarter'];
    const normalIcePool = ['Hellhound', 'Pit Bull', 'Bloodhound', 'Firestarter'];
    const icePool = isGhostTown ? feralIcePool : normalIcePool;
    const numIce = isSubgrid ? Math.floor(Math.random() * 2) + 2 : Math.floor(Math.random() * 2) + 1;
    
    for(let i = 0; i < numIce; i++) {
      if (floors.length === 0) break;
      const type = icePool[Math.floor(Math.random() * icePool.length)];
      const char = type.includes('Feral') ? type.charAt(type.length-1) : 
                    type === 'Pit Bull' ? 'P' : type === 'Hellhound' ? 'H' : type === 'Bloodhound' ? 'B' : 'F';
      const color = isGhostTown ? 'text-purple-500' : (theme ? theme.iceColor : 'text-red-500');
      world.add({ position: floors.pop(), render: { char, color }, isIce: true, name: type });
    }

    if (!isSubgrid && Math.random() < (isGhostTown ? 0.8 : 0.3) && floors.length > 0) {
      if (isGhostTown && Math.random() < 0.5) {
        // Spawn Rogue AI in Ghost Towns
        const rogueNames = ['Rogue AI Alpha', 'Rogue AI Beta', 'Transcendent Entity'];
        const name = rogueNames[Math.floor(Math.random() * rogueNames.length)];
        const rogueInt = Math.floor(Math.random() * 5) + 10;
        const rogueInterface = Math.floor(Math.random() * 5) + 8;
        const rogueDeckBonus = Math.floor(Math.random() * 5) + 3;

        const rogueProgramPool = [
          { name: 'Sword', type: 'anti-ice', strength: 6 },
          { name: 'Killer v2.0', type: 'anti-ice', strength: 8 },
          { name: 'Krash', type: 'anti-system', strength: 0 },
          { name: 'Viral 15', type: 'anti-system', strength: 0 },
        ];
        const numPrograms = Math.floor(Math.random() * 3) + 2;
        const roguePrograms = [];
        for (let i = 0; i < numPrograms; i++) {
          roguePrograms.push({ ...rogueProgramPool[Math.floor(Math.random() * rogueProgramPool.length)] });
        }

        world.add({
          position: floors.pop(),
          render: { char: 'R', color: 'text-purple-500 animate-pulse' },
          isSysop: true,
          isRogueAI: true,
          name,
          int: rogueInt,
          interfaceLvl: rogueInterface,
          deckBonus: rogueDeckBonus,
          programs: roguePrograms,
          alerted: false
        });
        addLog(`> WARNING: ROGUE AI ENTITY DETECTED: ${name.toUpperCase()}. STANDARD PROGRAMS INEFFECTIVE.`);
      } else {
        const sysopNames = ['Netwatch Sysop', 'Arasaka SecOps', 'Militech NetSec', 'Petrochem NetSec', 'Biotechnica Sysadmin'];
        const name = sysopNames[Math.floor(Math.random() * sysopNames.length)];
        const sysopInt = Math.floor(Math.random() * 5) + 6;
        const sysopInterface = Math.floor(Math.random() * 5) + 3;
        const sysopDeckBonus = Math.floor(Math.random() * 3);

        const programPool = [
          { name: 'Sword', type: 'anti-ice', strength: 4 },
          { name: 'Killer v2.0', type: 'anti-ice', strength: 6 },
          { name: 'Armor', type: 'defense', strength: 4 },
          { name: 'Shield', type: 'defense', strength: 3 },
        ];
        const numPrograms = Math.floor(Math.random() * 2) + 1;
        const sysopPrograms = [];
        for (let i = 0; i < numPrograms; i++) {
          sysopPrograms.push({ ...programPool[Math.floor(Math.random() * programPool.length)] });
        }

        world.add({
          position: floors.pop(),
          render: { char: 'S', color: theme ? theme.sysopColor : 'text-orange-400' },
          isSysop: true,
          name,
          int: sysopInt,
          interfaceLvl: sysopInterface,
          deckBonus: sysopDeckBonus,
          programs: sysopPrograms,
          alerted: false
        });
      }
    }

    setTick(t => t + 1);
  };

  useEffect(() => {
    const missionStore = useMissionStore.getState();
    if (missionStore.activeJob && missionStore.activeJob.turnLimit) {
      const addLog = useTerminalStore.getState().addLog;
      addLog(`> HEIST CONTRACT ACTIVE: ${missionStore.activeJob.turnLimit} TURNS REMAINING.`);
    }
    generateFort(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const executeEnemyTurn = () => {
    const player = world.with('isPlayer').entities[0];
    if (!player) return;

    const iceEntities = world.with('isIce').entities;
    const addLog = useTerminalStore.getState().addLog;
    const { int, interfaceLvl, takeDamage, interfaceType } = useMeatspaceStore.getState();
    const { activeAction, activePassives, combatBonus } = useCyberdeckStore.getState();

    // Check if stealth is loaded in background
    const stealthProg = activePassives.find(p => p.type === 'stealth');
    const flakProg = activePassives.find(p => p.id === 'prog_flak');
    const interfaceBonus = interfaceType === 'interfacePlugs' ? 1 : interfaceType === 'trodes' ? -1 : 0;

    if (flakProg) {
      addLog('> FLAK PROGRAM ACTIVE. STATIC INTERFERENCE BLINDING ENEMY SENSORS.');
    }

    iceEntities.forEach(ice => {
      // Allied ICE (converted by Liche) skip stealth checks and player targeting
      if (ice.isAlly) {
        const hostileIce = iceEntities.filter(e => !e.isAlly && e !== ice);
        if (hostileIce.length === 0) return;

        const nearestHostile = hostileIce.reduce((closest, e) => {
          const dist = Math.abs(e.position.x - ice.position.x) + Math.abs(e.position.y - ice.position.y);
          return dist < closest.dist ? { entity: e, dist } : closest;
        }, { entity: null, dist: Infinity });

        if (!nearestHostile.entity) return;

        const target = nearestHostile.entity;
        const targetStr = target.name === 'Pit Bull' ? 3 : target.name === 'Bloodhound' ? 4 : 5;
        const isAdjacentToHostile = Math.abs(target.position.x - ice.position.x) + Math.abs(target.position.y - ice.position.y) === 1;

        if (isAdjacentToHostile) {
          const allyRoll = Math.floor(Math.random() * 10) + 1;
          const hostRoll = Math.floor(Math.random() * 10) + 1;
          const allyStr = ice.name === 'Pit Bull' ? 3 : ice.name === 'Bloodhound' ? 4 : 5;
          const attackTotal = allyRoll + allyStr;
          const defenseTotal = hostRoll + targetStr;

          addLog(`> ALLIED ${ice.name.toUpperCase()} ENGAGING HOSTILE ${target.name.toUpperCase()}...`);
          addLog(`> ATTACK: D10(${allyRoll}) + STR(${allyStr}) = ${attackTotal}`);
          addLog(`> DEFENSE: D10(${hostRoll}) + STR(${targetStr}) = ${defenseTotal}`);

          if (attackTotal > defenseTotal) {
            addLog(`> HOSTILE ${target.name.toUpperCase()} DEREZZED BY ALLIED PROGRAM.`);
            world.remove(target);
          } else {
            addLog(`> ALLIED ${ice.name.toUpperCase()} FAILED TO BREACH.`);
          }
        } else {
          let moveX = ice.position.x;
          let moveY = ice.position.y;
          if (ice.position.x < target.position.x) moveX++;
          else if (ice.position.x > target.position.x) moveX--;

          const isXBlocked = world.with('position').entities.some(e =>
            e.position.x === moveX && e.position.y === ice.position.y &&
            (e.isWall || e.isIce || e.isCPU || e.isPlayer || e.isCodeGate || e.isMemory || e.isSysop)
          );

          if (!isXBlocked && moveX !== ice.position.x) {
            ice.position.x = moveX;
          } else {
            if (ice.position.y < target.position.y) moveY++;
            else if (ice.position.y > target.position.y) moveY--;

            const isYBlocked = world.with('position').entities.some(e =>
              e.position.x === ice.position.x && e.position.y === moveY &&
              (e.isWall || e.isIce || e.isCPU || e.isPlayer || e.isCodeGate || e.isMemory || e.isSysop)
            );

            if (!isYBlocked && moveY !== ice.position.y) {
              ice.position.y = moveY;
            }
          }
        }
        return;
      }

      const iceStr = ice.name === 'Pit Bull' ? 3 : ice.name === 'Bloodhound' ? 4 : 5;

      if (stealthProg) {
        const playerHideRoll = Math.floor(Math.random() * 10) + 1;
        const iceDetectRoll = Math.floor(Math.random() * 10) + 1;

        const hideTotal = playerHideRoll + int + interfaceLvl + stealthProg.strength + combatBonus + interfaceBonus;
        const detectTotal = iceDetectRoll + iceStr + (flakProg ? -2 : 0);

        if (hideTotal > detectTotal) {
          return;
        } else {
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
        const progStr = activeAction ? activeAction.strength : 0;
        const interfaceBonus = interfaceType === 'interfacePlugs' ? 1 : interfaceType === 'trodes' ? -1 : 0;

        const attackTotal = iceRoll + iceStr;
        const defenseTotal = playerRoll + int + interfaceLvl + progStr + combatBonus + interfaceBonus;

        addLog(`> ICE ATTACK: D10(${iceRoll}) + STR(${iceStr}) = ${attackTotal}`);
        addLog(`> DEFENSE: D10(${playerRoll}) + INT(${int}) + INTF(${interfaceLvl}) + PROG(${progStr}) + DECK(+${combatBonus}) = ${defenseTotal}`);

        if (attackTotal > defenseTotal) {
          const damage = Math.floor(Math.random() * 3) + 1;

          const shieldProg = activePassives.find(p => p.type === 'defense' && p.id === 'prog_shield');
          const armorProg = activePassives.find(p => p.type === 'defense' && p.id === 'prog_armor');

          let finalDamage = damage;

          if (shieldProg) {
            addLog(`> SHIELD ACTIVATED. RESOLVING PROTECTION...`);
            const shieldRoll = Math.floor(Math.random() * 10) + 1;
            const iceRoll2 = Math.floor(Math.random() * 10) + 1;
            const shieldTotal = shieldRoll + int + interfaceLvl + shieldProg.strength + combatBonus;
            const iceShieldTotal = iceRoll2 + iceStr;

            addLog(`> SHIELD: D10(${shieldRoll}) + INT(${int}) + INTF(${interfaceLvl}) + STR(${shieldProg.strength}) + DECK(+${combatBonus}) = ${shieldTotal}`);
            addLog(`> ICE VS SHIELD: D10(${iceRoll2}) + STR(${iceStr}) = ${iceShieldTotal}`);

            if (shieldTotal >= iceShieldTotal) {
              addLog('> SHIELD ABSORBED THE ATTACK. ZERO DAMAGE TAKEN.');
              sfx.attack();
              setTick((t) => t + 1);
              return;
            } else {
              addLog('> SHIELD FAILED. ATTACK PENETRATES.');
            }
          }

          if (armorProg) {
            addLog(`> ARMOR ACTIVATED. RESOLVING PROTECTION...`);
            const armorRoll = Math.floor(Math.random() * 10) + 1;
            const iceRoll3 = Math.floor(Math.random() * 10) + 1;
            const armorTotal = armorRoll + int + interfaceLvl + armorProg.strength + combatBonus;
            const iceArmorTotal = iceRoll3 + iceStr;

            addLog(`> ARMOR: D10(${armorRoll}) + INT(${int}) + INTF(${interfaceLvl}) + STR(${armorProg.strength}) + DECK(+${combatBonus}) = ${armorTotal}`);
            addLog(`> ICE VS ARMOR: D10(${iceRoll3}) + STR(${iceStr}) = ${iceArmorTotal}`);

            if (armorTotal >= iceArmorTotal) {
              addLog('> ARMOR DEFLECTED THE ATTACK. ZERO DAMAGE TAKEN.');
              sfx.attack();
              setTick((t) => t + 1);
              return;
            } else {
              finalDamage = Math.max(0, damage - 3);
              addLog(`> ARMOR MITIGATED DAMAGE: -3 (${damage} -> ${finalDamage}).`);
            }
          }

          if (flakProg && finalDamage > 0) {
            finalDamage = Math.max(0, finalDamage - 1);
            addLog(`> FLAK INTERFERENCE REDUCED DAMAGE: -1.`);
          }

          addLog(`> CRITICAL: YOU TOOK ${finalDamage} NEURAL DAMAGE FROM ${ice.name.toUpperCase()}!`);
          takeDamage(finalDamage);
          sfx.damage();

          if (ice.name === 'Firestarter') {
            const deckDamage = Math.floor(Math.random() * 15) + 10;
            useCyberdeckStore.getState().damageDeck(deckDamage);
            addLog(`> FIRESTARTER CORRUPTED YOUR DECK FIRMWARE! DECK INTEGRITY -${deckDamage}%.`);
            sfx.error();
          }

          if (ice.name === 'Bloodhound') {
            const traceRoll = Math.floor(Math.random() * 10) + 1;
            const traceTotal = traceRoll + iceStr;
            const currentDefense = useRoutingStore.getState().traceDefense;
            addLog(`> BLOODHOUND ACTIVELY TRACING YOUR SIGNAL...`);
            addLog(`> TRACE: D10(${traceRoll}) + STR(${iceStr}) = ${traceTotal} VS DEFENSE(${currentDefense})`);

            if (traceTotal > currentDefense) {
              addLog(`> TRACE SUCCESSFUL. NETWATCH HAS TRIANGULATED YOUR PHYSICAL IP.`);
              addLog(`> CRITICAL: FORCED CORTICAL DISCONNECT. NETWATCH RAID INITIATED.`);
              sfx.flatline();
              setTimeout(() => {
                const { addTraceRisk } = useRoutingStore.getState();
                addTraceRisk(20);
                onJackOut();
              }, 2000);
            } else {
              addLog(`> TRACE BLOCKED. YOUR SIGNAL ROUTING HELD. (DEF: ${currentDefense})`);
            }
          }

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
          (e.isWall || e.isIce || e.isCPU || e.isPlayer || e.isCodeGate || e.isMemory || e.isSysop)
      );

      if (!isXBlocked && moveX !== ice.position.x) {
        ice.position.x = moveX;
      } else {
        if (ice.position.y < player.position.y) moveY++;
        else if (ice.position.y > player.position.y) moveY--;

        const isYBlocked = world.with('position').entities.some(e =>
            e.position.x === ice.position.x && e.position.y === moveY &&
            (e.isWall || e.isIce || e.isCPU || e.isPlayer || e.isCodeGate || e.isMemory || e.isSysop)
        );

        if (!isYBlocked && moveY !== ice.position.y) {
          ice.position.y = moveY;
        }
      }

      if (isAdjacent()) {
        executeIceAttack();
      }
    });

    // Allied daemons act during enemy turn
    const daemonEntities = world.with('isDaemon').entities;
    const hostileIce = world.with('isIce').entities.filter(e => !e.isAlly);

    daemonEntities.forEach(daemon => {
      if (hostileIce.length === 0) return;

      const nearest = hostileIce.reduce((closest, e) => {
        const dist = Math.abs(e.position.x - daemon.position.x) + Math.abs(e.position.y - daemon.position.y);
        return dist < closest.dist ? { entity: e, dist } : closest;
      }, { entity: null, dist: Infinity });

      if (!nearest.entity) return;

      const isAdjacentToTarget = Math.abs(nearest.entity.position.x - daemon.position.x) + Math.abs(nearest.entity.position.y - daemon.position.y) === 1;

      if (isAdjacentToTarget) {
        const daemonRoll = Math.floor(Math.random() * 10) + 1;
        const iceRoll = Math.floor(Math.random() * 10) + 1;
        const iceStr = nearest.entity.name === 'Pit Bull' ? 3 : nearest.entity.name === 'Bloodhound' ? 4 : 5;

        const attackTotal = daemonRoll + daemon.strength;
        const defenseTotal = iceRoll + iceStr;

        addLog(`> DAEMON ${daemon.name.toUpperCase()} ENGAGING ${nearest.entity.name.toUpperCase()}...`);
        addLog(`> ATTACK: D10(${daemonRoll}) + STR(${daemon.strength}) = ${attackTotal}`);
        addLog(`> DEFENSE: D10(${iceRoll}) + STR(${iceStr}) = ${defenseTotal}`);

        if (attackTotal > defenseTotal) {
          addLog(`> HOSTILE ${nearest.entity.name.toUpperCase()} DEREZZED BY DAEMON.`);
          world.remove(nearest.entity);
        } else {
          daemon.strength--;
          addLog(`> DAEMON ${daemon.name.toUpperCase()} FAILED. STR: ${daemon.strength}/${daemon.maxStrength}.`);

          if (daemon.strength <= 0) {
            addLog(`> DAEMON ${daemon.name.toUpperCase()} DESTROYED.`);
            world.remove(daemon);
          }
        }
      } else {
        let moveX = daemon.position.x;
        let moveY = daemon.position.y;
        if (daemon.position.x < nearest.entity.position.x) moveX++;
        else if (daemon.position.x > nearest.entity.position.x) moveX--;

        const isXBlocked = world.with('position').entities.some(e =>
          e.position.x === moveX && e.position.y === daemon.position.y &&
          (e.isWall || e.isIce || e.isCPU || e.isPlayer || e.isCodeGate || e.isMemory || e.isSysop)
        );

        if (!isXBlocked && moveX !== daemon.position.x) {
          daemon.position.x = moveX;
        } else {
          if (daemon.position.y < nearest.entity.position.y) moveY++;
          else if (daemon.position.y > nearest.entity.position.y) moveY--;

          const isYBlocked = world.with('position').entities.some(e =>
            e.position.x === daemon.position.x && e.position.y === moveY &&
            (e.isWall || e.isIce || e.isCPU || e.isPlayer || e.isCodeGate || e.isMemory || e.isSysop)
          );

          if (!isYBlocked && moveY !== daemon.position.y) {
            daemon.position.y = moveY;
          }
        }
      }
    });

    // Sysop AI: Human operators move toward player and attack with program loadouts
    const sysopEntities = world.with('isSysop').entities;

    sysopEntities.forEach(sysop => {
      // Allied Sysops (converted by Liche) target hostile ICE instead
      if (sysop.isAlly) {
        const hostileIce = world.with('isIce').entities.filter(e => !e.isAlly);
        if (hostileIce.length === 0) return;

        const nearestHostile = hostileIce.reduce((closest, e) => {
          const dist = Math.abs(e.position.x - sysop.position.x) + Math.abs(e.position.y - sysop.position.y);
          return dist < closest.dist ? { entity: e, dist } : closest;
        }, { entity: null, dist: Infinity });

        if (!nearestHostile.entity) return;

        const target = nearestHostile.entity;
        const targetStr = target.name === 'Pit Bull' ? 3 : target.name === 'Bloodhound' ? 4 : 5;
        const isAdjacentToHostile = Math.abs(target.position.x - sysop.position.x) + Math.abs(target.position.y - sysop.position.y) === 1;

        if (isAdjacentToHostile) {
          const bestProg = sysop.programs.length > 0 ? sysop.programs.reduce((best, p) => p.strength > best.strength ? p : best, sysop.programs[0]) : { strength: 0 };
          const allyRoll = Math.floor(Math.random() * 10) + 1;
          const hostRoll = Math.floor(Math.random() * 10) + 1;
          const attackTotal = allyRoll + sysop.int + sysop.interfaceLvl + bestProg.strength + sysop.deckBonus;
          const defenseTotal = hostRoll + targetStr;

          addLog(`> ALLIED SYSOP ENGAGING HOSTILE ${target.name.toUpperCase()}...`);
          addLog(`> ATTACK: D10(${allyRoll}) + INT(${sysop.int}) + INTF(${sysop.interfaceLvl}) + PROG(${bestProg.strength}) + DECK(+${sysop.deckBonus}) = ${attackTotal}`);
          addLog(`> DEFENSE: D10(${hostRoll}) + STR(${targetStr}) = ${defenseTotal}`);

          if (attackTotal > defenseTotal) {
            addLog(`> HOSTILE ${target.name.toUpperCase()} DEREZZED BY ALLIED SYSOP.`);
            world.remove(target);
          } else {
            addLog(`> ALLIED SYSOP FAILED TO BREACH ${target.name.toUpperCase()}.`);
          }
        } else {
          let moveX = sysop.position.x;
          let moveY = sysop.position.y;
          if (sysop.position.x < target.position.x) moveX++;
          else if (sysop.position.x > target.position.x) moveX--;

          const isXBlocked = world.with('position').entities.some(e =>
            e.position.x === moveX && e.position.y === sysop.position.y &&
            (e.isWall || e.isIce || e.isCPU || e.isPlayer || e.isCodeGate || e.isMemory || e.isSysop)
          );

          if (!isXBlocked && moveX !== sysop.position.x) {
            sysop.position.x = moveX;
          } else {
            if (sysop.position.y < target.position.y) moveY++;
            else if (sysop.position.y > target.position.y) moveY--;

            const isYBlocked = world.with('position').entities.some(e =>
              e.position.x === sysop.position.x && e.position.y === moveY &&
              (e.isWall || e.isIce || e.isCPU || e.isPlayer || e.isCodeGate || e.isMemory || e.isSysop)
            );

            if (!isYBlocked && moveY !== sysop.position.y) {
              sysop.position.y = moveY;
            }
          }
        }
        return;
      }

      // Determine nearest hostile target: player, allied ICE, or daemons
      const player = world.with('isPlayer').entities[0];
      const alliedIce = world.with('isIce').entities.filter(e => e.isAlly);
      const daemons = world.with('isDaemon').entities;
      const allHostiles = [];

      if (player) {
        allHostiles.push({ entity: player, dist: Math.abs(player.position.x - sysop.position.x) + Math.abs(player.position.y - sysop.position.y), isPlayer: true });
      }
      alliedIce.forEach(e => {
        allHostiles.push({ entity: e, dist: Math.abs(e.position.x - sysop.position.x) + Math.abs(e.position.y - sysop.position.y), isPlayer: false });
      });
      daemons.forEach(e => {
        allHostiles.push({ entity: e, dist: Math.abs(e.position.x - sysop.position.x) + Math.abs(e.position.y - sysop.position.y), isPlayer: false });
      });

      if (allHostiles.length === 0) return;

      const nearest = allHostiles.reduce((closest, e) => e.dist < closest.dist ? e : closest, allHostiles[0]);
      const isAdjacentToTarget = nearest.dist === 1;

      if (isAdjacentToTarget) {
        if (nearest.isPlayer) {
          const sysopRoll = Math.floor(Math.random() * 10) + 1;
          const playerRoll = Math.floor(Math.random() * 10) + 1;
          const bestProg = sysop.programs.length > 0 ? sysop.programs.reduce((best, p) => p.strength > best.strength ? p : best, sysop.programs[0]) : { strength: 0, name: 'Null' };
          const attackTotal = sysopRoll + sysop.int + sysop.interfaceLvl + bestProg.strength + sysop.deckBonus;
          const { int, interfaceLvl, takeDamage } = useMeatspaceStore.getState();
          const { activePassives, combatBonus } = useCyberdeckStore.getState();
          const activeAction = useCyberdeckStore.getState().activeAction;
          const progStr = activeAction ? activeAction.strength : 0;
          const sysopInterfaceBonus = interfaceType === 'interfacePlugs' ? 1 : interfaceType === 'trodes' ? -1 : 0;
          const defenseTotal = playerRoll + int + interfaceLvl + progStr + combatBonus + sysopInterfaceBonus;

          addLog(`> SYSOP ${sysop.name.toUpperCase()} ATTACKING WITH ${bestProg.name.toUpperCase()}!`);
          addLog(`> SYSOP: D10(${sysopRoll}) + INT(${sysop.int}) + INTF(${sysop.interfaceLvl}) + PROG(${bestProg.strength}) + DECK(+${sysop.deckBonus}) = ${attackTotal}`);
          addLog(`> DEFENSE: D10(${playerRoll}) + INT(${int}) + INTF(${interfaceLvl}) + PROG(${progStr}) + DECK(+${combatBonus}) = ${defenseTotal}`);

          if (attackTotal > defenseTotal) {
            let damage = Math.floor(Math.random() * 3) + 1;
            const shieldProg = activePassives.find(p => p.type === 'defense' && p.id === 'prog_shield');
            const armorProg = activePassives.find(p => p.type === 'defense' && p.id === 'prog_armor');
            const flakProg = activePassives.find(p => p.id === 'prog_flak');
            let finalDamage = damage;

            if (shieldProg) {
              addLog(`> SHIELD ACTIVATED. RESOLVING PROTECTION VS SYSOP...`);
              const shieldRoll = Math.floor(Math.random() * 10) + 1;
              const sysopRoll2 = Math.floor(Math.random() * 10) + 1;
              const shieldTotal = shieldRoll + int + interfaceLvl + shieldProg.strength + combatBonus;
              const sysopShieldTotal = sysopRoll2 + sysop.int + sysop.interfaceLvl + bestProg.strength + sysop.deckBonus;
              addLog(`> SHIELD: D10(${shieldRoll}) + INT(${int}) + INTF(${interfaceLvl}) + STR(${shieldProg.strength}) + DECK(+${combatBonus}) = ${shieldTotal}`);
              addLog(`> SYSOP VS SHIELD: D10(${sysopRoll2}) + INT(${sysop.int}) + INTF(${sysop.interfaceLvl}) + PROG(${bestProg.strength}) + DECK(+${sysop.deckBonus}) = ${sysopShieldTotal}`);
              if (shieldTotal >= sysopShieldTotal) {
                addLog('> SHIELD ABSORBED THE SYSOP ATTACK. ZERO DAMAGE.');
                sfx.attack();
                setTick((t) => t + 1);
                return;
              } else {
                addLog('> SHIELD OVERLOADED BY SYSOP PROGRAM.');
              }
            }

            if (armorProg) {
              addLog(`> ARMOR ACTIVATED. RESOLVING PROTECTION VS SYSOP...`);
              const armorRoll = Math.floor(Math.random() * 10) + 1;
              const sysopRoll3 = Math.floor(Math.random() * 10) + 1;
              const armorTotal = armorRoll + int + interfaceLvl + armorProg.strength + combatBonus;
              const sysopArmorTotal = sysopRoll3 + sysop.int + sysop.interfaceLvl + bestProg.strength + sysop.deckBonus;
              addLog(`> ARMOR: D10(${armorRoll}) + INT(${int}) + INTF(${interfaceLvl}) + STR(${armorProg.strength}) + DECK(+${combatBonus}) = ${armorTotal}`);
              addLog(`> SYSOP VS ARMOR: D10(${sysopRoll3}) + INT(${sysop.int}) + INTF(${sysop.interfaceLvl}) + PROG(${bestProg.strength}) + DECK(+${sysop.deckBonus}) = ${sysopArmorTotal}`);
              if (armorTotal >= sysopArmorTotal) {
                addLog('> ARMOR DEFLECTED THE SYSOP ATTACK. ZERO DAMAGE.');
                sfx.attack();
                setTick((t) => t + 1);
                return;
              } else {
                finalDamage = Math.max(0, damage - 3);
                addLog(`> ARMOR MITIGATED SYSOP DAMAGE: -3 (${damage} -> ${finalDamage}).`);
              }
            }

            if (flakProg && finalDamage > 0) {
              finalDamage = Math.max(0, finalDamage - 1);
              addLog(`> FLAK INTERFERENCE REDUCED SYSOP DAMAGE: -1.`);
            }

            addLog(`> CRITICAL: YOU TOOK ${finalDamage} NEURAL DAMAGE FROM ${sysop.name.toUpperCase()}!`);
            takeDamage(finalDamage);
            sfx.damage();

            if (useMeatspaceStore.getState().health === 0) {
              addLog(`> FLATLINE DETECTED. EMERGENCY CORTICAL DISCONNECT TRIGGERED.`);
              sfx.flatline();
              setTimeout(() => onJackOut(), 1500);
            }
          } else {
            addLog("> EVASION SUCCESSFUL. SYSOP ATTACK BLOCKED.");
            sfx.attack();
          }
        } else {
          const targetStr = nearest.entity.isDaemon ? nearest.entity.strength : (nearest.entity.name === 'Pit Bull' ? 3 : nearest.entity.name === 'Bloodhound' ? 4 : 5);
          const sysopRoll = Math.floor(Math.random() * 10) + 1;
          const targetRoll = Math.floor(Math.random() * 10) + 1;
          const bestProg = sysop.programs.length > 0 ? sysop.programs.reduce((best, p) => p.strength > best.strength ? p : best, sysop.programs[0]) : { strength: 0 };
          const attackTotal = sysopRoll + sysop.int + sysop.interfaceLvl + bestProg.strength + sysop.deckBonus;
          const defenseTotal = targetRoll + targetStr;

          addLog(`> SYSOP ${sysop.name.toUpperCase()} ENGAGING ALLIED ${nearest.entity.isDaemon ? 'DAEMON' : nearest.entity.name.toUpperCase()}...`);
          addLog(`> SYSOP: D10(${sysopRoll}) + INT(${sysop.int}) + INTF(${sysop.interfaceLvl}) + PROG(${bestProg.strength}) + DECK(+${sysop.deckBonus}) = ${attackTotal}`);
          addLog(`> TARGET DEFENSE: D10(${targetRoll}) + STR(${targetStr}) = ${defenseTotal}`);

          if (attackTotal > defenseTotal) {
            addLog(`> ${nearest.entity.isDaemon ? 'DAEMON' : nearest.entity.name.toUpperCase()} DEREZZED BY SYSOP.`);
            world.remove(nearest.entity);
          } else {
            if (nearest.entity.isDaemon) {
              nearest.entity.strength--;
              addLog(`> DAEMON ${nearest.entity.name.toUpperCase()} DAMAGED BY SYSOP. STR: ${nearest.entity.strength}/${nearest.entity.maxStrength}.`);
              if (nearest.entity.strength <= 0) {
                addLog(`> DAEMON ${nearest.entity.name.toUpperCase()} DESTROYED.`);
                world.remove(nearest.entity);
              }
            } else {
              addLog(`> ALLIED ${nearest.entity.name.toUpperCase()} WITHSTOOD SYSOP ATTACK.`);
            }
          }
        }
      } else {
        let moveX = sysop.position.x;
        let moveY = sysop.position.y;
        if (sysop.position.x < nearest.entity.position.x) moveX++;
        else if (sysop.position.x > nearest.entity.position.x) moveX--;

        const isXBlocked = world.with('position').entities.some(e =>
          e.position.x === moveX && e.position.y === sysop.position.y &&
          (e.isWall || e.isIce || e.isCPU || e.isPlayer || e.isCodeGate || e.isMemory || e.isSysop)
        );

        if (!isXBlocked && moveX !== sysop.position.x) {
          sysop.position.x = moveX;
        } else {
          if (sysop.position.y < nearest.entity.position.y) moveY++;
          else if (sysop.position.y > nearest.entity.position.y) moveY--;

          const isYBlocked = world.with('position').entities.some(e =>
            e.position.x === sysop.position.x && e.position.y === moveY &&
            (e.isWall || e.isIce || e.isCPU || e.isPlayer || e.isCodeGate || e.isMemory || e.isSysop)
          );

          if (!isYBlocked && moveY !== sysop.position.y) {
            sysop.position.y = moveY;
          }
        }

        const newDist = Math.abs(nearest.entity.position.x - sysop.position.x) + Math.abs(nearest.entity.position.y - sysop.position.y);
        if (newDist === 1) {
          if (nearest.isPlayer) {
            const sysopRoll = Math.floor(Math.random() * 10) + 1;
            const playerRoll = Math.floor(Math.random() * 10) + 1;
            const bestProg = sysop.programs.length > 0 ? sysop.programs.reduce((best, p) => p.strength > best.strength ? p : best, sysop.programs[0]) : { strength: 0, name: 'Null' };
            const attackTotal = sysopRoll + sysop.int + sysop.interfaceLvl + bestProg.strength + sysop.deckBonus;
            const { int, interfaceLvl, takeDamage } = useMeatspaceStore.getState();
            const { activePassives, combatBonus } = useCyberdeckStore.getState();
            const activeAction = useCyberdeckStore.getState().activeAction;
            const progStr = activeAction ? activeAction.strength : 0;
            const sysopInterfaceBonus2 = interfaceType === 'interfacePlugs' ? 1 : interfaceType === 'trodes' ? -1 : 0;
            const defenseTotal = playerRoll + int + interfaceLvl + progStr + combatBonus + sysopInterfaceBonus2;

            addLog(`> SYSOP ${sysop.name.toUpperCase()} ATTACKING WITH ${bestProg.name.toUpperCase()}!`);
            addLog(`> SYSOP: D10(${sysopRoll}) + INT(${sysop.int}) + INTF(${sysop.interfaceLvl}) + PROG(${bestProg.strength}) + DECK(+${sysop.deckBonus}) = ${attackTotal}`);
            addLog(`> DEFENSE: D10(${playerRoll}) + INT(${int}) + INTF(${interfaceLvl}) + PROG(${progStr}) + DECK(+${combatBonus})${sysopInterfaceBonus2 !== 0 ? ` + IFACE(${sysopInterfaceBonus2})` : ''} = ${defenseTotal}`);

            if (attackTotal > defenseTotal) {
              let damage = Math.floor(Math.random() * 3) + 1;
              const shieldProg = activePassives.find(p => p.type === 'defense' && p.id === 'prog_shield');
              const armorProg = activePassives.find(p => p.type === 'defense' && p.id === 'prog_armor');
              const flakProg = activePassives.find(p => p.id === 'prog_flak');
              let finalDamage = damage;

              if (shieldProg) {
                addLog(`> SHIELD ACTIVATED. RESOLVING PROTECTION VS SYSOP...`);
                const shieldRoll = Math.floor(Math.random() * 10) + 1;
                const sysopRoll2 = Math.floor(Math.random() * 10) + 1;
                const shieldTotal = shieldRoll + int + interfaceLvl + shieldProg.strength + combatBonus;
                const sysopShieldTotal = sysopRoll2 + sysop.int + sysop.interfaceLvl + bestProg.strength + sysop.deckBonus;
                addLog(`> SHIELD: D10(${shieldRoll}) + INT(${int}) + INTF(${interfaceLvl}) + STR(${shieldProg.strength}) + DECK(+${combatBonus}) = ${shieldTotal}`);
                addLog(`> SYSOP VS SHIELD: D10(${sysopRoll2}) + INT(${sysop.int}) + INTF(${sysop.interfaceLvl}) + PROG(${bestProg.strength}) + DECK(+${sysop.deckBonus}) = ${sysopShieldTotal}`);
                if (shieldTotal >= sysopShieldTotal) {
                  addLog('> SHIELD ABSORBED THE SYSOP ATTACK. ZERO DAMAGE.');
                  sfx.attack();
                  setTick((t) => t + 1);
                  return;
                } else {
                  addLog('> SHIELD OVERLOADED BY SYSOP PROGRAM.');
                }
              }

              if (armorProg) {
                addLog(`> ARMOR ACTIVATED. RESOLVING PROTECTION VS SYSOP...`);
                const armorRoll = Math.floor(Math.random() * 10) + 1;
                const sysopRoll3 = Math.floor(Math.random() * 10) + 1;
                const armorTotal = armorRoll + int + interfaceLvl + armorProg.strength + combatBonus;
                const sysopArmorTotal = sysopRoll3 + sysop.int + sysop.interfaceLvl + bestProg.strength + sysop.deckBonus;
                addLog(`> ARMOR: D10(${armorRoll}) + INT(${int}) + INTF(${interfaceLvl}) + STR(${armorProg.strength}) + DECK(+${combatBonus}) = ${armorTotal}`);
                addLog(`> SYSOP VS ARMOR: D10(${sysopRoll3}) + INT(${sysop.int}) + INTF(${sysop.interfaceLvl}) + PROG(${bestProg.strength}) + DECK(+${sysop.deckBonus}) = ${sysopArmorTotal}`);
                if (armorTotal >= sysopArmorTotal) {
                  addLog('> ARMOR DEFLECTED THE SYSOP ATTACK. ZERO DAMAGE.');
                  sfx.attack();
                  setTick((t) => t + 1);
                  return;
                } else {
                  finalDamage = Math.max(0, damage - 3);
                  addLog(`> ARMOR MITIGATED SYSOP DAMAGE: -3 (${damage} -> ${finalDamage}).`);
                }
              }

              if (flakProg && finalDamage > 0) {
                finalDamage = Math.max(0, finalDamage - 1);
                addLog(`> FLAK INTERFERENCE REDUCED SYSOP DAMAGE: -1.`);
              }

              addLog(`> CRITICAL: YOU TOOK ${finalDamage} NEURAL DAMAGE FROM ${sysop.name.toUpperCase()}!`);
              takeDamage(finalDamage);
              sfx.damage();

              if (useMeatspaceStore.getState().health === 0) {
                addLog(`> FLATLINE DETECTED. EMERGENCY CORTICAL DISCONNECT TRIGGERED.`);
                sfx.flatline();
                setTimeout(() => onJackOut(), 1500);
              }
            } else {
              addLog("> EVASION SUCCESSFUL. SYSOP ATTACK BLOCKED.");
              sfx.attack();
            }
          } else {
            const targetStr = nearest.entity.isDaemon ? nearest.entity.strength : (nearest.entity.name === 'Pit Bull' ? 3 : nearest.entity.name === 'Bloodhound' ? 4 : 5);
            const sysopRoll = Math.floor(Math.random() * 10) + 1;
            const targetRoll = Math.floor(Math.random() * 10) + 1;
            const bestProg = sysop.programs.length > 0 ? sysop.programs.reduce((best, p) => p.strength > best.strength ? p : best, sysop.programs[0]) : { strength: 0 };
            const attackTotal = sysopRoll + sysop.int + sysop.interfaceLvl + bestProg.strength + sysop.deckBonus;
            const defenseTotal = targetRoll + targetStr;

            addLog(`> SYSOP ${sysop.name.toUpperCase()} ENGAGING ALLIED ${nearest.entity.isDaemon ? 'DAEMON' : nearest.entity.name.toUpperCase()}...`);
            addLog(`> SYSOP: D10(${sysopRoll}) + INT(${sysop.int}) + INTF(${sysop.interfaceLvl}) + PROG(${bestProg.strength}) + DECK(+${sysop.deckBonus}) = ${attackTotal}`);
            addLog(`> TARGET DEFENSE: D10(${targetRoll}) + STR(${targetStr}) = ${defenseTotal}`);

            if (attackTotal > defenseTotal) {
              addLog(`> ${nearest.entity.isDaemon ? 'DAEMON' : nearest.entity.name.toUpperCase()} DEREZZED BY SYSOP.`);
              world.remove(nearest.entity);
            } else {
              if (nearest.entity.isDaemon) {
                nearest.entity.strength--;
                addLog(`> DAEMON ${nearest.entity.name.toUpperCase()} DAMAGED BY SYSOP. STR: ${nearest.entity.strength}/${nearest.entity.maxStrength}.`);
                if (nearest.entity.strength <= 0) {
                  addLog(`> DAEMON ${nearest.entity.name.toUpperCase()} DESTROYED.`);
                  world.remove(nearest.entity);
                }
              } else {
                addLog(`> ALLIED ${nearest.entity.name.toUpperCase()} WITHSTOOD SYSOP ATTACK.`);
              }
            }
          }
        }
      }
    });

    // Hijacked turrets fire at nearest hostile ICE during enemy turn
    const turretEntities = world.with('isTurret').entities;
    const allHostileIce = world.with('isIce').entities.filter(e => !e.isAlly);

    turretEntities.forEach(turret => {
      if (allHostileIce.length === 0) return;

      const nearest = allHostileIce.reduce((closest, e) => {
        const dist = Math.abs(e.position.x - turret.position.x) + Math.abs(e.position.y - turret.position.y);
        return dist <= turret.range && dist < closest.dist ? { entity: e, dist } : closest;
      }, { entity: null, dist: Infinity });

      if (!nearest.entity) return;

      const turretRoll = Math.floor(Math.random() * 10) + 1;
      const iceRoll = Math.floor(Math.random() * 10) + 1;
      const iceStr = nearest.entity.name === 'Pit Bull' ? 3 : nearest.entity.name === 'Bloodhound' ? 4 : 5;
      const attackTotal = turretRoll + 6;
      const defenseTotal = iceRoll + iceStr;

      addLog(`> TURRET ENGAGING ${nearest.entity.name.toUpperCase()} AT RANGE ${nearest.dist}...`);
      addLog(`> TURRET: D10(${turretRoll}) + STR(6) = ${attackTotal}`);
      addLog(`> TARGET DEFENSE: D10(${iceRoll}) + STR(${iceStr}) = ${defenseTotal}`);

      if (attackTotal > defenseTotal) {
        addLog(`> ${nearest.entity.name.toUpperCase()} DESTROYED BY TURRET FIRE.`);
        world.remove(nearest.entity);
      } else {
        addLog(`> TURRET FIRE MISSED ${nearest.entity.name.toUpperCase()}.`);
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
    const hitSysop = entitiesAtTarget.find((ent) => ent.isSysop);
    const hitCPU = entitiesAtTarget.find((ent) => ent.isCPU);
    const hitController = entitiesAtTarget.find((ent) => ent.isController);
    const hitGenericWall = entitiesAtTarget.find((ent) => ent.isWall && !ent.isCodeGate && !ent.isMemory && !ent.isCPU && !ent.isSysop && !ent.isController);
    const isSolid = entitiesAtTarget.some((ent) => ent.isWall || ent.isIce || ent.isCPU || ent.isSysop || ent.isController);

    const interfaceType = useMeatspaceStore.getState().interfaceType;
    const interfaceBonus = interfaceType === 'interfacePlugs' ? 1 : interfaceType === 'trodes' ? -1 : 0;

    let turnSpent = false;

    if (hitCPU) {
      const { activeAction } = useCyberdeckStore.getState();
      const addLog = useTerminalStore.getState().addLog;

      if (activeAction && activeAction.type === 'anti-system') {
        addLog(`> DEPLOYING ${activeAction.name.toUpperCase()} AGAINST CPU NODE...`);

        const playerRoll = Math.floor(Math.random() * 10) + 1;
        const cpuRoll = Math.floor(Math.random() * 10) + 1;
        const cpuDefense = 4;

        const { int, interfaceLvl } = useMeatspaceStore.getState();
        const attackTotal = playerRoll + int + interfaceLvl + activeAction.strength + combatBonus + interfaceBonus;
        const defenseTotal = cpuRoll + cpuDefense;

        addLog(`> ${activeAction.name.toUpperCase()}: D10(${playerRoll}) + INT(${int}) + INTF(${interfaceLvl}) + PROG(${activeAction.strength}) + DECK(+${combatBonus})${interfaceBonus !== 0 ? ` + IFACE(${interfaceBonus})` : ''} = ${attackTotal}`);
        addLog(`> CPU DEFENSE: D10(${cpuRoll}) + STR(${cpuDefense}) = ${defenseTotal}`);

        if (attackTotal > defenseTotal) {
          sfx.attack();
          addLog("> CPU CRASHED. SYSTEM REBOOTING... ALL ICE PROCESSES FROZEN.");

          const crashDuration = Math.floor(Math.random() * 6) + 1;
          addLog(`> ICE OFFLINE FOR ${crashDuration} TURN${crashDuration > 1 ? 'S' : ''}.`);

          world.remove(hitCPU);

          const { programs } = useCyberdeckStore.getState();
          useCyberdeckStore.setState({
            programs: programs.filter(p => p.id !== activeAction.id),
            usedMu: useCyberdeckStore.getState().usedMu - 1,
            activeAction: null
          });

          addLog("> ENTERING SUBGRID: INTERNAL ARCHITECTURE...");
          generateFort(true);

          turnSpent = true;
          if (useMeatspaceStore.getState().health > 0) {
            for (let i = 0; i < crashDuration - 1; i++) {
              addLog(`> ICE STILL OFFLINE. TURN ${i + 2}/${crashDuration}.`);
            }
            if (crashDuration > 1) {
              addLog("> CPU REBOOT COMPLETE. ICE BACK ONLINE.");
            }
          }
        } else {
          sfx.error();
          addLog("> ATTACK FAILED. CPU DEFENSE ROUTINE DETECTED THE INTRUSION.");
          turnSpent = true;
        }
      } else {
        sfx.error();
        addLog("> WARNING: SOLID ARCHITECTURE DETECTED. ACCESS DENIED.");
        turnSpent = true;
      }
    }

    if (!isSolid && !turnSpent) {
      const { activeAction } = useCyberdeckStore.getState();
      const addLog = useTerminalStore.getState().addLog;

      if (activeAction && activeAction.type === 'daemon') {
        addLog(`> DEPLOYING DAEMON: ${activeAction.name.toUpperCase()}...`);

        world.add({
          position: { x: targetX, y: targetY },
          render: { char: 'D', color: 'text-cyan-400' },
          isDaemon: true,
          isAlly: true,
          name: activeAction.name,
          strength: activeAction.strength,
          maxStrength: activeAction.strength
        });

        addLog(`> DAEMON ONLINE AT (${targetX}, ${targetY}). STR: ${activeAction.strength}.`);

        const { programs } = useCyberdeckStore.getState();
        useCyberdeckStore.setState({
          programs: programs.filter(p => p.id !== activeAction.id),
          usedMu: useCyberdeckStore.getState().usedMu - 1,
          activeAction: null
        });

        turnSpent = true;
      } else {
        player.position.x = targetX;
        player.position.y = targetY;
        sfx.move();
        turnSpent = true;
      }
    }

    if (hitGenericWall) {
      const { activeAction } = useCyberdeckStore.getState();
      const addLog = useTerminalStore.getState().addLog;

      if (activeAction && activeAction.type === 'intrusion') {
        addLog(`> BREACHING DATA WALL WITH ${activeAction.name.toUpperCase()}...`);

        const wallDamage = activeAction.id === 'prog_hammer'
          ? Math.floor(Math.random() * 6) + 2
          : Math.floor(Math.random() * 6) + 1;

        hitGenericWall.wallStr -= wallDamage;

        addLog(`> WALL STR: ${hitGenericWall.wallStr} (-${wallDamage}).`);

        if (activeAction.id === 'prog_hammer') {
          addLog('> ALERT: LOUD INTRUSION. ICE WITHIN 10 SPACES NOTIFIED.');
        }

        if (hitGenericWall.wallStr <= 0) {
          sfx.loot();
          addLog("> DATA WALL BREACHED. PASSAGE CREATED.");
          world.remove(hitGenericWall);
        } else {
          sfx.attack();
          addLog("> WALL INTACT. FURTHER BREACHING REQUIRED.");
        }
        turnSpent = true;
      } else {
        sfx.error();
        addLog("> WARNING: SOLID ARCHITECTURE DETECTED. EQUIP AN INTRUSION PROGRAM TO BREACH.");
        turnSpent = true;
      }
    }

    if (hitCodeGate) {
      const { activeAction } = useCyberdeckStore.getState();
      const addLog = useTerminalStore.getState().addLog;

      if (!activeAction) {
        sfx.error();
        addLog("> CODE GATE DETECTED. EQUIP A UTILITY PROGRAM TO BYPASS.");
        turnSpent = true;
      } else if (activeAction.type === 'utility') {
        sfx.loot();
        addLog(`> EXECUTING ${activeAction.name.toUpperCase()}...`);
        world.remove(hitCodeGate);
        addLog("> DECRYPT SUCCESSFUL. CODE GATE OPENED.");
        turnSpent = true;
      } else {
        sfx.error();
        addLog(`> ERROR: ${activeAction.name.toUpperCase()} IS NOT A DECRYPTION UTILITY.`);
        turnSpent = true;
      }
    }

    if (hitMemory) {
      const { activeAction, combatBonus } = useCyberdeckStore.getState();
      const addLog = useTerminalStore.getState().addLog;

      if (activeAction && activeAction.type === 'anti-system') {
        addLog(`> DEPLOYING ${activeAction.name.toUpperCase()} AGAINST MEMORY NODE...`);

        const playerRoll = Math.floor(Math.random() * 10) + 1;
        const memRoll = Math.floor(Math.random() * 10) + 1;
        const memDefense = 3;

        const { int, interfaceLvl } = useMeatspaceStore.getState();
        const attackTotal = playerRoll + int + interfaceLvl + activeAction.strength + combatBonus + interfaceBonus;
        const defenseTotal = memRoll + memDefense;

        addLog(`> ${activeAction.name.toUpperCase()}: D10(${playerRoll}) + INT(${int}) + INTF(${interfaceLvl}) + PROG(${activeAction.strength}) + DECK(+${combatBonus})${interfaceBonus !== 0 ? ` + IFACE(${interfaceBonus})` : ''} = ${attackTotal}`);
        addLog(`> MEMORY DEFENSE: D10(${memRoll}) + STR(${memDefense}) = ${defenseTotal}`);

        if (attackTotal > defenseTotal) {
          sfx.attack();

          const missionStore = useMissionStore.getState();
          if (missionStore.activeJob && !missionStore.payloadSecured && useRoutingStore.getState().currentLdl === missionStore.activeJob.targetLdl) {
            addLog("> MEMORY NODE DESTROYED. MISSION PAYLOAD IRRECOVERABLY LOST.");
            missionStore.failPayload();
          } else {
            addLog("> VIRAL 15 DEPLOYED. DATA PURGED. NO PAYLOAD RECOVERED.");
          }

          hitMemory.render.color = 'text-gray-700';
          hitMemory.isMemory = false;
          hitMemory.isWall = false;

          const { programs } = useCyberdeckStore.getState();
          useCyberdeckStore.setState({
            programs: programs.filter(p => p.id !== activeAction.id),
            usedMu: useCyberdeckStore.getState().usedMu - 1,
            activeAction: null
          });

          turnSpent = true;
        } else {
          sfx.error();
          addLog("> ATTACK FAILED. MEMORY NODE DEFLECTED THE VIRUS.");
          turnSpent = true;
        }
      } else {
        sfx.loot();

        const missionStore = useMissionStore.getState();
        const currentLdl = useRoutingStore.getState().currentLdl;

        if (missionStore.activeJob && !missionStore.payloadSecured && currentLdl === missionStore.activeJob.targetLdl) {
          addLog(`> TARGET IDENTIFIED. DOWNLOADING: ${missionStore.activeJob.title}...`);
          addLog(`> MISSION CRITICAL FILE SECURED. JACK OUT TO CLAIM PAYOUT.`);
          missionStore.securePayload();
        } else {
          const fileType = hitMemory.fileType || 'grey';
          if (fileType === 'grey') {
            addLog("> GREY FILE ACCESSED. DOWNLOADING PAYLOAD...");
            addLog("> ACQUIRED: 500 Eurobucks & Encrypted Corp File.");
            useMeatspaceStore.getState().addFunds(500);
          } else if (fileType === 'black') {
            addLog("> BLACK FILE [CLASSIFIED]. DOWNLOADING...");
            addLog("> ACQUIRED: 1000 Eurobucks & Restricted Corp Data.");
            useMeatspaceStore.getState().addFunds(1000);
          } else {
            addLog("> BBS FILE ACCESSED. DOWNLOADING...");
            addLog("> ACQUIRED: 200 Eurobucks & Trace Scrub Protocol. -3 TRACE RISK.");
            useMeatspaceStore.getState().addFunds(200);
            useRoutingStore.getState().reduceTraceRisk(3);
          }
        }

        hitMemory.render.color = 'text-gray-700';
        hitMemory.isMemory = false;
        hitMemory.isWall = false;
        turnSpent = true;
      }
    }

    if (hitIce) {
      const { activeAction, activePassives, combatBonus } = useCyberdeckStore.getState();
      const addLog = useTerminalStore.getState().addLog;
      const stealthProg = activePassives.find(p => p.type === 'stealth');

      // 1. If Stealth is running, bumping ICE defaults to EVASION.
      if (stealthProg) {
        addLog(`> INVISIBILITY RUNNING... ATTEMPTING EVASION.`);

        const playerRoll = Math.floor(Math.random() * 10) + 1;
        const iceRoll = Math.floor(Math.random() * 10) + 1;
        const iceStr = hitIce.name === 'Pit Bull' ? 3 : hitIce.name === 'Bloodhound' ? 4 : 5;

        const { int, interfaceLvl } = useMeatspaceStore.getState();

        const evasionTotal = playerRoll + int + interfaceLvl + stealthProg.strength + combatBonus + interfaceBonus;
        const detectionTotal = iceRoll + iceStr;

        addLog(`> EVASION: D10(${playerRoll}) + INT(${int}) + INTF(${interfaceLvl}) + PROG(${stealthProg.strength}) + DECK(+${combatBonus}) = ${evasionTotal}`);
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
      }
      // 2. If Stealth is OFF, bumping ICE requires an equipped Action program to attack.
      else if (activeAction && activeAction.type === 'anti-ice') {
        addLog(`> INITIATING COMBAT SEQUENCE WITH ${activeAction.name.toUpperCase()}...`);

        const playerRoll = Math.floor(Math.random() * 10) + 1;
        const iceRoll = Math.floor(Math.random() * 10) + 1;
        const iceStr = hitIce.name === 'Pit Bull' ? 3 : hitIce.name === 'Bloodhound' ? 4 : 5;

        const { int, interfaceLvl } = useMeatspaceStore.getState();

        const attackTotal = playerRoll + int + interfaceLvl + activeAction.strength + combatBonus + interfaceBonus;
        const defenseTotal = iceRoll + iceStr;

        addLog(`> ${activeAction.name.toUpperCase()}: D10(${playerRoll}) + INT(${int}) + INTF(${interfaceLvl}) + PROG(${activeAction.strength}) + DECK(+${combatBonus})${interfaceBonus !== 0 ? ` + IFACE(${interfaceBonus})` : ''} = ${attackTotal}`);
        addLog(`> TARGET DEFENSE: D10(${iceRoll}) + STR(${iceStr}) = ${defenseTotal}`);

        if (attackTotal > defenseTotal) {
          sfx.attack();

          if (activeAction.id === 'prog_brainwipe') {
            const strReduction = Math.floor(Math.random() * 6) + 1;
            const newIceStr = iceStr - strReduction;

            if (newIceStr <= 0) {
              addLog(`> BRAINWIPE DEPLOYED. ICE COGNITION DEGRADED BY ${strReduction} STR.`);
              addLog("> ICE STR REDUCED TO ZERO. ENTITY DEREZZED.");
              world.remove(hitIce);
            } else {
              hitIce.name = newIceStr >= 4 ? 'Hellhound' : newIceStr >= 3 ? 'Pit Bull' : 'Bloodhound';
              hitIce.render.char = hitIce.name === 'Pit Bull' ? 'P' : hitIce.name === 'Hellhound' ? 'H' : 'B';
              addLog(`> BRAINWIPE DEPLOYED. ICE COGNITION DEGRADED BY ${strReduction} STR. NOW STR:${newIceStr}.`);
            }
          } else if (activeAction.id === 'prog_liche') {
            hitIce.isAlly = true;
            hitIce.render.color = 'text-cyan-400';
            addLog("> LICHE DEPLOYED. ICE REPROGRAMMED. HOSTILE ENTITY NOW ALLIED.");
          } else {
            addLog("> BREACH SUCCESSFUL. TARGET DEREZZED.");
            world.remove(hitIce);
          }
        } else {
          sfx.error();
          addLog("> ATTACK FAILED. WARNING: ICE COUNTER-TRACE DETECTED.");
        }
        turnSpent = true;
      } else {
        // If neither Stealth is running, nor a weapon equipped
        sfx.error();
        addLog(`> ERROR: NO OFFENSIVE PROGRAM EQUIPPED AND STEALTH OFFLINE. TARGETING FAILED.`);
        turnSpent = true;
      }
    }

    if (hitSysop) {
      const { activeAction, activePassives, combatBonus } = useCyberdeckStore.getState();
      const addLog = useTerminalStore.getState().addLog;

      if (hitSysop.isRogueAI) {
        addLog(`> WARNING: ${hitSysop.name.toUpperCase()} IS A ROGUE AI. STANDARD PROGRAMS INEFFECTIVE.`);
        if (activeAction && (activeAction.type === 'anti-ice' || activeAction.type === 'anti-system')) {
          addLog(`> ${activeAction.name.toUpperCase()} HAS NO EFFECT ON TRANSCENDENT ENTITIES.`);
          sfx.error();
          addLog("> REQUIRES PUZZLE-LIKE DIALOGUE OR SYSTEM-CRASHING LOGIC TO DEFEAT.");
        } else {
          sfx.error();
          addLog("> ERROR: NO ANTI-SYSTEM PROGRAM EQUIPPED. ROGUE AI CANNOT BE HARMED BY CONVENTIONAL MEANS.");
        }
        turnSpent = true;
      } else if (activeAction && (activeAction.type === 'anti-ice' || activeAction.type === 'anti-system')) {
        addLog(`> INITIATING COMBAT SEQUENCE WITH ${activeAction.name.toUpperCase()} AGAINST SYSOP...`);

        const playerRoll = Math.floor(Math.random() * 10) + 1;
        const sysopRoll = Math.floor(Math.random() * 10) + 1;
        const sysopDefense = sysopRoll + hitSysop.int + hitSysop.interfaceLvl + hitSysop.deckBonus;

        const { int, interfaceLvl } = useMeatspaceStore.getState();
        const attackTotal = playerRoll + int + interfaceLvl + activeAction.strength + combatBonus + interfaceBonus;

        addLog(`> ${activeAction.name.toUpperCase()}: D10(${playerRoll}) + INT(${int}) + INTF(${interfaceLvl}) + PROG(${activeAction.strength}) + DECK(+${combatBonus})${interfaceBonus !== 0 ? ` + IFACE(${interfaceBonus})` : ''} = ${attackTotal}`);
        addLog(`> SYSOP DEFENSE: D10(${sysopRoll}) + INT(${hitSysop.int}) + INTF(${hitSysop.interfaceLvl}) + DECK(+${hitSysop.deckBonus}) = ${sysopDefense}`);

        if (attackTotal > sysopDefense) {
          sfx.attack();

          if (activeAction.id === 'prog_brainwipe') {
            const strReduction = Math.floor(Math.random() * 6) + 1;
            hitSysop.int -= strReduction;
            if (hitSysop.int <= 0) {
              addLog(`> BRAINWIPE DEPLOYED. SYSOP COGNITION DEGRADED BY ${strReduction}. NEURAL FLATLINE.`);
              world.remove(hitSysop);
            } else {
              addLog(`> BRAINWIPE DEPLOYED. SYSOP INT DEGRADED BY ${strReduction}. NOW INT:${hitSysop.int}.`);
            }
          } else if (activeAction.id === 'prog_liche') {
            hitSysop.isAlly = true;
            hitSysop.render.color = 'text-cyan-400';
            addLog("> LICHE DEPLOYED. SYSOP REPROGRAMMED. HOSTILE OPERATOR NOW ALLIED.");
          } else {
            addLog("> BREACH SUCCESSFUL. SYSOP DISCONNECTED FROM NETWORK.");
            world.remove(hitSysop);
          }
        } else {
          sfx.error();
          addLog("> ATTACK FAILED. SYSOP COUNTER-INTRUSION ROUTINE DEFLECTED THE PROGRAM.");
        }
        turnSpent = true;
      } else {
        sfx.error();
        addLog(`> ERROR: NO OFFENSIVE PROGRAM EQUIPPED. CANNOT TARGET HUMAN OPERATOR.`);
        turnSpent = true;
      }
    }

    if (hitController && !turnSpent) {
      const addLog = useTerminalStore.getState().addLog;
      const typeLabel = hitController.controllerType === 'cameras' ? 'CAMERA GRID' : hitController.controllerType === 'blastDoors' ? 'BLAST DOOR' : 'TURRET ARRAY';
      addLog(`> CONTROLLER NODE DETECTED: ${typeLabel} (DEF: ${hitController.defense}).`);
      setControllerMenu({
        position: { x: targetX, y: targetY },
        entity: hitController,
        type: hitController.controllerType,
        defense: hitController.defense
      });
      turnSpent = true;
    }

    if (turnSpent) {
      const newTurns = turnCount + 1;
      setTurnCount(newTurns);

      const missionStore = useMissionStore.getState();
      if (missionStore.activeJob && missionStore.activeJob.turnLimit) {
        const addLog = useTerminalStore.getState().addLog;
        const turnsLeft = missionStore.activeJob.turnLimit - newTurns;
        if (turnsLeft <= 3 && turnsLeft > 0) {
          addLog(`> WARNING: HEIST TIMER CRITICAL — ${turnsLeft} TURN${turnsLeft > 1 ? 'S' : ''} REMAINING.`);
        }
        if (turnsLeft <= 0) {
          sfx.flatline();
          addLog('> HEIST CONTRACT FAILED. STRIKE TEAM EXTRACTED UNDER FIRE.');
          missionStore.failPayload();
        }
      }

      const coprocessors = useCyberdeckStore.getState().coprocessors;
      const interfaceType = useMeatspaceStore.getState().interfaceType;
      const isTrodes = interfaceType === 'trodes';

      if (pendingAction === null && coprocessors > 0) {
        const addLog = useTerminalStore.getState().addLog;
        addLog(`> COPROCESSOR ENGAGED. SECOND ACTION CYCLE AVAILABLE.`);
        setPendingAction(coprocessors);
      } else if (pendingAction !== null) {
        const remaining = pendingAction - 1;
        if (remaining > 0) {
          const addLog = useTerminalStore.getState().addLog;
          addLog(`> COPROCESSOR: ${remaining} EXTRA ACTION${remaining > 1 ? 'S' : ''} REMAINING.`);
          setPendingAction(remaining);
        } else {
          setPendingAction(null);
          if (!isTrodes && useMeatspaceStore.getState().health > 0) {
            executeEnemyTurn();
          } else if (isTrodes && useMeatspaceStore.getState().health > 0) {
            executeEnemyTurn();
          }
        }
      } else {
        if (!isTrodes && useMeatspaceStore.getState().health > 0) {
          executeEnemyTurn();
        } else if (isTrodes && useMeatspaceStore.getState().health > 0) {
          executeEnemyTurn();
        }
      }
    }

    setTick((t) => t + 1);
  };

  const renderableEntities = world.with('position', 'render');

  return (
      <div className="flex flex-col items-center w-full h-full relative overflow-hidden">
        {theme && (
          <div className="absolute top-2 left-2 z-50 bg-black/80 border border-neon-green/50 px-3 py-1 text-xs font-bold tracking-wider">
            <span className={theme.wallColor}>{theme.name.toUpperCase()} DATAFORT</span>
          </div>
        )}
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
                      className={`grid gap-[1px] border-2 border-neon-green/50 p-1 shadow-[0_0_20px_#00ffcc20] ${theme ? theme.floorColor : 'bg-green-900/20'}`}
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
          <button onClick={() => {
            const sysops = world.with('isSysop').entities.filter(e => !e.isAlly);
            if (sysops.length > 0) {
              const addLog = useTerminalStore.getState().addLog;
              const traceGain = sysops.length * 2;
              useRoutingStore.getState().addTraceRisk(traceGain);
              addLog(`> WARNING: ${sysops.length} SYSOP${sysops.length > 1 ? 'S' : ''} STILL ACTIVE. TRACE PLANT DETECTED. +${traceGain} TRACE.`);
              sfx.damage();
            }
            onJackOut();
          }} className="bg-black border border-red-500 text-red-500 px-4 py-2 hover:bg-red-500 hover:text-black cursor-pointer transition-colors font-bold text-sm sm:text-base shadow-2xl">
            [ EMERGENCY JACK OUT ]
          </button>
        </div>

        {controllerMenu && (() => {
          const typeLabel = controllerMenu.type === 'cameras' ? 'CAMERA GRID' : controllerMenu.type === 'blastDoors' ? 'BLAST DOOR' : 'TURRET ARRAY';
          const handleControllerAction = (action) => {
            const addLog = useTerminalStore.getState().addLog;
            const { activeAction, combatBonus } = useCyberdeckStore.getState();
            const { int, interfaceLvl, interfaceType } = useMeatspaceStore.getState();
            const interfaceBonus = interfaceType === 'interfacePlugs' ? 1 : interfaceType === 'trodes' ? -1 : 0;

            if (action === 'close') {
              setControllerMenu(null);
              return;
            }

            if (action === 'disableCameras') {
              if (!activeAction || activeAction.type !== 'utility') {
                sfx.error();
                addLog('> ERROR: UTILITY PROGRAM REQUIRED TO DISABLE CAMERAS.');
                setControllerMenu(null);
                return;
              }

              const playerRoll = Math.floor(Math.random() * 10) + 1;
              const defenseRoll = Math.floor(Math.random() * 10) + 1;
              const attackTotal = playerRoll + int + interfaceLvl + activeAction.strength + combatBonus + interfaceBonus;
              const defenseTotal = defenseRoll + controllerMenu.defense;

              addLog(`> DISABLING CAMERA GRID...`);
              addLog(`> UTILITY: D10(${playerRoll}) + INT(${int}) + INTF(${interfaceLvl}) + PROG(${activeAction.strength}) + DECK(+${combatBonus})${interfaceBonus !== 0 ? ` + IFACE(${interfaceBonus})` : ''} = ${attackTotal}`);
              addLog(`> DEFENSE: D10(${defenseRoll}) + STR(${controllerMenu.defense}) = ${defenseTotal}`);

              if (attackTotal > defenseTotal) {
                sfx.loot();
                addLog('> CAMERAS DISABLED. ICE DETECTION ROLLS REDUCED BY -3 FOR REMAINDER OF RUN.');
                world.remove(controllerMenu.entity);
              } else {
                sfx.error();
                addLog('> CAMERA GRID REJECTED THE INTRUSION ATTEMPT.');
              }
            } else if (action === 'openBlastDoors') {
              if (!activeAction || activeAction.type !== 'intrusion') {
                sfx.error();
                addLog('> ERROR: INTRUSION PROGRAM REQUIRED TO BREACH BLAST DOORS.');
                setControllerMenu(null);
                return;
              }

              const wallsToRemove = world.with('isWall').entities.filter(e => !e.isCodeGate && !e.isMemory && !e.isCPU && !e.isController).slice(0, 5);
              wallsToRemove.forEach(w => world.remove(w));

              sfx.loot();
              addLog(`> BLAST DOORS BREACHED. ${wallsToRemove.length} DATA WALLS COLLAPSED.`);
              world.remove(controllerMenu.entity);
            } else if (action === 'hijackTurrets') {
              if (!activeAction || activeAction.type !== 'anti-system') {
                sfx.error();
                addLog('> ERROR: ANTI-SYSTEM PROGRAM REQUIRED TO HIJACK TURRET CONTROL.');
                setControllerMenu(null);
                return;
              }

              const playerRoll = Math.floor(Math.random() * 10) + 1;
              const defenseRoll = Math.floor(Math.random() * 10) + 1;
              const attackTotal = playerRoll + int + interfaceLvl + activeAction.strength + combatBonus + interfaceBonus;
              const defenseTotal = defenseRoll + controllerMenu.defense;

              addLog(`> HIJACKING TURRET ARRAY...`);
              addLog(`> ANTI-SYSTEM: D10(${playerRoll}) + INT(${int}) + INTF(${interfaceLvl}) + PROG(${activeAction.strength}) + DECK(+${combatBonus})${interfaceBonus !== 0 ? ` + IFACE(${interfaceBonus})` : ''} = ${attackTotal}`);
              addLog(`> DEFENSE: D10(${defenseRoll}) + STR(${controllerMenu.defense}) = ${defenseTotal}`);

              if (attackTotal > defenseTotal) {
                sfx.loot();
                const turretCount = Math.floor(Math.random() * 2) + 1;
                addLog(`> TURRETS HIJACKED. ${turretCount} AUTOMATED DEFENSE PLATFORMS ONLINE.`);

                for (let i = 0; i < turretCount; i++) {
                  const offset = (i + 1) * 2;
                  const tx = controllerMenu.entity.position.x + (i % 2 === 0 ? offset : 0);
                  const ty = controllerMenu.entity.position.y + (i % 2 === 1 ? offset : 0);
                  const validPos = tx > 0 && tx < 14 && ty > 0 && ty < 14;
                  if (validPos) {
                    world.add({
                      position: { x: tx, y: ty },
                      render: { char: 'T', color: 'text-teal-400' },
                      isTurret: true,
                      isAlly: true,
                      range: 4
                    });
                  }
                }
                world.remove(controllerMenu.entity);
              } else {
                sfx.error();
                addLog('> TURRET FIREWALL REJECTED THE HIJACK ATTEMPT.');
              }
            }

            setControllerMenu(null);
          };

          return (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70">
                <div className="bg-black border-2 border-teal-400 p-6 max-w-sm shadow-[0_0_30px_#2dd4bf40]">
                  <h3 className="text-lg font-bold text-teal-400 mb-2 tracking-widest">CONTROLLER NODE: {typeLabel}</h3>
                  <p className="text-xs opacity-70 mb-4">Select an action to manipulate physical security systems.</p>

                  <div className="flex flex-col gap-2">
                    <button onClick={() => handleControllerAction('disableCameras')} className="bg-black text-blue-400 border border-blue-500 px-4 py-2 hover:bg-blue-500 hover:text-black cursor-pointer transition-colors text-sm font-bold">
                      [ DISABLE CAMERAS (Utility) — ICE Detection -3 ]
                    </button>
                    <button onClick={() => handleControllerAction('openBlastDoors')} className="bg-black text-yellow-400 border border-yellow-500 px-4 py-2 hover:bg-yellow-400 hover:text-black cursor-pointer transition-colors text-sm font-bold">
                      [ OPEN BLAST DOORS (Intrusion) — Remove 5 Walls ]
                    </button>
                    <button onClick={() => handleControllerAction('hijackTurrets')} className="bg-black text-red-400 border border-red-500 px-4 py-2 hover:bg-red-500 hover:text-black cursor-pointer transition-colors text-sm font-bold">
                      [ HIJACK TURRETS (Anti-System) — Spawn Allied Turrets ]
                    </button>
                    <button onClick={() => handleControllerAction('close')} className="bg-black text-gray-500 border border-gray-600 px-4 py-2 hover:bg-gray-700 hover:text-white cursor-pointer transition-colors text-sm font-bold mt-2">
                      [ CANCEL ]
                    </button>
                  </div>
                </div>
              </div>
          );
        })()}
      </div>
  );
}