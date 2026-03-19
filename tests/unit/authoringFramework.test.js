import test from 'node:test';
import assert from 'node:assert/strict';

import { createTopicResponder } from '../../js/engine/authoring/conversation.js';
import { Item } from '../../js/engine/models/item.js';
import { Room } from '../../js/engine/models/room.js';
import { GameSession } from '../../js/engine/world/gameSession.js';
import { WorldState } from '../../js/engine/world/worldState.js';

function createAuthoringManifest() {
  return {
    id: 'authoring-framework-test',
    startingRoomId: 'start',
    events: {
      revealGate: {
        once: true,
        actions: [
          {
            type: 'setFlag',
            flag: 'eventRaised',
            value: true,
          },
        ],
        text: 'The gate is revealed.',
      },
      queueBell: {
        actions: [
          {
            type: 'scheduleEvent',
            eventId: 'ringBell',
            delayTurns: 2,
            scheduleId: 'bell-sequence',
            data: {
              source: 'rope',
            },
          },
        ],
        text: 'You set the bell sequence in motion.',
      },
      ringBell: {
        actions: [
          {
            type: 'setFlag',
            flag: 'bellRang',
            value: true,
          },
        ],
        text: ({ scheduledData }) => `The bell finally answers from above (${scheduledData.source}).`,
      },
    },
    flags: {
      eventRaised: false,
      bellRang: false,
    },
    rooms: {
      start: new Room({
        id: 'start',
        title: 'Start',
        description: 'A plain test room.',
        triggers: {
          custom: [
            {
              id: 'start:custom',
              once: true,
              run: ({ setFlag }) => {
                setFlag('eventRaised', true);
                return 'Triggered once.';
              },
            },
          ],
        },
      }),
    },
  };
}

test('topic responder normalizes text, applies effects, and falls back cleanly', () => {
  const beforeCalls = [];
  const effectCalls = [];
  const responder = createTopicResponder({
    before: ({ topic }) => {
      beforeCalls.push(topic);
    },
    rules: [
      {
        match: ['hello', 'greeting'],
        effect: ({ topic }) => {
          effectCalls.push(topic);
        },
        reply: ({ topic }) => `heard: ${topic}`,
      },
    ],
    fallback: 'no match',
  });

  assert.equal(responder({ topic: '  Hello There  ' }), 'heard: hello there');
  assert.equal(responder({ topic: 'farewell' }), 'no match');
  assert.deepEqual(beforeCalls, ['hello there', 'farewell']);
  assert.deepEqual(effectCalls, ['hello there']);
});

test('room triggers fire once and stay spent after save/load', () => {
  const worldState = new WorldState(createAuthoringManifest());

  assert.deepEqual(worldState.runRoomTrigger('start', 'custom'), ['Triggered once.']);
  assert.equal(worldState.getFlag('eventRaised'), true);
  assert.deepEqual(worldState.runRoomTrigger('start', 'custom'), []);

  const restoredWorldState = new WorldState(createAuthoringManifest());
  restoredWorldState.importSaveData(worldState.exportSaveData());

  assert.equal(restoredWorldState.getFlag('eventRaised'), true);
  assert.deepEqual(restoredWorldState.runRoomTrigger('start', 'custom'), []);
});

test('global events fire once and stay spent after save/load', () => {
  const worldState = new WorldState(createAuthoringManifest());

  assert.deepEqual(worldState.runEvent('revealGate'), ['The gate is revealed.']);
  assert.equal(worldState.getFlag('eventRaised'), true);
  assert.deepEqual(worldState.runEvent('revealGate'), []);

  const restoredWorldState = new WorldState(createAuthoringManifest());
  restoredWorldState.importSaveData(worldState.exportSaveData());

  assert.equal(restoredWorldState.getFlag('eventRaised'), true);
  assert.deepEqual(restoredWorldState.runEvent('revealGate'), []);
});

test('scheduled events persist across save/load and fire on the correct turn', () => {
  const worldState = new WorldState(createAuthoringManifest());

  assert.deepEqual(worldState.runEvent('queueBell'), ['You set the bell sequence in motion.']);
  assert.equal(worldState.hasScheduledEvent('bell-sequence'), true);

  worldState.incrementTurn();
  assert.deepEqual(worldState.advanceScheduledEvents(), []);
  assert.equal(worldState.getFlag('bellRang'), false);

  const restoredWorldState = new WorldState(createAuthoringManifest());
  restoredWorldState.importSaveData(worldState.exportSaveData());

  assert.equal(restoredWorldState.hasScheduledEvent('bell-sequence'), true);

  restoredWorldState.incrementTurn();
  assert.deepEqual(restoredWorldState.advanceScheduledEvents(), ['The bell finally answers from above (rope).']);
  assert.equal(restoredWorldState.getFlag('bellRang'), true);
  assert.equal(restoredWorldState.hasScheduledEvent('bell-sequence'), false);
});

test('room scenes add phase text, advance on turns, and persist room-local state', () => {
  const session = new GameSession({
    id: 'room-scene-test',
    startingRoomId: 'start',
    flags: {
      alert: false,
    },
    rooms: {
      start: new Room({
        id: 'start',
        title: 'Start',
        description: 'A plain test room.',
        scene: {
          getPhase: ({ getFlag }) => getFlag('alert') ? 'alert' : 'calm',
          phases: {
            calm: {
              description: 'Calm scene.',
              onTurn: ({ getRoomState, setRoomState }) => {
                const nextCount = (getRoomState().sceneTurns ?? 0) + 1;
                setRoomState({ sceneTurns: nextCount });
                return nextCount === 2 ? 'The room settles into repetition.' : null;
              },
            },
            alert: {
              description: 'Alert scene.',
            },
          },
        },
        objects: {
          bell: {
            description: 'A small brass bell.',
            actions: {
              use({ setFlag }) {
                setFlag('alert', true);
                return 'The bell snaps the room to attention.';
              },
            },
          },
        },
      }),
    },
  });

  assert.match(session.start(), /Calm scene\./i);
  assert.match(session.submitCommand('wait'), /You wait for a moment\./i);
  assert.match(session.submitCommand('look'), /The room settles into repetition\./i);
  assert.equal(session.worldState.getRoomState('start').sceneTurns, 2);

  const restoredWorldState = new WorldState({
    id: 'room-scene-test',
    startingRoomId: 'start',
    flags: {
      alert: false,
    },
    rooms: {
      start: new Room({
        id: 'start',
        title: 'Start',
        description: 'A plain test room.',
      }),
    },
  });
  restoredWorldState.importSaveData(session.worldState.exportSaveData());

  assert.equal(restoredWorldState.getRoomState('start').sceneTurns, 2);
  assert.match(session.submitCommand('use bell'), /The bell snaps the room to attention\./i);
  assert.match(session.submitCommand('look'), /Alert scene\./i);
});

test('generic action resolution supports using an item on a target object', () => {
  const key = new Item({
    id: 'test-key',
    name: 'key',
    description: 'A plain brass key.',
  });

  const session = new GameSession({
    id: 'generic-action-test',
    startingRoomId: 'start',
    startingInventory: [key],
    rooms: {
      start: new Room({
        id: 'start',
        title: 'Start',
        description: 'A plain test room.',
        objects: {
          door: {
            description: 'A locked test door.',
            actions: {
              use({ item }) {
                return item?.id === 'test-key'
                  ? 'The key turns and the door unlocks.'
                  : 'That does nothing useful.';
              },
            },
          },
        },
      }),
    },
  });

  session.start();
  assert.match(session.submitCommand('use key on door'), /door unlocks/i);
});

test('ambiguous room items prompt for clarification and resolve on the follow-up input', () => {
  const brassKey = new Item({
    id: 'brass-key',
    name: 'brass key',
    description: 'A polished brass key.',
    aliases: ['key'],
  });
  const boneKey = new Item({
    id: 'bone-key',
    name: 'bone key',
    description: 'A key carved from bone.',
    aliases: ['key'],
  });

  const session = new GameSession({
    id: 'disambiguation-direct-test',
    startingRoomId: 'start',
    rooms: {
      start: new Room({
        id: 'start',
        title: 'Start',
        description: 'A plain test room.',
        items: [brassKey, boneKey],
      }),
    },
  });

  session.start();

  const ambiguousResponse = session.submitCommand('take key');
  assert.match(ambiguousResponse, /which do you mean for "key"\?/i);
  assert.match(ambiguousResponse, /1\. brass key/i);
  assert.match(ambiguousResponse, /2\. bone key/i);
  assert.equal(session.worldState.turns, 0);

  const clarifiedResponse = session.submitCommand('bone key');
  assert.match(clarifiedResponse, /you take the bone key/i);
  assert.equal(session.worldState.turns, 1);
  assert.ok(session.worldState.findInventoryItem('bone key'));
  assert.ok(session.worldState.findVisibleItem('brass key'));
});

test('ambiguous indirect targets prompt for clarification and resume the original action', () => {
  const key = new Item({
    id: 'test-key',
    name: 'key',
    description: 'A plain brass key.',
  });

  const session = new GameSession({
    id: 'disambiguation-indirect-test',
    startingRoomId: 'start',
    startingInventory: [key],
    rooms: {
      start: new Room({
        id: 'start',
        title: 'Start',
        description: 'A plain test room.',
        objects: {
          ironDoor: {
            name: 'iron door',
            aliases: ['door'],
            description: 'A dented iron door.',
            actions: {
              use({ item }) {
                return item?.id === 'test-key'
                  ? 'The key turns in the iron door.'
                  : 'Nothing happens.';
              },
            },
          },
          boneDoor: {
            name: 'bone door',
            aliases: ['door'],
            description: 'A door plated in bone.',
            actions: {
              use() {
                return 'The bone door stays stubbornly shut.';
              },
            },
          },
        },
      }),
    },
  });

  session.start();

  const ambiguousResponse = session.submitCommand('use key on door');
  assert.match(ambiguousResponse, /which do you mean for "door"\?/i);
  assert.match(ambiguousResponse, /1\. iron door/i);
  assert.match(ambiguousResponse, /2\. bone door/i);
  assert.equal(session.worldState.turns, 0);

  const clarifiedResponse = session.submitCommand('1');
  assert.match(clarifiedResponse, /iron door/i);
  assert.equal(session.worldState.turns, 1);
});

test('wait advances the scheduler and prints due event text', () => {
  const session = new GameSession({
    id: 'wait-scheduler-test',
    startingRoomId: 'start',
    flags: {
      bellRang: false,
    },
    events: {
      queueBell: {
        actions: [
          {
            type: 'scheduleEvent',
            eventId: 'ringBell',
            delayTurns: 1,
            scheduleId: 'bell-sequence',
          },
        ],
        text: 'You tug the bell rope, and something in the walls begins to count.',
      },
      ringBell: {
        actions: [
          {
            type: 'setFlag',
            flag: 'bellRang',
            value: true,
          },
        ],
        text: 'A distant bell finally sounds through the house.',
      },
    },
    rooms: {
      start: new Room({
        id: 'start',
        title: 'Start',
        description: 'A plain test room.',
        verbs: {
          ring: ({ emitEvent }) => emitEvent('queueBell'),
        },
      }),
    },
  });

  session.start();
  assert.match(session.submitCommand('ring'), /tug the bell rope|begins to count/i);
  assert.equal(session.worldState.hasScheduledEvent('bell-sequence'), true);

  const waitResponse = session.submitCommand('wait');
  assert.match(waitResponse, /you wait for a moment/i);
  assert.match(waitResponse, /distant bell finally sounds/i);
  assert.equal(session.worldState.getFlag('bellRang'), true);
});