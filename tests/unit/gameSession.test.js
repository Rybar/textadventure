import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createTestSession,
  installMockLocalStorage,
  moveToBathroom,
  moveToBlackWindTreeChamber,
  moveToCesspool,
  moveToFoyer,
  moveToFeastHall,
  moveToGuestWing,
  moveToGrandfatherRoom,
  moveToKitchen,
  moveToPlumRoom,
  moveToSealedRoom,
  moveToTrophyRoom,
} from '../helpers/testSession.js';

test('game start prints the title and attribution before the opening room description', () => {
  const session = createTestSession();

  const openingText = session.start();

  assert.match(openingText, /FEAST OF OSHREGAAL/i);
  assert.match(openingText, /A text adventure based on a Pathfinder campaign of the same name by Grizzelnit\./i);
  assert.match(openingText, /You stand in a vast natural cavern/i);
  assert.ok(openingText.indexOf('FEAST OF OSHREGAAL') < openingText.indexOf('You stand in a vast natural cavern'));
});

test('foyer blocks feast-hall access until invitation is shown', () => {
  const session = createTestSession();

  moveToFoyer(session);
  assert.match(session.submitCommand('look'), /performs welcome beautifully|music, symmetry, light/i);
  const blockedResponse = session.submitCommand('north');

  assert.match(blockedResponse, /the feast receives invited guests/i);
  assert.equal(session.worldState.getFlag('foyerThresholdTested'), true);
  assert.match(session.submitCommand('look'), /receiving mechanism|room's decision rendered in muscle and gloves/i);
  assert.equal(session.worldState.currentRoomId, 'foyer');
});

test('prominent room-description nouns can be examined directly across core rooms', () => {
  const foyerSession = createTestSession();
  moveToFoyer(foyerSession);
  assert.match(foyerSession.submitCommand('look at servants'), /polite confidence|remove a guest in pieces/i);
  assert.match(foyerSession.submitCommand('look at white pillars'), /polished confidence|theatrical symmetry/i);
  assert.match(foyerSession.submitCommand('look at red carpet'), /disciplined wear|butlers' post/i);

  const feastSession = createTestSession();
  moveToFeastHall(feastSession);
  assert.match(feastSession.submitCommand('look at servants'), /drilled calm|delay counts as blasphemy/i);
  assert.match(feastSession.submitCommand('look at table'), /counts as weather|plates, and ritual/i);
  assert.match(feastSession.submitCommand('look at red drapery'), /heavy red curtains|hiding more hardware/i);

  const grandfatherSession = createTestSession();
  moveToGrandfatherRoom(grandfatherSession);
  assert.match(grandfatherSession.submitCommand('look at guest lists'), /revised often enough|plans company/i);
  assert.match(grandfatherSession.submitCommand('look at sealed notes'), /perfumed wax|performance of authority/i);
  assert.match(grandfatherSession.submitCommand('look at smoke'), /perfumed smoke|moral authority/i);

  const plumSession = createTestSession();
  moveToPlumRoom(plumSession);
  assert.match(plumSession.submitCommand('look at bed'), /expects interruption|offers function/i);
  assert.match(plumSession.submitCommand('look at copied notes'), /backups of identity|continuity/i);
  assert.match(plumSession.submitCommand('look at forearm'), /luminous tracery|too precise/i);
});

test('secondary environmental nouns remain examinable in utility and service spaces', () => {
  const bathroomSession = createTestSession();
  moveToBathroom(bathroomSession);
  assert.match(bathroomSession.submitCommand('look at eastern tilework'), /punitive luxury|gleams/i);
  assert.match(bathroomSession.submitCommand('look at sour draft'), /wet stone|house losing control/i);

  const kitchenSession = createTestSession();
  moveToKitchen(kitchenSession);
  assert.match(kitchenSession.submitCommand('look at fire'), /disciplined heat|smoke alarm/i);
  assert.match(kitchenSession.submitCommand('look at beams'), /blackened with smoke|spice bundles/i);
  assert.match(kitchenSession.submitCommand('look at jars'), /candy ooze|dessert opinions/i);

  const cesspoolSession = createTestSession();
  moveToCesspool(cesspoolSession);
  assert.match(cesspoolSession.submitCommand('look at cistern'), /insult to hydraulics|runoff, refuse/i);
  assert.match(cesspoolSession.submitCommand('look at crates'), /bullied into elegance|success disturbing/i);
  assert.match(cesspoolSession.submitCommand('look at salvaged silver'), /polished well past reason|refinement/i);

  const ogreBedsSession = createTestSession();
  moveToKitchen(ogreBedsSession);
  ogreBedsSession.submitCommand('north');
  assert.match(ogreBedsSession.submitCommand('look at damp blankets'), /broth steam|sleeping quarters/i);
  assert.match(ogreBedsSession.submitCommand('look at boot piles'), /geology of labor|earns their invisibility/i);
});

test('giving the invitation in the foyer sets admission state', () => {
  const session = createTestSession();

  moveToFoyer(session);
  const response = session.submitCommand('give invitation to oggaf');

  assert.match(response, /proceed as a guest/i);
  assert.equal(session.worldState.getFlag('foyerAdmitted'), true);
  assert.match(session.submitCommand('look'), /successfully categorized problem|less like an interruption/i);
});

test('showing the invitation in the foyer also supports admission flow', () => {
  const session = createTestSession();

  moveToFoyer(session);
  const response = session.submitCommand('show invitation to oggaf');

  assert.match(response, /proceed as a guest|accepted/i);
  assert.equal(session.worldState.getFlag('foyerAdmitted'), true);
  assert.ok(session.worldState.findInventoryItem('invitation'));
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

test('grand stairs prose stops placing the red cloak on the gargoyle after it is taken', () => {
  const session = createTestSession();

  session.start();
  session.submitCommand('north');
  const initialLook = session.submitCommand('look');
  assert.match(initialLook, /draped with a fine red cloak/i);
  assert.match(initialLook, /You can see the following items: red cloak\./i);

  const takeResponse = session.submitCommand('take cloak');
  assert.match(takeResponse, /You take the red cloak\./i);

  const followUpLook = session.submitCommand('look');
  assert.doesNotMatch(followUpLook, /draped with a fine red cloak/i);
  assert.match(followUpLook, /bereft of the theatrical red cloak/i);
  assert.doesNotMatch(followUpLook, /You can see the following items: red cloak\./i);
  assert.match(session.submitCommand('look cloak'), /richly cut red cloak/i);
  assert.match(session.submitCommand('inventory'), /red cloak/i);
});

test('hidden wax plug is not visible before discovery and room prose stays consistent after taking it', () => {
  const session = createTestSession();

  moveToGrandfatherRoom(session);

  const initialLook = session.submitCommand('look');
  assert.doesNotMatch(initialLook, /wax plug/i);
  assert.doesNotMatch(initialLook, /You can see the following items: .*wax plug/i);
  assert.match(session.submitCommand('take wax plug'), /There is no wax plug here to take\./i);

  const searchResponse = session.submitCommand('search vanity');
  assert.match(searchResponse, /wrapped plug of dark ear wax hidden behind a comb/i);

  const discoveredLook = session.submitCommand('look');
  assert.match(discoveredLook, /You can see the following items: bed, wax plug\./i);

  const takeResponse = session.submitCommand('take wax plug');
  assert.match(takeResponse, /You take the wax plug\./i);

  const followUpLook = session.submitCommand('look');
  assert.doesNotMatch(followUpLook, /You can see the following items: bed, wax plug\./i);
  assert.match(followUpLook, /disturbed vanity drawer/i);
  assert.match(session.submitCommand('look wax plug'), /made for listening less/i);
  assert.match(session.submitCommand('inventory'), /wax plug/i);
});

test('secret circle annotation stays hidden until searched and bookshelf prose updates after taking it', () => {
  const session = createTestSession();

  moveToFeastHall(session);
  session.submitCommand('tell imp help');
  session.submitCommand('ask imp about curtains');
  session.submitCommand('shake hand');
  session.submitCommand('west');

  const initialLook = session.submitCommand('look');
  assert.doesNotMatch(initialLook, /road annotation/i);
  assert.doesNotMatch(initialLook, /You can see the following items: .*road annotation/i);
  assert.match(session.submitCommand('take road annotation'), /There is no road annotation here to take\./i);

  assert.match(session.submitCommand('search bookshelf'), /borrowed road dressed in newer chalk|activation only wakes the prepared route/i);
  const revealedLook = session.submitCommand('look');
  assert.match(revealedLook, /You can see the following items: road annotation, teleport scroll, mutation potion, portal ring\./i);

  assert.match(session.submitCommand('take road annotation'), /You take the road annotation\./i);
  assert.match(session.submitCommand('look bookshelf'), /narrow gap among the older transit texts/i);
  assert.doesNotMatch(session.submitCommand('look'), /You can see the following items: .*road annotation/i);
});

test('trophy room prose updates after the Grey Grin Blade is taken', () => {
  const session = createTestSession();

  moveToTrophyRoom(session);

  const initialLook = session.submitCommand('look');
  assert.match(initialLook, /rests the Grey Grin Blade/i);
  assert.match(initialLook, /You can see the following items: Grey Grin Blade\./i);

  assert.match(session.submitCommand('take grey grin blade'), /You take the Grey Grin Blade\./i);

  const followUpLook = session.submitCommand('look');
  assert.doesNotMatch(followUpLook, /rests the Grey Grin Blade/i);
  assert.match(followUpLook, /blackwood stand sits empty/i);
  assert.doesNotMatch(followUpLook, /You can see the following items: Grey Grin Blade\./i);
  assert.match(session.submitCommand('search stand'), /displays only absence|someone stole it anyway/i);
});

test('sealed room bell card stays hidden until discovered and room prose updates after removal', () => {
  const session = createTestSession();

  moveToSealedRoom(session);

  const initialLook = session.submitCommand('look');
  assert.match(initialLook, /correction roster/i);
  assert.doesNotMatch(initialLook, /correction bell card/i);
  assert.doesNotMatch(initialLook, /You can see the following items: .*correction bell card/i);
  assert.match(session.submitCommand('take correction bell card'), /There is no correction bell card here to take\./i);

  assert.match(session.submitCommand('search tube'), /folded service card just out of immediate sight/i);
  const revealedLook = session.submitCommand('look');
  assert.match(revealedLook, /You can see the following items: correction bell card, correction roster\./i);

  assert.match(session.submitCommand('take correction bell card'), /You take the correction bell card\./i);
  assert.match(session.submitCommand('look tube'), /hidden card that once sat behind the grille is already gone/i);
  assert.doesNotMatch(session.submitCommand('look'), /You can see the following items: .*correction bell card/i);
});

test('plum room desk prose reflects when the memory folder has been taken', () => {
  const session = createTestSession();

  moveToPlumRoom(session);

  assert.match(session.submitCommand('search desk'), /memory folder kept close enough to be grabbed in panic/i);
  assert.match(session.submitCommand('take memory folder'), /You take the memory folder\./i);
  assert.match(session.submitCommand('search desk'), /conspicuous gap where a memory folder had been kept/i);
  assert.match(session.submitCommand('read memory folder'), /Wax in one ear blunts the host-voice/i);
  assert.match(session.submitCommand('look'), /memory folder you took still gives the room the air/i);
});

test('bathroom prose stops placing the silver mirror after it is taken', () => {
  const session = createTestSession();

  moveToBathroom(session);

  const initialLook = session.submitCommand('look');
  assert.match(initialLook, /silver-backed mirror/i);
  assert.match(session.submitCommand('take silver mirror'), /You take the silver mirror\./i);

  const followUpLook = session.submitCommand('look');
  assert.doesNotMatch(followUpLook, /silver-backed mirror/i);
  assert.match(followUpLook, /empty stand where the guest hand mirror had been set/i);
});

test('interface model starts with locked panels and debugpanel unlocks without spending a turn', () => {
  const session = createTestSession();

  session.start();
  const initialModel = session.getInterfaceModel();
  assert.equal(initialModel.panels.find(panel => panel.id === 'map')?.unlocked, false);
  assert.equal(session.worldState.turns, 0);

  const response = session.submitCommand('debugpanel map');

  assert.match(response, /map panel unlocked/i);
  assert.equal(session.worldState.turns, 0);
  assert.equal(session.getInterfaceModel().panels.find(panel => panel.id === 'map')?.unlocked, true);
});

test('help hides debug and shell verbs until the shell is actually exposed', () => {
  const session = createTestSession();

  session.start();

  const response = session.submitCommand('help');

  assert.doesNotMatch(response, /debugmeta|debughacker|debugpanel|nextmeta|nexthacker/i);
  assert.doesNotMatch(response, /scan|peek|poke/i);
  assert.doesNotMatch(response, /map will open the spatial overlay/i);
});

test('help reveals shell verbs once the memory panel is available', () => {
  const session = createTestSession();

  session.start();
  session.submitCommand('debugpanel memory');

  const response = session.submitCommand('help');

  assert.match(response, /scan, peek, and poke/i);
  assert.doesNotMatch(response, /debugmeta|debughacker|debugpanel|nextmeta|nexthacker/i);
});

test('save and load restores panel unlock state', () => {
  const restoreStorage = installMockLocalStorage();

  try {
    const session = createTestSession();
    session.start();
    session.submitCommand('debugpanel inventory');
    session.submitCommand('save panelslot');

    const reloadedSession = createTestSession();
    reloadedSession.start();
    const response = reloadedSession.submitCommand('load panelslot');

    assert.match(response, /game loaded from slot "panelslot"/i);
    assert.equal(reloadedSession.getInterfaceModel().panels.find(panel => panel.id === 'inventory')?.unlocked, true);
  } finally {
    restoreStorage();
  }
});

test('inventory panel unlocks naturally after Ilex contact and enough collected items', () => {
  const session = createTestSession();

  session.start();
  session.worldState.metaState.shownHackerIds = ['first-contact'];

  session.submitCommand('north');
  session.submitCommand('take cloak');
  assert.equal(session.worldState.isPanelUnlocked('inventory'), false);

  session.submitCommand('north');
  session.submitCommand('give invitation to oggaf');
  session.submitCommand('north');
  session.submitCommand('north');
  session.submitCommand('east');
  session.submitCommand('search vanity');
  session.submitCommand('take wax plug');
  assert.equal(session.worldState.isPanelUnlocked('inventory'), false);

  session.submitCommand('shake hand');
  session.submitCommand('north');
  session.submitCommand('take memory folder');

  assert.equal(session.worldState.isPanelUnlocked('inventory'), true);
  assert.match(session.submitCommand('inventory'), /invitation|red cloak|wax plug|memory folder/i);
});

test('map panel unlocks naturally after Ilex contact and enough room movement', () => {
  const session = createTestSession();

  session.start();
  session.worldState.metaState.shownHackerIds = ['first-contact'];

  session.submitCommand('north');
  session.submitCommand('north');
  session.submitCommand('give invitation to oggaf');
  session.submitCommand('west');
  session.submitCommand('east');
  session.submitCommand('north');
  session.submitCommand('east');

  assert.equal(session.worldState.currentRoomId, 'kitchen');
  assert.equal(session.worldState.isPanelUnlocked('map'), false);

  session.submitCommand('north');

  const mapPanel = session.getInterfaceModel().panels.find(panel => panel.id === 'map');
  assert.equal(session.worldState.currentRoomId, 'ogreBeds');
  assert.equal(mapPanel?.unlocked, true);
  assert.match(mapPanel?.lines.join('\n') ?? '', /Location: Ogre Beds/i);
});

test('memory panel unlocks naturally only after game over and dangerous-room reentry', () => {
  const session = createTestSession();

  moveToFeastHall(session);
  session.worldState.metaState.shownHackerIds = ['first-contact'];

  const gameOverResponse = session.submitCommand('tell oshregaal i will stay');
  assert.match(gameOverResponse, /run restarts/i);
  assert.equal(session.worldState.getFlag('hasExperiencedGameOver'), true);
  assert.equal(session.worldState.isPanelUnlocked('memory'), false);

  session.submitCommand('north');
  session.submitCommand('north');
  session.submitCommand('give invitation to oggaf');
  assert.equal(session.worldState.isPanelUnlocked('memory'), false);

  session.submitCommand('north');

  assert.equal(session.worldState.currentRoomId, 'feastHall');
  assert.equal(session.worldState.getFlag('memoryBusExposed'), true);
  assert.equal(session.worldState.isPanelUnlocked('memory'), true);
  assert.match(session.submitCommand('help'), /scan, peek, and poke/i);
});

test('restart resets the run while preserving unlocked panels and clearing degradation', () => {
  const session = createTestSession();

  moveToGrandfatherRoom(session);
  session.submitCommand('take wax plug');
  session.submitCommand('debugpanel memory');
  session.worldState.degradePanel('memory', 'static');

  const response = session.submitCommand('restart');

  assert.match(response, /run restarted|fresh run/i);
  assert.equal(session.worldState.currentRoomId, 'cavern');
  assert.equal(session.worldState.turns, 0);
  assert.equal(session.worldState.findInventoryItem('wax plug'), null);
  assert.equal(session.worldState.getPanelState('memory')?.unlocked, true);
  assert.equal(session.worldState.getPanelState('memory')?.degraded, null);
  assert.match(session.submitCommand('help'), /scan, peek, and poke/i);
});

test('agreeing to stay with Oshregaal causes a restartable game over', () => {
  const session = createTestSession();

  moveToFeastHall(session);
  const response = session.submitCommand('tell oshregaal i will stay');
  const messages = session.consumePendingMetaMessages();

  assert.match(response, /one course becomes another/i);
  assert.match(response, /run restarts/i);
  assert.equal(session.worldState.currentRoomId, 'cavern');
  assert.equal(session.worldState.getFlag('routineGameOverSeen'), true);
  assert.equal(messages.length, 3);
  assert.equal(messages[0].id, 'maraRoutineGameOverJ1');
  assert.equal(messages[1].id, 'kellanRoutineGameOverJ1');
  assert.equal(messages[2].id, 'ilexRoutineGameOverJ1');
});

test('sleeping in Oshregaal\'s bed causes a restartable game over', () => {
  const session = createTestSession();

  moveToGrandfatherRoom(session);
  const response = session.submitCommand('sleep bed');

  assert.match(response, /velvet accepts you too easily/i);
  assert.match(response, /run restarts/i);
  assert.equal(session.worldState.currentRoomId, 'cavern');
});

test('sitting in the correction chair causes a restartable game over', () => {
  const session = createTestSession();

  moveToSealedRoom(session);
  const response = session.submitCommand('sit chair');

  assert.match(response, /chair receives you with practiced efficiency/i);
  assert.match(response, /run restarts/i);
  assert.equal(session.worldState.currentRoomId, 'cavern');
});

test('drinking black-wind sap causes a restartable game over', () => {
  const session = createTestSession();

  moveToBlackWindTreeChamber(session);
  const response = session.submitCommand('drink sap');

  assert.match(response, /sap hits your tongue/i);
  assert.match(response, /run restarts/i);
  assert.equal(session.worldState.currentRoomId, 'cavern');
});

test('sleeping ogres rotate their tell brush-offs', () => {
  const session = createTestSession();

  moveToKitchen(session);
  session.submitCommand('north');

  const firstResponse = session.submitCommand('tell ogres hello');
  const secondResponse = session.submitCommand('tell ogres hello');
  const thirdResponse = session.submitCommand('tell ogres hello');

  assert.notEqual(firstResponse, secondResponse);
  assert.notEqual(secondResponse, thirdResponse);
  assert.match(firstResponse, /drowsy snort|single eye|blanket-haunted grunt/i);
  assert.match(secondResponse, /drowsy snort|single eye|blanket-haunted grunt/i);
  assert.match(thirdResponse, /drowsy snort|single eye|blanket-haunted grunt/i);
});

test('map panel renders discovered rooms as connected room boxes with a location label', () => {
  const session = createTestSession();

  session.start();
  session.submitCommand('north');
  session.submitCommand('north');
  session.submitCommand('debugpanel map');

  const mapPanel = session.getInterfaceModel().panels.find(panel => panel.id === 'map');
  const mapText = mapPanel?.lines.join('\n') ?? '';

  assert.equal(mapPanel?.unlocked, true);
  assert.match(mapText, /\+--\+/);
  assert.match(mapText, /\|CA\|/);
  assert.match(mapText, /\|GS\|/);
  assert.match(mapText, /\|FO\|/);
  assert.match(mapText, /\|/);
  assert.match(mapText, /Location: Foyer/);
  assert.equal(mapPanel?.currentRoomBox?.width, 4);
  assert.equal(mapPanel?.currentRoomBox?.height, 3);
  assert.ok((mapPanel?.currentRoomBox?.left ?? -1) >= 0);
  assert.ok((mapPanel?.currentRoomBox?.top ?? -1) >= 0);
});

test('map panel prefers authored room coordinates over pure exit inference', () => {
  const session = createTestSession();

  moveToGuestWing(session);
  session.submitCommand('debugpanel map');

  const mapPanel = session.getInterfaceModel().panels.find(panel => panel.id === 'map');
  const foyerBox = mapPanel?.roomBoxes?.foyer;
  const guestRoomBox = mapPanel?.roomBoxes?.guestRoom;

  assert.ok(foyerBox);
  assert.ok(guestRoomBox);
  assert.equal(mapPanel?.unlocked, true);
  assert.ok((guestRoomBox?.left ?? -1) > (foyerBox?.left ?? -1));
});

test('memory panel renders an unlabeled flag bit-grid with byte-style addresses', () => {
  const session = createTestSession();

  session.start();
  session.submitCommand('debugpanel memory');

  const memoryPanel = session.getInterfaceModel().panels.find(panel => panel.id === 'memory');
  const memoryText = memoryPanel?.lines.join('\n') ?? '';

  assert.equal(memoryPanel?.unlocked, true);
  assert.match(memoryText, /0\s+1\s+2\s+3\s+4\s+5\s+6\s+7/);
  assert.match(memoryText, /0x0000/);
  assert.match(memoryText, /##|\[\]/);
  assert.doesNotMatch(memoryText, /hasInvitation|foyerAdmitted|plumFound/);
});

test('memory flag locations resolve to stable hidden system flags', () => {
  const session = createTestSession();

  const entries = session.worldState.getMemoryFlagEntries();
  const hiddenEntry = entries.find(entry => entry.flagName === 'exitPermissionGranted');

  assert.ok(hiddenEntry);
  assert.equal(hiddenEntry?.value, false);
  assert.equal(
    session.worldState.getMemoryFlagByLocation(hiddenEntry?.address, hiddenEntry?.bit),
    'exitPermissionGranted',
  );
});

test('scan and peek expose the memory bus without revealing flag labels', () => {
  const session = createTestSession();

  session.start();
  session.submitCommand('debugpanel memory');

  const scanResponse = session.submitCommand('scan');
  assert.match(scanResponse, /0x0000/);
  assert.match(scanResponse, /0\s+1\s+2\s+3\s+4\s+5\s+6\s+7/);
  assert.equal(session.worldState.getFlag('memoryBusExposed'), true);
  assert.equal(session.worldState.turns, 0);

  const firstEntry = session.worldState.getMemoryFlagEntries()[0];
  const peekResponse = session.submitCommand(`peek ${session.worldState.formatMemoryAddress(firstEntry.address)} ${firstEntry.bit}`);
  assert.match(peekResponse, /0x0000\.[0-7] (##|\[\])/);
  assert.doesNotMatch(peekResponse, /hasInvitation|foyerAdmitted/);
  assert.equal(session.worldState.turns, 0);
});

test('poke can flip hidden system flags and unlock injected overlays', () => {
  const session = createTestSession();

  session.start();
  session.submitCommand('debugpanel memory');

  const mapEntry = session.worldState.getMemoryFlagEntries().find(entry => entry.flagName === 'mapOverlayInjected');
  assert.ok(mapEntry);

  const response = session.submitCommand(`poke ${session.worldState.formatMemoryAddress(mapEntry.address)} ${mapEntry.bit} set`);
  assert.match(response, /=> ##/);
  assert.equal(session.worldState.getFlag('mapOverlayInjected'), true);
  assert.equal(session.getInterfaceModel().panels.find(panel => panel.id === 'map')?.unlocked, true);
  assert.equal(session.worldState.turns, 0);
});

test('poke rejects writes to normal story flags', () => {
  const session = createTestSession();

  session.start();
  session.submitCommand('debugpanel memory');

  const storyEntry = session.worldState.getMemoryFlagEntries().find(entry => entry.flagName === 'hasInvitation');
  assert.ok(storyEntry);

  const response = session.submitCommand(`poke ${session.worldState.formatMemoryAddress(storyEntry.address)} ${storyEntry.bit}`);
  assert.match(response, /read-only/i);
  assert.equal(session.worldState.getFlag('hasInvitation'), true);
  assert.equal(session.worldState.turns, 0);
});