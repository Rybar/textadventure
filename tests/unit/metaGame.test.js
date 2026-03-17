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
  session.submitCommand('look');
  session.submitCommand('look');

  const messages = session.consumePendingMetaMessages();
  assert.equal(messages.length, 2);
  assert.equal(messages[0].id, 'lackeyLeft001');
  assert.equal(messages[1].id, 'lackeyRight001');
  assert.equal(messages[0].placement, 'side-left');
  assert.equal(messages[1].placement, 'side-right');
  assert.equal(messages[0].source, 'experiment-lackeys');
  assert.equal(messages[1].source, 'experiment-lackeys');
  assert.equal(messages[0].delayMs, 0);
  assert.ok(messages[1].delayMs >= 4000);
  assert.ok(messages[0].options.holdDuration >= 3900);
});

test('foyer milestone gates the second lackey conversation', () => {
  const session = createTestSession();

  session.start();
  for (let index = 0; index < 6; index += 1) {
    session.submitCommand('look');
    session.consumePendingMetaMessages();
  }

  session.submitCommand('look');
  session.submitCommand('look');
  session.submitCommand('look');
  session.submitCommand('look');

  assert.deepEqual(session.consumePendingMetaMessages(), []);

  session.worldState.setFlag('foyerAdmitted', true);
  session.submitCommand('look');

  const messages = session.consumePendingMetaMessages();
  assert.equal(messages.length, 2);
  assert.equal(messages[0].id, 'lackeyLeft002');
  assert.equal(messages[1].id, 'lackeyRight002');
});

test('hacker messages wait for story milestones and use lower random placement', () => {
  const session = createTestSession();

  session.start();
  session.worldState.turns = 16;
  session.worldState.metaState.shownConversationIds = [
    'baseline-hold',
    'foyer-screening',
    'host-contact',
    'curiosity-breakpoint',
  ];
  session.worldState.advanceMetaMessages();
  assert.deepEqual(session.worldState.consumePendingMetaMessages(), []);

  session.worldState.setFlag('metOshregaal', true);
  const messages = session.worldState.advanceMetaMessages();
  assert.equal(messages.length, 1);
  assert.equal(messages[0].id, 'ghostHandshake');
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

test('lackeys react if the player echoes their side-channel language back at them', () => {
  const session = createTestSession();

  session.start();
  for (let index = 0; index < 6; index += 1) {
    session.submitCommand('look');
  }
  session.consumePendingMetaMessages();

  session.submitCommand('look at baseline fiction');

  const messages = session.consumePendingMetaMessages();
  assert.equal(messages.length, 2);
  assert.equal(messages[0].id, 'lackeyLeftReactive001');
  assert.equal(messages[1].id, 'lackeyRightReactive001');
  assert.equal(messages[0].placement, 'side-left');
  assert.equal(messages[1].placement, 'side-right');
});

test('lackeys react when the player addresses the shell after seeing their messages', () => {
  const session = createTestSession();

  session.start();
  for (let index = 0; index < 6; index += 1) {
    session.submitCommand('look');
  }
  session.consumePendingMetaMessages();

  session.submitCommand('can you see these messages');

  const messages = session.consumePendingMetaMessages();
  assert.equal(messages.length, 2);
  assert.equal(messages[0].id, 'lackeyLeftReactive002');
  assert.equal(messages[1].id, 'lackeyRightReactive002');
  assert.equal(messages[0].placement, 'side-left');
  assert.equal(messages[1].placement, 'side-right');
});