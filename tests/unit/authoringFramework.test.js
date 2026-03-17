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
    },
    flags: {
      eventRaised: false,
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