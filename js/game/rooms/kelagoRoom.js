import { Item } from '../../engine/models/item.js';
import { Room } from '../../engine/models/room.js';

export function createKelagoRoom() {
  const livingBed = new Item({
    id: 'living-bed',
    name: 'bed',
    aliases: ['crab bed', 'living bed'],
    description: 'A grotesquely opulent bed shaped like a giant crab, complete with clustered black eyes in the headboard and a pink, almost cheerful sleeping surface.',
    actions: {
      sit() {
        return 'The bed flexes almost imperceptibly beneath your weight. It feels less like furniture than a professional compromise.';
      },
      look() {
        return 'The bed has been made beautiful with sincere effort and absolutely no mercy.';
      },
    },
    portable: false,
  });

  const wizardInk = new Item({
    id: 'wizard-ink',
    name: 'wizard ink',
    aliases: ['ink'],
    description: 'A stoppered vial of dark ink dense enough that the light seems to bend slightly around it.',
  });

  const eyeSpellbook = new Item({
    id: 'eye-spellbook',
    name: 'spellbook',
    aliases: ['book', 'eye book'],
    description: 'A spellbook with a single wet eye set in the cover. It seems capable of closing itself when stared at too hard.',
    actions: {
      read() {
        return 'The book crawls unpleasantly against your hands. Its pages concern flesh, growth, and transformation in a tone of domestic practicality.';
      },
    },
  });

  return new Room({
    id: 'kelagoRoom',
    title: 'Kelago\'s Room',
    description: `
Kelago's workroom-bedroom is crowded with knives, crumbs, cups, clothing, and projects best left undescribed until one has to describe them.
At the center stands a cleared workspace watched over by a living crab-bed and the calm logic of a woman who has made biomantic furniture into an art.
The feast hall waits to the south.
`.trim(),
    exits: {
      south: 'feastHall',
    },
    items: [livingBed, wizardInk, eyeSpellbook],
    objects: {
      kelago: 'Lady Kelago is composed, elegant, and only incidentally horrifying. She speaks of reshaping flesh the way another artist might discuss upholstery and line.',
      knives: 'There are knives everywhere: long, hooked, delicate, ribbed, and unmistakably specialized.',
      tortoises: 'Three headless tortoises shuffle through the clutter with patient, chest-like dignity.',
      workspace: 'The central workspace is suspiciously clean, suggesting that whatever was last done here concluded successfully.',
    },
  });
}

export default createKelagoRoom;