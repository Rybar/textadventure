# Engine Content Interface

This file exists so story decisions and engine decisions do not drift apart.

## Current Architectural Assumption

The project is moving toward reusable engine code plus game-specific content modules.

- engine owns parsing, state transitions, transcript flow, saves, and generic interaction contracts;
- game content owns room definitions, items, NPC behavior, custom verbs, story flags, and meta schedules.

## Content Primitives The Game Needs

Every major authored element should fit one of these primitives.

### Room

- `id`
- `title`
- `description`
- exits and exit guards
- items
- objects or scenery
- custom verbs
- on-enter behavior if needed

### Item

- `id` or stable name
- aliases
- description
- portable or fixed
- actions such as `read`, `drink`, `wear`, `listen`, `sit`, `shake`, `give`
- optional uses, depletion, or state text

### Character / Talk target

- display name and aliases
- base description
- dialogue handlers by topic or state
- give-reaction handlers
- suspicion, friendliness, or obligation state

### Clue / document

- short text for ordinary inspection
- expanded text for `read`
- optional flag unlocks when understood

### Meta event

- message text
- source identity
- display placement
- trigger conditions
- one clear dramatic purpose

### Meta interface unlock

- panel id such as `map`, `inventory`, or `memory`
- source identity such as `hacker` or `operators`
- unlock conditions
- presentation behavior on unlock
- optional degradation or revocation conditions

## Parser Verbs That Matter For This Game

The current prototype already supports a useful subset. The full adaptation should prioritize the verbs below.

### Essential base verbs

- `look`
- `go`
- `take`
- `drop`
- `inventory`
- `help`
- `save`
- `load`

### Social verbs

- `ask`
- `tell`
- `give`
- `show`
- `greet`
- `apologize`
- `lie` or authored equivalents via topics and responses

### Object verbs

- `read`
- `drink`
- `wear`
- `listen`
- `sit`
- `sleep`
- `shake`
- `open`
- `close`
- `move`
- `push`
- `pull`
- `light`
- `eat`
- `use`

### Search verbs to consider

- `search`
- `inspect`
- `smell`
- `taste`

Not every one needs engine-level special treatment. Some can be aliases or room/item-authored handlers.

## State Flags Worth Tracking

The current manifest already uses story flags. Preserve that direction.

Recommended flag families:

### Admission and social state

- invitation read
- foyer admitted
- met oshregaal
- insulted oshregaal
- agreed to stay
- refused wine
- gave blood

### Household relationships

- imp help offered
- kelago met
- kelago praised
- nathema bargained
- butlers suspicious
- wrongus interrupted

### Discovery state

- handshake hint known
- found teleport circle
- secret circle unlocked
- folded hallway understood
- bathroom route known
- plum found
- plum rescued

### Objective state

- grey grin taken
- black wind fruit taken
- tree damaged
- evidence collected
- spellbooks secured
- portal bypass learned
- nathema leverage category established
- plum nature understood

### Meta state

- first anomaly seen
- operator pattern noticed
- hacker contacted
- shell breach suspected
- upgrade tier granted
- inventory hack granted
- map hack granted
- memory panel exposed

## Room Implementation Rules

For maintainable content, each room should answer these questions explicitly.

- What is the first sentence trying to make the player feel?
- What objects are obvious enough to support `look` without guesswork?
- What information or leverage leaves this room with the player?
- What state change can happen here?
- Why might the player return?

## NPC Implementation Rules

For maintainable dialogue, each important NPC should define:

- what they want right now;
- what makes them helpful;
- what makes them dangerous;
- what topics they respond to;
- what actions change their stance;
- what they know that the player can extract.

## Secret Design Rules For The Engine

- A hard gate should usually have at least two clues.
- A hidden exit should have at least one early foreshadow and one late confirmation.
- If a puzzle depends on wording, the parser should tolerate common phrasings.
- If a puzzle depends on noticing an odd object, `look`, `examine`, and common preposition forms should all land.

## Test Cases Worth Preserving

### Story progression

- player can reach the foyer and be blocked without proper invitation logic;
- player can gain admission through the intended social route;
- oshregaal scene sets host-contact state;
- at least one hidden route can be unlocked through clues rather than brute force.
- Plum rescue remains the first robust route, but at least one library or deep-house clue branch should also point toward spellbooks or portal bypass.

### Parser coverage

- `look at`, `listen to`, `sit on`, `give x to y`, `ask x about y`, and `tell x about y` all resolve correctly;
- alias verbs cover likely player phrasing;
- important clue objects are discoverable without exact wording.

### Meta pacing

- no meta interruptions fire too early;
- milestone-specific messages wait for the relevant fiction beat;
- map and inventory hacks are absent at game start and unlock only after intended milestones;
- the memory panel appears later than the first utility hacks and remains clearly stranger than them;
- debug tooling can preview scheduled meta beats.

### Scheme coverage

- tests should verify that the mansion still reads as a multi-scheme space even when only one route is fully playable;
- evidence, spellbook, and portal-bypass clues should be representable as explicit state rather than buried only in prose;
- Nathema and Plum branches should expose different kinds of leverage, not the same branch with different text.

## Suggested Content Workflow

When adding a new room or story feature:

1. Add the room's identity, exits, and obvious objects.
2. Add at least one clue that points outward.
3. Add one stateful interaction with consequence.
4. Add at least one test for intended access or puzzle flow.
5. Decide whether the room deserves a meta beat, and if not, leave it alone.

## Agent Notes

When helping on this project, prefer tasks that improve both authored content and future engine reuse.

Good examples:

- adding richer topic-based dialogue in a reusable pattern;
- making hidden exits legible through data rather than hard-coded branching;
- representing clue state explicitly;
- separating room flavor text from progression logic;
- tying meta triggers to story milestones instead of raw turn count only.

Bad examples:

- adding one-off parser hacks for a single room when a reusable interaction model would solve it;
- revealing the meta-story through exposition dumps;
- treating every strange object as a combat obstacle or inventory pickup.
