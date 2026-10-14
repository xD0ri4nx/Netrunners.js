import test from 'node:test';
import assert from 'node:assert';
import { calculateAuthoritativeLagPenalties } from '../src/shared/lagCalculator.ts';
import { createCuckooBirdDaemon, createProteusDaemon } from '../src/shared/daemonCatalog.ts';
import { SessionManager } from '../server/sessionManager.ts';
import type { LagHardwareState } from '../src/shared/multiplayerTypes.ts';

const baseHardware: LagHardwareState = {
  hasLagSwitch: false,
  lagToggleMode: 'earth',
  hasTightbeamMaser: false,
  hasInitiativeBuffer: false,
  hasInterfaceBuffer: false,
  isAldrinCyclerActive: false,
  completedOrbitalUplink: false,
};

test('1. Verify lag penalty calculation across all locations, toggle modes, and buffer configurations', () => {
  // Earth with basic hardware
  const earthPenalties = calculateAuthoritativeLagPenalties('EARTH', baseHardware);
  assert.strictEqual(earthPenalties.canConnect, true);
  assert.strictEqual(earthPenalties.refPenalty, 0);
  assert.strictEqual(earthPenalties.interfacePenalty, 0);

  // Off-world without uplink or maser must fail connection
  const noUplinkOrbit = calculateAuthoritativeLagPenalties('GEO_ORBIT', baseHardware);
  assert.strictEqual(noUplinkOrbit.canConnect, false);
  assert.ok(noUplinkOrbit.warningMessage?.includes('TIGHTBEAM MASER ARRAY REQUIRED'));

  // With tightbeam maser, orbital distance penalties apply
  const orbitalHardware: LagHardwareState = { ...baseHardware, hasTightbeamMaser: true };
  const geoPenalties = calculateAuthoritativeLagPenalties('GEO_ORBIT', orbitalHardware);
  assert.strictEqual(geoPenalties.canConnect, true);
  assert.strictEqual(geoPenalties.refPenalty, -1);
  assert.strictEqual(geoPenalties.interfacePenalty, -1);

  const apexPenalties = calculateAuthoritativeLagPenalties('APEX_RING', orbitalHardware);
  assert.strictEqual(apexPenalties.refPenalty, -3);
  assert.strictEqual(apexPenalties.interfacePenalty, -2);

  const lunaPenalties = calculateAuthoritativeLagPenalties('LUNA', orbitalHardware);
  assert.strictEqual(lunaPenalties.refPenalty, -4);
  assert.strictEqual(lunaPenalties.interfacePenalty, -2);

  const marsPenalties = calculateAuthoritativeLagPenalties('MARS', orbitalHardware);
  assert.strictEqual(marsPenalties.refPenalty, -20);
  assert.strictEqual(marsPenalties.interfacePenalty, -10);

  // Aldrin Cycler lock negates Mars penalties
  const cyclerHardware: LagHardwareState = { ...orbitalHardware, isAldrinCyclerActive: true };
  const marsCyclerPenalties = calculateAuthoritativeLagPenalties('MARS', cyclerHardware);
  assert.strictEqual(marsCyclerPenalties.canConnect, true);
  assert.strictEqual(marsCyclerPenalties.refPenalty, 0);
  assert.strictEqual(marsCyclerPenalties.interfacePenalty, 0);
  assert.ok(marsCyclerPenalties.warningMessage?.includes('ALDRIN CYCLER LOCK ESTABLISHED'));

  // Lag switch space mode in deep space negates penalties
  const lagSwitchSpaceHardware: LagHardwareState = {
    ...orbitalHardware,
    hasLagSwitch: true,
    lagToggleMode: 'space',
  };
  const lunaLagSwitch = calculateAuthoritativeLagPenalties('LUNA', lagSwitchSpaceHardware);
  assert.strictEqual(lunaLagSwitch.refPenalty, 0);
  assert.strictEqual(lunaLagSwitch.interfacePenalty, 0);

  // Lag switch space mode on Earth induces artificial penalties
  const earthLagSwitchMismatch = calculateAuthoritativeLagPenalties('EARTH', lagSwitchSpaceHardware);
  assert.strictEqual(earthLagSwitchMismatch.refPenalty, -4);
  assert.strictEqual(earthLagSwitchMismatch.interfacePenalty, -2);

  // Initiative and Interface buffers cap penalties at -2
  const bufferedHardware: LagHardwareState = {
    ...orbitalHardware,
    hasInitiativeBuffer: true,
    hasInterfaceBuffer: true,
  };
  const marsBuffered = calculateAuthoritativeLagPenalties('MARS', bufferedHardware);
  assert.strictEqual(marsBuffered.refPenalty, -2);
  assert.strictEqual(marsBuffered.interfacePenalty, -2);
});

test('2. Verify Cuckoo Bird compilation values (diff: 58, MU: 7, STR: 5, cost: 1450)', () => {
  const daemon = createCuckooBirdDaemon('test-owner');
  assert.strictEqual(daemon.name, 'Cuckoo Bird');
  assert.strictEqual(daemon.difficulty, 58);
  assert.strictEqual(daemon.muFootprint, 7);
  assert.strictEqual(daemon.baseStrength, 9);
  assert.strictEqual(daemon.operationalStrength, 5); // 9 - 4 subprograms
  assert.strictEqual(daemon.marketCost, 1450);
  assert.strictEqual(daemon.intelligence, 6);
  assert.deepStrictEqual(daemon.subprograms, ['DISGUISE', 'INTRUSION', 'DECRYPTION', 'UTILITY']);
});

test('3. Verify Proteus Protocol compilation values (diff: 122, MU: 4, STR: 10, cost: 3050, hours: 732)', () => {
  const daemon = createProteusDaemon('test-owner');
  assert.strictEqual(daemon.name, 'Proteus Protocol');
  assert.strictEqual(daemon.difficulty, 122);
  assert.strictEqual(daemon.muFootprint, 4); // code optimization
  assert.strictEqual(daemon.baseStrength, 16);
  assert.strictEqual(daemon.operationalStrength, 10); // 16 - 6 subprograms
  assert.strictEqual(daemon.marketCost, 3050);
  assert.strictEqual(daemon.codingHours, 732); // 122 * 6
  assert.strictEqual(daemon.hasConversationalAbility, true);
  assert.strictEqual(daemon.hasDoppelganger, true);
  assert.strictEqual(daemon.hasCodeOptimization, true);
});

test('4. Verify server anti-cheat rejection for spoofed hardware and illegal grid movement', () => {
  const manager = new SessionManager();
  const session = manager.createSession('EARTH', 'NETRUNNER', baseHardware, 'SIMPLE', []);
  const sessionId = session.state.sessionId;

  // 1. Spoofed hardware snapshot: claims hasTightbeamMaser when session didn't have it
  const spoofedHardware: LagHardwareState = { ...baseHardware, hasTightbeamMaser: true };
  const cheatMove = manager.validateAndApplyMove(sessionId, 'NETRUNNER', 7, 13, spoofedHardware);
  assert.strictEqual(cheatMove.success, false);
  assert.strictEqual(cheatMove.code, 'ANTI_CHEAT_VIOLATION');

  // 2. Illegal non-adjacent movement: attempting to jump 2 tiles (from {7,14} to {7,12})
  const illegalMove = manager.validateAndApplyMove(sessionId, 'NETRUNNER', 7, 12, baseHardware);
  assert.strictEqual(illegalMove.success, false);
  assert.strictEqual(illegalMove.code, 'ILLEGAL_MOVEMENT');

  // 3. Legal single-step adjacent movement (from {7,14} to {7,13})
  const validMove = manager.validateAndApplyMove(sessionId, 'NETRUNNER', 7, 13, baseHardware);
  assert.strictEqual(validMove.success, true);
  assert.strictEqual(session.state.runnerPosition.x, 7);
  assert.strictEqual(session.state.runnerPosition.y, 13);
  assert.strictEqual(session.state.turnNumber, 2);
});

test('5. Verify autonomous daemon tick resolution and Doppelganger stat absorption upon jack-out', () => {
  const manager = new SessionManager();
  const session = manager.createSession('EARTH', 'NETRUNNER', baseHardware, 'SUPERREALISTIC', []);
  const sessionId = session.state.sessionId;

  // Deploy Proteus daemon
  const proteus = createProteusDaemon('netrunner-1');
  assert.strictEqual(proteus.operationalStrength, 10);
  manager.deployDaemon(sessionId, proteus);

  // Set daemon next to a BLACK_ICE node to test combat resolution and Doppelganger absorption
  const deployedDaemon = session.state.daemons[0];
  deployedDaemon.position = { x: 6, y: 3 }; // Target black ice is at { x: 6, y: 2 }

  // Process autonomous daemon tick
  manager.processAutonomousDaemons(session);

  // Daemon moved to {6, 2}, destroyed Black ICE, and absorbed strength via Doppelganger
  assert.strictEqual(deployedDaemon.position.x, 6);
  assert.strictEqual(deployedDaemon.position.y, 2);
  assert.strictEqual(deployedDaemon.operationalStrength, 11); // 10 + 1 absorption

  // Netrunner Jacks out
  const jackOutRes = manager.handleJackOut(sessionId, 'NETRUNNER');
  assert.strictEqual(jackOutRes.success, true);
  assert.strictEqual(session.state.runnerConnected, false);
  // Daemon status updated to EXTRACTED upon Netrunner jack-out
  assert.strictEqual(deployedDaemon.status, 'EXTRACTED');
});
