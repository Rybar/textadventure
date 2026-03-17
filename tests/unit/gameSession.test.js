import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createTestSession,
  installMockLocalStorage,
  moveToFoyer,
  moveToFeastHall,
} from '../helpers/testSession.js';

test('foyer blocks feast-hall access until invitation is shown', () => {
  const session = createTestSession();

  moveToFoyer(session);
  const blockedResponse = session.submitCommand('north');

  assert.match(blockedResponse, /the feast receives invited guests/i);
  assert.equal(session.worldState.currentRoomId, 'foyer');
});

test('giving the invitation in the foyer sets admission state', () => {
  const session = createTestSession();

  moveToFoyer(session);
  const response = session.submitCommand('give invitation to oggaf');

  assert.match(response, /proceed as a guest/i);
  assert.equal(session.worldState.getFlag('foyerAdmitted'), true);
});

test('handshake puzzle unlocks the secret-circle route after a clue', () => {
  const session = createTestSession();

  moveToFeastHall(session);
  const firstAttempt = session.submitCommand('west');
  assert.match(firstAttempt, /expects a more intimate form of permission/i);

  const clueResponse = session.submitCommand('tell imp help');
  assert.match(clueResponse, /which piece of this room still remembers how to open/i);
  assert.match(session.submitCommand('ask imp about curtains'), /hidden brass hand/i);

  const unlockResponse = session.submitCommand('shake hand');
  assert.match(unlockResponse, /hidden brass hand/i);
  assert.equal(session.worldState.getFlag('secretCircleUnlocked'), true);

  const movementResponse = session.submitCommand('west');
  assert.match(movementResponse, /hidden chamber lies behind heavy red curtains/i);
  assert.equal(session.worldState.currentRoomId, 'secretCircle');
});

test('save and load restores room and inventory state', () => {
  const restoreStorage = installMockLocalStorage();

  try {
    const session = createTestSession();
    session.start();
    session.submitCommand('north');
    session.submitCommand('take red cloak');
    session.submitCommand('save testslot');
    session.submitCommand('north');

    const response = session.submitCommand('load testslot');

    assert.match(response, /game loaded from slot "testslot"/i);
    assert.equal(session.worldState.currentRoomId, 'grandStairs');
    assert.ok(session.worldState.findInventoryItem('red cloak'));
  } finally {
    restoreStorage();
  }
});