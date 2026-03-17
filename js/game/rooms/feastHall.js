import { Item } from '../../engine/models/item.js';
import { Room } from '../../engine/models/room.js';

export function createFeastHall() {
  const wine = new Item({
    id: 'wine',
    name: 'wine',
    aliases: ['goblet', 'wine goblet'],
    description: 'A heavy goblet of dark wine that reflects the chandelier in a thin red tremor.',
    actions: {
      drink() {
        return 'The wine runs hot and medicinal down your throat. For one beat of the heart you feel stronger. For the next, slightly less certain that your body remains entirely committed to its current arrangement.';
      },
    },
  });

  const bloodCup = new Item({
    id: 'blood-cup',
    name: 'cup',
    aliases: ['blood cup', 'silver cup'],
    description: 'A silver cup being passed for drops of blood with the breezy confidence of an established custom.',
    actions: {
      use(context) {
        if (context.worldState.getFlag('gaveBlood')) {
          return 'You have already contributed. Oshregaal would call that generosity. A physician might choose another term.';
        }

        context.worldState.setFlag('gaveBlood', true);
        return 'You add a single bright drop to the cup. Around the table, no one reacts as though this were unusual, which is worse than surprise.';
      },
    },
  });

  const roast = new Item({
    id: 'piercer-roast',
    name: 'roast',
    aliases: ['feast', 'food'],
    description: 'The centerpiece is a roasted piercer, chisels laid beside it for the succulent work of extraction. Around it sit stranger dishes whose names would only make things harder.',
    actions: {
      eat() {
        return 'You sample the feast with caution and fail. It is excellent. That does not improve the situation.';
      },
      look() {
        return 'You identify translucent fish stuffed with cheese and rat souls, cave crickets fried crisp, and oozes candied into nervous compliance.';
      },
    },
    portable: false,
  });

  return new Room({
    id: 'feastHall',
    title: 'Feast Hall',
    description: `
An immense dinner table dominates the hall beneath hanging light and red drapery. Tusk guests slump or mutter along its length while servants circulate with the confidence of ritual.
At the far end sits Grandfather Oshregaal: vast, perfumed, wheezing, and very much enjoying himself. An imp paces the table on a chain, carrying a butter dish like a sentence.
Curtains along one wall conceal a quieter chamber. To the north lies Kelago's domain, and a service passage opens east toward the kitchen.
`.trim(),
    exits: {
      south: 'foyer',
      east: 'kitchen',
      west: 'secretCircle',
      north: 'kelagoRoom',
    },
    verbs: {
      shake({ command }) {
        const target = command.directObject;
        if (!target) {
          return 'Shake what?';
        }

        if (target.includes('hand') || target.includes('oshregaal') || target.includes('grandfather')) {
          return 'You approach just near enough to make the gesture imaginable. Oshregaal smiles without rising. "Later," he says, as though postponing either intimacy or dismemberment.';
        }

        return `The ${target} does not appear eager for a handshake.`;
      },
    },
    items: [wine, bloodCup, roast],
    objects: {
      oshregaal: {
        name: 'Grandfather Oshregaal',
        aliases: ['grandfather', 'host', 'oshregaal'],
        description: 'Grandfather Oshregaal looks like a collapsed king upholstered in silk and appetite. His eyes, however, are quick, bright, and unforgettably awake.',
        actions: {
          ask({ topic }) {
            if (topic.includes('dinner') || topic.includes('feast')) {
              return 'Oshregaal beams. "At last, a sensible subject. Eat well, praise sincerely, and try not to die of nerves before the better courses arrive."';
            }

            if (topic.includes('escape') || topic.includes('leave') || topic.includes('outside')) {
              return 'Oshregaal laughs until he has to dab at one eye. "My dear guest, departure is a vulgar obsession in the middle of a meal."';
            }

            return 'Oshregaal answers with theatrical warmth and exactly as much truth as flatters him.';
          },
          tell({ topic }) {
            if (topic.includes('name')) {
              return '"A pleasure," Oshregaal says, in the tone of a man reserving judgment until dessert.';
            }

            return 'Oshregaal receives your words as though deciding whether they are worth keeping.';
          },
          give({ item }) {
            if (item.id === 'invitation') {
              return 'Oshregaal glances at the invitation and waves it away. "If you are here, little paper has already done its work."';
            }

            return `Oshregaal considers the ${item.name}, amused, but makes no move to accept it.`;
          },
        },
      },
      imp: {
        name: 'imp',
        aliases: ['pazuzu', 'servant'],
        description: 'The imp is small, furious, and visibly bound to service by old magical spite. He looks like the sort of creature who would offer help only if it could become revenge later.',
        actions: {
          ask({ topic }) {
            if (topic.includes('escape') || topic.includes('leave')) {
              return 'The imp bares his teeth in something too sharp to be a smile. "Everything leaves eventually. Some routes are merely less educational than others."';
            }

            if (topic.includes('oshregaal') || topic.includes('grandfather')) {
              return '"He dines, he gloats, he expands," the imp mutters. "A fungus with table manners."';
            }

            return 'The imp answers in fragments sharp enough to draw blood if handled carelessly.';
          },
          tell({ topic }) {
            if (topic.includes('help') || topic.includes('escape')) {
              return 'The imp’s eyes narrow. "You should want better things than help. Better things are less expensive."';
            }

            return 'The imp flicks his tail and pretends not to care, which is not the same as not caring.';
          },
        },
      },
      guests: 'Most of the tusk guests look dazed, overfed, or partially trapped inside commands they are still obeying hours too late.',
      curtains: 'Heavy red curtains hide a side chamber from casual view. They do a poor job of hiding the fact that the room behind them matters.',
      tuskpeople: 'Tusks, mutations, jewelry, scars, and ceremonial exhaustion. Whatever else Oshregaal made, he made followers who survived it.',
    },
  });
}

export default createFeastHall;