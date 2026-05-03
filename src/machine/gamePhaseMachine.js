import { setup } from 'xstate';

export const gamePhaseMachine = setup({}).createMachine({
  id: 'gamePhase',
  initial: 'safehouse',
  states: {
    safehouse: {
      on: {
        OPEN_NAVIGATOR: { target: 'navigator' },
        OPEN_SHOP: { target: 'shop' },
        OPEN_JOBS: { target: 'jobs' },
        OPEN_REPAIR: { target: 'repair' },
        TRIGGER_RAID: { target: 'raid' }
      }
    },
    raid: {
      on: { SURVIVED_RAID: { target: 'safehouse' } }
    },
    shop: {
      on: { LEAVE_SHOP: { target: 'safehouse' } }
    },
    jobs: {
      on: { LEAVE_JOBS: { target: 'safehouse' } }
    },
    repair: {
      on: { LEAVE_REPAIR: { target: 'safehouse' } }
    },
    navigator: {
      on: {
        RIVAL_ENCOUNTER: { target: 'rival_encounter' },
        INITIATE_LINK: { target: 'jacking_in' },
        CANCEL: { target: 'safehouse' }
      }
    },
    rival_encounter: {
      on: {
        FIGHT_RIVAL: { target: 'jacking_in' },
        FLEE_RIVAL: { target: 'jacking_in' },
        PAY_RIVAL: { target: 'jacking_in' },
        LOSE_TO_RIVAL: { target: 'safehouse' }
      }
    },
    netwatch_interdiction: {
      on: {
        INTERDICTION_WIN: { target: 'jacking_in' },
        INTERDICTION_ESCAPE: { target: 'safehouse' },
        INTERDICTION_TIMEOUT: { target: 'safehouse' }
      }
    },
    jacking_in: {
      on: { CONNECTION_ESTABLISHED: { target: 'net' } }
    },
    net: {
      on: { JACK_OUT: { target: 'safehouse' } }
    }
  }
});