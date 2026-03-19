import { createGameEventDefinitions } from './events.js';
import { createGameMapDefinition } from './mapLayout.js';
import { createInvitation } from './items/invitation.js';
import { createMetaGameContent } from './meta game/messages.js';
import { createGameParserOptions, createGameVerbs } from './rules/verbs.js';
import { createAlchemyStockroom } from './rooms/alchemyStockroom.js';
import { createBlackWindTreeChamber } from './rooms/blackWindTreeChamber.js';
import { createBathroomRoom } from './rooms/bathroom.js';
import { createCavernRoom } from './rooms/cavern.js';
import { createCesspoolRoom } from './rooms/cesspool.js';
import { createFeastHall } from './rooms/feastHall.js';
import { createFernGardenRoom } from './rooms/fernGarden.js';
import { createFishingShackRoom } from './rooms/fishingShack.js';
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
import { createPitLedgeRoom } from './rooms/pitLedge.js';
import { createSecretCircleRoom } from './rooms/secretCircle.js';
import { createSealedRoom } from './rooms/sealedRoom.js';
import { createSittingRoom } from './rooms/sittingRoom.js';
import { createSpiderRoom } from './rooms/spiderRoom.js';
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
  const blackWindTreeChamber = createBlackWindTreeChamber();
  const bathroom = createBathroomRoom();
  const library = createLibraryRoom();
  const cesspool = createCesspoolRoom();
  const fishingShack = createFishingShackRoom();
  const ogreBeds = createOgreBedsRoom();
  const pitLedge = createPitLedgeRoom();
  const plumRoom = createPlumRoom();
  const foldedHallway = createFoldedHallwayRoom();
  const trophyRoom = createTrophyRoom();
  const tunnel = createTunnelRoom();
  const metaGame = createMetaGameContent();
  const events = createGameEventDefinitions();
  const map = createGameMapDefinition();
  const secretCircle = createSecretCircleRoom();
  const sealedRoom = createSealedRoom();
  const spiderRoom = createSpiderRoom();

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
      foyerThresholdTested: false,
      metOshregaal: false,
      admittedToFeast: false,
      hostContactEstablished: false,
      insultedOshregaal: false,
      agreedToStay: false,
      feastStarted: false,
      feastBloodRequested: false,
      gaveBlood: false,
      bloodRefused: false,
      oshregaalSuspicious: false,
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
      kitchenTimingKnown: false,
      kitchenSabotageOpportunityKnown: false,
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
      nathemaRouteKnowledgeShared: false,
      nathemaTextsShared: false,
      nathemaEscapeDealSecured: false,
      servantApronWorn: false,
      greyGrinLeadKnown: false,
      trophyRoomUnlocked: false,
      spiderRoomFound: false,
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
      waxPlugReadied: false,
      plumMaintenanceNotesKnown: false,
      oshregaalNoDepartureKnown: false,
      plumFound: false,
      plumTrustEarned: false,
      plumMemoryRead: false,
      plumNatureUnderstood: false,
      plumBladeKnown: false,
      plumBladeRevealed: false,
      plumSilvermountHintSeen: false,
      plumLampLit: false,
      plumEscapePlanned: false,
      libraryRouteKnown: false,
      foldedHallwaySeen: false,
      foldedHallwayUnderstood: false,
      portalBypassLearned: false,
      spellbooksSecured: false,
      idolPairingKnown: false,
      foldedHallwayUnlocked: false,
      tunnelRouteKnown: false,
      plumTunnelRouteReady: false,
      plumFollowing: false,
      plumRescued: false,
      plumEscapeAlarmed: false,
      plumAllianceSecured: false,
      blackWindEvidenceLeadKnown: false,
      blackWindSourceLeadKnown: false,
      alchemyStockroomFound: false,
      blackWindStockroomSearched: false,
      blackWindLedgerRead: false,
      blackWindEvidenceCollected: false,
      blackWindTreePassageFound: false,
      blackWindTreeFound: false,
      blackWindFruitConsumed: false,
      blackWindElixirConsumed: false,
      blackWindTreeCalmed: false,
      blackWindTreeSabotaged: false,
      escapedMansion: false,
      strongerEscapeSecured: false,
      absorbedIntoRoutine: false,
      oshregaalAssassinationAttempted: false,
      oshregaalWounded: false,
      chariadulschaMet: false,
      spiderPromiseMade: false,
      spiderTruthClaimed: false,
      spiderDebtPending: false,
      spiderDebtResolved: false,
      oshregaalWeaknessKnown: false,
      sealedRoomLeadKnown: false,
      sealedRoomUnlocked: false,
      sealedRoomEntered: false,
      containmentProtocolKnown: false,
      correctionBellCodeKnown: false,
      butlerDiversionActive: false,
      shackSearched: false,
      eastRunoffNoted: false,
      bathroomRouteKnown: false,
      bathroomPanelOpened: false,
      cesspoolEntered: false,
      slorumMet: false,
      slorumFlattered: false,
      slorumGifted: false,
      cesspoolCrossingSafe: false,
      shellContactAcknowledged: false,
      mapOverlayInjected: false,
      inventoryOverlayInjected: false,
      memoryBusExposed: false,
      exitPermissionGranted: false,
      containmentOverride: false,
      operatorAuthorityShifted: false,
      subjectDesignationRecovered: false,
    },
    rooms: {
      bathroom,
      cavern,
      cesspool,
      fernGarden,
      fishingShack,
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
      blackWindTreeChamber,
      library,
      ogreBeds,
      pitLedge,
      plumRoom,
      sealedRoom,
      foldedHallway,
      spiderRoom,
      trophyRoom,
      tunnel,
      secretCircle,
    },
  };
}

export default createGameManifest;