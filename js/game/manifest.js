import { createGameEventDefinitions } from './events.js';
import { createGameMapDefinition } from './mapLayout.js';
import { createInvitation } from './items/invitation.js';
import { createMetaGameContent } from './meta game/messages.js';
import { createGameParserOptions, createGameVerbs } from './rules/verbs.js';
import { createAlchemyStockroom } from './rooms/alchemyStockroom.js';
import { createCavernRoom } from './rooms/cavern.js';
import { createFeastHall } from './rooms/feastHall.js';
import { createFernGardenRoom } from './rooms/fernGarden.js';
import { createFoyerRoom } from './rooms/foyer.js';
import { createGrandfatherRoom } from './rooms/grandfatherRoom.js';
import { createGrandStairsRoom } from './rooms/grandStairs.js';
import { createGuestRoom } from './rooms/guestRoom.js';
import { createKelagoRoom } from './rooms/kelagoRoom.js';
import { createKitchenRoom } from './rooms/kitchen.js';
import { createLibraryRoom } from './rooms/library.js';
import { createNathemaRoom } from './rooms/nathemaRoom.js';
import { createOgreBedsRoom } from './rooms/ogreBeds.js';
import { createPlumRoom } from './rooms/plumRoom.js';
import { createSecretCircleRoom } from './rooms/secretCircle.js';
import { createSittingRoom } from './rooms/sittingRoom.js';
import { createFoldedHallwayRoom } from './rooms/foldedHallway.js';
import { createTrophyRoom } from './rooms/trophyRoom.js';
import { createTunnelRoom } from './rooms/tunnel.js';

export function createGameManifest() {
  const cavern = createCavernRoom();
  const fernGarden = createFernGardenRoom();
  const grandStairs = createGrandStairsRoom();
  const foyer = createFoyerRoom();
  const grandfatherRoom = createGrandfatherRoom();
  const sittingRoom = createSittingRoom();
  const guestRoom = createGuestRoom();
  const nathemaRoom = createNathemaRoom();
  const feastHall = createFeastHall();
  const kelagoRoom = createKelagoRoom();
  const kitchen = createKitchenRoom();
  const alchemyStockroom = createAlchemyStockroom();
  const library = createLibraryRoom();
  const ogreBeds = createOgreBedsRoom();
  const plumRoom = createPlumRoom();
  const foldedHallway = createFoldedHallwayRoom();
  const trophyRoom = createTrophyRoom();
  const tunnel = createTunnelRoom();
  const metaGame = createMetaGameContent();
  const events = createGameEventDefinitions();
  const map = createGameMapDefinition();
  const secretCircle = createSecretCircleRoom();

  return {
    id: 'meal-of-oshregaal',
    title: 'The Meal of Oshregaal',
    startingRoomId: 'cavern',
    startingInventory: [createInvitation()],
    parserOptions: createGameParserOptions(),
    verbs: createGameVerbs(),
    metaGame,
    events,
    map,
    ui: {
      panels: {
        map: {
          title: 'MAP',
        },
        inventory: {
          title: 'INVENTORY',
        },
        memory: {
          title: 'MEMORY',
        },
      },
    },
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
      fernCulvertNoticed: false,
      pitRouteHintKnown: false,
      guestBellRung: false,
      kitchenBloodHintKnown: false,
      cavernWindowRouteKnown: false,
      sittingRoomWaterTasted: false,
      sittingRoomGossipKnown: false,
      folioMarginNoted: false,
      foyerSurveillanceNoticed: false,
      feastGuestPatternKnown: false,
      ogreRosterKnown: false,
      nathemaMet: false,
      nathemaBargained: false,
      nathemaContrabandKnown: false,
      nathemaEvidenceShown: false,
      nathemaBlackWindSampleDelivered: false,
      greyGrinLeadKnown: false,
      trophyRoomUnlocked: false,
      greyGrinShownToNathema: false,
      greyGrinDeliveredToNathema: false,
      greyGrinShownToPlum: false,
      greyGrinShownToOshregaal: false,
      foundTeleportCircle: false,
      hasTeleportScroll: false,
      secretCircleUnlocked: false,
      escapeRouteUnlocked: false,
      metalHandDoorUnlocked: false,
      waxPlugFound: false,
      plumFound: false,
      plumTrustEarned: false,
      plumMemoryRead: false,
      plumEscapePlanned: false,
      libraryRouteKnown: false,
      foldedHallwaySeen: false,
      foldedHallwayUnderstood: false,
      idolPairingKnown: false,
      foldedHallwayUnlocked: false,
      tunnelRouteKnown: false,
      plumTunnelRouteReady: false,
      plumFollowing: false,
      plumRescued: false,
      plumEscapeAlarmed: false,
      plumAllianceSecured: false,
      blackWindEvidenceLeadKnown: false,
      alchemyStockroomFound: false,
      blackWindStockroomSearched: false,
      blackWindLedgerRead: false,
      blackWindEvidenceCollected: false,
      blackWindFruitConsumed: false,
      blackWindElixirConsumed: false,
    },
    rooms: {
      cavern,
      fernGarden,
      grandStairs,
      foyer,
      sittingRoom,
      guestRoom,
      nathemaRoom,
      feastHall,
      kelagoRoom,
      grandfatherRoom,
      kitchen,
      alchemyStockroom,
      library,
      ogreBeds,
      plumRoom,
      foldedHallway,
      trophyRoom,
      tunnel,
      secretCircle,
    },
  };
}

export default createGameManifest;