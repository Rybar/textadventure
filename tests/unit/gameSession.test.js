import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createTestSession,
  installMockLocalStorage,
  moveToFoyer,
  moveToFeastHall,
  moveToGuestWing,
} from '../helpers/testSession.js';

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