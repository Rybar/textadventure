import { createTopicResponder } from '../../engine/authoring/conversation.js';
import { Item } from '../../engine/models/item.js';
import { Room } from '../../engine/models/room.js';

export function createSecretCircleRoom() {
  const getSecretCirclePhase = ({ getFlag }) => {
    if (getFlag('escapeRouteUnlocked')) {
      return 'activated';
    }

    if (getFlag('portalBypassLearned')) {
      return 'interpreted';
    }

    return 'discovered';
  };

  const advanceSecretCircleScene = ({ currentScenePhase, getRoomState, setRoomState }) => {
    const sceneState = getRoomState();
    const lastPhase = sceneState.lastSecretCirclePhase ?? null;
    const nextPhaseTurns = lastPhase === currentScenePhase
      ? (sceneState.secretCirclePhaseTurns ?? 0) + 1
      : 1;

    setRoomState({
      lastSecretCirclePhase: currentScenePhase,
      secretCirclePhaseTurns: nextPhaseTurns,
    });

    if (nextPhaseTurns !== 2) {
      return null;
    }

    switch (currentScenePhase) {
      case 'discovered':
        return 'The drifting skulls adjust by a fraction as if acknowledging a new observer, while the floor circle goes on pretending it is only waiting decor.';
      case 'interpreted':
        return 'Now that you understand the difference between activation and bypass, the room feels less generous and more technically honest.';
      case 'activated':
        return 'A pale line of fire crawls the circle\'s edge and holds. The chamber has not opened, exactly, but it has started listening.';
      default:
        return null;
    }
  };

  const roadAnnotation = new Item({
    id: 'road-annotation',
    name: 'road annotation',
    aliases: ['annotation', 'margin note', 'road note', 'portal note'],
    description: 'A clipped annotation tucked into the older transit books, written by a more practical hand than Oshregaal\'s.',
    actions: {
      read({ getFlag, setFlag }) {
        if (!getFlag('portalBypassLearned')) {
          setFlag('portalBypassLearned', true);
        }

        return 'The note reads: "The circle is a borrowed road, not a sovereign gate. Activation opens the prepared route only. If the host closes his hand on the road, bypass the etiquette elsewhere: the geometry can still be insulted into compliance by someone who understands the constraint."';
      },
      touch() {
        return 'The clipped annotation crackles slightly in your fingers, as if even the paper resents how useful it is.';
      },
    },
  });
  roadAnnotation.hide();

  const teleportScroll = new Item({
    id: 'teleport-scroll',
    name: 'teleport scroll',
    aliases: ['scroll'],
    description: 'A scroll of activation worked in tight deliberate characters around a central glyph of departure.',
    actions: {
      read(context) {
        if (context.currentRoom.id !== 'secretCircle') {
          return 'The runes describe portal activation, but the working clearly requires a prepared circle.';
        }

        if (context.worldState.getFlag('escapeRouteUnlocked')) {
          return 'The circle is already humming with restrained possibility. The scroll can only wake this prepared road; if you wanted a bypass rather than an activation, you would need the underlying route mathematics, not more ceremony.';
        }

        context.worldState.setFlag('escapeRouteUnlocked', true);
        return 'You read the scroll within the circle. The floor-runes brighten in a slow ring of pale fire, and the chamber acquires the unmistakable feeling of a possible exit. But the working is narrow, not sovereign: this is one prepared road, not mastery over all of Oshregaal\'s thresholds.';
      },
      use(context) {
        return this.performAction('read', context);
      },
      touch() {
        return 'The scroll feels dry, old, and more obedient than any scrap of paper should be.';
      },
    },
  });

  const mutationPotion = new Item({
    id: 'mutation-potion',
    name: 'mutation potion',
    aliases: ['potion'],
    description: 'A stoppered vial of cloudy fluid that seems to keep changing its mind about color.',
    actions: {
      drink() {
        return 'You stop the vial just short of your lips. There are braver acts than drinking mystery mutation fluid, but not many stupider ones.';
      },
      touch() {
        return 'The potion shifts color against the glass as you turn it, indecisive in a way no liquid with intentions should be.';
      },
    },
  });

  const portalRing = new Item({
    id: 'portal-ring',
    name: 'portal ring',
    aliases: ['circle', 'floor rune'],
    description: 'A huge circular floor rune worked for transit rather than display. Standing in its center feels like interrupting a sentence halfway through.',
    portable: false,
  });

  const skullsAsk = createTopicResponder({
    rules: [
      {
        match: ['circle', 'rune', 'portal'],
        reply: 'The skulls drift in a slow shared arc. One clicks its teeth and emits a whisper thin as chalk: "ROAD, NOT SUMMONING. PREPARED WAY, NOT FREE PASSAGE."',
      },
      {
        match: ['bypass', 'constraint', 'geometry', 'road'],
        reply: 'A skull turns in a tiny annoyed circle. "HOST KEEPS ACTIVATION HERE," it whispers. "BYPASS LIVES IN THE INSULT, NOT THE CHALK."',
      },
      {
        match: ['oshregaal', 'grandfather'],
        reply: 'The skulls do not answer directly, but their light gutters for a moment as though the name has been handled too often.',
      },
      {
        match: ['leave', 'escape'],
        reply: 'A skull rotates until its empty sockets face east, then back to the circle. The gesture is not hope, but it is information.',
      },
    ],
    fallback: 'The skulls respond with a faint clatter of teeth, as if discussing whether speech would be worth the effort.',
  });

  const skullsTell = createTopicResponder({
    rules: [
      {
        match: 'thank you',
        reply: 'The skulls brighten by a hair. In a room like this, that almost counts as warmth.',
      },
    ],
    fallback: 'The skulls absorb your words into their glow and return only patient silence.',
  });

  return new Room({
    id: 'secretCircle',
    title: 'Secret Circle',
    description: `
This hidden chamber lies behind heavy red curtains and smells of dust, wax, and old spellwork. Five glowing skulls drift near the ceiling, illuminating a bookshelf, a wall cabinet, and a broad circular rune set into the floor.
Every surface suggests power guarded by inconvenience rather than by secrecy. The feast hall lies back to the east.
`.trim(),
    scene: {
      getPhase: getSecretCirclePhase,
      phases: {
        discovered: {
          description: 'At first the chamber feels like a concealed answer: older than the feast, practical in its occultism, and only half interested in whether you deserve to be here or merely need it badly enough.',
          onTurn: advanceSecretCircleScene,
        },
        interpreted: {
          description: 'Once the annotation has corrected your assumptions, the room stops reading as a complete escape and starts reading as a precise instrument embedded in a larger threshold problem Oshregaal never fully solved.',
          onTurn: advanceSecretCircleScene,
        },
        activated: {
          description: 'With the scroll read, the chamber has shifted from dormant apparatus to live route: narrow, conditional, and dangerous in the specific way working exits usually are when someone else designed them first.',
          onTurn: advanceSecretCircleScene,
        },
      },
    },
    exits: {
      east: 'feastHall',
    },
    triggers: {
      enter: [
        {
          id: 'secretCircle:discover-circle',
          once: true,
          when: ({ getFlag }) => !getFlag('foundTeleportCircle'),
          run: ({ setFlag }) => {
            setFlag('foundTeleportCircle', true);
            return null;
          },
        },
      ],
    },
    verbs: {
      search({ command, isItemVisibleHere }) {
        const target = command.directObject;

        if (!target || target.includes('room') || target.includes('chamber')) {
          if (!roadAnnotation.visible) {
            roadAnnotation.reveal();
          }

          const annotationText = isItemVisibleHere('road-annotation')
            ? 'A clipped road annotation hidden among the books makes it plain that activation and bypass are not the same problem.'
            : 'The gap among the transit texts still makes it plain that activation and bypass are not the same problem.';

          return `A careful search turns up three important facts at once: the bookshelf holds older transit lore than Oshregaal\'s household should possess, the cabinet stores practical escape reagents, and the circle itself has seen far more departures than this room\'s dust would suggest. ${annotationText}`;
        }

        if (target.includes('books') || target.includes('bookshelf') || target.includes('shelf')) {
          if (!roadAnnotation.visible) {
            roadAnnotation.reveal();
          }

          return isItemVisibleHere('road-annotation')
            ? 'Several books bear shelf marks older than the rest of the manor. One clipped annotation describes the circle as "a borrowed road dressed in newer chalk" and warns that activation only wakes the prepared route, while true bypass requires understanding the host\'s constraints.'
            : 'Several books bear shelf marks older than the rest of the manor. The gap where a clipped annotation had been tucked among them still tells you the room once explained the difference between activation and bypass more plainly than Oshregaal likely intended.';
        }

        if (target.includes('cabinet')) {
          return 'The cabinet yields salts, chalk, folded linen, and practical exit-work. Someone stocked it for leaving in a hurry, which is more reassuring than the mutation potion and less reassuring than it ought to be.';
        }

        if (target.includes('circle') || target.includes('rune') || target.includes('runes')) {
          return 'Close inspection shows the circle has been renewed in places but not invented here. Older scoring lies beneath the brighter marks, proof that the apparatus predates Oshregaal\'s current domestic theatrics.';
        }

        return `You search the ${target} and find dust, wax, and the sense that more useful people have already taken what mattered most.`;
      },
    },
    items: [roadAnnotation, teleportScroll, mutationPotion, portalRing],
    conditionalDescriptions: [
      {
        when: ({ getFlag }) => getFlag('escapeRouteUnlocked'),
        text: 'The circular rune now holds a quiet ring of pale readiness, as if the room itself has admitted the possibility of departure.',
      },
      {
        when: ({ getFlag }) => getFlag('portalBypassLearned'),
        text: 'Once you understand the annotation\'s warning, the chamber feels less like a complete answer and more like one useful segment in a larger escape grammar.',
      },
    ],
    objects: {
      skulls: {
        description: 'The floating skulls glow with steady obedience. Whatever animates them is not interested in being theatrical twice.',
        actions: {
          touch() {
            return 'You make a cautious reach toward the nearest skull. It drifts just out of range with the mild contempt of a thing used to being consulted, not handled.';
          },
          ask: skullsAsk,
          tell: skullsTell,
        },
      },
      bookshelf: {
        description({ isItemVisibleHere }) {
          return isItemVisibleHere('road-annotation')
            ? 'The shelf holds volumes of high sorcery in bindings that look ready to resent a careless reader. A clipped road annotation sits hidden among the older transit texts.'
            : 'The shelf holds volumes of high sorcery in bindings that look ready to resent a careless reader. A narrow gap among the older transit texts marks where a clipped road annotation had been tucked away.';
        },
        actions: {
          touch() {
            return 'Dust, leather, and old spellwork meet your fingertips in equal measure. The shelf has the air of having survived several owners and trusted none of them.';
          },
        },
      },
      cabinet: {
        description: 'The cabinet contains reagents, vials, and the sort of practical magic a man keeps near an emergency exit.',
        actions: {
          touch() {
            return 'The cabinet wood is cool and dry, built for practical emergencies rather than ceremonial wonder.';
          },
        },
      },
      runes: {
        description: 'The runes are for travel, not summoning. They are patient, old, and absolutely real.',
        actions: {
          touch() {
            return 'The etched circle is cold at first touch, then faintly humming, like a road remembering it used to be open.';
          },
        },
      },
    },
  });
}

export default createSecretCircleRoom;