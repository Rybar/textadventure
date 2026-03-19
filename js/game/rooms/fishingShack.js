import { Item } from '../../engine/models/item.js';
import { Room } from '../../engine/models/room.js';

export function createFishingShackRoom() {
  const servantRota = new Item({
    id: 'servant-rota',
    name: 'servant rota',
    aliases: ['rota', 'duty rota', 'schedule'],
    description: 'A grease-penciled rota card clipped to the shack wall with kitchen-clean practicality.',
    portable: false,
    actions: {
      read({ getFlag, setFlag }) {
        if (!getFlag('eastRunoffNoted')) {
          setFlag('eastRunoffNoted', true);
        }

        if (!getFlag('pitRouteHintKnown')) {
          setFlag('pitRouteHintKnown', true);
        }

        return 'The rota lists bait checks, runoff scraping, and one line marked EAST STAIR RUNOFF BEFORE DINNER. Whatever lies below the ceremonial stairs, the servants treat it as maintenance rather than mystery.';
      },
    },
  });

  const sharkVial = new Item({
    id: 'shark-polymorph-vial',
    name: 'shark polymorph vial',
    aliases: ['polymorph vial', 'shark vial', 'vial'],
    description: 'A stoppered vial of grey-blue liquid labeled in blunt kitchen shorthand: SHARK, SHORT TERM, DO NOT PANIC INDOORS.',
    actions: {
      smell() {
        return 'The vial smells of brine, copper, and a confidence no sane person should want in liquid form.';
      },
      drink() {
        return 'You decide against becoming a shark in or near a cave attached to Oshregaal\'s house. Restraint, too, is a kind of survival skill.';
      },
    },
  });

  const weightedLine = new Item({
    id: 'weighted-line',
    name: 'weighted line',
    aliases: ['line', 'hook line', 'fishing line'],
    description: 'A waxed retrieval line fitted with heavy sinkers and a cruelly practical hook.',
    actions: {
      look() {
        return 'The line is built for dragging difficult things out of wet places without volunteering a whole arm.';
      },
    },
  });

  return new Room({
    id: 'fishingShack',
    title: 'Fishing Shack',
    description: `
A low fishing shack squats against the cavern wall like a practical embarrassment the mansion would rather not admit to owning. Brine, lamp oil, and old blood hang in the air with the honest vulgarity of work.
Nets, bait jars, and servant-marked lockers crowd the walls. East, the feral garden presses back toward the formal approach.
`.trim(),
    exits: {
      east: 'fernGarden',
    },
    verbs: {
      search({ command, getFlag, setFlag }) {
        const target = command.directObject;

        if (!target || target.includes('shack') || target.includes('room') || target.includes('locker') || target.includes('shelf')) {
          if (!getFlag('shackSearched')) {
            setFlag('shackSearched', true);
          }

          if (!getFlag('eastRunoffNoted')) {
            setFlag('eastRunoffNoted', true);
          }

          if (!getFlag('pitRouteHintKnown')) {
            setFlag('pitRouteHintKnown', true);
          }

          return 'You search the shack and find clipped duty tags, bait hooks, and a grease-penciled servant rota noting east stair runoff checks before dinner. The household clearly services a dirtier lower route than the front door fiction admits, and does so on schedule.';
        }

        if (target.includes('jar') || target.includes('bait') || target.includes('shelf')) {
          return 'One bait jar smells of fish and cave-salt; another carries the sweeter medicinal rot of the house\'s stranger alchemical habits. Whatever feeds the feast also leaks into the workspaces and gets handled by hands too busy to mythologize it.';
        }

        if (target.includes('boat') || target.includes('skiff') || target.includes('nets')) {
          return 'The skiff and nets have seen real labor, not decorative sport. The servants fish, drag, and retrieve whatever the cavern or the house happens to cough up, which is an unflattering category for both.';
        }

        return `You search the ${target} and come away with splinters, salt, and stronger suspicions about how the house disposes of its practical needs.`;
      },
    },
    items: [servantRota, sharkVial, weightedLine],
    conditionalDescriptions: [
      {
        when: ({ getFlag }) => getFlag('eastRunoffNoted'),
        text: 'Now that you have seen the rota, the shack reads less like a hobby shed and more like the mouth of a servant logistics network running below the house\'s manners and tidying up after them.',
      },
    ],
    objects: {
      nets: 'The cave-nets are stiff with mineral salt and old scales. They were built for ugly catches and heavier retrieval than dinner alone would require, and repaired without sentiment.',
      locker: 'The locker doors are carved with initials, tally marks, and one scratched warning about checking runoff before the upstairs guests start pretending to enjoy themselves.',
      skiff: 'A flat-bottomed skiff rests half-dragged onto the stone, practical enough to suggest real work in the underground water beyond the light and too plain to flatter anyone about it.',
      jars: 'The jars hold bait, hooks, and a few stoppers of chemical nonsense labeled in the same hand that probably salts the fish and scrubs the runoff.',
      block: 'The gutting block is stained almost black. It has never been asked to look ceremonial.',
    },
  });
}

export default createFishingShackRoom;