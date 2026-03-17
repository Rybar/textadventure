# Authoring Tutorial

This tutorial walks through adding a small, fully authored feature to the current engine.

The feature is intentionally modest so it demonstrates the whole content pipeline without becoming a full production branch:

- a new room,
- a reusable item,
- a speaking object,
- a room-local custom verb,
- a global event,
- a delayed scheduled consequence,
- a map entry,
- and a test.

The tutorial example is an `antechamber` attached to the foyer.

## What We Are Building

The player enters an antechamber with:

- a bell rope,
- a bronze door,
- a suspicious attendant,
- and a bell token.

If the player rings the bell rope, nothing happens immediately. One turn later, a delayed event fires and unlocks the bronze door.

This example is useful because it exercises the current engine in a realistic way:

- authored descriptions,
- topic dialogue,
- flag changes,
- global events,
- the turn scheduler,
- and WAIT.

## Step 1: Add New Flags

Open `js/game/manifest.js` and add the state you need.

For this tutorial, add:

```js
flags: {
  // existing flags...
  antechamberBellRung: false,
  antechamberDoorUnlocked: false,
  antechamberAttendantMet: false,
},
```

Rule of thumb:

- use flags for durable story state;
- use scheduled events for delayed timing;
- do not use raw turn numbers in content unless you really need exact turn math.

## Step 2: Add Any Reusable Items

Create `js/game/items/bellToken.js`.

```js
import { Item } from '../../engine/models/item.js';

export function createBellToken() {
  return new Item({
    id: 'bell-token',
    name: 'bell token',
    aliases: ['token'],
    description: 'A brass token stamped with a bell and a narrow slit like a listening mouth.',
    actions: {
      read() {
        return 'SERVICE ARRIVES FOR THOSE WHO WAIT CORRECTLY.';
      },
    },
  });
}

export default createBellToken;
```

Why a separate file?

- reusable items stay easier to test,
- they can move between rooms cleanly,
- and room modules stay focused on scene behavior.

## Step 3: Add The Room Module

Create `js/game/rooms/antechamber.js`.

Start with imports:

```js
import { createTopicResponder } from '../../engine/authoring/conversation.js';
import { Item } from '../../engine/models/item.js';
import { Room } from '../../engine/models/room.js';
import { createBellToken } from '../items/bellToken.js';
```

Now define the attendant's conversation logic:

```js
const attendantAsk = createTopicResponder({
  before: ({ setFlag }) => setFlag('antechamberAttendantMet', true),
  rules: [
    {
      match: ['door', 'bronze door'],
      reply: '"The bronze door opens after the house has time to consider you," says the attendant.',
    },
    {
      match: ['bell', 'rope'],
      reply: '"The rope is not for haste," the attendant says. "It is for sequence."',
    },
    {
      match: ['oshregaal', 'host'],
      reply: 'The attendant lowers his head. "The host prefers that guests arrive already interpreted."',
    },
  ],
  fallback: 'The attendant answers as though reciting policy from behind his own teeth.',
});
```

Now define the interactive room pieces:

```js
const bellRope = new Item({
  id: 'antechamber-bell-rope',
  name: 'bell rope',
  aliases: ['rope', 'bell'],
  portable: false,
  description: 'A black bell rope braided with thread that glints like wet hair.',
  actions: {
    look() {
      return 'The rope disappears into a brass guide-ring in the ceiling. It was installed to be pulled by hesitant people.';
    },
  },
});
```

Then build the room:

```js
export function createAntechamberRoom() {
  return new Room({
    id: 'antechamber',
    title: 'Antechamber',
    description: ({ getFlag }) => getFlag('antechamberDoorUnlocked')
      ? 'The antechamber is narrow, velvet-lined, and newly relieved by the bronze door standing open to the north.'
      : 'The antechamber is narrow, velvet-lined, and dominated by a bronze door that looks as though it expects credentials instead of hands.',
    exits: {
      south: 'foyer',
      north: 'servicePassage',
    },
    exitGuards: {
      north({ getFlag }) {
        if (getFlag('antechamberDoorUnlocked')) {
          return null;
        }

        return 'The bronze door remains shut, as though waiting for the house to approve you.';
      },
    },
    items: [bellRope, createBellToken()],
    objects: {
      attendant: {
        name: 'attendant',
        aliases: ['servant', 'usher'],
        description: 'A gaunt attendant in a coat too formal for comfort. He stands beside the wall as if storing himself there.',
        actions: {
          ask: attendantAsk,
          tell: 'The attendant hears you out with professional indifference.',
        },
      },
      door: {
        name: 'bronze door',
        aliases: ['door'],
        description: ({ getFlag }) => getFlag('antechamberDoorUnlocked')
          ? 'The bronze door now stands open just far enough to suggest you were admitted by procedure, not kindness.'
          : 'The bronze door has no visible knob, only a listening slit and a seam that seems to hold its breath.',
      },
    },
    verbs: {
      ring({ command, getFlag, setFlag, emitEvent, hasScheduledEvent }) {
        const target = command.directObject;

        if (target && !target.includes('rope') && !target.includes('bell')) {
          return `Ringing the ${target} would be optimistic.`;
        }

        if (getFlag('antechamberDoorUnlocked')) {
          return 'You tug the bell rope again, but the house has already answered once.';
        }

        if (hasScheduledEvent('antechamber-bell-answer')) {
          return 'You tug the bell rope again. Somewhere behind the walls, the first answer is apparently still on its way.';
        }

        setFlag('antechamberBellRung', true);
        return emitEvent('queueAntechamberBellAnswer');
      },
    },
    triggers: {
      enter: [
        {
          once: true,
          text: 'The attendant inclines his head by exactly the amount required to make you feel processed.',
        },
      ],
    },
    conditionalDescriptions: [
      {
        when: ({ getFlag }) => getFlag('antechamberBellRung') && !getFlag('antechamberDoorUnlocked'),
        text: 'The room seems to be listening for its own reply.',
      },
    ],
  });
}
```

This room demonstrates three important patterns:

- the `ring` interaction belongs in a room verb because the player might type `RING`, `RING BELL`, or `RING ROPE`;
- the attendant belongs in `objects` because it is not inventory but does need actions;
- the delayed consequence should be an event, not hard-coded turn math inside the room.

## Step 4: Add The Global Event And Scheduler Hook

Open `js/game/events.js` and add two events.

```js
queueAntechamberBellAnswer: {
  actions: [
    {
      type: 'scheduleEvent',
      eventId: 'unlockAntechamberDoor',
      delayTurns: 1,
      scheduleId: 'antechamber-bell-answer',
      data: {
        source: 'bell rope',
      },
    },
  ],
  text: 'You tug the bell rope. The sound vanishes upward, followed by the distinct feeling that the house has added you to a list.',
},

unlockAntechamberDoor: {
  once: true,
  actions: [
    {
      type: 'setFlag',
      flag: 'antechamberDoorUnlocked',
      value: true,
    },
  ],
  text: ({ scheduledData }) => `One turn later, bolts withdraw behind the bronze door. The delayed answer arrives by way of the ${scheduledData.source}.`,
},
```

Important details:

- `scheduleEvent` queues a future event by turn count;
- `scheduleId` lets you avoid duplicate timers or cancel them later;
- `scheduledData` travels into the later event so you can keep authored flavor tied to the source action.

Because the scheduler is now part of the engine, this event will survive save/load automatically.

## Step 5: Wire The Room Into The Manifest

Open `js/game/manifest.js`.

Add the import:

```js
import { createAntechamberRoom } from './rooms/antechamber.js';
```

Instantiate it:

```js
const antechamber = createAntechamberRoom();
```

Then include it in `rooms`:

```js
rooms: {
  cavern,
  fernGarden,
  grandStairs,
  foyer,
  sittingRoom,
  guestRoom,
  nathemaRoom,
  feastHall,
  kelagoRoom,
  kitchen,
  ogreBeds,
  secretCircle,
  antechamber,
},
```

Also remember to connect an exit from an existing room if the new room should be reachable. For example, adding `east: 'antechamber'` to the foyer.

## Step 6: Add Map Metadata

Open `js/game/mapLayout.js` and add:

```js
antechamber: { x: 1, y: 0, region: 'public' },
```

This keeps the map panel from inferring a less useful position.

## Step 7: Decide Whether Parser Aliases Need Work

For this feature, the existing parser is already enough because `ring` is already aliased to `pull` globally, and the custom room verb explicitly handles `ring`.

If you want extra phrasing to work everywhere, add it to `js/game/rules/verbs.js`.

Examples:

- add `summon` as an alias if it should always map to `ring` or `pull`;
- add a new preposition-object verb if players should type something like `KNEEL AT ALTAR` and have it normalize cleanly.

Do not add parser aliases for one-off flavor if a room verb or item action already solves the problem.

## Step 8: Add A Test

Add a unit or smoke test depending on scope.

For this tutorial, a unit-style content test is enough:

```js
test('antechamber bell answer unlocks the door after one turn', () => {
  const session = createTestSession();

  // move to the room however your layout requires
  session.start();
  session.submitCommand('north');
  session.submitCommand('north');
  session.submitCommand('east');

  const ringResponse = session.submitCommand('ring bell');
  assert.match(ringResponse, /added you to a list/i);
  assert.equal(session.worldState.getFlag('antechamberDoorUnlocked'), false);

  const waitResponse = session.submitCommand('wait');
  assert.match(waitResponse, /bolts withdraw/i);
  assert.equal(session.worldState.getFlag('antechamberDoorUnlocked'), true);
});
```

This verifies the most important part of the feature: the door unlocks on the later turn, not immediately.

## Step 9: Play It Manually

Once the code and tests are in place, try commands like:

- `LOOK`
- `LOOK AT BRONZE DOOR`
- `ASK ATTENDANT ABOUT DOOR`
- `READ TOKEN`
- `RING BELL`
- `WAIT`
- `NORTH`

If the feature feels too brittle, the problem is usually one of these:

- not enough aliases,
- the wrong interaction living in a room verb instead of an item/object,
- or story state hidden in prose instead of explicit flags.

## Choosing The Right Authoring Tool

When deciding where code belongs:

- use an `Item` when it can be carried or clearly behaves like a single manipulable object;
- use a room `object` when it is scenery, furniture, a door, or an NPC-like target;
- use a room `verb` when the interaction is broad, fuzzy, or room-level;
- use a global event when the consequence crosses room boundaries or should be reusable;
- use the scheduler when something should happen after future turns rather than immediately.

## Tutorial Recap

This one feature touched every major content seam in the current engine:

- manifest wiring,
- room authoring,
- items,
- object dialogue,
- room verbs,
- global events,
- the scheduler,
- map metadata,
- and tests.

Once this pattern feels comfortable, the next level up is to author a multi-room beat where clues in one room schedule or unlock consequences in another.