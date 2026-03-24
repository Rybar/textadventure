import { createTopicResponder } from '../../engine/authoring/conversation.js';
import { Item } from '../../engine/models/item.js';
import { Room } from '../../engine/models/room.js';

export function createOgreBedsRoom() {
  const rotateBrushOff = ({ getRoomState, setRoomState }, key, replies) => {
    const roomState = getRoomState();
    const nextIndex = roomState[key] ?? 0;

    setRoomState({
      [key]: nextIndex + 1,
    });

    return replies[nextIndex % replies.length];
  };

  const askBrushOffs = [
    'The servants grumble in their sleep and decline to improve your understanding out loud.',
    'One ogre drags a blanket over his ear and answers you with the kind of silence usually reserved for bad management.',
    'A sleeper scratches his ribs, mutters something profane about bells, and refuses to promote your question into a conversation.',
  ];
  const tellBrushOffs = [
    'Your confidence receives a drowsy snort, a shifting bunk, and no sign that introductions matter here after curfew.',
    'One ogre opens a single eye, decides you are not stew, and closes it again.',
    'The nearest bunk answers your statement with a blanket-haunted grunt that clearly means not now and possibly not ever.',
  ];

  const servantApron = new Item({
    id: 'servant-apron',
    name: 'servant apron',
    aliases: ['apron', 'livery'],
    description: 'A grease-stiff apron marked with old kitchen stains and newer knife-wipes. It carries the authority of being ignored on purpose.',
    actions: {
      wear({ getFlag, setFlag }) {
        if (!getFlag('servantApronWorn')) {
          setFlag('servantApronWorn', true);
        }

        return 'You tie on the servant apron. It smells of stew, sweat, and the sort of invisibility earned through labor.';
      },
    },
  });

  const boneDice = new Item({
    id: 'bone-dice',
    name: 'bone dice',
    aliases: ['dice'],
    description: 'A pair of tiny bone dice rubbed smooth by bored ogre hands and several suspiciously lucky evenings.',
  });

  const sleepingOgresAsk = createTopicResponder({
    rules: [
      {
        match: ['nathema', 'lady'],
        reply: 'One half-awake servant cracks an eye. "Pays in promises," he mutters. "Worse than paying in coin. Coin finishes the conversation."',
      },
      {
        match: ['wrongus', 'kitchen'],
        reply: 'A sleepy grunt from the nearest bunk resolves into words: "Wrongus shouts because the stew listens."',
      },
    ],
    fallback: context => rotateBrushOff(context, 'sleepingOgreAskBrushOffIndex', askBrushOffs),
  });

  const sleepingOgresTell = createTopicResponder({
    fallback: context => rotateBrushOff(context, 'sleepingOgreTellBrushOffIndex', tellBrushOffs),
  });

  return new Room({
    id: 'ogreBeds',
    title: 'Ogre Beds',
    description: `
The servants' dormitory is a long, low room of hanging bunks, damp blankets, boot piles, and resigned domestic violence. Someone has tried to civilize the place with a shelf of shaving mugs and a faded religious print, but the room still smells of sleep, broth, and old quarrels.
The kitchen lies back to the south.
`.trim(),
    exits: {
      south: 'kitchen',
    },
    verbs: {
      search({ command, getFlag, setFlag }) {
        const target = command.directObject;

        if (!target || target.includes('room') || target.includes('bunk') || target.includes('bed')) {
          if (!getFlag('ogreRosterKnown')) {
            setFlag('ogreRosterKnown', true);
            return 'You search the bunks and find a crumpled duty roster naming Oggaf, Zamzam, Wrongus, and three lesser hands assigned to bells, laundry, and late-course clearing. One note complains that Lady Nathema has already bribed two servants this week and tips badly both times.';
          }

          return 'The bunks yield little except stale warmth, bad dreams, and the same duty roster hinting that Nathema is already testing the staff for weaknesses.';
        }

        if (target.includes('locker') || target.includes('trunk') || target.includes('boot')) {
          return 'A dented footlocker holds polish, spare aprons, a broken boot-knife sheath, and enough hair grease to embalm a choir. The servants live badly but not carelessly.';
        }

        return `You search the ${target} and find lint, resentment, and evidence of exhausted professionalism.`;
      },
    },
    items: [servantApron, boneDice],
    conditionalDescriptions: [
      {
        when: ({ getFlag }) => getFlag('ogreRosterKnown'),
        text: 'A crumpled duty roster now lies among the bunks, full of grudges, chores, and one irritated note about Lady Nathema buying help with cheap bribes.',
      },
    ],
    objects: {
      bunks: 'Canvas bunks sag from wall-hooks like surrendered arguments. Several still hold the shapes of very large sleepers.',
      roster: {
        description({ getFlag }) {
          if (!getFlag('ogreRosterKnown')) {
            return 'There are scraps of paper among the bunks, but nothing yet stands out from the general clutter.';
          }

          return 'The roster assigns bells, kitchen labor, corridor watch, and guest-moving in a hand that hates both work and other people. Lady Nathema is mentioned twice, both times with expensive irritation.';
        },
      },
      shaving: 'A shelf of shaving mugs, cracked mirrors, and combs tries very hard to imply dignity and almost manages it.',
      print: 'The religious print shows a saint blessing a table full of meat. Someone has penciled in a chef hat and an obscenity.',
      ogres: {
        name: 'sleeping ogres',
        aliases: ['sleepers', 'servants'],
        description: 'Several off-duty ogres sleep or pretend to. Even at rest they look built for carrying silver, secrets, and bodies.',
        actions: {
          ask: sleepingOgresAsk,
          tell: sleepingOgresTell,
        },
      },
    },
  });
}

export default createOgreBedsRoom;