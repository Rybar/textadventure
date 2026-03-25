import { Room } from '../../engine/models/room.js';

function getChariadulschaTruth({ topic, getFlag, setFlag }) {
  if (topic.includes('black wind') || topic.includes('tree') || topic.includes('source') || topic.includes('roots')) {
    setFlag('blackWindSourceLeadKnown', true);
    setFlag('spiderTruthClaimed', true);
    return 'The hanging god-shade stirs just enough to count as attention. "Trade is the rind," it rasps. "Root is the fruit. Follow cold stock downward and you will find the living arithmetic under the house."';
  }

  if (topic.includes('grey grin') || topic.includes('blade') || topic.includes('weapon') || topic.includes('trophy')) {
    setFlag('greyGrinLeadKnown', true);
    setFlag('spiderTruthClaimed', true);
    return 'The corpse in the web gives a brittle little twitch. "He keeps legacy where he can admire it," it says. "The laughing blade sits near his trophies because vanity likes witnesses."';
  }

  if (topic.includes('oshregaal') || topic.includes('host') || topic.includes('weakness')) {
    setFlag('oshregaalWeaknessKnown', true);
    setFlag('spiderTruthClaimed', true);
    return 'Chariadulscha counts on one desiccated finger. "He loves being answered," it says. "Interrupt appetite, ownership, or applause and the old host becomes briefly mortal in temperament if not in flesh."';
  }

  if (topic.includes('sealed') || topic.includes('prisoner') || topic.includes('containment') || topic.includes('north wall')) {
    setFlag('sealedRoomLeadKnown', true);
    setFlag('spiderTruthClaimed', true);
    return 'The web canopy trembles. "When guests become troublesome," the god-shade whispers, "they are stored where even echoes must be counted." A faint tapping answers from beyond the north wall.';
  }

  if (topic.includes('portal') || topic.includes('bypass') || topic.includes('folded hall') || topic.includes('geometry') || topic.includes('spellbook')) {
    setFlag('portalBypassLearned', true);
    setFlag('spiderTruthClaimed', true);
    return 'The corpse in the web shifts as if accounting for a gate. "He cheats thresholds through etiquette and fraud," it rasps. "Follow the library mathematics, not the dining-room theatrics. A gate that expects paired life can be bullied by a convincing substitute if the insult is precise enough."';
  }

  return null;
}

export function createSpiderRoom() {
  return new Room({
    id: 'spiderRoom',
    title: 'Spider Room',
    description: `
The chamber beyond the trophy gallery is low, silk-draped, and arranged with a precision that feels less arachnid than clerical. Webbing spans the ceiling in measured radial lines, and something ancient hangs within it like a saint preserved by an accountant.
Below the cocooned corpse stands a counting frame of black beads, finger bones, and pearls. A shallow offering dish rests nearby. West lies the trophy gallery.
`.trim(),
    exits: {
      north: 'sealedRoom',
      west: 'trophyRoom',
    },
    exitGuards: {
      north({ getFlag }) {
        if (getFlag('sealedRoomUnlocked')) {
          return null;
        }

        return 'The north wall still reads as silk over stone. If there is a correction chamber beyond it, the seam has not yet fully given itself away.';
      },
    },
    triggers: {
      enter: [
        {
          id: 'spiderRoom:first-contact',
          once: true,
          run: ({ setFlag }) => {
            setFlag('spiderRoomFound', true);
            return null;
          },
        },
      ],
    },
    verbs: {
      search({ command, getFlag, setFlag }) {
        const target = command.directObject;

        if (!target || target.includes('room') || target.includes('web') || target.includes('canopy')) {
          return 'You search the chamber and find no spider at all, only ritual webwork, numbered plaques, and a dead god suspended as if Oshregaal had acquired divinity for reference rather than worship.';
        }

        if (target.includes('plaque') || target.includes('tablet') || target.includes('count')) {
          if (!getFlag('sealedRoomLeadKnown')) {
            setFlag('sealedRoomLeadKnown', true);
          }

          return 'The tally plaques list bargains, titles, and confiscated futures in Oshregaal\'s hand. One sequence skips a number entirely. Beside it, the north wall bears a seam hidden under silk and the memory of something once stored nearby.';
        }

        if (target.includes('dish') || target.includes('offering')) {
          return 'The offering dish holds clipped hair, invitation scraps, dried blood, and the sort of payments made by people who lacked cleaner currencies.';
        }

        if (target.includes('frame') || target.includes('bead') || target.includes('abacus')) {
          return 'The counting frame is built from black beads, finger bones, and pearls. It looks less like a tool for arithmetic than for morally classifying obligations.';
        }

        if (target.includes('wall') || target.includes('north')) {
          if (!getFlag('sealedRoomLeadKnown')) {
            setFlag('sealedRoomLeadKnown', true);
          }

          if (!getFlag('sealedRoomUnlocked')) {
            setFlag('sealedRoomUnlocked', true);
            return 'You part old silk from the north wall and find a seam hidden under the webbing, plus scrape marks from something once stored nearby and moved in a hurry. A disguised latch yields with soft administrative reluctance, exposing a correction chamber to the north.';
          }

          return 'The concealed seam in the north wall already stands exposed, an opening into one more way Oshregaal turned disagreement into room design.';
        }

        return `You search the ${target} and discover only counted blasphemy.`;
      },
      listen({ command, getFlag, setFlag }) {
        const target = command.directObject;

        if (!target || target.includes('wall') || target.includes('north')) {
          if (!getFlag('sealedRoomLeadKnown')) {
            setFlag('sealedRoomLeadKnown', true);
          }

          return 'You press close to the north wall and hear a faint, deliberate tapping in counted intervals, as if someone or something beyond the masonry has been reduced to arithmetic and routine.';
        }

        return `The ${target} offers only silk-creak and the rude patience of a room that has outlived reverence.`;
      },
    },
    conditionalDescriptions: [
      {
        when: ({ getFlag }) => getFlag('spiderDebtResolved'),
        text: 'The webwork now hangs in a calmer pattern. Somewhere in the room, an old account seems to have been marked paid in full.',
      },
      {
        when: ({ getFlag }) => getFlag('spiderPromiseMade') && !getFlag('spiderTruthClaimed'),
        text: 'The dead god hangs with new, unpleasant attention. Having been promised future disorder, it is now prepared to spend one answer on you.',
      },
      {
        when: ({ getFlag }) => getFlag('spiderTruthClaimed'),
        text: 'Something in the webwork has gone still again. Whatever truth you bought here has already been counted and filed.',
      },
      {
        when: ({ getFlag }) => getFlag('sealedRoomLeadKnown'),
        text: 'The north wall now feels less structural than punitive, its hidden seam and counted tapping impossible to dismiss as settling stone.',
      },
      {
        when: ({ getFlag }) => getFlag('sealedRoomUnlocked'),
        text: 'The north seam has now been forced into legibility, yielding access to a hidden correction chamber beyond the web-dark room.',
      },
    ],
    objects: {
      chariadulscha: {
        name: 'Chariadulscha',
        aliases: ['chariadulscha', 'he-who-counts', 'corpse', 'god', 'god-shade'],
        description: 'The thing in the web is mummified, jointed wrong, and edited down to a face that looks more numerical than human. It does not feel asleep so much as budgeted.',
        actions: {
          touch() {
            return 'You choose not to touch the hanging god-shade. Some relics are clearly waiting for a hand to become an accounting entry.';
          },
          ask({ topic, getFlag, setFlag }) {
            setFlag('chariadulschaMet', true);

            const qualifyingTopic = topic.includes('black wind')
              || topic.includes('tree')
              || topic.includes('source')
              || topic.includes('roots')
              || topic.includes('grey grin')
              || topic.includes('blade')
              || topic.includes('weapon')
              || topic.includes('trophy')
              || topic.includes('oshregaal')
              || topic.includes('host')
              || topic.includes('weakness')
              || topic.includes('sealed')
              || topic.includes('prisoner')
              || topic.includes('containment')
              || topic.includes('north wall')
              || topic.includes('portal')
              || topic.includes('bypass')
              || topic.includes('folded hall')
              || topic.includes('geometry')
              || topic.includes('spellbook');

            if (qualifyingTopic && getFlag('spiderPromiseMade') && !getFlag('spiderTruthClaimed')) {
              const truth = getChariadulschaTruth({ topic, getFlag, setFlag });
              if (truth) {
                return truth;
              }
            }

            if (qualifyingTopic && getFlag('spiderTruthClaimed')) {
              return 'The hanging god-shade makes a dry counting sound. "One promise was one number," it says. "The number is spent."';
            }

            if (qualifyingTopic) {
              return 'The corpse in the web stirs by fractions. "Questions are cheap," it whispers. "Answers cost disorder. Promise me one clean act of future chaos, and I will spend one truth on you."';
            }

            if (topic.includes('name') || topic.includes('who are you')) {
              return 'The husk shifts in its silk. "Chariadulscha," it says. "Counted by enemies, curated by Oshregaal, and badly served by both."';
            }

            return 'Chariadulscha responds with a faint dry click from somewhere inside the webbing, as though counting your irrelevance for later.';
          },
          tell({ topic, getFlag, setFlag }) {
            setFlag('chariadulschaMet', true);

            if (getFlag('spiderDebtResolved')) {
              return 'Chariadulscha clicks softly in the webbing. "Yes," it whispers. "I heard the correction in the house. Our number is closed."';
            }

            if (getFlag('spiderPromiseMade')) {
              if (getFlag('spiderTruthClaimed')) {
                return '"You have already purchased and spent your number," Chariadulscha whispers. "Go fulfill it somewhere louder."';
              }

              return 'The dead god waits in the web with patient hunger. "Then ask," it says. "You have paid enough to be answered once."';
            }

            if (topic.includes('promise') || topic.includes('swear') || topic.includes('chaos') || topic.includes('break something') || topic.includes('i will break')) {
              setFlag('spiderPromiseMade', true);
              setFlag('spiderDebtPending', true);
              return 'Silk tightens across the chamber as Chariadulscha acknowledges the vow. "Good," it says. "A future disturbance properly spoken. Ask, and I will spend one answer on you."';
            }

            return 'The god-shade appears uninterested in statements that do not either flatter it or endanger someone later.';
          },
        },
      },
      corpse: {
        description: 'The suspended corpse hangs in the web canopy like a captured theorem of divinity gone to dust.',
        actions: {
          touch() {
            return 'Even at a cautious distance, touching the corpse seems like volunteering to be noticed by every accounting principle in the room.';
          },
        },
      },
      web: {
        description: 'The web canopy is too symmetrical to be natural. Each strand looks measured, filed, and then spun.',
        actions: {
          touch() {
            return 'The silk is stronger than it looks and dry as old parchment, more archive than nest.';
          },
        },
      },
      frame: {
        description: 'The counting frame waits beneath the corpse like a priestly abacus for sins, vows, and confiscated futures.',
        actions: {
          touch() {
            return 'The black beads click softly under your fingers with the sound of debts deciding whether they recognize you.';
          },
        },
      },
      dish: {
        description: 'The offering dish contains clipped hair, old blood, and bits of paper where names used to matter.',
        actions: {
          touch() {
            return 'You do not disturb the offering dish. Nothing in it looks inactive enough to count as safely abandoned.';
          },
          smell() {
            return 'Old blood, stale silk, and the dry sweet rot of preserved vows rise from the dish together.';
          },
        },
      },
      wall: {
        description: 'The north wall is wrapped in old silk. Beneath it, the stone seam looks less architectural than punitive.',
        actions: {
          touch() {
            return 'The silk over the wall is dry and tight, with a seam beneath it that feels less hidden than deliberately resented.';
          },
          use({ item, getFlag, setFlag, worldState }) {
            if (!item) {
              return 'The wall wants either patience or a better offense than your hands.';
            }

            if (item.id !== 'potion-of-hole') {
              return `The ${item.name} does not meaningfully improve your argument with the north wall.`;
            }

            if (getFlag('sealedRoomUnlocked')) {
              return 'The seam is already open. More hole would only make the room feel argumentative.';
            }

            worldState.removeItemById(item.id);
            setFlag('sealedRoomLeadKnown', true);
            setFlag('sealedRoomUnlocked', true);
            return 'You pour the potion of hole across the silk-wrapped seam. The wall forgets a narrow vertical section of itself at once, opening a black administrative absence straight into the sealed correction chamber beyond. Even this house looks offended by the shortcut.';
          },
        },
      },
    },
  });
}

export default createSpiderRoom;