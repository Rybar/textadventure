import { Item } from '../../engine/models/item.js';
import { Room } from '../../engine/models/room.js';
import { createWaxPlug } from '../items/waxPlug.js';

export function createGrandfatherRoom() {
  const velvetBed = new Item({
    id: 'oshregaal-bed',
    name: 'bed',
    aliases: ['canopied bed', 'velvet bed'],
    description: 'A mountainous velvet bed draped in lace and fur, built for a man who treats sleep as a throne with blankets.',
    portable: false,
    actions: {
      sleep({ session }) {
        return session.triggerGameOver(
          'The velvet accepts you too easily. Perfume, fur, and heavy coverlets close overhead; somewhere in the room a bell-cord answers for you, and by the time you understand that the bed was built to keep as much as to comfort, the house has already learned the shape of your surrender.',
          { persistentFlags: ['grandfatherBedGameOverSeen'] },
        );
      },
      look() {
        return 'The bed curtains are embroidered with constellations, tusks, and banquets. Beneath the perfume and medicinal wine is a subtler wrongness: compressed hollows in the coverlet and silk ties at the posts, as though hospitality here occasionally needed help becoming agreement.';
      },
      touch() {
        return 'The velvet swallows your hand almost lovingly. The bed has the texture of comfort and the mood of a procedural threat.';
      },
    },
  });

  const waxPlug = createWaxPlug();
  waxPlug.hide();
  const signetRings = new Item({
    id: 'forged-signet-rings',
    name: 'forged signet rings',
    aliases: ['signet rings', 'forged rings', 'rings', 'signet ring'],
    description: 'A velvet packet of forged signet rings carrying several lesser house marks good enough to survive a dark hallway, a hurried servant, or a butler who wants an excuse to believe paperwork has already happened elsewhere.',
    actions: {
      wear() {
        return 'You slip on the forged rings. They do not make you important, but they do make your hands look briefly administrative.';
      },
    },
  });
  signetRings.hide();

  return new Room({
    id: 'grandfatherRoom',
    title: 'Grandfather\'s Room',
    description: `
Oshregaal's private chamber is all velvet excess, mirrored vanity, perfumed smoke, and the thick aftertaste of self-importance. A broad bed sprawls beneath a canopy like a collapsed theater set, while a writing desk groans under guest lists, sealed notes, and revisions made in a tyrant's cheerful hand.
On the north wall stands a black metal door fitted not with a knob but with an articulated iron hand, raised at the height of greeting. Kelago's rooms lie back to the west.
`.trim(),
    exits: {
      west: 'kelagoRoom',
      north: 'plumRoom',
    },
    exitGuards: {
      north({ getFlag }) {
        if (getFlag('metalHandDoorUnlocked')) {
          return null;
        }

        return 'The black metal door remains shut. Its iron hand waits upright, palm tilted toward you in a parody of etiquette.';
      },
    },
    verbs: {
      search({ command, currentRoom, getFlag, setFlag }) {
        const target = command.directObject;

        if (!target || target.includes('room') || target.includes('chamber') || target.includes('desk')) {
          if (!getFlag('plumMaintenanceNotesKnown') || !getFlag('oshregaalNoDepartureKnown')) {
            setFlag('plumMaintenanceNotesKnown', true);
            setFlag('oshregaalNoDepartureKnown', true);
            if (!signetRings.visible) {
              signetRings.reveal();
            }

            return 'You sift through guest lists, menu notes, and cruelly edited anecdotes prepared for dinner. Beneath them all is a thinner stack recording "corrections" to the Numerian scribe in the north room: memory lapses, mood compliance, component upkeep, and reminders to keep her grateful, legible, and near at hand. Worse are the guest-retention notes threaded between the menus: repeat the flattering story, refill the cup, reseat anyone who speaks too often of leaving, and if courtesy fails, move them deeper into the house until departure sounds impolite even to themselves. In a shallow drawer beneath the invitations sits a velvet packet of forged signet rings for the sort of administrative lying a house like this apparently considers domestic maintenance.';
          }

          return 'The desk still offers the same ugly bookkeeping: Plum reduced to upkeep notes and guests reduced to retention strategy. Oshregaal does not merely host people; he edits them toward staying.';
        }

        if (target.includes('vanity') || target.includes('mirror') || target.includes('drawer')) {
          if (!getFlag('waxPlugFound')) {
            setFlag('waxPlugFound', true);
            waxPlug.reveal();
            return 'A quick search of the vanity turns up scented powder, rings, and a wrapped plug of dark ear wax hidden behind a comb. Someone in this house has already learned that certain voices are easier to survive muffled.';
          }

          return currentRoom.findItem('wax plug')
            ? 'The vanity drawers still hold powders, seals, and old narcotic perfumes, but the useful discovery remains the wrapped wax plug tucked behind the comb.'
            : 'The vanity drawers still hold powders, seals, and old narcotic perfumes, but the useful discovery remains the missing space where the wax plug had been tucked away.';
        }

        if (target.includes('bed') || target.includes('canopy') || target.includes('curtain') || target.includes('post')) {
          if (!getFlag('oshregaalNoDepartureKnown')) {
            setFlag('oshregaalNoDepartureKnown', true);
            return 'Up close, the bed reads less as decadence than procedure. The silk ties are placed for wrists, not decoration, and one pillow still bears the faint dark crescent of old mascara or older panic. Whatever Oshregaal calls affection, it has a method for making objections horizontal.';
          }

          return 'The bed remains a warning dressed as luxury: too broad, too staged, and arranged for the kind of intimacy that survives on unequal permission.';
        }

        if (target.includes('door') || target.includes('hand')) {
          return 'The iron hand is jointed, warm from the room, and extended as though waiting to conclude a formal introduction. Oshregaal apparently finds doors funnier when they insist on manners.';
        }

        return `You search the ${target} and find only perfume, vanity, and evidence of a host who edits the world to improve the applause.`;
      },
      shake({ command, emitEvent }) {
        const target = command.directObject;
        if (!target) {
          return 'Shake what?';
        }

        if (target.includes('hand') || target.includes('door')) {
          return emitEvent('unlockMetalHandDoor');
        }

        return `The ${target} does not appear to want your hand.`;
      },
    },
    items: [velvetBed, waxPlug, signetRings],
    conditionalDescriptions: [
      {
        when: ({ getFlag }) => getFlag('metalHandDoorUnlocked'),
        text: 'The iron hand now hangs slightly lower, and the north door stands unlatched just enough to suggest that courtesy has been mistaken for authorization.',
      },
      {
        when: ({ getFlag }) => getFlag('waxPlugFound'),
        text: 'The disturbed vanity drawer leaves the room looking less in control of itself than it intends.',
      },
      {
        when: ({ getFlag }) => getFlag('plumMaintenanceNotesKnown'),
        text: 'The desk now reads less like vanity and more like maintenance: invitations, anecdotes, and a captive scribe all revised toward usefulness.',
      },
      {
        when: ({ getFlag }) => getFlag('oshregaalNoDepartureKnown'),
        text: 'With the retention notes and staged luxury properly seen, the chamber makes one fact plain: Oshregaal does not imagine guests leaving so much as degrading into manageability.',
      },
    ],
    objects: {
      desk: {
        description({ getFlag }) {
          if (getFlag('plumMaintenanceNotesKnown') || getFlag('oshregaalNoDepartureKnown')) {
            return 'The desk is littered with corrected invitations, revised anecdotes, and petty dominion preserved as paperwork. Now that you have read it properly, the whole surface feels like a filing system for captivity disguised as a host\'s preferences.';
          }

          return 'The desk is littered with corrected invitations, revised anecdotes, and petty dominion preserved as paperwork.';
        },
        actions: {
          touch() {
            return 'The desk edge is smooth with use. It feels like the kind of furniture that has supported many small tyrannies and one very large ego.';
          },
        },
      },
      vanity: {
        description: 'The mirrored vanity is crowded with perfumes, rings, powders, and small aids to self-invention.',
        actions: {
          touch() {
            return 'Powder dust and perfume residue cling faintly to the vanity top. Even Oshregaal\'s grooming station feels overconfident.';
          },
        },
      },
      guestLists: {
        name: 'guest lists',
        aliases: ['guest lists', 'lists', 'invitations'],
        description({ getFlag }) {
          if (getFlag('plumMaintenanceNotesKnown')) {
            return 'The guest lists are not invitations so much as seating strategies annotated by vanity. Names are nudged between categories of amusing, useful, and retainable with the cheerful confidence of a host who believes people become furniture when filed correctly.';
          }

          return 'Several guest lists lie in ordered stacks, each revised often enough to imply that Oshregaal plans company the way generals plan terrain.';
        },
      },
      notes: {
        name: 'sealed notes',
        aliases: ['sealed notes', 'notes', 'sealed letters', 'letters'],
        description({ getFlag }) {
          if (getFlag('oshregaalNoDepartureKnown')) {
            return 'The sealed notes are all cheerful tyranny in miniature: reminders about guest retention, corrections to anecdotes, and little administrative cruelties drafted as if they were refinements to hospitality.';
          }

          return 'The notes are sealed with perfumed wax and revised in a hand that enjoys the performance of authority almost as much as authority itself.';
        },
      },
      mirror: {
        description({ getFlag }) {
          if (getFlag('oshregaalNoDepartureKnown')) {
            return 'The mirror flatters the room and incriminates it at the same time. With the retention notes in mind, even your own reflection looks briefly like another guest being arranged for easier keeping.';
          }

          return 'The mirror flatters the room and incriminates it at the same time.';
        },
      },
      smoke: {
        description: 'The perfumed smoke drifting through the room smells like roses, narcotics, and the sort of confidence that mistakes heavy fragrance for moral authority.',
        actions: {
          smell() {
            return 'The smoke lands on the back of your throat like a velvet threat, floral first and medicinal a moment later.';
          },
        },
      },
      hand: {
        name: 'iron hand',
        aliases: ['metal hand', 'door hand', 'iron hand'],
        description: 'The hand is bolted where a knob ought to be, fingers slightly curled, palm open for a greeting no sensible architect would have requested.',
        actions: {
          touch() {
            return 'The iron hand is warmer than it has any right to be, as if the door enjoys rehearsing introductions.';
          },
        },
      },
      door: {
        name: 'metal door',
        aliases: ['black door', 'north door', 'metal-hand door'],
        description({ getFlag }) {
          if (getFlag('metalHandDoorUnlocked')) {
            return 'The black metal door now stands ajar on a grudging seam. Beyond it lies a quieter chamber that Oshregaal apparently preferred to access by ceremony.';
          }

          return 'The black metal door has no keyhole, only the articulated iron hand mounted at greeting height.';
        },
      },
    },
  });
}

export default createGrandfatherRoom;