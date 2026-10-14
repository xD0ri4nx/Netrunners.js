export type TargetLocation = 'EARTH' | 'GEO_ORBIT' | 'APEX_RING' | 'LUNA' | 'MARS';

export type LagToggleMode = 'earth' | 'space';

export type IconTier = 'SIMPLE' | 'FRACTAL' | 'PHOTOREALISTIC' | 'SUPERREALISTIC';

export type IdentityUtilityType = 'INVISIBILITY' | 'DISGUISE' | 'REPLICATOR';

export type SubprogramType =
  | 'DISGUISE'
  | 'INVISIBILITY'
  | 'INTRUSION'
  | 'DECRYPTION'
  | 'UTILITY'
  | 'KILLER_V2';

export type PlayerRole = 'NETRUNNER' | 'SYSOP';

export interface LagHardwareState {
  hasLagSwitch: boolean;
  lagToggleMode: LagToggleMode;
  hasTightbeamMaser: boolean;
  hasInitiativeBuffer: boolean;
  hasInterfaceBuffer: boolean;
  isAldrinCyclerActive: boolean;
  completedOrbitalUplink: boolean;
}

export interface ComputedLagPenalties {
  refPenalty: number;
  interfacePenalty: number;
  canConnect: boolean;
  warningMessage: string | null;
}

export interface IdentityUtilityProgram {
  id: IdentityUtilityType;
  name: string;
  strength: number;
  muCost: number;
  creditCost: number;
  active: boolean;
}

export interface DaemonPayloadState {
  id: string;
  name: string;
  ownerId: string;
  baseStrength: number;
  operationalStrength: number;
  intelligence: number;
  muFootprint: number;
  difficulty: number;
  marketCost: number;
  codingHours: number;
  iconTier: IconTier;
  hasConversationalAbility: boolean;
  hasDoppelganger: boolean;
  hasCodeOptimization: boolean;
  subprograms: SubprogramType[];
  position: { x: number; y: number };
  status: 'ACTIVE' | 'FLATLINED' | 'EXTRACTED';
}

export interface GridNodeState {
  x: number;
  y: number;
  type: 'EMPTY' | 'DATA_WALL' | 'CODE_GATE' | 'BLACK_ICE' | 'MEMORY_NODE' | 'SYSOP_AVATAR';
  strength: number;
  unlocked: boolean;
}

export interface GridSessionState {
  sessionId: string;
  targetLocation: TargetLocation;
  turnNumber: number;
  activeRole: PlayerRole;
  runnerConnected: boolean;
  sysopConnected: boolean;
  runnerPosition: { x: number; y: number };
  sysopPosition: { x: number; y: number };
  sysopHostile: boolean;
  runnerStealthBonus: number;
  daemons: DaemonPayloadState[];
  nodes: GridNodeState[];
  terminalLogs: string[];
}

export type ClientToServerMessage =
  | {
      type: 'CREATE_SESSION';
      payload: {
        targetLocation: TargetLocation;
        role: PlayerRole;
        hardware: LagHardwareState;
        iconTier: IconTier;
        activeUtilities: IdentityUtilityType[];
      };
    }
  | { type: 'JOIN_SESSION'; payload: { sessionId: string; role: PlayerRole } }
  | {
      type: 'REQUEST_MOVE';
      payload: {
        sessionId: string;
        role: PlayerRole;
        x: number;
        y: number;
        hardwareSnapshot: LagHardwareState;
        clientTimestamp: number;
      };
    }
  | { type: 'DEPLOY_DAEMON'; payload: { sessionId: string; daemon: DaemonPayloadState } }
  | { type: 'JACK_OUT'; payload: { sessionId: string; role: PlayerRole } }
  | { type: 'PING_CHECK'; payload: { clientTimestamp: number } };

export type ServerToClientMessage =
  | {
      type: 'SESSION_CREATED';
      payload: { sessionId: string; state: GridSessionState; penalties: ComputedLagPenalties };
    }
  | { type: 'SESSION_UPDATED'; payload: { state: GridSessionState } }
  | { type: 'PENALTY_APPLIED'; payload: ComputedLagPenalties }
  | { type: 'PONG_CHECK'; payload: { clientTimestamp: number; serverTimestamp: number } }
  | { type: 'ERROR'; payload: { code: string; message: string } };
