import test from 'node:test';
import assert from 'node:assert/strict';

import { createTestSession, moveToFeastHall, moveToFoyer, moveToGuestWing, moveToKitchen } from '../helpers/testSession.js';

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
  assert.match(session.submitCommand('open chest'), /empty except for cedar shavings/i);
  assert.match(session.submitCommand('read guest card'), /Ring once for comfort/i);
  assert.match(session.submitCommand('pull on bell pull'), /Somewhere deep in the house, a polite bell answers once/i);
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
  assert.match(session.submitCommand('ask oshregaal about house'), /flatter its owner, intimidate its rivals/i);
  assert.match(session.submitCommand('ask imp about chain'), /decorative slavery/i);
});

test('kelago clue path can unlock the secret circle handshake puzzle', () => {
  const session = createTestSession();

  moveToFeastHall(session);
  session.submitCommand('north');
  assert.match(session.submitCommand('tell kelago your work is beautiful'), /kind and accurate/i);
  assert.match(session.submitCommand('ask kelago about brother'), /glutton, a genius, a sentimentalist/i);
  assert.match(session.submitCommand('ask kelago about curtains'), /brass hand/i);

  session.submitCommand('south');
  assert.match(session.submitCommand('shake hand'), /hidden brass hand/i);
  assert.match(session.submitCommand('west'), /hidden chamber lies behind heavy red curtains/i);
});

test('expanded NPC dialogue topics land across the initial slice', () => {
  const session = createTestSession();

  moveToFoyer(session);
  assert.match(session.submitCommand('ask ogres about feast'), /dinner proceeds in courses/i);
  assert.match(session.submitCommand('tell ogres i am lost'), /temporary condition/i);
  assert.match(session.submitCommand('ask zamzam about guests'), /being arranged/i);
  assert.match(session.submitCommand('ask oggaf about upstairs'), /Suitable accommodation has been prepared/i);

  session.submitCommand('give invitation to oggaf');
  session.submitCommand('north');
  assert.match(session.submitCommand('ask imp about wrongus'), /would marry the stew/i);
  assert.match(session.submitCommand('tell imp oshregaal is awful'), /You are learning/i);
  assert.match(session.submitCommand('ask oshregaal about stories'), /tell a story may leave with all sorts of organs/i);
  assert.match(session.submitCommand('tell oshregaal your house is beautiful'), /architectural gratitude/i);

  assert.match(session.submitCommand('east'), /Wrongus holds dominion here/i);
  assert.match(session.submitCommand('ask wrongus about spices'), /Spice is argument/i);
  assert.match(session.submitCommand('ask wrongus about dessert'), /Dessert should resist slightly/i);
  assert.match(session.submitCommand('tell wrongus i can help'), /stir, lift, or keep secrets at a boil/i);
});

test('secondary talk targets make the house feel socially inhabited', () => {
  const session = createTestSession();

  assert.match(session.start(), /vast natural cavern/i);
  assert.match(session.submitCommand('north'), /white marble stair/i);
  assert.match(session.submitCommand('north'), /foyer is all red carpet/i);
  assert.match(session.submitCommand('ask piano about oshregaal'), /HOST OF GREASE AND GOLD/i);
  assert.match(session.submitCommand('tell piano it is beautiful'), /velvet-rich chord progression/i);

  assert.match(session.submitCommand('west'), /expected to wait/i);
  assert.match(session.submitCommand('ask couch about guests'), /Guests come in stiff/i);
  assert.match(session.submitCommand('tell couch i am tired'), /That is how houses begin to keep people/i);

  assert.match(session.submitCommand('east'), /foyer is all red carpet/i);
  assert.match(session.submitCommand('give invitation to oggaf'), /proceed as a guest|accepted/i);
  assert.match(session.submitCommand('north'), /immense dinner table dominates/i);
  assert.match(session.submitCommand('ask guests about leaving'), /polite method/i);
  assert.match(session.submitCommand('tell guests about escape'), /do not let him seat you twice/i);

  assert.match(session.submitCommand('tell imp help'), /Honesty at last/i);
  assert.match(session.submitCommand('ask imp about curtains'), /hidden brass hand/i);
  assert.match(session.submitCommand('shake hand'), /hidden brass hand/i);
  assert.match(session.submitCommand('west'), /hidden chamber lies behind heavy red curtains/i);
  assert.match(session.submitCommand('ask skulls about circle'), /ROAD, NOT SUMMONING/i);
});

test('new rooms beyond the initial slice extend the household and political map', () => {
  const session = createTestSession();

  moveToKitchen(session);
  assert.match(session.submitCommand('north'), /servants' dormitory is a long, low room/i);
  assert.equal(session.worldState.currentRoomId, 'ogreBeds');
  assert.match(session.submitCommand('search bunks'), /Lady Nathema has already bribed two servants this week/i);
  assert.equal(session.worldState.getFlag('ogreRosterKnown'), true);
  assert.match(session.submitCommand('ask ogres about nathema'), /Pays in promises/i);
  assert.match(session.submitCommand('wear servant apron'), /smells of stew, sweat, and the sort of invisibility/i);

  const secondSession = createTestSession();
  moveToGuestWing(secondSession);
  assert.match(secondSession.submitCommand('north'), /forcefully improved by its current occupant/i);
  assert.equal(secondSession.worldState.currentRoomId, 'nathemaRoom');
  assert.match(secondSession.submitCommand('search chest'), /wrapped in diplomatic cloth but weighted like contraband/i);
  assert.equal(secondSession.worldState.getFlag('nathemaContrabandKnown'), true);
  assert.match(secondSession.submitCommand('ask nathema about black wind'), /Bring me anything from the black wind line/i);
  assert.equal(secondSession.worldState.getFlag('nathemaBargained'), true);
  assert.match(secondSession.submitCommand('tell nathema about escape'), /stop treating departure as a confession/i);
});