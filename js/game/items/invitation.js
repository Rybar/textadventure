import { Item } from '../../engine/models/item.js';

export function createInvitation() {
  return new Item({
    id: 'invitation',
    name: 'invitation',
    aliases: ['letter', 'dinner invitation'],
    description: 'A heavy cream invitation stamped with a black wax seal and written in a hand so elegant it feels insulting.',
    actions: {
      read() {
        return `"Grandfather Oshregaal requests the immense pleasure of your company at supper beneath the earth, where all refined appetites may be satisfied." A final line, written later in a different ink, reads: "Bring stories. Bring nerve."`;
      },
    },
  });
}

export default createInvitation;