import { createInvitation } from './items/invitation.js';
import { createMetaGameContent } from './meta game/messages.js';
import { createGameParserOptions, createGameVerbs } from './rules/verbs.js';
import { createCavernRoom } from './rooms/cavern.js';
import { createFeastHall } from './rooms/feastHall.js';
import { createFernGardenRoom } from './rooms/fernGarden.js';
import { createFoyerRoom } from './rooms/foyer.js';
import { createGrandStairsRoom } from './rooms/grandStairs.js';
import { createGuestRoom } from './rooms/guestRoom.js';
import { createKelagoRoom } from './rooms/kelagoRoom.js';
import { createKitchenRoom } from './rooms/kitchen.js';
import { createSecretCircleRoom } from './rooms/secretCircle.js';
import { createSittingRoom } from './rooms/sittingRoom.js';

export function createGameManifest() {
  const cavern = createCavernRoom();
  const fernGarden = createFernGardenRoom();
  const grandStairs = createGrandStairsRoom();
  const foyer = createFoyerRoom();
  const sittingRoom = createSittingRoom();
  const guestRoom = createGuestRoom();
  const feastHall = createFeastHall();
  const kelagoRoom = createKelagoRoom();
  const kitchen = createKitchenRoom();
  const metaGame = createMetaGameContent();
  const secretCircle = createSecretCircleRoom();

  return {
    id: 'meal-of-oshregaal',
    title: 'The Meal of Oshregaal',
    startingRoomId: 'cavern',
    startingInventory: [createInvitation()],
    parserOptions: createGameParserOptions(),
    verbs: createGameVerbs(),
    metaGame,
    flags: {
      hasInvitation: true,
      foyerAdmitted: false,
      metOshregaal: false,
      feastStarted: false,
      gaveBlood: false,
      impSuspicious: false,
      impHelpOffered: false,
      impHandshakeHintKnown: false,
      kelagoMet: false,
      kelagoPraised: false,
      kelagoHandshakeHintKnown: false,
      kitchenAccessGranted: false,
      foundTeleportCircle: false,
      hasTeleportScroll: false,
      secretCircleUnlocked: false,
      escapeRouteUnlocked: false,
    },
    rooms: {
      cavern,
      fernGarden,
      grandStairs,
      foyer,
      sittingRoom,
      guestRoom,
      feastHall,
      kelagoRoom,
      kitchen,
      secretCircle,
    },
  };
}

export default createGameManifest;