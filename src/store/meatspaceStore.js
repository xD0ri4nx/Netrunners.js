import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const FBC_CHASSIS = [
  // Chromebook 2
  { id: 'fbc_gemini', name: 'Gemini', category: 'chromebook2', cost: 55000, desc: 'Human-passing chassis. Bypasses security. No inherent armor.', baseStats: { ref: 10, ma: 10, body: 12, sp: 0 }, sdp: { head: 30, lArm: 20, rArm: 20, lLeg: 20, rLeg: 20, torso: 40 } },
  { id: 'fbc_alpha', name: 'Alpha Class', category: 'chromebook2', cost: 58000, desc: 'Standard combat/solo conversion. Heavily armored.', baseStats: { ref: 10, ma: 10, body: 12, sp: 25 }, sdp: { head: 30, lArm: 20, rArm: 20, lLeg: 20, rLeg: 20, torso: 40 } },
  { id: 'fbc_wingman', name: 'Wingman', category: 'chromebook2', cost: 54000, desc: 'Aerospace pilot. Immune to high G-forces.', baseStats: { ref: 15, ma: 10, body: 12, sp: 25 }, sdp: { head: 30, lArm: 20, rArm: 20, lLeg: 20, rLeg: 20, torso: 40 } },
  { id: 'fbc_eclipse', name: 'Eclipse', category: 'chromebook2', cost: 76000, desc: 'Espionage chassis. Radar-absorbent, silent joints.', baseStats: { ref: 10, ma: 12, body: 10, sp: 15 }, sdp: { head: 30, lArm: 20, rArm: 20, lLeg: 20, rLeg: 20, torso: 40 } },
  { id: 'fbc_aquarius', name: 'Aquarius', category: 'chromebook2', cost: 65000, desc: 'Deep-sea operations. Sonar, pressure resistant.', baseStats: { ref: 8, ma: 10, body: 12, sp: 15 }, special: 'underwater', sdp: { head: 30, lArm: 20, rArm: 20, lLeg: 20, rLeg: 20, torso: 50 } },
  { id: 'fbc_fireman', name: 'Fireman', category: 'chromebook2', cost: 60000, desc: 'Hazard/rescue. Immune to heat and toxins.', baseStats: { ref: 8, ma: 10, body: 14, sp: 20 }, sdp: { head: 30, lArm: 30, rArm: 30, lLeg: 30, rLeg: 30, torso: 50 } },
  { id: 'fbc_samson', name: 'Samson', category: 'chromebook2', cost: 40000, desc: 'Heavy industrial. Massive lifting capacity.', baseStats: { ref: 6, ma: 8, body: 18, sp: 15 }, sdp: { head: 30, lArm: 40, rArm: 40, lLeg: 50, rLeg: 50, torso: 60 } },
  // Chromebook 3
  { id: 'fbc_wiseman', name: 'Wiseman', category: 'chromebook3', cost: 90000, desc: 'Netrunner chassis. Extra MU, Firestarter immune.', baseStats: { ref: 10, ma: 10, body: 12, sp: 15 }, special: 'firestarterImmune', sdp: { head: 30, lArm: 20, rArm: 20, lLeg: 20, rLeg: 20, torso: 40 } },
  { id: 'fbc_dragoon', name: 'Dragoon', category: 'chromebook3', cost: 120000, desc: 'Military tank. Mount heavy weapons.', baseStats: { ref: 15, ma: 25, body: 20, sp: 40 }, sdp: { head: 40, lArm: 50, rArm: 50, lLeg: 50, rLeg: 50, torso: 60 } },
  { id: 'fbc_spyder', name: 'Spyder', category: 'chromebook3', cost: 118110, desc: 'Multi-limbed. Wall-crawling capability.', baseStats: { ref: 12, ma: 20, body: 12, sp: 30 }, sdp: { head: 30, lArm: 20, rArm: 20, lLeg: 20, rLeg: 20, torso: 40 } },
  // Deep Space
  { id: 'fbc_copernicus', name: 'Copernicus', category: 'deepspace', cost: 60000, desc: 'Space exploration. Radiation/EMP shielded.', baseStats: { ref: 11, ma: 10, body: 12, sp: 25 }, special: 'space', sdp: { head: 30, lArm: 20, rArm: 20, lLeg: 20, rLeg: 20, torso: 40 } },
  { id: 'fbc_burroughs', name: 'Burroughs', category: 'deepspace', cost: 65000, desc: 'Mars operations. Sandstorm resistant.', baseStats: { ref: 10, ma: 10, body: 12, sp: 30 }, special: 'mars', sdp: { head: 30, lArm: 30, rArm: 30, lLeg: 40, rLeg: 40, torso: 50 } },
];

export const useMeatspaceStore = create(
  persist(
    (set, get) => ({
      handle: 'Unknown',
      int: 8,
      ref: 6,
      tech: 5,
      cool: 5,
      attr: 5,
      luck: 5,
      ma: 6,
      body: 5,
      interfaceLvl: 4,
      programming: 3,
      funds: 1500,
      neuralDamage: 0,
      maxInt: 8,
      interfaceType: 'default',
      timelagInterface: false,
      timelagReflex: false,
      isProgramming: false,
      programmingDays: 0,
      pendingProgram: null,
      compilationSuccess: null,
      completedProgram: null,
      chipStorage: [],
      chipInstallResult: null,
      ip: 0,
      totalIpEarned: 0,
      housingType: 'apartment',
      housingCost: 200,
      daysPassedInMonth: 0,
      daysPerMonth: 30,
      isStreet: false,
      hunger: 100,
      foodType: 'prepack',
      starvingDays: 0,
      freshFoodBonus: null,
      sleep: 100,
      stimulants: 0,
      hoursAwake: 0,
      isStimulated: false,
      telecomBill: 0,
      routingMinutes: 0,
      hasBodyweightSystem: false,
      nutrientPacks: 0,
      isImmersionMode: false,
      immersionTimer: 0,
      systemShockActive: false,
      systemShockHours: 0,
      immersionHoursTotal: 0,
      hasDataCreche: false,
      crecheInstalled: false,
      videoboardActive: false,
      externalThreatAlert: false,
      isFBC: false,
      hasBiopod: false,
      currentChassis: null,
      ownedChassis: [],
      sdp: { head: 30, lArm: 20, rArm: 20, lLeg: 20, rLeg: 20, torso: 40 },
      maxSdp: { head: 30, lArm: 20, rArm: 20, lLeg: 20, rLeg: 20, torso: 40 },
      fbcUpgrades: {
        overclocked: { ref: 0, ma: 0, body: 0 },
        ccplRetrofit: false,
        quickMounts: false,
        hardenedShielding: false
      },
      skills: {
        interface: 4,
        programming: 3,
        electronics: 2,
        cryptography: 1,
        librarySearch: 2,
        handgun: 3,
        brawling: 2,
        awareness: 1,
        basicTech: 1,
        education: 1,
        systemKnowledge: 1,
        cyberTech: 1,
        cyberdeckDesign: 1,
        composition: 1
      },
      humanity: 100,
      maxHumanity: 100,
      cyberware: [],
      cyberpsychosisLevel: 0,
      riots: 0,
      factionReputation: {
        arasaka: 0,
        militech: 0,
        petrochem: 0,
        biotechnica: 0,
        eurospace: 0,
        sovspace: 0
      },
      vipMarketUnlocked: false,

      addFunds: (amount) => set((state) => ({ funds: state.funds + amount })),
      takeNeuralDamage: (amount) => set((state) => ({
        neuralDamage: Math.min(state.maxInt - 2, state.neuralDamage + amount)
      })),
      getCurrentInt: () => {
        const state = get();
        const neuralDamage = state.neuralDamage || 0;
        const maxInt = state.maxInt || 8;
        return Math.max(2, maxInt - neuralDamage);
      },
      healNeuralDamage: (amount) => set((state) => ({
        neuralDamage: Math.max(0, state.neuralDamage - amount)
      })),
      heal: () => set((state) => ({ health: state.maxHealth })),
      deductFunds: (amount) => set((state) => ({ funds: Math.max(0, state.funds - amount) })),
      
      setHousing: (type, cost) => {
        const state = get();
        if (type === 'coffin' && state.housingType === 'penthouse') {
          return { isStreet: true, housingType: 'street', housingCost: 0 };
        }
        return { housingType: type, housingCost: cost, isStreet: false };
      },
      
      passDay: () => set((state) => {
        const newDays = state.daysPassedInMonth + 1;
        return { daysPassedInMonth: newDays };
      }),
      
      payRent: () => {
        const state = get();
        if (state.funds >= state.housingCost && !state.isStreet) {
          return { funds: state.funds - state.housingCost, daysPassedInMonth: 0 };
        }
        return { isStreet: true, housingType: 'street', housingCost: 0, daysPassedInMonth: 0 };
      },
      
      checkRentDue: () => {
        const state = get();
        if (state.isStreet) return false;
        return state.daysPassedInMonth >= state.daysPerMonth;
      },
      
      getHousingInfo: () => {
        const state = get();
        return {
          type: state.housingType,
          cost: state.housingCost,
          daysUntilRent: Math.max(0, state.daysPerMonth - state.daysPassedInMonth),
          isStreet: state.isStreet,
          isRentDue: state.daysPassedInMonth >= state.daysPerMonth
        };
      },

      eatFood: (foodType) => {
        const state = get();
        const costs = { kibble: 50, prepack: 150, fresh: 500 };
        const hungerRestore = { kibble: 40, prepack: 60, fresh: 80 };
        
        if (state.funds < costs[foodType]) return { success: false, message: 'INSUFFICIENT FUNDS' };
        
        let newState = { 
          funds: state.funds - costs[foodType],
          foodType,
          hunger: Math.min(100, state.hunger + hungerRestore[foodType]),
          starvingDays: 0
        };
        
        if (foodType === 'kibble') {
          newState.humanity = Math.max(0, state.humanity - 1);
          newState.message = 'KIBBLE EATEN. -1 HUMANITY. HUNGER +40.';
        } else if (foodType === 'fresh') {
          newState.freshFoodBonus = { stat: 'int', expiresIn: 24 };
          newState.message = 'FRESH FOOD EATEN. +1 INT (24h). HUNGER +80.';
        } else {
          newState.message = 'PREPACK EATEN. HUNGER +60.';
        }
        
        set(newState);
        return { success: true, message: newState.message };
      },

      processDayHunger: () => set((state) => {
        const newHunger = Math.max(0, state.hunger - 30);
        const newStarvingDays = newHunger === 0 ? state.starvingDays + 1 : 0;
        
        let statChanges = {};
        if (newStarvingDays >= 3) {
          statChanges = { int: Math.max(1, state.int - 1), ref: Math.max(1, state.ref - 1) };
        }
        
        return { 
          hunger: newHunger,
          starvingDays: newStarvingDays,
          ...statChanges
        };
      }),

      getHungerInfo: () => {
        const state = get();
        return {
          hunger: state.hunger,
          foodType: state.foodType,
          starvingDays: state.starvingDays,
          freshFoodBonus: state.freshFoodBonus,
          isStarving: state.hunger === 0
        };
      },

      useStimulant: () => {
        const state = get();
        if (state.stimulants <= 0) return { success: false, message: 'NO STIMULANTS' };
        return { 
          success: true, 
          message: 'STIMULANT USED. SLEEP +20, EXTENDED AWAKE TIME.',
          state: { stimulants: state.stimulants - 1, isStimulated: true, sleep: Math.min(100, state.sleep + 20) }
        };
      },

      buyStimulants: (amount) => {
        const state = get();
        const costPerUnit = 100;
        const totalCost = amount * costPerUnit;
        
        if (state.funds < totalCost) return { success: false, message: 'INSUFFICIENT FUNDS' };
        
        set({ 
          funds: state.funds - totalCost, 
          stimulants: state.stimulants + amount 
        });
        
        return { success: true, message: `BOUGHT ${amount} STIMULANTS FOR ${totalCost} eb.` };
      },

      rest: () => set((state) => ({
        sleep: 100,
        hoursAwake: 0,
        isStimulated: false
      })),

      processDaySleep: () => set((state) => {
        let newSleep = state.sleep;
        let newHoursAwake = state.hoursAwake;
        
        if (state.isStimulated) {
          newHoursAwake += 8;
          newSleep = Math.max(0, state.sleep - 10);
        } else {
          newHoursAwake += 16;
          newSleep = Math.max(0, state.sleep - 25);
        }
        
        let statChanges = {};
        if (newHoursAwake > 16) {
          const extraHours = newHoursAwake - 16;
          const penalty = Math.floor(extraHours / 8);
          if (penalty > 0) {
            statChanges = { 
              int: Math.max(1, state.int - penalty), 
              ref: Math.max(1, state.ref - penalty) 
            };
          }
        }
        
        if (state.int <= 0) {
          statChanges.int = 1;
        }
        
        return { 
          sleep: newSleep,
          hoursAwake: newHoursAwake,
          isStimulated: false,
          ...statChanges
        };
      }),

      getSleepInfo: () => {
        const state = get();
        const deprivationPenalty = state.hoursAwake > 16 ? Math.floor((state.hoursAwake - 16) / 8) : 0;
        return {
          sleep: state.sleep,
          stimulants: state.stimulants,
          hoursAwake: state.hoursAwake,
          isStimulated: state.isStimulated,
          deprivationPenalty,
          isDeprived: state.hoursAwake > 16
        };
      },

      addRoutingCharge: () => set((state) => ({
        telecomBill: state.telecomBill + 5,
        routingMinutes: state.routingMinutes + 1
      })),

      payTelecomBill: () => {
        const state = get();
        if (state.funds < state.telecomBill) return { success: false, message: 'INSUFFICIENT FUNDS' };
        set({ funds: state.funds - state.telecomBill, telecomBill: 0, routingMinutes: 0 });
        return { success: true, message: `TELECOM BILL PAID: ${state.telecomBill} eb.` };
      },

      utilityFraud: () => {
        const state = get();
        const roll = Math.floor(Math.random() * 10) + 1;
        const total = state.programming + roll;
        
        if (total >= 20) {
          set({ telecomBill: 0, routingMinutes: 0 });
          return { success: true, message: `FRAUD SUCCESS (${total} >= 20). BILL WAIVED.` };
        } else {
          const { addTraceRisk } = require('../store/routingStore').useRoutingStore.getState();
          addTraceRisk(10);
          return { success: false, message: `FRAUD FAILED (${total} < 20). NETWATCH ALERTED. +10 TRACE.` };
        }
      },

      getTelecomInfo: () => {
        const state = get();
        return {
          telecomBill: state.telecomBill,
          routingMinutes: state.routingMinutes
        };
      },

      purchaseBodyweightSystem: () => {
        const state = get();
        if (state.funds < 5000) return { success: false, message: 'INSUFFICIENT FUNDS (5000 eb)' };
        set({ funds: state.funds - 5000, hasBodyweightSystem: true });
        return { success: true, message: 'BODYWEIGHT LIFESUPPORT PURCHASED. 5000 eb.' };
      },

      buyNutrientPacks: (amount) => {
        const state = get();
        const costPerPack = 100;
        const totalCost = amount * costPerPack;
        if (state.funds < totalCost) return { success: false, message: `INSUFFICIENT FUNDS (${totalCost} eb)` };
        if (!state.hasBodyweightSystem) return { success: false, message: 'BODYWEIGHT SYSTEM NOT INSTALLED' };
        set({ funds: state.funds - totalCost, nutrientPacks: state.nutrientPacks + amount });
        return { success: true, message: `BOUGHT ${amount} NUTRIENT PACKS FOR ${totalCost} eb.` };
      },

      startImmersion: () => {
        const state = get();
        if (!state.hasBodyweightSystem) return { success: false, message: 'NO BODYWEIGHT SYSTEM' };
        if (state.nutrientPacks < 1) return { success: false, message: 'NO NUTRIENT PACKS' };
        set({ 
          isImmersionMode: true, 
          immersionTimer: 0, 
          nutrientPacks: state.nutrientPacks - 1,
          systemShockActive: false,
          systemShockHours: 0
        });
        return { success: true, message: 'IMMERSION MODE ACTIVE. NUTRIENT PACK CONSUMED.' };
      },

      endImmersion: () => {
        const state = get();
        if (!state.isImmersionMode) return state;

        let newState = { isImmersionMode: false };

        if (state.immersionTimer > 24) {
          const penalty = state.hasDataCreche ? Math.floor((state.immersionTimer - 24) / 4) : Math.floor((state.immersionTimer - 24) / 2);
          newState.systemShockActive = true;
          newState.systemShockHours = 12;
          newState.int = Math.max(2, state.int - penalty);
          newState.ref = Math.max(2, state.ref - penalty);
          newState.message = `SYSTEM SHOCK! REF/INT -${penalty} FOR 12h.`;
        }

        const immersionDays = Math.floor(state.immersionHoursTotal / 24);
        const empathyLoss = Math.floor(immersionDays * 0.1);
        if (empathyLoss > 0) {
          newState.humanity = Math.max(0, state.humanity - empathyLoss);
        }

        set({ ...newState, immersionTimer: 0 });
        return { success: true, message: newState.message || 'JACK-OUT COMPLETE.' };
      },

      processTurnImmersion: () => set((state) => {
        if (!state.isImmersionMode) return state;

        const newImmersionTimer = state.immersionTimer + 1;
        const newImmersionHoursTotal = state.immersionHoursTotal + 1;
        const maxImmersion = state.hasDataCreche ? 96 : 72;

        let newNutrientPacks = state.nutrientPacks;
        let lethalDamage = null;

        if (newImmersionTimer === 24 && state.nutrientPacks > 0) {
          newNutrientPacks = state.nutrientPacks - 1;
        }

        if (newImmersionTimer >= maxImmersion) {
          lethalDamage = { turns: 1 };
        }

        return { 
          immersionTimer: newImmersionTimer,
          immersionHoursTotal: newImmersionHoursTotal,
          nutrientPacks: newNutrientPacks,
          lethalDamage
        };
      }),

      triggerExternalThreat: () => set((state) => {
        if (!state.isImmersionMode) return state;
        return { externalThreatAlert: true };
      }),

      clearExternalThreat: () => set({ externalThreatAlert: false }),

      processSystemShock: () => set((state) => {
        if (!state.systemShockActive) return state;
        const newHours = state.systemShockHours - 1;
        if (newHours <= 0) {
          return { systemShockActive: false, systemShockHours: 0 };
        }
        return { systemShockHours: newHours };
      }),

      getImmersionInfo: () => {
        const state = get();
        const maxImmersion = state.hasDataCreche ? 96 : 72;
        const dangerZone = state.immersionTimer >= maxImmersion - 12;
        return {
          hasBodyweight: state.hasBodyweightSystem,
          nutrientPacks: state.nutrientPacks,
          isImmersionMode: state.isImmersionMode,
          immersionTimer: state.immersionTimer,
          maxImmersion,
          systemShockActive: state.systemShockActive,
          systemShockHours: state.systemShockHours,
          hasDataCreche: state.hasDataCreche,
          crecheInstalled: state.crecheInstalled,
          externalThreatAlert: state.externalThreatAlert,
          dangerZone
        };
      },

      purchaseDataCreche: () => {
        const state = get();
        if (state.funds < 10000) return { success: false, message: 'INSUFFICIENT FUNDS (10000 eb)' };
        if (state.housingType === 'coffin' || state.isStreet) return { success: false, message: 'REQUIRE APARTMENT OR PENTHOUSE' };
        set({ funds: state.funds - 10000, hasDataCreche: true, crecheInstalled: true });
        return { success: true, message: 'DATA CRECHE INSTALLED. 96h IMMERSION. +1 SPEED, +4 MU, +4 WALLS.' };
      },

      getCrecheDeckStats: () => {
        const state = get();
        if (!state.crecheInstalled) return null;
        return { speed: 1, mu: 12, dataWalls: 4 };
      },

      convertToFBC: (chassisId, cost = 30000) => {
        const state = get();
        if (state.isFBC) return { success: false, message: 'ALREADY FBC CONVERTED' };
        if (state.funds < cost) return { success: false, message: `INSUFFICIENT FUNDS (${cost} eb)` };
        
        const chassis = FBC_CHASSIS.find(c => c.id === chassisId);
        if (!chassis) return { success: false, message: 'INVALID CHASSIS' };
        
        set({
          funds: state.funds - cost,
          isFBC: true,
          hasBiopod: true,
          currentChassis: chassisId,
          ownedChassis: [{ ...chassis, upgrades: { overclocked: { ref: 0, ma: 0, body: 0 }, ccpl: false, quickMounts: false, hardened: false } }],
          sdp: { ...chassis.sdp },
          maxSdp: { ...chassis.sdp },
          humanity: 10,
          maxHumanity: 10
        });
        
        return { success: true, message: `FBC CONVERSION COMPLETE. BIOPOD INSTALLED IN ${chassis.name}. NEURAL HP REPLACED WITH SDP.` };
      },

      purchaseChassis: (chassisId) => {
        const state = get();
        if (!state.isFBC) return { success: false, message: 'NOT FBC CONVERTED' };
        
        const chassis = FBC_CHASSIS.find(c => c.id === chassisId);
        if (!chassis) return { success: false, message: 'INVALID CHASSIS' };
        if (state.funds < chassis.cost) return { success: false, message: `INSUFFICIENT FUNDS (${chassis.cost} eb)` };
        if (state.ownedChassis.some(c => c.id === chassisId)) return { success: false, message: 'CHASSIS ALREADY OWNED' };
        
        set({
          funds: state.funds - chassis.cost,
          ownedChassis: [...state.ownedChassis, { ...chassis, upgrades: { overclocked: { ref: 0, ma: 0, body: 0 }, ccpl: false, quickMounts: false, hardened: false } }]
        });
        
        return { success: true, message: `PURCHASED ${chassis.name}. BIOPOD CAN BE SWAPPED AT SAFEHOUSE.` };
      },

      swapChassis: (chassisId) => {
        const state = get();
        if (!state.isFBC) return { success: false, message: 'NOT FBC CONVERTED' };
        
        const newChassis = state.ownedChassis.find(c => c.id === chassisId);
        if (!newChassis) return { success: false, message: 'CHASSIS NOT OWNED' };
        
        set({
          currentChassis: chassisId,
          sdp: { ...newChassis.sdp },
          maxSdp: { ...newChassis.sdp }
        });
        
        return { success: true, message: `BIOPOD SWAPPED TO ${newChassis.name}. SDP UPDATED.` };
      },

      repairSDP: (amount, costPerPoint = 10) => {
        const state = get();
        if (!state.isFBC) return { success: false, message: 'NOT FBC CONVERTED' };
        
        const currentTotal = Object.values(state.sdp).reduce((a, b) => a + b, 0);
        const maxTotal = Object.values(state.maxSdp).reduce((a, b) => a + b, 0);
        const repairable = maxTotal - currentTotal;
        
        if (repairable <= 0) return { success: false, message: 'SDP AT MAXIMUM' };
        
        const actualRepair = Math.min(amount, repairable);
        const cost = actualRepair * costPerPoint;
        
        if (state.funds < cost) return { success: false, message: `INSUFFICIENT FUNDS (${cost} eb)` };
        
        const newSdp = { ...state.sdp };
        let remaining = actualRepair;
        const locations = Object.keys(newSdp);
        
        for (const loc of locations) {
          if (remaining <= 0) break;
          const diff = state.maxSdp[loc] - newSdp[loc];
          if (diff > 0) {
            const repair = Math.min(diff, remaining);
            newSdp[loc] += repair;
            remaining -= repair;
          }
        }
        
        set({ funds: state.funds - cost, sdp: newSdp });
        return { success: true, message: `REPAIRED ${actualRepair} SDP FOR ${cost} eb.` };
      },

      takePhysicalDamage: (amount) => {
        const state = get();
        if (!state.isFBC) return;
        
        const newSdp = { ...state.sdp };
        let remaining = amount;
        const locations = Object.keys(newSdp);
        
        while (remaining > 0) {
          const randomLoc = locations[Math.floor(Math.random() * locations.length)];
          if (newSdp[randomLoc] > 0) {
            newSdp[randomLoc]--;
            remaining--;
          } else {
            locations.splice(locations.indexOf(randomLoc), 1);
            if (locations.length === 0) break;
          }
        }
        
        set({ sdp: newSdp });
        
        const totalSdp = Object.values(newSdp).reduce((a, b) => a + b, 0);
        if (totalSdp <= 0) {
          return { destroyed: true, message: 'FBC DESTROYED. BIOPOD CORRUPTED.' };
        }
      },

      upgradeFBCStat: (stat, amount = 1, costPerPoint = 5000) => {
        const state = get();
        if (!state.isFBC) return { success: false, message: 'NOT FBC CONVERTED' };
        
        const currentChassis = state.ownedChassis.find(c => c.id === state.currentChassis);
        if (!currentChassis) return { success: false, message: 'NO CHASSIS' };
        
        const currentOverclock = currentChassis.upgrades?.overclocked || { ref: 0, ma: 0, body: 0 };
        
        if (stat === 'ref' && currentOverclock.ref >= 2) return { success: false, message: 'REF ALREADY MAX OVERCLOCKED' };
        if (stat === 'ma' && currentOverclock.ma >= 2) return { success: false, message: 'MA ALREADY MAX OVERCLOCKED' };
        if (stat === 'body' && currentOverclock.body >= 2) return { success: false, message: 'BODY ALREADY MAX OVERCLOCKED' };
        
        const cost = amount * costPerPoint;
        if (state.funds < cost) return { success: false, message: `INSUFFICIENT FUNDS (${cost} eb)` };
        
        const newOwnedChassis = state.ownedChassis.map(c => {
          if (c.id === state.currentChassis) {
            return {
              ...c,
              upgrades: {
                ...c.upgrades,
                overclocked: { ...currentOverclock, [stat]: (currentOverclock[stat] || 0) + amount }
              }
            };
          }
          return c;
        });
        
        set({ funds: state.funds - cost, ownedChassis: newOwnedChassis });
        return { success: true, message: `${stat.toUpperCase()} OVERCLOCKED +${amount}.` };
      },

      purchaseFBCUpgrade: (upgradeType, cost) => {
        const state = get();
        if (!state.isFBC) return { success: false, message: 'NOT FBC CONVERTED' };
        
        const currentChassis = state.ownedChassis.find(c => c.id === state.currentChassis);
        if (!currentChassis) return { success: false, message: 'NO CHASSIS' };
        
        if (state.funds < cost) return { success: false, message: `INSUFFICIENT FUNDS (${cost} eb)` };
        
        const newOwnedChassis = state.ownedChassis.map(c => {
          if (c.id === state.currentChassis) {
            return {
              ...c,
              upgrades: {
                ...c.upgrades,
                [upgradeType]: true
              }
            };
          }
          return c;
        });
        
        set({ funds: state.funds - cost, ownedChassis: newOwnedChassis });
        return { success: true, message: `${upgradeType.toUpperCase()} INSTALLED ON ${currentChassis.name}.` };
      },

      getFBCInfo: () => {
        const state = get();
        if (!state.isFBC) return { isFBC: false };
        
        const currentChassis = state.ownedChassis.find(c => c.id === state.currentChassis);
        return {
          isFBC: true,
          hasBiopod: state.hasBiopod,
          currentChassis: currentChassis,
          sdp: state.sdp,
          maxSdp: state.maxSdp,
          ownedChassis: state.ownedChassis,
          totalSdp: Object.values(state.sdp).reduce((a, b) => a + b, 0),
          totalMaxSdp: Object.values(state.maxSdp).reduce((a, b) => a + b, 0)
        };
      },

      setInterfaceType: (type) => set({ interfaceType: type }),
      setUpgradeProgramming: (level) => set((state) => ({
        programming: level,
        skills: { ...state.skills, programming: level }
      })),
      startProgramming: (program, days) => set({ isProgramming: true, programmingDays: days, pendingProgram: program, compilationSuccess: null }),
      cancelProgramming: () => set({ isProgramming: false, programmingDays: 0, pendingProgram: null, compilationSuccess: null }),
      completeProgramming: () => set((state) => {
        const program = state.pendingProgram;
        const success = state.compilationSuccess;
        
        if (success === false) {
          return {
            isProgramming: false,
            programmingDays: 0,
            pendingProgram: null,
            compilationSuccess: null,
            completedProgram: null
          };
        }
        
        return {
          isProgramming: false,
          programmingDays: 0,
          pendingProgram: null,
          compilationSuccess: null,
          completedProgram: success === true ? program : null
        };
      }),

      clearCompletedProgram: () => set({ completedProgram: null }),

      setCompilationSuccess: (success) => set({ compilationSuccess: success }),
 
      rollSkillCheck: (difficulty) => {
        const state = get();
        const int = state.int;
        const programming = state.programming;
        const interfaceBonus = state.interfaceType === 'interfacePlugs' ? 1 : state.interfaceType === 'trodes' ? -1 : 0;
        const roll = Math.floor(Math.random() * 10) + 1;
        const total = int + programming + roll + interfaceBonus;
        const success = total >= difficulty;
        set({ compilationSuccess: success, lastSkillRoll: { int, programming, interfaceBonus, roll, total, difficulty } });
        return { total, success, roll, difficulty };
      },

      calculateCompilationCost: (difficulty, type) => {
        const typeMultipliers = {
          'intrusion': 1, 'utility': 1,
          'anti-ice': 25, 'anti-system': 4,
          'stealth': 1, 'defense': 1,
          'daemon': 2
        };
        const multiplier = typeMultipliers[type] || 1;
        return Math.floor(difficulty * 10 * multiplier);
      },

      calculateCompilationTime: (difficulty) => {
        return Math.ceil(difficulty * 6 / 24);
      },

      addChipToStorage: (program) => set((state) => ({
        chipStorage: [...state.chipStorage, { ...program, chipId: `chip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` }]
      })),

      removeChipFromStorage: (chipId) => set((state) => ({
        chipStorage: state.chipStorage.filter(c => c.chipId !== chipId)
      })),

      copyProgramToChip: (program, cost = 10) => set((state) => {
        if (state.funds < cost) return state;
        const chipProgram = { ...program, chipId: `chip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, isOnChip: true };
        return {
          funds: state.funds - cost,
          chipStorage: [...state.chipStorage, chipProgram]
        };
      }),

      pirateProgram: (program) => {
        const state = get();
        const pirateDiff = 28;
        const roll = Math.floor(Math.random() * 10) + 1;
        const total = state.programming + roll;
        
        if (total >= pirateDiff) {
          const piratedProgram = { ...program, id: `pirated_${program.id}_${Date.now()}`, isPirated: true };
          set({ chipStorage: [...state.chipStorage, piratedProgram] });
          return { success: true, roll: total, difficulty: pirateDiff };
        } else {
          return { success: false, roll: total, difficulty: pirateDiff };
        }
      },

      installChip: (chipId) => set((state) => {
        const chip = state.chipStorage.find(c => c.chipId === chipId);
        if (!chip) return { chipInstallResult: null };
        
        return {
          chipStorage: state.chipStorage.filter(c => c.chipId !== chipId),
          chipInstallResult: chip
        };
      }),

      clearChipInstallResult: () => set({ chipInstallResult: null }),
      addIp: (amount) => set((state) => ({
        ip: state.ip + amount,
        totalIpEarned: state.totalIpEarned + amount
      })),
      increaseSkill: (skillName, points = 1) => set((state) => {
        const cost = points * 100;
        if (state.ip >= cost && state.skills[skillName] !== undefined) {
          const newSkills = { ...state.skills, [skillName]: state.skills[skillName] + points };
          return {
            ip: state.ip - cost,
            skills: newSkills,
            interfaceLvl: newSkills.interface,
            programming: newSkills.programming
          };
        }
        return state;
      }),
      resetIp: () => set({ ip: 0, totalIpEarned: 0 }),
      setTimelagInterface: (value) => set({ timelagInterface: value }),
      setTimelagReflex: (value) => set({ timelagReflex: value }),
      installCyberware: (ware) => set((state) => {
        const newHumanity = Math.max(0, state.humanity - ware.humanityCost);
        const newCyberware = [...state.cyberware, ware];
        const cpLevel = newHumanity <= 30 ? 3 : newHumanity <= 50 ? 2 : newHumanity <= 70 ? 1 : 0;
        return {
          cyberware: newCyberware,
          humanity: newHumanity,
          cyberpsychosisLevel: cpLevel,
          riots: cpLevel >= 3 ? state.riots + 1 : state.riots
        };
      }),
      removeCyberware: (wareId) => set((state) => {
        const ware = state.cyberware.find(w => w.id === wareId);
        if (!ware) return state;
        const newCyberware = state.cyberware.filter(w => w.id !== wareId);
        const newHumanity = Math.min(state.maxHumanity, state.humanity + ware.humanityCost);
        const cpLevel = newHumanity <= 30 ? 3 : newHumanity <= 50 ? 2 : newHumanity <= 70 ? 1 : 0;
        return {
          cyberware: newCyberware,
          humanity: newHumanity,
          cyberpsychosisLevel: cpLevel
        };
      }),
      getCyberwareBonus: (stat) => {
        const state = get();
        return state.cyberware.reduce((total, w) => total + (w.bonuses?.[stat] || 0), 0);
      },
      getCyberpsychosisEffects: () => {
        const state = get();
        const level = state.cyberpsychosisLevel;
        return {
          uiGlitches: level >= 1,
          hallucinations: level >= 2,
          forcedReckless: level >= 3,
          detectionPenalty: level >= 2 ? -2 : level >= 1 ? -1 : 0,
          evasionPenalty: level >= 2 ? -2 : 0
        };
      },
      updateFactionRep: (faction, amount) => set((state) => {
        const newRep = { ...state.factionReputation };
        newRep[faction] = Math.max(-100, Math.min(100, (newRep[faction] || 0) + amount));
        const vipUnlocked = Object.values(newRep).some(r => r >= 50);
        return { factionReputation: newRep, vipMarketUnlocked: vipUnlocked };
      }),
      getFactionWantedLevel: (faction) => {
        const state = get();
        const rep = state.factionReputation[faction] || 0;
        if (rep <= -50) return 3;
        if (rep <= -20) return 2;
        if (rep < 0) return 1;
        return 0;
      },
      getEnemyBonus: (faction) => {
        const state = get();
        const rep = state.factionReputation[faction] || 0;
        if (rep <= -50) return 3;
        if (rep <= -20) return 2;
        if (rep < 0) return 1;
        return 0;
      },
      getFactionPerks: (faction) => {
        const state = get();
        const rep = state.factionReputation[faction] || 0;
        return {
          vipAccess: rep >= 50,
          discount: rep >= 30 ? 0.2 : rep >= 20 ? 0.1 : 0,
          iceBuff: rep <= -30 ? Math.abs(rep) / 20 : 0
        };
      },
      resetCharacter: () => set({
        handle: 'Unknown',
        int: 8,
        ref: 6,
        tech: 5,
        cool: 5,
        attr: 5,
        luck: 5,
        ma: 6,
        body: 5,
        interfaceLvl: 4,
        programming: 3,
        funds: 1500,
        neuralDamage: 0,
        maxInt: 8,
        interfaceType: 'default',
        timelagInterface: false,
        timelagReflex: false,
        isProgramming: false,
        programmingDays: 0,
        pendingProgram: null,
        compilationSuccess: null,
        completedProgram: null,
        chipStorage: [],
        chipInstallResult: null,
        ip: 0,
        totalIpEarned: 0,
        housingType: 'apartment',
        housingCost: 200,
        daysPassedInMonth: 0,
        daysPerMonth: 30,
        isStreet: false,
        hunger: 100,
        foodType: 'prepack',
        starvingDays: 0,
        freshFoodBonus: null,
        sleep: 100,
        stimulants: 0,
        hoursAwake: 0,
        isStimulated: false,
        telecomBill: 0,
        routingMinutes: 0,
        hasBodyweightSystem: false,
        nutrientPacks: 0,
        isImmersionMode: false,
        immersionTimer: 0,
        systemShockActive: false,
        systemShockHours: 0,
        immersionHoursTotal: 0,
        hasDataCreche: false,
        crecheInstalled: false,
        videoboardActive: false,
        externalThreatAlert: false,
        isFBC: false,
        hasBiopod: false,
        currentChassis: null,
        ownedChassis: [],
        sdp: { head: 30, lArm: 20, rArm: 20, lLeg: 20, rLeg: 20, torso: 40 },
        maxSdp: { head: 30, lArm: 20, rArm: 20, lLeg: 20, rLeg: 20, torso: 40 },
        fbcUpgrades: {
          overclocked: { ref: 0, ma: 0, body: 0 },
          ccplRetrofit: false,
          quickMounts: false,
          hardenedShielding: false
        },
        skills: {
          interface: 4,
          programming: 3,
          electronics: 2,
          cryptography: 1,
          librarySearch: 2,
          handgun: 3,
          brawling: 2
        },
        humanity: 100,
        maxHumanity: 100,
        cyberware: [],
        cyberpsychosisLevel: 0,
        riots: 0,
        factionReputation: {
          arasaka: 0,
          militech: 0,
          petrochem: 0,
          biotechnica: 0,
          eurospace: 0,
          sovspace: 0
        },
        vipMarketUnlocked: false
      }),
      createCharacter: (charData) => set({
        handle: charData.handle || 'Unknown',
        int: charData.int || 8,
        ref: charData.ref || 6,
        tech: charData.tech || 5,
        cool: charData.cool || 5,
        attr: charData.attr || 5,
        luck: charData.luck || 5,
        ma: charData.ma || 6,
        body: charData.body || 5,
        interfaceLvl: charData.skills?.interface || 4,
        programming: charData.skills?.programming || 3,
        skills: charData.skills || {
          interface: 4,
          programming: 3,
          electronics: 2,
          cryptography: 1,
          librarySearch: 2,
          handgun: 3,
          brawling: 2,
          awareness: 1,
          basicTech: 1,
          education: 1,
          systemKnowledge: 1,
          cyberTech: 1,
          cyberdeckDesign: 1,
          composition: 1
        },
        funds: charData.funds || 1500,
        neuralDamage: 0,
        maxInt: charData.int || 8,
        interfaceType: 'default',
        timelagInterface: false,
        timelagReflex: false,
        isProgramming: false,
        programmingDays: 0,
        pendingProgram: null,
        compilationSuccess: null,
        completedProgram: null,
        chipStorage: [],
        chipInstallResult: null,
        ip: 0,
        totalIpEarned: 0,
        housingType: charData.housingType || 'apartment',
        housingCost: charData.housingCost || 200,
        daysPassedInMonth: 0,
        daysPerMonth: 30,
        isStreet: false,
        hunger: 100,
        foodType: 'prepack',
        starvingDays: 0,
        freshFoodBonus: null,
        sleep: 100,
        stimulants: 0,
        hoursAwake: 0,
        isStimulated: false,
        telecomBill: 0,
        routingMinutes: 0,
        hasBodyweightSystem: false,
        nutrientPacks: 0,
        isImmersionMode: false,
        immersionTimer: 0,
        systemShockActive: false,
        systemShockHours: 0,
        immersionHoursTotal: 0,
        hasDataCreche: false,
        crecheInstalled: false,
        videoboardActive: false,
        externalThreatAlert: false,
        isFBC: false,
        hasBiopod: false,
        currentChassis: null,
        ownedChassis: [],
        sdp: { head: 30, lArm: 20, rArm: 20, lLeg: 20, rLeg: 20, torso: 40 },
        maxSdp: { head: 30, lArm: 20, rArm: 20, lLeg: 20, rLeg: 20, torso: 40 },
        fbcUpgrades: {
          overclocked: { ref: 0, ma: 0, body: 0 },
          ccplRetrofit: false,
          quickMounts: false,
          hardenedShielding: false
        },
        humanity: (charData.emp || 8) * 10,
        maxHumanity: (charData.emp || 8) * 10,
        cyberware: [],
        cyberpsychosisLevel: 0,
        riots: 0,
        factionReputation: {
          arasaka: 0,
          militech: 0,
          petrochem: 0,
          biotechnica: 0,
          eurospace: 0,
          sovspace: 0
        },
        vipMarketUnlocked: false
      })
    }),
    {
      name: 'meatspace-storage',
      version: 6,
      migrate: (persistedState, version) => {
        if (version === 0 || version === 1) {
          return {
            ...persistedState,
            neuralDamage: 0,
            maxInt: persistedState.int || 8,
            ip: 0,
            totalIpEarned: 0,
            timelagInterface: false,
            timelagReflex: false,
            skills: {
              interface: persistedState.interfaceLvl || 4,
              programming: persistedState.programming || 3,
              electronics: 2,
              cryptography: 1,
              librarySearch: 2,
              handgun: 3,
              brawling: 2
            },
            humanity: 100,
            maxHumanity: 100,
            cyberware: [],
            cyberpsychosisLevel: 0,
            riots: 0,
            factionReputation: {
              arasaka: 0,
              militech: 0,
              petrochem: 0,
              biotechnica: 0,
              eurospace: 0,
              sovspace: 0
            },
            vipMarketUnlocked: false
          };
        }
        if (version === 2) {
          return {
            ...persistedState,
            timelagInterface: persistedState.timelagInterface || false,
            timelagReflex: persistedState.timelagReflex || false,
            humanity: persistedState.humanity || 100,
            maxHumanity: persistedState.maxHumanity || 100,
            cyberware: persistedState.cyberware || [],
            cyberpsychosisLevel: persistedState.cyberpsychosisLevel || 0,
            riots: persistedState.riots || 0,
            factionReputation: {
              arasaka: 0,
              militech: 0,
              petrochem: 0,
              biotechnica: 0,
              eurospace: 0,
              sovspace: 0
            },
            vipMarketUnlocked: false
          };
        }
        if (version === 3) {
          return {
            ...persistedState,
            factionReputation: persistedState.factionReputation || {
              arasaka: 0,
              militech: 0,
              petrochem: 0,
              biotechnica: 0,
              eurospace: 0,
              sovspace: 0
            },
            vipMarketUnlocked: persistedState.vipMarketUnlocked || false
          };
        }
        if (version === 4) {
          return {
            ...persistedState,
            hasBodyweightSystem: false,
            nutrientPacks: 0,
            isImmersionMode: false,
            immersionTimer: 0,
            systemShockActive: false,
            systemShockHours: 0,
            immersionHoursTotal: 0,
            hasDataCreche: false,
            crecheInstalled: false,
            videoboardActive: false,
            externalThreatAlert: false
          };
        }
        if (version === 5) {
          return {
            ...persistedState,
            isFBC: false,
            hasBiopod: false,
            currentChassis: null,
            ownedChassis: [],
            sdp: { head: 30, lArm: 20, rArm: 20, lLeg: 20, rLeg: 20, torso: 40 },
            maxSdp: { head: 30, lArm: 20, rArm: 20, lLeg: 20, rLeg: 20, torso: 40 },
            fbcUpgrades: {
              overclocked: { ref: 0, ma: 0, body: 0 },
              ccplRetrofit: false,
              quickMounts: false,
              hardenedShielding: false
            }
          };
        }
        return persistedState;
      }
    }
  )
);