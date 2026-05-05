# CYBERPUNK 2020: NETRUNNER SIMULATOR
**Project Memory & Agentic Context Document**
*Version: 1.8.0*

This document serves as the absolute source of truth for the project's architecture, state management, lore implementation, and future roadmap. AI Agents should read this file completely before proposing any architectural changes or refactors.

---

## 1. PROJECT OVERVIEW
A web-based roguelite hacking simulator heavily adhering to the *Cyberpunk 2020* TTRPG rulebook. The player takes the role of a Netrunner navigating a global World Map, taking on Fixer contracts, and breaching procedural 2D Dataforts to extract Eurobucks and corporate data.

### 1.1 Tech Stack
* **Framework:** React + Vite
* **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`)
* **State Management (Global):** Zustand (with `persist` middleware for save states)
* **State Management (Game Phases):** XState (`gamePhaseMachine`)
* **Grid/Map Viewport:** `react-zoom-pan-pinch` (for desktop/mobile pan and zoom)
* **Deployment:** `gh-pages` (Live on GitHub Pages under the `gh-pages` branch)

---

## 2. ARCHITECTURE & STATE MANAGEMENT

### 2.1 XState Router (`src/machine/gamePhaseMachine.js`)
Controls the overarching UI flow and prevents illegal game states.
* `safehouse`: Base state. Auto-heals neural HP, clears trace (if under threshold), processes Fixer mission payouts.
    * Transitions -> `navigator`, `shop`, `jobs`, `raid` (intercepted if totalTrace >= 20)
* `raid`: Netwatch raid screen (Triggered if player returns to safehouse with 20+ trace).
* `jobs`: BBS Job Board to accept Fixer contracts.
* `shop`: The Afterlife BBS to buy software and cyberdecks.
* `navigator`: World Map view. Player selects LDL nodes to route to a target.
* `jacking_in`: 4-second boot sequence logging to terminal.
* `net`: The 2D grid roguelike combat phase.

### 2.2 Zustand Stores (`src/store/`)
Data is fully modular and uses `persist` middleware to save to `localStorage`.

1.  **`meatspaceStore.js`:** * State: `handle`, `int` (Intelligence), `ref` (Reflexes), `interfaceLvl` (Class skill), `health` (Neural HP), `funds` (Eurobucks).
2.  **`cyberdeckStore.js`:** * State: `deckModel`, `maxMu`, `usedMu`, `combatBonus`, `programs`.
    * **CRITICAL ARCHITECTURE:** Programs are split into two execution types:
        * `activeAction` (Object | null): Single equipped program for targeted clicks (e.g., *Sword*, *Decrypt*).
        * `activePassives` (Array): Array of currently running background/resident programs (e.g., *Invisibility*).
3.  **`missionStore.js`:**
    * Generates and tracks Fixer contracts.
    * State: `availableJobs`, `activeJob`, `payloadSecured`.
4.  **`routingStore.js`:**
    * Tracks the World Map path.
    * State: `currentLdl`, `routeHistory`, `totalTrace`.
5.  **`terminalStore.js`:**
    * A simple string array logging system events and combat math to the bottom UI panel.

---

## 3. CORE GAME MECHANICS

### 3.1 Routing & The World Map (`WorldMap.jsx`)
* **Lore Accuracy:** Bouncing through LDLs increases **Trace Defense** (your signal routing shield). Failed scams increase **Trace Risk** (Wanted Level). Two separate counters.
* **Logic:** Player selects a region tab (N.America, Europe, Deep Space, etc.). Must start on an Earth LDL before routing to Orbit/Deep Space (unless Cellular Deck equipped). Max jump distance is 5.8 units.
* **Trace Defense:** Each successful LDL routing adds the target's `traceDefense` value to your cumulative defense pool. Cellular Deck adds +1 per jump. Higher = safer against Bloodhound trace attacks.
* **Trace Risk:** Failed scams add D10+1 (1-6). Rival flee adds +2. Sysop jack-out tracking adds +2 per hostile Sysop. If `traceRisk >= 20` at safehouse → **Netwatch Raid** (Costs 2000 eb to survive, otherwise Permadeath / Save Wipe).

### 3.2 The Net & Grid Combat (`TheNet.jsx`)
* **Grid:** 15x15 2D map. Entities include Data Walls (`#`), Code Gates (`[`), CPU (`C`), Memory (`M`), Player (`@`), ICE (`P`, `H`, `B`), Sysops (`S`), Controller Nodes (`O`), Daemons (`D`), Turrets (`T`).
* **Combat Math:** * `Attack/Evasion Total` = D10 + INT + Interface + Program STR + Deck Combat Bonus + Interface Modifier
    * `ICE Defense/Detection` = D10 + ICE STR (Pit Bull: 3, Bloodhound: 4, Hellhound: 5)
* **Bloodhound Active Tracing:** When a Bloodhound successfully damages the player, it performs an additional trace attack: `D10 + STR(4) vs traceDefense`. If trace total exceeds defense → forced jack-out, `traceRisk += 20` (guarantees Netwatch Raid). Terminal: `> BLOODHOUND ACTIVELY TRACING YOUR SIGNAL...`
* **Data Walls:** Generated with random `wallStr` (3-7) at map creation. Require `type: 'intrusion'` action programs to breach.
    * **Hammer** (STR 4, 1 MU, 400eb): Deals 2D6 wall STR damage on breach attempt. Alerts nearby ICE.
    * **Jackhammer** (STR 2, 2 MU, 360eb): Deals 1D6 wall STR damage. Quieter alternative.
    * Wall is destroyed (`world.remove`) when STR reaches 0, creating a passage.
* **Code Gates:** Require `activeAction` to be a `utility` program (e.g., *Decrypt*).
* **Memory Units:** Loot nodes. If `missionStore.activeJob` matches `routingStore.currentLdl`, the player secures the mission payload instead of random eb loot.
* **Anti-System Programs:** `type: 'anti-system'` action programs (Krash, Viral 15). Consumable on use (removed from deck).
    * **Krash** targets CPU nodes: opposed roll vs CPU defense (4). On success, CPU is destroyed and all ICE are frozen for 1D6+1 turns.
    * **Viral 15** targets Memory nodes: opposed roll vs Memory defense (3). On success, Memory is destroyed. If mission target, `missionStore.failPayload()` is called and the job is lost.
* **Anti-Personnel Programs:** `type: 'anti-ice'` action programs with special effects beyond standard derezzing.
    * **Brainwipe** (STR 3): On successful hit, ICE STR reduced by 1D6. If STR reaches 0, ICE derezzes. Otherwise, ICE entity type is updated to reflect new STR tier.
    * **Liche** (STR 4): On successful hit, ICE `isAlly` flag set to true. Render color changes to cyan. During enemy turn, allied ICE move toward and attack nearest hostile ICE instead of the player.
* **Daemons:** `type: 'daemon'` action programs. Consumable on deployment (removed from deck). Spawned as `isDaemon` entities with `isAlly: true`, render as `D` in cyan.
    * **Imp** (STR 2, 1 MU, 300eb): Deployed onto adjacent empty cell. During enemy turn, moves toward nearest hostile ICE and attacks (opposed roll: D10 + STR vs D10 + ICE STR). On failed attack, daemon STR decreases by 1. At STR 0, daemon derezzes.
    * **Balron** (STR 5, 3 MU, 1200eb): Same mechanics as Imp but with higher base STR and HP pool.
* **Stealth (Invisibility):** * *Passive:* At the start of the enemy turn, ICE rolls Detection vs Player Hide. If ICE fails, it skips its turn.
    * *Active:* If player clicks an ICE while Invisibility is in `activePassives`, they roll Evasion vs Detection. Success swaps player and ICE positions (allowing them to slip past).
* **Defense Programs (Armor & Shield):** * Both are `type: 'defense'` passive programs that run in `activePassives`.
    * Per CP2020 sourcebook (pg.139, 142), protection programs are the direct opposed counter to anti-personnel ICE attacks (`Anti-Personnel vs Protection`).
    * **Shield** (STR 3, 1 MU, 150eb): On a successful protection roll (D10 + INT + Interface + STR + Deck vs D10 + ICE STR), attack is **thwarted completely** (0 damage). On failure, attack proceeds normally with no reduction.
    * **Armor** (STR 4, 2 MU, 170eb): On a successful protection roll, attack is **stopped completely** (0 damage). On failure, reduces all incoming anti-personnel damage by **3 points** (min 0).
    * **Flak** (STR 4, 2 MU, 180eb): Creates static interference walls. While running: all ICE receive **-2 to Detection rolls** (making stealth more effective). Additionally, if damage penetrates all other defenses, Flak reduces final damage by **1 point** (min 0).
    * **Resolution order:** Shield resolves first (faster/lighter program), then Armor as fallback layer, then Flak as last-resort mitigation. Ties favor the defender (`>=`). All three can run simultaneously as resident programs.
* **Subgrids:** When CPU is destroyed (via Krash or breach), `generateFort(true)` creates a new 15x15 subgrid. Subgrids have: no outer walls or code gates, player placed at center, 2-3 ICE (denser), 2-4 Memory nodes. Terminal: `> ENTERING SUBGRID: INTERNAL ARCHITECTURE...`
* **File Types:** Memory nodes spawn with random `fileType`: **Grey** (60%, 500eb), **Black** (25%, 1000eb, red text), **BBS** (15%, 200eb + reduces `totalTrace` by 3, yellow text). Mission payload secures regardless of file type.
* **Sysop AI:** Non-subgrid dataforts have a 30% chance to spawn a human System Operator (`isSysop`). Rendered as `S` in orange (`text-orange-400`).
    * **Stats:** Sysops have randomized `int` (6-10), `interfaceLvl` (3-7), and `deckBonus` (0-2). Each carries 1-2 programs from a pool: *Sword* (STR 4), *Killer v2.0* (STR 6), *Armor* (STR 4), *Shield* (STR 3).
    * **Behavior:** During enemy turn, Sysops pathfind toward the nearest hostile target (player, allied ICE, or daemons). When adjacent, they execute an opposed roll: `D10 + INT + Interface + Best Program STR + Deck Bonus` vs player's `D10 + INT + Interface + Equipped Program STR + Deck Bonus`.
    * **Defense Resolution:** Player's Shield → Armor → Flak chain resolves against Sysop attacks identically to ICE attacks (opposed protection rolls).
    * **Player Combat:** Player clicks adjacent Sysop with `anti-ice` or `anti-system` action program to attack. Same opposed roll mechanic. Brainwipe degrades Sysop INT; Liche converts them to allied operators.
    * **Allied Sysops:** When reprogrammed by Liche (`isAlly: true`), Sysops target hostile ICE using their program loadout instead of the player. Converted Sysops are rendered in cyan.
* **Rival Netrunners:** 20% chance to intercept the player's LDL signal during route execution (World Map → Jacking In transition). Presents a modal encounter with three options:
    * **Fight:** Opposed roll using player's current equipped program vs rival's randomized stats (INT 5-9, Interface 2-5, Deck 0-2, Program 2-5). On win: player loots 200-700eb. On loss: player takes 1-3 neural damage. Flatline from rival wipes deck.
    * **Flee:** Sever connection, gain +2 trace risk. Proceeds to datafort normally.
    * **Pay:** Bribe rival for 100-400eb. If insufficient funds, rival attacks (Fight resolves automatically).
* **Jack-Out Tracking:** When the player triggers Emergency Jack Out while hostile Sysops remain alive in the datafort, each active Sysop plants a trace beacon. Player gains `+2 trace per living Sysop`. Terminal: `> WARNING: X SYSOPS STILL ACTIVE. TRACE PLANT DETECTED. +X TRACE.` Allied (Liche-converted) Sysops do not trigger this.

---

## 4. RECENT REFACTORS (CONTEXT FOR AGENTS)
1.  **Mobile Responsiveness:** The UI (`App.jsx`) uses a Flex layout on mobile with Slide-Out Drawers for the Meatspace (Left) and Cyberdeck (Right) panels. It defaults to a CSS Grid on Desktop (`md:` breakpoints).
2.  **Pan & Zoom:** The 2D Net grid is wrapped in `TransformWrapper` from `react-zoom-pan-pinch` to support touch/mouse-wheel navigation.
3.  **Resident Programs Refactor:** The `cyberdeckStore` was fundamentally altered in v1.4 to support passive/background programs. Previously, the deck only allowed one active program. Now, players can run `Invisibility` (Passive) while `Decrypt` (Action) is equipped.

---

## 5. ROADMAP & NEXT STEPS
Completed features:
* ~~**Defense Programs (Armor, Shield, Flak)**~~ — Implemented in v1.5.0. All three CP2020 protection programs available in the Black Market with full combat resolution.
* ~~**Anti-System Programs (Krash, Viral 15)**~~ — Implemented in v1.6.0. CPU crash + Memory wipe with consumable programs.
* ~~**Anti-Personnel Programs (Brainwipe, Liche)**~~ — Implemented in v1.7.0. Special anti-ICE effects: STR degradation and ICE reprogramming.
* ~~**Daemons (Imp, Balron)**~~ — Implemented in v1.8.0. Autonomous allied entities deployed onto the grid with full AI combat.
* ~~**Sysop AI (Human Operators)**~~ — Implemented in v1.9.0. Hostile human Netrunners with INT/Interface stats, program loadouts, and full AI combat. Liche-convertible.
* ~~**Rival Netrunners (World Map)**~~ — Implemented in v1.9.0. 20% intercept chance during routing. Fight/Flee/Pay modal encounter.
* ~~**Jack-Out Tracking**~~ — Implemented in v1.9.0. Living Sysops plant +2 trace each on emergency disconnect.
* ~~**Controller Nodes & Physical Interaction**~~ — Implemented in v1.10.0. Controller nodes (O) spawn in 50% of dataforts. Three interaction types: disable cameras (-3 ICE Detection), open blast doors (remove 5 walls), hijack turrets (spawn allied T entities).
* ~~**Heist Support Contracts**~~ — Implemented in v1.10.0. 30% of BBS jobs are physical heist contracts with turn-based time limits (25-35 turns). Higher payouts (sec × 1200 + 0-1500eb). Timer displayed in meatspace panel and terminal. Failure on timeout.
* ~~**Coprocessors**~~ — Implemented in v1.11.0. Hardware upgrade (3000eb) granting extra player actions per turn. Each coprocessor adds one additional action before the enemy turn activates. Stacks multiplicatively (2 coprocessors = 3 actions total).
* ~~**Cellular Decks**~~ — Implemented in v1.11.0. Upgrade (2500eb) allowing orbital LDL launch without Earth starting point. Reduces trace risk by 1 per successful routing jump.
* ~~**Trode Sets vs. Interface Plugs**~~ — Implemented in v1.11.0. Trode Set (500eb): -1 to ALL player rolls, safe (no extra neural damage). Interface Plugs (1500eb): +1 to ALL player rolls, +50% neural damage taken (rounded up). Applied to all combat, stealth, controller, and rival encounter rolls. Logged in terminal as `+ IFACE(X)`.
* ~~**True Tracing Refactor (LDL Trace Defense)**~~ — Implemented in v1.12.0. `totalTrace` split into `traceDefense` (accumulates from successful routing — higher = safer) and `traceRisk` (accumulates from failures — ≥20 triggers raid at safehouse).
* ~~**Active Tracing ICE**~~ — Implemented in v1.12.0. Bloodhound ICE performs trace attack on adjacency: D10 + STR vs player's traceDefense. If trace wins → forced jack-out with 20 traceRisk (triggers Netwatch Raid at safehouse).

### Phase 1: Completing the Software Library
* ~~**Defensive Software**~~ — Complete. Armor, Shield, and Flak all integrated into `activePassives`.
* ~~**Anti-System Programs**~~ — Complete. Krash and Viral 15 available as `anti-system` action programs. Consumable on use.
* ~~**Anti-Personnel Programs**~~ — Complete. Brainwipe (-1D6 ICE STR on hit) and Liche (reprograms ICE as allied daemon) available as `anti-ice` action programs.
* ~~**Daemons**~~ — Complete. Imp (STR 2, 1 MU) and Balron (STR 5, 3 MU) deployable as `isDaemon` entities with autonomous AI.

### Phase 2: Lore-Accurate Architecture & Grid Topography
* ~~**Data Walls vs. Code Gates**~~ — Complete. Data Walls have `wallStr` and require `intrusion` programs (Hammer, Jackhammer) to breach. Code Gates remain Decrypt-only.
* ~~**Subgrids**~~ — Complete. CPU destruction triggers subgrid: new 15x15 map with 2-3 ICE, 2-4 Memory nodes, no outer walls.
* ~~**Specific File Types**~~ — Complete. Memory nodes spawn with `fileType`: Grey (60%, 500eb), Black (25%, 1000eb), BBS (15%, 200eb + -3 trace).

### Phase 3: The Human Element (Sysops & Rival Runners)
* ~~**Sysop AI**~~ — Complete. 30% spawn chance per datafort. Full INT/Interface stats, program loadouts (Sword, Killer, Armor, Shield), autonomous pathfinding, and combat against player/daemons/allied ICE. Liche-convertible to allied operators.
* ~~**Rival Netrunners**~~ — Complete. 20% chance on route execution. Modal encounter: Fight (opposed roll for 200-700eb loot or 1-3 neural damage), Flee (+2 trace), or Pay (100-400eb bribe).
* ~~**Jack-Out Tracking**~~ — Complete. Emergency jack-out with living hostile Sysops adds +2 trace per Sysop. Allied Sysops exempt.

### Phase 4: Meatspace Manipulation (Controller Nodes)
* ~~**Controller Nodes**~~ — Complete. 50% spawn chance per non-subgrid datafort. Rendered as `O` in teal. Three interaction types:
    * **Disable Cameras** (Utility program): Opposed roll vs node defense (4-6). Success applies -3 to all ICE Detection rolls for remainder of run.
    * **Open Blast Doors** (Intrusion program): Removes 5 random data walls instantly, no roll required.
    * **Hijack Turrets** (Anti-System program): Opposed roll vs node defense. Success spawns 1-2 allied turret entities (`T`, range 4, STR 6) that fire at nearest hostile ICE each enemy turn.
* ~~**Physical Interaction**~~ — Complete. Clicking controller node opens modal menu with three action options. Each requires specific program type (Utility, Intrusion, or Anti-System). Controller node is destroyed after interaction regardless of success.
* ~~**Mission Integration (Heist Contracts)**~~ — Complete. 30% of BBS jobs are `isHeist` contracts with `turnLimit` (25-35 turns). Title prefixed with `PHYSICAL:`. Orange border styling. Turn counter tracked in `TheNet.jsx` via `turnCount` state. Warning at ≤3 turns remaining. Automatic `failPayload()` on timeout with flatline SFX. Heist payouts are 50% higher than standard contracts.

### Phase 5: Hardware & Cyberdeck Modification
* ~~**Coprocessors**~~ — Complete. 3000eb per module, tracked via `coprocessors` count in `cyberdeckStore`. Each coprocessor grants one extra player action before enemy turn. `pendingAction` state in TheNet tracks remaining extra actions. Terminal logs `> COPROCESSOR ENGAGED. SECOND ACTION CYCLE AVAILABLE.` and countdown.
* ~~**Cellular Decks**~~ — Complete. 2500eb one-time upgrade via `setCellular(true)`. Removes Earth-first LDL routing requirement: allows starting on orbit/space LDLs directly. Reduces trace mod by 1 per successful jump. UI indicator in right panel: `> CELLULAR DECK: ACTIVE (ORBITAL LAUNCH ENABLED)`.
* ~~**Trode Sets vs. Interface Plugs**~~ — Complete. `interfaceType` tracked in `meatspaceStore` (values: `'default'`, `'trodes'`, `'interfacePlugs'`).
    * **Trode Set** (500eb): `interfaceBonus = -1` applied to all player rolls (combat, stealth, CPU, memory, controller, rival). `takeDamage` unchanged — safe option. Displayed in left panel as `> NEURAL: TRODE SET (-1 ALL / SAFE)`.
    * **Interface Plugs** (1500eb): `interfaceBonus = +1` applied to all player rolls. `takeDamage` multiplies by 1.5 (rounded up) — high-risk, high-reward. Displayed in left panel as `> NEURAL: INTERFACE PLUGS (+1 ALL / +50% DMG)`.
    * Both are mutually exclusive; purchasing one replaces the other. All roll logs show `+ IFACE(X)` modifier when non-zero.

### Phase 6: The Ultimate Lore Fix (True Tracing)
* ~~**Reverting to Defensive Tracing**~~ — Complete. `routingStore.js` refactored: `totalTrace` replaced with `traceDefense` (increases on successful routing via LDL `traceDefense` values) and `traceRisk` (increases from failed scams, rival encounters, sysop jack-out tracking). Successful routing now provides protection rather than building a "Wanted Level". BBS files reduce `traceRisk` by 3. World Map UI shows both values: `DEFENSE: X` (teal) and `RISK: X` (red).
* ~~**Active Tracing ICE**~~ — Complete. Bloodhound ICE gains a secondary trace attack when adjacent to player: `D10 + STR(4) vs traceDefense`. If trace total exceeds defense → forced jack-out after 2s delay, `traceRisk += 20` (guarantees Netwatch Raid at safehouse). Terminal: `> BLOODHOUND ACTIVELY TRACING YOUR SIGNAL...` / `> TRACE SUCCESSFUL. NETWATCH HAS TRIANGULATED YOUR PHYSICAL IP.` Cellular deck boost adds +1 to traceDefense gain per routing jump.

### Phase 7: The Ihara-Grubb Transformations (Aesthetics)
* **Thematic Dataforts:** Implemented in v1.13.0. Corporate visual "skins" for grid entities based on the LDL owner. Each corp has unique wall/entity characters and colors:
    * **Arasaka** (Seattle, Hong Kong, Tokyo, Manila, Singapore): Red theme with Japanese-inspired characters (▓ walls, 雅 CPU, 文 Memory)
    * **Militech** (Night City, Chicago, Mars bases): Green military theme (█ walls, ⚙ CPU, ♦ Memory)
    * **Petrochem** (Atlanta, Mexico City, Bogota, Nairobi): Yellow industrial theme (░ walls, ⛢ CPU, ⛃ Memory)
    * **Biotechnica** (Neo-NY, Rio, Sydney): Purple bio-theme (▒ walls, ⚘ CPU, ⚕ Memory)
    * **Eurospace** (London, Paris, Berlin, Rome, Orbit): Blue space theme (▦ walls, ⚖ CPU, ⚚ Memory)
    * **SovSpace** (Moscow, Luna bases): Gray soviet theme (▣ walls, ☭ CPU, ⚇ Memory)
* Corp indicator displayed on grid UI and terminal log when entering dataforts
* Corp names shown in World Map tooltips

### Phase 8: Custom Software Programming & Downtime
* **Code Compilation:** Implemented in v1.14.0. Added `programming` stat to meatspace store (default: 3). Players can spend Safehouse downtime to compile custom software:
    * Programming Panel UI with 14 program templates (Sword, Hammer, Decrypt, Shield, Armor, Invisibility, Brainwipe, Liche, Krash, Viral 15, Imp, Balron, Flak)
    * Cost formula: `max(50, baseCost - (programming * 20))` (higher skill = lower cost)
    * Time formula: `max(1, baseDays - floor(programming / 3))` (higher skill = faster compilation)
    * Day-by-day progression with progress bar
    * Cancel compilation option (no refund)
    * Programs added to cyberdeck on completion
* **Integration:** Button added to safehouse phase "[ CUSTOM PROGRAMMING ]" opens the ProgrammingPanel

### Phase 9: Hardware Degradation & Economy
* **Deck Durability:** Implemented in v1.15.0. Added `deckHealth` (100%) and `maxDeckHealth` to cyberdeck store.
    * `damageDeck(amount)`: Reduces deck integrity (called when hit by Firestarter ICE)
    * `repairDeck(amount)`: Restores deck integrity
    * `deckCrashes`: Tracks critical failures
    * `reduceMaxMu(amount)`: Reduces max MU after crashes
* **Firestarter ICE:** Added to ICE pool (char: 'F'). When Firestarter damages player, it also deals 10-25% deck integrity damage. Terminal log: `FIRESTARTER CORRUPTED YOUR DECK FIRMWARE!`
* **Techie Repairs:** RepairPanel UI in safehouse (`[ REPAIR DECK ]` button):
    * Patch Firmware (200 eb, 1 day): Restore 30% integrity
    * Rebuild Logic (500 eb, 3 days): Restore 60% integrity
    * Full Restore (1000 eb, 7 days): Restore 100% integrity + reset crash counter
    * Replace Components (800 eb, 5 days): Restore 1 max MU lost from crashes
* **Integration:** Repair state added to game phase machine. Deck health bar displayed in RepairPanel.

### Phase 10: The Wilds & Rogue AIs (Endgame)
* **Ghost Towns:** Implemented in v1.16.0. Added 3 abandonned LDL nodes to World Map:
    * **Detroit Ruins** (x:4, y:8, Sec:7) - North America
    * **Saigon Void** (x:16, y:11, Sec:8) - Asia
    * **Lagos Ghost** (x:12, y:12, Sec:9) - Equatorial
* **Ghost Town Mechanics:**
    * No corporate security (`corp: null`, `isGhostTown: true`)
    * Rendered with purple styling on World Map (bg-purple-900 border-purple-500)
    * Higher security levels (7-9) for increased challenge
    * No trace defense gain on successful routing
    * Feral ICE pool: 'Feral Hellhound', 'Feral Pit Bull', 'Feral Bloodhound', 'Feral Firestarter'
    * Feral ICE rendered in purple (text-purple-500)
* **Rogue AI Entities:** Spawn in Ghost Town dataforts (50% chance when Sysop would spawn):
    * Rendered as 'R' in purple with pulse animation
    * `isRogueAI: true` flag
    * High stats: INT 10-14, Interface 8-12, Deck Bonus 3-7
    * Carries high-strength programs (Sword STR 6, Killer STR 8, Krash, Viral 15)
    * **Standard programs ineffective:** Anti-ice/anti-system attacks do no damage
    * Terminal: `> WARNING: ROGUE AI ENTITY DETECTED. STANDARD PROGRAMS INEFFECTIVE.`
    * Requires puzzle-like dialogue or system-crashing logic to defeat (hinted in terminal)
* **Integration:** Wild Zone tab added to World Map region tabs. Ghost Town tooltips indicate "GHOST TOWN: FERAL ICE".

### Phase 11: Black Market Overhaul (Filters & Add-ons)
* **Shop Filters:** Implemented in v1.17.0. Restructured Black Market with tabbed filters:
    * **SOFTWARE:** All programs with type-based color coding (Anti-ICE=red, Intrusion=orange, Daemon=cyan, etc.)
    * **CYBERDECKS:** Deck models from sourcebook (Zetatech Paraline, Fuchi Cyber-4, Raven Microcyber, Deckman Portable, Cyber-1 Console)
    * **ADD-ONS:** Hardware per sourcebook rules:
        * **Cellular Mod** (2500 eb): Launch from orbital LDLs directly, -1 trace risk per jump
        * **Coprocessor Module** (3000 eb): Execute 2 player actions per enemy turn, stacks
        * **Memory Expansion Chip** (1000 eb): +1 MU capacity
        * **Interface Plugs** (1500 eb): +1 ALL rolls, +50% neural damage (surgical install)
        * **Trode Set** (500 eb): -1 ALL rolls, safe (non-invasive)
        * **Scramble Chip** (5000 eb): Emergency jack-out without trace penalty, 1-use per run
        * **Speed Chip** (3000 eb): Move 2 cells per turn instead of 1
        * **Ripple System** (4000 eb): Trace defense +2 per successful routing jump
    * **UPGRADES:** Increase MU (+1 for 500 eb, +3 for 1200 eb) or combat bonus (+1 for 2000 eb)
* **Product Grid:** Visual grid layout with color-coded types, cost display, already-owned indicators
* **Integration:** ShopPanel component with filter tabs, product selection, and purchase handling

---

## 6. POST-ROADMAP EXPANSIONS (ENDGAME VISION)
Once the 10-Phase core roadmap is completed and the simulator mirrors the TTRPG entirely, development can shift toward these massive replayability expansions:

### Expansion 1: Faction Reputation & Corporate Wars
* **Reputation Economy:** Hacking corporate Dataforts (e.g., Arasaka) increases your "Wanted Level" with them, making their ICE deadlier, but earns you reputation with rival factions (e.g., Militech, Yakuza).
* **VIP Black Markets:** High faction reputation unlocks proprietary, military-grade Cyberdecks and ICE unavailable on the standard Afterlife BBS.

### Expansion 2: Datafort Construction (Asynchronous PvP)
* **Custom Servers:** Players can purchase blank grid spaces and spend Eurobucks to build their own Dataforts, placing Data Walls, Code Gates, custom ICE patrol routes, and Daemons.
* **Seed Sharing:** The custom Datafort generates a unique seed/hash that can be shared online, allowing other players to paste the code and attempt a run against the player's custom security.

### Expansion 3: Edgerunner Crew Management
* **Meatspace Mercenaries:** Players can use the Safehouse to hire NPC crews (Solos, Techies, Nomads) for physical heists.
* **Synchronized Runs:** While navigating the Net, players receive radio updates from their crew in the real world. Players face strict turn-limits to hack Controller Nodes (e.g., Turrets, Blast Doors) to ensure their crew survives and extracts the physical payload.

### Expansion 4: The DataKrash (Survival Mode)
* **The Bartmoss Event:** A brutal roguelike challenge mode recreating the destruction of the Old Net.
* **Collapsing Grid:** The procedural Mega-Fort literally deletes itself turn-by-turn. The grid turns to static, forcing a high-speed race to extract legendary files before the corruption flatlines the player's brain.

### Expansion 5: Trauma Team & Meta-Progression
* **Insurance Policies:** To mitigate the harshness of late-game permadeath, players can pay exorbitant monthly Eurobuck fees for Trauma Team International insurance or illegal clone-vats.
* **Soft Permadeath:** If a player flatlines, Trauma Team raids their location. The player loses their equipped Cyberdeck and mission loot, but retains their base Meatspace stats, skills, and Safehouse stash.


### Expansion 6: Meatspace Cyberware & Ripperdocs
* **Body Modification:** Expand the Meatspace UI to include a "Ripperdoc" clinic. Players can spend Eurobucks to surgically upgrade their Meatspace stats.
* **Neuralware:** Install Math Co-processors to boost INT, Kerenzikov reflex enhancers to boost REF, or upgraded Neural Links to increase max Neural HP.
* **Humanity Cost:** Installing cyberware lowers the player's Empathy/Humanity stat. If it drops too low, the player experiences Cyberpsychosis, causing random UI glitches, visual hallucinations on the Net grid, or forced reckless actions.

### Expansion 7: Corporate Stock Manipulation
* **The "Short Squeeze" Heist:** Introduce a dynamic global stock market ticker in the Safehouse.
* **Insider Trading:** Before launching a destructive run on a corporate Datafort (e.g., crashing a Militech CPU), the player can use their Eurobucks to short Militech's stock or invest in their rivals.
* **Economic Ripple Effects:** Successfully stealing a Black File or destroying a core node dynamically alters the stock prices, allowing the player to double their heist payout through illegal market manipulation.

### Expansion 8: Environmental Grid Hazards (Net Storms)
* **Dynamic Grid Weather:** The Net isn't always stable. Introduce randomized environmental hazards on the 2D grid that affect both the player and Black ICE.
* **Data Static & Ion Storms:** "Static Clouds" that limit visibility/fog-of-war to 1 tile, or "Ion Storms" in Orbital Space nodes that randomly scramble movement coordinates or temporarily disable specific Cyberdeck programs.

### Expansion 9: Faction-Aligned Fixers & Information Brokering
* **Specific Contacts:** Replace the generic "BBS Job Board" with a roster of distinct Fixer NPCs (e.g., a Corpo Rat, a Yakuza Boss, a Nomad Outcast).
* **Information Brokering:** When the player extracts a "Grey File," they can choose who to sell it to. Selling Arasaka data to Militech pays well but increases Arasaka's active trace on the player.
* **Loyalty Perks:** Building max loyalty with a specific Fixer unlocks unique safehouses, custom UI color schemes, or emergency bail-out funds if the player goes bankrupt.

### Expansion 10: Soulkiller & Construct Ascension (The True Permadeath)
* **The Ultimate Black ICE:** Introduce *Soulkiller*, the legendary, illegal Arasaka Black ICE. Instead of simply dealing Neural Damage, it attacks the player's fundamental consciousness.
* **Digital Engrams:** If a player is flatlined by *Soulkiller*, their Meatspace body dies, but the save file isn't completely wiped. The player becomes a "Construct" (a digital ghost, like Alt Cunningham). 
* **Ghost Gameplay Loop:** As a Construct, you lose access to the Safehouse, Meatspace stats, and Fixers. You live purely on the Net grid, having to hijack CPU nodes to store your code and steal processing power to survive, completely changing the game into a digital survival-horror experience.

### Expansion 11: Netwatch Roaming Patrols (World Map Threat)
* **Active World Map AI:** The World Map is no longer static. Elite Netwatch operatives (represented by moving icons) actively patrol the continental LDLs turn-by-turn.
* **Grid Interdiction:** If your routing path crosses an LDL currently occupied by a Netwatch patrol, you are pulled into a forced, high-stakes "Interdiction Grid" combat encounter before you even reach your target Datafort. You must either flatline the cop or survive long enough to force an emergency trace-disconnect.

### Expansion 12: Public Dataterms & "Street" Running
* **The Cost of Living:** Safehouses require monthly Eurobuck upkeep. If the player goes bankrupt and gets evicted, they are forced onto the streets.
* **Dataterm Jacking:** Without a Safehouse, the player must jack into the Net using public Night City Dataterms. These runs have strict, real-world time limits (before a beat cop notices you), heavily increased Trace generation, and force the use of slow, unencrypted public LDLs.

### Expansion 13: Chromebook Deck Peripherals
* **Hardware Add-ons:** Expand the Cyberdeck's modularity based on the *Chromebook* sourcebooks. Players can purchase and bolt on physical peripherals in Meatspace.
* **Physical Chipreaders:** Allows the player to slot a one-time-use physical "Soft" (software) chip bought from the Black Market, essentially giving them a consumable free program slot that doesn't cost deck MU.
* **Hardened Circuitry:** An expensive hardware upgrade that provides immunity to physical deck-destroying programs like *Firestarter*.
* **Videoboards:** Allows the runner to maintain a visual link to their physical surroundings, slightly increasing Meatspace awareness (avoiding ambushes if playing the Edgerunner Crew Expansion).

### Expansion 14: Weeflerunners & Trash Grids
* **Script Kiddies:** Not every Datafort is a massive corporate monolith. Introduce "Trash Grids" run by "Weefles" (amateur Netrunners). 
* **Unpredictable Danger:** These grids have low security and terrible loot, but they use homemade, wildly unstable ICE. Instead of predictable damage, Weefle ICE might accidentally crash the entire grid, randomly delete its own Code Gates, or backfire and deal damage to the Weefle Sysop.

### Expansion 15: The Bartmoss Contingency (Dead Man's Switches & Cryo-Rigs)
* **Cryogenic Support Rigs:** The ultimate late-game Safehouse upgrade modeled after Rache Bartmoss' legendary setup. Players can purchase illegal cryo-chambers, allowing the runner to remain jacked into the Net indefinitely without needing to disconnect for Meatspace rest or healing. However, this makes them uniquely vulnerable to physical power grid failures or real-world sabotage.
* **Dead Man's Switches:** Hardware modifications that trigger catastrophic revenge events if the runner flatlines. A player can wire their deck to release a localized DataKrash-style virus, wipe a rival Fixer's debt ledger, or scramble the physical coordinates of their Safehouse to prevent a corporate meat-team from recovering their stash.
* **Emergency Self Construct (ESC):** The absolute pinnacle of black-market survival software. If the player's physical body is killed (either by a Meatspace raid or lethal Black ICE), the ESC automatically triggers, ripping a digital engram of the player's consciousness and uploading it to a pre-selected Datafort. This saves the save file and instantly forces the player into the digital-only "Construct" gameplay loop (see Expansion 10).

### Expansion 16: Meatspace Survival & Economy (The "Edgerunner Lifestyle" Engine)
To faithfully recreate the *Cyberpunk 2020* lifestyle rules, the game loop must enforce strict monthly (in-game) financial drains and physiological upkeep. The AI agent must implement the following state variables and triggers:

**16.1 Housing Tiers & Rent (Location-Based Safehouses)**
The player must pay monthly rent. If rent is missed, they lose their Safehouse and are forced onto the streets, losing access to standard landlines and stash storage.
* **Coffin/Cube (Combat Zone):** 150 eb/month. High risk of Safehouse being randomly burgled while the player is jacked into the Net. 
* **Studio Apartment (Moderate Zone):** 200 eb/month. Standard security; the baseline Safehouse.
* **Corporate Penthouse:** 1,000+ eb/month. Absolute security. Grants an automatic "Clean" landline (reduces base Trace risk).

**16.2 Diet & Sustenance (The "Kibble" System)**
The player has a biological Hunger meter that depletes every 24 in-game hours. Eating costs money, and the quality of food affects stat regeneration.
* **Kibble (50 eb/month):** The cheapest option. Staves off starvation, but the player suffers a permanent -1 to their Meatspace EMP/Humanity stat due to the miserable living conditions.
* **Generic Prepack (150 eb/month):** Standard microwavable synth-food. Keeps stats at baseline.
* **Fresh Food (500 eb/month):** A luxury. Grants a temporary +1 bonus to the player's INT or REF for the next 24 hours due to high nutritional quality.
* **Starvation Penalty:** If the player cannot afford food, their REF and INT stats temporarily drop by 1 point per day until they eat.

**16.3 Telecom Bills & LDL Routing Costs**
Jacking into the Net isn't free. The player is literally making phone calls to access the grid.
* **Base Landline Service:** 100 eb/month. Failing to pay this immediately disables the Safehouse deck connection.
* **Long Distance LDL Routing (Per-Minute Costs):** Bouncing a signal through international LDLs (Long Distance Links) costs money. Every "Turn" spent in a foreign Datafort ticks up the player's telecom bill. If a player does a massive 50-turn run through a Tokyo Arasaka fort from their Seattle Safehouse, they should receive a massive phone bill at the end of the month.
* **Utility Fraud (Hacking the Bill):** Add a downtime option in the Safehouse allowing the player to roll their `System Knowledge` or `Programming` skill to spoof their phone line. Success waives the month's LDL routing fees; failure immediately alerts Netwatch.

**16.4 Fatigue & Sleep Deprivation**
Netrunning is mentally exhausting. 
* **The Sleep Meter:** The player can safely operate for 16 in-game hours.
* **Stimulants:** Players can purchase "Smash" or standard amphetamines to stay awake longer, resetting the sleep meter temporarily.
* **Deprivation Penalty:** For every 2 hours spent awake past the 16-hour mark, the player suffers a cumulative -1 to their INT and REF stats. If INT drops to 0, the player automatically passes out, forcefully and unsafely jacking them out of the Net (which can trigger lethal Black ICE feedback).

### Expansion 17: Prolonged Immersion Hardware (System Logic & State Overrides)
To implement prolonged Netrunning hardware, the game state must introduce an "Immersion Mode" boolean that intercepts and overrides the standard biological decay timers (Hunger and Sleep) established in Expansion 16, replacing them with Hardware Capacity limits.

**17.1 Bodyweight Life/Support System (Portable Implementation)**
This item functions as a highly expensive, consumable-driven deck peripheral.
* **Inventory & Upkeep:** The player must equip this item in a new "Peripheral" slot. Running the system requires purchasing consumable "Nutrient/Waste Packs" (e.g., 100 eb per run) from a Ripperdoc or Black Market. 
* **State Override:** When jacked in, the player's Hunger and Sleep meters are frozen. Instead, a 72-hour `immersionTimer` begins ticking. 
* **The "Crash" Penalty:** Disconnecting from the Net after being artificially sustained for more than 24 in-game hours triggers a massive "System Shock." The player's REF and BODY stats are temporarily halved for 12 in-game hours due to muscle stiffness and stimulant withdrawal, forcing them to rest safely before attempting another run.
* **Lethal Threshold:** If the player ignores the 72-hour limit and stays jacked in, the IV bags run dry and toxicity builds up. The player takes immediate, unblockable Meatspace damage every hour until flatlining or forced disconnect.

**17.2 Bodyweight™ Data Creche (Safehouse Installation)**
This is not an inventory item; it is a permanent Safehouse upgrade and an entirely separate cyberdeck.
* **Installation Requirements:** Cannot be installed in a Combat Zone Coffin. Requires a Studio Apartment tier or higher. Costs thousands of Eurobucks to purchase and install.
* **Deck Stat Override:** When the player initiates a Net run from this specific Safehouse, the game completely ignores their currently equipped portable deck and instead uses the Creche's internal modem stats (`Speed: +1, MU: 12, Data Walls: +4`).
* **The 96-Hour Limit:** Functions identically to the portable system but extends the safe immersion timer to a massive 96 hours, with a much smoother "Crash" penalty upon waking due to the integrated sleepmat and massage nodes.
* **The Videoboard Mechanic (Meatspace Awareness):** Under normal rules, running from home leaves the player blind to the physical world. Because the Creche has a 1'x1' videoboard, if an external threat (e.g., a burglar, an eviction squad, or a traced Netwatch hit-team) breaches the Safehouse, the player receives a priority UI alert *inside* the Net. This grants them exactly 1 safe turn to execute a clean Jack-Out before their meat body is attacked.

**17.3 Cyberpsychosis & Empathy Drain**
Spending 90 hours inside a digital construct without touching the real world strips away a runner's humanity.
* **The Ghost Atrophy:** For every continuous 24-hour block spent in Immersion Mode, the player permanently loses 0.1 EMP (Empathy/Humanity). Pushing these limits frequently will slowly drive the runner into Cyberpsychosis, eventually causing the game-over state reserved for machines and Rache Bartmoss wannabes.

### Expansion 18: Cyborg Ascension (Full Body Conversions)
Players who accumulate massive wealth can discard their fragile Meatspace bodies entirely. The player's brain and spinal cord are surgically removed and placed into a "Biopod," which can be slotted into various specialized robotic chassis.

**The Biopod Mechanic:**
* Once converted, the player's biological humanity drops to near zero. 
* Players no longer use standard Neural HP for physical damage; they use **SDP (Structural Damage Points)**. FBCs do not "heal"—they must be repaired by spending Eurobucks at a Techie.
* A player can own multiple chassis and swap their Biopod into a different body at their Safehouse depending on the mission requirements.

**Chromebook 2 FBC Chassis Roster:**
* **Gemini:** The human-passing chassis. Covered in synthetic RealSkinn and hair, it allows the player to bypass security checkpoints. (Note: Base model has no inherent armor unless Subdermal Armor is purchased).
    * *Base Stats:* REF 10, MA 10, BODY 12, SP 0. 
    * *SDP:* Limbs 20/30, Torso 30/40. 
    * *Cost:* 55,000 eb.
* **Alpha Class:** The standard combat/solo conversion. Sleek, metallic, fast, and heavily armored. 
    * *Base Stats:* REF 10, MA 10, BODY 12, SP 25. 
    * *SDP:* Limbs 20/30, Torso 30/40. 
    * *Cost:* 58,000 eb.
* **Wingman:** The aerospace pilot chassis. Immune to high G-forces and comes with direct neural-link jacks. 
    * *Base Stats:* REF 15, MA 10, BODY 12, SP 25. 
    * *SDP:* Limbs 20/30, Torso 30/40. 
    * *Cost:* 54,000 eb.
* **Eclipse:** The espionage chassis. Coated in radar-absorbent materials and silent joints. 
    * *Base Stats:* REF 10, MA 12, BODY 10, SP 15. 
    * *SDP:* Limbs 20/30, Torso 30/40. 
    * *Cost:* 76,000 eb.
* **Aquarius:** The deep-sea operations FBC. Equipped with sonar and extreme pressure resistance. 
    * *Base Stats:* REF 8, MA 10 (Swim 15), BODY 12, SP 15. 
    * *SDP:* Limbs 20/30, Torso 40/50. 
    * *Cost:* 65,000 eb.
* **Fireman (Brimstone):** The hazard/rescue conversion. Immune to extreme heat and toxic environments. 
    * *Base Stats:* REF 8, MA 10, BODY 14, SP 20. 
    * *SDP:* Limbs 30/40, Torso 40/50. 
    * *Cost:* 60,000 eb.
* **Samson (Worker):** The heavy industrial labor chassis. Extremely slow, but possesses massive lifting capacity.
    * *Base Stats:* REF 6, MA 8, BODY 18, SP 15. 
    * *SDP:* Limbs 40/50, Torso 50/60. 
    * *Cost:* 40,000 eb.

**Chromebook 3 FBC Chassis Roster:**
* **Wiseman (Cyberspace Commando):** The ultimate Netrunner chassis. Stripped down for pure digital speed. Packed with extra internal MU and hardened circuitry immune to *Firestarter* ICE.
    * *Base Stats:* REF 10, MA 10, BODY 12, SP 15. 
    * *SDP:* Limbs 20/30, Torso 30/40. 
    * *Cost:* 90,000 eb.
* **Dragoon:** The maximum combat borg. A highly illegal, walking military tank allowing the player to mount heavy vehicular weapons directly to their arms.
    * *Base Stats:* REF 15, MA 25, BODY 20, SP 40. 
    * *SDP:* Limbs 40/50, Torso 50/60. 
    * *Cost:* 120,000 eb.
* **Spyder:** A multi-limbed climbing/maintenance chassis. Features extra arms and wall-crawling capability. 
    * *Base Stats:* REF 12, MA 20, BODY 12, SP 30. 
    * *SDP:* Limbs 20/30, Torso 30/40. 
    * *Cost:* 118,110 eb.

**Deep Space FBC Chassis Roster:**
* **Copernicus (Space-Use):** Manufactured by Cybermatrix, this is the ideal chassis for deep-space exploration and orbital operations. It comes fully shielded against radiation, EMP, and microwaves. 
    * *Base Stats:* REF 11, MA 10, BODY 12, SP 25. 
    * *SDP:* Limbs 20/30, Torso 30/40. 
    * *Cost:* 60,000 eb.
* **Burroughs (Mars Operations):** Manufactured by Adrek Robotics, this chassis is heavily reinforced to withstand the scouring sandstorms of the Martian surface. It is outfitted with extreme temperature controls and radiation shielding.
    * *Base Stats:* REF 10, MA 10, BODY 12, SP 30. 
    * *SDP:* Limbs 30/40, Torso 40/50. 
    * *Cost:* 65,000 eb.

**FBC Upgrades & Customization Options:**
* **Stat Overclocking:** Players can spend Eurobucks to permanently increase the REF (Reflexes), MA (Movement), and BODY stats of their specific chassis up to its mechanical cap.
* **CCPL Retrofit (Cyber-Steroids):** A high-end upgrade from *Chromebook 3*. It temporarily multiplies the FBC's BODY stat by 3, allowing the borg to physically equip and wear ACPA (Powered Combat Armor) over their chassis for apocalyptic levels of defense.
* **Interchangeable Quick-Mounts:** Allows the player to hot-swap physical arms/weapons on their chassis without visiting a Ripperdoc. 
* **Hardened Shielding:** Expensive localized shielding that protects the chassis from Meatspace EMP grenades or microwave weapons that would normally shut down an FBC.

### Expansion 19: Custom Software Compilation (Programming 101)
Players no longer need to rely strictly on the Afterlife BBS to buy software; they can compile homegrown programs from scratch in their Safehouse.

**The Compilation Formula:**
* **Difficulty Calculation:** Every program is built from three elements: Functions, Options, and Strength. The total Difficulty to write the program is the sum of the Difficulty costs for all Options, plus the Function cost, plus the Strength level.
* **The Skill Check:** To successfully write the program, the player must roll their INT + Programming Skill + 1D10 and get a value equal to or greater than the Difficulty number.
* **Pooling:** If the Difficulty is too high, the player can hire/team up with an NPC Netrunner to pool their respective INT and Skills together, rolling a single D10 for the combined total.

**Time, Cost, and Storage Space:**
* **Writing Times:** Every point of program Difficulty takes 6 in-game hours to write.
* **Market Value:** If selling custom code (or calculating base worth), the cost is the Difficulty multiplied by 10eb. This is then modified by the program type (e.g., Intrusion/Utilities are 1x cost, Anti-Program is 4x cost, Anti-Personnel is 25x cost).
* **Program Size (MU):** Difficulty directly determines the Memory Unit size. A Diff of 10-15 takes 1 MU, scaling up to Diff 41+ taking 7 MU.
* **Code Optimization:** Players can apply this specific Option to cut the program's final MU size in half (rounded up), but it increases the Difficulty of the program by +10.

**Demons and Daemons:**
* **Demonology:** Demons use a Compiler function to pack several other programs together. The subprograms take up half the memory space (Add all Difficulty numbers together, divide by 2, and add to the Demon's difficulty).
* **Demon Drawbacks:** The Demon's Strength is reduced by 1 for each program "on board," and if the Demon is destroyed, all linked programs go down with it.
* **Independent Daemons:** Constructed like a Demon but specifically require the Recognition, Movement, and Pseudointellect options. They can be equipped with the **Disguise** function (Difficulty 10) to fool defensive programs, or the **Doppleganger** function (Difficulty 20) to absorb the functions of a program it just destroyed.

**Data Chips & Piracy:**
* **Storage:** Programs are stored on physical data chips, holding 1 MU each. Standard copying costs 10.00 eb per chip.
* **Copy Protection:** Anti-Program and Anti-Personnel programs have special copy-protection routines that erase the chip during a backup attempt. Players must beat a Task Difficulty of 28 using their Programming Skill to break the protection and successfully pirate the software.

### Expansion 20: Controller Node Interface Logic
When a player interacts with a Controller Node (`O`) on the grid, the game phase transitions to a modal interrupt. Executing any option requires a specific program type to be currently loaded in the player's `activeAction` or `activePassives` state within the `cyberdeckStore`. 

* **[ DISABLE CAMERAS ] (Utility):** 
    * *Prerequisite:* Requires a Utility program (e.g., *Decrypt*).
    * *Logic:* Updates the grid combat state to apply a permanent `-3` penalty to the "ICE Defense/Detection" math calculation for all enemy entities for the remainder of the run.
* **[ OPEN BLAST DOORS ] (Intrusion):** 
    * *Prerequisite:* Requires an Intrusion program (e.g., *Hammer*, *Drill*).
    * *Logic:* Directly mutates the 2D grid array in `TheNet.jsx`, locating and converting 5 Wall entities (`#`) into empty path tiles, opening shortcuts to the CPU/Memory nodes.
* **[ HIJACK TURRETS ] (Anti-System):** 
    * *Prerequisite:* Requires an Anti-System program (e.g., *Krash*).
    * *Logic:* Spawns allied stationary Turret entities (e.g., `T`) on the grid. During the player's turn, these entities automatically roll attacks against any Black ICE within their line of sight/radius.
* **Execution & Cleanup:** Successfully executing any of these three actions consumes the Controller Node (converting the `O` tile to an empty space) and returns the XState router back to the standard `net` combat phase.


### Phase 21: System Initialization (Character Creation Engine)
When the player starts a new game, the system halts the simulation and presents the Character Generation screen. This establishes the baseline `playerState` and acts as the game's difficulty selector.

**0.1 The Handle & Identity**
* **Handle:** The player inputs their street name (String). This is used by NPCs, Fixers, and Sysop logs throughout the game.

Before assigning stats, the player selects their "Genetic Baseline" (Power Level), which dictates how many Character Points they can distribute across their 9 primary attributes. The minimum score for any attribute is 2; the maximum is 10.

* **50 Points (Minor Hero):** A gritty, below-average street runner. Forces extreme stat specialization and relies heavily on luck and gear.
* **60 Points (Major Supporting Character):** The standard, reliable Night City professional.
* **70 Points (Major Hero):** A highly capable, veteran Edgerunner. (The TTRPG Standard).
* **75 Points (Legendary):** The absolute genetic elite; the top 1% of the street.

* **INT (Intelligence):** Critical. Determines software programming success, System Knowledge checks, and tracing evasion.
* **REF (Reflexes):** Critical. Determines Initiative on the Net and real-world combat evasion.
* **TECH (Technical Ability):** Determines physical deck repair and hardware modification.
* **COOL (Cool/Willpower):** Determines resistance to interrogation and stress/suppression in physical combat.
* **ATTR (Attractiveness):** Affects real-world interactions and Fixer negotiations.
* **LUCK:** A pool of points the player can expend during a run to boost critical die rolls. Refreshes each session/run.
* **MA (Movement Allowance):** Determines Meatspace movement speed.
* **BODY (Body Type):** Determines physical hit points (SDP/HP) and carrying capacity.
* **EMP (Empathy):** Starting humanity. Governs how much cyberware the player can install before risking cyberpsychosis.

**0.3 The Netrunner Skill Package**
The player defaults to the Netrunner Role. They receive **40 Skill Points** to distribute exclusively among their Career Package. No starting skill can exceed 10.
* **Interface (Special Ability):** The absolute most important skill. Added to INT to determine deck operation success.
* **Awareness/Notice:** Spotting physical threats while jacked in.
* **Basic Tech:** General electronic troubleshooting.
* **Education:** General knowledge and trivia.
* **System Knowledge:** Understanding Corporate network topologies and identifying ICE variants.
* **CyberTech:** Maintaining neural plugs and interface cyberware.
* **Cyberdeck Design:** Required for optimizing and physically upgrading deck hardware.
* **Composition:** For writing fake logs and social engineering.
* **Electronics:** Hardwiring physical Controller Nodes.
* **Programming:** Writing custom software and Daemons (Used in Expansion 19).

**0.4 Background & Starting Gear (The Difficulty Slider)**
*Developer Note: This overrides the standard CP2020 rules which dictate starting cash via the Interface skill level, acting as a structured video game difficulty selector.*

The player selects a Background Tier from 1 to 5. This permanently sets their starting `wealthTier` in the state engine, dictating their starting Eurobucks, Cyberdeck, and Safehouse.

* **Tier 1: Street Rat (Extreme Difficulty)**
    * *Wealth Tier Value:* 1
    * *Starting Funds:* 500 eb.
    * *Housing:* Homeless (Requires public Dataterms to jack in, extreme physical risk).
    * *Gear:* Fuchi Cyber-6 (Speed -1, MU 10, Data Walls +4). Bare-bones deck. Comes with *Decrypt* and a basic *Sword* program. 

* **Tier 2: Combat Zone Scrapper (Hard Difficulty)**
    * *Wealth Tier Value:* 2
    * *Starting Funds:* 1,500 eb.
    * *Housing:* Coffin/Cube (150 eb/month rent due immediately).
    * *Gear:* Standard Cybermodem (Speed 0, MU 10). Comes with *Decrypt*, *Sword*, and *Shield*. 

* **Tier 3: Established Edgerunner (Normal Difficulty)**
    * *Wealth Tier Value:* 3
    * *Starting Funds:* 3,000 eb.
    * *Housing:* Studio Apartment (200 eb/month).
    * *Gear:* Zetatech Paraline 5750 (Speed +1, MU 10, Data Walls +4). Good array of basic utilities, *Armor*, and standard Anti-Program ICE.

* **Tier 4: Corporate Asset (Easy Difficulty)**
    * *Wealth Tier Value:* 4
    * *Starting Funds:* 7,000 eb.
    * *Housing:* High-End Apartment (500 eb/month, secure landline).
    * *Gear:* EBM P.C. 2020 (Speed +1, MU 15, Data Walls +2). Includes advanced stealth software (*Invisibility*) and Anti-Personnel programs (*Brainwipe*).

* **Tier 5: Trust-Fund Elite (Very Easy / Sandbox)**
    * *Wealth Tier Value:* 5
    * *Starting Funds:* 15,000 eb.
    * *Housing:* Corporate Penthouse (1,000 eb/month, absolute physical security, Trace evasion bonuses).
    * *Gear:* Raven Microcybernetics Deck (Speed +2, MU 15). Pre-loaded with custom Daemons, a full suite of Black ICE counters, and enough raw funds to immediately purchase body modifications or an FBC chassis.

    ### Expansion 23: Deck Hardware Tuning (Overclocking)
Edgerunners with high Technical ability can rip open their deck's casing in the Safehouse to solder in aftermarket parts, pushing the motherboard past its factory limits.

**23.1 The Tuning Constraints (System Logic)**
* **Tuning Capacity:** Every cyberdeck has a hidden `tuningLimit` state (typically 2 or 3 max successful upgrades). A cheap Fuchi deck cannot physically support as many aftermarket solders as a high-end Raven Microcybernetics deck. 
* **Parts Cost:** The player isn't buying a finished product, but they still need to buy the raw silicon and flux. Attempting a tune costs Eurobucks upfront (e.g., 1000eb for Speed parts, 500eb for MU chips) regardless of whether the roll succeeds or fails.

**23.2 The Tuning Roll**
When the player initiates a tune in the Safehouse UI, the game executes a skill check: `1D10 + TECH + Cyberdeck Design`.
* **Overclock Speed:** Target Difficulty is 20. Success permanently adds `+1` to the deck's `Speed` stat.
* **Expand MU:** Target Difficulty is 25. Success permanently adds `+2` to the deck's `maxMu` stat.
* **Hardwire Defense:** Target Difficulty is 22. Success permanently adds `+1` to the deck's `Data Walls`.

**23.3 The Fumble Table (The "Brick" Risk)**
To perfectly mimic the *Cyberpunk 2020* TTRPG engine, rolling a natural `1` on the initial D10 is an automatic **Fumble**. If a Fumble occurs, the system automatically rolls a second 1D10 to determine the severity of the catastrophic failure on the Tech Fumble Table:

* **Roll 1-4 (Scorched Traces):** The solder bridges. The upgrade fails, the Eurobucks (parts) are wasted, but the deck survives. 
* **Roll 5-7 (Blown Capacitors):** The power surge damages the board. The upgrade fails, and the deck instantly takes `40%` damage to its `deckHealth`. The player must use the `[ REPAIR DECK ]` panel before they can safely Netrun again.
* **Roll 8-9 (Motherboard Warp):** A critical circuit is fried. The upgrade fails, and the deck *permanently* loses `-1 maxMu`. 
* **Roll 10 (Total Brick):** The motherboard melts into slag. The deck is permanently destroyed (`deckHealth` to 0, unrepairable). The player's `deckModel` is set to `null`, and they are forced to buy a new one from the Afterlife BBS. 

**23.4 Architecture & State Integration**
* **Store Updates:** Add `tuningCount` and `tuningLimit` to `cyberdeckStore.js`. 
* **UI Integration:** Add a `[ HARDWARE TUNING ]` button to the Safehouse phase, opening a `TuningPanel` modal. The UI must clearly display the player's current `TECH + Cyberdeck Design` total and the explicit % chance of success and % chance of fumbling before they commit the Eurobucks.