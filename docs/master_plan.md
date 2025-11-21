# Project AOE: Master Development Plan

## 1. Vision & Goal

The objective is to build a web-based Real-Time Strategy (RTS) game that faithfully recreates the core mechanics and "feel" of the classic _Age of Empires_. The game will feature resource management, base building, unit production, technological progression through ages, and combat.

**Important Rule**: All code, documentation, in-game labels, and UI text must be in **English**.

## 2. Technical Standards

- **Language**: TypeScript
- **Rendering**: HTML5 Canvas (2D Context) for performance with isometric or top-down view.
- **Architecture**: Component-based architecture or Entity-Component-System (ECS) to manage complex game state.
- **State Management**: Centralized game state for deterministic updates.

## 3. Roadmap & Versions

### Phase 1: The Foundation (v0.1)

**Goal**: Establish the game engine and basic interaction.

- [ ] **Game Loop**: Robust update/render loop.
- [ ] **Map System**: Tile-based map rendering (Grass, Trees, Water).
- [ ] **Camera**: Panning and zooming.
- [ ] **Unit Basics**: Render a Villager.
- [ ] **Interaction**: Select unit, move unit (Point-and-Click).
- [ ] **Pathfinding**: Basic A\* implementation for movement around obstacles.
- **Timeline**: Week 1

### Phase 2: The Economy (v0.2)

**Goal**: Implement the core loop of gathering resources.

- [ ] **Resources**: UI for Wood, Food, Gold, Stone.
- [ ] **Nature Objects**: Trees, Berry Bushes, Gold Mines, Stone Mines.
- [ ] **Gathering Logic**: Villagers can target resources, play animation, gain resource, return to base (Town Center).
- [ ] **Storage**: Resources update in global state upon deposit.
- **Timeline**: Week 2

### Phase 3: Civilization Building (v0.3)

**Goal**: Enable construction and population growth.

- [ ] **Buildings**: Town Center (initial), House, Barracks, Granary/Mill.
- [ ] **Construction**: Villagers can build structures. Construction progress bars.
- [ ] **Population Cap**: Houses increase pop cap.
- [ ] **Collision**: Buildings block movement.
- **Timeline**: Week 3

### Phase 4: Military & Combat (v0.4)

**Goal**: Introduce conflict.

- [ ] **Unit Production**: Train units from buildings (Villager from TC, Militia from Barracks).
- [ ] **Combat Stats**: HP, Attack, Armor, Range, Attack Speed.
- [ ] **Combat Logic**: Attack move, auto-attack, chasing.
- [ ] **Death**: Unit/Building destruction and removal.
- **Timeline**: Week 4

### Phase 5: Ages & Technology (v0.5)

**Goal**: Progression system.

- [ ] **Ages**: Dark Age -> Feudal Age -> Castle Age -> Imperial Age.
- [ ] **Tech Tree**: Research technologies to improve stats or unlock units.
- [ ] **Visual Evolution**: Buildings change appearance by age.
- **Timeline**: Week 5

### Phase 6: Polish & AI (v1.0)

**Goal**: Playable Game.

- [ ] **Fog of War**: Exploration mechanics.
- [ ] **Minimap**: Navigation aid.
- [ ] **Simple AI**: Enemy that gathers and attacks.
- [ ] **UI/UX**: Start screen, HUD polish, Sound effects.
- **Timeline**: Week 6

## 4. Development Process

- **Iterative**: Complete one version fully before moving to the next.
- **Documentation**: Keep `docs/` updated with API changes and architectural decisions.
- **Testing**: Manual playtesting after every feature addition.
