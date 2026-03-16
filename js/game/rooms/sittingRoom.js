import { Item } from '../../engine/models/item.js';
import { Room } from '../../engine/models/room.js';

export function createSittingRoom() {
  const fountain = new Item({
    id: 'fountain',
    name: 'fountain',
    description: 'A small fountain of sparkling water bubbles in the corner, too tasteful to be innocent.',
    actions: {
      drink() {
        return 'The water is crisp and impossibly clean. It leaves you refreshed, slightly foolish, and convinced for a moment that obedience might not be the worst thing in the world.';
      },
      listen() {
        return 'The fountain chatters over itself in a polite little voice, as though rehearsing conversation topics for nervous guests.';
      },
    },
    portable: false,
  });

  const glassCup = new Item({
    id: 'glass-cup',
    name: 'glass cup',
    aliases: ['cup'],
    description: 'A thin glass cup light enough to feel expensive and breakable in equal measure.',
  });

  const folio = new Item({
    id: 'skin-folio',
    name: 'folio',
    aliases: ['book', 'skin-bound folio'],
    description: 'A skin-bound folio full of skinned cats and nonsense writing, the sort of object designed either to impress or to remove the right kind of guest.',
    actions: {
      read() {
        return 'The text remains gibberish no matter how carefully you study it. The cats, however, seem annotated with total seriousness.';
      },
    },
  });

  const couch = new Item({
    id: 'breathing-couch',
    name: 'couch',
    aliases: ['couches', 'sofa'],
    description: 'Four couches upholstered in leather, lace, canvas, and fur. If you watch long enough, they begin to breathe in slow domestic harmony.',
    actions: {
      listen() {
        return 'The couches whisper to one another about the staff, the guests, and Grandfather’s latest weight gain with malicious household intimacy.';
      },
      sit() {
        return 'The couch yields under you like a living thing considering whether to tolerate your presence.';
      },
    },
    portable: false,
  });

  return new Room({
    id: 'sittingRoom',
    title: 'Sitting Room',
    description: `
This room is arranged for guests who are expected to wait and, while waiting, question their instincts.
Four couches of mismatched luxury breathe almost imperceptibly around a low table of obscene folios. In the corner, a fountain spills bright water into a basin lined with stacked glass cups.
The foyer lies back to the east.
`.trim(),
    exits: {
      east: 'foyer',
    },
    items: [fountain, glassCup, folio, couch],
  });
}

export default createSittingRoom;