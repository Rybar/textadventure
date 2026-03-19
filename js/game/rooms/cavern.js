import { Item } from '../../engine/models/item.js';
import { Room } from '../../engine/models/room.js';

export function createCavernRoom() {
  const getEscapeEnding = ({ getFlag, worldState, setFlag }) => {
    if (getFlag('escapedMansion')) {
      return 'You have already broken from the house once tonight. Lingering in the cavern now feels less like survival and more like an argument with finality.';
    }

    if (getFlag('absorbedIntoRoutine')) {
      return 'You are already lost to the house\'s rhythm. Any later thought of escape is only a gesture performed by someone Oshregaal has taught to mistake repetition for choice.';
    }

    const carryingGreyGrin = Boolean(worldState.findInventoryItem('grey-grin-blade'));
    const carryingLeverage = Boolean(
      worldState.findInventoryItem('black-wind-ledger')
      || worldState.findInventoryItem('black-wind-root-sample')
      || worldState.findInventoryItem('black-wind-fruit')
      || worldState.findInventoryItem('black-wind-elixir')
    );
    const acceptedMutation = getFlag('blackWindFruitConsumed') || getFlag('blackWindElixirConsumed');
    const acceptedService = getFlag('servantApronWorn');
    const strongEscape = getFlag('plumRescued') && (
      getFlag('blackWindEvidenceCollected')
      || getFlag('nathemaEvidenceShown')
      || getFlag('nathemaBlackWindSampleDelivered')
      || getFlag('blackWindTreeSabotaged')
      || carryingLeverage
      || carryingGreyGrin
    );

    if (getFlag('nathemaEscapeDealSecured')) {
      setFlag('escapedMansion', true);
      return getFlag('plumRescued')
        ? 'You leave the cavern with Plum alive, but not clean. Behind you, Nathema now holds enough black-wind leverage and stolen succession to turn Oshregaal\'s household into a political wound. Your escape will stick because hers is not an escape at all, but an ascent. Plum survives; the world worsens anyway. This is a dark bargain ending.'
        : 'You leave the cavern alive by making Nathema more dangerous than the house can comfortably contain. Behind you, Oshregaal inherits a crisis shaped like a guest he underestimated and a rival you armed on purpose. Freedom bought this way is real, ugly, and politically contagious. This is a dark bargain ending.';
    }

    if (getFlag('oshregaalWounded')) {
      setFlag('escapedMansion', true);
      return getFlag('plumRescued')
        ? 'You leave the cavern with Plum alive while Oshregaal howls somewhere behind the marble and panic. He may not be dead, but the wound, the stolen blade, and the broken dinner have turned escape into a violent fact instead of a polite hope. This is a violent ending.'
        : 'You leave the cavern through the space your own violence opened. Oshregaal still lives somewhere behind you, but not with the same authority, not with the same blood, and not with dinner intact. This is a violent ending.';
    }

    if (acceptedMutation || acceptedService) {
      setFlag('escapedMansion', true);

      if (acceptedMutation) {
        return getFlag('plumRescued')
          ? 'You leave the cavern with Plum alive, but the black-wind bargain has already entered the body you are using to flee. Every breath of freedom now carries the memory of choosing corruption for capacity. Plum survives; your future no longer belongs entirely to you. This is a dark bargain ending.'
          : 'You leave the cavern alive by letting Oshregaal\'s black-wind commerce revise you from the inside. The house does not keep you, but it leaves with you in appetite, chemistry, and possibility. This is a dark bargain ending.';
      }

      return getFlag('plumRescued')
        ? 'You leave the cavern with Plum alive, but only after teaching yourself the house\'s servant logic: lower the head, move when ignored, survive by becoming administratively invisible. You escape, yet part of you is still organized around permission. This is a dark bargain ending.'
        : 'You leave the cavern alive because you accepted the house\'s oldest lesson about service: invisibility is a wage, obedience a route, and self-erasure a tool. You are outside now, but not cleanly outside its habits. This is a dark bargain ending.';
    }

    if (strongEscape) {
      setFlag('escapedMansion', true);
      setFlag('strongerEscapeSecured', true);
      return 'You leave the mansion behind with more than survival: Plum alive, the house publicly indictable, or theft heavy enough to bend tomorrow around it. Behind you, Oshregaal still owns his table. Ahead of you, he now has to fear the story that escaped it. This is a strong vanilla ending.';
    }

    if (getFlag('plumRescued')) {
      setFlag('escapedMansion', true);
      return 'You withdraw from the cavern with Plum alive and the house behind you at last. It is not a total victory. Oshregaal still has rooms, servants, and schemes. But he does not have Plum, and tonight that is enough to call escape real. This is the minimum good ending.';
    }

    if (getFlag('blackWindEvidenceCollected') || getFlag('blackWindTreeSabotaged') || carryingLeverage || carryingGreyGrin || getFlag('nathemaBlackWindSampleDelivered')) {
      setFlag('escapedMansion', true);
      return 'You leave the cavern alive with leverage, theft, or contraband in hand, but without Plum. The house has not beaten you. It has only made the cost of your priorities legible. This is a compromised escape.';
    }

    return 'You could leave the cavern, but right now it would only count as survival, not victory. If you mean to finish the night properly, there is still more house to answer.';
  };

  const puddle = new Item({
    id: 'puddle',
    name: 'puddle',
    aliases: ['pool', 'water'],
    description: 'A shallow calcium-rimmed pool reflects the marble stair and the dark roof of the cavern in a broken shimmer.',
    actions: {
      drink() {
        return 'The water tastes of lime, old stone, and the kind of cold that belongs underground.';
      },
    },
    portable: false,
  });

  return new Room({
    id: 'cavern',
    title: 'Cavern',
    description: `
You stand in a vast natural cavern before a mansion built directly into the northern wall, all white marble stairs and gaudy windows above black stone.
Water gathers in pale mineral pools beneath your boots. Chain-wrapped stalactites hang above like restrained teeth.
The main stair rises to the mansion doors, while a narrower path wanders northwest into a choking stand of giant ferns.
`.trim(),
    exits: {
      north: 'grandStairs',
      northwest: 'fernGarden',
    },
    verbs: {
      escape(context) {
        return getEscapeEnding(context);
      },
      search({ command, getFlag, setFlag }) {
        const target = command.directObject;

        if (!target || target.includes('cavern') || target.includes('ground') || target.includes('pool') || target.includes('puddle')) {
          if (!getFlag('cavernWindowRouteKnown')) {
            setFlag('cavernWindowRouteKnown', true);
            return 'You pick through the wet stone and mineral crust until you find broken white plaster beneath the wall. Looking up again, you realize one high service window is cracked open a finger-width wider than the others. Not usable from here, but enough to prove the house leaks in more ways than the front door admits.';
          }

          return 'The pools still hide broken plaster and grit fallen from above. Once noticed, the slightly open service window cannot be mistaken for decoration.';
        }

        if (target.includes('window')) {
          if (!getFlag('cavernWindowRouteKnown')) {
            setFlag('cavernWindowRouteKnown', true);
            return 'You study the mansion facade until one upper window resolves itself as subtly different: not merely curtained, but imperfectly shut. Pale plaster dust below suggests it opens often enough to shed crumbs of the wall.';
          }

          return 'One upper service window remains cracked open by a mean, practical margin. It is too high to help you now, but too real to ignore.';
        }

        return `You search the ${target} and find only damp stone, lime scale, and cavern patience.`;
      },
    },
    items: [puddle],
    conditionalDescriptions: [
      {
        when: ({ getFlag }) => getFlag('cavernWindowRouteKnown'),
        text: 'High above, one service window now stands out as slightly ajar, a tiny architectural indiscretion in an otherwise composed facade.',
      },
    ],
    objects: {
      mansion: 'The mansion looks as though a nobleman commissioned it and a fever designed the details later. Windows gleam in two levels across the cavern wall.',
      windows: 'Nine windows watch the cavern. Most are curtained, as if the house has decided what deserves to be seen.',
      stalactites: 'Each stalactite is wrapped in chain. The effect is less protective than punitive.',
      stairs: 'Broad white marble stairs climb toward the double doors with theatrical confidence.',
      doors: 'The double doors atop the stairs are the sort built to admit honored guests and trap them later.',
      plaster: {
        description({ getFlag }) {
          if (!getFlag('cavernWindowRouteKnown')) {
            return 'There is some white grit among the darker stone, but nothing you would yet call meaningful plasterfall.';
          }

          return 'The fallen plaster is fresh enough to connect with the slightly open service window above. The house is shedding evidence of quieter traffic.';
        },
      },
    },
  });
}

export default createCavernRoom;