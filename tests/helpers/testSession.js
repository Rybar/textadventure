import { GameSession } from '../../js/engine/world/gameSession.js';
import { createGameManifest } from '../../js/game/manifest.js';

export function installMockLocalStorage() {
  const originalDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  const store = new Map();
  const mockStorage = {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
  };

  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    enumerable: true,
    value: mockStorage,
    writable: true,
  });

  return () => {
    if (originalDescriptor) {
      Object.defineProperty(globalThis, 'localStorage', originalDescriptor);
      return;
    }

    delete globalThis.localStorage;
  };
}

export function createTestSession() {
  return new GameSession(createGameManifest);
}

export function moveToFoyer(session) {
  session.start();
  session.submitCommand('north');
  session.submitCommand('north');
}

export function admitAtFoyer(session) {
  moveToFoyer(session);
  session.submitCommand('give invitation to oggaf');
}

export function moveToFeastHall(session) {
  admitAtFoyer(session);
  session.submitCommand('north');
}

export function moveToGuestWing(session) {
  admitAtFoyer(session);
  session.submitCommand('up');
}

export function moveToKitchen(session) {
  moveToFeastHall(session);
  session.submitCommand('east');
}

export function moveToAlchemyStockroom(session) {
  moveToKitchen(session);
  session.submitCommand('ask wrongus about black wind');
  session.submitCommand('search shelf');
  session.submitCommand('east');
}

export function moveToGrandfatherRoom(session) {
  moveToFeastHall(session);
  session.submitCommand('north');
  session.submitCommand('east');
}

export function moveToPlumRoom(session) {
  moveToGrandfatherRoom(session);
  session.submitCommand('shake hand');
  session.submitCommand('north');
}

export function moveToLibrary(session) {
  moveToPlumRoom(session);
  session.submitCommand('east');
}

export function moveToFoldedHallway(session) {
  moveToLibrary(session);
  session.submitCommand('north');
}

export function moveToTunnel(session) {
  moveToLibrary(session);
  session.submitCommand('take meditative incense');
  session.submitCommand('take wax palm');
  session.submitCommand('north');
  session.submitCommand('use wax palm on idol');
  session.submitCommand('north');
}

export function preparePlumTunnelRoute(session) {
  moveToTunnel(session);
  session.submitCommand('light incense');
}