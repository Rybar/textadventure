import { Item } from '../../engine/models/item.js';
import { Room } from '../../engine/models/room.js';

export function createFoyerRoom() {
  const blackCloak = new Item({
    id: 'black-cloak',
    name: 'black cloak',
    aliases: ['cloak', 'black coat'],
    description: 'A heavy black cloak cut for dramatic entrances and forgiving shadows.',
    actions: {
      wear() {
        return 'You put on the black cloak. It hangs with enough authority to make lesser lies feel plausible.';
      },
    },
  });

  const piano = new Item({
    id: 'piano-creature',
    name: 'piano creature',
    aliases: ['piano', 'creature'],
    description: 'A grand piano perched on crabbed feet, singing baritone opera to no one in particular. The lacquered lid trembles slightly when it holds a note.',
    actions: {
      listen() {
        return 'The piano creature sings about appetite, empire, and a moon that drowned itself in butter. The tune is lovely. The words are less so.';
      },
      look() {
        return 'From the front it is merely uncanny. From the wrong angle it becomes obvious that something anatomical has been forced into the shape of an instrument.';
      },
    },
    portable: false,
  });

  const coatRack = new Item({
    id: 'coat-rack',
    name: 'coat rack',
    aliases: ['rack'],
    description: 'A polished rack that holds cloaks for guests and, perhaps, a few for those who never quite finished leaving.',
    portable: false,
  });

  return new Room({
    id: 'foyer',
    title: 'Foyer',
    description: `
The foyer is all red carpet, white pillars, and overconfident elegance. A crystal chandelier burns overhead with a light too flattering to be trusted.
Two mutant ogre butlers stand on ceremonial alert near the center of the hall while a piano creature sings to the chandelier as if it were royalty.
West lies a sitting room for waiting guests. A stair curves up to the guest rooms, and a broad passage north opens toward the smell of dinner.
`.trim(),
    exits: {
      south: 'grandStairs',
      west: 'sittingRoom',
      north: 'feastHall',
      up: 'guestRoom',
    },
    exitGuards: {
      north({ getFlag }) {
        if (getFlag('foyerAdmitted')) {
          return null;
        }

        return 'One of the ogre butlers steps neatly into your path. "The feast receives invited guests," he says. The implication is that unverified guests may be received differently.';
      },
    },
    verbs: {
      shake({ command }) {
        const target = command.directObject;
        if (!target) {
          return 'Shake what?';
        }

        if (target.includes('hand') || target.includes('oggaf') || target.includes('zamzam') || target.includes('ogre')) {
          return 'You offer a cautious handshake. Oggaf accepts with one gloved hand while Zamzam watches with both heads. The exchange is impeccably formal and leaves you feeling very slightly inspected.';
        }

        return `Shaking the ${target} would improve very little.`;
      },
      search({ command, getFlag, setFlag }) {
        const target = command.directObject;

        if (!target || target.includes('foyer') || target.includes('carpet') || target.includes('floor')) {
          if (!getFlag('foyerSurveillanceNoticed')) {
            setFlag('foyerSurveillanceNoticed', true);
            return 'You crouch to inspect the red carpet and find threadbare channels worn into it by repeated pacing at exactly the butlers\' watch positions. Hospitality here has ruts. So does surveillance.';
          }

          return 'The carpet still shows the same disciplined wear patterns around the butlers\' station, proof that the room has practiced receiving people for a long time.';
        }

        if (target.includes('rack') || target.includes('cloak')) {
          if (!getFlag('foyerSurveillanceNoticed')) {
            setFlag('foyerSurveillanceNoticed', true);
          }

          return 'Among the hanging cloaks you find sewn name-tabs, each clipped out after use. Whatever else the house forgets, it does not seem to keep guest names for comfort.';
        }

        return `You search the ${target} and find only polish, etiquette, and the sense of being noticed doing it.`;
      },
    },
    items: [blackCloak, piano, coatRack],
    conditionalDescriptions: [
      {
        when: ({ getFlag }) => getFlag('foyerSurveillanceNoticed'),
        text: 'The room now reads less like ornament and more like a checkpoint dressed as a welcome.',
      },
    ],
    objects: {
      ogres: {
        name: 'ogre butlers',
        aliases: ['ogre butlers', 'butlers', 'ogres'],
        description: 'The ogre butlers bow with alarming grace. One has three arms and the other two heads. Both radiate the polite confidence of men who can remove a guest in pieces.',
        actions: {
          ask({ topic, getFlag }) {
            if (topic.includes('oshregaal') || topic.includes('grandfather')) {
              return 'The butlers answer in perfect unison: "Grandfather receives all worthy guests in due order." The wording suggests that worthiness and order are both actively supervised.';
            }

            if (topic.includes('invitation')) {
              return '"Presentation is customary," says Oggaf. "Verification is healthier," adds Zamzam.';
            }

            if (topic.includes('guest') || topic.includes('room')) {
              return '"Your comforts have been prepared," says Oggaf. "Your conduct remains your own responsibility," adds Zamzam.';
            }

            if (topic.includes('leave') || topic.includes('leav') || topic.includes('exit') || topic.includes('outside')) {
              return 'Both butlers smile with professional regret. "Departures are a later course," says Zamzam.';
            }

            if (topic.includes('piano') || topic.includes('music')) {
              return getFlag('foyerSurveillanceNoticed')
                ? '"The piano assists with ambience and observation," says Oggaf before Zamzam nudges the conversation back toward decorum.'
                : '"The piano contributes to the welcome," says Oggaf. "And to the acoustics," adds Zamzam, which somehow answers more than it should.';
            }

            return 'The butlers provide the sort of courteous non-answer that has ended duels and started them.';
          },
          tell({ topic }) {
            if (topic.includes('name') || topic.includes('invitation')) {
              return 'Oggaf inclines his head. "Your presence is noted." Zamzam adds, "Impropriety, if any, will also be noted."';
            }

            return 'The butlers acknowledge your statement with unsettling hospitality.';
          },
          give({ item, setFlag }) {
            if (item.id === 'invitation') {
              setFlag('foyerAdmitted', true);
              return 'Oggaf takes the invitation delicately, inspects the seal, and returns it with a small bow. "Accepted," he says. Zamzam opens his smile a fraction wider, as if a test has been passed.';
            }

            return `The butlers decline the ${item.name} with grave courtesy.`;
          },
        },
      },
      oggaf: {
        aliases: ['butler'],
        description: 'Oggaf has three arms and the air of a servant who takes correct introductions personally.',
        actions: {
          ask({ topic }) {
            if (topic.includes('name')) {
              return '"Oggaf," he says, as though the answer should already have been engraved somewhere official.';
            }

            return 'Oggaf answers only what etiquette requires and nothing beyond it.';
          },
          give({ item, setFlag }) {
            if (item.id === 'invitation') {
              setFlag('foyerAdmitted', true);
              return 'Oggaf verifies the invitation with solemn concentration, then hands it back. "You may proceed as a guest," he says.';
            }

            return `Oggaf declines the ${item.name} without breaking posture.`;
          },
        },
      },
      zamzam: {
        description: 'Zamzam wears two hats because he has two heads and no patience for compromise.',
        actions: {
          ask({ topic }) {
            if (topic.includes('name')) {
              return '"Zamzam," says the left head. "Still Zamzam," says the right, preemptively annoyed.';
            }

            return 'Zamzam gives you the look of a servant forced to entertain elective questions.';
          },
          tell({ topic }) {
            if (topic.includes('name')) {
              return '"Then try to keep it attached to acceptable behavior," mutters one of Zamzam’s heads.';
            }

            return 'Zamzam receives the information as though filing it for later disapproval.';
          },
        },
      },
      chandelier: 'The chandelier is large enough to bankrupt a lesser noble house and bright enough to make every stain elsewhere feel intentional.',
    },
  });
}

export default createFoyerRoom;