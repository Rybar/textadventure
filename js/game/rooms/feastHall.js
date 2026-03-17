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
    exitGuards: {
      west({ getFlag }) {
        if (getFlag('secretCircleUnlocked')) {
          return null;
        }

        return 'The curtains part only so far before resistance answers from behind them. Something beyond expects a more intimate form of permission.';
      },
    },
    verbs: {
      shake({ command, getFlag, setFlag, unlockExit }) {
        const target = command.directObject;
        if (!target) {
          return 'Shake what?';
        }

        if (target.includes('oshregaal') || target.includes('grandfather')) {
          return 'You approach just near enough to make the gesture imaginable. Oshregaal smiles without rising. "Later," he says, as though postponing either intimacy or dismemberment.';
        }

        if (target.includes('hand')) {
          if (getFlag('secretCircleUnlocked')) {
            return 'The hidden brass hand is already warm from use. Behind the curtains, the secret latch sits patiently unashamed of its melodrama.';
          }

          if (!getFlag('impHandshakeHintKnown') && !getFlag('kelagoHandshakeHintKnown')) {
            return 'You find no obvious handhold to shake until your fingers brush something metallic in the curtain folds. It feels absurdly specific, but without a better reason to trust it, you let go.';
          }

          setFlag('secretCircleUnlocked', true);
          setFlag('foundTeleportCircle', true);
          unlockExit('feastHall', 'west', 'secretCircle');
          return 'Your hand closes around a hidden brass hand sewn into the curtain folds. You shake it once. Somewhere inside the wall, a lock answers with genteel satisfaction, and the curtained passage to the west yields at last.';
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
          ask({ topic, getFlag, setFlag }) {
            setFlag('metOshregaal', true);

            if (topic.includes('dinner') || topic.includes('feast')) {
              return 'Oshregaal beams. "At last, a sensible subject. Eat well, praise sincerely, and try not to die of nerves before the better courses arrive."';
            }

            if (topic.includes('escape') || topic.includes('leave') || topic.includes('outside')) {
              return 'Oshregaal laughs until he has to dab at one eye. "My dear guest, departure is a vulgar obsession in the middle of a meal."';
            }

            if (topic.includes('kelago') || topic.includes('sister')) {
              if (getFlag('gaveBlood')) {
                return '"My sister improves everything she touches," Oshregaal says fondly. "Compliment her work and she may even explain which doors in this house still possess manners."';
              }

              return '"Kelago is an artist," Oshregaal says. "Try not to look at her with the face of a peasant confronting genius."';
            }

            if (topic.includes('curtain') || topic.includes('west')) {
              return 'Oshregaal smiles too broadly. "Private family business, little guest. If the house wants you there, it will extend a hand."';
            }

            return 'Oshregaal answers with theatrical warmth and exactly as much truth as flatters him.';
          },
          tell({ topic, setFlag }) {
            setFlag('metOshregaal', true);

            if (topic.includes('name')) {
              return '"A pleasure," Oshregaal says, in the tone of a man reserving judgment until dessert.';
            }

            if (topic.includes('praise') || topic.includes('dinner') || topic.includes('magnificent')) {
              return 'Oshregaal preens openly. "At last, literacy of the palate," he says. His attention warms just enough to become more dangerous.';
            }

            return 'Oshregaal receives your words as though deciding whether they are worth keeping.';
          },
          give({ item, setFlag }) {
            setFlag('metOshregaal', true);

            if (item.id === 'invitation') {
              return 'Oshregaal glances at the invitation and waves it away. "If you are here, little paper has already done its work."';
            }

            if (item.id === 'wine') {
              return 'Oshregaal laughs. "Keep it," he says. "If my own table must furnish tributes to me, the evening has become too symmetrical to bear."';
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
          ask({ topic, getFlag, setFlag }) {
            if (topic.includes('escape') || topic.includes('leave')) {
              if (getFlag('impHelpOffered')) {
                setFlag('impHandshakeHintKnown', true);
                return 'The imp bares his teeth in satisfaction. "Behind the red curtains there is a hidden brass hand. Shake it like you mean an introduction. The house respects etiquette almost as much as it enjoys traps."';
              }

              return 'The imp bares his teeth in something too sharp to be a smile. "Everything leaves eventually. Some routes are merely less educational than others. If you want specifics, risk sounding serious."';
            }

            if (topic.includes('oshregaal') || topic.includes('grandfather')) {
              return '"He dines, he gloats, he expands," the imp mutters. "A fungus with table manners."';
            }

            if (topic.includes('curtain') || topic.includes('west')) {
              if (getFlag('impHelpOffered')) {
                setFlag('impHandshakeHintKnown', true);
                return 'The imp looks delighted by your interest. "Yes, yes, the curtains. There is a hidden brass hand in there. Shake it. The old idiot loves doors that can be flirted with."';
              }

              return '"The curtains matter," the imp says. "That is all the charity you get for free."';
            }

            return 'The imp answers in fragments sharp enough to draw blood if handled carelessly.';
          },
          tell({ topic, setFlag }) {
            if (topic.includes('help') || topic.includes('escape')) {
              setFlag('impHelpOffered', true);
              setFlag('impSuspicious', true);
              return 'The imp’s eyes narrow with sudden interest. "There. Honesty at last. Keep asking like that and I may tell you which piece of this room still remembers how to open."';
            }

            return 'The imp flicks his tail and pretends not to care, which is not the same as not caring.';
          },
          give({ item, setFlag }) {
            if (item.id === 'wine') {
              setFlag('impHelpOffered', true);
              return 'The imp snatches the wine with indecent speed, drains it, and shudders happily. "Better," he says. "Now ask me about the curtains if you enjoy surviving."';
            }

            return `The imp eyes the ${item.name} suspiciously and declines to owe you anything for it.`;
          },
        },
      },
      guests: 'Most of the tusk guests look dazed, overfed, or partially trapped inside commands they are still obeying hours too late.',
      curtains: {
        description({ getFlag }) {
          if (getFlag('secretCircleUnlocked')) {
            return 'The red curtains now stand slightly parted. Inside their folds, a hidden brass hand protrudes from the wall beside a newly yielded passage west.';
          }

          return 'Heavy red curtains hide a side chamber from casual view. Their folds are unusually thick, as though hiding more hardware than cloth ought to require.';
        },
      },
      tuskpeople: 'Tusks, mutations, jewelry, scars, and ceremonial exhaustion. Whatever else Oshregaal made, he made followers who survived it.',
    },
  });
}

export default createFeastHall;