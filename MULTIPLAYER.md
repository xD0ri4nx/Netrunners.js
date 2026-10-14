```markdown
# GridRunner 20XX: Complete Project & DevSecOps Implementation Plan

## Strict Directives
1. NO EMOJIS: Do not use emojis anywhere in source code, comments, UI text, commit messages, or terminal logs.
2. PRESERVE GAME MATH: Do not alter existing 1D10 combat probabilities, MU caps (20 MU max), Speed caps (+5 max), Data Wall limits (+10 max), or Daemon compilation difficulty formulas.
3. CONTINUOUS VERIFICATION: Run `npx tsc --noEmit` after each task to ensure zero TypeScript errors.

---

## Task 1: MIT License & Trademark Sanitization
1. Create a standard `LICENSE` file in the repository root using the MIT License (Year: 2026).
2. Perform a global, case-preserving replacement across all `.ts`, `.tsx`, `.json`, and `.md` files to remove third-party tabletop RPG proper nouns while preserving all mechanics:
   - "Cyberpunk 2020" -> "GridRunner 20XX"
   - "Arasaka" -> "Kurokawa Corp"
   - "Petrochem" -> "SomaChem"
   - "Orbital Air" -> "Aether Orbital"
   - "Netwatch" -> "GridSec"
   - "Bartmoss" / "Rache Bartmoss" -> "Kestrel" / "Vance Kestrel"
   - "Brainware Blowout" -> "Neural Overclock Manual"
   - "Kerenzikov" -> "Synaptic Accelerator"
   - "Sandevistan" -> "Reflex Boost"
   - "Crystal Palace" / "Orbitsville" -> "Apex Orbital Ring"
   - "O'Neills" -> "Lagrange Habitats"
   - "Eurobucks" / "eb" -> "Credits" / "cr"

---

## Task 2: Shared Deterministic TypeScript Contracts
Create `src/shared/multiplayerTypes.ts` with shared types for client and server:

```typescript
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

```

---

## Task 3: Pure Penalty Verification Module

Create `src/shared/lagCalculator.ts` to deterministically calculate signal lag penalties:

```typescript
import { ComputedLagPenalties, LagHardwareState, TargetLocation } from './multiplayerTypes';

const BASE_DISTANCE_PENALTIES: Record<TargetLocation, intf: number number; ref: { }> = {
  EARTH: { ref: 0, intf: 0 },
  GEO_ORBIT: { ref: -1, intf: -1 },
  APEX_RING: { ref: -3, intf: -2 },
  LUNA: { ref: -4, intf: -2 },
  MARS: { ref: -20, intf: -10 },
};

export function calculateAuthoritativeLagPenalties(
  target: TargetLocation,
  hardware: LagHardwareState
): ComputedLagPenalties {
  const isDeepSpace = target !== 'EARTH';

  if (isDeepSpace && !hardware.hasTightbeamMaser && !hardware.completedOrbitalUplink) {
    return {
      refPenalty: 0,
      interfacePenalty: 0,
      canConnect: false,
      warningMessage:
        '> ERROR: ORBITAL UPLINK NODE OR TIGHTBEAM MASER ARRAY REQUIRED FOR OFF-WORLD ROUTING.',
    };
  }

  if (target === 'MARS' && hardware.isAldrinCyclerActive) {
    return {
      refPenalty: 0,
      interfacePenalty: 0,
      canConnect: true,
      warningMessage: '> ALDRIN CYCLER LOCK ESTABLISHED. LIGHT-LAG PENALTIES NEGATED.',
    };
  }

  let refPenalty = BASE_DISTANCE_PENALTIES[target].ref;
  let interfacePenalty = BASE_DISTANCE_PENALTIES[target].intf;

  if (hardware.hasLagSwitch) {
    if (hardware.lagToggleMode === 'space' && isDeepSpace) {
      refPenalty = 0;
      interfacePenalty = 0;
    } else if (hardware.lagToggleMode === 'space' && !isDeepSpace) {
      refPenalty = -4;
      interfacePenalty = -2;
    }
  }

  if (hardware.hasInitiativeBuffer && refPenalty < -2) {
    refPenalty = -2;
  }

  if (hardware.hasInterfaceBuffer && interfacePenalty < -2) {
    interfacePenalty = -2;
  }

  const warningMessage =
    refPenalty < 0 || interfacePenalty < 0
      ? `> WARNING: SEVERE LIGHT-LAG DETECTED (${refPenalty} REF, ${interfacePenalty} INTERFACE). INITIATIVE COMPROMISED.`
      : null;

  return {
    refPenalty,
    interfacePenalty,
    canConnect: true,
    warningMessage,
  };
}

```

---

## Task 4: RAW ICON, Identity Utilities & Daemon Presets

Create `src/shared/daemonCatalog.ts`:

```typescript
import { DaemonPayloadState, IconTier, IdentityUtilityProgram } from './multiplayerTypes';

export const COSMETIC_ICON_TIERS: Record<
  IconTier,
  { name: string; difficulty: number; creditCost: number; description: string }
> = {
  SIMPLE: {
    name: 'Simple ICON',
    difficulty: 1,
    creditCost: 10,
    description: 'Low-resolution glowing geometric shape. Purely cosmetic.',
  },
  FRACTAL: {
    name: 'Complex/Fractal ICON',
    difficulty: 3,
    creditCost: 30,
    description: 'Shifting fractal geometry or stylized 3D model. Purely cosmetic.',
  },
  PHOTOREALISTIC: {
    name: 'Photorealistic ICON',
    difficulty: 4,
    creditCost: 40,
    description: 'Video-quality rendering of a person or object. Purely cosmetic.',
  },
  SUPERREALISTIC: {
    name: 'Superrealistic ICON',
    difficulty: 5,
    creditCost: 50,
    description:
      'Indistinguishable from reality with micro-expressions. Required for Daemon Conversational Ability visual checks.',
  },
};

export const IDENTITY_UTILITY_CATALOG: IdentityUtilityProgram[] = [
  {
    id: 'INVISIBILITY',
    name: 'Invisibility',
    strength: 3,
    muCost: 1,
    creditCost: 300,
    active: false,
  },
  {
    id: 'DISGUISE',
    name: 'Disguise',
    strength: 4,
    muCost: 1,
    creditCost: 400,
    active: false,
  },
  {
    id: 'REPLICATOR',
    name: 'Replicator',
    strength: 4,
    muCost: 1,
    creditCost: 400,
    active: false,
  },
];

export function createCuckooBirdDaemon(ownerId: string, startX = 0, startY = 0): DaemonPayloadState {
  const subprograms: DaemonPayloadState['subprograms'] = [
    'DISGUISE',
    'INTRUSION',
    'DECRYPTION',
    'UTILITY',
  ];
  const baseStrength = 9;
  const operationalStrength = baseStrength - subprograms.length;
  const difficulty = 58;

  return {
    id: `cuckoo-${Date.now()}`,
    name: 'Cuckoo Bird',
    ownerId,
    baseStrength,
    operationalStrength,
    intelligence: 6,
    muFootprint: 7,
    difficulty,
    marketCost: 1450,
    codingHours: difficulty * 6,
    iconTier: 'SIMPLE',
    hasConversationalAbility: false,
    hasDoppelganger: false,
    hasCodeOptimization: false,
    subprograms,
    position: { x: startX, y: startY },
    status: 'ACTIVE',
  };
}

export function createProteusDaemon(ownerId: string, startX = 0, startY = 0): DaemonPayloadState {
  const subprograms: DaemonPayloadState['subprograms'] = [
    'DISGUISE',
    'INVISIBILITY',
    'INTRUSION',
    'DECRYPTION',
    'UTILITY',
    'KILLER_V2',
  ];
  const baseStrength = 16;
  const operationalStrength = baseStrength - subprograms.length;
  const difficulty = 122;

  return {
    id: `proteus-${Date.now()}`,
    name: 'Proteus Protocol',
    ownerId,
    baseStrength,
    operationalStrength,
    intelligence: 6,
    muFootprint: 4,
    difficulty,
    marketCost: 3050,
    codingHours: difficulty * 6,
    iconTier: 'SUPERREALISTIC',
    hasConversationalAbility: true,
    hasDoppelganger: true,
    hasCodeOptimization: true,
    subprograms,
    position: { x: startX, y: startY },
    status: 'ACTIVE',
  };
}

```

---

## Task 5: Zustand Store Updates

1. **Update `meatspaceStore.ts**`:
* Add state: `credits: number`, `hasLagSwitch: boolean`, `lagToggleMode: 'earth' | 'space'`, `equippedIconTier: IconTier`, `ownedIconTiers: IconTier[]`.
* Add actions: `buyNeuralLagSwitch()`, `setLagToggleMode(mode)`, `buyCosmeticIcon(tier)`.


2. **Update `cyberdeckStore.ts**`:
* Add state: `hasTightbeamMaser: boolean`, `hasInitiativeBuffer: boolean`, `hasInterfaceBuffer: boolean`, `ownedUtilities: IdentityUtilityProgram[]`, `compiledDaemons: DaemonPayloadState[]`.
* Add actions: `buyTightbeamMaser()`, `buyInitiativeBuffer()`, `buyInterfaceBuffer()`, `buyIdentityUtility(type)`, `toggleIdentityUtility(type)`, `acquireDaemon(preset, method)`.


3. **Update `routingStore.ts**`:
* Add state: `isAldrinCyclerActive: boolean`, `completedOrbitalUplink: boolean`.
* Add actions: `rollAldrinCycler()`, `evaluateRoutePenalties(target)`.


4. **Create `src/store/multiplayerStore.ts**`:
* Track connection status, current session ID, assigned role, measured round-trip time, and session state.
* Implement actions: `connect(url)`, `createSession(target, role)`, `joinSession(sessionId, role)`, `sendMove(x, y)`, `deployDaemon(daemon)`, `jackOut()`, `disconnect()`.



---

## Task 6: Frontend UI Components (Tailwind CSS v4)

1. **Create `src/components/TechieClinic.tsx**`:
* Display player credit balance and remaining cyberdeck MU.
* Add purchase options for Neural Lag-Switch (600 cr), Tightbeam Maser Array (1,500 cr), Time-Lag Buffer (Initiative) (350 cr), and Time-Lag Buffer (Interface) (350 cr).
* Add catalog for cosmetic ICON tiers and functional identity utilities (Invisibility, Disguise, Replicator).
* Add compilation and purchase buttons for Cuckoo Bird and Proteus daemons.


2. **Update `src/components/MeatspacePanel.tsx**`:
* When `hasLagSwitch === true`, render the toggle between `[ EARTH MODE ]` and `[ DEEP SPACE MODE ]`.
* Display latency penalty status warnings.


3. **Update `src/components/WorldMap.tsx**`:
* Call `rollAldrinCycler()` on mount.
* Render the `[ ALDRIN CYCLER RELAY - 0 LAG ]` node when active.
* Restrict off-world target selection unless `hasTightbeamMaser || completedOrbitalUplink` is true.
* Add multiplayer session creation and join input controls.



---

## Task 7: WebSocket Server & Session Manager

1. Create `server/sessionManager.ts`:
* Store sessions in a `Map<string, ManagedSession>`.
* Implement `createSession`, `validateAndApplyMove`, `deployDaemon`, and `handleJackOut`.
* Enforce server-side anti-cheat: reject unauthorized hardware mutations and non-adjacent grid movement.
* Implement autonomous daemon tick processing (`processAutonomousDaemons`) to resolve obstacles, bypass ICE, absorb strength via Doppelganger, and extract data upon Netrunner jack-out.


2. Create `server/index.ts`:
* Initialize an HTTP server on `process.env.PORT || 8080`.
* Expose `GET /health` returning `{ status: 'ok', activeSessions: number }`.
* Serve static frontend assets from `dist/`.
* Attach a `WebSocketServer` handling incoming JSON messages routed through `SessionManager`.



---

## Task 8: Unit and Verification Tests

Create `tests/multiplayerVerification.test.ts`:

1. Verify lag penalty calculation across all locations, toggle modes, and buffer configurations.
2. Verify Cuckoo Bird compilation values (`diff: 58`, `MU: 7`, `STR: 5`, `cost: 1450`).
3. Verify Proteus Protocol compilation values (`diff: 122`, `MU: 4`, `STR: 10`, `cost: 3050`, `hours: 732`).
4. Verify server anti-cheat rejection for spoofed hardware and illegal grid movement.
5. Verify autonomous daemon tick resolution and Doppelganger stat absorption upon jack-out.

---

## Task 9: Containerization & GitLab CI/CD Pipeline

1. Create `.dockerignore`:

```text
node_modules
dist
.git
.env
*.log

```

2. Create `Dockerfile`:

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
EXPOSE 8080
CMD ["node", "dist/server/index.js"]

```

3. Create `.gitlab-ci.yml` defining `verify`, `secure`, `package`, and `release` stages for container build and deployment to Google Cloud Run.

---

## Task 10: Final Verification Gate

Run and verify:

1. `npx tsc --noEmit` (0 errors).
2. `npm test` (all tests passing).
3. `grep -rnE "Arasaka|Petrochem|Bartmoss|Netwatch|Kerenzikov|Sandevistan" src/ server/` (0 matches).
4. `npm run build` (successful frontend and backend build).

```

```
