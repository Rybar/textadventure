import { Room } from '../../engine/models/room.js';

import { createGreyGrinBlade } from '../items/greyGrinBlade.js';

export function createTrophyRoom() {
  const greyGrinBlade = createGreyGrinBlade();

  return new Room({
    id: 'trophyRoom',
    title: 'Trophy Room',
    description: `
This private gallery feels more prosecutorial than decorative. Glass cases, lacquered plaques, and stolen honors line the walls in rows meant to prove that conquest can be curated into taste.
At the center, on a blackwood stand beneath a cone of disciplined light, rests the Grey Grin Blade. West lies the library through a concealed panel.
`.trim(),
    exits: {
      west: 'library',
    },
    verbs: {
      search({ command }) {
        const target = command.directObject;

        if (!target || target.includes('room') || target.includes('gallery') || target.includes('cases')) {
          return 'You search the gallery and find plaques, clan marks, stolen devotional objects, and the sort of curated triumph that makes theft feel less like crime than correction.';
        }

        if (target.includes('blade') || target.includes('stand') || target.includes('pedestal')) {
          return 'The Grey Grin Blade is displayed with the smug precision of an object its owner loves too much to hide and too much to use casually.';
        }

        if (target.includes('plaque') || target.includes('honor') || target.includes('trophy')) {
          return 'Most plaques reduce atrocities to inheritance and theft to prestige. Oshregaal has edited history into interior decoration.';
        }

        return `You search the ${target} and come away with a stronger desire to rob the room on principle.`;
      },
    },
    items: [greyGrinBlade],
    conditionalDescriptions: [
      {
        when: ({ worldState }) => {
          const location = worldState.getItemLocation('grey-grin-blade');
          return !location || location.type !== 'room' || location.roomId !== 'trophyRoom';
        },
        text: 'The blackwood stand at the room\'s center now sits empty, which improves the gallery morally if not aesthetically.',
      },
    ],
    objects: {
      cases: 'The glass cases hold medals, seals, relics, and trophies taken from people whose stories were apparently not permitted to accompany their possessions.',
      stand: 'The blackwood stand was built to flatter the blade and belittle everyone who ever lost it.',
      plaques: 'Each plaque is written in the tone of a host introducing his own crimes as anecdotes with pedigree.',
      panel: 'From inside the room, the concealed western panel looks obvious, which is how hidden doors often mock the people still outside them.',
    },
  });
}

export default createTrophyRoom;