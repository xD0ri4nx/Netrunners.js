// src/store/terminalStore.ts
import { create } from 'zustand';

export interface TerminalState {
  logs: string[];
  addLog: (message: string) => void;
  clearLogs: () => void;
  getLogCount: () => number;
}

const MAX_LOGS = 200;

export const useTerminalStore = create<TerminalState>((set) => ({
  logs: [
    "> Z-TECH OS V.2.0.4 RUNNING.",
    "> SYSTEM READY. WAITING FOR INPUT_"
  ],

  addLog: (message: string) => set((state: TerminalState) => ({
    logs: [...state.logs, message].slice(-MAX_LOGS)
  })),

  clearLogs: () => set({ logs: ["> TERMINAL CLEARED."] }),

  getLogCount: (): number => useTerminalStore.getState().logs.length
}));
