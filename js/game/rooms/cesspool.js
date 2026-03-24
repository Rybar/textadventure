import { createTopicResponder } from '../../engine/authoring/conversation.js';
import { Room } from '../../engine/models/room.js';

export function createCesspoolRoom() {
  const slorumAsk = createTopicResponder({
    rules: [
      {
        match: ['name', 'who are you'],
        reply: 'The thing in the waste inclines herself with wounded dignity. "Slorum," she says. "Hostess, curator, and the only creature in this house still serious about table order."',
      },
      {
        match: ['dinner', 'party', 'table', 'dolls', 'guests'],
        effect: ({ setFlag }) => {
          setFlag('slorumMet', true);
        },
        reply: 'Slorum strokes one cracked doll with grotesque tenderness. "A proper dinner requires place settings, composure, and guests who do not splash," she says. "I preserve standards where the upper rooms have grown lax."',
      },
      {
        match: ['exit', 'leave', 'outside', 'grate', 'drain'],
        reply: ({ getFlag }) => {
          if (getFlag('cesspoolCrossingSafe')) {
            return 'Slorum gestures grandly with one dripping limb. "The dry stones are for invited passage," she says. "Mind the dolls. They are resting."';
          }

          return 'Slorum narrows her tiny eyes. "Past my table? In this condition?" she asks. "Not until you improve the tone of the evening."';
        },
      },
      {
        match: ['soap', 'mirror', 'gift'],
        reply: 'Slorum gives a hungry little sigh. "Upstairs luxuries do improve a table," she admits. "But gifts land poorly when delivered by rude hands."',
      },
    ],
    fallback: 'Slorum answers as a hostess of refuse forced to indulge a guest who has not yet proven worthy of the seating plan.',
  });

  const slorumTell = createTopicResponder({
    rules: [
      {
        match: ['your party is lovely', 'your table is lovely', 'beautiful party', 'beautiful table', 'lovely dinner'],
        effect: ({ setFlag }) => {
          setFlag('slorumMet', true);
          setFlag('slorumFlattered', true);
        },
        reply: 'Slorum goes still with cautious pleasure. "At last," she murmurs. "An upstairs guest with eyes. Mind your step and continue being correct."',
      },
      {
        match: ['sorry', 'forgive me', 'i apologize', 'pardon me'],
        effect: ({ setFlag }) => {
          setFlag('slorumMet', true);
        },
        reply: 'Slorum considers the apology like a hostess inspecting a wilted bouquet. "A start," she says. "But the table remains underdressed."',
      },
    ],
    fallback: 'Slorum receives the remark with damp skepticism, as if still deciding whether you count as company or runoff.',
  });

  return new Room({
    id: 'cesspool',
    title: 'Cesspool',
    description: `
  The house's digestive underside spreads out in a stone cistern of runoff, refuse, and slow foul water. Narrow ledges skirt the wall. At the center, crates and broken platters have been arranged into a mock dinner tableau around cracked dolls and salvaged silver.
Half-submerged beside that obscene little feast lounges Slorum, who regards the room less as waste than as a salon. A service ledge lies west beyond the muck.
`.trim(),
    exits: {
      up: 'bathroom',
      west: 'pitLedge',
    },
    triggers: {
      enter: [
        {
          id: 'cesspool:first-entry',
          run: ({ getFlag, setFlag }) => {
            if (!getFlag('cesspoolEntered')) {
              setFlag('cesspoolEntered', true);
            }

            return null;
          },
        },
      ],
    },
    exitGuards: {
      west({ getFlag }) {
        if (getFlag('cesspoolCrossingSafe')) {
          return null;
        }

        return 'The driest stones toward the western ledge run directly past Slorum\'s little dinner party. She watches you with the expression of a hostess deciding whether you are rude enough to sink on principle.';
      },
    },
    verbs: {
      search({ command, getFlag }) {
        const target = command.directObject;

        if (!target || target.includes('cesspool') || target.includes('room') || target.includes('tableau') || target.includes('table')) {
          return getFlag('cesspoolCrossingSafe')
            ? 'The mock dinner tableau remains hideous, but now Slorum has marked the dry stones through it with proprietary care. Past the dolls and cracked plates, the western ledge offers a real if humiliating route out, licensed by etiquette rather than engineering.'
            : 'A closer look reveals that the little table is carefully arranged: cracked plates, doll-guests, scraps sorted by type, even a place of honor set with salvaged silver. Slorum is not guarding random filth. She is hosting with it and judging accordingly.';
        }

        if (target.includes('doll') || target.includes('plate') || target.includes('silver')) {
          return 'The dolls have been cleaned with absurd dedication compared to everything around them. Each sits before a cracked plate as if still awaiting the right course.';
        }

        if (target.includes('grate') || target.includes('drain') || target.includes('west')) {
          return getFlag('cesspoolCrossingSafe')
            ? 'Beyond Slorum\'s table, the western stones lead to a service ledge and a low drain cleft opening back toward cavern air.'
            : 'The western way out is real, but the safest stones pass directly by Slorum and her dinner party. In this room, passage apparently depends on manners more than balance.';
        }

        return `You search the ${target} and come away wetter, dirtier, and no better disposed toward Oshregaal's plumbing.`;
      },
    },
    conditionalDescriptions: [
      {
        when: ({ getFlag }) => getFlag('slorumFlattered') && !getFlag('slorumGifted'),
        text: 'Slorum now regards you as potentially educable, which is more dangerous than open dislike but much more workable if you enjoy passing exams in sewage.',
      },
      {
        when: ({ getFlag }) => getFlag('cesspoolCrossingSafe'),
        text: 'A line of slightly drier stones now leads west past Slorum\'s table, each one tacitly licensed by her approval and therefore somehow more unnerving than the sludge.',
      },
    ],
    objects: {
      slorum: {
        name: 'Slorum',
        aliases: ['slorum', 'hostess', 'otyugh'],
        description: 'Slorum is a broad, foul, half-submerged creature with bright attentive eyes and the offended poise of someone forced to curate elegance in appalling conditions.',
        actions: {
          ask: slorumAsk,
          tell: slorumTell,
          show({ item, getFlag }) {
            if (item.id === 'scented-soap' || item.id === 'silver-mirror') {
              if (!getFlag('slorumFlattered')) {
                return `Slorum eyes the ${item.name} with hungry interest. "Lovely," she says. "Now accompany it with better manners."`;
              }

              return `Slorum brightens visibly at the sight of the ${item.name}. "Yes," she says. "That belongs at a table like this."`;
            }

            return `Slorum considers the ${item.name} and decides it lacks either refinement or sewage relevance.`;
          },
          give({ item, getFlag, setFlag, worldState }) {
            if (item.id !== 'scented-soap' && item.id !== 'silver-mirror') {
              return `Slorum rejects the ${item.name} on aesthetic grounds.`;
            }

            if (!getFlag('slorumFlattered')) {
              return `Slorum reaches toward the ${item.name}, then withdraws with visible dignity. "A gift before praise is logistics," she says. "I am hosting, not sorting."`;
            }

            setFlag('slorumMet', true);
            setFlag('slorumGifted', true);
            setFlag('cesspoolCrossingSafe', true);
            worldState.removeItemById(item.id);

            if (item.id === 'scented-soap') {
              return 'Slorum accepts the scented soap with trembling delight, immediately washing one cracked doll with ceremonial seriousness. "There," she says. "At last, a guest who understands presentation." She shifts her bulk aside and indicates a line of dry stones leading west past the table.';
            }

            return 'Slorum takes the silver mirror and props it beside the place of honor so the little dinner party can admire itself properly. Satisfied, she lifts one trailing limb from the safest stones and grants you the western passage with solemn courtesy.';
          },
        },
      },
      cistern: 'The stone cistern is wide enough to qualify as an insult to hydraulics. Runoff, refuse, and stagnant dignity all collect here under the house like truths flushed out of sight but not out of existence.',
      crates: 'The crates have been dragged into table height and bullied into elegance by Slorum\'s standards. Their wood is warped, their purpose ceremonial, and their success disturbing.',
      table: 'The mock dinner table is built from crate wood, broken plates, doll limbs, and salvaged silver arranged with disturbing care, as if etiquette itself had washed up here and adapted.',
      dolls: 'The cracked dolls are posed as guests in various states of ruin and etiquette, each one waiting for a course that should never be served.',
      platters: 'The broken platters still carry the memory of courses that once aspired upward in the house. Down here they have been reassigned to Slorum\'s ghastly little salon with solemn respect.',
      silver: {
        aliases: ['silver', 'salvaged silver'],
        description: 'The salvaged silver has been polished well past reason. Each fork and spoon gleams with the desperate conviction that refinement can survive almost any context except being noticed honestly.',
      },
      ledges: 'The ledges around the cistern wall are narrow, slick, and much less safe than Slorum\'s approval would make them sound.',
      water: 'Calling it water is generous. The cesspool has ambitions beyond chemistry and no interest in modesty.',
    },
  });
}

export default createCesspoolRoom;