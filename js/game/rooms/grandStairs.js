import { Item } from '../../engine/models/item.js';
import { Room } from '../../engine/models/room.js';

export function createGrandStairsRoom() {
  const redCloak = new Item({
    id: 'red-cloak',
    name: 'red cloak',
    aliases: ['cloak'],
    description: 'A richly cut red cloak hung over one gargoyle claw, theatrical enough that it might count as a disguise at a distance.',
    actions: {
      wear() {
        return 'You settle the red cloak over your shoulders. It improves your silhouette and worsens your conscience.';
      },
    },
  });

  return new Room({
    id: 'grandStairs',
    title: 'Grand Stairs',
    description: `
The white marble stair rises in a broad ceremonial sweep toward the mansion doors. Two stone gargoyles in absurd festive caps stand sentry on either side.
One of them has been draped with a fine red cloak, as though even the statuary must dress for dinner.
`.trim(),
    exits: {
      south: 'cavern',
      north: 'foyer',
    },
    items: [redCloak],
    objects: {
      gargoyles: 'The gargoyles are nonmagical, though each wears its ridiculous hat with enough dignity to make mockery seem rude.',
      hats: 'Pointed festive hats trimmed in faded gold thread. Someone in this house believes solemnity and comedy should always dine together.',
      doors: 'The double doors are polished and imposing. Beyond them lies warmth, light, and likely the first mistake of the evening.',
    },
  });
}

export default createGrandStairsRoom;