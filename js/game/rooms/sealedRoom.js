import { Room } from '../../engine/models/room.js';

import { createCorrectionBellCard } from '../items/correctionBellCard.js';

export function createSealedRoom() {
  const correctionBellCard = createCorrectionBellCard();

  return new Room({
    id: 'sealedRoom',
    title: 'Sealed Room',
    description: `
The hidden chamber beyond the spider room is not a dungeon but something worse: a correction room dressed in the language of care. A restraint chair faces a brass speaking tube. A serving hatch sits flush in the wall beside a wash basin and floor drain polished by too much cleaning.
Nothing here is theatrical. That is what makes it cruel. South lies the concealed seam back to the web-dark chamber.
`.trim(),
    exits: {
      south: 'spiderRoom',
    },
    triggers: {
      enter: [
        {
          id: 'sealedRoom:first-entry',
          once: true,
          run: ({ setFlag }) => {
            setFlag('sealedRoomEntered', true);
            return 'The room answers your arrival with a dampened hush, as if it was built to keep panic private and obedience legible.';
          },
        },
      ],
    },
    verbs: {
      search({ command, getFlag }) {
        const target = command.directObject;

        if (!target || target.includes('room') || target.includes('chair') || target.includes('wall')) {
          return getFlag('correctionBellCodeKnown')
            ? 'You search the correction room again and find the same bureaucratic horror: restraint, feeding, washing, and the speaking tube through which the house explained itself to people it had temporarily downgraded from guest to problem.'
            : 'A close search reveals straps on the chair, tally scratches on the wall, and a folded service card jammed behind the speaking tube where one desperate occupant must have hidden it.';
        }

        if (target.includes('tube') || target.includes('speaking tube') || target.includes('hatch')) {
          return getFlag('correctionBellCodeKnown')
            ? 'The speaking tube and serving hatch now read as parts of the same system: explanation, feeding, waiting, correction.'
            : 'Behind the speaking tube grille, someone has wedged a folded service card just out of immediate sight, betting that future captivity would reward thoroughness.';
        }

        if (target.includes('chair') || target.includes('strap') || target.includes('restraint')) {
          return 'The chair is padded, strapped, and adjustable in all the ways a polite torment requires. Oshregaal does not merely punish. He standardizes.';
        }

        if (target.includes('drain') || target.includes('basin')) {
          return 'The basin and floor drain are clean enough to suggest repeated washing rather than neglect. The room was built to make correction look hygienic.';
        }

        return `You search the ${target} and learn only that civilized cruelty takes very good notes.`;
      },
    },
    items: [correctionBellCard],
    conditionalDescriptions: [
      {
        when: ({ getFlag }) => getFlag('correctionBellCodeKnown'),
        text: 'Now that you have read the hidden service card, the room feels even worse: not a fit of sadism, but an established procedure.',
      },
    ],
    objects: {
      chair: 'The restraint chair is upholstered for long use, not brief violence. The distinction is unforgivable.',
      hatch: 'The serving hatch is just large enough for food, medicine, or smaller humiliations.',
      tube: 'The brass speaking tube allowed the house to explain itself without having to share a room with the corrected.',
      slate: 'Tally scratches and erased notations on the wall reduce prior resistance to a maintenance category.',
      basin: 'The wash basin is polished to the point of accusation.',
      drain: 'The floor drain proves the house expected messes and intended to keep making them disappear.',
    },
  });
}

export default createSealedRoom;