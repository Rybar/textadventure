# Text Adventure Engine Roadmap

## Purpose

This repository already has the beginnings of a strong presentation layer for a retro text adventure: a monospaced text grid, animated text rendering, scroll effects, ephemeral messages, a simple room/item model, and a minimal command loop. The next step is to turn it from a prototype into a reusable engine that can host different games without rewriting the renderer or UI.

This roadmap is aimed at two goals:

1. Build a larger, more fully featured Infocom-style game.
2. Keep game content separate from engine code so another author could create a different game on top of the same animated text-adventure engine.

## Current State

### What already exists

- A browser-based terminal presentation using a text grid.
- Animated text effects and simple screen-space effects.
- A room model with items and exits.
- A basic command input field with command history.
- Room content already lives in separate room modules.

### Current constraints

- Command handling is hard-coded into `GameState.handleCommand`.
- Room wiring currently happens in `game.js` rather than inside a world definition.
- Content is represented as executable JavaScript objects, which is flexible but keeps content and engine behavior partially mixed.
- The UI is still a prototype layout rather than a deliberate retro interface.
- There is no map system, no save/load, no event scripting model, and no generalized parser.

## Target Vision

The finished project should look like an old computer terminal or late-1980s adventure interface while remaining modular under the hood.

The engine should be responsible for:

- Rendering text and ASCII art.
- Managing screen layout and animation.
- Parsing user commands into structured intents.
- Tracking world state, inventory, flags, and progression.
- Executing actions and game scripts.
- Saving and loading game state.

The game content package should be responsible for:

- Rooms, regions, and map layout.
- Items, scenery, NPCs, and descriptions.
- Synonyms, custom verbs, and puzzle rules.
- ASCII art and area maps.
- Story text, flavor text, scripted events, and win/lose conditions.

## Recommended Architecture

## 1. Split Engine From Game Data

Move toward two top-level domains:

- `js/engine/`: reusable engine systems.
- `js/game/`: one specific game's content.

Suggested structure:

```text
js/
  engine/
    app/
      bootstrap.js
      gameLoop.js
    parser/
      lexer.js
      parser.js
      grammar.js
      normalizer.js
    world/
      gameSession.js
      worldState.js
      actionResolver.js
      eventBus.js
      saveLoad.js
    render/
      screen.js
      layout.js
      textGrid.js
      effects.js
      asciiRenderer.js
      widgets/
        statusPanel.js
        mapPanel.js
        transcriptPanel.js
        promptLine.js
  game/
    manifest.js
    world/
      rooms/
      items/
      npcs/
      regions/
      map.js
    content/
      text/
      ascii/
      scripts/
    rules/
      verbs.js
      puzzles.js
      triggers.js
```

The important boundary is this: engine modules should not know about `kitchen`, `livingRoom`, or any specific puzzle. They should only consume content definitions and state transitions.

## 2. Introduce a Content Schema

Define a stable data shape for content. Whether the content remains in JavaScript modules or later moves to JSON/YAML, it should follow engine-owned schemas.

Example room shape:

```js
export const kitchen = {
  id: 'kitchen',
  title: 'Kitchen',
  region: 'house',
  exits: {
    south: 'living-room'
  },
  shortDescription: 'A warm kitchen with fresh bread on the table.',
  longDescription: 'You are in a cozy kitchen. Cabinets line the walls... ',
  scenery: ['window', 'table'],
  items: ['bread'],
  asciiArt: 'kitchen.txt',
  mapPosition: { x: 4, y: 2 },
  onEnter: ['kitchen-entry'],
  ambientText: ['A floorboard creaks somewhere in the house.']
};
```

Example item shape:

```js
export const bread = {
  id: 'bread',
  nouns: ['bread', 'loaf'],
  adjectives: ['fresh', 'baked'],
  portable: true,
  uses: 3,
  description: 'A warm loaf of bread.',
  actions: {
    eat: {
      text: 'You tear off a piece and eat it.',
      decrementUses: true
    }
  }
};
```

Engine rule: content describes intent and data; engine code performs the mechanics.

## 3. Replace `GameState` With Focused Systems

The current `GameState` class is doing parsing, world logic, inventory handling, and room description. That is acceptable in a prototype, but it will become difficult to extend.

Split it into:

- `GameSession`: the top-level coordinator.
- `WorldState`: current room, inventory, flags, quest state, visited rooms, turn count.
- `CommandParser`: converts raw input into a structured command.
- `ActionResolver`: decides what a parsed command means in current context.
- `RuleExecutor`: performs state changes and generates responses.
- `DescriptionService`: assembles room descriptions, visible objects, and dynamic text.

This gives a clean pipeline:

```text
raw input -> normalize -> parse -> resolve -> execute -> render response
```

## 4. Build a Real Command Parser

The parser should be good enough to feel like an old adventure game, without trying to become full natural-language AI.

### Minimum parser capability

- Single-verb commands: `look`, `inventory`, `help`.
- Verb + object: `take bread`, `read book`.
- Verb + preposition + object: `look at window`, `put key in box`.
- Movement shortcuts: `n`, `s`, `e`, `w`, `u`, `d`.
- Synonyms: `x window` -> `look at window`, `get bread` -> `take bread`.
- Article stripping: ignore `the`, `a`, `an`.
- Basic typo tolerance for common direction and verb aliases.

### Later parser capability

- Two-object commands: `unlock door with brass key`.
- Dialogue: `ask caretaker about cellar`.
- Command chaining: `take lamp then go north`.
- Disambiguation prompts: `Which key do you mean, the brass key or the iron key?`

Recommended internal structure:

- Normalizer for lowercasing, whitespace cleanup, alias expansion.
- Tokenizer for words and prepositions.
- Grammar table for recognized verb forms.
- Resolver that uses current room, visible items, and inventory to identify targets.

## 5. Add an ASCII Map System

The map should do two different jobs:

- World-level navigation feedback.
- Room-level flavor through ASCII art.

### World map panel

Create a map box that the interface can reveal once the player gains access to it. It should not be assumed to exist from turn one. In this project, the map panel is part of the meta-fiction: it arrives as an unauthorized hack from the hacker personality and should feel useful, illicit, and slightly unstable.

When enabled, it should show:

- A simplified layout of discovered rooms.
- The current player location.
- Locked or unknown paths, if desired.
- Region labels for larger games.

This should be driven by room metadata such as `mapPosition`, `region`, `discovered`, and `connections`.

### Room illustration panel

Add optional ASCII art for each room or important scene:

- Wide room header art on first entry.
- Small persistent vignette in a side panel.
- Animated overlays for special moments like flickering fire, opening doors, or terminal glitches.

Content authors should be able to provide room art as plain text files, not code.

## 6. Design a Retro Interface Layout

The current UI is a centered grid plus a text input. A fuller retro interface should feel deliberate and information-dense.

Recommended layout once the full panel stack has been unlocked:

```text
+------------------------------------------------------------------------------+
| LOCATION: Kitchen                         TURNS: 018     SCORE: 005         |
+-------------------------------+----------------------------------------------+
| ASCII MAP                     | ROOM VIEW / TRANSCRIPT                       |
|                               |                                              |
|   [@] Kitchen                 | You are in a cozy kitchen.                   |
|    |                          | A loaf of bread rests on the table.          |
| Living Room                  |                                              |
|                               | > take bread                                 |
+-------------------------------+----------------------------------------------+
| INVENTORY: bread, brass key                                                 |
+------------------------------------------------------------------------------+
| >                                                                            |
+------------------------------------------------------------------------------+
```

The engine should support panels being hidden, unlocked, or degraded by story state rather than assuming a fixed layout from boot.

Interface components:

- Header bar: location, score, turn count, status effects.
- Transcript panel: the main scrolling narrative area.
- Map panel: discovered rooms and player location once the hacker exposes the map hack.
- Inventory panel or strip: quick inventory summary once the hacker exposes the inventory hack.
- Memory panel: a later-game panel that lists pseudo-memory addresses, fragments, or slots that the player can learn to manipulate through systemic play.
- Prompt line: always visible input prompt.

Presentation details:

- Keep the amber-on-black or phosphor-green palette.
- Add boxed line-drawing characters for windows and panels.
- Use subtle animation, not constant motion everywhere.
- Reserve heavier glitch/scramble effects for special events.
- Treat newly unlocked panels as events. Their arrival should include brief redraws, glitches, or shell-noise so the UI itself communicates that something unauthorized has been attached.

## 7. Support Dynamic World Rules

To scale beyond static room descriptions, introduce a trigger and flag system.

Core concepts:

- Boolean flags: `windowOpen`, `fireplaceLit`, `cellarUnlocked`.
- Counters: turn count, timed events, consumable uses.
- Triggers: fire when entering a room, inspecting an object, using an item, or reaching a condition.
- Conditional text: description variants based on state.

Example uses:

- First-time room descriptions vs revisits.
- A sound heard only after the third turn.
- An NPC moving between rooms.
- A hidden exit appearing once a puzzle is solved.

This is the point where a real game becomes possible rather than just a walkable demo.

## 8. Create an Extensible Action System

Avoid hard-coding special verbs in one switch statement.

Instead, define:

- Global verbs implemented by the engine: `look`, `go`, `take`, `drop`, `inventory`, `help`, `save`, `load`, `map`.
- Content-defined verbs registered by the game: `pray`, `tune`, `translate`, `light`, `listen`.
- Object-level affordances that declare what actions are supported.

Some engine verbs can exist before their supporting panel is visible, but the UI should be able to gate or reinterpret them. In this project, `map` and quick-inventory affordances should become richer once the hacker's panel hacks are unlocked.

Action resolution order:

1. Global engine verbs.
2. Contextual room verbs.
3. Item or NPC verbs.
4. Fallback parser help or clarification.

This allows one game to add verbs like `cast`, `chant`, or `hack` without touching the renderer or core parser.

## 9. Save/Load and Transcript Features

For a real adventure game, persistence matters.

Implement:

- Save slots in `localStorage` first.
- Serializable world state with versioning.
- Command transcript history.
- Optional replay mode from a command log.

The save format should only contain data state, not executable functions. That requirement reinforces the engine/content separation.

## 10. Content Authoring Workflow

If this is meant to become an engine, authors need a predictable workflow.

Recommended authoring principles:

- Rooms, items, and NPCs should be declared in content files.
- ASCII art should live in separate plain-text files.
- Puzzle logic should be described declaratively where possible.
- Custom scripted moments should use a small engine API rather than direct DOM access.

Useful engine-facing content APIs:

- `setFlag(name, value)`
- `getFlag(name)`
- `movePlayer(roomId)`
- `moveItem(itemId, destination)`
- `print(text)`
- `playEffect(name)`
- `unlockExit(roomId, direction)`
- `unlockPanel(panelId)`
- `degradePanel(panelId, mode)`

Keep these APIs narrow. The more content reaches into engine internals, the less reusable the engine becomes.

## 11. Suggested Development Phases

## Phase 1: Stabilize the Prototype

Goal: make the current code easier to extend without changing the game's feel.

Deliverables:

- Rename `js/core` to `js/engine` or equivalent.
- Move room connection data into world content modules.
- Fix current model inconsistencies such as alias handling in `Item`.
- Separate command parsing from state mutation.
- Introduce a transcript abstraction so output is not written directly from game rules.

Success criteria:

- Existing kitchen/living room demo still works.
- Engine can boot from a content manifest rather than hand-wired imports.

## Phase 2: Build the Parser and Data Model

Goal: support a broader set of commands and cleaner content definitions.

Deliverables:

- Structured command object model.
- Verb synonym table.
- Noun and alias resolution.
- Room/item/NPC schema.
- World flags and trigger system.

Success criteria:

- Commands like `x window`, `look at fireplace`, `take book`, `go north`, and `light fireplace` resolve through the same parser pipeline.

## Phase 3: Create the Retro Interface

Goal: make the game feel like a complete interactive terminal product.

Deliverables:

- Multi-panel UI layout with runtime enable/disable support.
- Dedicated transcript viewport.
- Status header.
- Story-gated inventory and map panels.
- A memory panel shell for later pseudo-memory interactions.
- Configurable color themes.

Success criteria:

- UI remains readable on common desktop and laptop viewport sizes.
- Content authors can decide which panels are enabled and when they unlock.
- The game can begin with only the core transcript interface and add panels later without layout breakage.

## Phase 4: Add ASCII Graphics and Map Rendering

Goal: enrich navigation and atmosphere.

Deliverables:

- Room art loading system.
- Small ASCII animation hooks.
- World map renderer with discovery state.
- Room coordinate metadata and connection graph.

Success criteria:

- Moving between rooms updates the map and can optionally refresh room art.

## Phase 5: Build One Real Vertical Slice

Goal: prove the engine with an actual playable chunk.

Deliverables:

- 8 to 12 interconnected rooms.
- At least 3 multi-step puzzles.
- One locked progression gate.
- One timed or stateful event.
- Save/load support.

Success criteria:

- A player can start, explore, solve a short sequence, and reach a clear milestone without touching dev tools.

## Phase 6: Expand Into a Full Game Package

Goal: turn the vertical slice into a larger authored adventure.

Deliverables:

- Regions with distinct identities.
- NPCs and conversations.
- Multiple puzzle chains.
- End-state logic, score, and secrets.
- Authoring documentation for making another game on the engine.

Success criteria:

- A second small content pack can be created with minimal or no engine changes.

## 12. Technical Priorities in Practical Order

If work needs to be sequenced tightly, this is the order with the best payoff:

1. Separate engine bootstrap from world content.
2. Introduce parser, resolver, and structured command objects.
3. Add world flags, triggers, and description composition.
4. Redesign the screen into a panel-based retro UI.
5. Add map metadata and map rendering.
6. Add ASCII room art loading.
7. Add save/load.
8. Build a vertical slice before adding more engine complexity.

## 13. Risks to Avoid

- Do not let room content depend directly on DOM or `TextGrid` methods.
- Do not store critical game logic as anonymous inline functions everywhere; it will become difficult to save, test, and reuse.
- Do not build parser complexity faster than content needs justify.
- Do not make the interface animation-heavy enough to slow down reading.
- Do not hard-code map layout into the renderer; keep it in content metadata.

## 14. Definition of Done for the Engine

This project can be considered a reusable animated text adventure engine when all of the following are true:

- A new game can be created by replacing content files, not engine files.
- Rooms, items, ASCII art, and rules live in content packages with stable schemas.
- The parser resolves common adventure-game commands with synonyms and disambiguation.
- The UI supports transcript, prompt, and status regions at baseline plus unlockable map, inventory, and memory regions.
- State can be saved and restored.
- At least one complete playable game exists on top of the engine.

## 15. Recommended Immediate Next Steps

The most useful next implementation steps for this repository are:

1. Refactor `GameState` into parser plus world-state responsibilities.
2. Move room definitions and exits into a dedicated game manifest.
3. Introduce room metadata for map coordinates and optional ASCII art.
4. Replace the single-screen layout with a panel system that can unlock transcript-adjacent map, inventory, and memory panels over time.
5. Build a small vertical slice before attempting a large content expansion.

That sequence keeps momentum high while forcing the architecture to become reusable early, before too much game-specific logic accumulates in the engine.