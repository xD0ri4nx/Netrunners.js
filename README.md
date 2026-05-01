# Netrunner.js

A single-player cyberpunk browser game with no backend. Jack into the Net, run missions, fight ICE, and upgrade your cyberdeck — all from your browser.

**Play now:** [https://anomalyco.github.io/Netrunners.js/](https://anomalyco.github.io/Netrunners.js/)

## Tech Stack

- **React 19** — UI
- **Vite 8** — Build tool with HMR
- **XState 5** — Game phase state machine (`safehouse → navigator → jacking_in → net`)
- **Zustand 5** — State management with `persist` middleware (saves to `localStorage`)
- **Miniplex 2** — ECS (Entity Component System) for the Net grid
- **Tailwind CSS 4** — Styling via `@tailwindcss/vite`
- **React Three Fiber / Three.js** — 3D rendering
- **GitHub Pages** — Deployment via `gh-pages`

## Features

- **Turn-based roguelike gameplay** — 15×15 grid where you move, interact, and fight ICE enemies
- **Persistent state** — Your cyberdeck, meatspace stats, and missions survive page reloads
- **Mission system** — Select targets from the LDL database and jack in
- **Shop & upgrades** — Buy gear and upgrades at the safehouse
- **Web Audio SFX** — Oscillator-based sound effects

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:5173/Netrunners.js/` to play.

## Scripts

| Command | Effect |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Production build → `dist/` |
| `npm run lint` | ESLint (flat config) |
| `npm run preview` | Preview production build locally |
| `npm run deploy` | Build and push `dist/` to `gh-pages` |

## Architecture

```
src/
  components/    UI views (TheNet = grid gameplay, WorldMap = navigator)
  data/          Static game data (LDL target database)
  ecs/           Miniplex ECS world definition
  machine/       XState state machines
  store/         Zustand stores (terminal, cyberdeck, meatspace, mission, routing)
  utils/         SFX (Web Audio API)
```

- **`src/App.jsx`** — Root component owning the XState game phase machine
- **`src/machine/gamePhaseMachine.js`** — States: `safehouse` (hub) → `navigator` → `jacking_in` → `net` (gameplay), with side branches: `shop`, `jobs`, `raid`
- **`src/ecs/world.js`** — Miniplex ECS world; cleared on each Net entry
- **`src/components/TheNet.jsx`** — Main gameplay: 15×15 turn-based roguelike grid
- **`src/components/WorldMap.jsx`** — Navigator UI for selecting targets
- **`src/data/ldlDatabase.js`** — Target database for missions

## Notes

- No test framework is configured. No TypeScript — this is plain JS/JSX.
- Vite `base` is set to `'/Netrunners.js/'` for GitHub Pages. Do not change it or the deploy will break.
- State access: use `useXStore.getState()` in event handlers to avoid stale closures; use `useXStore()` hooks inside render.
