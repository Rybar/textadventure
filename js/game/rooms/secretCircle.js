import { Item } from '../../engine/models/item.js';
import { Room } from '../../engine/models/room.js';

export function createSecretCircleRoom() {
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
          return 'The circle is already humming with restrained possibility. One more step, later, could carry you out.';
        }

        context.worldState.setFlag('escapeRouteUnlocked', true);
        return 'You read the scroll within the circle. The floor-runes brighten in a slow ring of pale fire, and the chamber acquires the unmistakable feeling of a possible exit.';
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
    onEnter: [
      ({ getFlag, setFlag }) => {
        if (!getFlag('foundTeleportCircle')) {
          setFlag('foundTeleportCircle', true);
        }

        return null;
      },
    ],
    verbs: {
      search({ command }) {
        const target = command.directObject;

        if (!target || target.includes('room') || target.includes('chamber')) {
          return 'A careful search turns up three important facts at once: the bookshelf holds older transit lore than Oshregaal\'s household should possess, the cabinet stores practical escape reagents, and the circle itself has seen far more departures than this room\'s dust would suggest.';
        }

        if (target.includes('books') || target.includes('bookshelf') || target.includes('shelf')) {
          return 'Several books bear shelf marks older than the rest of the manor. One margin note describes the circle as "a borrowed road dressed in newer chalk," which makes the room feel borrowed as well.';
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
    items: [teleportScroll, mutationPotion, portalRing],
    conditionalDescriptions: [
      {
        when: ({ getFlag }) => getFlag('escapeRouteUnlocked'),
        text: 'The circular rune now holds a quiet ring of pale readiness, as if the room itself has admitted the possibility of departure.',
      },
    ],
    objects: {
      skulls: 'The floating skulls glow with steady obedience. Whatever animates them is not interested in being theatrical twice.',
      bookshelf: 'The shelf holds volumes of high sorcery in bindings that look ready to resent a careless reader.',
      cabinet: 'The cabinet contains reagents, vials, and the sort of practical magic a man keeps near an emergency exit.',
      runes: 'The runes are for travel, not summoning. They are patient, old, and absolutely real.',
    },
  });
}

export default createSecretCircleRoom;