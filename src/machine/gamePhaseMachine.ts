import { setup } from 'xstate';

export type GameEvent =
  | { type: 'OPEN_NAVIGATOR' }
  | { type: 'OPEN_SHOP' }
  | { type: 'OPEN_JOBS' }
  | { type: 'OPEN_REPAIR' }
  | { type: 'TRIGGER_RAID' }
  | { type: 'JACK_OUT' }
  | { type: 'SURVIVED_RAID' }
  | { type: 'LEAVE_SHOP' }
  | { type: 'LEAVE_JOBS' }
  | { type: 'LEAVE_REPAIR' }
  | { type: 'RIVAL_ENCOUNTER' }
  | { type: 'INTERDICT' }
  | { type: 'INITIATE_LINK' }
  | { type: 'CANCEL' }
  | { type: 'FIGHT_RIVAL' }
  | { type: 'FLEE_RIVAL' }
  | { type: 'PAY_RIVAL' }
  | { type: 'LOSE_TO_RIVAL' }
  | { type: 'INTERDICTION_WIN' }
  | { type: 'INTERDICTION_ESCAPE' }
  | { type: 'INTERDICTION_TIMEOUT' }
  | { type: 'CONNECTION_ESTABLISHED' };

export const gamePhaseMachine = setup({
  types: {
    events: {} as GameEvent,
  },
  actions: {}
}).createMachine({
  id: 'gamePhase',
  initial: 'safehouse',
  states: {
    safehouse: {
      on: {
        OPEN_NAVIGATOR: { target: 'navigator' },
        OPEN_SHOP: { target: 'shop' },
        OPEN_JOBS: { target: 'jobs' },
        OPEN_REPAIR: { target: 'repair' },
        TRIGGER_RAID: { target: 'raid' },
        JACK_OUT: { target: 'safehouse' }
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
        INTERDICT: { target: 'gridsec_interdiction' },
        INITIATE_LINK: { target: 'jacking_in' },
        CANCEL: { target: 'safehouse' },
        JACK_OUT: { target: 'safehouse' }
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
    gridsec_interdiction: {
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
