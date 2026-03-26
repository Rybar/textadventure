import { Room } from '../../engine/models/room.js';

import { createCorrectionBellCard } from '../items/correctionBellCard.js';
import { createCorrectionRoster } from '../items/correctionRoster.js';

export function createSealedRoom() {
  const correctionBellCard = createCorrectionBellCard();
  const correctionRoster = createCorrectionRoster();
  correctionBellCard.hide();

  const submitToCorrection = ({ session }) => session.triggerGameOver(
    'The chair receives you with practiced efficiency. Straps settle, the speaking tube opens, and the room begins explaining you back to yourself in the flat institutional tone reserved for people already reclassified as manageable. By the time panic finishes arriving, correction has already become procedure.',
    { persistentFlags: ['correctionGameOverSeen'], branchId: 'correction-chair' },
  );

  return new Room({
    id: 'sealedRoom',
    title: 'Sealed Room',
    description: ({ isItemVisibleHere }) => {
      const rosterLine = isItemVisibleHere('correction-roster')
        ? 'Someone has left a clipped correction roster on the basin shelf, either through negligence or because bureaucracy eventually stops seeing its victims as readers.'
        : 'The basin shelf shows the clipped indentation where a correction roster had been left until someone sensible removed it.';

      return `
The hidden chamber beyond the spider room is not a dungeon but something worse: a correction room dressed in the language of care. A restraint chair faces a brass speaking tube. A serving hatch sits flush in the wall beside a wash basin and floor drain polished by too much cleaning.
${rosterLine}
Nothing here is theatrical. That is what makes it cruel. South lies the concealed seam back to the web-dark chamber.
`.trim();
    },
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
      search({ command, getFlag, setFlag, isItemVisibleHere }) {
        const target = command.directObject;

        if (!target || target.includes('room') || target.includes('chair') || target.includes('wall')) {
          if (!correctionBellCard.visible) {
            correctionBellCard.reveal();
          }

          if (getFlag('correctionBellCodeKnown')) {
            const rosterText = isItemVisibleHere('correction-roster')
              ? 'a clipped correction roster'
              : 'the clip where a correction roster had been left';
            const tubeText = isItemVisibleHere('correction-bell-card')
              ? 'the folded service card you already pulled free from behind the speaking tube'
              : 'the speaking tube from behind which a folded service card had already been removed';

            return `You search the correction room again and find the same bureaucratic horror: restraint, feeding, washing, ${rosterText}, and ${tubeText} through which the house explained itself to people it had temporarily downgraded from guest to problem.`;
          }

          const rosterText = isItemVisibleHere('correction-roster')
            ? 'a clipped correction roster by the basin'
            : 'the empty clip where a correction roster had been left by the basin';
          return `A close search reveals straps on the chair, tally scratches on the wall, ${rosterText}, and a folded service card jammed behind the speaking tube where one desperate occupant must have hidden it.`;
        }

        if (target.includes('tube') || target.includes('speaking tube') || target.includes('hatch')) {
          if (!getFlag('correctionBellCodeKnown') && !correctionBellCard.visible) {
            correctionBellCard.reveal();
          }

          return isItemVisibleHere('correction-bell-card')
            ? 'Behind the speaking tube grille, someone has wedged a folded service card just out of immediate sight, betting that future captivity would reward thoroughness.'
            : 'The speaking tube and serving hatch now read as parts of the same system: explanation, feeding, waiting, correction. The hidden card that once sat behind the grille is already gone.';
        }

        if (target.includes('roster') || target.includes('log') || target.includes('protocol') || target.includes('slate')) {
          if (!getFlag('containmentProtocolKnown')) {
            setFlag('containmentProtocolKnown', true);
          }

          return 'The clipped roster sorts captives into correction categories with revolting calm. It is not a list of prisoners so much as a workflow for turning guests into manageable problems.';
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
    items: [correctionBellCard, correctionRoster],
    conditionalDescriptions: [
      {
        when: ({ getFlag }) => getFlag('containmentProtocolKnown'),
        text: 'Having read the correction roster, the room now feels less like hidden cruelty than a maintained system for downgrading people into procedure.',
      },
      {
        when: ({ getFlag }) => getFlag('correctionBellCodeKnown'),
        text: 'Now that you have read the hidden service card, the room feels even worse: not a fit of sadism, but an established procedure.',
      },
    ],
    objects: {
      chair: {
        name: 'restraint chair',
        aliases: ['chair', 'restraint', 'straps'],
        description: 'The restraint chair is upholstered for long use, not brief violence. The distinction is unforgivable.',
        actions: {
          sit: submitToCorrection,
          use: submitToCorrection,
          sleep: submitToCorrection,
        },
      },
      hatch: 'The serving hatch is just large enough for food, medicine, or smaller humiliations.',
      tube: {
        description({ isItemVisibleHere }) {
          return isItemVisibleHere('correction-bell-card')
            ? 'The brass speaking tube allowed the house to explain itself without having to share a room with the corrected. Behind the grille, a folded service card is wedged where only a thorough captive would think to hide it.'
            : 'The brass speaking tube allowed the house to explain itself without having to share a room with the corrected. The hidden card that once sat behind the grille is already gone.';
        },
      },
      seam: 'The concealed southern seam is so clean it feels procedural. Even the room\'s exits have been designed to imply that departure is a maintenance task, not a right.',
      slate: {
        description({ isItemVisibleHere }) {
          if (isItemVisibleHere('correction-roster')) {
            return 'Tally scratches and erased notations on the wall reduce prior resistance to a maintenance category. A clipped correction roster hangs nearby with the same chill professionalism.';
          }

          return 'Tally scratches and erased notations on the wall reduce prior resistance to a maintenance category. The empty clip nearby suggests the correction roster has already been removed.';
        },
      },
      basin: 'The wash basin is polished to the point of accusation.',
      drain: 'The floor drain proves the house expected messes and intended to keep making them disappear.',
    },
  });
}

export default createSealedRoom;