import { Item } from '../../engine/models/item.js';

export function createBlackWindRootSample() {
  return new Item({
    id: 'black-wind-root-sample',
    name: 'black wind root sample',
    aliases: ['root sample', 'sample', 'cambium sample'],
    description: 'A thumb-thick sliver cut from the black-wind tree, its grain veined with lacquer-dark sap that never quite stops shining.',
    actions: {
      smell() {
        return 'The sample smells like wet bark, ink, and medicine left too long in a locked drawer.';
      },
      look() {
        return 'Up close, the root sample looks less grown than argued into shape. Dark sap clings to the cut surface as if the wood still objects to being separated from the tree.';
      },
    },
  });
}

export default createBlackWindRootSample;