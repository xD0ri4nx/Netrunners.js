import { setup } from 'xstate';

export const gamePhaseMachine = setup({}).createMachine({
  id: 'gamePhase',
  initial: 'safehouse', 
  states: {
    safehouse: {
      on: { 
        OPEN_NAVIGATOR: { target: 'navigator' },
        OPEN_SHOP: { target: 'shop' } // NEW ROUTE
      }
    },
    shop: {
      on: {
        LEAVE_SHOP: { target: 'safehouse' }
      }
    },
    navigator: {
      on: {
        INITIATE_LINK: { target: 'jacking_in' },
        CANCEL: { target: 'safehouse' }
      }
    },
    jacking_in: {
      on: { 
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