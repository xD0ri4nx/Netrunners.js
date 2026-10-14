import type { WebSocket } from 'ws';
import type {
  ComputedLagPenalties,
  DaemonPayloadState,
  GridNodeState,
  GridSessionState,
  IconTier,
  IdentityUtilityType,
  LagHardwareState,
  PlayerRole,
  ServerToClientMessage,
  TargetLocation,
} from '../src/shared/multiplayerTypes.ts';
import { calculateAuthoritativeLagPenalties } from '../src/shared/lagCalculator.ts';

export interface ManagedSession {
  state: GridSessionState;
  penalties: ComputedLagPenalties;
  hardware: LagHardwareState;
  iconTier: IconTier;
  activeUtilities: IdentityUtilityType[];
  runnerWs?: WebSocket;
  sysopWs?: WebSocket;
}

export interface MoveResult {
  success: boolean;
  code?: string;
  message?: string;
  state?: GridSessionState;
}

export class SessionManager {
  private sessions = new Map<string, ManagedSession>();

  public getActiveSessionCount(): number {
    return this.sessions.size;
  }

  public getSession(sessionId: string): ManagedSession | undefined {
    return this.sessions.get(sessionId);
  }

  public createSession(
    targetLocation: TargetLocation,
    role: PlayerRole,
    hardware: LagHardwareState,
    iconTier: IconTier,
    activeUtilities: IdentityUtilityType[],
    ws?: WebSocket
  ): ManagedSession {
    const sessionId = `grid_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const penalties = calculateAuthoritativeLagPenalties(targetLocation, hardware);

    let runnerStealthBonus = 0;
    if (activeUtilities.includes('INVISIBILITY')) runnerStealthBonus += 3;
    if (activeUtilities.includes('DISGUISE')) runnerStealthBonus += 4;

    const nodes: GridNodeState[] = this.generateInitialGrid();

    const initialState: GridSessionState = {
      sessionId,
      targetLocation,
      turnNumber: 1,
      activeRole: 'NETRUNNER',
      runnerConnected: role === 'NETRUNNER',
      sysopConnected: role === 'SYSOP',
      runnerPosition: { x: 7, y: 14 },
      sysopPosition: { x: 7, y: 0 },
      sysopHostile: true,
      runnerStealthBonus,
      daemons: [],
      nodes,
      terminalLogs: [
        `> SESSION INITIALIZED: ${sessionId.toUpperCase()}`,
        `> TARGET NODE: ${targetLocation} DATAFORT`,
        `> SECURITY PROTOCOL: AUTHORITATIVE SERVER CLOCK ACTIVE`,
      ],
    };

    if (penalties.warningMessage) {
      initialState.terminalLogs.push(penalties.warningMessage);
    }

    const session: ManagedSession = {
      state: initialState,
      penalties,
      hardware: { ...hardware },
      iconTier,
      activeUtilities: [...activeUtilities],
      runnerWs: role === 'NETRUNNER' ? ws : undefined,
      sysopWs: role === 'SYSOP' ? ws : undefined,
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  public joinSession(sessionId: string, role: PlayerRole, ws?: WebSocket): ManagedSession | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    if (role === 'NETRUNNER') {
      session.state.runnerConnected = true;
      session.runnerWs = ws;
      session.state.terminalLogs.push('> NETRUNNER LINK DETECTED ON GRID.');
    } else {
      session.state.sysopConnected = true;
      session.sysopWs = ws;
      session.state.terminalLogs.push('> SYSOP SEC-CONSOLE ENGAGED.');
    }

    this.broadcastSessionUpdate(session);
    return session;
  }

  public validateAndApplyMove(
    sessionId: string,
    role: PlayerRole,
    x: number,
    y: number,
    hardwareSnapshot: LagHardwareState
  ): MoveResult {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return { success: false, code: 'SESSION_NOT_FOUND', message: 'SESSION DOES NOT EXIST' };
    }

    // 1. Anti-Cheat: Reject unauthorized hardware mutations
    const isHardwareValid = this.verifyHardwareIntegrity(session.hardware, hardwareSnapshot);
    if (!isHardwareValid) {
      session.state.terminalLogs.push('> ANTI-CHEAT: UNAUTHORIZED HARDWARE MUTATION DETECTED. REJECTED.');
      return {
        success: false,
        code: 'ANTI_CHEAT_VIOLATION',
        message: 'UNAUTHORIZED HARDWARE MUTATION DETECTED',
      };
    }

    // 2. Anti-Cheat: Reject non-adjacent grid movement
    const currentPos = role === 'NETRUNNER' ? session.state.runnerPosition : session.state.sysopPosition;
    const dx = Math.abs(x - currentPos.x);
    const dy = Math.abs(y - currentPos.y);

    if (dx + dy !== 1) {
      session.state.terminalLogs.push(
        `> ANTI-CHEAT: ILLEGAL NON-ADJACENT GRID MOVEMENT FROM (${currentPos.x},${currentPos.y}) TO (${x},${y}).`
      );
      return {
        success: false,
        code: 'ILLEGAL_MOVEMENT',
        message: 'ILLEGAL NON-ADJACENT GRID MOVEMENT',
      };
    }

    // 3. Check boundaries (15x15 grid)
    if (x < 0 || x >= 15 || y < 0 || y >= 15) {
      return { success: false, code: 'OUT_OF_BOUNDS', message: 'COORDINATES OUT OF BOUNDS' };
    }

    // 4. Check target node obstacles
    const targetNode = session.state.nodes.find((n) => n.x === x && n.y === y);
    if (targetNode && !targetNode.unlocked) {
      if (targetNode.type === 'DATA_WALL' || targetNode.type === 'CODE_GATE') {
        session.state.terminalLogs.push(`> BARRIER ENCOUNTERED AT (${x},${y}): ${targetNode.type}.`);
        targetNode.unlocked = true;
      } else if (targetNode.type === 'BLACK_ICE') {
        session.state.terminalLogs.push(`> BLACK ICE AMBUSH AT (${x},${y})! OPERATIVE DEFENSES ENGAGED.`);
        targetNode.unlocked = true;
      } else if (targetNode.type === 'MEMORY_NODE') {
        targetNode.unlocked = true;
        session.state.terminalLogs.push(`> MEMORY CORE ACCESSED AT (${x},${y}). SECURE DATA STORE FOUND.`);
      }
    }

    // Apply move
    if (role === 'NETRUNNER') {
      session.state.runnerPosition = { x, y };
      session.state.terminalLogs.push(`> NETRUNNER MOVED TO (${x},${y}).`);
    } else {
      session.state.sysopPosition = { x, y };
      session.state.terminalLogs.push(`> SYSOP PATROL MOVED TO (${x},${y}).`);
    }

    session.state.turnNumber += 1;

    // Process autonomous daemons after move
    this.processAutonomousDaemons(session);

    this.broadcastSessionUpdate(session);
    return { success: true, state: session.state };
  }

  public deployDaemon(sessionId: string, daemon: DaemonPayloadState): MoveResult {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return { success: false, code: 'SESSION_NOT_FOUND', message: 'SESSION DOES NOT EXIST' };
    }

    const startPos = { ...session.state.runnerPosition };
    const deployedDaemon: DaemonPayloadState = {
      ...daemon,
      id: daemon.id || `daemon-${Date.now()}`,
      position: startPos,
      status: 'ACTIVE',
    };

    session.state.daemons.push(deployedDaemon);
    session.state.terminalLogs.push(
      `> DAEMON [${deployedDaemon.name.toUpperCase()}] DEPLOYED AT (${startPos.x},${startPos.y}) WITH OP STR ${deployedDaemon.operationalStrength}.`
    );

    this.broadcastSessionUpdate(session);
    return { success: true, state: session.state };
  }

  public processAutonomousDaemons(session: ManagedSession): void {
    for (const daemon of session.state.daemons) {
      if (daemon.status !== 'ACTIVE') continue;

      // 1. Move daemon toward nearest locked node or sysop
      const targets = session.state.nodes.filter((n) => !n.unlocked && n.type !== 'EMPTY');
      const targetPos = targets.length > 0 ? targets[0] : session.state.sysopPosition;

      const dx = targetPos.x - daemon.position.x;
      const dy = targetPos.y - daemon.position.y;

      let nextX = daemon.position.x;
      let nextY = daemon.position.y;

      if (Math.abs(dx) > Math.abs(dy)) {
        nextX += dx > 0 ? 1 : -1;
      } else if (dy !== 0) {
        nextY += dy > 0 ? 1 : -1;
      }

      daemon.position = { x: nextX, y: nextY };

      // 2. Resolve obstacles at destination
      const hitNode = session.state.nodes.find((n) => n.x === nextX && n.y === nextY);
      if (hitNode && !hitNode.unlocked) {
        if (hitNode.type === 'DATA_WALL' || hitNode.type === 'CODE_GATE') {
          hitNode.unlocked = true;
          session.state.terminalLogs.push(
            `> DAEMON ${daemon.name.toUpperCase()} BYPASSED ${hitNode.type} AT (${nextX},${nextY}).`
          );
        } else if (hitNode.type === 'BLACK_ICE') {
          hitNode.unlocked = true;
          session.state.terminalLogs.push(
            `> DAEMON ${daemon.name.toUpperCase()} PURGED BLACK ICE AT (${nextX},${nextY}).`
          );

          // 3. Doppelganger Absorption: absorb strength of defeated ICE/node
          if (daemon.hasDoppelganger) {
            daemon.operationalStrength += 1;
            session.state.terminalLogs.push(
              `> DOPPELGANGER: ${daemon.name.toUpperCase()} ABSORBED BLACK ICE SIGNATURE. OPERATIONAL STR INCREASED TO ${daemon.operationalStrength}.`
            );
          }
        }
      }
    }
  }

  public handleJackOut(sessionId: string, role: PlayerRole): MoveResult {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return { success: false, code: 'SESSION_NOT_FOUND', message: 'SESSION DOES NOT EXIST' };
    }

    if (role === 'NETRUNNER') {
      session.state.runnerConnected = false;
      session.state.terminalLogs.push('> NETRUNNER INITIATED SEVERED CONNECTION // JACK OUT.');

      // Autonomous extraction: daemons extract data upon Netrunner jack-out
      for (const daemon of session.state.daemons) {
        if (daemon.status === 'ACTIVE') {
          daemon.status = 'EXTRACTED';
          session.state.terminalLogs.push(
            `> DAEMON [${daemon.name.toUpperCase()}] COMPLETED PAYLOAD EXTRACTION AND EXFILTRATED GRID.`
          );
        }
      }
    } else {
      session.state.sysopConnected = false;
      session.state.terminalLogs.push('> SYSOP LOGGED OFF SEC-CONSOLE.');
    }

    this.broadcastSessionUpdate(session);
    return { success: true, state: session.state };
  }

  private verifyHardwareIntegrity(original: LagHardwareState, snapshot: LagHardwareState): boolean {
    if (!original.hasLagSwitch && snapshot.hasLagSwitch) return false;
    if (!original.hasTightbeamMaser && snapshot.hasTightbeamMaser) return false;
    if (!original.hasInitiativeBuffer && snapshot.hasInitiativeBuffer) return false;
    if (!original.hasInterfaceBuffer && snapshot.hasInterfaceBuffer) return false;
    if (!original.completedOrbitalUplink && snapshot.completedOrbitalUplink) return false;
    return true;
  }

  private generateInitialGrid(): GridNodeState[] {
    const nodes: GridNodeState[] = [];
    for (let y = 0; y < 15; y++) {
      for (let x = 0; x < 15; x++) {
        let type: GridNodeState['type'] = 'EMPTY';
        let strength = 0;
        let unlocked = true;

        if (y === 4 && (x === 6 || x === 7 || x === 8)) {
          type = 'CODE_GATE';
          strength = 4;
          unlocked = false;
        } else if (y === 3 && (x === 5 || x === 9)) {
          type = 'DATA_WALL';
          strength = 5;
          unlocked = false;
        } else if (y === 2 && (x === 6 || x === 8)) {
          type = 'BLACK_ICE';
          strength = 6;
          unlocked = false;
        } else if (y === 1 && x === 7) {
          type = 'MEMORY_NODE';
          strength = 8;
          unlocked = false;
        }

        nodes.push({ x, y, type, strength, unlocked });
      }
    }
    return nodes;
  }

  private broadcastSessionUpdate(session: ManagedSession): void {
    const msg: ServerToClientMessage = {
      type: 'SESSION_UPDATED',
      payload: { state: session.state },
    };
    const json = JSON.stringify(msg);

    if (session.runnerWs && session.runnerWs.readyState === 1) {
      session.runnerWs.send(json);
    }
    if (session.sysopWs && session.sysopWs.readyState === 1) {
      session.sysopWs.send(json);
    }
  }
}

export const sessionManager = new SessionManager();
