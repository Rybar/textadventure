import { Room } from '../../engine/models/room.js';

import { createBlackWindRootSample } from '../items/blackWindRootSample.js';

const hasTakenRootSample = worldState => {
  const location = worldState.getItemLocation('black-wind-root-sample');
  return location?.type !== 'room' || location?.roomId !== 'blackWindTreeChamber';
};

export function createBlackWindTreeChamber() {
  const rootSample = createBlackWindRootSample();

  return new Room({
    id: 'blackWindTreeChamber',
    title: 'Black Wind Tree Chamber',
    description: `
This cistern-like chamber sits below the service rooms in cold, punished secrecy. At its center rises the black wind tree: a twisted trunk forcing up through cracked stone, its bark lacquer-dark and wet, its branches burdened with a few light-drinking fruits that seem to ripen by dimming the room around them.
The roots have broken the floor into ridges and channels that feed an iron drain system leading upward toward the stockroom. Beneath the lowest spread of roots, half-swallowed by stone and soil, a buried book spine still protrudes from the place where the tree first forced itself into the world. A narrow stair climbs back up.
`.trim(),
    exits: {
      up: 'alchemyStockroom',
    },
    triggers: {
      enter: [
        {
          id: 'blackWindTreeChamber:first-entry',
          once: true,
          run: ({ setFlag }) => {
            setFlag('blackWindTreeFound', true);
            return 'The truth of the black-wind trade stops pretending to be agricultural here. This is not an orchard. It is a wound with inventory.';
          },
        },
      ],
    },
    verbs: {
      search({ command, getFlag, worldState }) {
        const target = command.directObject;
        const rootSampleTaken = hasTakenRootSample(worldState);

        if (!target || target.includes('room') || target.includes('chamber') || target.includes('floor')) {
          return rootSampleTaken
            ? 'You search the chamber again and find the same intolerable arrangement: the tree, the buried book beneath it, the feed lines to the stockroom above, and the cut place where you already took proof.'
            : 'A careful search reveals the whole apparatus at once: the tree anchored around a buried book, the drain lines feeding product upward toward the stockroom, and one split lower root exposing a cuttable sample of living proof.';
        }

        if (target.includes('tree') || target.includes('roots') || target.includes('root') || target.includes('trunk')) {
          return rootSampleTaken
            ? 'The tree remains monstrously self-possessed, but one lower root now bears the clean wound where you cut away a sample.'
            : 'One lower root has split against the broken stone, exposing pale inner grain under the black lacquer. You could cut free a sample without needing to harvest the whole obscene thing.';
        }

        if (target.includes('book') || target.includes('spine') || target.includes('pages')) {
          return 'Only the warped spine and a few fused page edges remain visible beneath the roots. The tree has not merely grown above the buried book. It has incorporated it.';
        }

        if (target.includes('fruit') || target.includes('branch')) {
          return 'The hanging fruit looks less cultivated than negotiated: each one a polished darkness waiting to be translated into shipment, elixir, and policy.';
        }

        if (target.includes('drain') || target.includes('iron') || target.includes('channel')) {
          return 'The iron channels and drains make the room worse by making it legible. Oshregaal did not merely discover the tree. He plumbed it.';
        }

        return `You search the ${target} and come away colder, dirtier, and much less able to pretend the stockroom was the whole crime.`;
      },
    },
    items: [rootSample],
    conditionalDescriptions: [
      {
        when: ({ worldState }) => hasTakenRootSample(worldState),
        text: 'A lower root now shows a fresh pale cut where you took a sample. The wound makes the whole chamber feel more awake rather than less.',
      },
      {
        when: ({ getFlag }) => getFlag('blackWindEvidenceCollected'),
        text: 'Seen after the ledger, the chamber resolves into supply chain rather than myth: this is where product becomes inevitability.',
      },
    ],
    objects: {
      tree: {
        description({ worldState }) {
          if (hasTakenRootSample(worldState)) {
            return 'The black wind tree rises from the broken floor like a principle the house built itself around. One lower root shows the fresh wound where you cut away a sample.';
          }

          return 'The black wind tree is too glossy for bark and too deliberate for wild growth. It looks like a spell that learned patience and wood.';
        },
      },
      roots: {
        description({ worldState }) {
          if (hasTakenRootSample(worldState)) {
            return 'The roots buckle the chamber floor and feed the drain system upward. One of them now bears a neat cut where you removed proof.';
          }

          return 'The roots are thick, wet, and infrastructural. They do not merely grow here; they organize the room.';
        },
      },
      book: 'The buried book is mostly consumed by root and stone, but enough remains to show that the tree rose exactly where text was interred.',
      spine: 'What remains of the buried spine is warped, blackened, and half-fused into the wood above it.',
      drain: 'Iron drains and channels carry seepage upward toward the stockroom, reducing miracle into warehousing with unforgivable efficiency.',
      stair: 'A narrow maintenance stair climbs back up toward the hidden stockroom and the house that profits from what grows below it.',
      fruit: 'The fruit hanging above the chamber is the same black-wind produce packaged upstairs, only here it still looks like part of a living accusation.',
    },
  });
}

export default createBlackWindTreeChamber;