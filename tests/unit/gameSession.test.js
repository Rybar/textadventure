import test from 'node:test';
import assert from 'node:assert/strict';

import { createTestSession, installMockLocalStorage, moveToFoyer } from '../helpers/testSession.js';

test('giving the invitation in the foyer sets admission state', () => {
  const session = createTestSession();

  moveToFoyer(session);
  const response = session.submitCommand('give invitation to oggaf');

  assert.match(response, /proceed as a guest/i);
  assert.equal(session.worldState.getFlag('foyerAdmitted'), true);
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