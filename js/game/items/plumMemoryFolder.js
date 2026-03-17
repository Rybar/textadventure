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

        return [
          'The notes are written by someone trying to survive being edited: "If this is one of the bad mornings, your name is Plum. He keeps wiping the sentimental parts first."',
          'A later sheet reads: "Wax in one ear blunts the host-voice. Do not trust the urge to agree just because it arrives sounding reasonable."',
          'A final page has been underlined so hard it nearly tears: "Folded hall beyond the library. Black idol. Needs two answering palms, or a better trick than I have yet managed."',
        ].join(' ');
      },
    },
  });
}

export default createPlumMemoryFolder;