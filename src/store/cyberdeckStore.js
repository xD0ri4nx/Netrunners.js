import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useMeatspaceStore } from './meatspaceStore';

export const useCyberdeckStore = create(
    persist(
        (set, get) => ({
            deckModel: 'Zetatech Paraline',
            deckType: 'traditional',
            maxMu: 5,
            usedMu: 0,
            speed: 1,
            dataWalls: 3,
            coprocessors: 0,
            isCellular: false,
            deckHealth: 100,
            maxDeckHealth: 100,
            deckCrashes: 0,
            tuningCount: 0,
            tuningHistory: [],
            neuralCyberware: {
                neuralProcessor: false,
                chipwareSocket: false,
                brainWall: false,
                psychosisRisk: 0
            },

            peripherals: {
                chipreader: false,
                hardened: false,
                videoboard: false,
                optical: false
            },

            chipSlot: null,
            chipProgram: null,

            programs: [
                { id: 'prog_decrypt', name: 'Decrypt v1.0', type: 'utility', strength: 4, difficulty: 14, muCost: 1, marketValue: 140, isCustom: false },
                { id: 'prog_sword', name: 'Sword', type: 'anti-ice', strength: 4, difficulty: 14, muCost: 1, marketValue: 350, isCustom: false }
            ],

            activeAction: null,
            activePassives: [],

            toggleProgram: (id) => set((state) => {
                const prog = state.programs.find(p => p.id === id);
                if (!prog) return state;

                if (prog.type === 'stealth' || prog.type === 'defense') {
                    const isRunning = state.activePassives.some(p => p.id === id);
                    if (isRunning) {
                        return { activePassives: state.activePassives.filter(p => p.id !== id) };
                    } else {
                        return { activePassives: [...state.activePassives, prog] };
                    }
                } else {
                    if (state.activeAction?.id === id) {
                        return { activeAction: null };
                    } else {
                        return { activeAction: prog };
                    }
                }
            }),

            addProgram: (program) => set((state) => {
                const muCost = program.muCost || 1;
                if (state.usedMu + muCost <= state.maxMu) {
                    return {
                        programs: [...state.programs, program],
                        usedMu: state.usedMu + muCost
                    };
                }
                return state;
            }),

            removeProgram: (programId) => set((state) => {
                const program = state.programs.find(p => p.id === programId);
                if (!program) return state;
                const muCost = program.muCost || 1;
                return {
                    programs: state.programs.filter(p => p.id !== programId),
                    usedMu: Math.max(0, state.usedMu - muCost),
                    activeAction: state.activeAction?.id === programId ? null : state.activeAction,
                    activePassives: state.activePassives.filter(p => p.id !== programId)
                };
            }),

            getProgramMuCost: (difficulty) => {
                if (difficulty <= 15) return 1;
                if (difficulty <= 20) return 2;
                if (difficulty <= 25) return 3;
                if (difficulty <= 30) return 4;
                if (difficulty <= 35) return 5;
                if (difficulty <= 40) return 6;
                return 7;
            },

            upgradeMu: (amount) => set((state) => ({
                maxMu: state.maxMu + amount
            })),

            equipDeck: (model, mu, speed, dataWalls) => set({
                deckModel: model,
                deckType: 'traditional',
                maxMu: mu,
                usedMu: 0,
                speed: speed,
                dataWalls: dataWalls
            }),
            equipBrainwareDeck: (model, mu, speed) => set({
                deckModel: model,
                deckType: 'brainware',
                maxMu: mu,
                usedMu: 0,
                speed: speed,
                dataWalls: 0
            }),
            installNeuralCyberware: (type) => set((state) => ({
                neuralCyberware: {
                    neuralProcessor: false,
                    chipwareSocket: false,
                    brainWall: false,
                    psychosisRisk: 0,
                    ...state.neuralCyberware,
                    [type]: true
                }
            })),
            increasePsychosisRisk: (amount) => set((state) => ({
                neuralCyberware: {
                    ...state.neuralCyberware,
                    psychosisRisk: state.neuralCyberware.psychosisRisk + amount
                }
            })),

            addSpeed: () => set((state) => ({
                speed: state.speed + 1
            })),

            addDataWalls: () => set((state) => ({
                dataWalls: state.dataWalls + 1
            })),

            addRipple: () => set((state) => ({
                ripple: (state.ripple || 0) + 1
            })),

            addCoprocessor: () => set((state) => ({
                coprocessors: state.coprocessors + 1
            })),

            setCellular: (isCellular) => set({ isCellular }),

            damageDeck: (amount) => set((state) => ({
                deckHealth: Math.max(0, state.deckHealth - amount),
                deckCrashes: state.deckCrashes + 1
            })),

            repairDeck: (amount) => set((state) => ({
                deckHealth: Math.min(state.maxDeckHealth, state.deckHealth + amount)
            })),

            resetDeckCrashes: () => set({ deckCrashes: 0 }),

            reduceMaxMu: (amount) => set((state) => ({
                maxMu: Math.max(1, state.maxMu - amount)
            })),

            installPeripheral: (type) => set((state) => ({
                peripherals: { ...state.peripherals, [type]: true }
            })),

            removePeripheral: (type) => set((state) => ({
                peripherals: { ...state.peripherals, [type]: false }
            })),

            equipChip: (program) => set({ chipProgram: program }),

            consumeChip: () => set({ chipProgram: null }),

            hasPeripheral: (type) => {
                const state = get();
                return state.peripherals[type] || false;
            },

            getEffectiveAction: () => {
                const state = get();
                return state.chipProgram || state.activeAction;
            },

            getEffectiveDeckStats: () => {
                const state = get();
                const meatspaceState = useMeatspaceStore.getState();
                
                if (meatspaceState.crecheInstalled) {
                    return {
                        speed: state.speed + 1,
                        maxMu: 12,
                        dataWalls: state.dataWalls + 4,
                        deckModel: 'Data Creche',
                        deckType: 'creche'
                    };
                }
                
                return {
                    speed: state.speed,
                    maxMu: state.maxMu,
                    dataWalls: state.dataWalls,
                    deckModel: state.deckModel,
                    deckType: state.deckType
                };
            },

            resetDeck: () => set({
                deckModel: 'Zetatech Paraline',
                deckType: 'traditional',
                maxMu: 5,
                usedMu: 0,
                speed: 1,
                dataWalls: 3,
                coprocessors: 0,
                isCellular: false,
                deckHealth: 100,
                maxDeckHealth: 100,
                deckCrashes: 0,
                neuralCyberware: {
                    neuralProcessor: false,
                    chipwareSocket: false,
                    brainWall: false,
                    psychosisRisk: 0
                },
                peripherals: {
                    chipreader: false,
                    hardened: false,
                    videoboard: false,
                    optical: false
                },
                chipSlot: null,
                chipProgram: null,
                programs: [
                    { id: 'prog_decrypt', name: 'Decrypt v1.0', type: 'utility', strength: 4, difficulty: 14, muCost: 1, marketValue: 140, isCustom: false },
                    { id: 'prog_sword', name: 'Sword', type: 'anti-ice', strength: 4, difficulty: 14, muCost: 1, marketValue: 350, isCustom: false }
                ],
                activeAction: null,
                activePassives: [],
                tuningCount: 0,
                tuningHistory: []
            }),

            getTuningLimit: () => {
                const state = get();
                const deckTier = state.deckType === 'traditional' ? 4 : state.deckType === 'brainware' ? 3 : 2;
                return 2 + Math.floor(deckTier / 2);
            },

            canTune: () => {
                const state = get();
                return state.tuningCount < state.getTuningLimit();
            },

            getTuningSuccessChance: (difficulty) => {
                const tech = useMeatspaceStore.getState().tech || 5;
                const cyberdeckDesign = useMeatspaceStore.getState().skills?.cyberdeckDesign || 1;
                const total = tech + cyberdeckDesign;
                const successChance = Math.max(0, Math.min(90, (total * 5 + 5) - difficulty + 5));
                return successChance;
            },

            performTune: (tuneType) => {
                const state = get();
                const tech = useMeatspaceStore.getState().tech || 5;
                const cyberdeckDesign = useMeatspaceStore.getState().skills?.cyberDeckDesign || 1;
                const roll = Math.floor(Math.random() * 10) + 1;
                const total = roll + tech + cyberdeckDesign;
                
                const tuneConfigs = {
                    speed: { difficulty: 20, cost: 1000, stat: 'speed', bonus: 1, name: 'OVERCLOCK SPEED' },
                    mu: { difficulty: 25, cost: 500, stat: 'maxMu', bonus: 2, name: 'EXPAND MU' },
                    datawalls: { difficulty: 22, cost: 750, stat: 'dataWalls', bonus: 1, name: 'HARDWIRE DEFENSE' }
                };
                
                const config = tuneConfigs[tuneType];
                if (!config) return { success: false, message: 'INVALID TUNE TYPE' };
                
                if (state.funds < config.cost) return { success: false, message: `INSUFFICIENT FUNDS (${config.cost} eb)` };
                
                if (!state.canTune()) return { success: false, message: 'TUNING LIMIT REACHED' };

                if (roll === 1) {
                    const fumbleRoll = Math.floor(Math.random() * 10) + 1;
                    let result = { success: false, fumble: true, roll, total, message: '' };
                    
                    if (fumbleRoll <= 4) {
                        result.message = `FUMBLE! SCORCHED TRACES. ${config.cost} eb WASTED.`;
                    } else if (fumbleRoll <= 7) {
                        const damage = 40;
                        state.damageDeck(damage);
                        result.message = `FUMBLE! BLOWN CAPACITORS. DECK -${damage}% HEALTH.`;
                    } else if (fumbleRoll <= 9) {
                        state.reduceMaxMu(1);
                        result.message = `FUMBLE! MOTHERBOARD WARP. -1 MAX MU.`;
                    } else {
                        state.brickDeck();
                        result.message = `FUMBLE! TOTAL BRICK. DECK DESTROYED.`;
                    }
                    return result;
                }
                
                if (total >= config.difficulty) {
                    const currentStat = state[config.stat];
                    const newValue = (currentStat || 0) + config.bonus;
                    set({
                        [config.stat]: newValue,
                        tuningCount: state.tuningCount + 1,
                        tuningHistory: [...state.tuningHistory, { type: tuneType, stat: config.stat, bonus: config.bonus }]
                    });
                    return { success: true, roll, total, message: `${config.name} SUCCESS! +${config.bonus} ${config.stat.toUpperCase()}.` };
                }
                
                return { success: false, roll, total, message: `${config.name} FAILED (${total} < ${config.difficulty}). ${config.cost} eb WASTED.` };
            },

            brickDeck: () => set({
                deckModel: null,
                deckHealth: 0,
                maxDeckHealth: 100,
                speed: 0,
                maxMu: 0,
                dataWalls: 0,
                programs: [],
                activeAction: null,
                activePassives: [],
                tuningCount: 0,
                tuningHistory: []
            })
        }),
        {
            name: 'cyberdeck-storage',
            version: 3,
            migrate: (persistedState, version) => {
                if (version === 0 || version === 1) {
                    return {
                        ...persistedState,
                        deckType: 'traditional',
                        neuralCyberware: {
                            neuralProcessor: false,
                            chipwareSocket: false,
                            brainWall: false,
                            psychosisRisk: 0
                        },
                        peripherals: {
                            chipreader: false,
                            hardened: false,
                            videoboard: false,
                            optical: false
                        },
                        chipSlot: null,
                        chipProgram: null
                    };
                }
                if (version === 2) {
                    return {
                        ...persistedState,
                        peripherals: {
                            chipreader: false,
                            hardened: false,
                            videoboard: false,
                            optical: false
                        },
                        chipSlot: null,
                        chipProgram: null
                    };
                }
                return persistedState;
            }
        }
    )
);