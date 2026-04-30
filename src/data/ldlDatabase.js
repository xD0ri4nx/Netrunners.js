export const LDL_DATABASE = {
  // --- NORTH AMERICA ('na') ---
  "seattle":    { id: "seattle", name: "Seattle", x: 2, y: 3, sec: 3, traceDefense: 2, region: "earth", group: "na", corp: "arasaka" },
  "night_city": { id: "night_city", name: "Night City", x: 2, y: 5, sec: 2, traceDefense: 3, region: "earth", group: "na", corp: "militech" },
  "chicago":    { id: "chicago", name: "Chicago", x: 5, y: 4, sec: 4, traceDefense: 2, region: "earth", group: "na", corp: "militech" },
  "atlanta":    { id: "atlanta", name: "Atlanta", x: 6, y: 6, sec: 3, traceDefense: 1, region: "earth", group: "na", corp: "petrochem" },
  "neo_ny":     { id: "neo_ny", name: "Neo-NY", x: 8, y: 4, sec: 3, traceDefense: 2, region: "earth", group: "na", corp: "biotechnica" },

  // --- SOUTH AMERICA ('sa') ---
  "mexico_city":{ id: "mexico_city", name: "Mexico City", x: 6, y: 8, sec: 3, traceDefense: 1, region: "earth", group: "sa", corp: "petrochem" },
  "rio":        { id: "rio", name: "Rio de Janeiro", x: 9, y: 10, sec: 4, traceDefense: 0, region: "earth", group: "sa", corp: "biotechnica" },

  // --- EUROTHEATRE ('euro') ---
  "london":     { id: "london", name: "London", x: 11, y: 3, sec: 4, traceDefense: 1, region: "earth", group: "euro", corp: "eurospace" },
  "paris":      { id: "paris", name: "Paris", x: 12, y: 5, sec: 4, traceDefense: 2, region: "earth", group: "euro", corp: "eurospace" },
  "berlin":     { id: "berlin", name: "Berlin", x: 14, y: 3, sec: 5, traceDefense: 1, region: "earth", group: "euro", corp: "eurospace" },
  "rome":       { id: "rome", name: "Rome", x: 14, y: 6, sec: 3, traceDefense: 1, region: "earth", group: "euro", corp: "eurospace" },
  "moscow":     { id: "moscow", name: "Moscow SovSpace", x: 17, y: 2, sec: 6, traceDefense: 0, region: "earth", group: "euro", corp: "sovspace" },

  // --- PACIFICA & ASIA ('asia') ---
  "hk":         { id: "hk", name: "Hong Kong", x: 17, y: 7, sec: 5, traceDefense: 1, region: "earth", group: "asia", corp: "arasaka" },
  "tokyo":      { id: "tokyo", name: "Tokyo Chiba", x: 18, y: 5, sec: 5, traceDefense: 1, region: "earth", group: "asia", corp: "arasaka" },
  "manila":     { id: "manila", name: "Manila", x: 18, y: 9, sec: 3, traceDefense: 2, region: "earth", group: "asia", corp: "arasaka" },
  "sydney":     { id: "sydney", name: "Sydney", x: 18, y: 12, sec: 4, traceDefense: 2, region: "earth", group: "asia", corp: "biotechnica" },

  // --- EQUATORIAL BELT ('equat') ---
  "bogota":     { id: "bogota", name: "Bogota", x: 6, y: 10, sec: 3, traceDefense: 0, region: "earth", isEquatorial: true, group: "equat", corp: "petrochem" },
  "nairobi":    { id: "nairobi", name: "Nairobi", x: 12, y: 9, sec: 2, traceDefense: 0, region: "earth", isEquatorial: true, group: "equat", corp: "petrochem" },
  "singapore":  { id: "singapore", name: "Singapore", x: 16, y: 9, sec: 4, traceDefense: 2, region: "earth", isEquatorial: true, group: "equat", corp: "arasaka" },

  // --- DEEP SPACE ('space') ---
  "orbitsville":{ id: "orbitsville", name: "Orbitsville (LEO)", x: 10, y: 14, sec: 6, traceDefense: 1, region: "orbit", group: "space", corp: "eurospace" },
  "crystal_pal":{ id: "crystal_pal", name: "Crystal Palace", x: 14, y: 14, sec: 8, traceDefense: 2, region: "orbit", group: "space", corp: "eurospace" },
  "luna_tycho": { id: "luna_tycho", name: "Tycho (Luna)", x: 10, y: 17, sec: 7, traceDefense: 3, region: "luna", group: "space", corp: "sovspace" },
  "luna_coper": { id: "luna_coper", name: "Copernicus (Luna)", x: 14, y: 17, sec: 8, traceDefense: 2, region: "luna", group: "space", corp: "sovspace" },
  "mars_chryse":{ id: "mars_chryse", name: "Chryse Base (Mars)", x: 10, y: 20, sec: 9, traceDefense: 5, region: "mars", group: "space", corp: "militech" },
  "mars_isidis":{ id: "mars_isidis", name: "Isidis Base (Mars)", x: 14, y: 20, sec: 10, traceDefense: 6, region: "mars", group: "space", corp: "militech" },

  // --- GHOST TOWNS ('wild') ---
  "detroit_ruins": { id: "detroit_ruins", name: "Detroit Ruins", x: 4, y: 8, sec: 7, traceDefense: 0, region: "earth", group: "wild", isGhostTown: true, corp: null },
  "saigon_void":   { id: "saigon_void", name: "Saigon Void", x: 16, y: 11, sec: 8, traceDefense: 0, region: "earth", group: "wild", isGhostTown: true, corp: null },
  "lagos_ghost":    { id: "lagos_ghost", name: "Lagos Ghost", x: 12, y: 12, sec: 9, traceDefense: 0, region: "earth", group: "wild", isGhostTown: true, corp: null },
};

export const CORP_THEMES = {
  arasaka: {
    name: "Arasaka",
    wallChar: '▓',
    wallColor: 'text-red-800',
    gateChar: '⏣',
    gateColor: 'text-red-400',
    cpuChar: '雅',
    cpuColor: 'text-red-500 animate-pulse',
    memoryChar: '文',
    iceColor: 'text-orange-500',
    sysopColor: 'text-yellow-400',
    controllerChar: '武',
    controllerColor: 'text-red-400 animate-pulse',
    floorColor: 'bg-red-950/20'
  },
  militech: {
    name: "Militech",
    wallChar: '█',
    wallColor: 'text-green-800',
    gateChar: '⊡',
    gateColor: 'text-green-400',
    cpuChar: '⚙',
    cpuColor: 'text-green-500 animate-pulse',
    memoryChar: '♦',
    iceColor: 'text-lime-500',
    sysopColor: 'text-emerald-400',
    controllerChar: '⚔',
    controllerColor: 'text-green-400 animate-pulse',
    floorColor: 'bg-green-950/20'
  },
  petrochem: {
    name: "Petrochem",
    wallChar: '░',
    wallColor: 'text-yellow-800',
    gateChar: '⟨',
    gateColor: 'text-yellow-500',
    cpuChar: '⛢',
    cpuColor: 'text-yellow-500 animate-pulse',
    memoryChar: '⛃',
    iceColor: 'text-amber-500',
    sysopColor: 'text-yellow-400',
    controllerChar: '⚡',
    controllerColor: 'text-yellow-400 animate-pulse',
    floorColor: 'bg-yellow-950/20'
  },
  biotechnica: {
    name: "Biotechnica",
    wallChar: '▒',
    wallColor: 'text-purple-800',
    gateChar: '⟪',
    gateColor: 'text-purple-400',
    cpuChar: '⚘',
    cpuColor: 'text-purple-500 animate-pulse',
    memoryChar: '⚕',
    iceColor: 'text-pink-500',
    sysopColor: 'text-fuchsia-400',
    controllerChar: '⚗',
    controllerColor: 'text-purple-400 animate-pulse',
    floorColor: 'bg-purple-950/20'
  },
  eurospace: {
    name: "Eurospace",
    wallChar: '▦',
    wallColor: 'text-blue-800',
    gateChar: '⟦',
    gateColor: 'text-blue-400',
    cpuChar: '⚖',
    cpuColor: 'text-blue-500 animate-pulse',
    memoryChar: '⚚',
    iceColor: 'text-cyan-500',
    sysopColor: 'text-sky-400',
    controllerChar: '⚲',
    controllerColor: 'text-blue-400 animate-pulse',
    floorColor: 'bg-blue-950/20'
  },
  sovspace: {
    name: "SovSpace",
    wallChar: '▣',
    wallColor: 'text-gray-700',
    gateChar: '⟬',
    gateColor: 'text-gray-400',
    cpuChar: '☭',
    cpuColor: 'text-red-600 animate-pulse',
    memoryChar: '⚇',
    iceColor: 'text-slate-400',
    sysopColor: 'text-gray-300',
    controllerChar: '⚒',
    controllerColor: 'text-gray-400 animate-pulse',
    floorColor: 'bg-gray-950/20'
  }
};