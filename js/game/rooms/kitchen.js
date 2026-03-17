import { Item } from '../../engine/models/item.js';
import { Room } from '../../engine/models/room.js';

export function createKitchenRoom() {
  const spiceBundle = new Item({
    id: 'spice-bundle',
    name: 'spice bundle',
    aliases: ['spices'],
    description: 'A fresh bundle of cavern herbs and impossible spices tied up in kitchen twine.',
  });

  const brandyPudding = new Item({
    id: 'brandy-pudding',
    name: 'brandy pudding',
    aliases: ['bottle'],
    description: 'A bottle of brandy pudding so rich it may qualify as both dessert and weapon.',
    actions: {
      drink() {
        return 'The brandy pudding hits like a velvet hammer. Wrongus would probably approve. A doctor would not.';
      },
    },
  });

  const cauldron = new Item({
    id: 'cauldron',
    name: 'cauldron',
    aliases: ['stew'],
    description: 'An enormous cauldron of stew burbles over the fire with sinister culinary confidence.',
    actions: {
      look() {
        return 'The stew is crowded with expensive spices and at least one ingredient better left genetically unconfirmed.';
      },
      eat() {
        return 'You taste the stew. It is magnificent, which is exactly the sort of problem this house would produce.';
      },
    },
    portable: false,
  });

  const candyOozeJar = new Item({
    id: 'candy-ooze-jar',
    name: 'jar',
    aliases: ['candy ooze', 'ooze jar'],
    description: 'A jar containing a bright candy ooze that keeps pressing itself against the glass with determined dessert hostility.',
    actions: {
      eat() {
        return 'You decide against eating a living confection while it is still glaring at you.';
      },
    },
  });

  return new Room({
    id: 'kitchen',
    title: 'Kitchen',
    description: `
Wrongus holds dominion here. Barrels line the walls, spice bundles hang from the beams, and an immense cauldron stews on the fire while glass jars full of candy oozes tremble on a shelf.
The whole room smells of wine, fish, sugar, and expensive wrongdoing. West lies the feast hall.
`.trim(),
    exits: {
      west: 'feastHall',
    },
    items: [spiceBundle, brandyPudding, cauldron, candyOozeJar],
    conditionalDescriptions: [
      {
        when: ({ getFlag }) => getFlag('kitchenBloodHintKnown'),
        text: 'Now that you know what to notice, a rack of silver cups near the stove looks less ceremonial and more preparatory.',
      },
    ],
    objects: {
      wrongus: {
        description: 'Wrongus is a mutant ogre cook with a chef\'s hat balanced over the stunted leg growing from the crown of his head. He looks at food the way generals look at maps.',
        actions: {
          ask({ topic, setFlag }) {
            if (topic.includes('stew') || topic.includes('meal') || topic.includes('dinner')) {
              return 'Wrongus bares his teeth proudly. "Main reduction there, sweet finish there, objections nowhere," he says, waving his ladle over the bubbling cauldron like a conducting baton.';
            }

            if (topic.includes('blood') || topic.includes('cup') || topic.includes('homunculus')) {
              setFlag('kitchenBloodHintKnown', true);
              return 'Wrongus snorts. "Little silver cups come back here, yes? Scrape them into the reduction, coax the proteins proper, let the tiny red gentleman stand up in the pot. Good body. Good color. Grandfather likes tradition."';
            }

            if (topic.includes('oshregaal') || topic.includes('grandfather')) {
              return '"Grandfather eats praise first, then stew, then consequences," Wrongus says. "Schedule depends on guests."';
            }

            if (topic.includes('leave') || topic.includes('exit') || topic.includes('outside')) {
              return 'Wrongus gives you a pitying look usually reserved for cracked platters. "Kitchen sends dishes out," he says. "Does not send guests out. Different service."';
            }

            return 'Wrongus answers with the attention span of a man reducing six disasters at once.';
          },
          tell({ topic }) {
            if (topic.includes('meal') || topic.includes('smells good') || topic.includes('delicious')) {
              return 'Wrongus puffs up visibly. "Correct," he says. "At last, nose with manners."';
            }

            if (topic.includes('help') || topic.includes('escape')) {
              return 'Wrongus stares at you over the rim of the cauldron. "If I helped every guest leave, dinner would get thin," he says, not entirely joking.';
            }

            return 'Wrongus grunts and keeps stirring.';
          },
          give({ item }) {
            if (item.id === 'spice-bundle') {
              return 'Wrongus accepts the spice bundle with instant professional respect. "Useful," he says. "You may continue existing in my kitchen for another minute."';
            }

            if (item.id === 'brandy-pudding') {
              return 'Wrongus eyes the brandy pudding, approves, and pushes it back. "Keep for nerve failure," he advises. "Guests often need one."';
            }

            return `Wrongus declines the ${item.name} on the grounds that it is not part of his current sequence.`;
          },
        },
      },
      barrels: 'Half the barrels are wine. The rest are water pretending to be respectable company.',
      fish: 'Fresh cave fish lie stacked in readiness, all translucent flesh and milky eyes.',
      shelf: 'The shelf bows under jars of candy ooze, each one straining toward the room like a thought trying to become hunger.',
      silver: {
        aliases: ['silver cups', 'cups'],
        description({ getFlag }) {
          if (!getFlag('kitchenBloodHintKnown')) {
            return 'You notice kitchen silver stacked beside the stove, though at first glance it looks like ordinary service ware awaiting the next course.';
          }

          return 'The silver cups are shallow, scorched, and set close to the stove for quick scraping. Seen in context, they are clearly part of the feast\'s blood ritual rather than ordinary table service.';
        },
      },
    },
  });
}

export default createKitchenRoom;