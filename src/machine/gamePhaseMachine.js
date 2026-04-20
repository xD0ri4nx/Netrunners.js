// src/machine/gamePhaseMachine.js
import { setup } from 'xstate';

export const gamePhaseMachine = setup({
  // This is where we will eventually define our TTRPG actions, but for now, it's just the phase routing
}).createMachine({
  id: 'gamePhase',
  initial: 'safehouse', // The game always starts here
  states: {
    safehouse: {
      on: {
        JACK_IN: { target: 'jacking_in' }
      }
    },
    jacking_in: {
      on: {
        // Once the cutscene finishes, it sends this signal
        CONNECTION_ESTABLISHED: { target: 'net' } 
      }
    },
    net: {
      on: {
        JACK_OUT: { target: 'safehouse' }
      }
    }
  }
});