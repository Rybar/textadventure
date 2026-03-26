import { Item } from '../../engine/models/item.js';
import { Room } from '../../engine/models/room.js';

export function createFoldedHallwayRoom() {
  const rubyEyes = new Item({
    id: 'ruby-eyes',
    name: 'ruby eyes',
    aliases: ['rubies', 'ruby eye', 'eyes'],
    description: 'Two red stones set into the idol with the sort of deliberate temptation that suggests the architect expected greed to volunteer as a second ritual component.',
    actions: {
      take({ session }) {
        return session.triggerGameOver(
          'You pry the ruby eyes loose from the idol. The corridor accepts the theft as an answer to a question you did not mean to ask. Sightlines split, footsteps arrive from impossible angles, and the folded hall closes over you like a hand correcting a misbehaving finger. The rubies vanish into contradiction with the rest of you.',
          { persistentFlags: ['rubyEyesGameOverSeen'], branchId: 'ruby-eyes' },
        );
      },
    },
  });
  rubyEyes.hide();

  return new Room({
    id: 'foldedHallway',
    title: 'Folded Hallway',
    description: `
The corridor beyond the library refuses to behave like a single corridor. The floor doubles back without curving, the walls seem to overtake one another, and a black idol rises at the central junction where three stretches of hallway keep arriving at the same place from incompatible directions.
South, at least, still behaves honestly enough to return to the library.
`.trim(),
    exits: {
      south: 'library',
      north: 'tunnel',
    },
    exitGuards: {
      north({ getFlag }) {
        if (getFlag('foldedHallwayUnlocked')) {
          return null;
        }

        return 'Every attempt to take the northern stretch loops you back toward the idol. The corridor refuses to become a route until its little ritual is satisfied.';
      },
    },
    verbs: {
      search({ command, getFlag, setFlag }) {
        const target = command.directObject;

        if (!target || target.includes('hall') || target.includes('corridor') || target.includes('passage')) {
          if (!getFlag('foldedHallwaySeen')) {
            setFlag('foldedHallwaySeen', true);
            return 'A careful survey makes the problem worse before it makes it clearer: this is not a hall with many branches but one hall folded around itself and pinned in place by the black idol at its knot.';
          }

          return 'The hallway still refuses ordinary navigation. Every line of sight that should promise progress bends back toward the idol as though the corridor is taking attendance.';
        }

        if (target.includes('idol') || target.includes('statue') || target.includes('hands')) {
          if (!getFlag('idolPairingKnown')) {
            setFlag('idolPairingKnown', true);
          }

          if (!rubyEyes.visible) {
            rubyEyes.reveal();
          }

          return 'The black idol is shaped like a tall faceless god with two palms turned outward at chest height. Dried smears and chalk marks around the base suggest the hall only unfolds when both hands receive answering living contact at once. In the face, two ruby eyes glow with the sort of optional wealth designed to punish the professionally curious.';
        }

        return `You search the ${target} and discover that impossible architecture becomes no kinder under scrutiny.`;
      },
      touch({ command, getFlag, setFlag }) {
        const target = command.directObject;
        if (!target) {
          return 'Touch what?';
        }

        if (target.includes('idol') || target.includes('hand') || target.includes('statue')) {
          if (!getFlag('idolPairingKnown')) {
            setFlag('idolPairingKnown', true);
          }

          return 'You press one palm to the idol. For an instant the corridor shivers toward coherence, then collapses back into contradiction. One hand is enough to prove the mechanism. It is not enough to satisfy it.';
        }

        return `Touching the ${target} does not make the geometry any more charitable.`;
      },
      listen({ command, getFlag, setFlag }) {
        const target = command.directObject;
        if (!target || target.includes('hall') || target.includes('corridor') || target.includes('idol')) {
          if (!getFlag('foldedHallwayUnderstood')) {
            setFlag('foldedHallwayUnderstood', true);
          }

          return 'Standing still and listening, you can hear your own movements arriving from fractions of a second away. The folded hall is not merely twisted space; it is space waiting for a proper agreement.';
        }

        return `The ${target} offers no sound except the hallway reflecting you back at yourself.`;
      },
    },
    items: [rubyEyes],
    conditionalDescriptions: [
      {
        when: ({ getFlag }) => getFlag('plumFollowing'),
        text: 'Plum stays just behind your shoulder, refusing to look directly at the angles for longer than she must. The hallway seems offended by being witnessed by two minds at once.',
      },
      {
        when: ({ getFlag }) => getFlag('idolPairingKnown'),
        text: 'Now that you understand the idol\'s demand, the whole corridor feels less random and more insultingly specific.',
      },
      {
        when: ({ getFlag }) => getFlag('foldedHallwayUnderstood'),
        text: 'The geometry no longer reads as nonsense. It reads as a puzzle designed by someone who considered an ordinary hallway beneath him.',
      },
      {
        when: ({ getFlag }) => getFlag('foldedHallwayUnlocked'),
        text: 'The northern branch now holds steady long enough to count as a route, though the hallway clearly resents having been outmaneuvered.',
      },
    ],
    objects: {
      idol: {
        name: 'black idol',
        aliases: ['idol', 'statue', 'black statue'],
        description: 'The black idol depicts a tall faceless figure with both hands extended to receive contact. The stone looks older than the manor and less interested in metaphor.',
        actions: {
          use({ item, getFlag, emitEvent }) {
            if (!item) {
              return 'The idol appears to require something more specific than generic interference.';
            }

            if (item.id === 'wax-palm') {
              if (getFlag('foldedHallwayUnlocked')) {
                return 'The hallway is already holding still as much as it intends to. The wax palm has done its dishonest little duty.';
              }

              return emitEvent('unfoldFoldedHallway');
            }

            return `The idol does not accept the ${item.name} as a convincing second palm.`;
          },
        },
      },
      hands: 'The idol\'s two hands are worn smooth where living palms have answered them before.',
      floor: 'The floor seams intersect in ways that seem impossible to follow for more than a few breaths at a time.',
      walls: 'The walls meet at angles that feel settled only until you blink.',
    },
  });
}

export default createFoldedHallwayRoom;