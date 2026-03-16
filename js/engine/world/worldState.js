export class WorldState {
  constructor(manifest) {
    this.rooms = manifest.rooms;
    this.currentRoomId = manifest.startingRoomId;
    this.inventory = [...(manifest.startingInventory ?? [])];
    this.metaGame = manifest.metaGame ?? {
      startupMessageId: null,
      messages: {},
    };
    this.flags = manifest.flags ? { ...manifest.flags } : {};
    this.turns = 0;
  }

  getCurrentRoom() {
    return this.rooms[this.currentRoomId];
  }

  incrementTurn() {
    this.turns += 1;
  }

  getMetaMessage(messageId) {
    return this.metaGame.messages?.[messageId] ?? null;
  }

  getStartupMetaMessage() {
    if (!this.metaGame.startupMessageId) {
      return null;
    }

    return this.getMetaMessage(this.metaGame.startupMessageId);
  }

  getFlag(flagName) {
    return this.flags[flagName];
  }

  setFlag(flagName, value) {
    this.flags[flagName] = value;
  }

  findInventoryItem(itemName) {
    return this.inventory.find(item => item.matchesName(itemName));
  }

  findVisibleItem(itemName) {
    return this.getCurrentRoom().findItem(itemName) ?? this.findInventoryItem(itemName);
  }

  takeItem(itemName) {
    const currentRoom = this.getCurrentRoom();
    const item = currentRoom.findItem(itemName);

    if (!item) {
      return `There is no ${itemName} here to take.`;
    }

    if (!item.portable) {
      return `You can't take the ${item.name}.`;
    }

    currentRoom.removeItem(itemName);
    this.inventory.push(item);
    return `You take the ${item.name}.`;
  }

  dropItem(itemName) {
    const itemIndex = this.inventory.findIndex(item => item.matchesName(itemName));
    if (itemIndex === -1) {
      return `You don't have a ${itemName}.`;
    }

    const [item] = this.inventory.splice(itemIndex, 1);
    this.getCurrentRoom().addItem(item);
    return `You drop the ${item.name}.`;
  }

  move(direction) {
    const currentRoom = this.getCurrentRoom();
    const nextRoomId = currentRoom.getExit(direction);

    if (!nextRoomId || !this.rooms[nextRoomId]) {
      return null;
    }

    this.currentRoomId = nextRoomId;
    return this.getCurrentRoom();
  }

  removeVisibleItem(itemName) {
    const inventoryItem = this.findInventoryItem(itemName);
    if (inventoryItem) {
      this.inventory = this.inventory.filter(item => item !== inventoryItem);
      return inventoryItem;
    }

    return this.getCurrentRoom().removeItem(itemName);
  }

  describeCurrentRoom() {
    const currentRoom = this.getCurrentRoom();
    let description = currentRoom.describe();

    const stateDescriptions = currentRoom.items
      .map(item => item.stateDescription)
      .filter(Boolean)
      .join(' ');

    if (stateDescriptions) {
      description += `\n${stateDescriptions}\n`;
    }

    if (currentRoom.items.length > 0) {
      description += `\nYou can see the following items: ${currentRoom.items.map(item => item.name).join(', ')}.\n`;
    } else {
      description += ' There are no items to see here.\n';
    }

    description += ` ${currentRoom.listExits()}`;
    return description;
  }

  describeObject(itemName) {
    const currentRoom = this.getCurrentRoom();

    if (currentRoom.objects?.[itemName]) {
      return currentRoom.objects[itemName];
    }

    const item = this.findVisibleItem(itemName);
    if (!item) {
      return `There is no ${itemName} to look at here.`;
    }

    return item.description;
  }

  listInventory() {
    if (this.inventory.length === 0) {
      return 'Your inventory is empty.';
    }

    return `You have: ${this.inventory.map(item => item.name).join(', ')}.`;
  }
}

export default WorldState;