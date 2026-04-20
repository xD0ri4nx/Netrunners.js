// src/store/terminalStore.js
import { create } from 'zustand';

export const useTerminalStore = create((set) => ({
  // The initial boot sequence logs
  logs: [
    "> ZETATECH OS V.2.0.4 RUNNING.",
    "> SYSTEM READY. WAITING FOR INPUT_"
  ],
  
  // A function any component can call to print to the bottom screen
  addLog: (message) => set((state) => ({ 
    // Keep only the last 50 logs to prevent memory leaks
    logs: [...state.logs, message].slice(-50) 
  })),

  // Optional: A function to clear the terminal if needed
  clearLogs: () => set({ logs: ["> TERMINAL CLEARED."] })
}));