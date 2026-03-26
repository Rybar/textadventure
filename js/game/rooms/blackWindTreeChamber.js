import { Room } from '../../engine/models/room.js';

import { createBlackWindRootSample } from '../items/blackWindRootSample.js';

const hasTakenRootSample = worldState => {
  const location = worldState.getItemLocation('black-wind-root-sample');
  return location?.type !== 'room' || location?.roomId !== 'blackWindTreeChamber';
};

export function createBlackWindTreeChamber() {
  const rootSample = createBlackWindRootSample();

  const drinkSourceSap = ({ session }) => session.triggerGameOver(
    'The sap hits your tongue like sweet smoke and old metal. For one impossible instant you can feel the chamber from the inside: root pressure, ledger logic, fruit swelling in the dark. Then the sensation keeps widening, and you stop being a witness to the black-wind source long enough to become part of its accounting.',
    { persistentFlags: ['blackWindSapGameOverSeen'], branchId: 'black-wind-sap' },
  );

  return new Room({
    id: 'blackWindTreeChamber',
    title: 'Black Wind Tree Chamber',
    description: `
This cistern-like chamber sits below the service rooms in cold, punished secrecy. At its center rises the black wind tree: a twisted trunk forcing up through cracked stone, its bark lacquer-dark and wet, its branches burdened with a few light-drinking fruits that seem to ripen by dimming the room around them.
Where root presses against the buried book beneath it, dark sap beads in slow tarry pulses.
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
      search({ command, getFlag, setFlag, worldState }) {
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
          if (getFlag('blackWindTreeSabotaged')) {
            return 'The buried spine is split now, leaking dark sap where root and text were forced to become one thing. The tree has begun failing from the idea outward.';
          }

          if (!getFlag('blackWindTreeCalmed')) {
            return 'Only the warped spine and a few fused page edges remain visible beneath the roots. The tree has not merely grown above the buried book. It has incorporated it. In the chamber\'s current agitation, getting at that seam would be messy and imprecise.';
          }

          setFlag('blackWindSourceLeadKnown', true);
          return 'With the chamber calmed by incense, the buried spine shows its role clearly: the roots knot around it like a wound around a blade. A precise cut there might injure not just the tree\'s body, but the original blasphemy feeding it.';
        }

        if (target.includes('fruit') || target.includes('branch')) {
          return 'The hanging fruit looks less cultivated than negotiated: each one a polished darkness waiting to be translated into shipment, elixir, and policy.';
        }

        if (target.includes('sap') || target.includes('resin') || target.includes('ichor')) {
          return 'Dark sap beads where root and buried text press hardest together, thick as pitch and much too lively to mistake for ordinary seepage.';
        }

        if (target.includes('drain') || target.includes('iron') || target.includes('channel')) {
          return 'The iron channels and drains make the room worse by making it legible. Oshregaal did not merely discover the tree. He plumbed it.';
        }

        return `You search the ${target} and come away colder, dirtier, and much less able to pretend the stockroom was the whole crime.`;
      },
      sabotage({ getFlag }) {
        if (getFlag('blackWindTreeSabotaged')) {
          return 'The source has already been wounded as badly as you can manage tonight. Further damage would be theatrics rather than strategy.';
        }

        if (!getFlag('blackWindTreeCalmed')) {
          return 'You need the chamber calmer first. Right now the roots, drafts, and sap all conspire to turn sabotage into panic.';
        }

        return 'If you mean to sabotage the source properly, the buried spine beneath the roots is the only target that looks central enough to matter.';
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
      {
        when: ({ getFlag }) => getFlag('blackWindTreeCalmed') && !getFlag('blackWindTreeSabotaged'),
        text: 'Incense now threads through the chamber in narrow disciplined lines, making the buried book-and-root seam look less mystical and more vulnerable.',
      },
      {
        when: ({ getFlag }) => getFlag('blackWindTreeSabotaged'),
        text: 'A split now mars the buried spine beneath the roots, and the whole chamber feels like a supply line trying not to admit it has been cut at the level of principle.',
      },
    ],
    objects: {
      tree: {
        description({ worldState }) {
          if (worldState.getFlag('blackWindTreeSabotaged')) {
            return 'The black wind tree still stands, but no longer with the same confidence. Something central beneath it has been cut, and now the trunk carries itself like a conspiracy forced to limp.';
          }

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
      book: {
        description({ getFlag }) {
          if (getFlag('blackWindTreeSabotaged')) {
            return 'The buried book has been split where root and text fused together. It looks less discovered than deliberately injured.';
          }

          if (getFlag('blackWindTreeCalmed')) {
            return 'The buried book is mostly consumed by root and stone, but the calmed chamber makes one ugly truth plain: the tree is anchored to this trapped text like doctrine turned botanical.';
          }

          return 'The buried book is mostly consumed by root and stone, but enough remains to show that the tree rose exactly where text was interred.';
        },
      },
      spine: {
        description({ getFlag }) {
          if (getFlag('blackWindTreeSabotaged')) {
            return 'What remains of the buried spine is split and leaking dark sap where wood and text were forced to share a single wound.';
          }

          if (getFlag('blackWindTreeCalmed')) {
            return 'With the incense taming the chamber air, the buried spine reads as the tree\'s anchoring blasphemy rather than mere debris. The seam where book becomes root looks cuttable.';
          }

          return 'What remains of the buried spine is warped, blackened, and half-fused into the wood above it.';
        },
        actions: {
          use({ item, getFlag, setFlag }) {
            if (!item) {
              return 'The buried spine looks like a point of failure, but not one your bare hands should volunteer for.';
            }

            if (item.id !== 'grey-grin-blade') {
              return `The ${item.name} does not look equal to the kind of blasphemy rooted here.`;
            }

            if (getFlag('blackWindTreeSabotaged')) {
              return 'The Grey Grin has already done its work here. The spine is split and the roots are panicking around the wound.';
            }

            if (!getFlag('blackWindTreeCalmed')) {
              return 'The chamber\'s bitter draft keeps the root-book seam in restless motion. You need a calmer line on the cut before committing the blade.';
            }

            setFlag('blackWindTreeSabotaged', true);
            setFlag('blackWindSourceLeadKnown', true);
            return 'You drive the Grey Grin Blade into the buried spine where root and text have fused. The cut lands with horrible correctness. Dark sap bursts into the channels, the trunk convulses, and the whole chamber answers with the sound of an enterprise being wounded at its idea rather than its inventory. You have sabotaged the black-wind source.';
          },
        },
      },
      drain: 'Iron drains and channels carry seepage upward toward the stockroom, reducing miracle into warehousing with unforgivable efficiency.',
      sap: {
        name: 'sap',
        aliases: ['dark sap', 'black sap', 'resin', 'ichor'],
        description: 'Dark sap beads where the tree has fused itself to the buried text beneath it, collecting in glossy drops that look medicinal only if you are already compromised.',
        actions: {
          drink: drinkSourceSap,
        },
      },
      stair: 'A narrow maintenance stair climbs back up toward the hidden stockroom and the house that profits from what grows below it.',
      fruit: 'The fruit hanging above the chamber is the same black-wind produce packaged upstairs, only here it still looks like part of a living accusation.',
    },
  });
}

export default createBlackWindTreeChamber;