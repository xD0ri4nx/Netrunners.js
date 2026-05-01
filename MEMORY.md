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