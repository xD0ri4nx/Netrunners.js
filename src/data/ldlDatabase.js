export const LDL_DATABASE = {
  // === MAIN OFFICIAL LDLs (CP2020 Sourcebook Locations) ===
  // Spaced out across a larger grid (0-30 x, 0-30 y)

  // --- NORTH AMERICA ('na') ---
  "seattle":    { id: "seattle", name: "Seattle", x: 3, y: 4, sec: 3, traceDefense: 2, region: "earth", group: "na", corp: "arasaka", isMain: true },
  "night_city": { id: "night_city", name: "Night City", x: 5, y: 6, sec: 2, traceDefense: 3, region: "earth", group: "na", corp: "militech", isMain: true },
  "chicago":   { id: "chicago", name: "Chicago", x: 9, y: 5, sec: 4, traceDefense: 2, region: "earth", group: "na", corp: "militech", isMain: true },
  "atlanta":   { id: "atlanta", name: "Atlanta", x: 11, y: 8, sec: 3, traceDefense: 1, region: "earth", group: "na", corp: "petrochem", isMain: true },
  "neo_ny":    { id: "neo_ny", name: "Neo-NY", x: 14, y: 4, sec: 3, traceDefense: 2, region: "earth", group: "na", corp: "biotechnica", isMain: true },
  "detroit":   { id: "detroit", name: "Detroit", x: 8, y: 6, sec: 4, traceDefense: 1, region: "earth", group: "na", corp: "militech", isMain: true },
  "la":        { id: "la", name: "Los Angeles", x: 2, y: 10, sec: 3, traceDefense: 2, region: "earth", group: "na", corp: "biotechnica", isMain: true },
  "denver":    { id: "denver", name: "Denver", x: 7, y: 12, sec: 4, traceDefense: 1, region: "earth", group: "na", corp: "militech", isMain: true },
  "houston":   { id: "houston", name: "Houston", x: 9, y: 14, sec: 3, traceDefense: 1, region: "earth", group: "na", corp: "petrochem", isMain: true },
  "miami":     { id: "miami", name: "Miami", x: 13, y: 14, sec: 3, traceDefense: 1, region: "earth", group: "na", corp: "petrochem", isMain: true },

  // --- SOUTH AMERICA ('sa') ---
  "mexico_city":{ id: "mexico_city", name: "Mexico City", x: 6, y: 16, sec: 3, traceDefense: 1, region: "earth", group: "sa", corp: "petrochem", isMain: true },
  "rio":       { id: "rio", name: "Rio de Janeiro", x: 12, y: 20, sec: 4, traceDefense: 0, region: "earth", group: "sa", corp: "biotechnica", isMain: true },
  "bogota":    { id: "bogota", name: "Bogota", x: 8, y: 18, sec: 3, traceDefense: 0, region: "earth", group: "sa", corp: "petrochem", isMain: true },

  // --- EUROTHEATRE ('euro') ---
  "london":     { id: "london", name: "London", x: 18, y: 4, sec: 4, traceDefense: 1, region: "earth", group: "euro", corp: "eurospace", isMain: true },
  "paris":     { id: "paris", name: "Paris", x: 20, y: 6, sec: 4, traceDefense: 2, region: "earth", group: "euro", corp: "eurospace", isMain: true },
  "berlin":    { id: "berlin", name: "Berlin", x: 23, y: 4, sec: 5, traceDefense: 1, region: "earth", group: "euro", corp: "eurospace", isMain: true },
  "rome":      { id: "rome", name: "Rome", x: 23, y: 8, sec: 3, traceDefense: 1, region: "earth", group: "euro", corp: "eurospace", isMain: true },
  "moscow":    { id: "moscow", name: "Moscow", x: 28, y: 3, sec: 6, traceDefense: 0, region: "earth", group: "euro", corp: "sovspace", isMain: true },

  // --- PACIFICA & ASIA ('asia') ---
  "hk":        { id: "hk", name: "Hong Kong", x: 26, y: 12, sec: 5, traceDefense: 1, region: "earth", group: "asia", corp: "arasaka", isMain: true },
  "tokyo":     { id: "tokyo", name: "Tokyo", x: 28, y: 8, sec: 5, traceDefense: 1, region: "earth", group: "asia", corp: "arasaka", isMain: true },
  "seoul":     { id: "seoul", name: "Seoul", x: 27, y: 6, sec: 4, traceDefense: 2, region: "earth", group: "asia", corp: "arasaka", isMain: true },
  "manila":    { id: "manila", name: "Manila", x: 25, y: 16, sec: 3, traceDefense: 2, region: "earth", group: "asia", corp: "arasaka", isMain: true },
  "sydney":    { id: "sydney", name: "Sydney", x: 28, y: 24, sec: 4, traceDefense: 2, region: "earth", group: "asia", corp: "biotechnica", isMain: true },

  // --- EQUATORIAL BELT ('equat') ---
  "nairobi":   { id: "nairobi", name: "Nairobi", x: 20, y: 18, sec: 2, traceDefense: 0, region: "earth", group: "equat", corp: "petrochem", isMain: true, isEquatorial: true },
  "singapore": { id: "singapore", name: "Singapore", x: 24, y: 16, sec: 4, traceDefense: 2, region: "earth", group: "equat", corp: "arasaka", isMain: true, isEquatorial: true },
  "mumbai":    { id: "mumbai", name: "Mumbai", x: 22, y: 14, sec: 4, traceDefense: 1, region: "earth", group: "equat", corp: "biotechnica", isMain: true, isEquatorial: true },

  // --- DEEP SPACE ('space') ---
  "orbitsville":{ id: "orbitsville", name: "Orbitsville", x: 15, y: 28, sec: 6, traceDefense: 1, region: "orbit", group: "space", corp: "eurospace", isMain: true, backLink: "singapore" },
  "crystal_pal":{ id: "crystal_pal", name: "Crystal Palace", x: 20, y: 28, sec: 8, traceDefense: 2, region: "orbit", group: "space", corp: "eurospace", isMain: true, backLink: "singapore" },
  "luna_tycho": { id: "luna_tycho", name: "Tycho", x: 15, y: 30, sec: 7, traceDefense: 3, region: "luna", group: "space", corp: "sovspace", isMain: true, backLink: "nairobi" },
  "mars_chryse":{ id: "mars_chryse", name: "Chryse", x: 18, y: 30, sec: 9, traceDefense: 5, region: "mars", group: "space", corp: "militech", isMain: true, backLink: "nairobi" },

  // === SUB-NODES (Weefles & Ghost Towns - accessed from parent LDLs) ===

  // Night City Sub-nets
  "nc_basement": { id: "nc_basement", name: "Basement Node", x: 0, y: 0, sec: 1, traceDefense: 0, region: "earth", group: "na", isWeefle: true, parentLdl: "night_city", corp: "weefle" },
  "nc_garage":   { id: "nc_garage", name: "Mom's Garage", x: 0, y: 0, sec: 2, traceDefense: 0, region: "earth", group: "na", isWeefle: true, parentLdl: "night_city", corp: "weefle" },
  "nc_glitch":  { id: "nc_glitch", name: "Glitch's Bar", x: 0, y: 0, sec: 1, traceDefense: 0, region: "earth", group: "na", isWeefle: true, parentLdl: "night_city", corp: "weefle" },

  // Seattle Sub-nets
  "sea_arcade":   { id: "sea_arcade", name: "Retro Arcade", x: 0, y: 0, sec: 1, traceDefense: 0, region: "earth", group: "na", isWeefle: true, parentLdl: "seattle", corp: "weefle" },
  "sea_cyber":    { id: "sea_cyber", name: "CyberCafe", x: 0, y: 0, sec: 2, traceDefense: 0, region: "earth", group: "na", isWeefle: true, parentLdl: "seattle", corp: "weefle" },

  // Neo-NY Sub-nets
  "ny_borough":  { id: "ny_borough", name: "Brooklyn Mesh", x: 0, y: 0, sec: 2, traceDefense: 0, region: "earth", group: "na", isWeefle: true, parentLdl: "neo_ny", corp: "weefle" },
  "ny_china":    { id: "ny_china", name: "Chinatown WiFi", x: 0, y: 0, sec: 1, traceDefense: 0, region: "earth", group: "na", isWeefle: true, parentLdl: "neo_ny", corp: "weefle" },

  // LA Sub-nets
  "la_beach":    { id: "la_beach", name: "Venice Mesh", x: 0, y: 0, sec: 1, traceDefense: 0, region: "earth", group: "na", isWeefle: true, parentLdl: "la", corp: "weefle" },
  "la_sunset":   { id: "la_sunset", name: "Sunset Strip LAN", x: 0, y: 0, sec: 2, traceDefense: 0, region: "earth", group: "na", isWeefle: true, parentLdl: "la", corp: "weefle" },

  // Houston Sub-nets
  "houston_bar": { id: "houston_bar", name: "Dive Bar Server", x: 0, y: 0, sec: 1, traceDefense: 0, region: "earth", group: "na", isWeefle: true, parentLdl: "houston", corp: "weefle" },

  // Mexico City Sub-nets
  "mex_internet": { id: "mex_internet", name: "Internet Cafe", x: 0, y: 0, sec: 1, traceDefense: 0, region: "earth", group: "sa", isWeefle: true, parentLdl: "mexico_city", corp: "weefle" },

  // Rio Sub-nets
  "rio_school":  { id: "rio_school", name: "University Lab", x: 0, y: 0, sec: 3, traceDefense: 0, region: "earth", group: "sa", isWeefle: true, parentLdl: "rio", corp: "weefle" },

  // London Sub-nets
  "london_arcade": { id: "london_arcade", name: "Arcade LAN", x: 0, y: 0, sec: 2, traceDefense: 0, region: "earth", group: "euro", isWeefle: true, parentLdl: "london", corp: "weefle" },
  "london_pub":    { id: "london_pub", name: "Pub Server", x: 0, y: 0, sec: 1, traceDefense: 0, region: "earth", group: "euro", isWeefle: true, parentLdl: "london", corp: "weefle" },

  // Paris Sub-nets
  "paris_cafe":  { id: "paris_cafe", name: "Cafe WiFi", x: 0, y: 0, sec: 1, traceDefense: 0, region: "earth", group: "euro", isWeefle: true, parentLdl: "paris", corp: "weefle" },

  // Tokyo Sub-nets
  "tokyo_akih":  { id: "tokyo_akih", name: "Akihabara Mesh", x: 0, y: 0, sec: 2, traceDefense: 0, region: "earth", group: "asia", isWeefle: true, parentLdl: "tokyo", corp: "weefle" },
  "tokyo_arcade":{ id: "tokyo_arcade", name: "Game Center", x: 0, y: 0, sec: 1, traceDefense: 0, region: "earth", group: "asia", isWeefle: true, parentLdl: "tokyo", corp: "weefle" },

  // Hong Kong Sub-nets
  "hk_internet": { id: "hk_internet", name: "Internet Cafe", x: 0, y: 0, sec: 2, traceDefense: 0, region: "earth", group: "asia", isWeefle: true, parentLdl: "hk", corp: "weefle" },

  // Singapore Sub-nets
  "sing_mall":   { id: "sing_mall", name: "Mall Router", x: 0, y: 0, sec: 1, traceDefense: 0, region: "earth", group: "equat", isWeefle: true, parentLdl: "singapore", corp: "weefle" },

  // Nairobi Sub-nets
  "nairobi_hostel": { id: "nairobi_hostel", name: "Hostel Router", x: 0, y: 0, sec: 1, traceDefense: 0, region: "earth", group: "equat", isWeefle: true, parentLdl: "nairobi", corp: "weefle" },

  // Ghost Towns (high risk, high reward - also sub-nets)
  "detroit_ruins": { id: "detroit_ruins", name: "Detroit Ruins", x: 0, y: 0, sec: 7, traceDefense: 0, region: "earth", group: "na", isGhostTown: true, parentLdl: "detroit", corp: null },
  "boston_ruins":  { id: "boston_ruins", name: "Boston Ruins", x: 0, y: 0, sec: 6, traceDefense: 0, region: "earth", group: "na", isGhostTown: true, parentLdl: "neo_ny", corp: null },
  "atlanta_ruins": { id: "atlanta_ruins", name: "Atlanta Wasteland", x: 0, y: 0, sec: 6, traceDefense: 0, region: "earth", group: "na", isGhostTown: true, parentLdl: "atlanta", corp: null },
  "saigon_void":  { id: "saigon_void", name: "Saigon Void", x: 0, y: 0, sec: 8, traceDefense: 0, region: "earth", group: "asia", isGhostTown: true, parentLdl: "manila", corp: null },
  "lagos_ghost":  { id: "lagos_ghost", name: "Lagos Ghost", x: 0, y: 0, sec: 9, traceDefense: 0, region: "earth", group: "equat", isGhostTown: true, parentLdl: "nairobi", corp: null },
};

// Helper function to get sub-nodes for a parent LDL
export const getSubNodes = (parentLdlId) => {
  return Object.values(LDL_DATABASE).filter(ldl => ldl.parentLdl === parentLdlId);
};

// Helper to check if LDL is main (visible on map)
export const isMainLdl = (ldlId) => {
  const ldl = LDL_DATABASE[ldlId];
  return ldl && ldl.isMain === true;
};

// Helper to check if LDL is a sub-node
export const isSubLdl = (ldlId) => {
  const ldl = LDL_DATABASE[ldlId];
  return ldl && !!ldl.parentLdl;
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
  },
  weefle: {
    name: "Weefle Trash Grid",
    wallChar: '~',
    wallColor: 'text-pink-600',
    gateChar: '?',
    gateColor: 'text-yellow-400',
    cpuChar: 'PC',
    cpuColor: 'text-pink-400 animate-pulse',
    memoryChar: '$',
    iceColor: 'text-cyan-300',
    sysopColor: 'text-orange-300',
    controllerChar: 'X',
    controllerColor: 'text-pink-400 animate-pulse',
    floorColor: 'bg-pink-950/20'
  }
};