export class WorldState {
  constructor(manifest) {
    this.manifestId = manifest.id ?? null;
    this.rooms = manifest.rooms;
    this.currentRoomId = manifest.startingRoomId;
    this.inventory = [...(manifest.startingInventory ?? [])];
    this.metaGame = manifest.metaGame ?? {
      startupMessageId: null,
      messages: {},
    };
    this.flags = manifest.flags ? { ...manifest.flags } : {};
    this.turns = 0;
    this.roomVisits = {};
    this.outputBuffer = [];
    this.itemIndex = this.buildItemIndex();
  }

  getCurrentRoom() {
    return this.rooms[this.currentRoomId];
  }

  incrementTurn() {
    this.turns += 1;
  }

  buildItemIndex() {
    const entries = {};

    this.inventory.forEach(item => {
      entries[item.id] = item;
    });

    Object.values(this.rooms).forEach(room => {
      room.items.forEach(item => {
        entries[item.id] = item;
      });
    });

    return entries;
  }

  createContext(additionalContext = {}) {
    const currentRoom = additionalContext.currentRoom ?? this.getCurrentRoom();
    const visitCount = currentRoom ? (this.roomVisits[currentRoom.id] ?? 0) : 0;
    const worldState = this;

    return {
      worldState,
      currentRoom,
      inventory: worldState.inventory,
      turns: worldState.turns,
      visitCount,
      isFirstVisit: visitCount <= 1,
      getFlag(flagName) {
        return worldState.getFlag(flagName);
      },
      setFlag(flagName, value) {
        worldState.setFlag(flagName, value);
      },
      movePlayer(roomId) {
        return worldState.movePlayer(roomId);
      },
      moveItem(itemId, destination) {
        return worldState.moveItem(itemId, destination);
      },
      unlockExit(roomId, direction, targetRoomId) {
        return worldState.unlockExit(roomId, direction, targetRoomId);
      },
      print(text) {
        worldState.print(text);
      },
      ...additionalContext,
    };
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

  print(text) {
    if (!text) {
      return;
    }

    this.outputBuffer.push(String(text));
  }

  flushPrintedOutput() {
    const output = [...this.outputBuffer];
    this.outputBuffer = [];
    return output;
  }

  getRoomVisitCount(roomId) {
    return this.roomVisits[roomId] ?? 0;
  }

  markCurrentRoomVisited() {
    const roomId = this.currentRoomId;
    this.roomVisits[roomId] = this.getRoomVisitCount(roomId) + 1;
    return this.roomVisits[roomId];
  }

  getItemById(itemId) {
    return this.itemIndex[itemId] ?? null;
  }

  getItemLocation(itemId) {
    const inventoryItem = this.inventory.find(item => item.id === itemId);
    if (inventoryItem) {
      return {
        type: 'inventory',
      };
    }

    for (const room of Object.values(this.rooms)) {
      if (room.items.some(item => item.id === itemId)) {
        return {
          type: 'room',
          roomId: room.id,
        };
      }
    }

    return null;
  }

  removeItemById(itemId) {
    const inventoryIndex = this.inventory.findIndex(item => item.id === itemId);
    if (inventoryIndex >= 0) {
      const [item] = this.inventory.splice(inventoryIndex, 1);
      return item;
    }

    for (const room of Object.values(this.rooms)) {
      const roomItemIndex = room.items.findIndex(item => item.id === itemId);
      if (roomItemIndex >= 0) {
        const [item] = room.items.splice(roomItemIndex, 1);
        return item;
      }
    }

    return null;
  }

  movePlayer(roomId) {
    if (!this.rooms[roomId]) {
      return null;
    }

    this.currentRoomId = roomId;
    return this.getCurrentRoom();
  }

  moveItem(itemId, destination) {
    const item = this.getItemById(itemId);
    if (!item) {
      return null;
    }

    this.removeItemById(itemId);

    if (destination === 'inventory') {
      this.inventory.push(item);
      return item;
    }

    const roomId = typeof destination === 'string'
      ? destination
      : destination?.roomId;

    if (roomId && this.rooms[roomId]) {
      this.rooms[roomId].addItem(item);
      return item;
    }

    return null;
  }

  unlockExit(roomId, direction, targetRoomId) {
    const room = this.rooms[roomId];
    if (!room || !direction || !targetRoomId || !this.rooms[targetRoomId]) {
      return false;
    }

    room.setExit(direction, targetRoomId);
    return true;
  }

  findInventoryItem(itemName) {
    return this.inventory.find(item => item.matchesName(itemName));
  }

  findVisibleItem(itemName) {
    return this.getCurrentRoom().findItem(itemName) ?? this.findInventoryItem(itemName);
  }

  findVisibleObject(objectName) {
    return this.getCurrentRoom().findObject(objectName);
  }

  findInteractiveTarget(targetName) {
    const objectTarget = this.findVisibleObject(targetName);
    if (objectTarget) {
      return {
        type: 'object',
        target: objectTarget,
      };
    }

    const itemTarget = this.findVisibleItem(targetName);
    if (itemTarget) {
      return {
        type: 'item',
        target: itemTarget,
      };
    }

    return null;
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

  enterCurrentRoom() {
    const currentRoom = this.getCurrentRoom();
    const visitCount = this.markCurrentRoomVisited();
    const context = this.createContext({
      currentRoom,
      visitCount,
      isFirstVisit: visitCount === 1,
    });
    const hookText = currentRoom.runHook('onEnter', context);
    const description = this.describeCurrentRoom(context);
    const printedOutput = this.flushPrintedOutput();

    return [...printedOutput, ...hookText, description].filter(Boolean).join('\n\n');
  }

  lookAroundCurrentRoom() {
    const currentRoom = this.getCurrentRoom();
    const context = this.createContext({
      currentRoom,
      isFirstVisit: this.getRoomVisitCount(currentRoom.id) <= 1,
    });
    const hookText = currentRoom.runHook('onLook', context);
    const description = this.describeCurrentRoom(context);
    const printedOutput = this.flushPrintedOutput();

    return [...printedOutput, ...hookText, description].filter(Boolean).join('\n\n');
  }

  removeVisibleItem(itemName) {
    const inventoryItem = this.findInventoryItem(itemName);
    if (inventoryItem) {
      this.inventory = this.inventory.filter(item => item !== inventoryItem);
      return inventoryItem;
    }

    return this.getCurrentRoom().removeItem(itemName);
  }

  describeCurrentRoom(context = this.createContext()) {
    const currentRoom = context.currentRoom ?? this.getCurrentRoom();
    let description = currentRoom.describe(context);

    const conditionalDescriptions = currentRoom.getConditionalDescriptions(context).join(' ');
    if (conditionalDescriptions) {
      description += `\n${conditionalDescriptions}`;
    }

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
    const context = this.createContext({ currentRoom });

    const visibleObject = currentRoom.findObject(itemName);
    if (visibleObject) {
      return typeof visibleObject.description === 'function'
        ? visibleObject.description(context)
        : visibleObject.description;
    }

    const item = this.findVisibleItem(itemName);
    if (!item) {
      return `There is no ${itemName} to look at here.`;
    }

    if (item.hasAction('look')) {
      return item.performAction('look', {
        ...context,
        item,
      });
    }

    return item.description;
  }

  listInventory() {
    if (this.inventory.length === 0) {
      return 'Your inventory is empty.';
    }

    return `You have: ${this.inventory.map(item => item.name).join(', ')}.`;
  }

  exportSaveData() {
    return {
      version: 1,
      manifestId: this.manifestId,
      currentRoomId: this.currentRoomId,
      flags: { ...this.flags },
      turns: this.turns,
      roomVisits: { ...this.roomVisits },
      items: Object.values(this.itemIndex).map(item => ({
        id: item.id,
        location: this.getItemLocation(item.id),
        state: item.serializeState(),
      })),
    };
  }

  importSaveData(saveData = {}) {
    if (saveData.version !== 1) {
      throw new Error('Unsupported save version.');
    }

    if (saveData.manifestId && this.manifestId && saveData.manifestId !== this.manifestId) {
      throw new Error('Save file does not match the current game manifest.');
    }

    this.currentRoomId = this.rooms[saveData.currentRoomId]
      ? saveData.currentRoomId
      : this.currentRoomId;
    this.flags = saveData.flags ? { ...this.flags, ...saveData.flags } : { ...this.flags };
    this.turns = Number.isFinite(saveData.turns) ? saveData.turns : 0;
    this.roomVisits = saveData.roomVisits ? { ...saveData.roomVisits } : {};
    this.outputBuffer = [];
    this.inventory = [];
    Object.values(this.rooms).forEach(room => {
      room.items = [];
    });

    (saveData.items ?? []).forEach(entry => {
      const item = this.getItemById(entry.id);
      if (!item) {
        return;
      }

      item.applyState(entry.state);

      if (entry.location?.type === 'inventory') {
        this.inventory.push(item);
        return;
      }

      if (entry.location?.type === 'room' && entry.location.roomId && this.rooms[entry.location.roomId]) {
        this.rooms[entry.location.roomId].addItem(item);
      }
    });
  }
}

export default WorldState;