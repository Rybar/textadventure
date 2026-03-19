import { createTopicResponder } from '../../engine/authoring/conversation.js';
import { Item } from '../../engine/models/item.js';
import { Room } from '../../engine/models/room.js';

export function createFernGardenRoom() {
  const getGardenEscapeEnding = ({ getFlag, worldState, setFlag }) => {
    if (getFlag('escapedMansion')) {
      return 'The garden has already served as your threshold out. There is no second first escape hiding in the ferns.';
    }

    if (getFlag('absorbedIntoRoutine')) {
      return 'By the time you imagine using the garden as an exit, the house has already taught you to return to the next course instead. Escape has become one more thought the routine absorbs before it can stand up.';
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
        ? 'You and Plum disappear through the fern-dark while Nathema remains behind as a more deliberate disaster. Oshregaal will have to spend dawn containing the rival you armed instead of reclaiming the captives he lost. The rescue holds. The consequences do not improve. This is a dark bargain ending.'
        : 'You slip into the fern-dark because Nathema is now poised to turn Oshregaal\'s own house into his next negotiation crisis. She bought your margin of escape with the leverage you handed her, and the night becomes survivable by becoming someone else\'s impending war. This is a dark bargain ending.';
    }

    if (getFlag('oshregaalWounded')) {
      setFlag('escapedMansion', true);
      return getFlag('plumRescued')
        ? 'You and Plum vanish through the fern-dark while the house behind you tries to reassemble itself around a bleeding host. Whatever Oshregaal remains, he no longer remains unchallenged. This is a violent ending.'
        : 'You slip through the ferns on the strength of a dinner you turned into a wound. Oshregaal is not cleanly dead, but the house will spend the rest of the night pretending it was always built for panic. This is a violent ending.';
    }

    if (acceptedMutation || acceptedService) {
      setFlag('escapedMansion', true);

      if (acceptedMutation) {
        return getFlag('plumRescued')
          ? 'You and Plum vanish through the fern-dark, but the black wind has already made a quieter claim on what kind of future you can inhabit. Escape holds. So does corruption. This is a dark bargain ending.'
          : 'You slip into the fern-dark having used mutation as your private exit tax. The mansion does not reclaim you, but the chemistry you swallowed refuses to remain a temporary tactic. This is a dark bargain ending.';
      }

      return getFlag('plumRescued')
        ? 'You and Plum get clear, but only because you learned how to move through the house as service rather than self: ignored, lowered, and efficient. Survival arrived wearing livery. This is a dark bargain ending.'
        : 'You escape through the garden by keeping the servant posture the house rewarded: useful, forgettable, and already half-edited for someone else\'s convenience. The ferns release you more easily than your habits do. This is a dark bargain ending.';
    }

    if (strongEscape) {
      setFlag('escapedMansion', true);
      setFlag('strongerEscapeSecured', true);
      return 'You and Plum vanish through the fern-dark with enough leverage, proof, or theft to make Oshregaal\'s hospitality expensive in retrospect. The mansion remains in the cavern, but its secrecy no longer does. This is a strong vanilla ending.';
    }

    if (getFlag('plumRescued')) {
      setFlag('escapedMansion', true);
      return 'The garden becomes your line out of the story Oshregaal meant to keep. Plum survives, the house loses one of its captive continuities, and for now that is victory enough. This is the minimum good ending.';
    }

    if (getFlag('plumAllianceSecured')) {
      return 'Plum is hidden, not yet fully gone. Leaving now would turn her rescue into a partial theft and trust into bad accounting.';
    }

    if (getFlag('blackWindEvidenceCollected') || getFlag('blackWindTreeSabotaged') || carryingLeverage || carryingGreyGrin || getFlag('nathemaBlackWindSampleDelivered')) {
      setFlag('escapedMansion', true);
      return 'You slip away through the garden carrying proof or plunder, but without rescuing the person who made the house impossible to treat as scenery. This is a compromised escape.';
    }

    return 'The ferns offer concealment, not closure. If you leave now, you leave mostly empty-handed.';
  };

  const plumAsk = createTopicResponder({
    rules: [
      {
        when: ({ getFlag }) => getFlag('plumAllianceSecured'),
        reply: 'Plum has already vanished into the garden shadows. Whatever help she offers next will have to arrive by preparation, not conversation.',
      },
      {
        match: ['help', 'what now', 'now what', 'next'],
        reply: 'Plum steadies herself against one of the gnome statues and looks back toward the house. "Now we stop confusing rescue with completion," she says. "If you are going back in, do it for something that changes the shape of the story. Evidence. A weapon. The source itself."',
      },
      {
        match: ['black wind', 'evidence', 'records', 'ledgers', 'shipments', 'fruit', 'elixir', 'trade'],
        effect: ({ setFlag }) => {
          setFlag('blackWindEvidenceLeadKnown', true);
        },
        reply: 'Plum wipes dirt from one palm with scholarly irritation. "Oshregaal hides embarrassment more carefully than sorcery," she says. "The black-wind trade records are kept near the alchemical stock, wherever he stores fruit, elixir, or accounts that prove how much of the world still eats from his orchard. If you can steal those, you leave with leverage rather than a story nobody powerful needs to believe."',
      },
      {
        match: ['source', 'tree', 'orchard', 'roots'],
        effect: ({ setFlag }) => {
          setFlag('blackWindSourceLeadKnown', true);
        },
        reply: 'Plum glances toward the house with visible disgust. "The orchard is not outside," she says. "It is grown downward. Follow the stock, the runoff, or the roots beneath the service rooms and you will eventually reach the place where the fruit stops pretending to be produce and starts confessing."',
      },
      {
        match: ['grey grin', 'blade', 'sword', 'weapon'],
        reply: '"The Grey Grin Blade is real," Plum says, "but it is a trophy before it is a tool. If you chase it, do so because you mean to use what it means, not because you want a prettier escape."',
      },
      {
        match: ['oshregaal', 'grandfather'],
        reply: 'Plum looks toward the mansion wall with open fatigue. "He will turn my absence into an anecdote first," she says. "That buys us a little time. After that he will become industrious."',
      },
    ],
    fallback: 'Plum answers in the clipped, practical tone of someone spending borrowed safety on only the most useful words.',
  });

  const plumTell = createTopicResponder({
    rules: [
      {
        when: ({ getFlag }) => getFlag('plumAllianceSecured'),
        reply: 'Plum is already gone to ground. The ferns and culvert now keep her counsel better than this conversation can.',
      },
      {
        match: ['hide', 'stay hidden', 'wait here', 'go to ground', 'get clear', 'run', 'leave'],
        effect: ({ emitEvent }) => {
          emitEvent('securePlumAlliance');
        },
        reply: 'Plum nods once, already choosing the least memorable path through the ferns. "Good," she says. "Let him lose me properly."',
      },
      {
        match: ['stay with me', 'come with me', 'follow me'],
        reply: 'Plum shakes her head. "Not now," she says. "If we both keep moving together, we are only one discovery instead of two problems. Better that one of us becomes difficult to count."',
      },
    ],
    fallback: 'Plum takes the suggestion seriously, then discards it with the economy of someone who no longer has patience for decorative plans.',
  });

  const gnomeStatue = new Item({
    id: 'gnome-statue',
    name: 'gnome statue',
    aliases: ['statue', 'gnome'],
    description: 'A squat stone gnome with a blissful expression and an extra, unnecessary eyelid carved over each eye.',
    portable: true,
  });

  const egg = new Item({
    id: 'peafowl-egg',
    name: 'egg',
    aliases: ['peafowl egg', 'astral egg'],
    description: 'A pale egg with a shell that seems slightly deeper than its surface should allow.',
    portable: true,
  });

  return new Room({
    id: 'fernGarden',
    title: 'Fern Garden',
    description: `
The old garden has gone feral. Ferns taller than a man lean over the path in purple, green, and black fans that drink the cave light.
Eight gnome statues squat between them in attitudes of bliss or revelation. Somewhere overhead, something feathered shifts without quite deciding to show itself.
The safer path leads back southeast toward the cavern and the stairs.
`.trim(),
    exits: {
      west: 'fishingShack',
      southeast: 'cavern',
    },
    verbs: {
      escape(context) {
        return getGardenEscapeEnding(context);
      },
      search({ command, getFlag, setFlag }) {
        const target = command.directObject;

        if (!target || target.includes('garden') || target.includes('ferns') || target.includes('foliage')) {
          if (!getFlag('fernCulvertNoticed')) {
            setFlag('fernCulvertNoticed', true);
            return 'You part the cold fronds and discover a low stone culvert hidden behind one of the ecstatic gnome statues. Roots choke most of it, but the tunnel proves the garden was once meant to breathe into the house by some quieter route.';
          }

          return 'You search the garden again and find the same hidden culvert behind the statues, still too root-choked for an easy crawl. The knowledge feels more useful than the opening itself.';
        }

        if (target.includes('statue') || target.includes('gnome')) {
          if (!getFlag('fernCulvertNoticed')) {
            setFlag('fernCulvertNoticed', true);
            return 'Kneeling among the gnomes, you notice that one statue sits before a half-buried stone culvert. The opening is narrow and fouled with roots, but it is unmistakably architectural rather than natural.';
          }

          return 'The statues remain blissful and hideous. Behind the rearmost one, the narrow culvert waits in root-clotted secrecy.';
        }

        return `You find nothing in the ${target} but damp leaves, spores, and the feeling of being watched from above.`;
      },
    },
    items: [gnomeStatue, egg],
    conditionalDescriptions: [
      {
        when: ({ getFlag }) => getFlag('plumRescued') && !getFlag('plumAllianceSecured'),
        text: 'Plum stands among the gnome statues breathing cold garden air like someone relearning the existence of futures. The hidden culvert behind the ferns now looks less like trivia and more like the shape of a successful theft.',
      },
      {
        when: ({ getFlag }) => getFlag('plumAllianceSecured'),
        text: 'Plum is gone from the open garden now, folded into fern-shadow and culvert-dark with the deliberate skill of someone protecting a future by withholding her location. Her last advice leaves the house feeling larger and more indictable: somewhere deeper in, Oshregaal keeps records worth stealing and a source worth finding.',
      },
      {
        when: ({ getFlag }) => getFlag('fernCulvertNoticed'),
        text: 'Behind one of the statues, a root-choked stone culvert now stands out once you know to look for it.',
      },
    ],
    objects: {
      plum: {
        name: 'Plum',
        aliases: ['plum', 'scribe'],
        description({ getFlag }) {
          if (getFlag('plumAllianceSecured')) {
            return 'Plum is no longer visible. The flattened ferns and the culvert behind the statue are the only signs that she chose absence quickly and well.';
          }

          if (getFlag('plumRescued')) {
            return 'Plum looks stunned, filthy, and newly dangerous in the way exhausted people become once they have proof that escape is physically possible.';
          }

          return 'Plum is not here.';
        },
        actions: {
          ask({ topic, getFlag, setFlag }) {
            if (!getFlag('plumRescued')) {
              return 'Plum is not here.';
            }

            return plumAsk({ topic, getFlag, setFlag });
          },
          tell({ topic, getFlag, emitEvent }) {
            if (!getFlag('plumRescued')) {
              return 'Plum is not here.';
            }

            return plumTell({ topic, getFlag, emitEvent });
          },
        },
      },
      ferns: 'The fronds are slick and cold to the touch. Between them, the darkness looks deeper than the cavern really is.',
      peafowl: 'You glimpse a length of impossible plumage and then nothing at all. Whatever nests here is not entirely concerned with remaining in one plane.',
      statues: 'Each gnome is uniquely mutated and improbably serene, as though the sculptor admired both ecstasy and deformity.',
      shack: 'A low fishing shack squats west of the garden, kept just far enough from the formal approach to avoid embarrassing the architecture.',
      culvert: {
        description({ getFlag }) {
          if (!getFlag('fernCulvertNoticed')) {
            return 'You do not yet spot any opening worth calling a culvert among the roots and fern-shadow.';
          }

          return 'The culvert is old stonework, too deliberate to be a natural crack. It runs under the garden wall toward the house, but roots and wet soil have narrowed it to something only a smaller creature could love.';
        },
      },
    },
  });
}

export default createFernGardenRoom;