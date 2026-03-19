import { Item } from '../../engine/models/item.js';
import { Room } from '../../engine/models/room.js';

export function createGrandStairsRoom() {
  const redCloak = new Item({
    id: 'red-cloak',
    name: 'red cloak',
    aliases: ['cloak'],
    description: 'A richly cut red cloak hung over one gargoyle claw, theatrical enough that it might count as a disguise at a distance.',
    actions: {
      wear() {
        return 'You settle the red cloak over your shoulders. It improves your silhouette and worsens your conscience.';
      },
    },
  });

  return new Room({
    id: 'grandStairs',
    title: 'Grand Stairs',
    description: `
The white marble stair rises in a broad ceremonial sweep toward the mansion doors. Two stone gargoyles in absurd festive caps stand sentry on either side.
One of them has been draped with a fine red cloak, as though even the statuary must dress for dinner.
`.trim(),
    exits: {
      south: 'cavern',
      north: 'foyer',
      down: 'pitLedge',
    },
    exitGuards: {
      down({ getFlag }) {
        if (getFlag('pitRouteHintKnown') || getFlag('eastRunoffNoted')) {
          return null;
        }

        return 'The stair looks ceremonially complete from here. If there is a way down the eastern side, you have not yet found it.';
      },
    },
    verbs: {
      search({ command, getFlag, setFlag }) {
        const target = command.directObject;

        if (!target || target.includes('stair') || target.includes('east') || target.includes('gargoyle') || target.includes('rail')) {
          if (!getFlag('pitRouteHintKnown')) {
            setFlag('pitRouteHintKnown', true);
            return 'You pace the eastern side of the stair and notice scrape marks on the marble beyond the balustrade, too practical to belong to ceremony. A narrow maintenance ledge descends along the wall into darkness below the mansion facade, carrying a sour smell of wet stone and something less architectural.';
          }

          return 'The eastern balustrade still hides the same narrow ledge descending below the main approach. It is not a guest route, which recommends it slightly.';
        }

        return `You search the ${target} and find only dust, marble grit, and ceremonial overconfidence.`;
      },
    },
    items: [redCloak],
    conditionalDescriptions: [
      {
        when: ({ getFlag }) => getFlag('pitRouteHintKnown'),
        text: 'On the eastern side, the balustrade no longer hides a narrow maintenance ledge descending out of sight below the stair, where service and runoff apparently continue after ceremony stops looking.',
      },
    ],
    objects: {
      gargoyles: 'The gargoyles are nonmagical, though each wears its ridiculous hat with enough dignity to make mockery seem rude and perhaps mildly unsafe.',
      hats: 'Pointed festive hats trimmed in faded gold thread. Someone in this house believes solemnity and comedy should always dine together, preferably while being watched.',
      doors: 'The double doors are polished and imposing. Beyond them lies warmth, light, and likely the first mistake of the evening.',
      balustrade: {
        description({ getFlag }) {
          if (!getFlag('pitRouteHintKnown')) {
            return 'The carved stone balustrade is spotless, theatrical, and just tall enough to discourage casual peering over the eastern side.';
          }

          return 'Beyond the eastern balustrade, a narrow ledge clings to the mansion wall and sinks toward some lower service or waste level. It is not accessible casually, but it is undeniably there and much older than the performance above it.';
        },
      },
    },
  });
}

export default createGrandStairsRoom;