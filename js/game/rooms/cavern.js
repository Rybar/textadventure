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
    verbs: {
      search({ command, getFlag, setFlag }) {
        const target = command.directObject;

        if (!target || target.includes('cavern') || target.includes('ground') || target.includes('pool') || target.includes('puddle')) {
          if (!getFlag('cavernWindowRouteKnown')) {
            setFlag('cavernWindowRouteKnown', true);
            return 'You pick through the wet stone and mineral crust until you find broken white plaster beneath the wall. Looking up again, you realize one high service window is cracked open a finger-width wider than the others. Not usable from here, but enough to prove the house leaks in more ways than the front door admits.';
          }

          return 'The pools still hide broken plaster and grit fallen from above. Once noticed, the slightly open service window cannot be mistaken for decoration.';
        }

        if (target.includes('window')) {
          if (!getFlag('cavernWindowRouteKnown')) {
            setFlag('cavernWindowRouteKnown', true);
            return 'You study the mansion facade until one upper window resolves itself as subtly different: not merely curtained, but imperfectly shut. Pale plaster dust below suggests it opens often enough to shed crumbs of the wall.';
          }

          return 'One upper service window remains cracked open by a mean, practical margin. It is too high to help you now, but too real to ignore.';
        }

        return `You search the ${target} and find only damp stone, lime scale, and cavern patience.`;
      },
    },
    items: [puddle],
    conditionalDescriptions: [
      {
        when: ({ getFlag }) => getFlag('cavernWindowRouteKnown'),
        text: 'High above, one service window now stands out as slightly ajar, a tiny architectural indiscretion in an otherwise composed facade.',
      },
    ],
    objects: {
      mansion: 'The mansion looks as though a nobleman commissioned it and a fever designed the details later. Windows gleam in two levels across the cavern wall.',
      windows: 'Nine windows watch the cavern. Most are curtained, as if the house has decided what deserves to be seen.',
      stalactites: 'Each stalactite is wrapped in chain. The effect is less protective than punitive.',
      stairs: 'Broad white marble stairs climb toward the double doors with theatrical confidence.',
      doors: 'The double doors atop the stairs are the sort built to admit honored guests and trap them later.',
      plaster: {
        description({ getFlag }) {
          if (!getFlag('cavernWindowRouteKnown')) {
            return 'There is some white grit among the darker stone, but nothing you would yet call meaningful plasterfall.';
          }

          return 'The fallen plaster is fresh enough to connect with the slightly open service window above. The house is shedding evidence of quieter traffic.';
        },
      },
    },
  });
}

export default createCavernRoom;