export const LDL_DATABASE = {
  // --- NORTH AMERICA ---
  "night_city": { id: "night_city", name: "Night City", x: 4, y: 4, sec: 2, traceMod: 0, region: "earth" },
  "neo_ny":     { id: "neo_ny", name: "Neo-NY", x: 7, y: 4, sec: 3, traceMod: 1, region: "earth" },
  
  // --- EUROPE / ASIA ---
  "london":     { id: "london", name: "London", x: 10, y: 4, sec: 4, traceMod: 2, region: "earth" },
  "paris":      { id: "paris", name: "Paris", x: 11, y: 6, sec: 4, traceMod: 1, region: "earth" },
  "tokyo":      { id: "tokyo", name: "Tokyo Chiba", x: 15, y: 4, sec: 5, traceMod: 2, region: "earth" },
  
  // --- EQUATORIAL BELT (Max 5 spaces between these!) ---
  "bogota":     { id: "bogota", name: "Bogota (Equat.)", x: 6, y: 8, sec: 3, traceMod: 3, region: "earth", isEquatorial: true },
  "nairobi":    { id: "nairobi", name: "Nairobi (Equat.)", x: 10, y: 8, sec: 2, traceMod: 4, region: "earth", isEquatorial: true },
  "singapore":  { id: "singapore", name: "Singapore (Equat.)", x: 14, y: 8, sec: 4, traceMod: 1, region: "earth", isEquatorial: true },

  // --- ORBITAL (4 spaces up from Equator) ---
  "orbitsville":{ id: "orbitsville", name: "Orbitsville (LEO)", x: 10, y: 12, sec: 6, traceMod: 2, region: "orbit" },
  "crystal_pal":{ id: "crystal_pal", name: "Crystal Palace", x: 14, y: 12, sec: 8, traceMod: 1, region: "orbit" },

  // --- LUNA (4 spaces up from Orbit) ---
  "luna_tycho": { id: "luna_tycho", name: "Tycho (Luna)", x: 10, y: 16, sec: 7, traceMod: 0, region: "luna" },
  "luna_coper": { id: "luna_coper", name: "Copernicus (Luna)", x: 14, y: 16, sec: 8, traceMod: 1, region: "luna" },

  // --- MARS (4 spaces up from Luna) ---
  "mars_chryse":{ id: "mars_chryse", name: "Chryse Base (Mars)", x: 10, y: 20, sec: 9, traceMod: -2, region: "mars" },
  "mars_isidis":{ id: "mars_isidis", name: "Isidis Base (Mars)", x: 14, y: 20, sec: 10, traceMod: -3, region: "mars" }
};