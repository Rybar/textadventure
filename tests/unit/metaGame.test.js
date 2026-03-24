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
  assert.equal(messages[0].id, 'maraBaselineA1');
  assert.equal(messages[1].id, 'kellanBaselineA1');
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

  const ambientMessages = session.consumePendingMetaMessages();
  assert.equal(ambientMessages.length, 2);
  assert.equal(ambientMessages[0].id, 'maraBaselineA3');
  assert.equal(ambientMessages[1].id, 'kellanBaselineA3');

  session.submitCommand('look');
  assert.deepEqual(session.consumePendingMetaMessages(), []);

  session.worldState.setFlag('foyerAdmitted', true);
  session.submitCommand('look');

  const messages = session.consumePendingMetaMessages();
  assert.equal(messages.length, 2);
  assert.equal(messages[0].id, 'kellanInvitationA2');
  assert.equal(messages[1].id, 'maraInvitationA2');
});

test('hacker messages wait for story milestones and use lower random placement', () => {
  const session = createTestSession();

  session.start();
  session.worldState.turns = 16;
  session.worldState.metaState.shownConversationIds = [
    'baseline-hold',
    'ambient-compliance',
    'foyer-screening',
    'host-contact',
  ];
  session.worldState.advanceMetaMessages();
  assert.deepEqual(session.worldState.consumePendingMetaMessages(), []);

  session.worldState.setFlag('metOshregaal', true);
  const messages = session.worldState.advanceMetaMessages();
  assert.equal(messages.length, 1);
  assert.equal(messages[0].id, 'ilexFirstContactD1');
  assert.equal(messages[0].source, 'hacker');
  assert.equal(messages[0].placement, 'lower-random');
});

test('panel injection flags queue explicit operator and ilex milestone beats', () => {
  const session = createTestSession();

  session.start();
  session.worldState.setFlag('mapOverlayInjected', true);

  const messages = session.worldState.consumePendingMetaMessages();
  assert.equal(messages.length, 3);
  assert.equal(messages[0].id, 'kellanMapLeakE1');
  assert.equal(messages[1].id, 'maraMapLeakE1');
  assert.equal(messages[2].id, 'ilexMapOverlayE2');
  assert.equal(messages[0].placement, 'side-left');
  assert.equal(messages[1].placement, 'side-right');
  assert.equal(messages[2].placement, 'lower-random');
  assert.match(messages[0].text, /intruder steering them now/i);
  assert.match(messages[1].text, /unauthorized agent interference confirmed/i);
  assert.match(messages[2].text, /they noticed me/i);
});

test('natural panel unlocks stay blocked until the initial Ilex contact has been shown', () => {
  const session = createTestSession();

  session.start();
  session.worldState.inventory.push(
    { id: 'test-item-1', name: 'test item 1' },
    { id: 'test-item-2', name: 'test item 2' },
    { id: 'test-item-3', name: 'test item 3' },
  );
  session.worldState.roomVisits = {
    cavern: 1,
    grandStairs: 1,
    foyer: 1,
    sittingRoom: 1,
    feastHall: 1,
    kitchen: 1,
    ogreBeds: 1,
  };
  session.worldState.currentRoomId = 'feastHall';

  session.worldState.syncNaturalPanelUnlocks();

  assert.equal(session.worldState.getFlag('inventoryOverlayInjected'), false);
  assert.equal(session.worldState.getFlag('mapOverlayInjected'), false);
  assert.equal(session.worldState.getFlag('memoryBusExposed'), false);
  assert.deepEqual(session.worldState.consumePendingMetaMessages(), []);
});

test('natural inventory unlock queues the existing leak milestone after Ilex contact and enough items', () => {
  const session = createTestSession();

  session.start();
  session.worldState.metaState.shownHackerIds = ['first-contact'];
  session.worldState.inventory.push(
    { id: 'test-item-1', name: 'test item 1' },
    { id: 'test-item-2', name: 'test item 2' },
    { id: 'test-item-3', name: 'test item 3' },
  );

  session.worldState.syncNaturalPanelUnlocks();

  const messages = session.worldState.consumePendingMetaMessages();
  assert.equal(session.worldState.getFlag('inventoryOverlayInjected'), true);
  assert.equal(session.worldState.isPanelUnlocked('inventory'), true);
  assert.equal(messages.length, 3);
  assert.equal(messages[0].id, 'kellanInventoryLeakE3');
  assert.equal(messages[1].id, 'maraInventoryLeakE3');
  assert.equal(messages[2].id, 'ilexInventoryOverlayE4');
});

test('natural map unlock queues the existing leak milestone only after Ilex contact and enough room exploration', () => {
  const session = createTestSession();

  session.start();
  session.worldState.metaState.shownHackerIds = ['first-contact'];
  session.worldState.roomVisits = {
    cavern: 1,
    grandStairs: 1,
    foyer: 1,
    sittingRoom: 1,
    feastHall: 1,
    kitchen: 1,
    ogreBeds: 1,
  };

  session.worldState.syncNaturalPanelUnlocks({ roomId: 'ogreBeds' });

  const messages = session.worldState.consumePendingMetaMessages();
  assert.equal(session.worldState.getFlag('mapOverlayInjected'), true);
  assert.equal(session.worldState.isPanelUnlocked('map'), true);
  assert.equal(messages.length, 3);
  assert.equal(messages[0].id, 'kellanMapLeakE1');
  assert.equal(messages[1].id, 'maraMapLeakE1');
  assert.equal(messages[2].id, 'ilexMapOverlayE2');
});

test('memory bus exposure triggers its milestone only once', () => {
  const session = createTestSession();

  session.start();
  session.worldState.setFlag('memoryBusExposed', true);
  const firstBatch = session.worldState.consumePendingMetaMessages();
  session.worldState.setFlag('memoryBusExposed', true);
  const secondBatch = session.worldState.consumePendingMetaMessages();

  assert.equal(firstBatch.length, 3);
  assert.equal(firstBatch[2].id, 'ilexMemoryBusE6');
  assert.equal(session.worldState.isPanelUnlocked('memory'), true);
  assert.deepEqual(secondBatch, []);
});

test('natural memory unlock waits for a prior game over and a dangerous room', () => {
  const session = createTestSession();

  session.start();
  session.worldState.metaState.shownHackerIds = ['first-contact'];
  session.worldState.currentRoomId = 'foyer';
  session.worldState.syncNaturalPanelUnlocks();
  assert.equal(session.worldState.getFlag('memoryBusExposed'), false);

  session.worldState.setFlag('hasExperiencedGameOver', true);
  session.worldState.currentRoomId = 'foyer';
  session.worldState.syncNaturalPanelUnlocks();
  assert.equal(session.worldState.getFlag('memoryBusExposed'), false);

  session.worldState.currentRoomId = 'feastHall';
  session.worldState.syncNaturalPanelUnlocks();

  const messages = session.worldState.consumePendingMetaMessages();
  assert.equal(session.worldState.getFlag('memoryBusExposed'), true);
  assert.equal(session.worldState.isPanelUnlocked('memory'), true);
  assert.equal(messages.length, 3);
  assert.equal(messages[0].id, 'kellanMemoryLeakE5');
  assert.equal(messages[1].id, 'maraMemoryLeakE5');
  assert.equal(messages[2].id, 'ilexMemoryBusE6');
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

test('debughacker and nexthacker preview only hacker messages without spending a turn', () => {
  const session = createTestSession();

  session.start();

  const disabledResponse = session.submitCommand('nexthacker');
  assert.match(disabledResponse, /meta debug mode is off/i);
  assert.equal(session.worldState.turns, 0);

  const enableResponse = session.submitCommand('debughacker');
  assert.match(enableResponse, /meta debug mode enabled/i);
  assert.equal(session.worldState.turns, 0);

  session.worldState.setFlag('metOshregaal', true);
  session.worldState.turns = 16;
  session.worldState.metaState.shownConversationIds = [
    'baseline-hold',
    'ambient-compliance',
    'foyer-screening',
    'host-contact',
  ];

  const previewResponse = session.submitCommand('nexthacker');
  assert.match(previewResponse, /queued 1 hacker message/i);
  assert.equal(session.worldState.turns, 16);

  const messages = session.consumePendingMetaMessages();
  assert.equal(messages.length, 1);
  assert.equal(messages[0].source, 'hacker');
  assert.equal(messages[0].id, 'ilexFirstContactD1');
  assert.equal(messages[0].placement, 'lower-random');
  assert.equal(messages[0].delayMs, 0);
});

test('lackeys react if the player echoes their side-channel language back at them', () => {
  const session = createTestSession();

  session.start();
  for (let index = 0; index < 6; index += 1) {
    session.submitCommand('look');
  }
  session.consumePendingMetaMessages();

  session.submitCommand('look at the threshold scenario');

  const messages = session.consumePendingMetaMessages();
  assert.equal(messages.length, 2);
  assert.equal(messages[0].id, 'lackeyLeftReactive001');
  assert.equal(messages[1].id, 'lackeyRightReactive001');
  assert.equal(messages[0].placement, 'side-left');
  assert.equal(messages[1].placement, 'side-right');
});

test('lackeys keep reacting to echoed operator language with varied responses', () => {
  const session = createTestSession();

  session.start();
  for (let index = 0; index < 6; index += 1) {
    session.submitCommand('look');
  }
  session.consumePendingMetaMessages();

  session.submitCommand('threshold scenario');
  const firstMessages = session.consumePendingMetaMessages().filter(message => message.source === 'experiment-lackeys-aware');

  session.submitCommand('threshold scenario');
  const secondMessages = session.consumePendingMetaMessages().filter(message => message.source === 'experiment-lackeys-aware');

  assert.equal(firstMessages.length, 2);
  assert.equal(secondMessages.length, 2);
  assert.notEqual(firstMessages[0].id, secondMessages[0].id);
  assert.notEqual(firstMessages[1].id, secondMessages[1].id);
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

test('lackeys react when the player addresses mara or kellan directly and keep varying the reply', () => {
  const session = createTestSession();

  session.start();
  for (let index = 0; index < 6; index += 1) {
    session.submitCommand('look');
  }
  session.consumePendingMetaMessages();

  session.submitCommand('mara can you hear me');
  const firstMessages = session.consumePendingMetaMessages().filter(message => message.source === 'experiment-lackeys-aware');

  session.submitCommand('kellan answer me');
  const secondMessages = session.consumePendingMetaMessages().filter(message => message.source === 'experiment-lackeys-aware');

  assert.equal(firstMessages.length, 2);
  assert.equal(secondMessages.length, 2);
  assert.equal(firstMessages[0].placement, 'side-left');
  assert.equal(firstMessages[1].placement, 'side-right');
  assert.notEqual(firstMessages[0].id, secondMessages[0].id);
  assert.notEqual(firstMessages[1].id, secondMessages[1].id);
});

test('lackeys react if the player starts using debug commands after operator chatter is visible', () => {
  const session = createTestSession();

  session.start();
  for (let index = 0; index < 6; index += 1) {
    session.submitCommand('look');
  }
  session.consumePendingMetaMessages();

  const response = session.submitCommand('debugpanel map');
  assert.match(response, /map panel unlocked/i);
  assert.equal(session.worldState.turns, 6);

  const messages = session.consumePendingMetaMessages();
  assert.equal(messages.length, 2);
  assert.equal(messages[0].id, 'lackeyLeftReactive003');
  assert.equal(messages[1].id, 'lackeyRightReactive003');
  assert.equal(messages[0].placement, 'side-left');
  assert.equal(messages[1].placement, 'side-right');
});

test('route milestones queue distinct plum, nathema, and archive commentary', () => {
  const session = createTestSession();

  session.start();

  session.worldState.setFlag('plumFound', true);
  let messages = session.worldState.consumePendingMetaMessages();
  assert.equal(messages.length, 3);
  assert.equal(messages[0].id, 'maraPlumFoundH1');
  assert.equal(messages[1].id, 'kellanPlumFoundH1');
  assert.equal(messages[2].id, 'ilexPlumFoundH1');

  session.worldState.setFlag('nathemaBargained', true);
  messages = session.worldState.consumePendingMetaMessages();
  assert.equal(messages.length, 3);
  assert.equal(messages[0].id, 'maraNathemaDealH4');
  assert.equal(messages[1].id, 'kellanNathemaDealH4');
  assert.equal(messages[2].id, 'ilexNathemaDealH4');

  session.worldState.setFlag('libraryRouteKnown', true);
  messages = session.worldState.consumePendingMetaMessages();
  assert.equal(messages.length, 3);
  assert.equal(messages[0].id, 'maraArchiveH6');
  assert.equal(messages[1].id, 'kellanArchiveH6');
  assert.equal(messages[2].id, 'ilexArchiveH6');
});

test('route-specific game over flags queue outsider commentary about recurrence and contamination', () => {
  const session = createTestSession();

  session.start();

  session.worldState.setFlag('routineGameOverSeen', true);
  let messages = session.worldState.consumePendingMetaMessages();
  assert.equal(messages.length, 3);
  assert.equal(messages[0].id, 'maraRoutineGameOverJ1');
  assert.equal(messages[1].id, 'kellanRoutineGameOverJ1');
  assert.equal(messages[2].id, 'ilexRoutineGameOverJ1');

  session.worldState.setFlag('correctionGameOverSeen', true);
  messages = session.worldState.consumePendingMetaMessages();
  assert.equal(messages.length, 3);
  assert.equal(messages[0].id, 'maraCorrectionGameOverJ3');
  assert.equal(messages[1].id, 'kellanCorrectionGameOverJ3');
  assert.equal(messages[2].id, 'ilexCorrectionGameOverJ3');
});

test('scheduled outsider chatter escalates from panel intrusion to recurrence after death', () => {
  const intrusionSession = createTestSession();

  intrusionSession.start();
  intrusionSession.worldState.turns = 24;
  intrusionSession.worldState.setFlag('mapOverlayInjected', true);
  intrusionSession.worldState.consumePendingMetaMessages();
  intrusionSession.worldState.metaState.shownConversationIds = [
    'baseline-hold',
    'ambient-compliance',
    'foyer-screening',
    'host-contact',
    'pattern-seams',
    'route-anomaly',
    'leverage-reading',
  ];

  let messages = intrusionSession.worldState.advanceMetaMessages();
  assert.equal(messages.length, 2);
  assert.equal(messages[0].id, 'kellanIntrusionF3');
  assert.equal(messages[1].id, 'maraIntrusionF3');

  const recurrenceSession = createTestSession();

  recurrenceSession.start();
  recurrenceSession.worldState.turns = 28;
  recurrenceSession.worldState.setFlag('hasExperiencedGameOver', true);
  recurrenceSession.worldState.consumePendingMetaMessages();
  recurrenceSession.worldState.metaState.shownConversationIds = [
    'baseline-hold',
    'ambient-compliance',
    'foyer-screening',
    'host-contact',
    'pattern-seams',
    'route-anomaly',
    'leverage-reading',
    'intrusion-detected',
  ];

  messages = recurrenceSession.worldState.advanceMetaMessages();
  assert.equal(messages.length, 2);
  assert.equal(messages[0].id, 'maraRecurrenceF4');
  assert.equal(messages[1].id, 'kellanRecurrenceF4');
});

test('late phase scheduled exchanges can fire once earlier schedule entries are exhausted', () => {
  const session = createTestSession();

  session.start();
  session.worldState.turns = 32;
  session.worldState.setFlag('containmentOverride', true);
  session.worldState.consumePendingMetaMessages();
  session.worldState.metaState.shownConversationIds = [
    'baseline-hold',
    'ambient-compliance',
    'foyer-screening',
    'host-contact',
    'pattern-seams',
    'route-anomaly',
    'leverage-reading',
    'intrusion-detected',
    'recurrence-observed',
  ];

  const messages = session.worldState.advanceMetaMessages();
  assert.equal(messages.length, 2);
  assert.equal(messages[0].id, 'maraEscalationF2');
  assert.equal(messages[1].id, 'kellanEscalationF2');
});

test('ending resolution is deterministic and exclusive', () => {
  const absorbedSession = createTestSession();
  absorbedSession.start();
  absorbedSession.worldState.setFlag('absorbedIntoRoutine', true);
  let messages = absorbedSession.worldState.consumePendingMetaMessages();
  assert.equal(messages[0].id, 'maraAbsorbedEndingZ1');
  assert.equal(messages[1].id, 'kellanAbsorbedEndingZ1');
  assert.equal(messages[2].id, 'ilexAbsorbedEndingZ1');

  const breachSession = createTestSession();
  breachSession.start();
  breachSession.worldState.setFlag('containmentOverride', true);
  breachSession.worldState.consumePendingMetaMessages();
  breachSession.worldState.setFlag('escapedMansion', true);
  messages = breachSession.worldState.consumePendingMetaMessages();
  assert.equal(messages[0].id, 'maraBreachEndingZ2');
  assert.equal(messages[1].id, 'kellanBreachEndingZ2');
  assert.equal(messages[2].id, 'ilexBreachEndingZ2');

  const darkBargainSession = createTestSession();
  darkBargainSession.start();
  darkBargainSession.worldState.setFlag('nathemaEscapeDealSecured', true);
  darkBargainSession.worldState.consumePendingMetaMessages();
  darkBargainSession.worldState.setFlag('oshregaalWounded', true);
  darkBargainSession.worldState.consumePendingMetaMessages();
  darkBargainSession.worldState.setFlag('escapedMansion', true);
  messages = darkBargainSession.worldState.consumePendingMetaMessages();
  assert.equal(messages[0].id, 'maraDarkBargainEndingZ3');
  assert.equal(messages[1].id, 'kellanDarkBargainEndingZ3');
  assert.equal(messages[2].id, 'ilexDarkBargainEndingZ3');

  const strongSession = createTestSession();
  strongSession.start();
  strongSession.worldState.setFlag('plumRescued', true);
  strongSession.worldState.consumePendingMetaMessages();
  strongSession.worldState.setFlag('strongerEscapeSecured', true);
  strongSession.worldState.setFlag('escapedMansion', true);
  messages = strongSession.worldState.consumePendingMetaMessages();
  assert.equal(messages[0].id, 'maraStrongEndingZ5');
  assert.equal(messages[1].id, 'kellanStrongEndingZ5');
  assert.equal(messages[2].id, 'ilexStrongEndingZ5');
});

test('pending milestone beats suppress generic scheduled chatter on the same turn', () => {
  const session = createTestSession();

  session.start();
  session.worldState.turns = 24;
  session.worldState.metaState.shownConversationIds = [
    'baseline-hold',
    'ambient-compliance',
    'foyer-screening',
    'host-contact',
    'pattern-seams',
    'route-anomaly',
  ];
  session.worldState.setFlag('plumRescued', true);

  const scheduledMessages = session.worldState.advanceMetaMessages();
  const queuedMessages = session.worldState.consumePendingMetaMessages();
  assert.deepEqual(scheduledMessages, []);
  assert.equal(queuedMessages[0].id, 'maraPlumRescueH3');
  assert.equal(queuedMessages[1].id, 'kellanPlumRescueH3');
  assert.equal(queuedMessages[2].id, 'ilexPlumFoundH1');
});

test('memory shell verbs trigger their own repeatable reactive pool', () => {
  const session = createTestSession();

  session.start();
  for (let index = 0; index < 6; index += 1) {
    session.submitCommand('look');
  }
  session.consumePendingMetaMessages();

  session.worldState.unlockPanel('memory');
  session.worldState.setFlag('memoryBusExposed', true);
  session.worldState.consumePendingMetaMessages();
  session.submitCommand('scan');
  let messages = session.consumePendingMetaMessages().filter(message => message.source === 'experiment-lackeys-aware');
  assert.equal(messages.length, 2);
  assert.equal(messages[0].id, 'lackeyLeftReactive004');
  assert.equal(messages[1].id, 'lackeyRightReactive004');

  session.submitCommand('peek 0');
  messages = session.consumePendingMetaMessages().filter(message => message.source === 'experiment-lackeys-aware');
  assert.equal(messages.length, 2);
  assert.equal(messages[0].id, 'lackeyLeftReactive004b');
  assert.equal(messages[1].id, 'lackeyRightReactive004b');
});