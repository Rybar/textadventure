import { createTopicResponder } from '../../engine/authoring/conversation.js';
import { Item } from '../../engine/models/item.js';
import { Room } from '../../engine/models/room.js';

export function createFernGardenRoom() {
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
      southeast: 'cavern',
    },
    verbs: {
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
        text: 'Plum is gone from the open garden now, folded into fern-shadow and culvert-dark with the deliberate skill of someone protecting a future by withholding her location. Her last advice leaves the house feeling larger and more indictable: somewhere deeper in, Oshregaal keeps records worth stealing.',
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