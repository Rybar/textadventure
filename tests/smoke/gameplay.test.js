import test from 'node:test';
import assert from 'node:assert/strict';

import { admitAtFoyer, createTestSession, moveToFeastHall, moveToFoyer } from '../helpers/testSession.js';

test('custom verbs work across the current vertical slice', () => {
  const session = createTestSession();

  assert.match(session.start(), /vast natural cavern/i);
  assert.match(session.submitCommand('read invitation'), /grandfather oshregaal requests/i);
  assert.match(session.submitCommand('north'), /white marble stair/i);
  assert.match(session.submitCommand('put on red cloak'), /improves your silhouette/i);
});

test('foyer and feast hall social interactions respond correctly', () => {
  const session = createTestSession();

  moveToFoyer(session);
  assert.match(session.submitCommand('north'), /the feast receives invited guests/i);
  assert.match(session.submitCommand('give invitation to oggaf'), /proceed as a guest|accepted/i);
  assert.match(session.submitCommand('ask ogres about leaving'), /departures are a later course/i);
  assert.match(session.submitCommand('tell ogres your name'), /presence is noted/i);
  assert.match(session.submitCommand('shake oggaf hand'), /impeccably formal/i);

  session.submitCommand('north');
  assert.match(session.submitCommand('ask imp about escape'), /everything leaves eventually/i);
  assert.match(session.submitCommand('tell oshregaal your name'), /a pleasure/i);
});

test('kelago clue path can unlock the secret circle handshake puzzle', () => {
  const session = createTestSession();

  moveToFeastHall(session);
  session.submitCommand('north');
  assert.match(session.submitCommand('tell kelago your work is beautiful'), /kind and accurate/i);
  assert.match(session.submitCommand('ask kelago about curtains'), /brass hand/i);

  session.submitCommand('south');
  assert.match(session.submitCommand('shake hand'), /hidden brass hand/i);
  assert.match(session.submitCommand('west'), /hidden chamber lies behind heavy red curtains/i);
});