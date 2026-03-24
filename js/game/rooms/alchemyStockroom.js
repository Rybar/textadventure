import { Room } from '../../engine/models/room.js';

import { createBlackWindElixir } from '../items/blackWindElixir.js';
import { createBlackWindFruit } from '../items/blackWindFruit.js';
import { createBlackWindLedger } from '../items/blackWindLedger.js';

export function createAlchemyStockroom() {
  const fruit = createBlackWindFruit();
  const elixir = createBlackWindElixir();
  const ledger = createBlackWindLedger();
  const canRevealTreePassage = getFlag => getFlag('blackWindSourceLeadKnown') || getFlag('blackWindEvidenceCollected');

  const describeStockroomSearch = ({ getFlag, setFlag }) => {
    if (!getFlag('blackWindStockroomSearched')) {
      setFlag('blackWindStockroomSearched', true);
      return 'You inspect the hidden stock with growing unease: sealed black fruit in padded trays, reduced elixir in coded phials, and one narrow ledger kept nearest the door for fast access and faster concealment.';
    }

    return 'The stockroom remains an accountant\'s nightmare and a warlord\'s pantry: fruit, elixir, and records stored with equal care.';
  };

  const describeCommoditySearch = ({ target, getFlag }) => {
    if (target.includes('fruit')) {
      return getFlag('blackWindFruitConsumed')
        ? 'One tray sits empty now. The remaining fruit still looks less harvested than harvested from somewhere that should have stayed theoretical.'
        : 'The black-wind fruit looks almost lacquered, each piece nested in padding as if it were both luxury produce and unstable ordnance.';
    }

    if (target.includes('elixir') || target.includes('phial')) {
      return getFlag('blackWindElixirConsumed')
        ? 'One coded slot in the phial rack is conspicuously empty now, which makes the remaining doses look even less medicinal and more transactional.'
        : 'The reduced elixir has been measured into transport phials with commercial neatness. Whatever this substance does to a body, the house has learned to invoice it.';
    }

    return 'The jars and phials are meticulously labeled in euphemism. Whatever Oshregaal calls hospitality in public, here he calls it inventory.';
  };

  const describeLedgerSearch = getFlag => getFlag('blackWindEvidenceCollected')
    ? 'The ledger has already told you enough to ruin several powerful dinners.'
    : 'The ledger is the least occult object in the room and therefore the most dangerous: plain columns of proof with nowhere for the truth to hide.';

  const describeDrainSearch = ({ getFlag, emitEvent }) => {
    if (getFlag('blackWindTreePassageFound')) {
      return 'The iron drain grate now stands ajar, exposing the narrow stair that drops below the stockroom into the chamber feeding Oshregaal\'s private orchard.';
    }

    if (canRevealTreePassage(getFlag)) {
      return emitEvent('discoverBlackWindTreePassage');
    }

    return 'The drain smells colder than the rest of the room, all bitter resin and root rot. Something moves beneath the stockroom, but you do not yet have enough context to turn suspicion into a route.';
  };

  return new Room({
    id: 'alchemyStockroom',
    title: 'Alchemical Stockroom',
    description: ({ isItemVisibleHere }) => {
      const stockLine = isItemVisibleHere('black-wind-ledger')
        ? 'Iron racks hold lacquered boxes, sealed fruit jars, wax-stoppered phials, and folded inventories written for people who expect both miracles and deniability.'
        : 'Iron racks hold lacquered boxes, sealed fruit jars, wax-stoppered phials, and a conspicuous gap where one narrow ledger had been kept nearest the door for fast concealment.';

      return `
This narrow hidden stockroom crouches behind the kitchen wall in refrigerated secrecy. ${stockLine}
The air smells of bitter resin, old sugar, and medicinal rot. West lies the kitchen through the disguised pantry door.
`.trim();
    },
    exits: {
      west: 'kitchen',
      down: 'blackWindTreeChamber',
    },
    exitGuards: {
      down({ getFlag }) {
        if (getFlag('blackWindTreePassageFound')) {
          return null;
        }

        return 'You find no obvious way down from the stockroom.';
      },
    },
    verbs: {
      search({ command, getFlag, setFlag, emitEvent, isItemVisibleHere }) {
        const target = command.directObject;

        if (!target || target.includes('room') || target.includes('racks') || target.includes('stock')) {
          return describeStockroomSearch({ getFlag, setFlag });
        }

        if (target.includes('drain') || target.includes('floor') || target.includes('grate') || target.includes('roots') || target.includes('residue')) {
          return describeDrainSearch({ getFlag, emitEvent });
        }

        if (target.includes('fruit') || target.includes('jar') || target.includes('phial') || target.includes('elixir')) {
          return describeCommoditySearch({ target, getFlag });
        }

        if (target.includes('ledger') || target.includes('records') || target.includes('book')) {
          return isItemVisibleHere('black-wind-ledger')
            ? describeLedgerSearch(getFlag)
            : getFlag('blackWindEvidenceCollected')
              ? 'The ledger has already told you enough to ruin several powerful dinners, and it is no longer sitting here waiting to be discovered twice.'
              : 'The narrow space nearest the door shows where the ledger had been kept for fast access and faster concealment.';
        }

        return `You search the ${target} and find only further evidence that corruption here is warehoused, counted, and shipped.`;
      },
    },
    items: [fruit, elixir, ledger],
    conditionalDescriptions: [
      {
        when: ({ getFlag }) => getFlag('blackWindEvidenceCollected'),
        text: 'Now that you understand the ledger, the room stops feeling like a stash and starts feeling like an indictment warehouse.',
      },
      {
        when: ({ getFlag }) => getFlag('blackWindFruitConsumed') || getFlag('blackWindElixirConsumed'),
        text: 'One section of the stock now carries the small but obvious violence of private tampering: someone has not merely discovered the contraband here, but participated in it.',
      },
      {
        when: ({ getFlag }) => getFlag('blackWindTreePassageFound'),
        text: 'A lifted iron drain grate now exposes a narrow service stair descending beneath the stockroom toward the roots feeding the whole trade.',
      },
    ],
    objects: {
      racks: 'Iron racks climb the walls, packed with jars, phials, wrapped trays, and coded storage slips meant for private commerce rather than household use.',
      jars: 'Opaque jars sit in chilled rows, each marked with batch codes and discreet tusk-house sigils instead of honest names.',
      phials: 'The phials are sealed in black wax and numbered for transport. None of this was prepared for local use alone.',
      fruit: 'In the padded trays lie several black-wind fruits, each with a skin that absorbs the light around it rather than merely reflecting none.',
      drain: {
        description({ getFlag }) {
          if (getFlag('blackWindTreePassageFound')) {
            return 'The iron drain grate has been pulled aside, revealing a cramped maintenance stair dropping below the stockroom into the chamber where the black-wind roots are kept productive.';
          }

          return 'An iron floor drain gathers dark sticky runoff from the chilled room. The smell around it is more botanical than mercantile.';
        },
      },
      door: 'From this side the hidden pantry door is obvious, a panel disguised to read as shelving from the kitchen side.',
    },
  });
}

export default createAlchemyStockroom;