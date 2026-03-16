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
    objects: {
      wrongus: 'Wrongus is a mutant ogre cook with a chef\'s hat balanced over the stunted leg growing from the crown of his head. He looks at food the way generals look at maps.',
      barrels: 'Half the barrels are wine. The rest are water pretending to be respectable company.',
      fish: 'Fresh cave fish lie stacked in readiness, all translucent flesh and milky eyes.',
      shelf: 'The shelf bows under jars of candy ooze, each one straining toward the room like a thought trying to become hunger.',
    },
  });
}

export default createKitchenRoom;