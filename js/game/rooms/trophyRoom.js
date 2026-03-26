import { Item } from '../../engine/models/item.js';
import { Room } from '../../engine/models/room.js';

import { createGreyGrinBlade } from '../items/greyGrinBlade.js';

export function createTrophyRoom() {
  const greyGrinBlade = createGreyGrinBlade();
  const cursedCoinChest = new Item({
    id: 'cursed-coin-chest',
    name: 'cursed coin chest',
    aliases: ['coin chest', 'coffer'],
    description: 'A small lacquered coffer wrapped in warning paper too elegant to count as reassurance.',
    actions: {
      take({ session }) {
        return session.triggerGameOver(
          'You claim the cursed coin chest, and the warning paper tears with a tiny satisfied sigh. Gold begins pouring from the seam in a bright impossible stream, each coin ringing once against wood and then again from somewhere inside your thoughts. By the time you realize the treasure is not accumulating around you but weighting you inward, the gallery has already curated your greed into a cautionary exhibit.',
          { persistentFlags: ['coinChestGameOverSeen'], branchId: 'coin-chest' },
        );
      },
    },
  });
  cursedCoinChest.hide();

  const holocaustCandle = new Item({
    id: 'holocaust-candle',
    name: 'holocaust candle',
    aliases: ['holocaust candle', 'black candle'],
    description: 'A long black candle banded with old wax drips and a smell so faintly funereal it feels deliberate even unlit.',
    actions: {
      light({ session }) {
        return session.triggerGameOver(
          'You light the holocaust candle. The flame arrives thin, blue, and immediately too interested in history. The gallery fills not with ordinary fire but with remembered burnings: trophies becoming pyres, lacquer turning confessional, and the air itself deciding to prosecute by heat. You do not survive long enough to learn whose atrocity the candle was built to remember first.',
          { persistentFlags: ['holocaustCandleGameOverSeen'], branchId: 'holocaust-candle' },
        );
      },
    },
  });
  holocaustCandle.hide();

  return new Room({
    id: 'trophyRoom',
    title: 'Trophy Room',
    description: ({ isItemVisibleHere }) => {
      const bladeLine = isItemVisibleHere('grey-grin-blade')
        ? 'At the center, on a blackwood stand beneath a cone of disciplined light, rests the Grey Grin Blade.'
        : 'At the center, a blackwood stand sits empty beneath its cone of disciplined light, advertising recent theft with more honesty than the rest of the room can manage.';

      return `
This private gallery feels more prosecutorial than decorative. Glass cases, lacquered plaques, and stolen honors line the walls in rows meant to prove that conquest can be curated into taste.
${bladeLine} West lies the library through a concealed panel.
`.trim();
    },
    exits: {
      west: 'library',
      east: 'spiderRoom',
    },
    exitGuards: {
      east({ getFlag }) {
        if (getFlag('spiderRoomFound')) {
          return null;
        }

        return 'The eastern wall appears to be only more trophies and lacquer. If another chamber lies beyond, the gallery is not surrendering it casually.';
      },
    },
    verbs: {
      search({ command, getFlag, setFlag, isItemVisibleHere }) {
        const target = command.directObject;

        if (!target || target.includes('room') || target.includes('gallery') || target.includes('cases')) {
          if (!cursedCoinChest.visible) {
            cursedCoinChest.reveal();
          }

          if (!holocaustCandle.visible) {
            holocaustCandle.reveal();
          }

          return isItemVisibleHere('grey-grin-blade')
            ? 'You search the gallery and find plaques, clan marks, stolen devotional objects, a paper-wrapped cursed coffer, and one long black candle laid out with the smugness of an atrocity preserved for later admiration.'
            : 'You search the gallery and find plaques, clan marks, stolen devotional objects, a paper-wrapped cursed coffer, one long black candle, and an empty central stand that makes the room feel marginally more honest than it did before the blade was taken.';
        }

        if (target.includes('blade') || target.includes('stand') || target.includes('pedestal')) {
          return isItemVisibleHere('grey-grin-blade')
            ? 'The Grey Grin Blade is displayed with the smug precision of an object its owner loves too much to hide and too much to use casually.'
            : 'The blackwood stand now displays only absence, which manages to say nearly as much about Oshregaal as the blade did.';
        }

        if (target.includes('plaque') || target.includes('honor') || target.includes('trophy') || target.includes('wall')) {
          if (!getFlag('spiderRoomFound')) {
            setFlag('spiderRoomFound', true);
            return 'Most plaques reduce atrocities to inheritance and theft to prestige, but one section of the eastern wall carries an incorrect count and a draft where lacquer should seal cleanly. Pressed close, the trophy line gives way to a hidden seam leading east into a web-dark side chamber.';
          }

          return 'Now that you have counted the plaques properly, the eastern seam is obvious: another concealed chamber hidden behind Oshregaal\'s curated victories.';
        }

        return `You search the ${target} and come away with a stronger desire to rob the room on principle.`;
      },
    },
    items: [greyGrinBlade, cursedCoinChest, holocaustCandle],
    conditionalDescriptions: [
      {
        when: ({ worldState }) => {
          const location = worldState.getItemLocation('grey-grin-blade');
          return !location || location.type !== 'room' || location.roomId !== 'trophyRoom';
        },
        text: 'The blackwood stand at the room\'s center now sits empty, which improves the gallery morally if not aesthetically.',
      },
      {
        when: ({ getFlag }) => getFlag('spiderRoomFound'),
        text: 'A seam now mars the eastern trophy wall where Oshregaal concealed a further chamber too private even for his ordinary vanity.',
      },
    ],
    objects: {
      cases: 'The glass cases hold medals, seals, relics, and trophies taken from people whose stories were apparently not permitted to accompany their possessions.',
      honors: 'The stolen honors lining the walls have been curated into a lecture about conquest as taste. They remain theft dressed up for company.',
      light: 'The cone of disciplined light over the central stand is almost devotional, as though Oshregaal wanted the blade worshiped without having to call the room a shrine.',
      stand: {
        description({ isItemVisibleHere }) {
          return isItemVisibleHere('grey-grin-blade')
            ? 'The blackwood stand was built to flatter the blade and belittle everyone who ever lost it.'
            : 'The blackwood stand was built to flatter the blade and now flatters only the fact that someone stole it anyway.';
        },
      },
      plaques: 'Each plaque is written in the tone of a host introducing his own crimes as anecdotes with pedigree.',
      panel: 'From inside the room, the concealed western panel looks obvious, which is how hidden doors often mock the people still outside them.',
      seam: 'The eastern seam is nearly invisible until the plaque count tips you off. After that it looks like vanity trying very hard to pass for carpentry.',
    },
  });
}

export default createTrophyRoom;