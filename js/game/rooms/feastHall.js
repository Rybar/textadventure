import { createTopicResponder } from '../../engine/authoring/conversation.js';
import { Item } from '../../engine/models/item.js';
import { Room } from '../../engine/models/room.js';

export function createFeastHall() {
  const noteBloodRequest = ({ setFlag }) => {
    setFlag('feastBloodRequested', true);
  };

  const raiseOshregaalSuspicion = ({ setFlag }) => {
    setFlag('oshregaalSuspicious', true);
  };

  const wine = new Item({
    id: 'wine',
    name: 'wine',
    aliases: ['goblet', 'wine goblet'],
    description: 'A heavy goblet of dark wine that reflects the chandelier in a thin red tremor.',
    actions: {
      drink(context) {
        context.worldState.setFlag('feastBloodRequested', true);

        if (context.worldState.getFlag('bloodRefused')) {
          return 'The wine runs hot and medicinal down your throat. Around the table, the silver cup keeps moving as though your refusal were merely another course delayed, and Oshregaal notices that you are still willing to swallow something he poured.';
        }

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
        context.worldState.setFlag('feastBloodRequested', true);

        if (context.worldState.getFlag('gaveBlood')) {
          return 'You have already contributed. Oshregaal would call that generosity. A physician might choose another term.';
        }

        context.worldState.setFlag('gaveBlood', true);
        return context.worldState.getFlag('bloodRefused')
          ? 'You add a single bright drop to the cup after all. No one comments on the reversal. Around the table, practiced relief looks much too similar to obedience.'
          : 'You add a single bright drop to the cup. Around the table, no one reacts as though this were unusual, which is worse than surprise.';
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

  const markOshregaalMet = ({ setFlag }) => {
    setFlag('metOshregaal', true);
    setFlag('hostContactEstablished', true);
  };

  const oshregaalAsk = createTopicResponder({
    before: markOshregaalMet,
    rules: [
      {
        match: ['dinner', 'feast'],
        reply: 'Oshregaal beams. "At last, a sensible subject. Eat well, praise sincerely, and try not to die of nerves before the better courses arrive."',
      },
      {
        match: ['house', 'mansion', 'home'],
        reply: 'Oshregaal spreads his fingers proudly. "A house should flatter its owner, intimidate its rivals, and confuse its guests just enough to make them memorable."',
      },
      {
        match: ['grey grin', 'blade', 'sword'],
        reply: ({ getFlag }) => getFlag('greyGrinShownToOshregaal')
          ? 'Oshregaal smiles with alarming fondness. "Yes," he says. "You have moved from curiosity into theft. Much more flattering. Now all that remains is to discover whether you mean it."'
          : 'Oshregaal lifts one heavy brow. "The Grey Grin? A charming old argument in metal," he says. "I keep it because conquest deserves indexing. Why do you ask?"',
      },
      {
        match: ['invitation', 'paper'],
        reply: '"Invitations are how a house teaches strangers the first useful lie," Oshregaal says. "Once someone arrives, parchment has done its little job."',
      },
      {
        match: 'wine',
        reply: 'Oshregaal eyes the goblet approvingly. "Medicinal, theatrical, and only mildly treacherous," he says. "A respectable table wine."',
      },
      {
        match: ['escape', 'leave', 'outside'],
        effect: raiseOshregaalSuspicion,
        reply: ({ getFlag }) => getFlag('bloodRefused') || getFlag('oshregaalSuspicious')
          ? 'Oshregaal laughs softly and does not bother dabbing at the corners of his eyes. "You refuse the cup and speak of departure in the same breath," he says. "How refreshing to be warned exactly when a guest intends to become work."'
          : 'Oshregaal laughs until he has to dab at one eye. "My dear guest, departure is a vulgar obsession in the middle of a meal."',
      },
      {
        match: ['kelago', 'sister'],
        reply: ({ getFlag }) => getFlag('gaveBlood')
          ? '"My sister improves everything she touches," Oshregaal says fondly. "Compliment her work and she may even explain which doors in this house still possess manners."'
          : '"Kelago is an artist," Oshregaal says. "Try not to look at her with the face of a peasant confronting genius."',
      },
      {
        match: ['plum', 'scribe'],
        reply: 'Oshregaal smiles like a man complimented on a tool he intends to keep. "My little Numerian scribe is invaluable," he says. "She remembers things for me, especially when I prefer that she remember them differently later."',
      },
      {
        match: ['curtain', 'west'],
        reply: 'Oshregaal smiles too broadly. "Private family business, little guest. If the house wants you there, it will extend a hand."',
      },
      {
        match: ['blood', 'cup'],
        effect: noteBloodRequest,
        reply: ({ getFlag }) => {
          if (getFlag('gaveBlood')) {
            return '"And a generous guest besides," Oshregaal says. "A meal improves when everyone contributes something of themselves."';
          }

          if (getFlag('bloodRefused')) {
            return 'Oshregaal studies you with bright dislike wrapped in velvet. "A guest may refuse a course," he says, "but then the table must decide what sort of hunger has taken their place."';
          }

          return 'Oshregaal lifts his brows. "A drop is only manners," he says. "If one cannot share blood at table, civilization has truly withered."';
        },
      },
      {
        match: ['guest', 'tusk'],
        reply: '"Companions, creditors, dependents, admirers," Oshregaal says, waving a jeweled hand down the table. "Labels are a poor substitute for seating arrangements."',
      },
      {
        match: ['story', 'stories', 'entertainment'],
        reply: 'Oshregaal leans forward in his chair, delighted. "A guest who can tell a story may leave with all sorts of organs I had not planned to spare," he says. "This is what passes for generosity in cultivated houses."',
      },
    ],
    fallback: 'Oshregaal answers with theatrical warmth and exactly as much truth as flatters him.',
  });

  const oshregaalTell = createTopicResponder({
    before: markOshregaalMet,
    rules: [
      {
        match: 'name',
        reply: '"A pleasure," Oshregaal says, in the tone of a man reserving judgment until dessert.',
      },
      {
        match: ['praise', 'dinner', 'magnificent'],
        reply: 'Oshregaal preens openly. "At last, literacy of the palate," he says. His attention warms just enough to become more dangerous.',
      },
      {
        match: ['your house is beautiful', 'beautiful house', 'magnificent house'],
        reply: 'Oshregaal places one hand over his heart and looks briefly sincere. "At last," he says, "someone with architectural gratitude."',
      },
      {
        match: ['you are awful', 'you are monstrous', 'i hate you', 'you are a monster'],
        effect: ({ setFlag }) => {
          setFlag('insultedOshregaal', true);
          setFlag('oshregaalSuspicious', true);
        },
        reply: 'Oshregaal lets the insult settle over the table like a napkin dropped into blood. Then he smiles. "Good," he says. "Guests who stop pretending are almost always more interesting for at least one course."',
      },
      {
        match: ['leave', 'escape'],
        effect: raiseOshregaalSuspicion,
        reply: 'Oshregaal rests one jeweled finger against his goblet and smiles at you like a patient executioner. "You persist in treating chronology as a personal right," he says.',
      },
      {
        match: ['i refuse blood', 'no blood', 'i refuse the cup', 'i will not give blood', 'keep the cup'],
        effect: ({ setFlag }) => {
          setFlag('feastBloodRequested', true);
          setFlag('bloodRefused', true);
          setFlag('oshregaalSuspicious', true);
        },
        reply: 'Oshregaal goes still enough to become the room for a heartbeat. Then he smiles with exquisite bad manners. "How educational," he says. "A guest who declines the table before the table declines them. Keep the blood, then. I will simply have to discover what you think purchaseable instead."',
      },
      {
        match: ['i will stay', 'i will remain', 'i accept your hospitality', 'i will be a good guest'],
        effect: ({ setFlag }) => {
          setFlag('agreedToStay', true);
          setFlag('absorbedIntoRoutine', true);
        },
        reply: 'Oshregaal softens with genuine pleasure, which is the worst thing he has yet done to you. One course becomes another, then another. You laugh where the room laughs, drink when the cups return, and begin to understand how repetition can be made to feel like belonging from the inside. By the time you notice the pattern closing, you are already one more moving piece inside it. This is a failure ending: absorption into Oshregaal\'s routines.',
      },
    ],
    fallback: 'Oshregaal receives your words as though deciding whether they are worth keeping.',
  });

  const impAsk = createTopicResponder({
    rules: [
      {
        match: ['escape', 'leave'],
        reply: ({ getFlag }) => {
          if (getFlag('impHelpOffered')) {
            return 'The imp bares his teeth in satisfaction. "Behind the red curtains there is a hidden brass hand. Shake it like you mean an introduction. The house respects etiquette almost as much as it enjoys traps."';
          }

          if (getFlag('bloodRefused') || getFlag('oshregaalSuspicious')) {
            return 'The imp bares his teeth in something much closer to joy. "Good," he mutters. "He heard that. Keep going and the curtains may start looking like architecture instead of upholstery. If you want specifics, risk sounding serious."';
          }

          return 'The imp bares his teeth in something too sharp to be a smile. "Everything leaves eventually. Some routes are merely less educational than others. If you want specifics, risk sounding serious."';
        },
        effect: ({ getFlag, setFlag }) => {
          if (getFlag('impHelpOffered')) {
            setFlag('impHandshakeHintKnown', true);
          }
        },
      },
      {
        match: ['oshregaal', 'grandfather'],
        reply: '"He dines, he gloats, he expands," the imp mutters. "A fungus with table manners."',
      },
      {
        match: ['chain', 'binding'],
        reply: 'The imp rattles the chain with professional bitterness. "Decorative slavery," he says. "He likes his humiliations polished."',
      },
      {
        match: ['wrongus', 'cook', 'kitchen'],
        reply: '"Wrongus would marry the stew if ceremony allowed it," the imp says. "Useful creature. Disturbingly sincere about reductions."',
      },
      {
        match: ['curtain', 'west'],
        reply: ({ getFlag }) => getFlag('impHelpOffered')
          ? 'The imp looks delighted by your interest. "Yes, yes, the curtains. There is a hidden brass hand in there. Shake it. The old idiot loves doors that can be flirted with."'
          : '"The curtains matter," the imp says. "That is all the charity you get for free."',
        effect: ({ getFlag, setFlag }) => {
          if (getFlag('impHelpOffered')) {
            setFlag('impHandshakeHintKnown', true);
          }
        },
      },
      {
        match: ['guest', 'tusk'],
        reply: 'The imp glances down the table and lowers his voice. "Some are loyal, some are trapped, some forgot the difference years ago. Dinner is very educational that way."',
      },
      {
        match: ['blood', 'cup'],
        reply: ({ getFlag }) => getFlag('gaveBlood')
          ? 'The imp winces theatrically. "Congratulations. You have participated in custom. Try not to volunteer for any more traditions tonight."'
          : '"The silver cup comes around sooner or later," the imp mutters. "Everything in this room wants a sample."',
      },
      {
        match: 'kelago',
        reply: '"Artistic," the imp says darkly. "Which in this family means the screaming is usually very well curated."',
      },
      {
        match: ['plum', 'scribe'],
        reply: 'The imp gives you a fast sideways look. "North of the old fraud\'s chamber," he mutters. "Still herself in fragments, last I checked. Metal girl, bright lines under the skin if the light catches right. If you reach her, listen faster than the house lies."',
      },
    ],
    fallback: 'The imp answers in fragments sharp enough to draw blood if handled carelessly.',
  });

  const impTell = createTopicResponder({
    rules: [
      {
        match: ['help', 'escape'],
        effect: ({ setFlag }) => {
          setFlag('impHelpOffered', true);
          setFlag('impSuspicious', true);
        },
        reply: 'The imp’s eyes narrow with sudden interest. "There. Honesty at last. Keep asking like that and I may tell you which piece of this room still remembers how to open."',
      },
      {
        match: ['oshregaal is awful', 'grandfather is awful', 'he is awful'],
        effect: ({ setFlag }) => {
          setFlag('impHelpOffered', true);
        },
        reply: 'The imp grins so hard it almost counts as pain. "You are learning," he says. "Careful. That sort of clarity attracts chores."',
      },
    ],
    fallback: 'The imp flicks his tail and pretends not to care, which is not the same as not caring.',
  });

  const guestsAsk = createTopicResponder({
    rules: [
      {
        match: ['dinner', 'feast', 'meal'],
        reply: 'One tusked guest blinks at you with watery concentration. "Still in progress," he says, as if the sentence has answered every meal for years.',
      },
      {
        match: ['oshregaal', 'grandfather'],
        reply: 'A jeweled tusk-woman smiles without showing relief. "He is generous," she says automatically, then much quieter: "and extremely difficult to finish with."',
      },
      {
        match: ['leave', 'leav', 'outside', 'escape'],
        reply: 'Several guests go very still. At last one mutters into his goblet, "If you discover the polite method, do share it before dessert."',
      },
    ],
    fallback: 'The guests exchange looks of practiced caution. One gives you a tiny shrug that might be sympathy or hunger.',
  });

  const guestsTell = createTopicResponder({
    rules: [
      {
        match: ['i want to leave', 'leave', 'escape'],
        reply: 'A guest with silver rings refuses to look at you directly. "Then do not let him seat you twice," she says, as if quoting a rule she learned too late.',
      },
      {
        match: ['oshregaal is awful', 'grandfather is awful'],
        reply: 'A few guests pretend not to hear. One chokes on a laugh and converts it into a cough with veteran speed.',
      },
    ],
    fallback: 'The guests receive your words like contraband passed under the table: briefly, nervously, and without wanting witnesses.',
  });

  const tuskpeopleAsk = createTopicResponder({
    rules: [
      {
        match: ['mutation', 'tusks'],
        reply: 'A nearby guest touches one ivory tusk with visible old habit. "Inheritance, industry, accident," she says. "In this house the categories mingle."',
      },
    ],
    fallback: 'The tusk folk regard you with the deep caution of people who know observation can become obligation.',
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
    triggers: {
      enter: [
        {
          id: 'feastHall:first-arrival',
          run: ({ emitEvent }) => {
            return emitEvent('startFeastService');
          },
        },
      ],
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
      search({ command, getFlag, setFlag }) {
        const target = command.directObject;

        if (!target || target.includes('hall') || target.includes('room') || target.includes('table')) {
          if (!getFlag('feastGuestPatternKnown')) {
            setFlag('feastGuestPatternKnown', true);
            return 'Watching the table closely, you realize the guests are not merely drunk or dull. They keep falling back into repeated gestures, toasts, and silences, as though the dinner has grooves worn into it deeper than appetite alone. The silver cup making its rounds is part of the pattern, not an interruption to it.';
          }

          return 'The feast still runs on repetition: servants circling, guests repeating themselves, Oshregaal at the center like a conductor pretending not to conduct.';
        }

        if (target.includes('guest') || target.includes('tusk')) {
          if (!getFlag('feastGuestPatternKnown')) {
            setFlag('feastGuestPatternKnown', true);
          }

          return 'Seen up close, the tusk guests are less convivial than captive to momentum. Some are overfed, some afraid, and several seem to answer the same joke with the same weary laugh each time Oshregaal makes it.';
        }

        if (target.includes('curtain') || target.includes('west')) {
          if ((getFlag('impHandshakeHintKnown') || getFlag('kelagoHandshakeHintKnown')) && !getFlag('secretCircleUnlocked')) {
            return 'Now that you know what to feel for, the curtain no longer seems coy. Beneath the velvet folds, a brass hand bulges from the wall like a household joke too pleased with itself.';
          }

          return getFlag('secretCircleUnlocked')
            ? 'The curtains now conceal very little. The hidden brass hand and yielded passage beyond them feel like a household impropriety you have already committed.'
            : 'Your hands find thicker folds, hidden weight, and one suspiciously shaped seam, but without a clearer clue the curtain keeps its manners.';
        }

        return `You search the ${target} and gain only grease, perfume, and more reasons not to trust the hospitality.`;
      },
      shake({ command, getFlag, emitEvent }) {
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

          return emitEvent('unlockSecretCirclePassage');
        }

        return `The ${target} does not appear eager for a handshake.`;
      },
    },
    items: [wine, bloodCup, roast],
    conditionalDescriptions: [
      {
        when: ({ getFlag }) => getFlag('gaveBlood'),
        text: 'The silver cup now seems to orbit the table with unpleasant familiarity. Having contributed once, you notice how practiced the ritual is.',
      },
      {
        when: ({ getFlag }) => getFlag('bloodRefused'),
        text: 'The silver cup keeps circling without you now, and several guests have perfected the art of not watching Oshregaal remember the refusal.',
      },
      {
        when: ({ getFlag }) => getFlag('feastGuestPatternKnown'),
        text: 'The rhythm of the room has become impossible to ignore: repeated laughter, repeated gestures, repeated compliance wearing the mask of custom.',
      },
      {
        when: ({ getFlag }) => getFlag('hostContactEstablished'),
        text: 'Oshregaal has turned enough of his attention toward you that the rest of the table feels arranged around his curiosity.',
      },
      {
        when: ({ getFlag }) => getFlag('secretCircleUnlocked'),
        text: 'Behind the red curtains, a newly accessible western passage waits like an indiscreet sentence finally allowed to finish.',
      },
      {
        when: ({ getFlag }) => getFlag('oshregaalSuspicious') && !getFlag('greyGrinShownToOshregaal') && !getFlag('oshregaalWounded'),
        text: 'The host is still smiling, but no longer diffusely. Whatever else this dinner is, you are no longer being treated as background to it.',
      },
      {
        when: ({ getFlag }) => getFlag('greyGrinShownToOshregaal'),
        text: 'The table no longer feels merely ceremonial. After Oshregaal has seen the stolen blade, the room carries the brittle poise of a host deciding whether insult should become entertainment or punishment.',
      },
      {
        when: ({ getFlag }) => getFlag('oshregaalWounded'),
        text: 'Blood and panic now interrupt the feast\'s choreography. Oshregaal is still alive, which is bad, but the room has finally forgotten how to behave.',
      },
    ],
    objects: {
      oshregaal: {
        name: 'Grandfather Oshregaal',
        aliases: ['grandfather', 'host', 'oshregaal'],
        description: 'Grandfather Oshregaal looks like a collapsed king upholstered in silk and appetite. His eyes, however, are quick, bright, and unforgettably awake.',
        actions: {
          ask: oshregaalAsk,
          tell: oshregaalTell,
          show({ item, setFlag }) {
            setFlag('metOshregaal', true);

            if (item.id === 'grey-grin-blade') {
              setFlag('greyGrinShownToOshregaal', true);
              return 'Oshregaal sees the Grey Grin Blade and goes still in the way only very dangerous hosts can. Then he laughs, delighted and offended in equal measure. "Marvelous," he says. "A guest with initiative. Keep holding it if you like. Now every person in this room has to reconsider the seating chart."';
            }

            return `Oshregaal glances at the ${item.name} with lazy amusement and finds nothing in it worth interrupting the meal for.`;
          },
          give({ item, setFlag }) {
            setFlag('metOshregaal', true);

            if (item.id === 'invitation') {
              return 'Oshregaal glances at the invitation and waves it away. "If you are here, little paper has already done its work."';
            }

            if (item.id === 'grey-grin-blade') {
              setFlag('greyGrinShownToOshregaal', true);
              return 'Oshregaal does not take the blade. He simply looks at you over steepled fingers and smiles. "No," he says. "If you stole it, the pleasure lies in what you think holding it entitles you to."';
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
          ask: impAsk,
          tell: impTell,
          give({ item, setFlag }) {
            if (item.id === 'wine') {
              setFlag('impHelpOffered', true);
              return 'The imp snatches the wine with indecent speed, drains it, and shudders happily. "Better," he says. "Now ask me about the curtains if you enjoy surviving."';
            }

            return `The imp eyes the ${item.name} suspiciously and declines to owe you anything for it.`;
          },
        },
      },
      guests: {
        name: 'tusk guests',
        aliases: ['guests', 'tusk guests', 'tuskpeople', 'tusk people'],
        description: 'Most of the tusk guests look dazed, overfed, or partially trapped inside commands they are still obeying hours too late.',
        actions: {
          ask: guestsAsk,
          tell: guestsTell,
        },
      },
      chain: 'The imp\'s chain is old magic disguised as household hardware. It gives him enough slack to serve and not enough to forget who profits from it.',
      butter: 'The butter dish on the imp\'s hands gleams absurdly under the chandelier, a domestic humiliation polished into ritual.',
      curtains: {
        description({ getFlag }) {
          if (getFlag('secretCircleUnlocked')) {
            return 'The red curtains now stand slightly parted. Inside their folds, a hidden brass hand protrudes from the wall beside a newly yielded passage west.';
          }

          if (getFlag('impHandshakeHintKnown') || getFlag('kelagoHandshakeHintKnown')) {
            return 'Heavy red curtains hide a side chamber from casual view. Now that you know the trick, the outline of a hidden brass hand distends one fold with almost obscene obviousness.';
          }

          return 'Heavy red curtains hide a side chamber from casual view. Their folds are unusually thick, as though hiding more hardware than cloth ought to require.';
        },
      },
      tuskpeople: {
        aliases: ['tusks', 'mutants'],
        description: 'Tusks, mutations, jewelry, scars, and ceremonial exhaustion. Whatever else Oshregaal made, he made followers who survived it.',
        actions: {
          ask: tuskpeopleAsk,
        },
      },
    },
  });
}

export default createFeastHall;
