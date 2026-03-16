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
    items: [teleportScroll, mutationPotion, portalRing],
    objects: {
      skulls: 'The floating skulls glow with steady obedience. Whatever animates them is not interested in being theatrical twice.',
      bookshelf: 'The shelf holds volumes of high sorcery in bindings that look ready to resent a careless reader.',
      cabinet: 'The cabinet contains reagents, vials, and the sort of practical magic a man keeps near an emergency exit.',
      runes: 'The runes are for travel, not summoning. They are patient, old, and absolutely real.',
    },
  });
}

export default createSecretCircleRoom;