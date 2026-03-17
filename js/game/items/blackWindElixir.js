import { Item } from '../../engine/models/item.js';

export function createBlackWindElixir() {
  return new Item({
    id: 'black-wind-elixir',
    name: 'black wind elixir',
    aliases: ['elixir', 'phial'],
    description: 'A wax-stoppered phial of reduced black-wind elixir, dark as bruised lacquer and slightly warm in the hand.',
    actions: {
      drink({ item, getFlag, setFlag, worldState }) {
        if (!getFlag('blackWindElixirConsumed')) {
          setFlag('blackWindElixirConsumed', true);
        }

        worldState.removeItemById(item.id);
        return 'You break the wax and drink the reduced elixir. Heat moves through you with precise and unfriendly intelligence. Your teeth ache, your pulse miscounts once, and for a breath you understand how someone could mistake corruption for capability. The empty phial does not seem worth keeping.';
      },
      smell() {
        return 'The sealed phial leaks a scent of iron, bitter herbs, and a sweetness that feels engineered rather than grown.';
      },
      use(context) {
        return this.performAction('drink', context);
      },
    },
  });
}

export default createBlackWindElixir;