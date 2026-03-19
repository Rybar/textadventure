import { createTopicResponder } from '../../engine/authoring/conversation.js';
import { Item } from '../../engine/models/item.js';
import { Room } from '../../engine/models/room.js';

export function createSittingRoom() {
  const getSittingRoomPhase = ({ getFlag }) => {
    if (getFlag('sittingRoomWaterTasted')) {
      return 'compliance';
    }

    if (getFlag('sittingRoomGossipKnown') || getFlag('folioMarginNoted')) {
      return 'whispering';
    }

    return 'waiting';
  };

  const advanceSittingRoomScene = ({ currentScenePhase, getRoomState, setRoomState }) => {
    const sceneState = getRoomState();
    const lastPhase = sceneState.lastSittingRoomPhase ?? null;
    const nextPhaseTurns = lastPhase === currentScenePhase
      ? (sceneState.sittingRoomPhaseTurns ?? 0) + 1
      : 1;

    setRoomState({
      lastSittingRoomPhase: currentScenePhase,
      sittingRoomPhaseTurns: nextPhaseTurns,
    });

    if (nextPhaseTurns !== 2) {
      return null;
    }

    switch (currentScenePhase) {
      case 'waiting':
        return 'One couch exhales, the fountain answers with a bright little burble, and the room resumes rehearsing patience at you.';
      case 'whispering':
        return 'Now that you have heard the room properly, every small sound arrives as if it might be gossip pretending to be furniture.';
      case 'compliance':
        return 'The memory of the fountain water lingers just long enough to make the room\'s softness feel briefly persuasive.';
      default:
        return null;
    }
  };

  const couchAsk = createTopicResponder({
    rules: [
      {
        match: ['guest', 'guests'],
        reply: 'The couches rustle among themselves. "Guests come in stiff," one whispers. "They leave softer or not at all," murmurs another.',
      },
      {
        match: ['butler', 'ogre'],
        reply: 'A leather couch exhales impatiently. "The butlers hear everything," it whispers. "That is why they never need to raise their voices."',
      },
    ],
    fallback: 'The couches confer in upholstery tones and decide you have not yet earned their better gossip.',
  });

  const couchTell = createTopicResponder({
    rules: [
      {
        match: ['i am tired', 'i am exhausted', 'tired'],
        reply: 'The couch beneath you swells in smug sympathy. "So sit," it seems to whisper. "That is how houses begin to keep people."',
      },
    ],
    fallback: 'The couches receive your confidence with the delighted discretion of furniture that already knows worse.',
  });

  const fountain = new Item({
    id: 'fountain',
    name: 'fountain',
    description: 'A small fountain of sparkling water bubbles in the corner, too tasteful to be innocent.',
    actions: {
      drink(context) {
        context?.setFlag?.('sittingRoomWaterTasted', true);
        return 'The water is crisp and impossibly clean. It leaves you refreshed, slightly foolish, and convinced for a moment that obedience might not be the worst thing in the world.';
      },
      listen(context) {
        context?.setFlag?.('sittingRoomGossipKnown', true);
        return 'The fountain chatters over itself in a polite little voice, as though rehearsing conversation topics for nervous guests.';
      },
    },
    portable: false,
  });

  const glassCup = new Item({
    id: 'glass-cup',
    name: 'glass cup',
    aliases: ['cup'],
    description: 'A thin glass cup light enough to feel expensive and breakable in equal measure.',
  });

  const folio = new Item({
    id: 'skin-folio',
    name: 'folio',
    aliases: ['book', 'skin-bound folio'],
    description: 'A skin-bound folio full of skinned cats and nonsense writing, the sort of object designed either to impress or to remove the right kind of guest.',
    actions: {
      read(context) {
        context?.setFlag?.('folioMarginNoted', true);
        return 'The text remains gibberish no matter how carefully you study it. The cats, however, seem annotated with total seriousness.';
      },
    },
  });

  const couch = new Item({
    id: 'breathing-couch',
    name: 'couch',
    aliases: ['couches', 'sofa'],
    description: 'Four couches upholstered in leather, lace, canvas, and fur. If you watch long enough, they begin to breathe in slow domestic harmony.',
    actions: {
      listen(context) {
        context?.setFlag?.('sittingRoomGossipKnown', true);
        return 'The couches whisper to one another about the staff, the guests, and Grandfather’s latest weight gain with malicious household intimacy.';
      },
      sit(context) {
        context?.setFlag?.('sittingRoomGossipKnown', true);
        return 'The couch yields under you like a living thing considering whether to tolerate your presence.';
      },
      ask(context) {
        context?.setFlag?.('sittingRoomGossipKnown', true);
        return couchAsk(context);
      },
      tell(context) {
        context?.setFlag?.('sittingRoomGossipKnown', true);
        return couchTell(context);
      },
    },
    portable: false,
  });

  return new Room({
    id: 'sittingRoom',
    title: 'Sitting Room',
    description: `
This room is arranged for guests who are expected to wait and, while waiting, question their instincts.
Four couches of mismatched luxury breathe almost imperceptibly around a low table of obscene folios. In the corner, a fountain spills bright water into a basin lined with stacked glass cups.
The foyer lies back to the east.
`.trim(),
    scene: {
      getPhase: getSittingRoomPhase,
      phases: {
        waiting: {
          description: 'At first the room seems merely patient: a holding space dressed in comfort and designed to make waiting feel like a choice.',
          onTurn: advanceSittingRoomScene,
        },
        whispering: {
          description: 'Once you start listening, the sitting room stops being restful and starts being social in a deeply household way, all whispers, side-comments, and managed unease.',
          onTurn: advanceSittingRoomScene,
        },
        compliance: {
          description: 'After tasting the fountain water, the room\'s comforts feel more coordinated than comforting, as though hospitality here has begun trying to think on your behalf.',
          onTurn: advanceSittingRoomScene,
        },
      },
    },
    exits: {
      east: 'foyer',
    },
    verbs: {
      search({ command, getFlag, setFlag }) {
        const target = command.directObject;

        if (!target || target.includes('room') || target.includes('table') || target.includes('folios')) {
          if (!getFlag('folioMarginNoted')) {
            setFlag('folioMarginNoted', true);
            return 'You rifle the folios and loose papers until one margin note emerges from the nonsense: "butlers hear the bell before they hear the guest." The rest returns to gibberish as if embarrassed to have been useful.';
          }

          return 'The folios remain obscene, unreadable, and occasionally helpful in spite of themselves. The one useful margin note about the butlers and the guest bell is still there if you pretend not to need it.';
        }

        if (target.includes('couch') || target.includes('couches') || target.includes('sofa')) {
          if (!getFlag('sittingRoomGossipKnown')) {
            setFlag('sittingRoomGossipKnown', true);
            return 'You search between the breathing cushions and are rewarded mostly with dust, one glass bead, and a muttered complaint from the upholstery: apparently the butlers dislike being summoned twice for the same guest.';
          }

          return 'The couches resent your hands but repeat the same household malice in softer upholstery tones.';
        }

        return `You search the ${target} and find only guest-room polish and seated suspicion.`;
      },
    },
    items: [fountain, glassCup, folio, couch],
    conditionalDescriptions: [
      {
        when: ({ getFlag }) => getFlag('sittingRoomGossipKnown'),
        text: 'Once heard properly, the room no longer feels quiet at all. The couches and fountain keep up a household murmur about guests, bells, and staff resentment.',
      },
      {
        when: ({ getFlag }) => getFlag('sittingRoomWaterTasted'),
        text: 'The fountain water still leaves a faint afterimage of compliance at the edge of your thoughts.',
      },
    ],
    objects: {
      table: 'The low table is laden with folios chosen to frighten, flatter, or classify a waiting guest.',
      basin: 'The basin beneath the fountain is too clean for a room this old, as if refreshed between anxieties.',
    },
  });
}

export default createSittingRoom;