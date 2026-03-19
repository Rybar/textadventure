import { createTopicResponder } from '../../engine/authoring/conversation.js';
import { Item } from '../../engine/models/item.js';
import { Room } from '../../engine/models/room.js';

export function createNathemaRoom() {
  const getNathemaRoomPhase = ({ getFlag }) => {
    if (getFlag('nathemaEscapeDealSecured')) {
      return 'compact';
    }

    if (hasNathemaLeverage(getFlag)) {
      return 'leveraged';
    }

    if (getFlag('nathemaBargained')) {
      return 'bargaining';
    }

    if (getFlag('nathemaContrabandKnown')) {
      return 'exposed';
    }

    return 'assessment';
  };

  const advanceNathemaScene = ({ currentScenePhase, getRoomState, setRoomState }) => {
    const sceneState = getRoomState();
    const lastPhase = sceneState.lastNathemaRoomPhase ?? null;
    const nextPhaseTurns = lastPhase === currentScenePhase
      ? (sceneState.nathemaRoomPhaseTurns ?? 0) + 1
      : 1;

    setRoomState({
      lastNathemaRoomPhase: currentScenePhase,
      nathemaRoomPhaseTurns: nextPhaseTurns,
    });

    if (nextPhaseTurns !== 2) {
      return null;
    }

    switch (currentScenePhase) {
      case 'assessment':
        return 'Nathema adjusts nothing and yet the room keeps developing the feeling that you are the object currently being unpacked.';
      case 'exposed':
        return 'Now that the wrapped chest has been noticed, every lacquered surface in the room seems arranged around the fact that Nathema arrived prepared for something less lawful than etiquette.';
      case 'bargaining':
        return 'Nathema has stopped treating your presence as incidental. The room now feels staged for pricing, concession, and selective disclosures.';
      case 'leveraged':
        return 'With real leverage on the table, the chamber loses any last pretense of guesthood. It is a negotiation suite now.';
      case 'compact':
        return 'The bargain has settled in. Nathema sits like a woman already redistributing tomorrow while the room quietly rehearses the scandal to come.';
      default:
        return null;
    }
  };

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

  const hasNathemaLeverage = getFlag => {
    return getFlag('nathemaEvidenceShown')
      || getFlag('nathemaBlackWindSampleDelivered')
      || getFlag('nathemaRouteKnowledgeShared')
      || getFlag('nathemaTextsShared');
  };

  const canSecureNathemaEscapeDeal = getFlag => {
    return getFlag('nathemaBlackWindSampleDelivered')
      && (
        getFlag('greyGrinDeliveredToNathema')
        || getFlag('nathemaEvidenceShown')
        || getFlag('nathemaRouteKnowledgeShared')
        || getFlag('nathemaTextsShared')
      );
  };

  const handleNathemaLedgerReview = ({ setFlag }) => {
    setFlag('nathemaBargained', true);
    setFlag('nathemaEvidenceShown', true);

    return 'Nathema opens the ledger only far enough to confirm the columns, the names, and Oshregaal\'s correction marks. Her expression sharpens into professional satisfaction. "There," she says softly. "That is not gossip. That is architecture. Keep it for now. A document this toxic is worth more in a hand that can still leave the room with it."';
  };

  const handleNathemaBlackWindSample = ({ item, setFlag, worldState }) => {
    setFlag('nathemaBargained', true);
    setFlag('nathemaBlackWindSampleDelivered', true);
    worldState.removeItemById(item.id);

    if (item.id === 'black-wind-root-sample') {
      return 'Nathema takes the root sample between two fingers and goes very still. "Source tissue," she says. "Not product. Not rumor. Good. That means the orchard is still alive under the house, which means everyone buying from Oshregaal is still buying from an active sin. You have improved our bargaining position considerably."';
    }

    if (item.id === 'black-wind-fruit') {
      return 'Nathema accepts the fruit with immediate, disciplined hunger, wrapping it in cloth before the room can fully witness the exchange. "Now we are speaking in quantities that alter decisions," she says. "Good. Do not ask for trust. Ask what this buys."';
    }

    return 'Nathema takes the elixir phial, turns it once against the light, and hides it inside her sleeve with practiced speed. "Concentrated, portable, and deniable," she murmurs. "You have finally brought me a sentence this house understands."';
  };

  const handleNathemaGreyGrinReview = ({ setFlag }) => {
    setFlag('nathemaBargained', true);
    setFlag('greyGrinShownToNathema', true);

    return 'Nathema takes in the Grey Grin Blade with a level of attention so exact it becomes intimacy by other means. "Now that," she says, "is not evidence. That is succession written in metal. Keep it visible only when you mean to renegotiate someone\'s future."';
  };

  const handleNathemaGreyGrinDelivery = ({ item, setFlag, worldState }) => {
    setFlag('nathemaBargained', true);
    setFlag('greyGrinShownToNathema', true);
    setFlag('greyGrinDeliveredToNathema', true);
    worldState.removeItemById(item.id);

    return 'Nathema accepts the Grey Grin Blade without triumph, which makes the exchange feel more dangerous rather than less. She wraps it in black cloth and exhales once. "Good," she says. "Now we are no longer discussing escape as a moral wish. We are discussing leverage with edges."';
  };

  const handleNathemaRouteKnowledgeReview = ({ setFlag }) => {
    setFlag('nathemaBargained', true);
    setFlag('nathemaRouteKnowledgeShared', true);

    return 'Nathema reads the folio excerpt with fierce stillness. "Paired living contact, a competent fraud, and enough geometry to insult a gate into cooperation," she murmurs. "Good. That is not merely a route. That is absence reduced to procedure."';
  };

  const handleNathemaTextsReview = ({ setFlag }) => {
    setFlag('nathemaBargained', true);
    setFlag('nathemaTextsShared', true);

    return 'Nathema lets the spellbook rest on her fingertips without quite opening it all the way. "Threshold rites, constraint notes, failure cases," she says. "Excellent. Stolen texts like this do not buy tonight. They buy the shape of whatever follows it."';
  };

  const handleNathemaTextsDelivery = ({ item, setFlag, worldState }) => {
    setFlag('nathemaBargained', true);
    setFlag('nathemaTextsShared', true);
    worldState.removeItemById(item.id);

    return 'Nathema accepts the threshold spellbook and folds it into her luggage as if she had planned the shelf space in advance. "Good," she says. "Archive theft is the sort of courtesy Oshregaal deserves to discover late."';
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
        effect: ({ setFlag }) => {
          setFlag('nathemaBargained', true);
        },
        reply: ({ getFlag }) => hasNathemaLeverage(getFlag)
          ? 'Nathema smiles with all the warmth of a sharpened treaty. "Now you understand the scale of the thing," she says. "Fruit buys appetites. Elixir buys armies. Documents buy fear. Routes buy absence. Texts buy futures. Any of them can open a road if used at the correct angle."'
          : 'Nathema studies you with sudden professional interest. "So you have heard useful words," she says. "Bring me anything from the black wind line and I may decide your survival has become strategically attractive."',
      },
      {
        match: ['source', 'tree', 'orchard', 'roots'],
        reply: ({ getFlag }) => {
          if (!hasNathemaLeverage(getFlag)) {
            return 'Nathema watches you coolly. "If you want source-level truths, stop arriving with guest-level offerings," she says.';
          }

          return getFlag('blackWindTreeFound')
            ? 'Nathema leans forward a fraction. "Then you have seen the house beneath the house," she says. "Good. That kind of truth can still destabilize people who think themselves too powerful for scandal."'
            : 'Nathema taps one fingernail against the chair arm. "If you mean to go deeper, follow the stock downward," she says. "Rooms like that always hide their theology under their accounting."';
        },
      },
      {
        match: ['escape', 'leave', 'outside'],
        reply: ({ getFlag }) => {
          if (getFlag('nathemaEscapeDealSecured')) {
            return 'Nathema gives you the look of a woman already spending tomorrow. "Go when you like," she says. "Oshregaal will wake to a missing guest and an altered balance of power. He will have larger fires than your footprints."';
          }

          if (canSecureNathemaEscapeDeal(getFlag)) {
            return 'Nathema smiles with cold approval. "Now this is a departure I can respect," she says. "I have source leverage, and either proof, a succession-blade, route mathematics, or stolen texts. Leave when you are ready. By dawn, Oshregaal will be too busy containing me to pursue you cleanly. You have secured a dark bargain."';
          }

          if (hasNathemaLeverage(getFlag)) {
            return '"Now you have the beginnings of a real departure," Nathema says. "Evidence if you want scandal. Sample if you want bargaining power. Route knowledge if you want quiet. Stolen texts if you want tomorrow. Bring one more useful thing or one precise opportunity, and I can turn this from survival into negotiation."';
          }

          if (getFlag('nathemaBargained')) {
            return '"Escape is easiest when everyone mistakes it for a transaction," Nathema says. "Acquire leverage first. Doors respect leverage more than sincerity."';
          }

          return 'Nathema glances toward the corridor. "Everyone in this house wants out in some sense," she says. "The relevant question is who expects to own the road afterward."';
        },
      },
      {
        match: ['ledger', 'records', 'evidence', 'proof'],
        reply: ({ getFlag }) => getFlag('nathemaEvidenceShown')
          ? 'Nathema taps one finger against her knee. "The ledger is excellent leverage," she says. "Not because it is true, but because it is legible to people who pay others to fear truth for them."'
          : 'Nathema tilts her head. "If you can produce written proof instead of tavern outrage, my interest improves dramatically," she says.',
      },
      {
        match: ['library', 'archive', 'spellbook', 'spellbooks', 'text', 'texts'],
        reply: ({ getFlag }) => getFlag('nathemaTextsShared')
          ? 'Nathema allows herself a small satisfied breath. "The stolen threshold text matters," she says. "Blade and evidence alter tonight. Archives alter succession, ritual, and every ugly tomorrow after that."'
          : 'Nathema glances toward the corridor. "Oshregaal keeps his most useful vanities in book form," she says. "If you can steal me a threshold text instead of a rumor, my interest becomes concrete."',
      },
      {
        match: ['route', 'routes', 'portal', 'bypass', 'geometry', 'folio'],
        reply: ({ getFlag }) => getFlag('nathemaRouteKnowledgeShared')
          ? 'Nathema taps one finger against the arm of her chair. "Good route knowledge turns flight into scheduling," she says. "Once a gate can be cheated by competent fraud, everyone depending on its etiquette becomes vulnerable."'
          : 'Nathema\'s eyes sharpen. "If the library has yielded portal constraints or route mathematics, bring them," she says. "Knowledge of how Oshregaal bypasses his own limitations is worth more than another frightened testimony."',
      },
      {
        match: ['grey grin', 'blade', 'trophy', 'weapon'],
        reply: ({ getFlag, setFlag }) => {
          if (!(hasNathemaLeverage(getFlag))) {
            return 'Nathema watches you for a moment. "If you want high-value rumors, bring high-value leverage first," she says. "I am not in the business of improving strangers for free."';
          }

          if (getFlag('greyGrinDeliveredToNathema')) {
            return 'Nathema allows herself the smallest satisfied smile. "The blade is with me now," she says. "That means one future has already become less theoretical. Bring me one proper opening and I can turn that theft into policy."';
          }

          if (getFlag('greyGrinShownToNathema')) {
            return 'Nathema folds her hands, visibly pleased. "Good," she says. "Now you understand why the Grey Grin is not merely a weapon. It is a claim. Carrying it changes every room by implication alone."';
          }

          setFlag('greyGrinLeadKnown', true);
          return 'Nathema smiles with dangerous approval. "If you want a second theft worth surviving, Oshregaal keeps the Grey Grin in a concealed trophy gallery off the library," she says. "Search the eastern genealogy cases. One false index spine opens the room. He likes his conquests near his books, so he can pretend both are scholarship."';
        },
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
        effect: ({ getFlag, setFlag, triggerEvent }) => {
          triggerEvent('startNathemaBargain');

          if (canSecureNathemaEscapeDeal(getFlag)) {
            setFlag('nathemaEscapeDealSecured', true);
          }
        },
        reply: ({ getFlag }) => {
          if (getFlag('nathemaEscapeDealSecured')) {
            return 'Nathema inclines her head. "Then keep your nerve and your distance from my name," she says. "You are no longer escaping alone. You are exiting during a transfer of power."';
          }

          if (canSecureNathemaEscapeDeal(getFlag)) {
            return 'Nathema folds one hand over the other and decides. "Very well," she says. "Leave while I make myself into tomorrow\'s emergency. Oshregaal will not be able to chase you and contain what you have handed me. Our bargain is ugly, but it will work."';
          }

          return 'Nathema folds one hand over the other. "Then stop treating departure as a confession," she says. "Make it a bargain, a theft, or an insult. Houses like this understand those better."';
        },
      },
      {
        match: ['i can help', 'we can help'],
        effect: ({ setFlag }) => {
          setFlag('nathemaBargained', true);
        },
        reply: 'Nathema appraises you like contraband with legs. "Possibly," she says. "Bring me leverage rather than enthusiasm and I may begin to agree."',
      },
      {
        match: ['i have evidence', 'i have proof', 'i found records'],
        reply: ({ getFlag }) => getFlag('nathemaEvidenceShown')
          ? '"Yes," Nathema says. "You have already improved from rumor to usefulness. Continue."'
          : 'Nathema makes a small inviting motion with two fingers. "Then show me something I can sell, threaten with, or survive by," she says.',
      },
      {
        match: ['i want the blade', 'i want grey grin', 'i want the grey grin blade'],
        reply: ({ getFlag, setFlag }) => {
          if (!(hasNathemaLeverage(getFlag))) {
            return 'Nathema allows herself a short laugh. "Want more expensively," she says. "Then perhaps I will help."';
          }

          setFlag('greyGrinLeadKnown', true);
          return '"Then take the library route," Nathema says. "The eastern genealogy cases hide a trophy gallery. Search for a false index spine and steal quickly. He values the Grey Grin too much to leave it honestly visible."';
        },
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
    scene: {
      getPhase: getNathemaRoomPhase,
      phases: {
        assessment: {
          description: 'At first the room feels like an occupied embassy suite: expensive, disciplined, and arranged to let Nathema evaluate visitors before granting them the dignity of relevance.',
          onTurn: advanceNathemaScene,
        },
        exposed: {
          description: 'Once the contraband chest is noticed, the room stops reading as a mere guest chamber and starts reading as a forward position for private policy and portable scandal.',
          onTurn: advanceNathemaScene,
        },
        bargaining: {
          description: 'After the first useful exchange, Nathema\'s room becomes openly transactional. Every object in it seems to belong to a woman who travels with contingencies instead of comforts and never unpacks without a second purpose.',
          onTurn: advanceNathemaScene,
        },
        leveraged: {
          description: 'Once you bring Nathema real leverage, the room sharpens into active political pressure: proof, contraband, route knowledge, and succession all waiting to be spent at the right angle and preferably at Oshregaal\'s expense.',
          onTurn: advanceNathemaScene,
        },
        compact: {
          description: 'With the escape arrangement secured, the chamber feels less like borrowed lodging than the command post of a coming internal crisis that Nathema has already started budgeting for.',
          onTurn: advanceNathemaScene,
        },
      },
    },
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
      {
        when: ({ getFlag }) => hasNathemaLeverage(getFlag),
        text: 'The room has shifted from speculative intrigue to active negotiation. Nathema is no longer evaluating whether you might matter, only what price your usefulness can command.',
      },
      {
        when: ({ getFlag }) => getFlag('nathemaEscapeDealSecured'),
        text: 'The negotiation has hardened into something worse than trust: a usable arrangement. Nathema now regards Oshregaal\'s house less as a place to survive than as a balance to tip.',
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
          show({ item, setFlag }) {
            if (item.id === 'black-wind-ledger') {
              return handleNathemaLedgerReview({ setFlag });
            }

            if (item.id === 'grey-grin-blade') {
              return handleNathemaGreyGrinReview({ setFlag });
            }

            if (item.id === 'geometry-folio') {
              return handleNathemaRouteKnowledgeReview({ setFlag });
            }

            if (item.id === 'threshold-spellbook') {
              return handleNathemaTextsReview({ setFlag });
            }

            if (item.id === 'black-wind-fruit' || item.id === 'black-wind-elixir' || item.id === 'black-wind-root-sample') {
              setFlag('nathemaBargained', true);
              return `Nathema studies the ${item.name} without touching it. "Good," she says. "Now either keep it as leverage or give it to me and turn leverage into alignment."`;
            }

            return `Nathema glances at the ${item.name} and decides it is not yet a persuasive argument.`;
          },
          give({ item, setFlag, worldState }) {
            if (item.id === 'black-wind-ledger') {
              return handleNathemaLedgerReview({ setFlag });
            }

            if (item.id === 'grey-grin-blade') {
              return handleNathemaGreyGrinDelivery({ item, setFlag, worldState });
            }

            if (item.id === 'geometry-folio') {
              return handleNathemaRouteKnowledgeReview({ setFlag });
            }

            if (item.id === 'threshold-spellbook') {
              return handleNathemaTextsDelivery({ item, setFlag, worldState });
            }

            if (item.id === 'black-wind-fruit' || item.id === 'black-wind-elixir' || item.id === 'black-wind-root-sample') {
              return handleNathemaBlackWindSample({ item, setFlag, worldState });
            }

            return `Nathema declines the ${item.name} with the air of someone refusing a coin too small to insult her properly.`;
          },
        },
      },
      chest: 'One travel chest is wrapped in diplomatic cloth and bound with a cord too practical for ceremony. It is the room\'s least innocent object.',
      brazier: 'The brazier burns bitter perfume and a pinch of some darker resin. The smell is meant to announce rank, caution, and selective menace.',
      silks: 'Folded silks and traveling garments hang in disciplined layers, each expensive enough to suggest that Nathema dresses for negotiations as other people dress for war.',
    },
  });
}

export default createNathemaRoom;