import { Item } from '../../engine/models/item.js';

export function createPlumMemoryFolder() {
  return new Item({
    id: 'plum-memory-folder',
    name: 'memory folder',
    aliases: ['folder', 'notes', 'memory notes', 'plum folder'],
    description: 'A stitched paper folder packed with neat self-addressed notes, cross-outs, emergency reminders, and dates corrected in more than one ink.',
    actions: {
      read({ getFlag, setFlag }) {
        if (!getFlag('plumMemoryRead')) {
          setFlag('plumMemoryRead', true);
        }

        if (!getFlag('plumNatureUnderstood')) {
          setFlag('plumNatureUnderstood', true);
        }

        if (!getFlag('plumBladeKnown')) {
          setFlag('plumBladeKnown', true);
        }

        return [
          'The notes are written by someone trying to survive being edited: "If this is one of the bad mornings, your name is Plum. He keeps wiping the sentimental parts first."',
          'A page tucked deeper in the folder has been corrected so often the paper feels fibrous: "You are Numerian, not one of his improvized daughters. Silvermount keeps surfacing in the static. If you forget again, trust the machine before you trust the story told about it."',
          'A later sheet reads: "Wax in one ear blunts the host-voice. Do not trust the urge to agree just because it arrives sounding reasonable."',
          'Another note has been folded around itself three times: "Left forearm seam. Crystal blade still nested unless he found it. If the lamp is turned up and the edge is angled right, the old etching returns."',
          'A final page has been underlined so hard it nearly tears: "Folded hall beyond the library. Black idol. Needs two answering palms, or a better trick than I have yet managed."',
        ].join(' ');
      },
    },
  });
}

export default createPlumMemoryFolder;