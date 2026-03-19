import { Room } from '../../engine/models/room.js';

export function createPitLedgeRoom() {
  return new Room({
    id: 'pitLedge',
    title: 'Pit Ledge',
    description: `
Below the eastern side of the grand stair, a narrow maintenance ledge clings to the mansion wall above a foul drop. Mineral runoff glistens on the stone. To the east, a darker service opening leads into the house\'s underside, while a low drainage cleft opens west toward the cavern.
The stair above waits up the wall like the last respectable thought available down here.
`.trim(),
    exits: {
      up: 'grandStairs',
      east: 'cesspool',
      west: 'cavern',
    },
    verbs: {
      search({ command, getFlag, setFlag }) {
        const target = command.directObject;

        if (!target || target.includes('ledge') || target.includes('pit') || target.includes('runoff') || target.includes('wall')) {
          if (!getFlag('eastRunoffNoted')) {
            setFlag('eastRunoffNoted', true);
          }

          return 'The ledge is scored by servant boots and runoff scraping tools. Whatever drains through the house ends up routed past this lip before reaching the cavern. The east opening smells worse and therefore more usefully.';
        }

        return `You search the ${target} and find slick stone, servant wear, and no reason to trust your footing.`;
      },
    },
    objects: {
      cleft: 'The drainage cleft is low, wet, and entirely free of ceremony. It opens west toward the cavern like the house apologizing badly.',
      opening: 'The eastern service opening leads into a deeper reek and the wet echo of the house digesting itself.',
      wall: 'The mansion wall here is stripped of performance. It is only stone, stains, and maintenance.',
    },
  });
}

export default createPitLedgeRoom;