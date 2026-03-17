# Authoring Guide

This guide explains how to add new content to the current engine without having to reverse-engineer existing rooms.

The short version is:

- engine code owns parsing, turn flow, saves, disambiguation, scheduling, and generic state helpers;
- game code owns rooms, items, objects, dialogue, flags, events, map layout, and parser aliases for the specific story.

If you are adding new content, most work belongs under `js/game/`.

## Where Content Lives

The current content entry points are:

- `js/game/manifest.js`: assembles the game's rooms, inventory, parser options, events, map, UI panel labels, and initial flags.
- `js/game/rooms/`: one module per room.
- `js/game/items/`: reusable item factories.
- `js/game/events.js`: global story events.
- `js/game/rules/verbs.js`: parser aliases and global item-action verbs.
- `js/game/mapLayout.js`: authored map coordinates.
- `js/game/meta game/messages.js`: meta-story message content and scheduling.

The reusable engine pieces you will author against are:

- `js/engine/models/room.js`: room schema.
- `js/engine/models/item.js`: item schema.
- `js/engine/authoring/conversation.js`: reusable topic responder helper.
- `js/engine/authoring/triggers.js`: reusable room trigger behavior.
- `js/engine/world/worldState.js`: available context helpers and supported event action types.

## Authoring Workflow

When adding a new feature, follow this order:

1. Add any new flags the feature needs in `js/game/manifest.js`.
2. Add reusable items in `js/game/items/` if the room should not inline them.
3. Add or update the room module in `js/game/rooms/`.
4. Add a global event in `js/game/events.js` if the effect crosses room boundaries or should be reusable.
5. Add parser aliases in `js/game/rules/verbs.js` only if a new phrasing should be globally supported.
6. Add a map coordinate in `js/game/mapLayout.js` for any new room.
7. Wire the room into `js/game/manifest.js`.
8. Add tests under `tests/unit/` or `tests/smoke/`.

## The Manifest

`createGameManifest()` is the single place that assembles game content.

It currently provides:

- `id`: stable save identifier.
- `title`: display title.
- `startingRoomId`: first room.
- `startingInventory`: item instances available at game start.
- `parserOptions`: verb aliases and preposition-object verbs.
- `verbs`: global custom verb handlers.
- `metaGame`: meta-story messages and schedules.
- `events`: global event definitions.
- `map`: authored map coordinates.
- `ui`: panel metadata.
- `flags`: initial story state.
- `rooms`: room instances keyed by room id.

If a room or event is not connected through the manifest, the engine cannot see it.

## Rooms

Rooms are created with the `Room` class from `js/engine/models/room.js`.

Supported room fields:

- `id`: stable room id.
- `title`: display title.
- `description`: string or function.
- `exits`: direction-to-room-id map.
- `exitGuards`: optional direction guards that return a blocking string or `null`.
- `items`: array of `Item` instances.
- `objects`: non-portable scenery and NPC-like targets.
- `verbs`: room-specific verb handlers.
- `onEnter`: legacy-compatible enter hooks.
- `onLook`: legacy-compatible look hooks.
- `triggers`: named trigger lists.
- `conditionalDescriptions`: extra text blocks controlled by state.

Minimal example:

```js
import { Room } from '../../engine/models/room.js';

export function createAntechamberRoom() {
  return new Room({
    id: 'antechamber',
    title: 'Antechamber',
    description: 'A small antechamber with a locked bronze door and a bell rope.',
    exits: {
      south: 'foyer',
    },
    objects: {
      door: 'A bronze door with a listening slit and no visible knob.',
    },
  });
}
```

### Dynamic descriptions

`description` can be a function if the room text should react to state:

```js
description: ({ getFlag }) => getFlag('doorUnlocked')
  ? 'The antechamber feels less trapped now that the bronze door stands ajar.'
  : 'The antechamber feels like a waiting room for bad news.'
```

### Conditional descriptions

Use `conditionalDescriptions` when the base description should stay stable and only extra observations change:

```js
conditionalDescriptions: [
  {
    when: ({ getFlag }) => getFlag('bellAnswered'),
    text: 'From beyond the bronze door comes the sound of something heavy being unlatched.',
  },
],
```

### Exit guards

Use `exitGuards` for directional gating:

```js
exitGuards: {
  north({ getFlag }) {
    if (getFlag('doorUnlocked')) {
      return null;
    }

    return 'The bronze door does not open for you.';
  },
},
```

## Items

Items are created with `Item` from `js/engine/models/item.js`.

Supported item fields:

- `id`: stable save identifier.
- `name`: display name.
- `aliases`: alternate nouns used by the parser.
- `description`: base description.
- `actions`: verb handlers or fixed strings.
- `portable`: defaults to `true`.
- `stateDescription`: extra room text shown while the item remains visible.
- `uses`: optional remaining uses for depleting items.

Example:

```js
import { Item } from '../../engine/models/item.js';

export function createBellToken() {
  return new Item({
    id: 'bell-token',
    name: 'bell token',
    aliases: ['token'],
    description: 'A brass token stamped with a bell and a mouth sewn shut.',
    actions: {
      read() {
        return 'The token reads: SERVICE ARRIVES FOR THOSE WHO WAIT CORRECTLY.';
      },
      smell() {
        return 'It smells faintly of lamp oil and velvet curtains.';
      },
    },
  });
}
```

### Item action context

Item actions receive the same engine context helpers as room verbs and events, plus item-specific properties when relevant.

Useful fields commonly present in item actions:

- `item`: the item being used.
- `command`: the parsed player command.
- `getFlag`, `setFlag`
- `emitEvent`, `triggerEvent`
- `scheduleEvent`, `cancelScheduledEvent`, `hasScheduledEvent`
- `print`

If `uses` is set, the engine will decrement it after `eat` and `use` actions and remove the item when it reaches zero.

## Objects And NPC Targets

`objects` are room-local interactive targets that are not inventory items. They are a good fit for scenery, doors, furniture, and speaking characters.

Object form:

```js
objects: {
  butler: {
    name: 'butler',
    aliases: ['servant', 'attendant'],
    description: 'The butler watches without blinking enough.',
    actions: {
      ask({ topic }) {
        return `The butler hears you ask about ${topic} and regrets it politely.`;
      },
      give({ item }) {
        return `The butler refuses the ${item.name}.`;
      },
      show({ item }) {
        return `The butler studies the ${item.name} and says nothing useful.`;
      },
      use({ item }) {
        return item?.id === 'service-key'
          ? 'The butler accepts the key as proof of rank.'
          : 'That exchange means nothing here.';
      },
    },
  },
},
```

Objects support the same action names that the engine routes for generic targets, including `look`, `ask`, `tell`, `give`, `show`, `use`, `open`, `close`, `push`, `pull`, `smell`, `taste`, `eat`, and any room-specific custom verb that chooses to inspect `command.directObject`.

## Conversations

For topic-based dialogue, use `createTopicResponder()` from `js/engine/authoring/conversation.js` instead of writing long `if` chains.

Example:

```js
import { createTopicResponder } from '../../engine/authoring/conversation.js';

const butlerAsk = createTopicResponder({
  rules: [
    {
      match: ['door', 'bronze door'],
      reply: '"The door opens when the house believes it has been answered," says the butler.',
    },
    {
      match: ['oshregaal', 'host'],
      effect: ({ setFlag }) => setFlag('hostMentioned', true),
      reply: 'The butler lowers his voice. "The host values patience in his guests."',
    },
  ],
  fallback: 'The butler offers the polished kind of non-answer that survives many employers.',
});
```

Responder options:

- `before(context)`: runs before rule matching.
- `rules`: ordered list of matchers.
- `fallback`: string or function if no rule matches.

Each rule may include:

- `match`: string or array of strings. Matching is substring-based against normalized topic text.
- `when(context)`: optional extra condition.
- `effect(context)`: optional state change before returning text.
- `reply` or `text`: string or function.

## Room Verbs

Use `verbs` for room-local interactions that are not naturally item-based or that need broad control over the whole room.

Example:

```js
verbs: {
  search({ command, getFlag, setFlag }) {
    const target = command.directObject;

    if (!target || target.includes('room') || target.includes('floor')) {
      if (!getFlag('antechamberSearched')) {
        setFlag('antechamberSearched', true);
        return 'You find drag marks leading from the bell rope to the bronze door.';
      }

      return 'The drag marks still point accusingly toward the door.';
    }

    return `You search the ${target} and learn only that the room resents curiosity.`;
  },
},
```

Prefer item actions or object actions when the interaction clearly belongs to a single target. Prefer room verbs when the interaction is room-wide, fuzzy, or search-like.

## Triggers

Room triggers handle enter/look hooks and named trigger groups.

You can still use `onEnter` and `onLook`, but `triggers` is the more general form.

Example:

```js
triggers: {
  enter: [
    {
      once: true,
      when: ({ getFlag }) => !getFlag('antechamberSeen'),
      run: ({ setFlag }) => {
        setFlag('antechamberSeen', true);
        return 'A hidden bell somewhere in the walls gives a single warning tap.';
      },
    },
  ],
  bellAnswered: [
    {
      once: true,
      text: 'From behind the bronze door comes the polite scrape of bolts being withdrawn.',
    },
  ],
},
```

Trigger entries may be:

- a string,
- a function,
- or an object with `when`, `run` or `text`, `once`, and optional `id`.

If `once: true` is set and no `id` is provided, the engine auto-generates one from room id and trigger position.

Use `emitRoomEvent('triggerName')` or `triggerRoomEvent(roomId, 'triggerName')` from context to run them manually.

## Global Events

Use global events for reusable story logic, especially when the result changes flags, exits, inventory, panels, or future timing.

Event definition shape:

```js
exampleEvent: {
  once: true,
  when: ({ getFlag }) => !getFlag('exampleDone'),
  actions: [
    {
      type: 'setFlag',
      flag: 'exampleDone',
      value: true,
    },
  ],
  text: 'The example event completes.',
},
```

Supported event action types currently include:

- `setFlag`
- `unlockExit`
- `unlockPanel`
- `lockPanel`
- `degradePanel`
- `clearPanelDegradation`
- `moveItem`
- `movePlayer`
- `print`
- `queueMetaMessages`
- `event`
- `scheduleEvent`
- `cancelScheduledEvent`
- `roomTrigger`

`text`, `value`, `roomId`, `direction`, `targetRoomId`, `panelId`, `mode`, `itemId`, `destination`, `messages`, `eventId`, `delayTurns`, `scheduleId`, and `data` can all be literal values or functions of the current context.

## Turn Scheduler And WAIT

The engine now has a persistent per-turn scheduler.

This is useful for:

- delayed NPC reactions,
- countdowns,
- letting WAIT matter,
- beats that should happen one or two turns after a clue or action.

### Scheduling from code

From any room verb, item action, object action, trigger, or event context:

```js
scheduleEvent('ringBell', {
  delayTurns: 2,
  scheduleId: 'antechamber-bell',
  data: {
    source: 'bell rope',
  },
});
```

The scheduled event will fire after two turn-consuming commands.

### Scheduling from event actions

```js
queueBell: {
  actions: [
    {
      type: 'scheduleEvent',
      eventId: 'ringBell',
      delayTurns: 2,
      scheduleId: 'antechamber-bell',
      data: {
        source: 'bell rope',
      },
    },
  ],
},
```

### Consuming scheduled data

When a scheduled event fires, its `data` object is exposed on context as `scheduledData`.

```js
ringBell: {
  text: ({ scheduledData }) => `The bell answers from beyond the door (${scheduledData.source}).`,
},
```

### Canceling scheduled events

```js
cancelScheduledEvent('antechamber-bell');
```

### Turn behavior

- `WAIT` now advances time like any other turn-consuming command.
- Non-turn commands like debug panel helpers do not advance the scheduler.
- Clarification prompts from disambiguation do not spend a turn.

## Parser Support And Verb Aliases

The parser is generic, but game-specific phrasing lives in `js/game/rules/verbs.js`.

That file currently does two jobs:

1. It defines global item-action verbs that should dispatch to `session.handleItemAction(...)`.
2. It defines parser aliases and preposition-object verb behavior.

Use it when you want global phrasing support like:

- `offer` -> `give`
- `present` -> `show`
- `tug` -> `pull`
- `sniff` -> `smell`

Add a new parser alias only if the wording should work across the game, not just in one room.

## Disambiguation Rules

The engine now asks for clarification when multiple visible targets share a noun or alias.

Example:

- If a room contains both a `brass key` and a `bone key`, `take key` will prompt the player instead of guessing.
- The player can reply with a number or a more specific noun.

Authoring consequences:

- unique names are still better than collisions;
- broad aliases like `key`, `door`, and `book` are fine when the scene genuinely needs them;
- if two objects share an alias, expect the engine to ask which one the player means.

## Map Layout

If you add a room, add it to `js/game/mapLayout.js` so the map panel can render it in a useful place.

Example:

```js
antechamber: { x: 2, y: 0, region: 'public' },
```

The current map metadata supports:

- `x`
- `y`
- `region`
- optional token inference from the room title if no explicit token is supplied

## Context Helpers Available In Authored Code

Most authored functions receive a context assembled by `WorldState.createContext(...)`.

The most useful helpers are:

- `command`
- `currentRoom`
- `inventory`
- `turns`
- `visitCount`
- `isFirstVisit`
- `getFlag(name)`
- `setFlag(name, value)`
- `movePlayer(roomId)`
- `moveItem(itemId, destination)`
- `unlockExit(roomId, direction, targetRoomId)`
- `unlockPanel(panelId)`
- `degradePanel(panelId, mode)`
- `hasTriggeredEvent(id)`
- `markTriggeredEvent(id)`
- `triggerRoomEvent(roomId, triggerName, eventContext)`
- `emitRoomEvent(triggerName, eventContext)`
- `triggerEvent(eventId, eventContext)`
- `emitEvent(eventId, eventContext)`
- `hasRunEvent(eventId)`
- `scheduleEvent(eventId, options)`
- `cancelScheduledEvent(scheduleId)`
- `hasScheduledEvent(scheduleId)`
- `print(text)`

Depending on the call site, you may also receive:

- `item`
- `target`
- `topic`
- `shownItem`
- `indirectTarget`
- `scheduledData`

## Testing New Content

Use tests whenever you add content with state changes, gating, or custom verbs.

Current test entry points:

- `npm test`
- `npm run test:unit`
- `npm run test:smoke`

Patterns already used in the repo:

- unit tests for parser behavior,
- unit tests for room/event/trigger logic,
- smoke tests for full-player command flows.

The helpers in `tests/helpers/testSession.js` are the easiest place to start for content-level tests.

## Recommended Content Rules

- Give every important room at least one obvious observation target.
- Prefer explicit flags over hidden implicit state.
- Use global events when a consequence should stay reusable or cross room boundaries.
- Use room triggers for local scene beats.
- Use the scheduler for delayed consequences instead of hand-rolling turn counters in flags.
- Keep aliases player-friendly, but be aware that duplicate aliases now trigger clarification.
- Add map coordinates when adding rooms, or the map panel will fall back to less intentional inference.

## Common Mistakes

- Forgetting to wire a new room into `manifest.js`.
- Adding a room but forgetting its `mapLayout.js` entry.
- Hard-coding a one-off parser hack in a room when an item action or alias would solve it cleanly.
- Using room verbs for everything instead of letting items and objects own their specific interactions.
- Encoding future-turn behavior in flags only, when the scheduler is a better fit.
- Reusing the same broad alias across many targets without expecting disambiguation prompts.

## Suggested Starting Point

If you are new to this codebase, the best order to study is:

1. `js/game/manifest.js`
2. `js/game/rooms/foyer.js`
3. `js/game/items/invitation.js`
4. `js/game/events.js`
5. `js/game/rules/verbs.js`
6. `tests/unit/authoringFramework.test.js`

That path shows the current engine/content contract more clearly than starting from low-level engine files.