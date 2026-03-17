import { Item } from '../../engine/models/item.js';

export function createBlackWindLedger() {
  return new Item({
    id: 'black-wind-ledger',
    name: 'black wind ledger',
    aliases: ['ledger', 'records', 'shipping ledger', 'trade ledger', 'book'],
    description: 'A narrow ledger bound in black lacquered hide, its corners rubbed pale by repeated secret handling.',
    actions: {
      read({ getFlag, setFlag }) {
        if (!getFlag('blackWindEvidenceCollected')) {
          setFlag('blackWindEvidenceCollected', true);
        }

        if (!getFlag('blackWindLedgerRead')) {
          setFlag('blackWindLedgerRead', true);
        }

        return [
          'The ledger records black-wind fruit, reduced elixir, and sealed phials moved in coded batches to named houses and clan factors on the surface.',
          'Even the euphemisms are incriminating. Quantity columns are paired with mortality estimates, desirable mutation profiles, and notes about which clients prefer plausible deniability to potency.',
          'Several recent entries bear Oshregaal\'s own correction marks. This is not rumor, inheritance, or old war lore. It is an active trade book.',
        ].join(' ');
      },
    },
  });
}

export default createBlackWindLedger;