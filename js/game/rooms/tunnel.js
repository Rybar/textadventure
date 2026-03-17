import { Room } from '../../engine/models/room.js';

export function createTunnelRoom() {
  return new Room({
    id: 'tunnel',
    title: 'Tunnel',
    description: `
Beyond the unfolded corridor, the house gives way to older stone. This narrow tunnel runs between root-knotted masonry and damp earth, carrying a steady draft of cold cave air that feels almost obscene after the mansion's perfumes.
The passage narrows farther on beneath a cracked arch and a spill of roots, promising some less ceremonial route toward the outer grounds. South lies the folded hall.
`.trim(),
    exits: {
      south: 'foldedHallway',
    },
    verbs: {
      search({ command, getFlag, setFlag }) {
        const target = command.directObject;

        if (!target || target.includes('tunnel') || target.includes('passage') || target.includes('arch') || target.includes('roots')) {
          if (getFlag('plumTunnelRouteReady')) {
            return 'The incense has quieted the draft and softened the root choke into a narrow but manageable crawl. It would still be ugly, but for the first time the tunnel feels like a route you could ask Plum to survive with you rather than a hole to abandon her beside.';
          }

          if (!getFlag('tunnelRouteKnown')) {
            setFlag('tunnelRouteKnown', true);
            return 'A crawl through the roots reveals that the tunnel continues toward the outer gardens and probably beyond, but not in a way that would be quick, quiet, or easy with Plum in tow. It is an escape route, but not yet a rescue route.';
          }

          return 'The tunnel remains promising in the selfish way of routes meant for one desperate body rather than two careful fugitives.';
        }

        if (target.includes('arch') || target.includes('stone')) {
          return 'The arch stones are older than the manor above them. Someone built this passage to move secretly through the hill long before Oshregaal made secrecy decorative.';
        }

        return `You search the ${target} and come away muddy, cold, and more convinced that the house was never as sealed as it liked to pretend.`;
      },
    },
    conditionalDescriptions: [
      {
        when: ({ getFlag }) => getFlag('tunnelRouteKnown'),
        text: 'Now that you have inspected the roots properly, the tunnel reads as a nearly-viable exit: excellent for one person, inadequate for the rescue you have promised.',
      },
      {
        when: ({ getFlag }) => getFlag('plumTunnelRouteReady'),
        text: 'Incense now thins through the draft in pale disciplined strands. The roots have eased back just enough to turn desperation into an actual plan.',
      },
    ],
    objects: {
      roots: {
        description({ getFlag }) {
          if (getFlag('plumTunnelRouteReady')) {
            return 'The roots still crowd the tunnel, but incense smoke has coaxed them back from a strangling choke into something two frightened people could negotiate.';
          }

          return 'The roots force the passage into a low crawl farther on. They are thick, wet, and patient enough to suggest they have been widening cracks for years.';
        },
      },
      arch: 'The cracked arch marks the point where impossible household geometry hands off to older, uglier practicality.',
      draft: {
        description({ getFlag }) {
          if (getFlag('plumTunnelRouteReady')) {
            return 'The draft now moves in a calmer, narrower stream, as though the incense has taught the tunnel a brief lesson in manners.';
          }

          return 'The cave-air draft is cold enough to make the whole mansion above feel suddenly manufactured.';
        },
      },
    },
  });
}

export default createTunnelRoom;