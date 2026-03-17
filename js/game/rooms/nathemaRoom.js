import { createTopicResponder } from '../../engine/authoring/conversation.js';
import { Item } from '../../engine/models/item.js';
import { Room } from '../../engine/models/room.js';

export function createNathemaRoom() {
  const sableVeil = new Item({
    id: 'sable-veil',
    name: 'sable veil',
    aliases: ['veil'],
    description: 'A dark travel veil perfumed with expensive smoke and folded with military precision.',
    actions: {
      wear() {
        return 'You drape the sable veil over yourself. It lends mystery, menace, and a strong chance of being noticed by the wrong sort of professional.';
      },
    },
  });

  const markNathemaMet = ({ setFlag }) => {
    setFlag('nathemaMet', true);
  };

  const nathemaAsk = createTopicResponder({
    before: markNathemaMet,
    rules: [
      {
        match: 'name',
        reply: 'Nathema inclines her head a fraction. "Then introductions may be considered complete," she says.',
      },
      {
        match: ['oshregaal', 'grandfather'],
        reply: 'Nathema\'s mouth hardens elegantly. "A collector of appetites who mistakes endurance for loyalty," she says. "Still, one does business with the world one has, not the one one deserves."',
      },
      {
        match: ['fruit', 'black wind', 'elixir'],
        effect: ({ triggerEvent }) => {
          triggerEvent('startNathemaBargain');
        },
        reply: 'Nathema studies you with sudden professional interest. "So you have heard useful words," she says. "Bring me anything from the black wind line and I may decide your survival has become strategically attractive."',
      },
      {
        match: ['escape', 'leave', 'outside'],
        reply: ({ getFlag }) => getFlag('nathemaBargained')
          ? '"Escape is easiest when everyone mistakes it for a transaction," Nathema says. "Acquire leverage first. Doors respect leverage more than sincerity."'
          : 'Nathema glances toward the corridor. "Everyone in this house wants out in some sense," she says. "The relevant question is who expects to own the road afterward."',
      },
      {
        match: ['chest', 'contraband', 'luggage'],
        reply: ({ getFlag }) => getFlag('nathemaContrabandKnown')
          ? 'Nathema rests two fingers on the wrapped chest. "Private assets," she says. "If I trusted the house, they would not need wrapping."'
          : '"Travel necessities," Nathema says. The answer is perfectly elegant and entirely false.',
      },
      {
        match: ['guest', 'room'],
        reply: '"Guesthood is only a form of delayed accounting," Nathema says. "I prefer to keep my own books."',
      },
    ],
    fallback: 'Nathema answers as one negotiator testing whether another has yet earned the expensive truths.',
  });

  const nathemaTell = createTopicResponder({
    before: markNathemaMet,
    rules: [
      {
        match: ['oshregaal is awful', 'grandfather is awful'],
        reply: 'Nathema allows herself a razor-thin smile. "At last, a statement too obvious to count as intelligence," she says. "Continue."',
      },
      {
        match: ['i want to leave', 'i need to leave', 'escape'],
        effect: ({ triggerEvent }) => {
          triggerEvent('startNathemaBargain');
        },
        reply: 'Nathema folds one hand over the other. "Then stop treating departure as a confession," she says. "Make it a bargain, a theft, or an insult. Houses like this understand those better."',
      },
      {
        match: ['i can help', 'we can help'],
        effect: ({ triggerEvent }) => {
          triggerEvent('startNathemaBargain');
        },
        reply: 'Nathema appraises you like contraband with legs. "Possibly," she says. "Bring me leverage rather than enthusiasm and I may begin to agree."',
      },
    ],
    fallback: 'Nathema receives your words without giving them the dignity of visible surprise.',
  });

  return new Room({
    id: 'nathemaRoom',
    title: 'Nathema\'s Room',
    description: `
This guest chamber has been forcefully improved by its current occupant. Travel chests, lacquered cases, and folded silks occupy every useful surface, while a brazier burns bitter perfume meant to dominate the room before its owner speaks.
Lady Nathema sits amid the arrangement like a woman already pricing the house. The quieter guest room lies back to the south.
`.trim(),
    exits: {
      south: 'guestRoom',
    },
    verbs: {
      search({ command, getFlag, setFlag }) {
        const target = command.directObject;

        if (!target || target.includes('room') || target.includes('chest') || target.includes('cases')) {
          if (!getFlag('nathemaContrabandKnown')) {
            setFlag('nathemaContrabandKnown', true);
            return 'You inspect the travel chests and find one wrapped in diplomatic cloth but weighted like contraband. Nathema notices instantly and smiles without warmth. Whatever she brought here, it was not packed for mere etiquette.';
          }

          return 'The chests remain tightly packed with silk, seals, and something denser hidden beneath layered wrapping. Nathema lets you notice exactly as much as she intends.';
        }

        if (target.includes('bed') || target.includes('screen') || target.includes('silk')) {
          return 'The bed has scarcely been used. Nathema appears to rest the way a general camps: lightly, suspiciously, and with a weapon no doubt closer than the pillows.';
        }

        return `You search the ${target} and discover only expensive caution.`;
      },
    },
    items: [sableVeil],
    conditionalDescriptions: [
      {
        when: ({ getFlag }) => getFlag('nathemaContrabandKnown'),
        text: 'One wrapped chest now carries the unmistakable gravity of contraband or leverage; Nathema has noticed that you noticed.',
      },
      {
        when: ({ getFlag }) => getFlag('nathemaBargained'),
        text: 'Nathema now regards you as a potential instrument rather than an idle guest, which is not safety but may prove adjacent to usefulness.',
      },
    ],
    objects: {
      nathema: {
        name: 'Lady Nathema',
        aliases: ['lady nathema', 'nathema'],
        description: 'Lady Nathema is dressed for diplomacy, extortion, or a funeral depending on how the light catches her. She gives the impression of having arrived with plans and backup plans for everyone else\'s plans.',
        actions: {
          ask: nathemaAsk,
          tell: nathemaTell,
        },
      },
      chest: 'One travel chest is wrapped in diplomatic cloth and bound with a cord too practical for ceremony. It is the room\'s least innocent object.',
      brazier: 'The brazier burns bitter perfume and a pinch of some darker resin. The smell is meant to announce rank, caution, and selective menace.',
      silks: 'Folded silks and traveling garments hang in disciplined layers, each expensive enough to suggest that Nathema dresses for negotiations as other people dress for war.',
    },
  });
}

export default createNathemaRoom;