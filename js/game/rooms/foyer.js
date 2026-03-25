import { createTopicResponder } from '../../engine/authoring/conversation.js';
import { Item } from '../../engine/models/item.js';
import { Room } from '../../engine/models/room.js';

export function createFoyerRoom() {
  const getFoyerPhase = ({ getFlag }) => {
    if (getFlag('foyerAdmitted')) {
      return 'admitted';
    }

    if (getFlag('butlerDiversionActive')) {
      return 'diverted';
    }

    if (getFlag('foyerThresholdTested') || getFlag('foyerSurveillanceNoticed')) {
      return 'scrutiny';
    }

    return 'reception';
  };

  const advanceFoyerScene = ({ currentScenePhase, getRoomState, setRoomState }) => {
    const sceneState = getRoomState();
    const lastPhase = sceneState.lastFoyerScenePhase ?? null;
    const nextPhaseTurns = lastPhase === currentScenePhase
      ? (sceneState.foyerScenePhaseTurns ?? 0) + 1
      : 1;

    setRoomState({
      lastFoyerScenePhase: currentScenePhase,
      foyerScenePhaseTurns: nextPhaseTurns,
    });

    if (nextPhaseTurns !== 2) {
      return null;
    }

    switch (currentScenePhase) {
      case 'reception':
        return 'The piano leans into a welcoming phrase while Oggaf and Zamzam do not move at all. The contrast is the foyer in miniature.';
      case 'scrutiny':
        return 'One of Zamzam\'s heads tracks you while the other watches the door. Oggaf somehow makes stillness feel procedural.';
      case 'diverted':
        return 'Without the butlers at center post, the foyer feels abruptly larger and much less sure of its own manners.';
      case 'admitted':
        return 'Having been accepted, you can feel the foyer relaxing exactly one degree. It is not trust. It is routing.';
      default:
        return null;
    }
  };

  const pianoAsk = createTopicResponder({
    rules: [
      {
        match: ['oshregaal', 'grandfather'],
        reply: 'The piano creature booms a descending phrase that somehow resolves into meaning: "HOST OF GREASE AND GOLD." It seems pleased with the line and repeats the last chord until it shivers.',
      },
      {
        match: ['song', 'music', 'sing'],
        reply: 'The piano creature modulates into a self-satisfied flourish. If it has answered, the answer is that it considers itself underappreciated and correct.',
      },
      {
        match: ['guest', 'guests'],
        reply: 'The piano gives a little stabbing trill and croons, "GUESTS ARRIVE IN MINOR KEYS." It may be improvising, but the house seems to approve.',
      },
    ],
    fallback: 'The piano creature answers with three notes and a judgmental pedal-creak. It is either evasive or very musical.',
  });

  const pianoTell = createTopicResponder({
    rules: [
      {
        match: ['beautiful', 'wonderful', 'magnificent'],
        reply: 'The piano creature swells with audible vanity and rewards you with a velvet-rich chord progression so lush it almost excuses the feet.',
      },
      {
        match: ['quiet', 'silence', 'stop'],
        reply: 'The piano creature goes silent for one offended beat, then resumes in a key that can only be described as punitive.',
      },
    ],
    fallback: 'The piano creature absorbs your remark, translates it into opera, and returns something far less flattering.',
  });

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
      touch() {
        return 'The lacquer is warm and faintly quivering, as if the instrument resents being confirmed as tangible.';
      },
      ask: pianoAsk,
      tell: pianoTell,
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

  const ogresAsk = createTopicResponder({
    rules: [
      {
        match: ['oshregaal', 'grandfather'],
        reply: 'The butlers answer in perfect unison: "Grandfather receives all worthy guests in due order." The wording suggests that worthiness and order are both actively supervised.',
      },
      {
        match: 'invitation',
        reply: '"Presentation is customary," says Oggaf. "Verification is healthier," adds Zamzam.',
      },
      {
        match: ['foyer', 'house', 'mansion'],
        reply: '"This is the receiving hall," says Oggaf. "What is received here depends on conduct," adds Zamzam.',
      },
      {
        match: ['guest', 'room'],
        reply: '"Your comforts have been prepared," says Oggaf. "Your conduct remains your own responsibility," adds Zamzam.',
      },
      {
        match: ['dinner', 'feast', 'meal'],
        reply: '"Dinner proceeds in courses," says Oggaf. "Some guests appreciate the structure more quickly than others," adds Zamzam.',
      },
      {
        match: ['leave', 'leav', 'exit', 'outside'],
        reply: 'Both butlers smile with professional regret. "Departures are a later course," says Zamzam.',
      },
      {
        match: ['piano', 'music'],
        reply: ({ getFlag }) => getFlag('foyerSurveillanceNoticed')
          ? '"The piano assists with ambience and observation," says Oggaf before Zamzam nudges the conversation back toward decorum.'
          : '"The piano contributes to the welcome," says Oggaf. "And to the acoustics," adds Zamzam, which somehow answers more than it should.',
      },
    ],
    fallback: 'The butlers provide the sort of courteous non-answer that has ended duels and started them.',
  });

  const ogresTell = createTopicResponder({
    rules: [
      {
        match: ['name', 'invitation'],
        reply: 'Oggaf inclines his head. "Your presence is noted." Zamzam adds, "Impropriety, if any, will also be noted."',
      },
      {
        match: ['lost', 'confused'],
        reply: '"A temporary condition," says Oggaf. "In good houses it often resolves into obedience," says Zamzam.',
      },
      {
        match: ['hungry', 'tired'],
        reply: '"That is fortunate," says Oggaf. "The house has opinions about both states," adds Zamzam.',
      },
    ],
    fallback: 'The butlers acknowledge your statement with unsettling hospitality.',
  });

  const oggafAsk = createTopicResponder({
    rules: [
      {
        match: 'name',
        reply: '"Oggaf," he says, as though the answer should already have been engraved somewhere official.',
      },
      {
        match: 'zamzam',
        reply: '"My colleague is exacting," Oggaf says. The understatement arrives polished to a ceremonial shine.',
      },
      {
        match: ['guest room', 'upstairs', 'room'],
        reply: '"Suitable accommodation has been prepared," Oggaf says. "Suitability, like all hospitality, is partly reciprocal."',
      },
    ],
    fallback: 'Oggaf answers only what etiquette requires and nothing beyond it.',
  });

  const zamzamAsk = createTopicResponder({
    rules: [
      {
        match: 'name',
        reply: '"Zamzam," says the left head. "Still Zamzam," says the right, preemptively annoyed.',
      },
      {
        match: 'oggaf',
        reply: '"Reliable," says one head. "Tedious in the approved manner," says the other.',
      },
      {
        match: ['guest', 'guests'],
        reply: '"Guests are easiest when they understand they are being arranged," says one head. The other nods as if this were self-evident.',
      },
    ],
    fallback: 'Zamzam gives you the look of a servant forced to entertain elective questions.',
  });

  const zamzamTell = createTopicResponder({
    rules: [
      {
        match: 'name',
        reply: '"Then try to keep it attached to acceptable behavior," mutters one of Zamzam’s heads.',
      },
    ],
    fallback: 'Zamzam receives the information as though filing it for later disapproval.',
  });

  return new Room({
    id: 'foyer',
    title: 'Foyer',
    description: `
The foyer is all red carpet, white pillars, and overconfident elegance. A crystal chandelier burns overhead with a light too flattering to be trusted.
Two mutant ogre butlers stand on ceremonial alert near the center of the hall while a piano creature sings to the chandelier as if it were royalty.
West lies a sitting room for waiting guests. A stair curves up to the guest rooms, and a broad passage north opens toward the smell of dinner.
`.trim(),
    scene: {
      getPhase: getFoyerPhase,
      phases: {
        reception: {
          description: 'At first glance the foyer performs welcome beautifully: music, symmetry, flattering light, and servants arranged to imply that nothing here could possibly be accidental.',
          onTurn: advanceFoyerScene,
        },
        scrutiny: {
          description: 'The foyer has stopped pretending to be neutral space. It is a receiving mechanism, the room\'s decision rendered in muscle and gloves, and you are currently the thing being sorted.',
          onTurn: advanceFoyerScene,
        },
        diverted: {
          description: 'With Oggaf and Zamzam called away, the receiving hall loses its center of enforcement and becomes, for a moment, architecture again instead of policy.',
          onTurn: advanceFoyerScene,
        },
        admitted: {
          description: 'Now that your invitation has passed inspection, the foyer treats you less like an interruption and more like a successfully categorized problem being routed deeper into the house.',
          onTurn: advanceFoyerScene,
        },
      },
    },
    exits: {
      south: 'grandStairs',
      west: 'sittingRoom',
      north: 'feastHall',
      up: 'guestRoom',
    },
    exitGuards: {
      north({ getFlag, setFlag }) {
        if (getFlag('foyerAdmitted')) {
          return null;
        }

        if (getFlag('butlerDiversionActive')) {
          return null;
        }

        setFlag('foyerThresholdTested', true);

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
      {
        when: ({ getFlag }) => getFlag('foyerThresholdTested') && !getFlag('foyerAdmitted') && !getFlag('butlerDiversionActive'),
        text: 'After testing the northern passage, it becomes impossible to miss that the butlers are not decorative. They are the room\'s decision rendered in muscle and gloves.',
      },
      {
        when: ({ getFlag }) => getFlag('butlerDiversionActive') && !getFlag('foyerAdmitted'),
        text: 'For once the center of the foyer stands unwatched. The butlers have been called elsewhere by some deeper domestic emergency.',
      },
    ],
    objects: {
      ogres: {
        name: 'ogre butlers',
        aliases: ['ogre butlers', 'ogre butler', 'ogre', 'butlers', 'ogres', 'servant', 'servants'],
        description: 'The ogre butlers bow with alarming grace. One has three arms and the other two heads. Both radiate the polite confidence of men who can remove a guest in pieces.',
        actions: {
          touch() {
            return 'You test the boundary of foyer etiquette with a cautious touch. One gloved hand intercepts you with immaculate firmness before the gesture can become a problem worth documenting.';
          },
          ask: ogresAsk,
          tell: ogresTell,
          give({ item, emitEvent }) {
            if (item.id === 'invitation') {
              return emitEvent('approveFoyerAdmission', {
                eventText: 'Oggaf takes the invitation delicately, inspects the seal, and returns it with a small bow. "Accepted," he says. Zamzam opens his smile a fraction wider, as if a test has been passed.',
              });
            }

            if (item.id === 'forged-signet-rings') {
              return emitEvent('approveFoyerAdmission', {
                eventText: 'The butlers study the forged signet rings with the weary professionalism of men who have caught better lies before dinner. At length Oggaf nods. "Administrative enough," he says. Zamzam grimaces but steps aside. The house, apparently, is willing to be fooled if the fraud has proper jewelry.',
              });
            }

            return `The butlers decline the ${item.name} with grave courtesy.`;
          },
          show({ item, emitEvent }) {
            if (item.id === 'invitation') {
              return emitEvent('approveFoyerAdmission', {
                eventText: 'Oggaf takes the invitation delicately, inspects the seal, and returns it with a small bow. "Accepted," he says. Zamzam opens his smile a fraction wider, as if a test has been passed.',
              });
            }

            if (item.id === 'forged-signet-rings') {
              return emitEvent('approveFoyerAdmission', {
                eventText: 'You display the forged signet rings. Oggaf examines the marks, Zamzam examines you, and together they arrive at the same exhausted conclusion: this is not worth delaying the procession over. "Proceed," they say with joint disapproval.',
              });
            }

            return `The butlers regard the ${item.name} with faultless reserve.`;
          },
        },
      },
      carpet: {
        aliases: ['carpet', 'red carpet'],
        description: 'The red carpet is thick enough to silence indecision. Up close, the pile shows disciplined wear around the butlers\' post, as though welcome here has been paced, rehearsed, and enforced for years.',
        actions: {
          touch() {
            return 'The carpet yields under your fingers with unnerving luxury. It feels expensive enough to forgive blood and practiced enough not to comment on it.';
          },
          smell() {
            return 'Up close, the carpet smells of dust, polish, and the faint medicinal sweetness of something repeatedly cleaned before it could become evidence.';
          },
        },
      },
      pillars: {
        aliases: ['pillar', 'pillars', 'white pillar', 'white pillars'],
        description: 'The white pillars are all polished confidence and theatrical symmetry. They do nothing structural for your nerves, but they hold the room\'s pretensions upright very efficiently.',
        actions: {
          touch() {
            return 'The pillar is cold, smooth, and utterly committed to the fiction that this house stands on taste alone.';
          },
          push() {
            return 'You lean against the pillar. It declines to be moved by guest opinion.';
          },
        },
      },
      oggaf: {
        aliases: ['butler'],
        description: 'Oggaf has three arms and the air of a servant who takes correct introductions personally.',
        actions: {
          ask: oggafAsk,
          give({ item, emitEvent }) {
            if (item.id === 'invitation') {
              return emitEvent('approveFoyerAdmission', {
                eventText: 'Oggaf verifies the invitation with solemn concentration, then hands it back. "You may proceed as a guest," he says.',
              });
            }

            if (item.id === 'forged-signet-rings') {
              return emitEvent('approveFoyerAdmission', {
                eventText: 'Oggaf turns the forged signet rings once in the light, decides the lie is formal enough for the foyer, and returns them. "You may proceed," he says, sounding unconvinced but procedurally satisfied.',
              });
            }

            return `Oggaf declines the ${item.name} without breaking posture.`;
          },
          show({ item, emitEvent }) {
            if (item.id === 'invitation') {
              return emitEvent('approveFoyerAdmission', {
                eventText: 'Oggaf verifies the invitation with solemn concentration, then hands it back. "You may proceed as a guest," he says.',
              });
            }

            if (item.id === 'forged-signet-rings') {
              return emitEvent('approveFoyerAdmission', {
                eventText: 'Oggaf inspects the forged rings with a sigh almost too civilized to register. "Adequate for the threshold," he says, and the way north is no longer formally contested.',
              });
            }

            return `Oggaf glances at the ${item.name} and finds no procedural use for it.`;
          },
        },
      },
      zamzam: {
        description: 'Zamzam wears two hats because he has two heads and no patience for compromise.',
        actions: {
          ask: zamzamAsk,
          tell: zamzamTell,
          show({ item, emitEvent }) {
            if (item.id === 'invitation') {
              return emitEvent('approveFoyerAdmission', {
                eventText: 'One of Zamzam\'s heads inspects the invitation while the other watches you for errors. At last they nod together. "Accepted," they say, and Oggaf steps aside with professional approval.',
              });
            }

            if (item.id === 'forged-signet-rings') {
              return emitEvent('approveFoyerAdmission', {
                eventText: 'One of Zamzam\'s heads sneers at the forged signet rings while the other grudgingly acknowledges that they are exactly the sort of lie a large house uses on itself daily. "Proceed," they say, making it sound like a clerical insult.',
              });
            }

            return `Zamzam gives the ${item.name} a double look and finds no reason to care.`;
          },
          give({ item, emitEvent }) {
            if (item.id === 'invitation') {
              return emitEvent('approveFoyerAdmission', {
                eventText: 'One of Zamzam\'s heads takes the invitation while the other mutters about presentation. After a short inspection, both nod. "Accepted," they say, and Oggaf redirects you inward with a small formal gesture.',
              });
            }

            if (item.id === 'forged-signet-rings') {
              return emitEvent('approveFoyerAdmission', {
                eventText: 'Zamzam studies the forged signet rings with synchronized contempt, then hands them back as if they have become officially tedious. "Fine," they say. "If fraud must dress for dinner, at least it has made the effort." Oggaf gestures you inward.',
              });
            }

            return `Zamzam declines the ${item.name} with synchronized disapproval.`;
          },
        },
      },
      chandelier: {
        description: 'The chandelier is large enough to bankrupt a lesser noble house and bright enough to make every stain elsewhere feel intentional.',
        actions: {
          touch() {
            return 'You do not quite reach the chandelier, which seems wise. Anything that expensive probably falls in a way that gets blamed on the nearest guest.';
          },
          push() {
            return 'You make a speculative gesture toward the chandelier and think better of escalating the evening into decorative manslaughter.';
          },
        },
      },
    },
  });
}

export default createFoyerRoom;