// ============================================================
// Global Type Definitions for Netrunner.js
// ============================================================

export interface CharacterStats {
  int: number;
  ref: number;
  tech: number;
  cool: number;
  attr: number;
  luck: number;
  ma: number;
  body: number;
  emp: number;
}

export interface SkillSet {
  [key: string]: number;
  interface: number;
  programming: number;
  electronics: number;
  cryptography: number;
  librarySearch: number;
  handgun: number;
  brawling: number;
  awareness: number;
  basicTech: number;
  education: number;
  systemKnowledge: number;
  cyberTech: number;
  cyberdeckDesign: number;
  composition: number;
}

export interface SDP {
  [key: string]: number;
  head: number;
  lArm: number;
  rArm: number;
  lLeg: number;
  rLeg: number;
  torso: number;
}

export interface FBCUpgrades {
  ccpl?: boolean;
  overclocked: { ref: number; ma: number; body: number; [key: string]: number };
  ccplRetrofit: boolean;
  quickMounts: boolean;
  hardenedShielding: boolean;
}

export interface ChassisInfo {
  id: string;
  name: string;
  category: string;
  cost: number;
  desc: string;
  baseStats: { ref: number; ma: number; body: number; sp: number };
  sdp: SDP;
  special?: string;
}

export interface CyberwareItem {
  id: string;
  name: string;
  type?: string;
  cost: number;
  humanityCost: number;
  description: string;
  desc?: string;
  bonuses?: Record<string, number>;
}

export interface Program {
  id: string;
  name: string;
  type: string;
  strength: number;
  difficulty?: number;
  muCost?: number;
  marketValue?: number;
  mu?: number;
  cost?: number;
  desc?: string;
  description?: string;
  chipId?: string;
  days?: number;
  isOnChip?: boolean;
  isCustom?: boolean;
  isPirated?: boolean;
  compiledAt?: number;
}

export interface Job {
  id: string;
  title: string;
  targetLdl: string;
  targetLdlName: string;
  payout: number;
  secLevel: number;
  isHeist: boolean;
  turnLimit?: number;
  objectivesCompleted?: number;
}

export interface LDLEntry {
  id: string;
  name: string;
  x: number;
  y: number;
  sec: number;
  traceDefense: number;
  region: string;
  group: string;
  corp: string | null;
  isMain?: boolean;
  isEquatorial?: boolean;
  isGhostTown?: boolean;
  isWeefle?: boolean;
  parentLdl?: string;
  backLink?: string;
  special?: string;
}

export interface CorpTheme {
  name: string;
  wallChar: string;
  wallColor: string;
  gateChar: string;
  gateColor: string;
  cpuChar: string;
  cpuColor: string;
  memoryChar: string;
  iceColor: string;
  sysopColor: string;
  controllerChar: string;
  controllerColor: string;
  floorColor: string;
}

export interface PositionComponent {
  x: number;
  y: number;
}

export interface RenderComponent {
  char: string;
  color: string;
}

export interface Entity {
  id?: string;
  position?: PositionComponent;
  render?: RenderComponent;
  isPlayer?: boolean;
  isWall?: boolean;
  wallStr?: number;
  isCodeGate?: boolean;
  isCPU?: boolean;
  isMemory?: boolean;
  isIce?: boolean;
  name?: string;
  isSysop?: boolean;
  isRogueAI?: boolean;
  isAlly?: boolean;
  isDaemon?: boolean;
  isTurret?: boolean;
  isController?: boolean;
  controllerType?: string;
  defense?: number;
  fileType?: string;
  int?: number;
  interfaceLvl?: number;
  deckBonus?: number;
  programs?: Program[];
  alerted?: boolean;
  strength?: number;
  maxStrength?: number;
  range?: number;
}

export interface RivalEncounter {
  name: string;
  int: number;
  interfaceLvl: number;
  deckBonus: number;
  progStr: number;
  payoff: number;
}

export type GamePhase =
  | 'safehouse'
  | 'raid'
  | 'shop'
  | 'jobs'
  | 'repair'
  | 'navigator'
  | 'rival_encounter'
  | 'gridsec_interdiction'
  | 'jacking_in'
  | 'net';

export interface SFX {
  move: () => void;
  error: () => void;
  loot: () => void;
  attack: () => void;
  damage: () => void;
  flatline: () => void;
  click: () => void;
}

// ============================================================
// Component/Store-specific Type Extensions
// ============================================================

export interface FBCChassis {
  id: string;
  name: string;
  category: string;
  cost: number;
  desc: string;
  baseStats: { ref: number; ma: number; body: number; sp: number };
  sdp: SDP;
  special?: string;
}

export interface CyberwareData {
  id: string;
  name: string;
  type?: string;
  cost: number;
  humanityCost: number;
  description: string;
  desc?: string;
  bonuses?: Record<string, number>;
}

export interface ProgramTemplate {
  id: string;
  name: string;
  type: string;
  strength: number;
  difficulty: number;
  function: string;
}

export interface DemonTemplate {
  id: string;
  name: string;
  baseDifficulty: number;
  baseStrength: number;
  description: string;
}

export interface DaemonOption {
  id: string;
  name: string;
  difficulty: number;
  description: string;
}

export interface StockData {
  id: string;
  name: string;
  base: number;
  volatility: number;
}

export interface FixerData {
  id: string;
  name: string;
  faction: string;
  color: string;
  bg: string;
  border: string;
  desc: string;
}

export interface TuneOption {
  id: string;
  name: string;
  desc: string;
  difficulty: number;
  cost: number;
}

export interface RepairOption {
  id: string;
  name: string;
  cost: number;
  days: number;
  desc: string;
  effect: () => void;
}

export interface UpgradeOption {
  id: string;
  name: string;
  cost: number;
  show: boolean;
  desc: string;
}

export interface ShopProduct {
  id: string;
  name?: string;
  model?: string;
  type?: string;
  subType?: string;
  cost: number;
  desc: string;
  strength?: number;
  mu?: number;
  speed?: number;
  dataWalls?: number;
  amount?: number;
  stats?: string;
}

export interface ShopCategory {
  id: string;
  label: string;
}

export interface InterfacePlugsOption {
  id: string;
  name: string;
  cost: number;
  show: boolean;
  desc: string;
}

// ============================================================
// Store State Types
// ============================================================

export interface MeatspaceState {
  handle: string;
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
  ownedChassis: Array<{ id: string; name: string; category: string; cost: number; desc: string; baseStats: { ref: number; ma: number; body: number; sp: number }; sdp: SDP; special?: string; upgrades?: { overclocked: { ref: number; ma: number; body: number; [key: string]: number }; ccpl: boolean; quickMounts: boolean; hardened: boolean } }>;
  sdp: SDP;
  maxSdp: SDP;
  fbcUpgrades: FBCUpgrades;
  skills: SkillSet;
  humanity: number;
  maxHumanity: number;
  cyberware: CyberwareItem[];
  cyberpsychosisLevel: number;
  riots: number;
  factionReputation: Record<string, number>;
  vipMarketUnlocked: boolean;
}

export interface CyberdeckState {
  deckModel: string;
  deckType: string;
  maxMu: number;
  usedMu: number;
  speed: number;
  dataWalls: number;
  coprocessors: number;
  isCellular: boolean;
  deckHealth: number;
  maxDeckHealth: number;
  deckCrashes: number;
  tuningCount: number;
  tuningHistory: Array<{ type: string; stat: string; bonus: number }>;
  neuralCyberware: {
    neuralProcessor: boolean;
    chipwareSocket: boolean;
    brainWall: boolean;
    psychosisRisk: number;
  };
  peripherals: {
    chipreader: boolean;
    hardened: boolean;
    videoboard: boolean;
    optical: boolean;
  };
  chipSlot: Program | null;
  chipProgram: Program | null;
  programs: Program[];
  activeAction: Program | null;
  activePassives: Program[];
  combatBonus: number;
}

export interface TerminalState {
  logs: string[];
}

export interface RoutingState {
  currentLdl: string | null;
  routeHistory: string[];
  traceDefense: number;
  traceRisk: number;
  gridsecPatrols: Record<string, { isElite: boolean; turnsActive: number }>;
}

export interface MissionState {
  availableJobs: Job[];
  activeJob: Job | null;
  payloadSecured: boolean;
}

export interface ControllerMenuState {
  position: { x: number; y: number };
  entity: Entity;
  type: string;
  defense: number;
}
