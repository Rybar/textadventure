import { Item } from '../../engine/models/item.js';
import { Room } from '../../engine/models/room.js';

export function createGuestRoom() {
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
    },
    portable: false,
  });

  const chest = new Item({
    id: 'empty-chest',
    name: 'chest',
    aliases: ['empty chest'],
    description: 'An empty chest waiting for luggage, loot, or a more final use of the word guest.',
    portable: false,
  });

  return new Room({
    id: 'guestRoom',
    title: 'Guest Room',
    description: `
The guest room is almost offensively normal: a neat rococo bed, a nightstand, an empty chest, and an oil lamp waiting to make the shadows feel arranged rather than accidental.
It is the sort of room designed to calm a person who has not yet understood how carefully they are being kept.
The stair leads back down to the foyer.
`.trim(),
    exits: {
      down: 'foyer',
    },
    items: [lamp, bed, chest],
    objects: {
      nightstand: 'The nightstand is polished, ordinary, and therefore one of the more suspicious objects in the house.',
      sheets: 'The sheets smell faintly of lavender and old dust.',
    },
  });
}

export default createGuestRoom;