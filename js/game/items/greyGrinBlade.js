import { Item } from '../../engine/models/item.js';

export function createGreyGrinBlade() {
  return new Item({
    id: 'grey-grin-blade',
    name: 'Grey Grin Blade',
    aliases: ['blade', 'grey grin', 'sword'],
    description: 'A long pale blade with a smile-thin curve and a grip wrapped in grey leather gone smooth with old violence.',
    actions: {
      look() {
        return 'The Grey Grin Blade looks ceremonial until you notice how perfectly it balances in the hand. A faint etched grin runs near the fuller, decorative only if one has never met a tyrant with taste.';
      },
      use() {
        return 'You test the blade\'s balance once and decide not to rehearse murder in the middle of a stolen museum.';
      },
    },
  });
}

export default createGreyGrinBlade;