import { Item } from '../../engine/models/item.js';

export function createGreyGrinBlade() {
  return new Item({
    id: 'grey-grin-blade',
    name: 'Grey Grin Blade',
    aliases: ['blade', 'grey grin', 'sword'],
    description: 'A long pale blade with a smile-thin curve and a grip wrapped in grey leather gone smooth with old violence.',
    actions: {
      look() {
        return 'The Grey Grin Blade looks ceremonial until you notice how perfectly it balances in the hand. A faint etched grin runs near the fuller, decorative only if one has never met a tyrant with taste.';
      },
      use({ currentRoom, getFlag, setFlag, indirectTarget, command }) {
        const targetName = String(command?.indirectObject ?? '').toLowerCase();
        const targetId = indirectTarget?.id ?? null;

        if (currentRoom?.id === 'feastHall' && (targetId === 'oshregaal' || targetName.includes('oshregaal') || targetName.includes('grandfather') || targetName.includes('host'))) {
          setFlag('metOshregaal', true);
          setFlag('greyGrinShownToOshregaal', true);

          if (getFlag('oshregaalWounded')) {
            return 'Oshregaal is already bleeding, roaring, and discovering that dinner has become a far less controllable art form than he prefers.';
          }

          if (!getFlag('waxPlugReadied')) {
            return 'You start the motion and Oshregaal says, very softly, "Sit." The word lands in your bones hard enough to blur intent into hesitation. Without something to blunt his obedience-voice, you are not ready to make murder thinkable.';
          }

          if (!getFlag('blackWindTreeSabotaged') && !getFlag('oshregaalWeaknessKnown')) {
            return 'The Grey Grin feels magnificent in your hand, but magnificence is not timing. Without a clearer sense of Oshregaal\'s weakness or a deeper wound already opened elsewhere in the house, the strike would be theater rather than strategy.';
          }

          setFlag('oshregaalAssassinationAttempted', true);
          setFlag('oshregaalWounded', true);
          setFlag('insultedOshregaal', true);
          return 'You move before the table can finish becoming a witness. With the wax deadening the command in Oshregaal\'s voice and the house already wounded at its roots or vanity, the Grey Grin lands across him in one appalling silver argument. He does not die cleanly, but he does bleed, bellow, and lose the room. Guests lurch upright, servants break formation, and dinner finally becomes the riot it was always rehearsing. You have attempted to kill Oshregaal and carved yourself a violent margin of escape.';
        }

        if (currentRoom?.id === 'blackWindTreeChamber' && (targetId === 'spine' || targetName.includes('spine') || targetName.includes('book'))) {
          if (getFlag('blackWindTreeSabotaged')) {
            return 'The Grey Grin has already done its work here. The spine is split and the roots are panicking around the wound.';
          }

          if (!getFlag('blackWindTreeCalmed')) {
            return 'The chamber\'s bitter draft keeps the root-book seam in restless motion. You need a calmer line on the cut before committing the blade.';
          }

          setFlag('blackWindTreeSabotaged', true);
          setFlag('blackWindSourceLeadKnown', true);
          return 'You drive the Grey Grin Blade into the buried spine where root and text have fused. The cut lands with horrible correctness. Dark sap bursts into the channels, the trunk convulses, and the whole chamber answers with the sound of an enterprise being wounded at its idea rather than its inventory. You have sabotaged the black-wind source.';
        }

        return 'You test the blade\'s balance once and decide not to rehearse murder in the middle of a stolen museum.';
      },
    },
  });
}

export default createGreyGrinBlade;