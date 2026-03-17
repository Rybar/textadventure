import test from 'node:test';
import assert from 'node:assert/strict';

import { createTestSession } from '../helpers/testSession.js';

test('meta messages do not appear at startup or in the first few interactions', () => {
  const session = createTestSession();

  session.start();
  assert.deepEqual(session.consumePendingMetaMessages(), []);

  session.submitCommand('look');
  session.submitCommand('look');
  session.submitCommand('look');

  assert.deepEqual(session.consumePendingMetaMessages(), []);
});

test('lackey conversation begins after several interactions and appears on both sides', () => {
  const session = createTestSession();

  session.start();
  session.submitCommand('look');
  session.submitCommand('look');
  session.submitCommand('look');
  session.submitCommand('look');

  const messages = session.consumePendingMetaMessages();
  assert.equal(messages.length, 2);
  assert.equal(messages[0].placement, 'side-left');
  assert.equal(messages[1].placement, 'side-right');
  assert.equal(messages[0].source, 'experiment-lackeys');
  assert.equal(messages[1].source, 'experiment-lackeys');
  assert.equal(messages[0].delayMs, 0);
  assert.ok(messages[1].delayMs >= 4000);
  assert.ok(messages[0].options.holdDuration >= 3900);
});

test('hacker messages begin later and use lower random placement', () => {
  const session = createTestSession();

  session.start();
  for (let index = 0; index < 15; index += 1) {
    session.submitCommand('look');
    session.consumePendingMetaMessages();
  }

  session.submitCommand('look');

  const messages = session.consumePendingMetaMessages();
  assert.equal(messages.length, 1);
  assert.equal(messages[0].source, 'hacker');
  assert.equal(messages[0].placement, 'lower-random');
});

test('meta debug toggle and nextmeta can preview the next scheduled exchange', () => {
  const session = createTestSession();

  session.start();

  const disabledResponse = session.submitCommand('nextmeta');
  assert.match(disabledResponse, /meta debug mode is off/i);
  assert.equal(session.worldState.turns, 0);

  const enableResponse = session.submitCommand('debugmeta');
  assert.match(enableResponse, /meta debug mode enabled/i);
  assert.equal(session.worldState.turns, 0);

  const previewResponse = session.submitCommand('nextmeta');
  assert.match(previewResponse, /queued 2 meta messages/i);
  assert.equal(session.worldState.turns, 0);

  const messages = session.consumePendingMetaMessages();
  assert.equal(messages.length, 2);
  assert.equal(messages[0].placement, 'side-left');
  assert.equal(messages[1].placement, 'side-right');
  assert.equal(messages[0].delayMs, 0);
  assert.ok(messages[1].delayMs >= 4000);
});