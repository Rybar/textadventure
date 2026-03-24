import { Item } from '../../engine/models/item.js';
import { Room } from '../../engine/models/room.js';

export function createBathroomRoom() {
  const scentedSoap = new Item({
    id: 'scented-soap',
    name: 'scented soap',
    aliases: ['soap', 'soap cake'],
    description: 'A guest-quality soap cake pressed with lilies and gold leaf, luxurious enough to feel faintly accusatory in this house.',
    actions: {
      smell() {
        return 'The soap smells of lilies, powder, and the expensive fiction that cleanliness proves innocence.';
      },
    },
  });

  const silverMirror = new Item({
    id: 'silver-mirror',
    name: 'silver mirror',
    aliases: ['mirror', 'hand mirror'],
    description: 'A silver-backed hand mirror polished to the kind of brightness that suggests a guest is expected to rehearse their face before rejoining the house.',
    actions: {
      look() {
        return 'The mirror returns your face with insulting clarity. Beneath the candlelight, you look more like a guest than is remotely safe.';
      },
    },
  });

  return new Room({
    id: 'bathroom',
    title: 'Bathroom',
    description: ({ isItemVisibleHere }) => {
      const mirrorLine = isItemVisibleHere('silver-mirror')
        ? 'A claw-foot bath, a silver-backed mirror, and a cabinet of soaps and powders all suggest that even hygiene here is a performance.'
        : 'A claw-foot bath, an empty stand where the guest hand mirror had been set, and a cabinet of soaps and powders all suggest that even hygiene here is a performance.';

      return `
  The guest bathroom is absurdly luxurious in the punishing way only Oshregaal's house could manage. Marble tile gleams under flattering candlelight. ${mirrorLine}
West lies the guest room. Somewhere behind the eastern tilework, a sour draft keeps ruining the illusion.
`.trim();
    },
    exits: {
      west: 'guestRoom',
      down: 'cesspool',
    },
    exitGuards: {
      down({ getFlag }) {
        if (getFlag('bathroomPanelOpened')) {
          return null;
        }

        return 'You find no open way down. The plumbing is better hidden than the hospitality.';
      },
    },
    verbs: {
      search({ command, getFlag, setFlag }) {
        const target = command.directObject;

        if (!target || target.includes('bathroom') || target.includes('tile') || target.includes('floor') || target.includes('wall')) {
          if (!getFlag('bathroomRouteKnown')) {
            setFlag('bathroomRouteKnown', true);
            return 'You kneel among the polished tiles and find scrape marks around a decorative cistern panel. Behind the perfume and marble, a sour draft rises from maintenance space below. The house, apparently, has a digestive tract and only modest shame about hiding it.';
          }

          return 'The tile seams still betray the concealed maintenance panel. Luxury is only a lid on the route below.';
        }

        if (target.includes('cabinet') || target.includes('soap') || target.includes('powder')) {
          return 'The cabinet holds guest soaps, powders, and oils expensive enough to flatter the living and impress the dead. Even the toiletries here feel like diplomatic instruments issued to faces before reentry.';
        }

        if (target.includes('bath') || target.includes('tub') || target.includes('commode')) {
          return 'The fixtures are oversized, overdesigned, and almost ceremonial. Oshregaal appears to believe even private functions should feel curated and gently surveilled by taste.';
        }

        return `You search the ${target} and discover only polish, plumbing, and one more proof that the house considers privacy a decorative genre.`;
      },
    },
    items: [scentedSoap, silverMirror],
    conditionalDescriptions: [
      {
        when: ({ getFlag }) => getFlag('bathroomRouteKnown'),
        text: 'Now that you have noticed the scrape marks, the decorative cistern panel no longer reads as ornament. It reads as access pretending to be refinement.',
      },
      {
        when: ({ getFlag }) => getFlag('bathroomPanelOpened'),
        text: 'The opened cistern panel exposes a service descent below the marble, carrying up the candid smell of the house\'s underside and ruining the room\'s manners all by itself.',
      },
    ],
    objects: {
      panel: {
        name: 'cistern panel',
        aliases: ['panel', 'hatch', 'maintenance panel', 'cistern hatch'],
        description({ getFlag }) {
          if (getFlag('bathroomPanelOpened')) {
            return 'The cistern panel stands open now, exposing a narrow service descent built for cleaners, not guests.';
          }

          if (getFlag('bathroomRouteKnown')) {
            return 'The decorative panel sits slightly proud of the surrounding tile. Once noticed, the hidden seam is impossible not to resent.';
          }

          return 'The panel is disguised well enough to look purely decorative until you start distrusting the plumbing.';
        },
        actions: {
          open({ getFlag, setFlag }) {
            if (getFlag('bathroomPanelOpened')) {
              return 'The cistern panel already stands open, exposing the service descent below.';
            }

            setFlag('bathroomRouteKnown', true);
            setFlag('bathroomPanelOpened', true);
            return 'You work your fingers into the tile seam and pull. A concealed cistern panel swings free, releasing a rank breath from the service shaft below. So much for luxury remaining a complete argument.';
          },
        },
      },
      bath: 'The bath is big enough to suggest that Oshregaal imagines cleanliness as a theatrical event rather than a practical one.',
      cabinet: 'The cabinet shelves are lined with folded towels, scented soaps, and enough powder to make a nervous guest look deliberately calm.',
      tiles: {
        name: 'marble tile',
        aliases: ['tile', 'tiles', 'tilework', 'marble tile', 'eastern tilework'],
        description({ getFlag }) {
          if (getFlag('bathroomPanelOpened')) {
            return 'The marble tile still gleams, but the opened seam in the eastern tilework has ruined its argument. Luxury now has to coexist with a visible access hatch into the house\'s underside.';
          }

          if (getFlag('bathroomRouteKnown')) {
            return 'The eastern tilework is almost too precise. Once you have noticed the scrape marks and hidden seam, the marble stops reading as refinement and starts reading as camouflage.';
          }

          return 'The marble tile gleams with punitive luxury, the sort that makes a guest feel improved and observed at the same time.';
        },
      },
      draft: {
        aliases: ['draft', 'sour draft'],
        description: 'The sour draft threading out of the eastern wall smells like wet stone, stale runoff, and the house losing control of its own dignity below the polished surfaces.',
      },
      candlelight: 'The flattering candlelight does expensive work on the room, softening every surface just enough to make the plumbing seem cultured instead of sinister.',
      commode: 'The commode is polished to a level of dignity no object in that profession should ever be forced to maintain.',
      towels: 'The towels are folded with priestly care and smell faintly of lavender trying to overpower limestone.',
    },
  });
}

export default createBathroomRoom;