import { createTopicResponder } from '../../engine/authoring/conversation.js';
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
      look({ getFlag }) {
        if (getFlag('kitchenBloodHintKnown')) {
          return 'Seen with the right context, the cauldron is not one stew but several courses negotiating custody. Beneath the spice and fish rides a thinner red reduction waiting for the scraped contents of the silver cups and the moment Wrongus decides the tiny red gentleman should stand up in public.';
        }

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

  const wrongusAsk = createTopicResponder({
    rules: [
      {
        match: ['stew', 'meal', 'dinner'],
        reply: 'Wrongus bares his teeth proudly. "Main reduction there, sweet finish there, objections nowhere," he says, waving his ladle over the bubbling cauldron like a conducting baton.',
      },
      {
        match: ['fish', 'ingredient', 'ingredients'],
        reply: 'Wrongus sweeps one hand toward the prep tables. "Cave fish, sugar, spice, fungus, blood, texture, timing," he says. "People always think ingredients matter separately. Coward logic."',
      },
      {
        match: ['ooze', 'jar', 'dessert'],
        reply: '"Dessert should resist slightly," Wrongus says. "Otherwise guest learns nothing." The candy ooze in the jar seems insulted by being discussed as a principle.',
      },
      {
        match: ['spice', 'spices'],
        reply: 'Wrongus inhales through his teeth in appreciation. "Spice is argument," he says. "You use enough and the mouth agrees with anything."',
      },
      {
        match: ['blood', 'cup', 'homunculus'],
        effect: ({ triggerEvent }) => {
          triggerEvent('discoverKitchenBloodRitual');
        },
        reply: 'Wrongus snorts. "Little silver cups come back here, yes? Scrape them into the reduction, coax the proteins proper, let the tiny red gentleman stand up in the pot. Good body. Good color. Grandfather likes tradition."',
      },
      {
        match: ['timing', 'course', 'courses', 'service', 'plating'],
        effect: ({ setFlag }) => {
          setFlag('kitchenTimingKnown', true);
        },
        reply: 'Wrongus taps the ladle against the cauldron in a cook\'s private arithmetic. "Wine first, reassurance second, blood by the silver scrape, then the little gentleman for applause," he says. "If the sequence stumbles, guest notices process instead of magic. Very embarrassing."',
      },
      {
        match: ['black wind', 'fruit', 'elixir', 'trade'],
        effect: ({ setFlag }) => {
          setFlag('blackWindEvidenceLeadKnown', true);
        },
        reply: 'Wrongus lowers his ladle a fraction. "Not kitchen stock," he says. "Private stock. Bitter jars, black fruit, shipment nonsense. Grandfather keeps it behind the pantry shelf because guests prefer corruption plated, not shelved."',
      },
      {
        match: ['oshregaal', 'grandfather'],
        reply: '"Grandfather eats praise first, then stew, then consequences," Wrongus says. "Schedule depends on guests."',
      },
      {
        match: ['leave', 'exit', 'outside'],
        reply: 'Wrongus gives you a pitying look usually reserved for cracked platters. "Kitchen sends dishes out," he says. "Does not send guests out. Different service."',
      },
    ],
    fallback: 'Wrongus answers with the attention span of a man reducing six disasters at once.',
  });

  const wrongusTell = createTopicResponder({
    rules: [
      {
        match: ['meal', 'smells good', 'delicious'],
        reply: 'Wrongus puffs up visibly. "Correct," he says. "At last, nose with manners."',
      },
      {
        match: ['i can help', 'need help'],
        reply: 'Wrongus looks you up and down like a dubious chopping board. "Can you stir, lift, or keep secrets at a boil?" he asks. Before you can answer, he has already resumed stirring.',
      },
      {
        match: ['help', 'escape'],
        reply: 'Wrongus stares at you over the rim of the cauldron. "If I helped every guest leave, dinner would get thin," he says, not entirely joking.',
      },
      {
        match: ['timing', 'course', 'service'],
        reply: ({ getFlag }) => getFlag('kitchenTimingKnown')
          ? 'Wrongus squints at you. "Then keep out of the sequence," he says. "One wrong delay and the whole meal starts explaining itself."'
          : 'Wrongus grunts. "Kitchen has sequence," he says. "Learn that before you offer opinions."',
      },
    ],
    fallback: 'Wrongus grunts and keeps stirring.',
  });

  const revealStockroom = emitEvent => emitEvent('discoverAlchemyStockroom');

  const searchKitchen = ({ target, getFlag, emitEvent }) => {
    const canRevealStockroom = getFlag('blackWindEvidenceLeadKnown') || getFlag('nathemaBargained');

    if (!target || target.includes('room') || target.includes('kitchen')) {
      if (!getFlag('kitchenBloodHintKnown')) {
        return 'The kitchen is too active for a casual search. Wrongus, the cauldron, and the jars all seem capable of objecting in different ways.';
      }

      if (getFlag('kitchenTimingKnown')) {
        return 'You search the kitchen with more informed eyes and begin to see its stations as a system of ritual preparation rather than mere cooking: cups near the stove, reduction near the ladle, dessert held back until the room is too relieved to ask what stood up in the pot.';
      }

      return 'You search the kitchen with more informed eyes and begin to see its stations as a system of ritual preparation rather than mere cooking.';
    }

    if (target.includes('cauldron') || target.includes('stew') || target.includes('pot')) {
      return getFlag('kitchenBloodHintKnown')
        ? 'A darker red film clings higher up the iron than ordinary stew would justify. Wrongus has been reducing more than broth here, and the ladle resting nearby is clean only in the suspicious sense.'
        : 'From this close the cauldron smells of fish, spice, wine, and a richer metallic note you could almost mistake for enthusiasm.';
    }

    if (target.includes('table') || target.includes('prep') || target.includes('station') || target.includes('ladle')) {
      if (!getFlag('kitchenTimingKnown')) {
        return 'The prep stations are laid out in a strict sequence: cups nearest the stove, finishing salts by the ladle, dessert jars set well back, and plating trays already arranged by course. Whatever else Wrongus is, he cooks by ritual clock as much as appetite.';
      }

      return 'Now that you understand the rhythm, the stations read like stage marks. Delay the cups, thicken the reduction, move dessert early, and the meal would stop feeling inevitable and start feeling assembled.';
    }

    if (target.includes('silver') || target.includes('cups')) {
      return getFlag('kitchenBloodHintKnown')
        ? 'The silver cups stay close to the stove for quick use, blackened at the rims from reheating and scraping. They are service ware only if one believes ritual and catering are separate professions.'
        : 'The cups look like service ware until you consider how little in this house is ever only one thing.';
    }

    return searchKitchenStorage({ target, getFlag, emitEvent, canRevealStockroom });
  };

  const searchKitchenStorage = ({ target, getFlag, emitEvent, canRevealStockroom }) => {
    if (target.includes('shelf') || target.includes('pantry') || target.includes('jars')) {
      if (!getFlag('alchemyStockroomFound') && canRevealStockroom) {
        return revealStockroom(emitEvent);
      }

      if (getFlag('alchemyStockroomFound')) {
        return 'The pantry shelf now stands slightly ajar, its false back revealing the hidden stockroom behind it.';
      }

      return 'The shelf bows under jars and pantry clutter. Nothing about it would draw attention unless you already suspected the kitchen was hiding more than dessert.';
    }

    if (target.includes('barrel') || target.includes('barrels')) {
      if (!getFlag('alchemyStockroomFound') && canRevealStockroom) {
        return revealStockroom(emitEvent);
      }

      return 'The barrels hold wine, water, and kitchen necessities. The more interesting concealment is not in them but in the wall beyond the pantry shelf.';
    }

    return `You find nothing in the ${target} but expensive ingredients and disciplined menace.`;
  };

  return new Room({
    id: 'kitchen',
    title: 'Kitchen',
    description: `
Wrongus holds dominion here. Barrels line the walls, spice bundles hang from the beams, and an immense cauldron stews on the fire while glass jars full of candy oozes tremble on a shelf.
The whole room smells of wine, fish, sugar, and expensive wrongdoing. West lies the feast hall.
`.trim(),
    exits: {
      west: 'feastHall',
      north: 'ogreBeds',
    },
    verbs: {
      search({ command, getFlag, emitEvent }) {
        return searchKitchen({
          target: command.directObject,
          getFlag,
          emitEvent,
        });
      },
      sabotage({ command, getFlag, setFlag }) {
        const target = command.directObject;

        if (!target) {
          return 'Sabotage what?';
        }

        if (target.includes('stew') || target.includes('cauldron') || target.includes('meal') || target.includes('service')) {
          if (!getFlag('kitchenTimingKnown')) {
            return 'Wrongus has the kitchen moving on a sequence you do not yet understand. Sabotage without that rhythm would just be noise with witnesses.';
          }

          setFlag('kitchenSabotageOpportunityKnown', true);
          return 'You trace the kitchen\'s weak points: delay the silver cups, overwork the reduction, move dessert into the wrong course, and the evening would start explaining itself instead of enchanting. Useful knowledge, but attempting it here and now would turn Wrongus from cook into alarm.';
        }

        return `You do not see a workable way to sabotage the ${target} from here.`;
      },
    },
    items: [spiceBundle, brandyPudding, cauldron, candyOozeJar],
    conditionalDescriptions: [
      {
        when: ({ getFlag }) => getFlag('kitchenBloodHintKnown'),
        text: 'Now that you know what to notice, a rack of silver cups near the stove looks less ceremonial and more preparatory.',
      },
      {
        when: ({ getFlag }) => getFlag('kitchenTimingKnown'),
        text: 'The room\'s bustle has resolved into sequence: prep stations laid out by course, not convenience, and Wrongus conducting the feast like a ritual that happens to be edible.',
      },
      {
        when: ({ getFlag }) => getFlag('kitchenSabotageOpportunityKnown'),
        text: 'Having clocked the sequence, you can now see where the meal could be made to fail theatrically if someone survived long enough to try.',
      },
      {
        when: ({ getFlag }) => getFlag('alchemyStockroomFound'),
        text: 'One pantry shelf now sits slightly proud of the wall, its false back exposing a hidden stockroom door to the east.',
      },
    ],
    objects: {
      wrongus: {
        description: 'Wrongus is a mutant ogre cook with a chef\'s hat balanced over the stunted leg growing from the crown of his head. He looks at food the way generals look at maps.',
        actions: {
          ask: wrongusAsk,
          tell: wrongusTell,
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
      ladle: {
        description({ getFlag }) {
          if (getFlag('kitchenBloodHintKnown')) {
            return 'The ladle is long-handled, scorched, and polished by repeated use. After Wrongus explains the blood work, it looks less like a utensil and more like specialist equipment disguised as one.';
          }

          return 'Wrongus\'s ladle is blackened iron with the authority of a ceremonial scepter.';
        },
      },
      table: {
        aliases: ['prep table', 'prep tables', 'station', 'stations'],
        description({ getFlag }) {
          if (getFlag('kitchenTimingKnown')) {
            return 'The prep tables are arranged by course with almost liturgical precision. Once seen properly, they look like backstage marks for a ritual masquerading as dinner.';
          }

          return 'The prep tables are crowded with fish, herbs, salts, plating trays, and the disciplined clutter of a cook who believes in hierarchy.';
        },
      },
      pantry: {
        aliases: ['pantry shelf', 'shelf'],
        description({ getFlag }) {
          if (getFlag('alchemyStockroomFound')) {
            return 'The pantry shelf has been displaced enough to reveal the lacquered edge of a concealed service door behind it.';
          }

          return 'The pantry shelf is crowded with jars, sweets, and kitchen clutter arranged to look more innocent than the rest of the room deserves.';
        },
      },
      door: {
        aliases: ['service panel', 'panel'],
        description({ getFlag }) {
          if (!getFlag('alchemyStockroomFound')) {
            return 'You do not notice any door here beyond the obvious exits.';
          }

          return 'The concealed panel behind the pantry shelf slides open on well-maintained runners, revealing a private stockroom where the house stores things too incriminating for open kitchen use.';
        },
      },
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