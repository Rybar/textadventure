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
        return 'The bed curtains are embroidered with constellations, tusks, and banquets. One corner still smells faintly of perfume and medicinal wine.';
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
          return 'You sift through guest lists, menu notes, and cruelly edited anecdotes prepared for dinner. Beneath them all is a thinner stack recording "corrections" to the scribe in the north room: memory lapses, mood compliance, and reminders to keep her grateful, legible, and near at hand.';
        }

        if (target.includes('vanity') || target.includes('mirror') || target.includes('drawer')) {
          if (!getFlag('waxPlugFound')) {
            setFlag('waxPlugFound', true);
            return 'A quick search of the vanity turns up scented powder, rings, and a wrapped plug of dark ear wax hidden behind a comb. Someone in this house has already learned that certain voices are easier to survive muffled.';
          }

          return 'The vanity drawers still hold powders, seals, and old narcotic perfumes, but the useful discovery remains the missing space where the wax plug had been tucked away.';
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
    ],
    objects: {
      desk: 'The desk is littered with corrected invitations, revised anecdotes, and petty dominion preserved as paperwork.',
      vanity: 'The mirrored vanity is crowded with perfumes, rings, powders, and small aids to self-invention.',
      mirror: 'The mirror flatters the room and incriminates it at the same time.',
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