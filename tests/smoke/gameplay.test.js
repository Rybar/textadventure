import test from 'node:test';
import assert from 'node:assert/strict';

import { createTestSession, moveToFeastHall, moveToFoyer } from '../helpers/testSession.js';

test('custom verbs work across the current vertical slice', () => {
  const session = createTestSession();

  assert.match(session.start(), /vast natural cavern/i);
  assert.match(session.submitCommand('read invitation'), /grandfather oshregaal requests/i);
  assert.match(session.submitCommand('north'), /white marble stair/i);
  assert.match(session.submitCommand('put on red cloak'), /improves your silhouette/i);
});

test('diagonal movement commands and aliases work for diagonal exits', () => {
  const session = createTestSession();

  assert.match(session.start(), /vast natural cavern/i);
  assert.match(session.submitCommand('northwest'), /old garden has gone feral/i);
  assert.equal(session.worldState.currentRoomId, 'fernGarden');
  assert.match(session.submitCommand('se'), /vast natural cavern/i);
  assert.equal(session.worldState.currentRoomId, 'cavern');
});

test('outer and guest rooms now expose exploratory clue interactions', () => {
  const session = createTestSession();

  assert.match(session.start(), /vast natural cavern/i);
  assert.match(session.submitCommand('northwest'), /old garden has gone feral/i);
  assert.match(session.submitCommand('search ferns'), /low stone culvert/i);
  assert.equal(session.worldState.getFlag('fernCulvertNoticed'), true);
  assert.match(session.submitCommand('look at culvert'), /runs under the garden wall toward the house/i);

  assert.match(session.submitCommand('southeast'), /vast natural cavern/i);
  assert.match(session.submitCommand('north'), /white marble stair/i);
  assert.match(session.submitCommand('search east side'), /narrow maintenance ledge descends/i);
  assert.equal(session.worldState.getFlag('pitRouteHintKnown'), true);

  assert.match(session.submitCommand('north'), /foyer is all red carpet/i);
  assert.match(session.submitCommand('give invitation to oggaf'), /proceed as a guest|accepted/i);
  assert.match(session.submitCommand('up'), /guest room is almost offensively normal/i);
  assert.match(session.submitCommand('read guest card'), /Ring once for comfort/i);
  assert.match(session.submitCommand('pull bell pull'), /Somewhere deep in the house, a polite bell answers once/i);
  assert.equal(session.worldState.getFlag('guestBellRung'), true);
});

test('kitchen and secret circle interactions deepen the escape thread', () => {
  const session = createTestSession();

  moveToFeastHall(session);
  assert.match(session.submitCommand('east'), /Wrongus holds dominion here/i);
  assert.match(session.submitCommand('ask wrongus about blood'), /tiny red gentleman stand up in the pot/i);
  assert.equal(session.worldState.getFlag('kitchenBloodHintKnown'), true);

  assert.match(session.submitCommand('west'), /immense dinner table dominates/i);
  assert.match(session.submitCommand('tell imp help'), /which piece of this room still remembers how to open/i);
  assert.match(session.submitCommand('ask imp about curtains'), /hidden brass hand/i);
  assert.match(session.submitCommand('shake hand'), /hidden brass hand sewn into the curtain folds/i);
  assert.match(session.submitCommand('west'), /hidden chamber lies behind heavy red curtains/i);
  assert.match(session.submitCommand('search bookshelf'), /borrowed road dressed in newer chalk/i);
  assert.match(session.submitCommand('read scroll'), /floor-runes brighten/i);
  assert.equal(session.worldState.getFlag('escapeRouteUnlocked'), true);
});

test('cavern, sitting room, foyer, and feast hall support deeper clue play', () => {
  const session = createTestSession();

  assert.match(session.start(), /vast natural cavern/i);
  assert.match(session.submitCommand('search windows'), /upper window resolves itself as subtly different/i);
  assert.equal(session.worldState.getFlag('cavernWindowRouteKnown'), true);

  assert.match(session.submitCommand('north'), /white marble stair/i);
  assert.match(session.submitCommand('north'), /foyer is all red carpet/i);
  assert.match(session.submitCommand('search carpet'), /hospitality here has ruts/i);
  assert.equal(session.worldState.getFlag('foyerSurveillanceNoticed'), true);
  assert.match(session.submitCommand('ask ogres about piano'), /ambience and observation|acoustics/i);

  assert.match(session.submitCommand('west'), /expected to wait/i);
  assert.match(session.submitCommand('search folios'), /butlers hear the bell before they hear the guest/i);
  assert.equal(session.worldState.getFlag('folioMarginNoted'), true);
  assert.match(session.submitCommand('drink fountain'), /obedience might not be the worst thing/i);
  assert.equal(session.worldState.getFlag('sittingRoomWaterTasted'), true);

  assert.match(session.submitCommand('east'), /foyer is all red carpet/i);
  assert.match(session.submitCommand('give invitation to oggaf'), /proceed as a guest|accepted/i);
  assert.match(session.submitCommand('north'), /immense dinner table dominates/i);
  assert.match(session.submitCommand('search guests'), /less convivial than captive to momentum/i);
  assert.equal(session.worldState.getFlag('feastGuestPatternKnown'), true);
  assert.match(session.submitCommand('ask oshregaal about blood'), /drop is only manners|generous guest/i);
  assert.match(session.submitCommand('ask imp about guests'), /some are loyal, some are trapped/i);
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