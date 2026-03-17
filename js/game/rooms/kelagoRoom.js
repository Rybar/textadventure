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
      kelago: {
        name: 'Lady Kelago',
        aliases: ['lady kelago', 'kelago'],
        description: 'Lady Kelago is composed, elegant, and only incidentally horrifying. She speaks of reshaping flesh the way another artist might discuss upholstery and line.',
        actions: {
          ask({ topic, getFlag, setFlag }) {
            setFlag('kelagoMet', true);

            if (topic.includes('work') || topic.includes('furniture') || topic.includes('art')) {
              return 'Kelago brightens. "At last, a guest with eyesight. Function is common. Comfort is common. Beauty joined to useful terror, however, remains an art."';
            }

            if (topic.includes('escape') || topic.includes('circle') || topic.includes('curtain') || topic.includes('west')) {
              if (getFlag('kelagoPraised')) {
                setFlag('kelagoHandshakeHintKnown', true);
                return 'Kelago smiles with unnerving sincerity. "My brother keeps a hidden latch behind the feast-hall curtains. A brass hand. Shake it politely and the wall will remember its breeding."';
              }

              return 'Kelago glances toward the feast hall. "You ask practical questions with a stranger’s face. Admire something first. It improves the tone."';
            }

            return 'Kelago answers with cordial precision, as though deciding how much of you might eventually become decorative.';
          },
          tell({ topic, setFlag }) {
            setFlag('kelagoMet', true);

            if (topic.includes('beautiful') || topic.includes('art') || topic.includes('artist') || topic.includes('work')) {
              setFlag('kelagoPraised', true);
              return 'Kelago inclines her head, visibly pleased. "Kind and accurate," she says. "That combination is rarer than courage."';
            }

            return 'Kelago receives the remark with the calm interest of a woman capable of improving almost anything by force.';
          },
          give({ item, setFlag }) {
            setFlag('kelagoMet', true);

            if (item.id === 'wizard-ink') {
              setFlag('kelagoPraised', true);
              return 'Kelago accepts the wizard ink with immediate approval. "You do notice useful things," she says. "Ask me a better question and I may reward you with an answer."';
            }

            return `Kelago considers the ${item.name} and decides it does not improve the room.`;
          },
        },
      },
      knives: 'There are knives everywhere: long, hooked, delicate, ribbed, and unmistakably specialized.',
      tortoises: 'Three headless tortoises shuffle through the clutter with patient, chest-like dignity.',
      workspace: 'The central workspace is suspiciously clean, suggesting that whatever was last done here concluded successfully.',
    },
  });
}

export default createKelagoRoom;