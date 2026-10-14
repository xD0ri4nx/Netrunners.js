import { create } from 'zustand';
import type {
  ClientToServerMessage,
  ComputedLagPenalties,
  DaemonPayloadState,
  GridSessionState,
  IconTier,
  IdentityUtilityType,
  LagHardwareState,
  PlayerRole,
  ServerToClientMessage,
  TargetLocation,
} from '../shared/multiplayerTypes';
import { useMeatspaceStore } from './meatspaceStore';
import { useCyberdeckStore } from './cyberdeckStore';
import { useRoutingStore } from './routingStore';

export type ConnectionStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR';

export interface MultiplayerState {
  status: ConnectionStatus;
  sessionId: string | null;
  role: PlayerRole | null;
  rtt: number;
  sessionState: GridSessionState | null;
  penalties: ComputedLagPenalties | null;
  error: string | null;

  connect: (customUrl?: string) => void;
  createSession: (target: TargetLocation, role: PlayerRole) => void;
  joinSession: (sessionId: string, role: PlayerRole) => void;
  sendMove: (x: number, y: number) => void;
  deployDaemon: (daemon: DaemonPayloadState) => void;
  jackOut: () => void;
  disconnect: () => void;
  sendPing: () => void;
}

let activeSocket: WebSocket | null = null;
let pingInterval: ReturnType<typeof setInterval> | null = null;

function resolveRelayUrl(): string {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_RELAY_URL) {
    return import.meta.env.VITE_RELAY_URL;
  }
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    if (window.location.port === '5173') {
      return `${protocol}//${window.location.hostname}:8080`;
    }
    return `${protocol}//${window.location.host}`;
  }
  return 'ws://localhost:8080';
}

export const useMultiplayerStore = create<MultiplayerState>()((set, get) => ({
  status: 'DISCONNECTED',
  sessionId: null,
  role: null,
  rtt: 0,
  sessionState: null,
  penalties: null,
  error: null,

  connect: (customUrl?: string) => {
    if (
      activeSocket &&
      (activeSocket.readyState === WebSocket.OPEN || activeSocket.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    if (activeSocket) {
      activeSocket.close();
      activeSocket = null;
    }
    if (pingInterval) {
      clearInterval(pingInterval);
      pingInterval = null;
    }

    const wsUrl =
      typeof customUrl === 'string' && customUrl.trim().length > 0
        ? customUrl.trim()
        : resolveRelayUrl();

    set({ status: 'CONNECTING', error: null });

    try {
      const ws = new WebSocket(wsUrl);
      activeSocket = ws;

      ws.onopen = () => {
        set({ status: 'CONNECTED', error: null });
        pingInterval = setInterval(() => {
          get().sendPing();
        }, 5000);
      };

      ws.onmessage = (event) => {
        try {
          const msg: ServerToClientMessage = JSON.parse(event.data as string);
          switch (msg.type) {
            case 'SESSION_CREATED':
              set({
                sessionId: msg.payload.sessionId,
                sessionState: msg.payload.state,
                penalties: msg.payload.penalties,
                error: null,
              });
              break;
            case 'SESSION_UPDATED':
              set({ sessionState: msg.payload.state });
              break;
            case 'PENALTY_APPLIED':
              set({ penalties: msg.payload });
              break;
            case 'PONG_CHECK': {
              const now = Date.now();
              const roundTrip = Math.max(0, now - msg.payload.clientTimestamp);
              set({ rtt: roundTrip });
              break;
            }
            case 'ERROR':
              set({ error: `${msg.payload.code}: ${msg.payload.message}` });
              break;
          }
        } catch (err) {
          console.error('[Multiplayer] Failed to parse message', err);
        }
      };

      ws.onerror = () => {
        set({ status: 'ERROR', error: 'WEBSOCKET CONNECTION ERROR' });
      };

      ws.onclose = () => {
        if (pingInterval) {
          clearInterval(pingInterval);
          pingInterval = null;
        }
        activeSocket = null;
        set({ status: 'DISCONNECTED' });
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'FAILED TO INITIALIZE WEBSOCKET';
      set({ status: 'ERROR', error: message });
    }
  },

  sendPing: () => {
    if (!activeSocket || activeSocket.readyState !== WebSocket.OPEN) return;
    const msg: ClientToServerMessage = {
      type: 'PING_CHECK',
      payload: { clientTimestamp: Date.now() },
    };
    activeSocket.send(JSON.stringify(msg));
  },

  createSession: (target: TargetLocation, role: PlayerRole) => {
    const meat = useMeatspaceStore.getState();
    const deck = useCyberdeckStore.getState();
    const routing = useRoutingStore.getState();

    const hardware: LagHardwareState = {
      hasLagSwitch: meat.hasLagSwitch ?? false,
      lagToggleMode: meat.lagToggleMode ?? 'earth',
      hasTightbeamMaser: deck.hasTightbeamMaser ?? false,
      hasInitiativeBuffer: deck.hasInitiativeBuffer ?? false,
      hasInterfaceBuffer: deck.hasInterfaceBuffer ?? false,
      isAldrinCyclerActive: routing.isAldrinCyclerActive ?? false,
      completedOrbitalUplink: routing.completedOrbitalUplink ?? false,
    };

    const iconTier: IconTier = meat.equippedIconTier || 'SIMPLE';
    const activeUtilities: IdentityUtilityType[] = (deck.ownedUtilities || [])
      .filter((u) => u.active)
      .map((u) => u.id);

    set({ role });

    if (!activeSocket || activeSocket.readyState !== WebSocket.OPEN) {
      set({ error: 'CANNOT CREATE SESSION: NOT CONNECTED TO RELAY' });
      return;
    }

    const msg: ClientToServerMessage = {
      type: 'CREATE_SESSION',
      payload: {
        targetLocation: target,
        role,
        hardware,
        iconTier,
        activeUtilities,
      },
    };
    activeSocket.send(JSON.stringify(msg));
  },

  joinSession: (sessionId: string, role: PlayerRole) => {
    set({ sessionId, role });
    if (!activeSocket || activeSocket.readyState !== WebSocket.OPEN) {
      set({ error: 'CANNOT JOIN SESSION: NOT CONNECTED TO RELAY' });
      return;
    }
    const msg: ClientToServerMessage = {
      type: 'JOIN_SESSION',
      payload: { sessionId, role },
    };
    activeSocket.send(JSON.stringify(msg));
  },

  sendMove: (x: number, y: number) => {
    const state = get();
    if (!state.sessionId || !state.role) return;
    if (!activeSocket || activeSocket.readyState !== WebSocket.OPEN) {
      set({ error: 'CANNOT SEND MOVE: NOT CONNECTED' });
      return;
    }

    const meat = useMeatspaceStore.getState();
    const deck = useCyberdeckStore.getState();
    const routing = useRoutingStore.getState();

    const hardwareSnapshot: LagHardwareState = {
      hasLagSwitch: meat.hasLagSwitch ?? false,
      lagToggleMode: meat.lagToggleMode ?? 'earth',
      hasTightbeamMaser: deck.hasTightbeamMaser ?? false,
      hasInitiativeBuffer: deck.hasInitiativeBuffer ?? false,
      hasInterfaceBuffer: deck.hasInterfaceBuffer ?? false,
      isAldrinCyclerActive: routing.isAldrinCyclerActive ?? false,
      completedOrbitalUplink: routing.completedOrbitalUplink ?? false,
    };

    const msg: ClientToServerMessage = {
      type: 'REQUEST_MOVE',
      payload: {
        sessionId: state.sessionId,
        role: state.role,
        x,
        y,
        hardwareSnapshot,
        clientTimestamp: Date.now(),
      },
    };
    activeSocket.send(JSON.stringify(msg));
  },

  deployDaemon: (daemon: DaemonPayloadState) => {
    const state = get();
    if (!state.sessionId) return;
    if (!activeSocket || activeSocket.readyState !== WebSocket.OPEN) {
      set({ error: 'CANNOT DEPLOY DAEMON: NOT CONNECTED' });
      return;
    }
    const msg: ClientToServerMessage = {
      type: 'DEPLOY_DAEMON',
      payload: {
        sessionId: state.sessionId,
        daemon,
      },
    };
    activeSocket.send(JSON.stringify(msg));
  },

  jackOut: () => {
    const state = get();
    if (!state.sessionId || !state.role) return;
    if (activeSocket && activeSocket.readyState === WebSocket.OPEN) {
      const msg: ClientToServerMessage = {
        type: 'JACK_OUT',
        payload: {
          sessionId: state.sessionId,
          role: state.role,
        },
      };
      activeSocket.send(JSON.stringify(msg));
    }
    set({ sessionId: null, sessionState: null, penalties: null });
  },

  disconnect: () => {
    if (pingInterval) {
      clearInterval(pingInterval);
      pingInterval = null;
    }
    if (activeSocket) {
      activeSocket.close();
      activeSocket = null;
    }
    set({
      status: 'DISCONNECTED',
      sessionId: null,
      role: null,
      sessionState: null,
      penalties: null,
      error: null,
    });
  },
}));
