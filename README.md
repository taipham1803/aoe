# Angry Flare (AOE) – Community Project

## Overview

**Angry Flare** is a lightweight, browser‑based strategy game built with TypeScript and Vite. The goal is to provide a fun, extensible playground where contributors can add new units, buildings, resources, and gameplay mechanics.

## Project Plan & Targets

- **Core Gameplay**: Implement a map system, basic unit actions (move, attack, gather), and a simple AI for enemy units.
- **Extensibility**: Provide clear class hierarchies (`Animal`, `Building`, `Unit`, `Resource`, `Villager`) so contributors can easily add new types.
- **Community Contributions**: Encourage pull‑requests that add new animal species, building types, or visual polish.
- **Documentation**: Keep the code well‑commented and maintain this README as the single source of truth for contributors.

## How to Play

1. Open `index.html` (or run `npm run dev` and visit `http://localhost:5173`).
2. Use the mouse to select a unit or building.
3. Right‑click on the map to move units or interact with objects.
4. Gather resources, construct buildings, and train units to expand your settlement.
5. The game is currently in **alpha** – expect bugs and missing features.

## Getting Started (Development)

```bash
# Clone the repository
git clone https://github.com/taipham1803/aoe.git
cd aoe

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open the URL printed by Vite (usually `http://localhost:5173`).

## Contributing

- Fork the repo and create a feature branch.
- Follow the existing code style (TypeScript, ESLint, Prettier).
- Add or update unit tests where applicable.
- Submit a Pull Request with a clear description of the changes.

## License

This project is licensed under the MIT License – feel free to use, modify, and share.

---

_Created by the community, for the community._
