import { Item } from '../../engine/models/item.js';
import { Room } from '../../engine/models/room.js';

export function createLibraryRoom() {
  const waxPalm = new Item({
    id: 'wax-palm',
    name: 'wax palm',
    aliases: ['false palm', 'palm mold', 'practice palm'],
    description: 'A flexible wax-and-wire practice palm used for ritual demonstrations. The inner surface is lined with fine silver thread and still holds a faint animal warmth.',
    actions: {
      look() {
        return 'The wax palm was built to counterfeit living contact at close range. Oshregaal, apparently, preferred his impossible geometry to have teaching aids.';
      },
    },
  });

  const geometryFolio = new Item({
    id: 'geometry-folio',
    name: 'geometry folio',
    aliases: ['folio', 'geometry notes', 'notes'],
    description: 'A folio of Oshregaal\'s notes on sacred architecture, impossible turns, and corridors that resent singular interpretations.',
    actions: {
      read({ getFlag, setFlag }) {
        if (!getFlag('foldedHallwayUnderstood')) {
          setFlag('foldedHallwayUnderstood', true);
        }

        return 'The folio describes a "folded hall" stabilized by a black idol that expects paired living contact. A margin note in another hand adds: "If you only have one body, bring either help or a fraud convincing enough to satisfy geometry."';
      },
    },
  });

  const meditativeIncense = new Item({
    id: 'meditative-incense',
    name: 'meditative incense',
    aliases: ['incense'],
    description: 'A wrapped bundle of resinous incense labeled in Oshregaal\'s hand: FOR CALMING WINDS, INTERNAL OR OTHERWISE.',
    actions: {
      smell() {
        return 'The incense smells of cedar, dust, and the sort of disciplined breathing practiced by people expecting metaphysical weather.';
      },
      light({ currentRoom, getFlag, emitEvent }) {
        if (currentRoom?.id === 'tunnel') {
          if (getFlag('plumTunnelRouteReady')) {
            return 'The incense already burns its thin steady line through the tunnel air. The route is as calm as it is likely to become tonight.';
          }

          return emitEvent('prepareTunnelRescueRoute');
        }

        return 'You stop short of lighting the incense here. Filling Oshregaal\'s library with ritual smoke seems like a way to announce your reading habits to the worst possible audience.';
      },
    },
  });

  return new Room({
    id: 'library',
    title: 'Library',
    description: `
Oshregaal's library is less a scholarly refuge than a shrine to his own continued relevance. Shelves climb the walls under ladders on brass tracks, and every table is spread with notes on war, mutation, theology, and the architecture of impossible spaces.
To the north, an unusually narrow opening gives onto a corridor whose angles seem unwilling to stay resolved. West lies Plum's room.
`.trim(),
    exits: {
      west: 'plumRoom',
      east: 'trophyRoom',
      north: 'foldedHallway',
    },
    exitGuards: {
      east({ getFlag }) {
        if (getFlag('trophyRoomUnlocked')) {
          return null;
        }

        return 'The eastern shelves look fixed in place. If there is a gallery beyond them, the library is not volunteering it yet.';
      },
    },
    verbs: {
      search({ command, getFlag, setFlag, emitEvent }) {
        const target = command.directObject;

        if (!target || target.includes('library') || target.includes('room') || target.includes('shelves') || target.includes('books')) {
          if (!getFlag('libraryRouteKnown')) {
            setFlag('libraryRouteKnown', true);
            return 'Among the books you find philosophical boasting, mutation theory, and a heavily thumbed folio on "obedient geometry." More important, the northern gap between shelves is not decorative: it leads into the folded corridor Plum warned you about.';
          }

          return 'The library remains a monument to Oshregaal\'s mind: books that want readers, notes that want worship, and a northern passage that wants more than one understanding at once.';
        }

        if (target.includes('table') || target.includes('folio') || target.includes('notes')) {
          if (!getFlag('foldedHallwayUnderstood')) {
            setFlag('foldedHallwayUnderstood', true);
          }

          return 'The largest folio on the reading table concerns the folded hall beyond the north shelves. Beside it rests a wax practice palm threaded with silver. Oshregaal\'s diagrams show the corridor crossing itself around a black idol whose hands must be answered in pairs. Someone else has underlined the phrase "or by a competent fraud."';
        }

        if (target.includes('ladder') || target.includes('tracks')) {
          return 'The ladders roll silently on brass rails. Most of the top shelves are devoted to books that sound like theology until you notice they are really manuals for power disguised as religion.';
        }

        if (target.includes('cabinet') || target.includes('case') || target.includes('index') || target.includes('east shelf') || target.includes('eastern shelves')) {
          if (getFlag('trophyRoomUnlocked')) {
            return 'The eastern case already stands loose on its hidden pivot, the seam to the trophy gallery now obvious once you know to look for vanity disguised as cabinetry.';
          }

          if (!getFlag('greyGrinLeadKnown')) {
            return 'The eastern cases appear to be devoted to family genealogies, corrected histories, and the sort of shelf order meant to discourage curiosity by looking administrative.';
          }

          return emitEvent('unlockTrophyRoom');
        }

        return `You search the ${target} and come away with dust, doctrine, and stronger reasons not to trust Oshregaal's literary taste.`;
      },
    },
    items: [waxPalm, geometryFolio, meditativeIncense],
    conditionalDescriptions: [
      {
        when: ({ getFlag }) => getFlag('plumFollowing'),
        text: 'Plum keeps close to the shelves, glancing at every open table as if each one might still contain a version of her life she failed to recover.',
      },
      {
        when: ({ getFlag }) => getFlag('libraryRouteKnown'),
        text: 'Now that you have noticed it properly, the northern passage no longer reads as shelving geometry gone wrong. It reads as intent.',
      },
      {
        when: ({ getFlag }) => getFlag('foldedHallwayUnderstood'),
        text: 'The open geometry folio on the table gives the room an air of having accidentally explained too much.',
      },
      {
        when: ({ getFlag }) => getFlag('trophyRoomUnlocked'),
        text: 'One eastern library case now sits fractionally misaligned, its hidden seam obvious once you know that Oshregaal shelves his glories like books.',
      },
    ],
    objects: {
      shelves: 'The shelves carry wars, diets, cults, heresies, botanical crimes, and enough self-written marginalia to prove Oshregaal distrusts even printed agreement.',
      cabinet: 'The eastern cabinets are crowded with genealogies, corrected triumphs, and catalogues that feel less archival than possessive.',
      table: 'The reading table is cluttered with diagrams, charms, wax drips, a wax practice palm, and one especially dangerous-looking folio on impossible corridors.',
      ladders: 'The brass ladders promise reach without wisdom.',
      passage: 'The northern passage narrows between shelves before becoming something less honest than a hallway.',
    },
  });
}

export default createLibraryRoom;