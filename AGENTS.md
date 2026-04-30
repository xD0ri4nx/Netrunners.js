# AGENTS.md — Netrunner.js

## Project
Single-player cyberpunk browser game (no backend). React 19 + Vite 8, deployed to GitHub Pages via `gh-pages`.

## Developer Commands
| Command | Effect |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Production build → `dist/` |
| `npm run lint` | ESLint (flat config) |
| `npm run preview` | Preview production build locally |
| `npm run deploy` | Builds then pushes `dist/` to `gh-pages` branch |

**No test framework is configured.** No typecheck — this is plain JS/JSX (`"type": "module"`), not TypeScript.

## Architecture
- **`src/App.jsx`** — Root component. Owns the game phase state machine (XState) and renders all phase views. Also handles shop purchases and raid logic.
- **`src/machine/gamePhaseMachine.js`** — XState machine. States: `safehouse` (hub) → `navigator` → `jacking_in` → `net` (gameplay). Side branches: `shop`, `jobs`, `raid`.
- **`src/store/`** — Five Zustand stores. `cyberdeckStore`, `meatspaceStore`, and `missionStore` use `persist` middleware → state saved to `localStorage`. Access via `useXStore()` (reactive) or `useXStore.getState()` (imperative).
- **`src/ecs/world.js`** — Miniplex ECS world. All entities in the Net grid are stored here. `world.clear()` is called on each Net entry.
- **`src/components/TheNet.jsx`** — The main gameplay: a 15×15 turn-based roguelike grid. Click adjacent cells to move/interact. ICE (enemies) act after each player turn.
- **`src/components/WorldMap.jsx`** — Navigator UI for selecting targets before jacking in.
- **`src/data/ldlDatabase.js`** — Target database for missions.
- **`src/utils/sfx.js`** — Web Audio API oscillator-based sound effects. May be blocked by browser autoplay policy.

## Key Conventions
- **ESLint**: `no-unused-vars` ignores variables matching `^[A-Z_]` (useful for destructured-but-unused JSX vars).
- **Tailwind v4**: configured via `@tailwindcss/vite` plugin (not `tailwind.config.js`).
- **Vite `base`**: set to `'/Netrunners.js/'` for GitHub Pages. Do not remove or the deploy will break.
- **State access pattern**: inside event handlers use `useXStore.getState()` to avoid stale closures. Inside render use `useXStore()` hooks.

## Directory Ownership
```
src/
  components/    UI views (TheNet = grid gameplay, WorldMap = navigator)
  data/          Static game data (LDL target database)
  ecs/           Miniplex ECS world definition
  machine/       XState state machines
  store/         Zustand stores (terminal, cyberdeck, meatspace, mission, routing)
  utils/         SFX (Web Audio API)
```
