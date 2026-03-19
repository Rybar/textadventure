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
      sleep() {
        return 'The thought of sleeping in Oshregaal\'s bed feels less like trespass than like entering his mouth voluntarily.';
      },
      look() {
        return 'The bed curtains are embroidered with constellations, tusks, and banquets. Beneath the perfume and medicinal wine is a subtler wrongness: compressed hollows in the coverlet and silk ties at the posts, as though hospitality here occasionally needed help becoming agreement.';
      },
    },
  });

  const waxPlug = createWaxPlug();

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
      search({ command, getFlag, setFlag }) {
        const target = command.directObject;

        if (!target || target.includes('room') || target.includes('chamber') || target.includes('desk')) {
          if (!getFlag('plumMaintenanceNotesKnown') || !getFlag('oshregaalNoDepartureKnown')) {
            setFlag('plumMaintenanceNotesKnown', true);
            setFlag('oshregaalNoDepartureKnown', true);
            return 'You sift through guest lists, menu notes, and cruelly edited anecdotes prepared for dinner. Beneath them all is a thinner stack recording "corrections" to the Numerian scribe in the north room: memory lapses, mood compliance, component upkeep, and reminders to keep her grateful, legible, and near at hand. Worse are the guest-retention notes threaded between the menus: repeat the flattering story, refill the cup, reseat anyone who speaks too often of leaving, and if courtesy fails, move them deeper into the house until departure sounds impolite even to themselves.';
          }

          return 'The desk still offers the same ugly bookkeeping: Plum reduced to upkeep notes and guests reduced to retention strategy. Oshregaal does not merely host people; he edits them toward staying.';
        }

        if (target.includes('vanity') || target.includes('mirror') || target.includes('drawer')) {
          if (!getFlag('waxPlugFound')) {
            setFlag('waxPlugFound', true);
            return 'A quick search of the vanity turns up scented powder, rings, and a wrapped plug of dark ear wax hidden behind a comb. Someone in this house has already learned that certain voices are easier to survive muffled.';
          }

          return 'The vanity drawers still hold powders, seals, and old narcotic perfumes, but the useful discovery remains the missing space where the wax plug had been tucked away.';
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
    items: [velvetBed, waxPlug],
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
      },
      vanity: 'The mirrored vanity is crowded with perfumes, rings, powders, and small aids to self-invention.',
      mirror: {
        description({ getFlag }) {
          if (getFlag('oshregaalNoDepartureKnown')) {
            return 'The mirror flatters the room and incriminates it at the same time. With the retention notes in mind, even your own reflection looks briefly like another guest being arranged for easier keeping.';
          }

          return 'The mirror flatters the room and incriminates it at the same time.';
        },
      },
      hand: {
        name: 'iron hand',
        aliases: ['metal hand', 'door hand', 'iron hand'],
        description: 'The hand is bolted where a knob ought to be, fingers slightly curled, palm open for a greeting no sensible architect would have requested.',
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