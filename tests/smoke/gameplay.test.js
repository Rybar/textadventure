import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createTestSession,
  moveToAlchemyStockroom,
  moveToBathroom,
  moveToBlackWindTreeChamber,
  moveToCesspool,
  moveToFeastHall,
  moveToFoyer,
  moveToGrandfatherRoom,
  moveToGuestWing,
  moveToNathemaRoom,
  moveToKitchen,
  moveToLibrary,
  moveToTrophyRoom,
  moveToSpiderRoom,
  moveToSealedRoom,
  moveToPlumRoom,
  moveToFoldedHallway,
  moveToTunnel,
  preparePlumTunnelRoute,
} from '../helpers/testSession.js';

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
  assert.match(session.submitCommand('look'), /performs ordinary comfort with suspicious discipline|assembled to look restful/i);
  assert.match(session.submitCommand('open chest'), /empty except for cedar shavings/i);
  assert.match(session.submitCommand('read guest card'), /Ring once for comfort/i);
  assert.match(session.submitCommand('pull on bell pull'), /Somewhere deep in the house, a polite bell answers once/i);
  assert.equal(session.worldState.getFlag('guestBellRung'), true);
  assert.match(session.submitCommand('look'), /starts feeling managed|answers on its own schedule/i);
});

test('kitchen and secret circle interactions deepen the escape thread', () => {
  const session = createTestSession();

  moveToFeastHall(session);
  assert.match(session.submitCommand('east'), /Wrongus holds dominion here/i);
  assert.match(session.submitCommand('look'), /brute competence|forcing impossible ingredients to accept hierarchy/i);
  assert.match(session.submitCommand('ask wrongus about blood'), /tiny red gentleman stand up in the pot/i);
  assert.equal(session.worldState.getFlag('kitchenBloodHintKnown'), true);
  assert.match(session.submitCommand('look'), /ritual workshop that happens to smell delicious|less like a cookspace/i);
  assert.match(session.submitCommand('search stew'), /darker red film|reducing more than broth/i);
  assert.match(session.submitCommand('ask wrongus about timing'), /blood by the silver scrape|sequence stumbles/i);
  assert.equal(session.worldState.getFlag('kitchenTimingKnown'), true);
  assert.match(session.submitCommand('wait'), /kitchen keeps exact time|You wait for a moment/i);
  assert.match(session.submitCommand('look'), /stage-managing a belief system|ordered courses and hidden cues/i);
  assert.match(session.submitCommand('search prep table'), /laid out in a strict sequence|stage marks/i);
  assert.match(session.submitCommand('sabotage stew'), /delay the silver cups|turn Wrongus from cook into alarm/i);
  assert.equal(session.worldState.getFlag('kitchenSabotageOpportunityKnown'), true);
  assert.match(session.submitCommand('look'), /meal's weak points|manufactured line by line/i);

  assert.match(session.submitCommand('west'), /immense dinner table dominates/i);
  assert.match(session.submitCommand('tell imp help'), /which piece of this room still remembers how to open/i);
  assert.match(session.submitCommand('ask imp about curtains'), /hidden brass hand/i);
  assert.match(session.submitCommand('shake hand'), /hidden brass hand sewn into the curtain folds/i);
  assert.match(session.submitCommand('west'), /hidden chamber lies behind heavy red curtains/i);
  assert.match(session.submitCommand('look'), /concealed answer|older than the feast/i);
  assert.match(session.submitCommand('search bookshelf'), /borrowed road dressed in newer chalk|activation only wakes the prepared route/i);
  assert.match(session.submitCommand('take road annotation'), /you take the road annotation/i);
  assert.match(session.submitCommand('read road annotation'), /borrowed road, not a sovereign gate|activation opens the prepared route only/i);
  assert.equal(session.worldState.getFlag('portalBypassLearned'), true);
  assert.match(session.submitCommand('wait'), /difference between activation and bypass|You wait for a moment/i);
  assert.match(session.submitCommand('look'), /precise instrument embedded in a larger threshold problem|starts reading as a precise instrument/i);
  assert.match(session.submitCommand('ask skulls about bypass'), /HOST KEEPS ACTIVATION HERE|BYPASS LIVES IN THE INSULT/i);
  assert.match(session.submitCommand('read scroll'), /floor-runes brighten|one prepared road/i);
  assert.equal(session.worldState.getFlag('escapeRouteUnlocked'), true);
  assert.match(session.submitCommand('look'), /dormant apparatus to live route|narrow, conditional, and dangerous/i);
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
  assert.match(session.submitCommand('look'), /holding space dressed in comfort|waiting feel like a choice/i);
  assert.match(session.submitCommand('search folios'), /butlers hear the bell before they hear the guest/i);
  assert.equal(session.worldState.getFlag('folioMarginNoted'), true);
  assert.match(session.submitCommand('look'), /starts being social in a deeply household way|whispers, side-comments/i);
  assert.match(session.submitCommand('drink fountain'), /obedience might not be the worst thing/i);
  assert.equal(session.worldState.getFlag('sittingRoomWaterTasted'), true);
  assert.match(session.submitCommand('wait'), /memory of the fountain water lingers|You wait for a moment/i);

  assert.match(session.submitCommand('east'), /foyer is all red carpet/i);
  assert.match(session.submitCommand('give invitation to oggaf'), /proceed as a guest|accepted/i);
  assert.match(session.submitCommand('north'), /immense dinner table dominates/i);
  assert.equal(session.worldState.getFlag('admittedToFeast'), true);
  assert.equal(session.worldState.getFlag('feastBloodRequested'), true);
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
  assert.equal(session.worldState.getFlag('hostContactEstablished'), true);
  assert.match(session.submitCommand('ask oshregaal about house'), /flatter its owner, intimidate its rivals/i);
  assert.match(session.submitCommand('ask imp about chain'), /decorative slavery/i);
  assert.match(session.submitCommand('look'), /performance adjusting itself around a newly interesting guest|turned enough of his attention/i);
});

test('feast hall tracks blood refusal and sharper host scrutiny', () => {
  const session = createTestSession();

  moveToFeastHall(session);
  assert.equal(session.worldState.getFlag('admittedToFeast'), true);
  assert.equal(session.worldState.getFlag('feastBloodRequested'), true);

  assert.match(session.submitCommand('tell oshregaal i refuse blood'), /declines the table|keep the blood/i);
  assert.equal(session.worldState.getFlag('hostContactEstablished'), true);
  assert.equal(session.worldState.getFlag('bloodRefused'), true);
  assert.equal(session.worldState.getFlag('oshregaalSuspicious'), true);

  assert.match(session.submitCommand('ask oshregaal about blood'), /guest may refuse a course|what sort of hunger/i);
  assert.match(session.submitCommand('ask imp about escape'), /He heard that|curtains may start looking like architecture/i);
  assert.match(session.submitCommand('wait'), /nearest guests discover sudden fascinations in their plates|You wait for a moment/i);
  assert.match(session.submitCommand('look'), /silver cup keeps circling without you now|no longer being treated as background/i);
});

test('kelago clue path can unlock the secret circle handshake puzzle', () => {
  const session = createTestSession();

  moveToFeastHall(session);
  session.submitCommand('north');
  assert.match(session.submitCommand('search workspace'), /eye-bound spellbook|wizard ink|studio tour/i);
  assert.match(session.submitCommand('tell kelago your work is beautiful'), /kind and accurate/i);
  assert.match(session.submitCommand('ask kelago about brother'), /glutton, a genius, a sentimentalist/i);
  assert.match(session.submitCommand('ask kelago about spellbook'), /Domestic biomancy|threshold etiquette/i);
  assert.match(session.submitCommand('ask kelago about library'), /thresholds, folded corridors|escape more than beauty/i);
  assert.match(session.submitCommand('ask kelago about curtains'), /brass hand/i);
  assert.match(session.submitCommand('take spellbook'), /you take the spellbook|stolen text/i);
  assert.equal(session.worldState.getFlag('spellbooksSecured'), true);
  assert.match(session.submitCommand('read spellbook'), /controlled threshold etiquette|bodies are simpler than doors/i);

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
  assert.match(secondSession.submitCommand('look'), /occupied embassy suite|evaluate visitors before granting them the dignity of relevance/i);
  assert.match(secondSession.submitCommand('search chest'), /wrapped in diplomatic cloth but weighted like contraband/i);
  assert.equal(secondSession.worldState.getFlag('nathemaContrabandKnown'), true);
  assert.match(secondSession.submitCommand('look'), /forward position for private policy|contraband chest is noticed/i);
  assert.match(secondSession.submitCommand('ask nathema about black wind'), /Bring me anything from the black wind line/i);
  assert.equal(secondSession.worldState.getFlag('nathemaBargained'), true);
  assert.match(secondSession.submitCommand('look'), /openly transactional|travels with contingencies instead of comforts/i);
  assert.match(secondSession.submitCommand('tell nathema about escape'), /stop treating departure as a confession/i);
  assert.match(secondSession.submitCommand('look'), /openly transactional|travels with contingencies instead of comforts/i);
});

test('the deeper private rooms now introduce Plum and the rescue branch', () => {
  const session = createTestSession();

  moveToGrandfatherRoom(session);
  assert.match(session.submitCommand('search desk'), /guest-retention notes|move them deeper into the house/i);
  assert.equal(session.worldState.getFlag('plumMaintenanceNotesKnown'), true);
  assert.equal(session.worldState.getFlag('oshregaalNoDepartureKnown'), true);
  assert.match(session.submitCommand('look at mirror'), /filing system for captivity|another guest being arranged|incriminates/i);
  assert.match(session.submitCommand('search vanity'), /wrapped plug of dark ear wax/i);
  assert.equal(session.worldState.getFlag('waxPlugFound'), true);
  assert.match(session.submitCommand('search bed'), /warning dressed as luxury|making objections horizontal|silk ties/i);
  assert.match(session.submitCommand('use wax plug'), /voices would have to work harder/i);
  assert.match(session.submitCommand('north'), /iron hand waits upright/i);
  assert.match(session.submitCommand('shake hand'), /inside the wall, hidden catches withdraw/i);
  assert.equal(session.worldState.getFlag('metalHandDoorUnlocked'), true);
  assert.match(session.submitCommand('north'), /smaller chamber has the careful plainness/i);
  assert.equal(session.worldState.getFlag('plumFound'), true);
  assert.match(session.submitCommand('look at plum'), /luminous lines|forearm/i);
  assert.match(session.submitCommand('ask plum about numerian'), /Numerian|Silvermount/i);
  assert.match(session.submitCommand('ask plum about escape'), /circle behind the curtains is real|folded hall/i);
  assert.match(session.submitCommand('read memory folder'), /Wax in one ear blunts the host-voice/i);
  assert.match(session.submitCommand('read memory folder'), /Silvermount|Left forearm seam/i);
  assert.equal(session.worldState.getFlag('plumMemoryRead'), true);
  assert.equal(session.worldState.getFlag('plumBladeKnown'), true);
  assert.match(session.submitCommand('tell plum i will get you out'), /read the folder\. keep the wax/i);
  assert.equal(session.worldState.getFlag('plumEscapePlanned'), true);
  assert.match(session.submitCommand('search plum'), /luminous lines|seam/i);
  assert.match(session.submitCommand('open seam'), /crystal blade nested inside her arm/i);
  assert.equal(session.worldState.getFlag('plumBladeRevealed'), true);
  assert.match(session.submitCommand('look at crystal blade'), /slim, clear|Silvermount/i);
  assert.match(session.submitCommand('use lamp'), /lamp wick up|faint lines beneath Plum's skin/i);
  assert.equal(session.worldState.getFlag('plumLampLit'), true);
  assert.match(session.submitCommand('use crystal blade on lamp'), /Silvermount|where someone expected this body to remember from/i);
  assert.equal(session.worldState.getFlag('plumSilvermountHintSeen'), true);

  const secondSession = createTestSession();
  moveToPlumRoom(secondSession);
  assert.match(secondSession.submitCommand('ask plum about wax'), /keep it\. when he speaks in the voice/i);
  assert.match(secondSession.submitCommand('ask plum about folder'), /write to the next version of myself/i);
  assert.match(secondSession.submitCommand('ask plum about silvermount'), /Silvermount|truer than anything Oshregaal tells me/i);
});

test('the library and folded hallway now extend the deep escape cluster', () => {
  const session = createTestSession();

  moveToLibrary(session);
  assert.equal(session.worldState.currentRoomId, 'library');
  assert.match(session.submitCommand('look'), /oppressive confidence|shelving his thoughts is the same as mastering them/i);
  assert.match(session.submitCommand('search shelves'), /obedient geometry|folded corridor|threshold spellbook/i);
  assert.equal(session.worldState.getFlag('libraryRouteKnown'), true);
  assert.match(session.submitCommand('look'), /usable categories: corridor, spellbook, fraud|starts sorting itself/i);
  assert.match(session.submitCommand('read geometry folio'), /paired living contact|competent fraud/i);
  assert.equal(session.worldState.getFlag('foldedHallwayUnderstood'), true);
  assert.equal(session.worldState.getFlag('portalBypassLearned'), true);
  assert.match(session.submitCommand('wait'), /feels less like scholarship and more like applied escape mathematics|You wait for a moment/i);
  assert.match(session.submitCommand('take threshold spellbook'), /you take the threshold spellbook|archive theft/i);
  assert.equal(session.worldState.getFlag('spellbooksSecured'), true);
  assert.match(session.submitCommand('look'), /feels newly vulnerable|prepared answers is gone from its shelf/i);
  assert.match(session.submitCommand('read threshold spellbook'), /threshold rites|better mathematics/i);
  assert.match(session.submitCommand('smell incense'), /cedar, dust, and the sort of disciplined breathing/i);

  assert.match(session.submitCommand('north'), /corridor beyond the library refuses to behave/i);
  assert.equal(session.worldState.currentRoomId, 'foldedHallway');
  assert.match(session.submitCommand('search hall'), /one hall folded around itself and pinned in place/i);
  assert.equal(session.worldState.getFlag('foldedHallwaySeen'), true);
  assert.match(session.submitCommand('search idol'), /two palms turned outward|answering living contact/i);
  assert.equal(session.worldState.getFlag('idolPairingKnown'), true);
  assert.match(session.submitCommand('touch idol'), /one hand is enough to prove the mechanism/i);
  assert.match(session.submitCommand('search hall'), /corridor is taking attendance|one hall folded around itself/i);

  const secondSession = createTestSession();
  moveToFoldedHallway(secondSession);
  assert.match(secondSession.submitCommand('look at idol'), /both hands extended to receive contact/i);
  assert.match(secondSession.submitCommand('south'), /Oshregaal's library is less a scholarly refuge/i);
});

test('the wax-palm workaround now unfolds the hall and reaches the tunnel route', () => {
  const session = createTestSession();

  moveToLibrary(session);
  assert.match(session.submitCommand('take meditative incense'), /you take the meditative incense/i);
  assert.match(session.submitCommand('take wax palm'), /you take the wax palm/i);
  assert.match(session.submitCommand('north'), /corridor beyond the library refuses to behave/i);
  assert.match(session.submitCommand('north'), /loops you back toward the idol/i);
  assert.equal(session.worldState.currentRoomId, 'foldedHallway');
  assert.match(session.submitCommand('use wax palm on idol'), /corridor shudders, reluctantly accepts the fraud/i);
  assert.equal(session.worldState.getFlag('foldedHallwayUnlocked'), true);
  assert.match(session.submitCommand('north'), /house gives way to older stone/i);
  assert.equal(session.worldState.currentRoomId, 'tunnel');
  assert.match(session.submitCommand('search roots'), /outer gardens and probably beyond|not yet a rescue route/i);
  assert.equal(session.worldState.getFlag('tunnelRouteKnown'), true);
  assert.match(session.submitCommand('light incense'), /roots loosen, the cold wind steadies/i);
  assert.equal(session.worldState.getFlag('plumTunnelRouteReady'), true);
  assert.match(session.submitCommand('search tunnel'), /route you could ask Plum to survive with you/i);

  const secondSession = createTestSession();
  moveToTunnel(secondSession);
  assert.match(secondSession.submitCommand('light incense'), /roots loosen, the cold wind steadies/i);
  assert.match(secondSession.submitCommand('search tunnel'), /route you could ask Plum to survive with you/i);
  assert.match(secondSession.submitCommand('south'), /corridor beyond the library refuses to behave/i);
  assert.match(secondSession.submitCommand('south'), /Oshregaal's library is less a scholarly refuge/i);
  assert.match(secondSession.submitCommand('west'), /smaller chamber has the careful plainness/i);
  assert.match(secondSession.submitCommand('ask plum about escape'), /tunnel may actually take us both/i);
  assert.match(secondSession.submitCommand('ask plum about help'), /stop planning and start leaving/i);
});

test('the player can commit Plum to the route and rescue her through the tunnel', () => {
  const session = createTestSession();

  preparePlumTunnelRoute(session);
  assert.match(session.submitCommand('south'), /corridor beyond the library refuses to behave/i);
  assert.match(session.submitCommand('south'), /Oshregaal's library is less a scholarly refuge/i);
  assert.match(session.submitCommand('west'), /smaller chamber has the careful plainness/i);
  assert.match(session.submitCommand('tell plum come now'), /let us be gone before the house remembers to keep me/i);
  assert.equal(session.worldState.getFlag('plumFollowing'), true);

  assert.match(session.submitCommand('east'), /Plum keeps close to the shelves/i);
  assert.match(session.submitCommand('north'), /house has begun to notice an absence|Plum stays just behind your shoulder/i);
  assert.match(session.submitCommand('north'), /Plum crouches beside the arch/i);
  assert.equal(session.worldState.getFlag('plumEscapeAlarmed'), true);

  assert.match(session.submitCommand('crawl tunnel'), /spills both of you into the feral garden/i);
  assert.equal(session.worldState.currentRoomId, 'fernGarden');
  assert.equal(session.worldState.getFlag('plumFollowing'), false);
  assert.equal(session.worldState.getFlag('plumRescued'), true);
  assert.match(session.submitCommand('look'), /Plum stands among the gnome statues/i);

  const secondSession = createTestSession();
  preparePlumTunnelRoute(secondSession);
  secondSession.submitCommand('south');
  secondSession.submitCommand('south');
  secondSession.submitCommand('west');
  assert.match(secondSession.submitCommand('tell plum follow me'), /let us be gone before the house remembers to keep me/i);
  secondSession.submitCommand('east');
  secondSession.submitCommand('north');
  secondSession.submitCommand('north');
  assert.match(secondSession.submitCommand('escape'), /spills both of you into the feral garden/i);
  assert.equal(secondSession.worldState.getFlag('plumRescued'), true);
});

test('rescued Plum can become an offstage ally and seed the evidence branch', () => {
  const session = createTestSession();

  preparePlumTunnelRoute(session);
  session.submitCommand('south');
  session.submitCommand('south');
  session.submitCommand('west');
  session.submitCommand('tell plum come now');
  session.submitCommand('east');
  session.submitCommand('north');
  session.submitCommand('north');
  assert.match(session.submitCommand('crawl tunnel'), /spills both of you into the feral garden/i);

  assert.match(session.submitCommand('ask plum about black wind'), /trade records are kept near the alchemical stock/i);
  assert.equal(session.worldState.getFlag('blackWindEvidenceLeadKnown'), true);
  assert.match(session.submitCommand('tell plum hide'), /let him lose me properly/i);
  assert.equal(session.worldState.getFlag('plumAllianceSecured'), true);
  assert.match(session.submitCommand('look'), /plum is gone from the open garden now/i);
});

test('the first black-wind evidence branch leads to a hidden stockroom and ledger', () => {
  const session = createTestSession();

  preparePlumTunnelRoute(session);
  session.submitCommand('south');
  session.submitCommand('south');
  session.submitCommand('west');
  session.submitCommand('tell plum come now');
  session.submitCommand('east');
  session.submitCommand('north');
  session.submitCommand('north');
  session.submitCommand('crawl tunnel');
  session.submitCommand('ask plum about black wind');
  session.submitCommand('tell plum hide');

  assert.match(session.submitCommand('southeast'), /vast natural cavern/i);
  assert.match(session.submitCommand('north'), /white marble stair/i);
  assert.match(session.submitCommand('north'), /foyer is all red carpet/i);
  assert.match(session.submitCommand('give invitation to oggaf'), /proceed as a guest|accepted/i);
  assert.match(session.submitCommand('north'), /immense dinner table dominates/i);
  assert.match(session.submitCommand('east'), /Wrongus holds dominion here/i);
  assert.match(session.submitCommand('search shelf'), /hidden stockroom|black-wind trade/i);
  assert.equal(session.worldState.getFlag('alchemyStockroomFound'), true);
  assert.match(session.submitCommand('east'), /hidden stockroom crouches behind the kitchen wall/i);
  assert.equal(session.worldState.currentRoomId, 'alchemyStockroom');
  assert.match(session.submitCommand('read black wind ledger'), /active trade book/i);
  assert.equal(session.worldState.getFlag('blackWindEvidenceCollected'), true);

  const secondSession = createTestSession();
  moveToAlchemyStockroom(secondSession);
  assert.equal(secondSession.worldState.currentRoomId, 'alchemyStockroom');
  assert.match(secondSession.submitCommand('read ledger'), /named houses and clan factors on the surface/i);
  assert.equal(secondSession.worldState.getFlag('blackWindEvidenceCollected'), true);
});

test('the stockroom contraband can be stolen or self-administered at a cost', () => {
  const session = createTestSession();

  moveToAlchemyStockroom(session);
  assert.match(session.submitCommand('take black wind fruit'), /you take the black wind fruit/i);
  assert.match(session.submitCommand('smell black wind fruit'), /storm passing over a pharmacy/i);
  assert.match(session.submitCommand('eat black wind fruit'), /thoughts feel dangerously well-aligned/i);
  assert.equal(session.worldState.getFlag('blackWindFruitConsumed'), true);
  assert.equal(session.worldState.getItemLocation('black-wind-fruit'), null);

  const secondSession = createTestSession();
  moveToAlchemyStockroom(secondSession);
  assert.match(secondSession.submitCommand('take black wind elixir'), /you take the black wind elixir/i);
  assert.match(secondSession.submitCommand('drink elixir'), /corruption for capability/i);
  assert.equal(secondSession.worldState.getFlag('blackWindElixirConsumed'), true);
  assert.equal(secondSession.worldState.getItemLocation('black-wind-elixir'), null);
});

test('Nathema turns black-wind evidence or contraband into immediate leverage', () => {
  const session = createTestSession();

  moveToAlchemyStockroom(session);
  assert.match(session.submitCommand('take ledger'), /you take the black wind ledger/i);
  assert.match(session.submitCommand('west'), /Wrongus holds dominion here/i);
  assert.match(session.submitCommand('west'), /immense dinner table dominates/i);
  assert.match(session.submitCommand('south'), /foyer is all red carpet/i);
  assert.match(session.submitCommand('up'), /guest room is almost offensively normal/i);
  assert.match(session.submitCommand('north'), /forcefully improved by its current occupant/i);
  assert.match(session.submitCommand('show ledger to nathema'), /not gossip\. that is architecture/i);
  assert.equal(session.worldState.getFlag('nathemaEvidenceShown'), true);
  assert.match(session.submitCommand('look'), /active political pressure|proof, contraband, route knowledge, and succession/i);
  assert.match(session.submitCommand('ask nathema about escape'), /evidence if you want scandal/i);

  const secondSession = createTestSession();
  moveToAlchemyStockroom(secondSession);
  assert.match(secondSession.submitCommand('take black wind fruit'), /you take the black wind fruit/i);
  assert.match(secondSession.submitCommand('west'), /Wrongus holds dominion here/i);
  assert.match(secondSession.submitCommand('west'), /immense dinner table dominates/i);
  assert.match(secondSession.submitCommand('south'), /foyer is all red carpet/i);
  assert.match(secondSession.submitCommand('up'), /guest room is almost offensively normal/i);
  assert.match(secondSession.submitCommand('north'), /forcefully improved by its current occupant/i);
  assert.match(secondSession.submitCommand('give black wind fruit to nathema'), /alter decisions|turn leverage into alignment/i);
  assert.equal(secondSession.worldState.getFlag('nathemaBlackWindSampleDelivered'), true);
  assert.equal(secondSession.worldState.getItemLocation('black-wind-fruit'), null);
  assert.match(secondSession.submitCommand('wait'), /loses any last pretense of guesthood|negotiation suite now/i);
  assert.match(secondSession.submitCommand('ask nathema about black wind'), /documents buy fear|fruit buys appetites/i);

  const thirdSession = createTestSession();
  moveToNathemaRoom(thirdSession);
  assert.match(thirdSession.submitCommand('tell nathema i have evidence'), /show me something i can sell/i);

  const fourthSession = createTestSession();
  moveToLibrary(fourthSession);
  assert.match(fourthSession.submitCommand('take threshold spellbook'), /you take the threshold spellbook|archive theft/i);
  assert.match(fourthSession.submitCommand('take geometry folio'), /you take the geometry folio/i);
  assert.match(fourthSession.submitCommand('west'), /smaller chamber has the careful plainness/i);
  assert.match(fourthSession.submitCommand('south'), /private chamber is all velvet excess/i);
  assert.match(fourthSession.submitCommand('west'), /curtains of living silk|kelago/i);
  assert.match(fourthSession.submitCommand('south'), /immense dinner table dominates/i);
  assert.match(fourthSession.submitCommand('south'), /foyer is all red carpet/i);
  assert.match(fourthSession.submitCommand('up'), /guest room is almost offensively normal/i);
  assert.match(fourthSession.submitCommand('north'), /forcefully improved by its current occupant/i);
  assert.match(fourthSession.submitCommand('show threshold spellbook to nathema'), /stolen texts like this do not buy tonight|shape of whatever follows/i);
  assert.equal(fourthSession.worldState.getFlag('nathemaTextsShared'), true);
  assert.match(fourthSession.submitCommand('show geometry folio to nathema'), /competent fraud|absence reduced to procedure/i);
  assert.equal(fourthSession.worldState.getFlag('nathemaRouteKnowledgeShared'), true);
  assert.match(fourthSession.submitCommand('ask nathema about escape'), /route knowledge if you want quiet|stolen texts if you want tomorrow/i);
  assert.match(fourthSession.submitCommand('ask nathema about spellbooks'), /stolen threshold text matters|alter succession/i);
  assert.match(fourthSession.submitCommand('ask nathema about portal'), /route knowledge turns flight into scheduling|competent fraud/i);
});

test('the deeper black-wind source branch reveals the tree chamber and yields source proof', () => {
  const session = createTestSession();

  moveToBlackWindTreeChamber(session);
  assert.equal(session.worldState.currentRoomId, 'blackWindTreeChamber');
  assert.equal(session.worldState.getFlag('blackWindTreePassageFound'), true);
  assert.equal(session.worldState.getFlag('blackWindTreeFound'), true);
  assert.match(session.submitCommand('search tree'), /cut free a sample|cuttable sample/i);
  assert.match(session.submitCommand('take black wind root sample'), /you take the black wind root sample/i);
  assert.match(session.submitCommand('smell sample'), /wet bark, ink, and medicine/i);

  assert.match(session.submitCommand('up'), /hidden stockroom crouches behind the kitchen wall/i);
  assert.match(session.submitCommand('west'), /Wrongus holds dominion here/i);
  assert.match(session.submitCommand('west'), /immense dinner table dominates/i);
  assert.match(session.submitCommand('south'), /foyer is all red carpet/i);
  assert.match(session.submitCommand('up'), /guest room is almost offensively normal/i);
  assert.match(session.submitCommand('north'), /forcefully improved by its current occupant/i);
  assert.match(session.submitCommand('give black wind root sample to nathema'), /source tissue|active sin/i);
  assert.equal(session.worldState.getFlag('nathemaBlackWindSampleDelivered'), true);
  assert.equal(session.worldState.getItemLocation('black-wind-root-sample'), null);
});

test('Nathema leverage can open the Grey Grin route through the library trophy room', () => {
  const session = createTestSession();

  moveToAlchemyStockroom(session);
  assert.match(session.submitCommand('take ledger'), /you take the black wind ledger/i);
  assert.match(session.submitCommand('west'), /Wrongus holds dominion here/i);
  assert.match(session.submitCommand('west'), /immense dinner table dominates/i);
  assert.match(session.submitCommand('south'), /foyer is all red carpet/i);
  assert.match(session.submitCommand('up'), /guest room is almost offensively normal/i);
  assert.match(session.submitCommand('north'), /forcefully improved by its current occupant/i);
  assert.match(session.submitCommand('show ledger to nathema'), /not gossip\. that is architecture/i);
  assert.match(session.submitCommand('ask nathema about grey grin'), /concealed trophy gallery off the library/i);
  assert.equal(session.worldState.getFlag('greyGrinLeadKnown'), true);

  assert.match(session.submitCommand('south'), /guest room is almost offensively normal/i);
  assert.match(session.submitCommand('down'), /foyer is all red carpet/i);
  assert.match(session.submitCommand('north'), /immense dinner table dominates/i);
  assert.match(session.submitCommand('north'), /curtains of living silk|kelago/i);
  assert.match(session.submitCommand('east'), /private chamber is all velvet excess/i);
  assert.match(session.submitCommand('shake hand'), /hidden catches withdraw/i);
  assert.match(session.submitCommand('north'), /smaller chamber has the careful plainness/i);
  assert.match(session.submitCommand('east'), /library is less a scholarly refuge/i);
  assert.match(session.submitCommand('search cabinet'), /false genealogy index yields|concealed eastern gallery/i);
  assert.equal(session.worldState.getFlag('trophyRoomUnlocked'), true);
  assert.match(session.submitCommand('east'), /private gallery feels more prosecutorial/i);
  assert.equal(session.worldState.currentRoomId, 'trophyRoom');
  assert.match(session.submitCommand('take grey grin blade'), /you take the Grey Grin Blade/i);
  assert.match(session.submitCommand('look at blade'), /etched grin runs near the fuller|perfectly it balances/i);

  const secondSession = createTestSession();
  moveToTrophyRoom(secondSession);
  assert.match(secondSession.submitCommand('look'), /private gallery feels more prosecutorial/i);
});

test('the Grey Grin Blade now changes how key NPCs react to the player', () => {
  const nathemaSession = createTestSession();
  moveToTrophyRoom(nathemaSession);
  assert.match(nathemaSession.submitCommand('take grey grin blade'), /you take the Grey Grin Blade/i);
  assert.match(nathemaSession.submitCommand('west'), /library is less a scholarly refuge/i);
  assert.match(nathemaSession.submitCommand('west'), /smaller chamber has the careful plainness/i);
  assert.match(nathemaSession.submitCommand('south'), /private chamber is all velvet excess/i);
  assert.match(nathemaSession.submitCommand('west'), /curtains of living silk|kelago/i);
  assert.match(nathemaSession.submitCommand('south'), /immense dinner table dominates/i);
  assert.match(nathemaSession.submitCommand('south'), /foyer is all red carpet/i);
  assert.match(nathemaSession.submitCommand('up'), /guest room is almost offensively normal/i);
  assert.match(nathemaSession.submitCommand('north'), /forcefully improved by its current occupant/i);
  assert.match(nathemaSession.submitCommand('show grey grin blade to nathema'), /succession written in metal/i);
  assert.equal(nathemaSession.worldState.getFlag('greyGrinShownToNathema'), true);
  assert.match(nathemaSession.submitCommand('give grey grin blade to nathema'), /leverage with edges/i);
  assert.equal(nathemaSession.worldState.getFlag('greyGrinDeliveredToNathema'), true);
  assert.equal(nathemaSession.worldState.getItemLocation('grey-grin-blade'), null);

  const plumSession = createTestSession();
  moveToTrophyRoom(plumSession);
  assert.match(plumSession.submitCommand('take grey grin blade'), /you take the Grey Grin Blade/i);
  assert.match(plumSession.submitCommand('west'), /library is less a scholarly refuge/i);
  assert.match(plumSession.submitCommand('west'), /smaller chamber has the careful plainness/i);
  assert.match(plumSession.submitCommand('show blade to plum'), /can be stolen after all/i);
  assert.equal(plumSession.worldState.getFlag('greyGrinShownToPlum'), true);
  assert.match(plumSession.submitCommand('ask plum about blade'), /symbolic violence|potential consequence/i);

  const oshregaalSession = createTestSession();
  moveToTrophyRoom(oshregaalSession);
  assert.match(oshregaalSession.submitCommand('take grey grin blade'), /you take the Grey Grin Blade/i);
  assert.match(oshregaalSession.submitCommand('west'), /library is less a scholarly refuge/i);
  assert.match(oshregaalSession.submitCommand('west'), /smaller chamber has the careful plainness/i);
  assert.match(oshregaalSession.submitCommand('south'), /private chamber is all velvet excess/i);
  assert.match(oshregaalSession.submitCommand('west'), /curtains of living silk|kelago/i);
  assert.match(oshregaalSession.submitCommand('south'), /immense dinner table dominates/i);
  assert.match(oshregaalSession.submitCommand('show blade to oshregaal'), /guest with initiative|reconsider the seating chart/i);
  assert.equal(oshregaalSession.worldState.getFlag('greyGrinShownToOshregaal'), true);
  assert.match(oshregaalSession.submitCommand('look'), /host deciding whether insult should become entertainment or punishment/i);
});

test('Nathema can convert delivered leverage into a dark-bargain escape', () => {
  const session = createTestSession();

  moveToAlchemyStockroom(session);
  assert.match(session.submitCommand('take black wind fruit'), /you take the black wind fruit/i);
  assert.match(session.submitCommand('west'), /Wrongus holds dominion here/i);
  assert.match(session.submitCommand('west'), /immense dinner table dominates/i);
  assert.match(session.submitCommand('south'), /foyer is all red carpet/i);
  assert.match(session.submitCommand('up'), /guest room is almost offensively normal/i);
  assert.match(session.submitCommand('north'), /forcefully improved by its current occupant/i);
  assert.match(session.submitCommand('give black wind fruit to nathema'), /alter decisions|turn leverage into alignment/i);
  assert.equal(session.worldState.getFlag('nathemaBlackWindSampleDelivered'), true);
  assert.match(session.submitCommand('ask nathema about grey grin'), /concealed trophy gallery off the library/i);

  assert.match(session.submitCommand('south'), /guest room is almost offensively normal/i);
  assert.match(session.submitCommand('down'), /foyer is all red carpet/i);
  assert.match(session.submitCommand('north'), /immense dinner table dominates/i);
  assert.match(session.submitCommand('north'), /Kelago's workroom-bedroom|crowded with knives/i);
  assert.match(session.submitCommand('east'), /private chamber is all velvet excess/i);
  assert.match(session.submitCommand('shake hand'), /hidden catches withdraw/i);
  assert.match(session.submitCommand('north'), /smaller chamber has the careful plainness/i);
  assert.match(session.submitCommand('east'), /library is less a scholarly refuge/i);
  assert.match(session.submitCommand('search cabinet'), /false genealogy index yields|concealed eastern gallery/i);
  assert.match(session.submitCommand('east'), /private gallery feels more prosecutorial/i);
  assert.match(session.submitCommand('take grey grin blade'), /you take the Grey Grin Blade/i);

  assert.match(session.submitCommand('west'), /library is less a scholarly refuge/i);
  assert.match(session.submitCommand('west'), /smaller chamber has the careful plainness/i);
  assert.match(session.submitCommand('south'), /private chamber is all velvet excess/i);
  assert.match(session.submitCommand('west'), /Kelago's workroom-bedroom|crowded with knives/i);
  assert.match(session.submitCommand('south'), /immense dinner table dominates/i);
  assert.match(session.submitCommand('south'), /foyer is all red carpet/i);
  assert.match(session.submitCommand('up'), /guest room is almost offensively normal/i);
  assert.match(session.submitCommand('north'), /forcefully improved by its current occupant/i);
  assert.match(session.submitCommand('give grey grin blade to nathema'), /leverage with edges/i);
  assert.match(session.submitCommand('tell nathema escape'), /tomorrow's emergency|transfer of power|ugly, but it will work/i);
  assert.equal(session.worldState.getFlag('nathemaEscapeDealSecured'), true);
  assert.match(session.submitCommand('look'), /command post of a coming internal crisis|escape arrangement secured/i);

  assert.match(session.submitCommand('south'), /guest room is almost offensively normal/i);
  assert.match(session.submitCommand('down'), /foyer is all red carpet/i);
  assert.match(session.submitCommand('south'), /white marble stair rises in a broad ceremonial sweep/i);
  assert.match(session.submitCommand('south'), /vast natural cavern/i);
  assert.match(session.submitCommand('escape'), /dark bargain ending/i);
  assert.equal(session.worldState.getFlag('escapedMansion'), true);
  assert.equal(session.worldState.getFlag('strongerEscapeSecured'), false);
});

test('Nathema can also convert black-wind leverage plus portal knowledge into a dark-bargain escape', () => {
  const session = createTestSession();

  moveToAlchemyStockroom(session);
  assert.match(session.submitCommand('take black wind fruit'), /you take the black wind fruit/i);
  assert.match(session.submitCommand('west'), /Wrongus holds dominion here/i);
  assert.match(session.submitCommand('west'), /immense dinner table dominates/i);
  assert.match(session.submitCommand('south'), /foyer is all red carpet/i);
  assert.match(session.submitCommand('up'), /guest room is almost offensively normal/i);
  assert.match(session.submitCommand('north'), /forcefully improved by its current occupant/i);
  assert.match(session.submitCommand('give black wind fruit to nathema'), /alter decisions|turn leverage into alignment/i);
  assert.equal(session.worldState.getFlag('nathemaBlackWindSampleDelivered'), true);

  assert.match(session.submitCommand('south'), /guest room is almost offensively normal/i);
  assert.match(session.submitCommand('down'), /foyer is all red carpet/i);
  assert.match(session.submitCommand('north'), /immense dinner table dominates/i);
  assert.match(session.submitCommand('north'), /Kelago's workroom-bedroom|crowded with knives/i);
  assert.match(session.submitCommand('east'), /private chamber is all velvet excess/i);
  assert.match(session.submitCommand('shake hand'), /hidden catches withdraw/i);
  assert.match(session.submitCommand('north'), /smaller chamber has the careful plainness/i);
  assert.match(session.submitCommand('east'), /library is less a scholarly refuge/i);
  assert.match(session.submitCommand('take geometry folio'), /you take the geometry folio/i);

  assert.match(session.submitCommand('west'), /smaller chamber has the careful plainness/i);
  assert.match(session.submitCommand('south'), /private chamber is all velvet excess/i);
  assert.match(session.submitCommand('west'), /Kelago's workroom-bedroom|crowded with knives/i);
  assert.match(session.submitCommand('south'), /immense dinner table dominates/i);
  assert.match(session.submitCommand('south'), /foyer is all red carpet/i);
  assert.match(session.submitCommand('up'), /guest room is almost offensively normal/i);
  assert.match(session.submitCommand('north'), /forcefully improved by its current occupant/i);
  assert.match(session.submitCommand('show geometry folio to nathema'), /competent fraud|absence reduced to procedure/i);
  assert.equal(session.worldState.getFlag('nathemaRouteKnowledgeShared'), true);
  assert.match(session.submitCommand('tell nathema escape'), /tomorrow's emergency|transfer of power|ugly, but it will work/i);
  assert.equal(session.worldState.getFlag('nathemaEscapeDealSecured'), true);
});

test('accepting black-wind mutation can also produce a dark-bargain escape', () => {
  const session = createTestSession();

  moveToAlchemyStockroom(session);
  assert.match(session.submitCommand('take black wind fruit'), /you take the black wind fruit/i);
  assert.match(session.submitCommand('eat black wind fruit'), /thoughts feel dangerously well-aligned/i);
  assert.equal(session.worldState.getFlag('blackWindFruitConsumed'), true);
  assert.match(session.submitCommand('west'), /Wrongus holds dominion here/i);
  assert.match(session.submitCommand('west'), /immense dinner table dominates/i);
  assert.match(session.submitCommand('south'), /foyer is all red carpet/i);
  assert.match(session.submitCommand('south'), /white marble stair rises in a broad ceremonial sweep/i);
  assert.match(session.submitCommand('south'), /vast natural cavern/i);
  assert.match(session.submitCommand('escape'), /dark bargain ending/i);
  assert.equal(session.worldState.getFlag('escapedMansion'), true);
  assert.equal(session.worldState.getFlag('strongerEscapeSecured'), false);
});

test('accepting servant invisibility can produce a service-flavored dark-bargain escape', () => {
  const session = createTestSession();

  moveToKitchen(session);
  assert.match(session.submitCommand('north'), /servants' dormitory is a long, low room/i);
  assert.match(session.submitCommand('wear servant apron'), /smells of stew, sweat, and the sort of invisibility/i);
  assert.equal(session.worldState.getFlag('servantApronWorn'), true);
  assert.match(session.submitCommand('south'), /Wrongus holds dominion here/i);
  assert.match(session.submitCommand('west'), /immense dinner table dominates/i);
  assert.match(session.submitCommand('south'), /foyer is all red carpet/i);
  assert.match(session.submitCommand('south'), /white marble stair rises in a broad ceremonial sweep/i);
  assert.match(session.submitCommand('south'), /vast natural cavern/i);
  assert.match(session.submitCommand('escape'), /dark bargain ending/i);
  assert.equal(session.worldState.getFlag('escapedMansion'), true);
  assert.equal(session.worldState.getFlag('strongerEscapeSecured'), false);
});

test('the Grey Grin can open a violent Oshregaal confrontation if you blunt his command and learn his weakness', () => {
  const session = createTestSession();

  moveToTrophyRoom(session);
  assert.match(session.submitCommand('take grey grin blade'), /you take the Grey Grin Blade/i);
  assert.match(session.submitCommand('search plaques'), /incorrect count|hidden seam leading east/i);
  assert.match(session.submitCommand('east'), /silk-draped, and arranged with a precision/i);
  assert.match(session.submitCommand('ask chariadulscha about oshregaal'), /Answers cost disorder|promise me one clean act of future chaos/i);
  assert.match(session.submitCommand('tell chariadulscha promise chaos'), /future disturbance properly spoken|Ask, and I will spend one answer on you/i);
  assert.match(session.submitCommand('ask chariadulscha about oshregaal'), /Interrupt appetite, ownership, or applause/i);
  assert.equal(session.worldState.getFlag('oshregaalWeaknessKnown'), true);
  assert.equal(session.worldState.getFlag('spiderDebtPending'), true);
  assert.match(session.submitCommand('west'), /private gallery feels more prosecutorial/i);
  assert.match(session.submitCommand('west'), /library is less a scholarly refuge/i);
  assert.match(session.submitCommand('west'), /At the desk sits Plum|pale and alert/i);
  assert.match(session.submitCommand('south'), /private chamber is all velvet excess/i);
  assert.match(session.submitCommand('search vanity'), /wrapped plug of dark ear wax/i);
  assert.match(session.submitCommand('take wax plug'), /you take the wax plug/i);
  assert.match(session.submitCommand('use wax plug'), /certain voices would have to work harder/i);
  assert.equal(session.worldState.getFlag('waxPlugReadied'), true);
  assert.match(session.submitCommand('west'), /Kelago's workroom-bedroom|crowded with knives/i);
  assert.match(session.submitCommand('south'), /immense dinner table dominates/i);
  assert.match(session.submitCommand('use grey grin blade on oshregaal'), /attempted to kill Oshregaal|violent margin of escape/i);
  assert.equal(session.worldState.getFlag('oshregaalAssassinationAttempted'), true);
  assert.equal(session.worldState.getFlag('oshregaalWounded'), true);
  assert.equal(session.worldState.getFlag('spiderDebtPending'), false);
  assert.equal(session.worldState.getFlag('spiderDebtResolved'), true);
  assert.match(session.submitCommand('south'), /foyer is all red carpet/i);
  assert.match(session.submitCommand('south'), /white marble stair rises in a broad ceremonial sweep/i);
  assert.match(session.submitCommand('south'), /vast natural cavern/i);
  assert.match(session.submitCommand('escape'), /violent ending/i);
});

test('agreeing to stay with Oshregaal yields absorption into his routines', () => {
  const session = createTestSession();

  moveToFeastHall(session);
  assert.match(session.submitCommand('tell oshregaal i will stay'), /failure ending: absorption into Oshregaal's routines/i);
  assert.equal(session.worldState.getFlag('agreedToStay'), true);
  assert.equal(session.worldState.getFlag('absorbedIntoRoutine'), true);
});

test('the fishing shack extends the approach with servant-route clues and ugly practical loot', () => {
  const session = createTestSession();

  assert.match(session.start(), /vast natural cavern/i);
  assert.match(session.submitCommand('northwest'), /old garden has gone feral/i);
  assert.match(session.submitCommand('west'), /low fishing shack squats/i);
  assert.equal(session.worldState.currentRoomId, 'fishingShack');
  assert.match(session.submitCommand('search shack'), /east stair runoff checks before dinner/i);
  assert.equal(session.worldState.getFlag('shackSearched'), true);
  assert.equal(session.worldState.getFlag('eastRunoffNoted'), true);
  assert.equal(session.worldState.getFlag('pitRouteHintKnown'), true);
  assert.match(session.submitCommand('read rota'), /EAST STAIR RUNOFF BEFORE DINNER/i);
  assert.match(session.submitCommand('take shark polymorph vial'), /you take the shark polymorph vial/i);
  assert.match(session.submitCommand('smell vial'), /brine, copper, and a confidence/i);
  assert.match(session.submitCommand('take weighted line'), /you take the weighted line/i);
  assert.match(session.submitCommand('east'), /old garden has gone feral/i);
  assert.match(session.submitCommand('southeast'), /vast natural cavern/i);
  assert.match(session.submitCommand('north'), /white marble stair/i);
  assert.match(session.submitCommand('down'), /narrow maintenance ledge clings to the mansion wall/i);
  assert.equal(session.worldState.currentRoomId, 'pitLedge');
});

test('the bathroom exposes the house underside and the cesspool route can be civilized through Slorum', () => {
  const session = createTestSession();

  moveToBathroom(session);
  assert.equal(session.worldState.currentRoomId, 'bathroom');
  assert.match(session.submitCommand('search tile'), /scrape marks around a decorative cistern panel/i);
  assert.equal(session.worldState.getFlag('bathroomRouteKnown'), true);
  assert.match(session.submitCommand('take scented soap'), /you take the scented soap/i);
  assert.match(session.submitCommand('open panel'), /concealed cistern panel swings free/i);
  assert.equal(session.worldState.getFlag('bathroomPanelOpened'), true);
  assert.match(session.submitCommand('down'), /digestive underside spreads out in a stone cistern/i);
  assert.equal(session.worldState.currentRoomId, 'cesspool');
  assert.equal(session.worldState.getFlag('cesspoolEntered'), true);
  assert.match(session.submitCommand('search table'), /hosting with it/i);
  assert.match(session.submitCommand('ask slorum about party'), /proper dinner requires place settings/i);
  assert.equal(session.worldState.getFlag('slorumMet'), true);
  assert.match(session.submitCommand('west'), /western ledge run directly past Slorum/i);
  assert.match(session.submitCommand('tell slorum your party is lovely'), /upstairs guest with eyes/i);
  assert.equal(session.worldState.getFlag('slorumFlattered'), true);
  assert.match(session.submitCommand('give soap to slorum'), /accepts the scented soap with trembling delight/i);
  assert.equal(session.worldState.getFlag('slorumGifted'), true);
  assert.equal(session.worldState.getFlag('cesspoolCrossingSafe'), true);
  assert.equal(session.worldState.getItemLocation('scented-soap'), null);
  assert.match(session.submitCommand('west'), /Below the eastern side of the grand stair/i);
  assert.equal(session.worldState.currentRoomId, 'pitLedge');
  assert.match(session.submitCommand('west'), /vast natural cavern/i);
  assert.equal(session.worldState.currentRoomId, 'cavern');
});

test('the cesspool branch also supports the silver-mirror variant and reconnects to the stairs', () => {
  const session = createTestSession();

  moveToCesspool(session);
  assert.equal(session.worldState.currentRoomId, 'cesspool');
  assert.match(session.submitCommand('up'), /guest bathroom is absurdly luxurious/i);
  assert.match(session.submitCommand('take silver mirror'), /you take the silver mirror/i);
  assert.match(session.submitCommand('down'), /digestive underside spreads out in a stone cistern/i);
  assert.match(session.submitCommand('show mirror to slorum'), /accompany it with better manners/i);
  assert.match(session.submitCommand('tell slorum lovely dinner'), /An upstairs guest with eyes/i);
  assert.match(session.submitCommand('give mirror to slorum'), /takes the silver mirror and props it beside the place of honor/i);
  assert.match(session.submitCommand('west'), /narrow maintenance ledge clings to the mansion wall/i);
  assert.match(session.submitCommand('up'), /white marble stair rises in a broad ceremonial sweep/i);
  assert.equal(session.worldState.currentRoomId, 'grandStairs');
});

test('the Spider Room offers a one-promise bargain for black-wind truth', () => {
  const session = createTestSession();

  moveToTrophyRoom(session);
  assert.match(session.submitCommand('east'), /eastern wall appears to be only more trophies/i);
  assert.match(session.submitCommand('search plaques'), /incorrect count|hidden seam leading east/i);
  assert.equal(session.worldState.getFlag('spiderRoomFound'), true);
  assert.match(session.submitCommand('east'), /silk-draped, and arranged with a precision/i);
  assert.equal(session.worldState.currentRoomId, 'spiderRoom');
  assert.match(session.submitCommand('ask chariadulscha about black wind'), /Answers cost disorder|promise me one clean act of future chaos/i);
  assert.match(session.submitCommand('tell chariadulscha i will break something for you'), /future disturbance properly spoken/i);
  assert.equal(session.worldState.getFlag('spiderPromiseMade'), true);
  assert.equal(session.worldState.getFlag('spiderDebtPending'), true);
  assert.match(session.submitCommand('ask chariadulscha about black wind'), /Follow cold stock downward|living arithmetic under the house/i);
  assert.equal(session.worldState.getFlag('blackWindSourceLeadKnown'), true);
  assert.equal(session.worldState.getFlag('spiderTruthClaimed'), true);
  assert.match(session.submitCommand('ask chariadulscha about grey grin'), /number is spent/i);
});

test('the Spider Room can also seed Grey Grin and sealed-room leads', () => {
  const session = createTestSession();

  moveToSpiderRoom(session);
  assert.match(session.submitCommand('search wall'), /seam hidden under silk|once stored nearby/i);
  assert.equal(session.worldState.getFlag('sealedRoomLeadKnown'), true);
  assert.match(session.submitCommand('ask chariadulscha about grey grin'), /Answers cost disorder|promise me one clean act of future chaos/i);
  assert.match(session.submitCommand('tell chariadulscha promise chaos'), /Ask, and I will spend one answer on you/i);
  assert.match(session.submitCommand('ask chariadulscha about grey grin'), /laughing blade sits near his trophies/i);
  assert.equal(session.worldState.getFlag('greyGrinLeadKnown'), true);
});

test('the Spider Room can also seed portal-bypass knowledge through Chariadulscha', () => {
  const session = createTestSession();

  moveToSpiderRoom(session);
  assert.match(session.submitCommand('ask chariadulscha about portal'), /Answers cost disorder|promise me one clean act of future chaos/i);
  assert.match(session.submitCommand('tell chariadulscha promise chaos'), /Ask, and I will spend one answer on you/i);
  assert.match(session.submitCommand('ask chariadulscha about portal'), /cheats thresholds through etiquette and fraud|convincing substitute/i);
  assert.equal(session.worldState.getFlag('portalBypassLearned'), true);
  assert.equal(session.worldState.getFlag('spiderTruthClaimed'), true);
});

test('escaping with rescued Plum now resolves to a minimum good ending', () => {
  const session = createTestSession();

  preparePlumTunnelRoute(session);
  session.submitCommand('south');
  session.submitCommand('south');
  session.submitCommand('west');
  session.submitCommand('tell plum come now');
  session.submitCommand('east');
  session.submitCommand('north');
  session.submitCommand('north');
  session.submitCommand('crawl tunnel');

  assert.match(session.submitCommand('escape'), /minimum good ending/i);
  assert.equal(session.worldState.getFlag('escapedMansion'), true);
});

test('escaping with Plum plus leverage now resolves to a stronger vanilla ending', () => {
  const session = createTestSession();

  moveToAlchemyStockroom(session);
  session.submitCommand('take ledger');
  session.submitCommand('read ledger');
  session.submitCommand('west');
  session.submitCommand('west');
  session.submitCommand('south');
  session.submitCommand('up');
  session.submitCommand('east');
  session.submitCommand('take scented soap');
  session.submitCommand('open panel');
  session.submitCommand('down');
  session.submitCommand('tell slorum your party is lovely');
  session.submitCommand('give soap to slorum');
  session.submitCommand('west');
  session.submitCommand('west');
  session.submitCommand('north');
  session.submitCommand('north');
  session.submitCommand('give invitation to oggaf');
  session.submitCommand('north');
  session.submitCommand('north');
  session.submitCommand('east');
  session.submitCommand('shake hand');
  session.submitCommand('north');
  session.submitCommand('east');
  session.submitCommand('take meditative incense');
  session.submitCommand('take wax palm');
  session.submitCommand('north');
  session.submitCommand('use wax palm on idol');
  session.submitCommand('north');
  session.submitCommand('light incense');
  session.submitCommand('south');
  session.submitCommand('south');
  session.submitCommand('west');
  session.submitCommand('tell plum come now');
  session.submitCommand('east');
  session.submitCommand('north');
  session.submitCommand('north');
  session.submitCommand('crawl tunnel');

  assert.match(session.submitCommand('escape'), /strong vanilla ending/i);
  assert.equal(session.worldState.getFlag('escapedMansion'), true);
  assert.equal(session.worldState.getFlag('strongerEscapeSecured'), true);
});

test('the black-wind source can be calmed and sabotaged through the buried spine', () => {
  const session = createTestSession();

  moveToTrophyRoom(session);
  assert.match(session.submitCommand('take grey grin blade'), /you take the Grey Grin Blade/i);
  assert.match(session.submitCommand('search plaques'), /incorrect count|hidden seam leading east/i);
  assert.match(session.submitCommand('east'), /silk-draped, and arranged with a precision/i);
  assert.match(session.submitCommand('ask chariadulscha about black wind'), /Answers cost disorder|promise me one clean act of future chaos/i);
  assert.match(session.submitCommand('tell chariadulscha promise chaos'), /future disturbance properly spoken|Ask, and I will spend one answer on you/i);
  assert.match(session.submitCommand('ask chariadulscha about black wind'), /Follow cold stock downward|living arithmetic under the house/i);
  assert.equal(session.worldState.getFlag('spiderDebtPending'), true);
  assert.match(session.submitCommand('west'), /private gallery feels more prosecutorial/i);
  assert.match(session.submitCommand('west'), /library is less a scholarly refuge/i);
  assert.match(session.submitCommand('take meditative incense'), /you take the meditative incense/i);
  assert.match(session.submitCommand('west'), /smaller chamber has the careful plainness/i);
  assert.match(session.submitCommand('south'), /private chamber is all velvet excess/i);
  assert.match(session.submitCommand('west'), /curtains of living silk|kelago/i);
  assert.match(session.submitCommand('south'), /immense dinner table dominates/i);
  assert.match(session.submitCommand('east'), /Wrongus holds dominion here/i);
  assert.match(session.submitCommand('ask wrongus about black wind'), /black wind|root|stock/i);
  assert.match(session.submitCommand('search shelf'), /hidden stockroom|black-wind trade/i);
  assert.match(session.submitCommand('east'), /hidden stockroom crouches behind the kitchen wall/i);
  assert.match(session.submitCommand('read ledger'), /active trade book/i);
  assert.match(session.submitCommand('search drain'), /service hatch and a narrow stair descending/i);
  assert.match(session.submitCommand('down'), /truth of the black-wind trade stops pretending/i);
  assert.match(session.submitCommand('search spine'), /messy and imprecise/i);
  assert.match(session.submitCommand('light incense'), /set it near the buried book|roots stop reading as wild growth/i);
  assert.equal(session.worldState.getFlag('blackWindTreeCalmed'), true);
  assert.match(session.submitCommand('search spine'), /looks cuttable|original blasphemy feeding it/i);
  assert.match(session.submitCommand('use grey grin blade on spine'), /sabotaged the black-wind source/i);
  assert.equal(session.worldState.getFlag('blackWindTreeSabotaged'), true);
  assert.equal(session.worldState.getFlag('spiderDebtPending'), false);
  assert.equal(session.worldState.getFlag('spiderDebtResolved'), true);
  assert.match(session.submitCommand('look'), /split now mars the buried spine|supply line trying not to admit it has been cut/i);
});

test('returning to the Spider Room after honoring the chaos bargain closes the account explicitly', () => {
  const session = createTestSession();

  moveToTrophyRoom(session);
  session.submitCommand('take grey grin blade');
  session.submitCommand('search plaques');
  session.submitCommand('east');
  session.submitCommand('ask chariadulscha about oshregaal');
  session.submitCommand('tell chariadulscha promise chaos');
  session.submitCommand('ask chariadulscha about oshregaal');
  session.submitCommand('west');
  session.submitCommand('west');
  session.submitCommand('west');
  session.submitCommand('south');
  session.submitCommand('search vanity');
  session.submitCommand('take wax plug');
  session.submitCommand('use wax plug');
  session.submitCommand('west');
  session.submitCommand('south');
  session.submitCommand('use grey grin blade on oshregaal');
  assert.equal(session.worldState.getFlag('spiderDebtResolved'), true);

  session.submitCommand('north');
  session.submitCommand('north');
  session.submitCommand('east');
  session.submitCommand('north');
  session.submitCommand('east');
  session.submitCommand('east');
  session.submitCommand('east');
  assert.match(session.submitCommand('look'), /account seems to have been marked paid in full/i);
  assert.match(session.submitCommand('tell chariadulscha i kept my promise'), /number is closed/i);
});

test('sabotaging the source can also secure a stronger escape with Plum', () => {
  const session = createTestSession();

  moveToTrophyRoom(session);
  session.submitCommand('take grey grin blade');
  session.submitCommand('west');
  session.submitCommand('take meditative incense');
  session.submitCommand('take wax palm');
  session.submitCommand('west');
  session.submitCommand('south');
  session.submitCommand('west');
  session.submitCommand('south');
  session.submitCommand('east');
  session.submitCommand('ask wrongus about black wind');
  session.submitCommand('search shelf');
  session.submitCommand('east');
  session.submitCommand('read ledger');
  session.submitCommand('search drain');
  session.submitCommand('down');
  session.submitCommand('light incense');
  session.submitCommand('use grey grin blade on spine');
  session.submitCommand('up');
  session.submitCommand('west');
  session.submitCommand('west');
  session.submitCommand('north');
  session.submitCommand('east');
  session.submitCommand('north');
  session.submitCommand('east');
  session.submitCommand('north');
  session.submitCommand('use wax palm on idol');
  session.submitCommand('north');
  session.submitCommand('light incense');
  session.submitCommand('south');
  session.submitCommand('south');
  session.submitCommand('west');
  session.submitCommand('tell plum come now');
  session.submitCommand('east');
  session.submitCommand('north');
  session.submitCommand('north');
  session.submitCommand('crawl tunnel');

  assert.match(session.submitCommand('escape'), /strong vanilla ending/i);
  assert.equal(session.worldState.getFlag('blackWindTreeSabotaged'), true);
  assert.equal(session.worldState.getFlag('strongerEscapeSecured'), true);
});

test('the Sealed Room branch yields the correction bell code', () => {
  const session = createTestSession();

  moveToSealedRoom(session);

  assert.equal(session.worldState.currentRoomId, 'sealedRoom');
  assert.equal(session.worldState.getFlag('sealedRoomEntered'), true);
  assert.match(session.submitCommand('search room'), /folded service card|hidden it/i);
  assert.match(session.submitCommand('search roster'), /workflow for turning guests into manageable problems/i);
  assert.equal(session.worldState.getFlag('containmentProtocolKnown'), true);
  assert.match(session.submitCommand('take correction roster'), /you take the correction roster/i);
  assert.match(session.submitCommand('read correction roster'), /GUEST MISALIGNED|downgraded before transfer/i);
  assert.match(session.submitCommand('take correction bell card'), /you take the correction bell card/i);
  assert.match(session.submitCommand('read correction bell card'), /double ring for correction staff|remove front-of-house attendants/i);
  assert.equal(session.worldState.getFlag('correctionBellCodeKnown'), true);
});

test('rescued Plum plus correction protocol knowledge now also counts as a stronger escape', () => {
  const session = createTestSession();

  moveToSealedRoom(session);
  session.submitCommand('take correction roster');
  session.submitCommand('read correction roster');
  assert.equal(session.worldState.getFlag('containmentProtocolKnown'), true);
  session.submitCommand('south');
  session.submitCommand('west');
  session.submitCommand('west');
  session.submitCommand('take meditative incense');
  session.submitCommand('take wax palm');
  session.submitCommand('north');
  session.submitCommand('use wax palm on idol');
  session.submitCommand('north');
  session.submitCommand('light incense');
  session.submitCommand('south');
  session.submitCommand('south');
  session.submitCommand('west');
  session.submitCommand('tell plum come now');
  session.submitCommand('east');
  session.submitCommand('north');
  session.submitCommand('north');
  session.submitCommand('crawl tunnel');

  assert.match(session.submitCommand('escape'), /strong vanilla ending/i);
  assert.equal(session.worldState.getFlag('strongerEscapeSecured'), true);
});

test('the correction bell code can pull the butlers off the foyer long enough to bypass admission', () => {
  const session = createTestSession();

  moveToSealedRoom(session);
  session.submitCommand('take correction bell card');
  session.submitCommand('read correction bell card');
  session.submitCommand('south');
  session.submitCommand('west');
  session.submitCommand('west');
  session.submitCommand('west');
  session.submitCommand('south');
  session.submitCommand('west');
  session.submitCommand('south');
  session.submitCommand('south');
  session.submitCommand('up');
  assert.equal(session.worldState.currentRoomId, 'guestRoom');
  assert.match(session.submitCommand('pull bell pull'), /coded double-ring pattern|urgent professional annoyance/i);
  assert.equal(session.worldState.getFlag('butlerDiversionActive'), true);
  assert.match(session.submitCommand('down'), /foyer/i);
  assert.match(session.submitCommand('north'), /immense dinner table dominates/i);
  assert.equal(session.worldState.currentRoomId, 'feastHall');
});