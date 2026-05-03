// src/store/terminalStore.js
import { create } from 'zustand';

const MAX_LOGS = 200;

export const useTerminalStore = create((set) => ({
  logs: [
    "> ZETATECH OS V.2.0.4 RUNNING.",
    "> SYSTEM READY. WAITING FOR INPUT_"
  ],
  
  addLog: (message) => set((state) => ({ 
    logs: [...state.logs, message].slice(-MAX_LOGS) 
  })),

  clearLogs: () => set({ logs: ["> TERMINAL CLEARED."] }),
  
  getLogCount: () => useTerminalStore.getState().logs.length
}));