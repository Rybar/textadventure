import { Item } from '../../engine/models/item.js';
import { Room } from '../../engine/models/room.js';

export function createGuestRoom() {
  const getGuestRoomPhase = ({ getFlag }) => {
    if (getFlag('butlerDiversionActive')) {
      return 'loosened';
    }

    if (getFlag('guestBellRung')) {
      return 'monitored';
    }

    return 'presented';
  };

  const advanceGuestRoomScene = ({ currentScenePhase, getRoomState, setRoomState, isItemVisibleHere }) => {
    const sceneState = getRoomState();
    const lastPhase = sceneState.lastGuestRoomPhase ?? null;
    const nextPhaseTurns = lastPhase === currentScenePhase
      ? (sceneState.guestRoomPhaseTurns ?? 0) + 1
      : 1;

    setRoomState({
      lastGuestRoomPhase: currentScenePhase,
      guestRoomPhaseTurns: nextPhaseTurns,
    });

    if (nextPhaseTurns !== 2) {
      return null;
    }

    switch (currentScenePhase) {
      case 'presented':
        return isItemVisibleHere('oil-lamp')
          ? 'The lamp, the chest, and the bell pull maintain their perfect little arrangement, as if the room were practicing how to seem kind without ever becoming safe.'
          : 'The chest and bell pull maintain their perfect little arrangement around the nightstand now missing its lamp, as if the room were practicing how to seem kind without ever becoming safe.';
      case 'monitored':
        return 'After the bell answer from below, the room feels less empty than staffed at a distance, as if your needs have been entered into a ledger instead of ignored.';
      case 'loosened':
        return 'With the correction signal drawing eyes elsewhere, the guest room feels briefly downgraded from custody to furniture.';
      default:
        return null;
    }
  };

  const lamp = new Item({
    id: 'oil-lamp',
    name: 'oil lamp',
    aliases: ['lamp'],
    description: 'A small oil lamp left for the comfort of guests, which in this house may be the same thing as bait.',
    actions: {
      light() {
        this.updateStateDescription('The oil lamp now burns with a small steady flame that makes the room feel inhabited by expectation rather than comfort.');
        return 'You light the oil lamp. The flame sharpens every edge in the room.';
      },
      touch() {
        return 'The lamp is cool for now, all brass composure and stored accusation.';
      },
    },
  });

  const bed = new Item({
    id: 'guest-bed',
    name: 'bed',
    description: 'A perfectly respectable bed made up with sheets that look as though they have never known a nightmare and are due one.',
    actions: {
      sleep() {
        return 'Not yet. The house has only just begun to take an interest in you.';
      },
      sit() {
        return 'You sit on the bed. It is soft in the deeply suspicious way of accommodations designed to make captivity feel like taste.';
      },
    },
    portable: false,
  });

  const chest = new Item({
    id: 'empty-chest',
    name: 'chest',
    aliases: ['empty chest'],
    description: 'An empty chest waiting for luggage, loot, or a more final use of the word guest.',
    actions: {
      open() {
        return 'You lift the lid. The chest is empty except for cedar shavings and a few shallow scratches in the wood, as though prior guests had once reconsidered its intended use from the inside.';
      },
      touch() {
        return 'The cedarwood is smooth and dry under your hand. The lid feels lighter than the mood it suggests.';
      },
    },
    portable: false,
  });

  const bellPull = new Item({
    id: 'bell-pull',
    name: 'bell pull',
    aliases: ['bellpull', 'cord', 'pull'],
    description: 'A tasseled bell pull hangs beside the bed in case a guest requires comfort, service, or a witness.',
    actions: {
      use(context) {
        if (context.getFlag('correctionBellCodeKnown')) {
          if (context.getFlag('butlerDiversionActive')) {
            return 'The bell mechanism is already committed to the correction signal. Ringing again now would only waste the interval you bought.';
          }

          if (!context.getFlag('guestBellRung')) {
            context.setFlag('guestBellRung', true);
          }

          return context.emitEvent('triggerButlerDiversion');
        }

        if (!context.getFlag('guestBellRung')) {
          context.setFlag('guestBellRung', true);
          return 'You tug the bell pull. Somewhere deep in the house, a polite bell answers once. No one comes. The delay feels less negligent than intentional.';
        }

        return 'You ring again. The faint bell replies from below with exactly the same calm note, as if the house is marking your persistence for later review.';
      },
      pull(context) {
        return this.performAction('use', context);
      },
    },
    portable: false,
  });

  const guestCard = new Item({
    id: 'guest-card',
    name: 'guest card',
    aliases: ['card', 'calling card', 'instruction card'],
    description: 'A stiff cream card left on the nightstand in a hand too careful to be friendly.',
    actions: {
      read() {
        return 'The card reads: "Ring once for comfort. Ring twice if your memories trouble you. A servant will attend when convenient." The last phrase does not improve on reflection.';
      },
      touch() {
        return 'The card stock is thick enough to imply authority and smooth enough to imply the authority expects obedience.';
      },
    },
  });

  return new Room({
    id: 'guestRoom',
    title: 'Guest Room',
    description: ({ isItemVisibleHere }) => {
      const lampLine = isItemVisibleHere('oil-lamp')
        ? 'The guest room is almost offensively normal: a neat rococo bed, a nightstand, an empty chest, and an oil lamp waiting to make the shadows feel arranged rather than accidental.'
        : 'The guest room is almost offensively normal: a neat rococo bed, a nightstand, an empty chest, and a vacant patch on the nightstand where an oil lamp had been waiting to make the shadows feel arranged rather than accidental.';

      return `
${lampLine}
It is the sort of room designed to calm a person who has not yet understood how carefully they are being kept.
The stair leads back down to the foyer.
`.trim();
    },
    scene: {
      getPhase: getGuestRoomPhase,
      phases: {
        presented: {
          description: 'At first the room performs ordinary comfort with suspicious discipline, a guest chamber assembled to look restful before it proves supervisory and administrative about it.',
          onTurn: advanceGuestRoomScene,
        },
        monitored: {
          description: 'Once the bell has been tested, the room stops feeling vacant and starts feeling managed, every soft surface implicated in a service system that answers on its own schedule and remembers the request.',
          onTurn: advanceGuestRoomScene,
        },
        loosened: {
          description: 'With the butlers pulled off their normal rhythm, the guest room briefly loses some of its grip. The same furniture remains, but the custody behind it feels fractionally under-attended and therefore newly imaginable as escapable.',
          onTurn: advanceGuestRoomScene,
        },
      },
    },
    exits: {
      north: 'nathemaRoom',
      east: 'bathroom',
      down: 'foyer',
    },
    conditionalDescriptions: [
      {
        when: ({ getFlag }) => getFlag('guestBellRung') && !getFlag('butlerDiversionActive'),
        text: 'Now that you have tested the bell, the room feels calibrated rather than neglected. Service here is clearly real; it is simply not obliged to arrive on your terms.',
      },
      {
        when: ({ getFlag }) => getFlag('butlerDiversionActive'),
        text: 'Somewhere beyond the room, the house sounds fractionally less supervised than usual. Oggaf and Zamzam are attending to the correction signal instead of their normal stations.',
      },
    ],
    items: [lamp, bed, chest, bellPull, guestCard],
    objects: {
      nightstand: 'The nightstand is polished, ordinary, and therefore one of the more suspicious objects in the house.',
      sheets: {
        description: 'The sheets smell faintly of lavender and old dust.',
        actions: {
          smell() {
            return 'The sheets smell of lavender, starch, and the labor of someone who had to make a guest bed for whatever happens next.';
          },
          touch() {
            return 'The sheets are cool and tightly tucked, all hospitality on the surface and nothing trustworthy underneath it.';
          },
        },
      },
      door: 'A lacquered eastern door leads to a guest bathroom lavish enough to suggest that Oshregaal considers hygiene part of the performance.',
    },
  });
}

export default createGuestRoom;