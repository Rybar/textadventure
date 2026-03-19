import { Item } from '../../engine/models/item.js';

export function createCorrectionRoster() {
  return new Item({
    id: 'correction-roster',
    name: 'correction roster',
    aliases: ['roster', 'correction log', 'protocol roster', 'discipline roster'],
    description: 'A clipped roster of correction categories, transfer notes, and rotation marks written in the same dry administrative hand as the bell card.',
    actions: {
      read({ getFlag, setFlag }) {
        if (!getFlag('containmentProtocolKnown')) {
          setFlag('containmentProtocolKnown', true);
        }

        return 'The roster reduces captivity to procedure: GUEST MISALIGNED, GUEST REFRACTORY, GUEST TO BE DOWNGRADED BEFORE TRANSFER. Names have been replaced with room numbers and correction intervals. One margin note reads: "If repeated explanation fails, remove audience, reduce privileges, continue until compliant silence."';
      },
    },
  });
}

export default createCorrectionRoster;