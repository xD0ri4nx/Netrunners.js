import type { DaemonPayloadState, IconTier, IdentityUtilityProgram } from './multiplayerTypes.ts';

export const COSMETIC_ICON_TIERS: Record<
  IconTier,
  { name: string; difficulty: number; creditCost: number; description: string }
> = {
  SIMPLE: {
    name: 'Simple ICON',
    difficulty: 1,
    creditCost: 10,
    description: 'Low-resolution glowing geometric shape. Purely cosmetic.',
  },
  FRACTAL: {
    name: 'Complex/Fractal ICON',
    difficulty: 3,
    creditCost: 30,
    description: 'Shifting fractal geometry or stylized 3D model. Purely cosmetic.',
  },
  PHOTOREALISTIC: {
    name: 'Photorealistic ICON',
    difficulty: 4,
    creditCost: 40,
    description: 'Video-quality rendering of a person or object. Purely cosmetic.',
  },
  SUPERREALISTIC: {
    name: 'Superrealistic ICON',
    difficulty: 5,
    creditCost: 50,
    description:
      'Indistinguishable from reality with micro-expressions. Required for Daemon Conversational Ability visual checks.',
  },
};

export const IDENTITY_UTILITY_CATALOG: IdentityUtilityProgram[] = [
  {
    id: 'INVISIBILITY',
    name: 'Invisibility',
    strength: 3,
    muCost: 1,
    creditCost: 300,
    active: false,
  },
  {
    id: 'DISGUISE',
    name: 'Disguise',
    strength: 4,
    muCost: 1,
    creditCost: 400,
    active: false,
  },
  {
    id: 'REPLICATOR',
    name: 'Replicator',
    strength: 4,
    muCost: 1,
    creditCost: 400,
    active: false,
  },
];

export function createCuckooBirdDaemon(ownerId: string, startX = 0, startY = 0): DaemonPayloadState {
  const subprograms: DaemonPayloadState['subprograms'] = [
    'DISGUISE',
    'INTRUSION',
    'DECRYPTION',
    'UTILITY',
  ];
  const baseStrength = 9;
  const operationalStrength = baseStrength - subprograms.length;
  const difficulty = 58;

  return {
    id: `cuckoo-${Date.now()}`,
    name: 'Cuckoo Bird',
    ownerId,
    baseStrength,
    operationalStrength,
    intelligence: 6,
    muFootprint: 7,
    difficulty,
    marketCost: 1450,
    codingHours: difficulty * 6,
    iconTier: 'SIMPLE',
    hasConversationalAbility: false,
    hasDoppelganger: false,
    hasCodeOptimization: false,
    subprograms,
    position: { x: startX, y: startY },
    status: 'ACTIVE',
  };
}

export function createProteusDaemon(ownerId: string, startX = 0, startY = 0): DaemonPayloadState {
  const subprograms: DaemonPayloadState['subprograms'] = [
    'DISGUISE',
    'INVISIBILITY',
    'INTRUSION',
    'DECRYPTION',
    'UTILITY',
    'KILLER_V2',
  ];
  const baseStrength = 16;
  const operationalStrength = baseStrength - subprograms.length;
  const difficulty = 122;

  return {
    id: `proteus-${Date.now()}`,
    name: 'Proteus Protocol',
    ownerId,
    baseStrength,
    operationalStrength,
    intelligence: 6,
    muFootprint: 4,
    difficulty,
    marketCost: 3050,
    codingHours: difficulty * 6,
    iconTier: 'SUPERREALISTIC',
    hasConversationalAbility: true,
    hasDoppelganger: true,
    hasCodeOptimization: true,
    subprograms,
    position: { x: startX, y: startY },
    status: 'ACTIVE',
  };
}
