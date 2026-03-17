import { Item } from '../../engine/models/item.js';

export function createWaxPlug() {
  return new Item({
    id: 'wax-plug',
    name: 'wax plug',
    aliases: ['wax', 'ear wax', 'plug'],
    description: 'A thumb-sized plug of dark perfumed wax wrapped in silk paper. Someone prepared it to be pushed into an ear in a hurry.',
    actions: {
      look() {
        return 'The wax is denser than candle-grease and smells faintly of incense and bitter herbs. It was made for listening less, not for decoration.';
      },
      use() {
        return 'You test the wax against one ear and feel the room dim around the edges, as though certain voices would have to work harder to reach you. You keep it for when the need is less theoretical.';
      },
      wear() {
        return this.performAction('use');
      },
    },
  });
}

export default createWaxPlug;