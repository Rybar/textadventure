import { Item } from '../../engine/models/item.js';

export function createCorrectionBellCard() {
  return new Item({
    id: 'correction-bell-card',
    name: 'correction bell card',
    aliases: ['bell card', 'correction slip', 'bell code', 'service card'],
    description: 'A folded service card hidden behind the speaking tube, written in the dry shorthand of household correction protocol.',
    actions: {
      read({ getFlag, setFlag }) {
        if (!getFlag('correctionBellCodeKnown')) {
          setFlag('correctionBellCodeKnown', true);
        }

        return 'The card reads: "DOUBLE RING FOR CORRECTION STAFF. REMOVE FRONT-OF-HOUSE ATTENDANTS BEFORE TRANSFER." Someone has underlined REMOVE with desperate satisfaction. You now know how to pull the guest bell in a way that drags Oggaf and Zamzam away from the foyer for a short interval.';
      },
    },
  });
}

export default createCorrectionBellCard;