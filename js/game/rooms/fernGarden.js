import { Item } from '../../engine/models/item.js';
import { Room } from '../../engine/models/room.js';

export function createFernGardenRoom() {
  const gnomeStatue = new Item({
    id: 'gnome-statue',
    name: 'gnome statue',
    aliases: ['statue', 'gnome'],
    description: 'A squat stone gnome with a blissful expression and an extra, unnecessary eyelid carved over each eye.',
    portable: true,
  });

  const egg = new Item({
    id: 'peafowl-egg',
    name: 'egg',
    aliases: ['peafowl egg', 'astral egg'],
    description: 'A pale egg with a shell that seems slightly deeper than its surface should allow.',
    portable: true,
  });

  return new Room({
    id: 'fernGarden',
    title: 'Fern Garden',
    description: `
The old garden has gone feral. Ferns taller than a man lean over the path in purple, green, and black fans that drink the cave light.
Eight gnome statues squat between them in attitudes of bliss or revelation. Somewhere overhead, something feathered shifts without quite deciding to show itself.
The safer path leads back southeast toward the cavern and the stairs.
`.trim(),
    exits: {
      southeast: 'cavern',
    },
    items: [gnomeStatue, egg],
    objects: {
      ferns: 'The fronds are slick and cold to the touch. Between them, the darkness looks deeper than the cavern really is.',
      peafowl: 'You glimpse a length of impossible plumage and then nothing at all. Whatever nests here is not entirely concerned with remaining in one plane.',
      statues: 'Each gnome is uniquely mutated and improbably serene, as though the sculptor admired both ecstasy and deformity.',
    },
  });
}

export default createFernGardenRoom;