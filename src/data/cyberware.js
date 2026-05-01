const cyberware = [
  {
    id: 'math-coprocessor',
    name: 'Math Co-processor',
    type: 'neuralware',
    cost: 2000,
    humanityCost: 10,
    description: 'Neural enhancement that boosts computational thinking.',
    bonuses: { int: 2 }
  },
  {
    id: 'kerenzikov',
    name: 'Kerenzikov Reflex Booster',
    type: 'reflex',
    cost: 3000,
    humanityCost: 15,
    description: 'Reflex enhancer that dramatically improves reaction time.',
    bonuses: { ref: 3 }
  },
  {
    id: 'neural-link-1',
    name: 'Neural Link Mk.I',
    type: 'neuralware',
    cost: 1500,
    humanityCost: 8,
    description: 'Basic neural interface upgrade increasing max neural HP.',
    bonuses: { maxInt: 2 }
  },
  {
    id: 'neural-link-2',
    name: 'Neural Link Mk.II',
    type: 'neuralware',
    cost: 4000,
    humanityCost: 20,
    description: 'Advanced neural interface significantly expanding neural capacity.',
    bonuses: { maxInt: 4 }
  },
  {
    id: 'sandrazer',
    name: 'Sandrazer v3',
    type: 'neuralware',
    cost: 5000,
    humanityCost: 25,
    description: 'Military-grade neural accelerator. Massive INT boost but high humanity cost.',
    bonuses: { int: 4, maxInt: 2 }
  },
  {
    id: 'boosted-reflexes',
    name: 'Boosted Reflexes',
    type: 'reflex',
    cost: 2500,
    humanityCost: 12,
    description: 'Enhanced reflex system for better evasion.',
    bonuses: { ref: 2 }
  },
  {
    id: 'chip-slot',
    name: 'Extra Chip Slot',
    type: 'neuralware',
    cost: 1000,
    humanityCost: 5,
    description: 'Additional cyberdeck program slot (+1 MU capacity).',
    bonuses: { mu: 1 }
  },
  {
    id: 'dermal-plating',
    name: 'Dermal Plating',
    type: 'body',
    cost: 1800,
    humanityCost: 18,
    description: 'Subdermal armor plating. Reduces physical damage taken.',
    bonuses: { armor: 2 }
  },
  {
    id: 'pain-editor',
    name: 'Pain Editor',
    type: 'neuralware',
    cost: 3500,
    humanityCost: 15,
    description: 'Neural scrambler that ignores damage penalties. +1 to all rolls when damaged.',
    bonuses: { damageBonus: 1 }
  }
];

export default cyberware;
