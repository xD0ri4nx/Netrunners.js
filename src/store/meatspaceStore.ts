import type { IconTier, LagToggleMode } from "../shared/multiplayerTypes";
import { COSMETIC_ICON_TIERS } from "../shared/daemonCatalog";
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useRoutingStore } from './routingStore';
import type { SkillSet, SDP, ChassisInfo, Program, CyberwareItem } from '../types/game.types';

interface FBCUpgrades {
  ccpl?: boolean;
  overclocked: { ref: number; ma: number; body: number };
  ccplRetrofit: boolean;
  quickMounts: boolean;
  hardenedShielding: boolean;
}

interface FactionReputation {
  kurokawa: number;
  militech: number;
  somachem: number;
  biotechnica: number;
  eurospace: number;
  sovspace: number;
  [key: string]: number;
}

interface SkillRoll {
  int: number;
  programming: number;
  interfaceBonus: number;
  roll: number;
  total: number;
  difficulty: number;
}

interface MeatspaceState {
  handle: string;
  homeLdl: string;
  isNomad: boolean;
  nomadClan: string | null;
  int: number;
  ref: number;
  tech: number;
  cool: number;
  attr: number;
  luck: number;
  ma: number;
  body: number;
  interfaceLvl: number;
  programming: number;
  funds: number;
  credits: number;
  hasLagSwitch: boolean;
  lagToggleMode: LagToggleMode;
  equippedIconTier: IconTier;
  ownedIconTiers: IconTier[];
  neuralDamage: number;
  maxInt: number;
  interfaceType: string;
  timelagInterface: boolean;
  timelagReflex: boolean;
  isProgramming: boolean;
  programmingDays: number;
  pendingProgram: Program | null;
  compilationSuccess: boolean | null;
  completedProgram: Program | null;
  chipStorage: Program[];
  chipInstallResult: Program | null;
  ip: number;
  totalIpEarned: number;
  housingType: string;
  housingCost: number;
  daysPassedInMonth: number;
  daysPerMonth: number;
  isStreet: boolean;
  hunger: number;
  foodType: string;
  starvingDays: number;
  freshFoodBonus: { stat: string; expiresIn: number } | null;
  sleep: number;
  stimulants: number;
  hoursAwake: number;
  isStimulated: boolean;
  telecomBill: number;
  routingMinutes: number;
  hasBodyweightSystem: boolean;
  nutrientPacks: number;
  isImmersionMode: boolean;
  immersionTimer: number;
  systemShockActive: boolean;
  systemShockHours: number;
  immersionHoursTotal: number;
  hasDataCreche: boolean;
  crecheInstalled: boolean;
  videoboardActive: boolean;
  externalThreatAlert: boolean;
  isFBC: boolean;
  hasBiopod: boolean;
  currentChassis: string | null;
  ownedChassis: Array<ChassisInfo & { upgrades: FBCUpgrades }>;
  sdp: SDP;
  maxSdp: SDP;
  fbcUpgrades: FBCUpgrades;
  skills: SkillSet;
  humanity: number;
  maxHumanity: number;
  cyberware: CyberwareItem[];
  cyberpsychosisLevel: number;
  riots: number;
  factionReputation: FactionReputation;
  vipMarketUnlocked: boolean;
  health: number;
  maxHealth: number;
  lastSkillRoll: SkillRoll | null;
  message: string | null;
  lethalDamage: { turns: number } | null;
  takeDamage: (amount: number) => void;
  combatBonus: number;

  addFunds: (amount: number) => void;
  takeNeuralDamage: (amount: number) => void;
  getCurrentInt: () => number;
  healNeuralDamage: (amount: number) => void;
  heal: () => void;
  deductFunds: (amount: number) => void;
  setHousing: (type: string, cost: number) => void;
  relocate: (targetId: string) => { success: boolean; message: string };
  joinClan: (clan: string) => void;
  leaveClan: () => void;
  passDay: () => void;
  payRent: () => { success: boolean; message: string };
  checkRentDue: () => boolean;
  getHousingInfo: () => {
    type: string;
    cost: number;
    daysUntilRent: number;
    isStreet: boolean;
    isRentDue: boolean;
  };
  eatFood: (foodType: string) => { success: boolean; message: string };
  processDayHunger: () => void;
  getHungerInfo: () => {
    hunger: number;
    foodType: string;
    starvingDays: number;
    freshFoodBonus: { stat: string; expiresIn: number } | null;
    isStarving: boolean;
  };
  useStimulant: () => { success: boolean; message: string };
  buyStimulants: (amount: number) => { success: boolean; message: string };
  rest: () => void;
  processDaySleep: () => void;
  getSleepInfo: () => {
    sleep: number;
    stimulants: number;
    hoursAwake: number;
    isStimulated: boolean;
    deprivationPenalty: number;
    isDeprived: boolean;
  };
  addRoutingCharge: () => void;
  payTelecomBill: () => { success: boolean; message: string };
  utilityFraud: () => { success: boolean; message: string };
  getTelecomInfo: () => { telecomBill: number; routingMinutes: number };
  purchaseBodyweightSystem: () => { success: boolean; message: string };
  buyNutrientPacks: (amount: number) => { success: boolean; message: string };
  startImmersion: () => { success: boolean; message: string };
  endImmersion: () => { success: boolean; message: string };
  processTurnImmersion: () => void;
  triggerExternalThreat: () => void;
  clearExternalThreat: () => void;
  processSystemShock: () => void;
  getImmersionInfo: () => Record<string, unknown>;
  purchaseDataCreche: () => { success: boolean; message: string };
  getCrecheDeckStats: () => { speed: number; mu: number; dataWalls: number } | null;
  convertToFBC: (chassisId: string, cost?: number) => { success: boolean; message: string };
  purchaseChassis: (chassisId: string) => { success: boolean; message: string };
  swapChassis: (chassisId: string) => { success: boolean; message: string };
  repairSDP: (amount: number, costPerPoint?: number) => { success: boolean; message: string };
  takePhysicalDamage: (amount: number) => { destroyed?: boolean; message?: string } | undefined;
  upgradeFBCStat: (stat: string, amount?: number, costPerPoint?: number) => { success: boolean; message: string };
  purchaseFBCUpgrade: (upgradeType: string, cost: number) => { success: boolean; message: string };
  getFBCInfo: () => Record<string, unknown>;
  setInterfaceType: (type: string) => void;
  setUpgradeProgramming: (level: number) => void;
  startProgramming: (program: Program, days: number) => void;
  cancelProgramming: () => void;
  completeProgramming: () => void;
  clearCompletedProgram: () => void;
  setCompilationSuccess: (success: boolean | null) => void;
  rollSkillCheck: (difficulty: number) => { total: number; success: boolean; roll: number; difficulty: number };
  calculateCompilationCost: (difficulty: number, type: string) => number;
  calculateCompilationTime: (difficulty: number) => number;
  addChipToStorage: (program: Program) => void;
  removeChipFromStorage: (chipId: string) => void;
  copyProgramToChip: (program: Program, cost?: number) => void;
  pirateProgram: (program: Program) => { success: boolean; roll: number; difficulty: number };
  installChip: (chipId: string) => void;
  clearChipInstallResult: () => void;
  addIp: (amount: number) => void;
  increaseSkill: (skillName: string, points?: number) => void;
  resetIp: () => void;
  setTimelagInterface: (value: boolean) => void;
  setTimelagReflex: (value: boolean) => void;
  installCyberware: (ware: CyberwareItem) => void;
  removeCyberware: (wareId: string) => void;
  getCyberwareBonus: (stat: string) => number;
  getCyberpsychosisEffects: () => {
    uiGlitches: boolean;
    hallucinations: boolean;
    forcedReckless: boolean;
    detectionPenalty: number;
    evasionPenalty: number;
  };
  updateFactionRep: (faction: string, amount: number) => void;
  getFactionWantedLevel: (faction: string) => number;
  getEnemyBonus: (faction: string) => number;
  getFactionPerks: (faction: string) => {
    vipAccess: boolean;
    discount: number;
    iceBuff: number;
  };
  buyNeuralLagSwitch: () => { success: boolean; message: string };
  setLagToggleMode: (mode: LagToggleMode) => { success: boolean; message: string };
  buyCosmeticIcon: (tier: IconTier) => { success: boolean; message: string };
  resetCharacter: () => void;
  createCharacter: (charData: CharacterCreationData) => void;
}

interface CharacterCreationData {
  handle?: string;
  homeLdl?: string;
  isNomad?: boolean;
  nomadClan?: string | null;
  int?: number;
  ref?: number;
  tech?: number;
  cool?: number;
  attr?: number;
  luck?: number;
  ma?: number;
  body?: number;
  skills?: Partial<SkillSet>;
  funds?: number;
  housingType?: string;
  housingCost?: number;
  emp?: number;
}

const FBC_CHASSIS: ChassisInfo[] = [
  { id: 'fbc_gemini', name: 'Gemini', category: 'chromebook2', cost: 55000, desc: 'Human-passing chassis. Bypasses security. No inherent armor.', baseStats: { ref: 10, ma: 10, body: 12, sp: 0 }, sdp: { head: 30, lArm: 20, rArm: 20, lLeg: 20, rLeg: 20, torso: 40 } },
  { id: 'fbc_alpha', name: 'Alpha Class', category: 'chromebook2', cost: 58000, desc: 'Standard combat/solo conversion. Heavily armored.', baseStats: { ref: 10, ma: 10, body: 12, sp: 25 }, sdp: { head: 30, lArm: 20, rArm: 20, lLeg: 20, rLeg: 20, torso: 40 } },
  { id: 'fbc_wingman', name: 'Wingman', category: 'chromebook2', cost: 54000, desc: 'Aerospace pilot. Immune to high G-forces.', baseStats: { ref: 15, ma: 10, body: 12, sp: 25 }, sdp: { head: 30, lArm: 20, rArm: 20, lLeg: 20, rLeg: 20, torso: 40 } },
  { id: 'fbc_eclipse', name: 'Eclipse', category: 'chromebook2', cost: 76000, desc: 'Espionage chassis. Radar-absorbent, silent joints.', baseStats: { ref: 10, ma: 12, body: 10, sp: 15 }, sdp: { head: 30, lArm: 20, rArm: 20, lLeg: 20, rLeg: 20, torso: 40 } },
  { id: 'fbc_aquarius', name: 'Aquarius', category: 'chromebook2', cost: 65000, desc: 'Deep-sea operations. Sonar, pressure resistant.', baseStats: { ref: 8, ma: 10, body: 12, sp: 15 }, special: 'underwater', sdp: { head: 30, lArm: 20, rArm: 20, lLeg: 20, rLeg: 20, torso: 50 } },
  { id: 'fbc_fireman', name: 'Fireman', category: 'chromebook2', cost: 60000, desc: 'Hazard/rescue. Immune to heat and toxins.', baseStats: { ref: 8, ma: 10, body: 14, sp: 20 }, sdp: { head: 30, lArm: 30, rArm: 30, lLeg: 30, rLeg: 30, torso: 50 } },
  { id: 'fbc_samson', name: 'Samson', category: 'chromebook2', cost: 40000, desc: 'Heavy industrial. Massive lifting capacity.', baseStats: { ref: 6, ma: 8, body: 18, sp: 15 }, sdp: { head: 30, lArm: 40, rArm: 40, lLeg: 50, rLeg: 50, torso: 60 } },
  { id: 'fbc_wiseman', name: 'Wiseman', category: 'chromebook3', cost: 90000, desc: 'Netrunner chassis. Extra MU, Firestarter immune.', baseStats: { ref: 10, ma: 10, body: 12, sp: 15 }, special: 'firestarterImmune', sdp: { head: 30, lArm: 20, rArm: 20, lLeg: 20, rLeg: 20, torso: 40 } },
  { id: 'fbc_dragoon', name: 'Dragoon', category: 'chromebook3', cost: 120000, desc: 'Military tank. Mount heavy weapons.', baseStats: { ref: 15, ma: 25, body: 20, sp: 40 }, sdp: { head: 40, lArm: 50, rArm: 50, lLeg: 50, rLeg: 50, torso: 60 } },
  { id: 'fbc_spyder', name: 'Spyder', category: 'chromebook3', cost: 118110, desc: 'Multi-limbed. Wall-crawling capability.', baseStats: { ref: 12, ma: 20, body: 12, sp: 30 }, sdp: { head: 30, lArm: 20, rArm: 20, lLeg: 20, rLeg: 20, torso: 40 } },
  { id: 'fbc_copernicus', name: 'Copernicus', category: 'deepspace', cost: 60000, desc: 'Space exploration. Radiation/EMP shielded.', baseStats: { ref: 11, ma: 10, body: 12, sp: 25 }, special: 'space', sdp: { head: 30, lArm: 20, rArm: 20, lLeg: 20, rLeg: 20, torso: 40 } },
  { id: 'fbc_burroughs', name: 'Burroughs', category: 'deepspace', cost: 65000, desc: 'Mars operations. Sandstorm resistant.', baseStats: { ref: 10, ma: 10, body: 12, sp: 30 }, special: 'mars', sdp: { head: 30, lArm: 30, rArm: 30, lLeg: 40, rLeg: 40, torso: 50 } },
];

export const useMeatspaceStore = create<MeatspaceState>()(
  persist(
    (set, get) => ({
      handle: 'Unknown',
      homeLdl: 'night_city',
      isNomad: false,
      nomadClan: null as string | null,
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
      credits: 1500,
      hasLagSwitch: false,
      lagToggleMode: "earth" as LagToggleMode,
      equippedIconTier: "SIMPLE" as IconTier,
      ownedIconTiers: ["SIMPLE"] as IconTier[],
      neuralDamage: 0,
      maxInt: 8,
      interfaceType: 'default',
      timelagInterface: false,
      timelagReflex: false,
      isProgramming: false,
      programmingDays: 0,
      pendingProgram: null as Program | null,
      compilationSuccess: null as boolean | null,
      completedProgram: null as Program | null,
      chipStorage: [] as Program[],
      chipInstallResult: null as Program | null,
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
      freshFoodBonus: null as { stat: string; expiresIn: number } | null,
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
      currentChassis: null as string | null,
      ownedChassis: [] as Array<ChassisInfo & { upgrades: FBCUpgrades }>,
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
      cyberware: [] as CyberwareItem[],
      cyberpsychosisLevel: 0,
      riots: 0,
      factionReputation: {
        kurokawa: 0,
        militech: 0,
        somachem: 0,
        biotechnica: 0,
        eurospace: 0,
        sovspace: 0
      },
      vipMarketUnlocked: false,
      health: 0,
      maxHealth: 0,
      lastSkillRoll: null as SkillRoll | null,
      message: null as string | null,
      lethalDamage: null as { turns: number } | null,
      combatBonus: 0,

      addFunds: (amount: number) => set((state: MeatspaceState) => ({ funds: state.funds + amount })),
      takeNeuralDamage: (amount: number) => set((state: MeatspaceState) => ({
        neuralDamage: Math.min(state.maxInt - 2, state.neuralDamage + amount)
      })),
      takeDamage: (amount: number) => set((state: MeatspaceState) => ({ neuralDamage: Math.min(state.maxInt - 2, state.neuralDamage + amount) })),
      getCurrentInt: (): number => {
        const state = get();
        const neuralDamage = state.neuralDamage || 0;
        const maxInt = state.maxInt || 8;
        return Math.max(2, maxInt - neuralDamage);
      },
      healNeuralDamage: (amount: number) => set((state: MeatspaceState) => ({
        neuralDamage: Math.max(0, state.neuralDamage - amount)
      })),
      heal: () => set(() => ({ neuralDamage: 0 })),
      deductFunds: (amount: number) => set((state: MeatspaceState) => ({ funds: Math.max(0, state.funds - amount) })),
      
      setHousing: (type: string, cost: number) => {
        const state = get();
        if (type === 'coffin' && state.housingType === 'penthouse') {
          set({ isStreet: true, housingType: 'street', housingCost: 0 });
          return;
        }
        set({ housingType: type, housingCost: cost, isStreet: false });
      },
      relocate: (targetId: string) => {
        const state = get();
        if (targetId === state.homeLdl) return { success: false, message: 'ALREADY THERE.' };
        const fee = state.isNomad ? 0 : 500;
        if (state.funds < fee) return { success: false, message: `INSUFFICIENT FUNDS (RELOCATION: ${fee} cr).` };
        set({ funds: state.funds - fee, homeLdl: targetId });
        return { success: true, message: fee === 0 ? `CLAN CONVOY MOVED YOU TO ${targetId.toUpperCase()}. NO CHARGE.` : `RELOCATED TO ${targetId.toUpperCase()} FOR ${fee} cr.` };
      },
      joinClan: (clan: string) => set({ isNomad: true, nomadClan: clan }),
      leaveClan: () => set({ isNomad: false, nomadClan: null }),
      
      passDay: () => set((state: MeatspaceState) => {
        const newDays = state.daysPassedInMonth + 1;
        return { daysPassedInMonth: newDays };
      }),
      
      payRent: () => {
        const state = get();
        if (state.funds >= state.housingCost && !state.isStreet) {
          set({ funds: state.funds - state.housingCost, daysPassedInMonth: 0 });
          return { success: true, message: "RENT PAID." };
        }
        set({ isStreet: true, housingType: "street", housingCost: 0, daysPassedInMonth: 0 });
        return { success: false, message: "CANNOT AFFORD RENT - MOVED TO STREET." };
      },
      
      checkRentDue: (): boolean => {
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

      eatFood: (foodType: string) => {
        const state = get();
        const costs: Record<string, number> = { kibble: 50, prepack: 150, fresh: 500 };
        const hungerRestore: Record<string, number> = { kibble: 40, prepack: 60, fresh: 80 };
        
        if (state.funds < costs[foodType]) return { success: false, message: 'INSUFFICIENT FUNDS' };
        
        const newState: Record<string, unknown> = { 
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
        return { success: true, message: (newState.message as string) || '' };
      },

      processDayHunger: () => set((state: MeatspaceState) => {
        const newHunger = Math.max(0, state.hunger - 30);
        const newStarvingDays = newHunger === 0 ? state.starvingDays + 1 : 0;
        
        let statChanges: Record<string, number> = {};
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

      buyStimulants: (amount: number) => {
        const state = get();
        const costPerUnit = 100;
        const totalCost = amount * costPerUnit;
        
        if (state.funds < totalCost) return { success: false, message: 'INSUFFICIENT FUNDS' };
        
        set({ 
          funds: state.funds - totalCost, 
          stimulants: state.stimulants + amount 
        });
        
        return { success: true, message: `BOUGHT ${amount} STIMULANTS FOR ${totalCost} cr.` };
      },

      rest: () => set((state: MeatspaceState) => ({
        sleep: 100,
        hoursAwake: 0,
        isStimulated: false
      })),

      processDaySleep: () => set((state: MeatspaceState) => {
        let newSleep = state.sleep;
        let newHoursAwake = state.hoursAwake;
        
        if (state.isStimulated) {
          newHoursAwake += 8;
          newSleep = Math.max(0, state.sleep - 10);
        } else {
          newHoursAwake += 16;
          newSleep = Math.max(0, state.sleep - 25);
        }
        
        let statChanges: Record<string, number> = {};
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

      addRoutingCharge: () => set((state: MeatspaceState) => ({
        telecomBill: state.telecomBill + 5,
        routingMinutes: state.routingMinutes + 1
      })),

      payTelecomBill: () => {
        const state = get();
        if (state.funds < state.telecomBill) return { success: false, message: 'INSUFFICIENT FUNDS' };
        set({ funds: state.funds - state.telecomBill, telecomBill: 0, routingMinutes: 0 });
        return { success: true, message: `TELECOM BILL PAID: ${state.telecomBill} cr.` };
      },

      utilityFraud: () => {
        const state = get();
        const roll = Math.floor(Math.random() * 10) + 1;
        const total = state.programming + roll;
        
        if (total >= 20) {
          set({ telecomBill: 0, routingMinutes: 0 });
          return { success: true, message: `FRAUD SUCCESS (${total} >= 20). BILL WAIVED.` };
        } else {
          const { addTraceRisk } = useRoutingStore.getState();
          addTraceRisk(10);
          return { success: false, message: `FRAUD FAILED (${total} < 20). GRIDSEC ALERTED. +10 TRACE.` };
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
        if (state.funds < 5000) return { success: false, message: 'INSUFFICIENT FUNDS (5000 cr)' };
        set({ funds: state.funds - 5000, hasBodyweightSystem: true });
        return { success: true, message: 'BODYWEIGHT LIFESUPPORT PURCHASED. 5000 cr.' };
      },

      buyNutrientPacks: (amount: number) => {
        const state = get();
        const costPerPack = 100;
        const totalCost = amount * costPerPack;
        if (state.funds < totalCost) return { success: false, message: `INSUFFICIENT FUNDS (${totalCost} cr)` };
        if (!state.hasBodyweightSystem) return { success: false, message: 'BODYWEIGHT SYSTEM NOT INSTALLED' };
        set({ funds: state.funds - totalCost, nutrientPacks: state.nutrientPacks + amount });
        return { success: true, message: `BOUGHT ${amount} NUTRIENT PACKS FOR ${totalCost} cr.` };
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
        if (!state.isImmersionMode) return { success: false, message: 'NOT IN IMMERSION MODE' };

        const newState: Record<string, unknown> = { isImmersionMode: false };

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
        return { success: true, message: (newState.message as string) || 'JACK-OUT COMPLETE.' };
      },

      processTurnImmersion: () => set((state: MeatspaceState) => {
        if (!state.isImmersionMode) return state;

        const newImmersionTimer = state.immersionTimer + 1;
        const newImmersionHoursTotal = state.immersionHoursTotal + 1;
        const maxImmersion = state.hasDataCreche ? 96 : 72;

        let newNutrientPacks = state.nutrientPacks;
        let lethalDamage: { turns: number } | null = null;

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

      triggerExternalThreat: () => set((state: MeatspaceState) => {
        if (!state.isImmersionMode) return state;
        return { externalThreatAlert: true };
      }),

      clearExternalThreat: () => set({ externalThreatAlert: false }),

      processSystemShock: () => set((state: MeatspaceState) => {
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
        if (state.funds < 10000) return { success: false, message: 'INSUFFICIENT FUNDS (10000 cr)' };
        if (state.housingType === 'coffin' || state.isStreet) return { success: false, message: 'REQUIRE APARTMENT OR PENTHOUSE' };
        set({ funds: state.funds - 10000, hasDataCreche: true, crecheInstalled: true });
        return { success: true, message: 'DATA CRECHE INSTALLED. 96h IMMERSION. +1 SPEED, +4 MU, +4 WALLS.' };
      },

      getCrecheDeckStats: () => {
        const state = get();
        if (!state.crecheInstalled) return null;
        return { speed: 1, mu: 12, dataWalls: 4 };
      },

      convertToFBC: (chassisId: string, cost: number = 30000) => {
        const state = get();
        if (state.isFBC) return { success: false, message: 'ALREADY FBC CONVERTED' };
        if (state.funds < cost) return { success: false, message: `INSUFFICIENT FUNDS (${cost} cr)` };
        
        const chassis = FBC_CHASSIS.find(c => c.id === chassisId);
        if (!chassis) return { success: false, message: 'INVALID CHASSIS' };
        
        set({
          funds: state.funds - cost,
          isFBC: true,
          hasBiopod: true,
          currentChassis: chassisId,
          ownedChassis: [{ ...chassis, upgrades: { overclocked: { ref: 0, ma: 0, body: 0 }, ccplRetrofit: false, quickMounts: false, hardenedShielding: false } }],
          sdp: { ...chassis.sdp },
          maxSdp: { ...chassis.sdp },
          humanity: 10,
          maxHumanity: 10
        });
        
        return { success: true, message: `FBC CONVERSION COMPLETE. BIOPOD INSTALLED IN ${chassis.name}. NEURAL HP REPLACED WITH SDP.` };
      },

      purchaseChassis: (chassisId: string) => {
        const state = get();
        if (!state.isFBC) return { success: false, message: 'NOT FBC CONVERTED' };
        
        const chassis = FBC_CHASSIS.find(c => c.id === chassisId);
        if (!chassis) return { success: false, message: 'INVALID CHASSIS' };
        if (state.funds < chassis.cost) return { success: false, message: `INSUFFICIENT FUNDS (${chassis.cost} cr)` };
        if (state.ownedChassis.some(c => c.id === chassisId)) return { success: false, message: 'CHASSIS ALREADY OWNED' };
        
        set({
          funds: state.funds - chassis.cost,
          ownedChassis: [...state.ownedChassis, { ...chassis, upgrades: { overclocked: { ref: 0, ma: 0, body: 0 }, ccplRetrofit: false, quickMounts: false, hardenedShielding: false } }]
        });
        
        return { success: true, message: `PURCHASED ${chassis.name}. BIOPOD CAN BE SWAPPED AT SAFEHOUSE.` };
      },

      swapChassis: (chassisId: string) => {
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

      repairSDP: (amount: number, costPerPoint: number = 10) => {
        const state = get();
        if (!state.isFBC) return { success: false, message: 'NOT FBC CONVERTED' };
        
        const currentTotal = Object.values(state.sdp).reduce((a, b) => a + b, 0);
        const maxTotal = Object.values(state.maxSdp).reduce((a, b) => a + b, 0);
        const repairable = maxTotal - currentTotal;
        
        if (repairable <= 0) return { success: false, message: 'SDP AT MAXIMUM' };
        
        const actualRepair = Math.min(amount, repairable);
        const cost = actualRepair * costPerPoint;
        
        if (state.funds < cost) return { success: false, message: `INSUFFICIENT FUNDS (${cost} cr)` };
        
        const newSdp = { ...state.sdp };
        let remaining = actualRepair;
        const locations = Object.keys(newSdp);
        
        for (const loc of locations) {
          if (remaining <= 0) break;
          const diff = (state.maxSdp as Record<string, number>)[loc] - (newSdp as Record<string, number>)[loc];
          if (diff > 0) {
            const repair = Math.min(diff, remaining);
            (newSdp as Record<string, number>)[loc] += repair;
            remaining -= repair;
          }
        }
        
        set({ funds: state.funds - cost, sdp: newSdp });
        return { success: true, message: `REPAIRED ${actualRepair} SDP FOR ${cost} cr.` };
      },

      takePhysicalDamage: (amount: number) => {
        const state = get();
        if (!state.isFBC) return;
        
        const newSdp = { ...state.sdp };
        let remaining = amount;
        const locations = Object.keys(newSdp);
        
        while (remaining > 0) {
          const randomLoc = locations[Math.floor(Math.random() * locations.length)];
          if ((newSdp as Record<string, number>)[randomLoc] > 0) {
            (newSdp as Record<string, number>)[randomLoc]--;
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

      upgradeFBCStat: (stat: string, amount: number = 1, costPerPoint: number = 5000) => {
        const state = get();
        if (!state.isFBC) return { success: false, message: 'NOT FBC CONVERTED' };
        
        const currentChassis = state.ownedChassis.find(c => c.id === state.currentChassis);
        if (!currentChassis) return { success: false, message: 'NO CHASSIS' };
        
        const currentOverclock = currentChassis.upgrades?.overclocked || { ref: 0, ma: 0, body: 0 };
        
        if (stat === 'ref' && currentOverclock.ref >= 2) return { success: false, message: 'REF ALREADY MAX OVERCLOCKED' };
        if (stat === 'ma' && currentOverclock.ma >= 2) return { success: false, message: 'MA ALREADY MAX OVERCLOCKED' };
        if (stat === 'body' && currentOverclock.body >= 2) return { success: false, message: 'BODY ALREADY MAX OVERCLOCKED' };
        
        const cost = amount * costPerPoint;
        if (state.funds < cost) return { success: false, message: `INSUFFICIENT FUNDS (${cost} cr)` };
        
        const newOwnedChassis = state.ownedChassis.map(c => {
          if (c.id === state.currentChassis) {
            return {
              ...c,
              upgrades: {
                ...c.upgrades,
                overclocked: { ...currentOverclock, [stat]: ((currentOverclock as Record<string, number>)[stat] || 0) + amount }
              }
            };
          }
          return c;
        });
        
        set({ funds: state.funds - cost, ownedChassis: newOwnedChassis });
        return { success: true, message: `${stat.toUpperCase()} OVERCLOCKED +${amount}.` };
      },

      purchaseFBCUpgrade: (upgradeType: string, cost: number) => {
        const state = get();
        if (!state.isFBC) return { success: false, message: 'NOT FBC CONVERTED' };
        
        const currentChassis = state.ownedChassis.find(c => c.id === state.currentChassis);
        if (!currentChassis) return { success: false, message: 'NO CHASSIS' };
        
        if (state.funds < cost) return { success: false, message: `INSUFFICIENT FUNDS (${cost} cr)` };
        
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

      setInterfaceType: (type: string) => set({ interfaceType: type }),
      setUpgradeProgramming: (level: number) => set((state: MeatspaceState) => ({
        programming: level,
        skills: { ...state.skills, programming: level }
      })),
      startProgramming: (program: Program, days: number) => set({ isProgramming: true, programmingDays: days, pendingProgram: { ...program, days }, compilationSuccess: null }),
      cancelProgramming: () => set({ isProgramming: false, programmingDays: 0, pendingProgram: null, compilationSuccess: null }),
      completeProgramming: () => set((state: MeatspaceState) => {
        const program = state.pendingProgram;
        const success = state.compilationSuccess;
        
        if (success === false) {
          return {
            isProgramming: false,
            programmingDays: 0,
            pendingProgram: null as Program | null,
            compilationSuccess: null as boolean | null,
            completedProgram: null
          };
        }
        
        return {
          isProgramming: false,
          programmingDays: 0,
          pendingProgram: null as Program | null,
          compilationSuccess: null as boolean | null,
          completedProgram: success === true ? program : null
        };
      }),

      clearCompletedProgram: () => set({ completedProgram: null }),
      setCompilationSuccess: (success: boolean | null) => set({ compilationSuccess: success }),
  
      rollSkillCheck: (difficulty: number) => {
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

      calculateCompilationCost: (difficulty: number, type: string) => {
        const typeMultipliers: Record<string, number> = {
          'intrusion': 1, 'utility': 1,
          'anti-ice': 25, 'anti-system': 4,
          'stealth': 1, 'defense': 1,
          'daemon': 2
        };
        const multiplier = typeMultipliers[type] || 1;
        return Math.floor(difficulty * 10 * multiplier);
      },

      calculateCompilationTime: (difficulty: number) => {
        return Math.ceil(difficulty * 6 / 24);
      },

      addChipToStorage: (program: Program) => set((state: MeatspaceState) => ({
        chipStorage: [...state.chipStorage, { ...program, chipId: `chip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` } as unknown as Program]
      })),

      removeChipFromStorage: (chipId: string) => set((state: MeatspaceState) => ({
        chipStorage: state.chipStorage.filter(c => (c as unknown as { chipId: string }).chipId !== chipId)
      })),

      copyProgramToChip: (program: Program, cost: number = 10) => set((state: MeatspaceState) => {
        if (state.funds < cost) return state;
        const chipProgram = { ...program, chipId: `chip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, isOnChip: true } as unknown as Program;
        return {
          funds: state.funds - cost,
          chipStorage: [...state.chipStorage, chipProgram]
        };
      }),

      pirateProgram: (program: Program) => {
        const state = get();
        const pirateDiff = 28;
        const roll = Math.floor(Math.random() * 10) + 1;
        const total = state.programming + roll;
        
        if (total >= pirateDiff) {
          const piratedProgram = { ...program, id: `pirated_${program.id}_${Date.now()}`, isPirated: true } as unknown as Program;
          set({ chipStorage: [...state.chipStorage, piratedProgram] });
          return { success: true, roll: total, difficulty: pirateDiff };
        } else {
          return { success: false, roll: total, difficulty: pirateDiff };
        }
      },

      installChip: (chipId: string) => set((state: MeatspaceState) => {
        const chip = state.chipStorage.find(c => (c as Program & { chipId: string }).chipId === chipId);
        if (!chip) return { chipInstallResult: null };
        
        return {
          chipStorage: state.chipStorage.filter(c => (c as Program & { chipId: string }).chipId !== chipId),
          chipInstallResult: chip
        };
      }),

      clearChipInstallResult: () => set({ chipInstallResult: null }),
      addIp: (amount: number) => set((state: MeatspaceState) => ({
        ip: state.ip + amount,
        totalIpEarned: state.totalIpEarned + amount
      })),
      increaseSkill: (skillName: string, points: number = 1) => set((state: MeatspaceState) => {
        const cost = points * 100;
        if (state.ip >= cost && (state.skills as Record<string, number>)[skillName] !== undefined) {
          const newSkills = { ...state.skills, [skillName]: ((state.skills as Record<string, number>)[skillName] ?? 0) + points };
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
      setTimelagInterface: (value: boolean) => set({ timelagInterface: value }),
      setTimelagReflex: (value: boolean) => set({ timelagReflex: value }),
      installCyberware: (ware: CyberwareItem) => set((state: MeatspaceState) => {
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
      removeCyberware: (wareId: string) => set((state: MeatspaceState) => {
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
      getCyberwareBonus: (stat: string) => {
        const state = get();
        return state.cyberware.reduce((total, w) => total + ((w.bonuses)?.[stat] || 0), 0);
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
      updateFactionRep: (faction: string, amount: number) => set((state: MeatspaceState) => {
        const newRep = { ...state.factionReputation };
        newRep[faction] = Math.max(-100, Math.min(100, (newRep[faction] || 0) + amount));
        const vipUnlocked = Object.values(newRep).some(r => r >= 50);
        return { factionReputation: newRep, vipMarketUnlocked: vipUnlocked };
      }),
      getFactionWantedLevel: (faction: string) => {
        const state = get();
        const rep = state.factionReputation[faction] || 0;
        if (rep <= -50) return 3;
        if (rep <= -20) return 2;
        if (rep < 0) return 1;
        return 0;
      },
      getEnemyBonus: (faction: string) => {
        const state = get();
        const rep = state.factionReputation[faction] || 0;
        if (rep <= -50) return 3;
        if (rep <= -20) return 2;
        if (rep < 0) return 1;
        return 0;
      },
      getFactionPerks: (faction: string) => {
        const state = get();
        const rep = state.factionReputation[faction] || 0;
        return {
          vipAccess: rep >= 50,
          discount: rep >= 30 ? 0.2 : rep >= 20 ? 0.1 : 0,
          iceBuff: rep <= -30 ? Math.abs(rep) / 20 : 0
        };
      },
      buyNeuralLagSwitch: () => {
        const state = get();
        if (state.hasLagSwitch) return { success: false, message: "NEURAL LAG-SWITCH ALREADY INSTALLED." };
        if (state.funds < 600) return { success: false, message: "INSUFFICIENT FUNDS (600 cr REQUIRED)." };
        state.deductFunds(600);
        set((s) => ({ hasLagSwitch: true, credits: s.funds }));
        return { success: true, message: "NEURAL LAG-SWITCH INSTALLED. HARDWARE TOGGLE ENABLED." };
      },

      setLagToggleMode: (mode: LagToggleMode) => {
        const state = get();
        if (!state.hasLagSwitch) return { success: false, message: "NO LAG-SWITCH INSTALLED." };
        set({ lagToggleMode: mode });
        return { success: true, message: "LAG-SWITCH MODE SET TO: " + mode.toUpperCase() + "." };
      },

      buyCosmeticIcon: (tier: IconTier) => {
        const state = get();
        const config = COSMETIC_ICON_TIERS[tier];
        if (!config) return { success: false, message: "INVALID ICON TIER." };
        if (state.ownedIconTiers?.includes(tier)) {
          set({ equippedIconTier: tier });
          return { success: true, message: config.name.toUpperCase() + " EQUIPPED." };
        }
        if (state.funds < config.creditCost) return { success: false, message: "INSUFFICIENT FUNDS (" + config.creditCost + " cr REQUIRED)." };
        state.deductFunds(config.creditCost);
        set((s) => ({
          ownedIconTiers: [...(s.ownedIconTiers || ["SIMPLE"]), tier],
          equippedIconTier: tier,
          credits: s.funds,
        }));
        return { success: true, message: config.name.toUpperCase() + " PURCHASED AND EQUIPPED." };
      },

      resetCharacter: () => set({
        handle: 'Unknown',
        homeLdl: 'night_city',
        isNomad: false,
        nomadClan: null as string | null,
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
        pendingProgram: null as Program | null,
        compilationSuccess: null as boolean | null,
        completedProgram: null as Program | null,
        chipStorage: [] as Program[],
        chipInstallResult: null as Program | null,
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
        freshFoodBonus: null as { stat: string; expiresIn: number } | null,
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
        currentChassis: null as string | null,
        ownedChassis: [] as Array<ChassisInfo & { upgrades: FBCUpgrades }>,
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
        cyberware: [] as CyberwareItem[],
        cyberpsychosisLevel: 0,
        riots: 0,
        factionReputation: {
          kurokawa: 0,
          militech: 0,
          somachem: 0,
          biotechnica: 0,
          eurospace: 0,
          sovspace: 0
        },
        vipMarketUnlocked: false,
        health: 0,
        maxHealth: 0,
        lastSkillRoll: null as SkillRoll | null,
        message: null as string | null,
        lethalDamage: null as { turns: number } | null,
        combatBonus: 0,
      }),
      createCharacter: (charData: CharacterCreationData) => set({
        handle: charData.handle || 'Unknown',
        homeLdl: charData.homeLdl || 'night_city',
        isNomad: false,
        nomadClan: null as string | null,
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
        skills: (charData.skills as SkillSet) || {
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
        pendingProgram: null as Program | null,
        compilationSuccess: null as boolean | null,
        completedProgram: null as Program | null,
        chipStorage: [] as Program[],
        chipInstallResult: null as Program | null,
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
        freshFoodBonus: null as { stat: string; expiresIn: number } | null,
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
        currentChassis: null as string | null,
        ownedChassis: [] as Array<ChassisInfo & { upgrades: FBCUpgrades }>,
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
        cyberware: [] as CyberwareItem[],
        cyberpsychosisLevel: 0,
        riots: 0,
        factionReputation: {
          kurokawa: 0,
          militech: 0,
          somachem: 0,
          biotechnica: 0,
          eurospace: 0,
          sovspace: 0
        },
        vipMarketUnlocked: false,
        health: 0,
        maxHealth: 0,
        lastSkillRoll: null as SkillRoll | null,
        message: null as string | null,
        lethalDamage: null as { turns: number } | null,
        combatBonus: 0,
      })
    }),
    {
      name: 'meatspace-storage',
      version: 7,
      migrate: (persistedState: unknown, version: number): unknown => {
        const state = (persistedState && typeof persistedState === "object" ? persistedState : {}) as Record<string, unknown>;
        if (version === 0 || version === 1) {
          return {
            ...state,
            neuralDamage: 0,
            maxInt: state.int || 8,
            ip: 0,
            totalIpEarned: 0,
            timelagInterface: false,
            timelagReflex: false,
            skills: {
              interface: state.interfaceLvl || 4,
              programming: state.programming || 3,
              electronics: 2,
              cryptography: 1,
              librarySearch: 2,
              handgun: 3,
              brawling: 2
            },
            humanity: 100,
            maxHumanity: 100,
            cyberware: [] as CyberwareItem[],
            cyberpsychosisLevel: 0,
            riots: 0,
            factionReputation: {
              kurokawa: 0,
              militech: 0,
              somachem: 0,
              biotechnica: 0,
              eurospace: 0,
              sovspace: 0
            },
            vipMarketUnlocked: false
          };
        }
        if (version === 2) {
          return {
            ...state,
            timelagInterface: state.timelagInterface || false,
            timelagReflex: state.timelagReflex || false,
            humanity: state.humanity || 100,
            maxHumanity: state.maxHumanity || 100,
            cyberware: state.cyberware || [],
            cyberpsychosisLevel: state.cyberpsychosisLevel || 0,
            riots: state.riots || 0,
            factionReputation: {
              kurokawa: 0,
              militech: 0,
              somachem: 0,
              biotechnica: 0,
              eurospace: 0,
              sovspace: 0
            },
            vipMarketUnlocked: false
          };
        }
        if (version === 3) {
          return {
            ...state,
            factionReputation: state.factionReputation || {
              kurokawa: 0,
              militech: 0,
              somachem: 0,
              biotechnica: 0,
              eurospace: 0,
              sovspace: 0
            },
            vipMarketUnlocked: state.vipMarketUnlocked || false
          };
        }
        if (version === 4) {
          return {
            ...state,
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
            ...state,
            isFBC: false,
            hasBiopod: false,
            currentChassis: null as string | null,
            ownedChassis: [] as Array<ChassisInfo & { upgrades: FBCUpgrades }>,
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
        if (version === 6) {
          const ps6 = persistedState as Record<string, unknown>;
          return {
            ...state,
            homeLdl: ps6.homeLdl || 'night_city',
            isNomad: ps6.isNomad ?? false,
            nomadClan: (ps6.nomadClan as string | null) ?? null
          };
        }
        return state;
      }
    }
  )
);
