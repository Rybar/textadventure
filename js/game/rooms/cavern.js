import { Item } from '../../engine/models/item.js';
import { Room } from '../../engine/models/room.js';

export function createCavernRoom() {
  const puddle = new Item({
    id: 'puddle',
    name: 'puddle',
    aliases: ['pool', 'water'],
    description: 'A shallow calcium-rimmed pool reflects the marble stair and the dark roof of the cavern in a broken shimmer.',
    actions: {
      drink() {
        return 'The water tastes of lime, old stone, and the kind of cold that belongs underground.';
      },
    },
    portable: false,
  });

  return new Room({
    id: 'cavern',
    title: 'Cavern',
    description: `
You stand in a vast natural cavern before a mansion built directly into the northern wall, all white marble stairs and gaudy windows above black stone.
Water gathers in pale mineral pools beneath your boots. Chain-wrapped stalactites hang above like restrained teeth.
The main stair rises to the mansion doors, while a narrower path wanders northwest into a choking stand of giant ferns.
`.trim(),
    exits: {
      north: 'grandStairs',
      northwest: 'fernGarden',
    },
    items: [puddle],
    objects: {
      mansion: 'The mansion looks as though a nobleman commissioned it and a fever designed the details later. Windows gleam in two levels across the cavern wall.',
      windows: 'Nine windows watch the cavern. Most are curtained, as if the house has decided what deserves to be seen.',
      stalactites: 'Each stalactite is wrapped in chain. The effect is less protective than punitive.',
      stairs: 'Broad white marble stairs climb toward the double doors with theatrical confidence.',
      doors: 'The double doors atop the stairs are the sort built to admit honored guests and trap them later.',
    },
  });
}

export default createCavernRoom;