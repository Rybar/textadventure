import { createTopicResponder } from '../../engine/authoring/conversation.js';
import { Item } from '../../engine/models/item.js';
import { Room } from '../../engine/models/room.js';

export function createSecretCircleRoom() {
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
    },
  });

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
      search({ command }) {
        const target = command.directObject;

        if (!target || target.includes('room') || target.includes('chamber')) {
          return 'A careful search turns up three important facts at once: the bookshelf holds older transit lore than Oshregaal\'s household should possess, the cabinet stores practical escape reagents, and the circle itself has seen far more departures than this room\'s dust would suggest. A clipped road annotation hidden among the books makes it plain that activation and bypass are not the same problem.';
        }

        if (target.includes('books') || target.includes('bookshelf') || target.includes('shelf')) {
          return 'Several books bear shelf marks older than the rest of the manor. One clipped annotation describes the circle as "a borrowed road dressed in newer chalk" and warns that activation only wakes the prepared route, while true bypass requires understanding the host\'s constraints.';
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
          ask: skullsAsk,
          tell: skullsTell,
        },
      },
      bookshelf: 'The shelf holds volumes of high sorcery in bindings that look ready to resent a careless reader. A clipped road annotation sits hidden among the older transit texts.',
      cabinet: 'The cabinet contains reagents, vials, and the sort of practical magic a man keeps near an emergency exit.',
      runes: 'The runes are for travel, not summoning. They are patient, old, and absolutely real.',
    },
  });
}

export default createSecretCircleRoom;