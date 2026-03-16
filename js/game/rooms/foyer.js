import { Item } from '../../engine/models/item.js';
import { Room } from '../../engine/models/room.js';

export function createFoyerRoom() {
  const blackCloak = new Item({
    id: 'black-cloak',
    name: 'black cloak',
    aliases: ['cloak', 'black coat'],
    description: 'A heavy black cloak cut for dramatic entrances and forgiving shadows.',
    actions: {
      wear() {
        return 'You put on the black cloak. It hangs with enough authority to make lesser lies feel plausible.';
      },
    },
  });

  const piano = new Item({
    id: 'piano-creature',
    name: 'piano creature',
    aliases: ['piano', 'creature'],
    description: 'A grand piano perched on crabbed feet, singing baritone opera to no one in particular. The lacquered lid trembles slightly when it holds a note.',
    actions: {
      listen() {
        return 'The piano creature sings about appetite, empire, and a moon that drowned itself in butter. The tune is lovely. The words are less so.';
      },
      look() {
        return 'From the front it is merely uncanny. From the wrong angle it becomes obvious that something anatomical has been forced into the shape of an instrument.';
      },
    },
    portable: false,
  });

  const coatRack = new Item({
    id: 'coat-rack',
    name: 'coat rack',
    aliases: ['rack'],
    description: 'A polished rack that holds cloaks for guests and, perhaps, a few for those who never quite finished leaving.',
    portable: false,
  });

  return new Room({
    id: 'foyer',
    title: 'Foyer',
    description: `
The foyer is all red carpet, white pillars, and overconfident elegance. A crystal chandelier burns overhead with a light too flattering to be trusted.
Two mutant ogre butlers stand on ceremonial alert near the center of the hall while a piano creature sings to the chandelier as if it were royalty.
West lies a sitting room for waiting guests. A stair curves up to the guest rooms, and a broad passage north opens toward the smell of dinner.
`.trim(),
    exits: {
      south: 'grandStairs',
      west: 'sittingRoom',
      north: 'feastHall',
      up: 'guestRoom',
    },
    items: [blackCloak, piano, coatRack],
    objects: {
      ogres: 'The ogre butlers bow with alarming grace. One has three arms and the other two heads. Both radiate the polite confidence of men who can remove a guest in pieces.',
      'ogre butlers': 'The butlers have impeccable posture, white gloves stretched across enormous hands, and the expression of staff who have seen every possible impropriety.',
      oggaf: 'Oggaf has three arms and the air of a servant who takes correct introductions personally.',
      zamzam: 'Zamzam wears two hats because he has two heads and no patience for compromise.',
      chandelier: 'The chandelier is large enough to bankrupt a lesser noble house and bright enough to make every stain elsewhere feel intentional.',
    },
  });
}

export default createFoyerRoom;