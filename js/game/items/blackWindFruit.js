import { Item } from '../../engine/models/item.js';

export function createBlackWindFruit() {
  return new Item({
    id: 'black-wind-fruit',
    name: 'black wind fruit',
    aliases: ['fruit'],
    description: 'A fist-sized black fruit with a skin so dark it seems to drink the light around your hand.',
    uses: 1,
    actions: {
      eat({ getFlag, setFlag }) {
        if (!getFlag('blackWindFruitConsumed')) {
          setFlag('blackWindFruitConsumed', true);
        }

        return 'You bite the black-wind fruit and instantly regret how good the first taste is. Bitter resin, cold sugar, and something medicinal flood your mouth. For a moment your thoughts feel dangerously well-aligned, as if your body has been briefly talked into becoming an argument.';
      },
      smell() {
        return 'The fruit smells of damp bark, sugar boiled too long, and an after-note like a storm passing over a pharmacy.';
      },
      use(context) {
        return this.performAction('eat', context);
      },
    },
  });
}

export default createBlackWindFruit;