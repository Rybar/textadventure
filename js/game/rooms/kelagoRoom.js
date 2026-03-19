import { createTopicResponder } from '../../engine/authoring/conversation.js';
import { Item } from '../../engine/models/item.js';
import { Room } from '../../engine/models/room.js';

export function createKelagoRoom() {
  const livingBed = new Item({
    id: 'living-bed',
    name: 'bed',
    aliases: ['crab bed', 'living bed'],
    description: 'A grotesquely opulent bed shaped like a giant crab, complete with clustered black eyes in the headboard and a pink, almost cheerful sleeping surface.',
    actions: {
      sit() {
        return 'The bed flexes almost imperceptibly beneath your weight. It feels less like furniture than a professional compromise.';
      },
      look() {
        return 'The bed has been made beautiful with sincere effort and absolutely no mercy.';
      },
    },
    portable: false,
  });

  const wizardInk = new Item({
    id: 'wizard-ink',
    name: 'wizard ink',
    aliases: ['ink'],
    description: 'A stoppered vial of dark ink dense enough that the light seems to bend slightly around it.',
  });

  const eyeSpellbook = new Item({
    id: 'eye-spellbook',
    name: 'spellbook',
    aliases: ['book', 'eye book'],
    description: 'A spellbook with a single wet eye set in the cover. It seems capable of closing itself when stared at too hard.',
    actions: {
      take({ getFlag, setFlag }) {
        if (!getFlag('spellbooksSecured')) {
          setFlag('spellbooksSecured', true);
        }

        return 'The eye in the cover rolls once in offended recognition as you take the spellbook. Whatever Kelago intended to keep near at hand now counts as stolen text.';
      },
      read() {
        return 'The book crawls unpleasantly against your hands. Its pages concern flesh, growth, and transformation in a tone of domestic practicality, with side notes about preserving beauty through controlled alteration and never trusting threshold work to people who think bodies are simpler than doors.';
      },
    },
  });

  const markKelagoMet = ({ setFlag }) => {
    setFlag('kelagoMet', true);
  };

  const kelagoAsk = createTopicResponder({
    before: markKelagoMet,
    rules: [
      {
        match: ['work', 'furniture', 'art'],
        reply: 'Kelago brightens. "At last, a guest with eyesight. Function is common. Comfort is common. Beauty joined to useful terror, however, remains an art."',
      },
      {
        match: ['brother', 'oshregaal', 'grandfather'],
        reply: 'Kelago smiles with old-sister fondness sharpened on realism. "My brother is a glutton, a genius, a sentimentalist, and an exhausting host. He improves with distance and worsens with applause."',
      },
      {
        match: ['plum', 'scribe'],
        reply: 'Kelago sighs with real irritation. "My brother keeps a clever Numerian scribe in his private rooms because admiration pleases him more when catalogued. Poor Plum writes notes to herself faster than he can become offended by them."',
      },
      {
        match: ['bed', 'crab'],
        reply: 'Kelago rests her fingertips on the living bed with proprietary affection. "It used to pinch," she says. "Now it only judges. Improvement is often a matter of editing temperament."',
      },
      {
        match: ['spellbook', 'book', 'notes', 'ink'],
        reply: 'Kelago glances at the eye-bound spellbook with real fondness. "Domestic biomancy," she says. "A little threshold etiquette, a little flesh correction, and several solutions to the problem of furniture that insists on remembering it was once alive. My brother hoards gates. I improve inhabitants."',
      },
      {
        match: ['mutation', 'flesh', 'biomancy', 'transformation'],
        reply: 'Kelago smiles as if the question has better posture than most guests. "Mutation is such a vulgar word," she says. "Most bodies are merely under-edited. The trick is to improve them without flattening their personality. My brother is better at appetite than restraint."',
      },
      {
        match: ['knife', 'knives', 'workspace'],
        reply: '"Each blade has a social purpose," Kelago says. "A host should never confuse incision, refinement, and insult."',
      },
      {
        match: ['escape', 'circle', 'curtain', 'west'],
        reply: ({ getFlag }) => getFlag('kelagoPraised')
          ? 'Kelago smiles with unnerving sincerity. "My brother keeps a hidden latch behind the feast-hall curtains. A brass hand. Shake it politely and the wall will remember its breeding."'
          : 'Kelago glances toward the feast hall. "You ask practical questions with a stranger’s face. Admire something first. It improves the tone."',
        effect: ({ getFlag, setFlag }) => {
          if (getFlag('kelagoPraised')) {
            setFlag('kelagoHandshakeHintKnown', true);
          }
        },
      },
      {
        match: ['guest', 'guests'],
        reply: '"Guests are materials under temporary legal protection," Kelago says. "The duration of the protection varies with manners, novelty, and family mood."',
      },
      {
        match: ['room', 'door', 'private chamber'],
        reply: 'Kelago gestures east with one elegant hand. "My brother keeps his private chamber through that door," she says. "If you go bothering his north door, remember that he adores manners even in his hardware."',
      },
      {
        match: ['library', 'portal', 'threshold', 'gate'],
        reply: 'Kelago waves the topic away with graceful irritation. "The library is where my brother keeps the sort of knowledge that likes hearing itself obeyed," she says. "Thresholds, folded corridors, and all the tedious romance of doors pretending to be philosophy. Useful, if you enjoy escape more than beauty."',
      },
    ],
    fallback: 'Kelago answers with cordial precision, as though deciding how much of you might eventually become decorative.',
  });

  const kelagoTell = createTopicResponder({
    before: markKelagoMet,
    rules: [
      {
        match: ['beautiful', 'art', 'artist', 'work'],
        effect: ({ setFlag }) => {
          setFlag('kelagoPraised', true);
        },
        reply: 'Kelago inclines her head, visibly pleased. "Kind and accurate," she says. "That combination is rarer than courage."',
      },
      {
        match: ['oshregaal is terrible', 'your brother is terrible', 'your brother is awful'],
        reply: 'Kelago considers this and then nods once. "Often," she says. "But terrible things are seldom improved by being described too vaguely."',
      },
      {
        match: ['i want to leave', 'i want escape', 'i am leaving'],
        reply: 'Kelago studies you with clinical interest. "Everyone says that here eventually," she says. "The interesting guests are the ones who notice what sort of leaving the house might accidentally permit."',
      },
    ],
    fallback: 'Kelago receives the remark with the calm interest of a woman capable of improving almost anything by force.',
  });

  return new Room({
    id: 'kelagoRoom',
    title: 'Kelago\'s Room',
    description: `
Kelago's workroom-bedroom is crowded with knives, crumbs, cups, clothing, and projects best left undescribed until one has to describe them.
At the center stands a cleared workspace watched over by a living crab-bed and the calm logic of a woman who has made biomantic furniture into an art.
The feast hall waits to the south.
An ornate private door stands to the east.
`.trim(),
    exits: {
      south: 'feastHall',
      east: 'grandfatherRoom',
    },
    verbs: {
      search({ command, getFlag, setFlag }) {
        const target = command.directObject;

        if (!target || target.includes('room') || target.includes('workspace') || target.includes('table')) {
          if (!getFlag('kelagoPraised')) {
            return 'The workspace holds knives sorted by impossible specializations, wizard ink, and an eye-bound spellbook left close enough to imply frequent use. Kelago notices your interest with the pleased caution of an artist catching someone almost worthy of a studio tour.';
          }

          return 'With Kelago no longer treating curiosity as an insult, the workspace reads more clearly: biomantic tools, disciplined notes, and a spellbook concerned with edited flesh and controlled threshold etiquette.';
        }

        if (target.includes('spellbook') || target.includes('book') || target.includes('ink')) {
          return 'The eye-bound spellbook and wizard ink sit where Kelago can reach them without rising. Between them they suggest a practice that treats living bodies as draftable texts.';
        }

        if (target.includes('bed') || target.includes('crab')) {
          return 'The crab-bed is expensive, sentient, and only barely willing to admit it was once a design problem. Its black eyes track the room with offended patience.';
        }

        return `You search the ${target} and find evidence that Kelago's idea of domestic life depends heavily on blades and revisions.`;
      },
    },
    items: [livingBed, wizardInk, eyeSpellbook],
    objects: {
      kelago: {
        name: 'Lady Kelago',
        aliases: ['lady kelago', 'kelago'],
        description: 'Lady Kelago is composed, elegant, and only incidentally horrifying. She speaks of reshaping flesh the way another artist might discuss upholstery and line.',
        actions: {
          ask: kelagoAsk,
          tell: kelagoTell,
          give({ item, setFlag }) {
            setFlag('kelagoMet', true);

            if (item.id === 'wizard-ink') {
              setFlag('kelagoPraised', true);
              return 'Kelago accepts the wizard ink with immediate approval. "You do notice useful things," she says. "Ask me a better question and I may reward you with an answer."';
            }

            return `Kelago considers the ${item.name} and decides it does not improve the room.`;
          },
        },
      },
      knives: 'There are knives everywhere: long, hooked, delicate, ribbed, and unmistakably specialized.',
      tortoises: 'Three headless tortoises shuffle through the clutter with patient, chest-like dignity.',
      workspace: 'The central workspace is suspiciously clean, suggesting that whatever was last done here concluded successfully and may already be learning new habits.',
      door: 'An ornate side door leads east into Oshregaal\'s private rooms. Even from here it looks overconfident.',
    },
  });
}

export default createKelagoRoom;