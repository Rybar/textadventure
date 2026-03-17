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
    verbs: {
      search({ command, getFlag, setFlag }) {
        const target = command.directObject;

        if (!target || target.includes('garden') || target.includes('ferns') || target.includes('foliage')) {
          if (!getFlag('fernCulvertNoticed')) {
            setFlag('fernCulvertNoticed', true);
            return 'You part the cold fronds and discover a low stone culvert hidden behind one of the ecstatic gnome statues. Roots choke most of it, but the tunnel proves the garden was once meant to breathe into the house by some quieter route.';
          }

          return 'You search the garden again and find the same hidden culvert behind the statues, still too root-choked for an easy crawl. The knowledge feels more useful than the opening itself.';
        }

        if (target.includes('statue') || target.includes('gnome')) {
          if (!getFlag('fernCulvertNoticed')) {
            setFlag('fernCulvertNoticed', true);
            return 'Kneeling among the gnomes, you notice that one statue sits before a half-buried stone culvert. The opening is narrow and fouled with roots, but it is unmistakably architectural rather than natural.';
          }

          return 'The statues remain blissful and hideous. Behind the rearmost one, the narrow culvert waits in root-clotted secrecy.';
        }

        return `You find nothing in the ${target} but damp leaves, spores, and the feeling of being watched from above.`;
      },
    },
    items: [gnomeStatue, egg],
    conditionalDescriptions: [
      {
        when: ({ getFlag }) => getFlag('fernCulvertNoticed'),
        text: 'Behind one of the statues, a root-choked stone culvert now stands out once you know to look for it.',
      },
    ],
    objects: {
      ferns: 'The fronds are slick and cold to the touch. Between them, the darkness looks deeper than the cavern really is.',
      peafowl: 'You glimpse a length of impossible plumage and then nothing at all. Whatever nests here is not entirely concerned with remaining in one plane.',
      statues: 'Each gnome is uniquely mutated and improbably serene, as though the sculptor admired both ecstasy and deformity.',
      culvert: {
        description({ getFlag }) {
          if (!getFlag('fernCulvertNoticed')) {
            return 'You do not yet spot any opening worth calling a culvert among the roots and fern-shadow.';
          }

          return 'The culvert is old stonework, too deliberate to be a natural crack. It runs under the garden wall toward the house, but roots and wet soil have narrowed it to something only a smaller creature could love.';
        },
      },
    },
  });
}

export default createFernGardenRoom;