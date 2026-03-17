export class WorldState {
  constructor(manifest) {
    this.manifestId = manifest.id ?? null;
    this.title = manifest.title ?? 'Unknown Game';
    this.rooms = manifest.rooms;
    this.startingRoomId = manifest.startingRoomId;
    this.currentRoomId = manifest.startingRoomId;
    this.inventory = [...(manifest.startingInventory ?? [])];
    this.metaGame = manifest.metaGame ?? {
      startupMessageId: null,
      messages: {},
    };
    this.flags = manifest.flags ? { ...manifest.flags } : {};
    this.panelDefinitions = this.createPanelDefinitions(manifest.ui?.panels);
    this.panelState = this.createDefaultPanelState();
    this.turns = 0;
    this.roomVisits = {};
    this.outputBuffer = [];
    this.itemIndex = this.buildItemIndex();
    this.metaState = this.createDefaultMetaState();
    this.pendingMetaMessages = [];
  }

  createPanelDefinitions(panelConfig = {}) {
    const defaults = {
      map: {
        title: 'MAP',
        lockedLines: ['Spatial overlay unavailable.', 'Awaiting unauthorized route.'],
      },
      inventory: {
        title: 'INVENTORY',
        lockedLines: ['Retention overlay unavailable.', 'Inventory remains manual.'],
      },
      memory: {
        title: 'MEMORY',
        lockedLines: ['Address bus dark.', 'No readable slots exposed.'],
      },
    };

    return Object.fromEntries(
      Object.entries(defaults).map(([panelId, definition]) => {
        const customDefinition = panelConfig?.[panelId];

        return [
          panelId,
          {
            id: panelId,
            ...definition,
            ...customDefinition,
          },
        ];
      }),
    );
  }

  createDefaultPanelState() {
    return Object.fromEntries(
      Object.values(this.panelDefinitions).map(panel => [panel.id, {
        unlocked: Boolean(panel.unlocked),
        degraded: panel.degraded ?? null,
      }]),
    );
  }

  static get MAP_DIRECTION_VECTORS() {
    return {
      north: { x: 0, y: -1 },
      south: { x: 0, y: 1 },
      east: { x: 1, y: 0 },
      west: { x: -1, y: 0 },
      northeast: { x: 1, y: -1 },
      northwest: { x: -1, y: -1 },
      southeast: { x: 1, y: 1 },
      southwest: { x: -1, y: 1 },
      up: { x: 0, y: -2 },
      down: { x: 0, y: 2 },
    };
  }

  normalizePanelState(panelState = {}) {
    const nextState = this.createDefaultPanelState();

    Object.entries(panelState).forEach(([panelId, state]) => {
      if (!nextState[panelId]) {
        return;
      }

      nextState[panelId] = {
        unlocked: Boolean(state?.unlocked),
        degraded: state?.degraded ?? null,
      };
    });

    return nextState;
  }

  createDefaultMetaState() {
    return {
      shownConversationIds: [],
      shownHackerIds: [],
      shownReactiveLackeyIds: [],
    };
  }

  getScheduledEntryId(entry, prefix, index) {
    return entry.id ?? `${prefix}-${index}`;
  }

  getHackerScheduleEntries() {
    const hackerMessages = this.metaGame.schedule?.hackerMessages;
    if (Array.isArray(hackerMessages)) {
      return hackerMessages;
    }

    const legacyInterruptions = this.metaGame.schedule?.hackerInterruptions;
    if (!legacyInterruptions?.messageIds?.length) {
      return [];
    }

    const { startTurn = Infinity, interval = 1, messageIds = [] } = legacyInterruptions;
    return messageIds.map((messageId, index) => ({
      id: `hacker-message-${index + 1}`,
      messageId,
      when: {
        minTurn: startTurn + (interval * index),
      },
    }));
  }

  normalizeMetaState(metaState = {}) {
    if (
      Array.isArray(metaState.shownConversationIds)
      || Array.isArray(metaState.shownHackerIds)
      || Array.isArray(metaState.shownReactiveLackeyIds)
    ) {
      return {
        shownConversationIds: Array.isArray(metaState.shownConversationIds)
          ? [...metaState.shownConversationIds]
          : [],
        shownHackerIds: Array.isArray(metaState.shownHackerIds)
          ? [...metaState.shownHackerIds]
          : [],
        shownReactiveLackeyIds: Array.isArray(metaState.shownReactiveLackeyIds)
          ? [...metaState.shownReactiveLackeyIds]
          : [],
      };
    }

    const conversationEntries = this.metaGame.schedule?.lackeyConversations ?? [];
    const hackerEntries = this.getHackerScheduleEntries();
    const shownConversationCount = metaState.lackeyConversationIndex ?? 0;
    const shownHackerCount = metaState.hackerMessageIndex ?? 0;

    return {
      shownConversationIds: conversationEntries
        .slice(0, shownConversationCount)
        .map((entry, index) => this.getScheduledEntryId(entry, 'lackey-conversation', index)),
      shownHackerIds: hackerEntries
        .slice(0, shownHackerCount)
        .map((entry, index) => this.getScheduledEntryId(entry, 'hacker-message', index)),
      shownReactiveLackeyIds: [],
    };
  }

  hasSeenLackeyConversation() {
    return this.metaState.shownConversationIds.length > 0;
  }

  getShownLackeyConversationEntries() {
    const shownIds = new Set(this.metaState.shownConversationIds);

    return (this.metaGame.schedule?.lackeyConversations ?? []).filter((entry, index) => {
      return shownIds.has(this.getScheduledEntryId(entry, 'lackey-conversation', index));
    });
  }

  getShownLackeyLexicon() {
    const stopWords = new Set([
      'l1',
      'l2',
      'that',
      'this',
      'they',
      'them',
      'with',
      'until',
      'forms',
      'remain',
      'later',
      'need',
      'rush',
      'host',
      'contact',
      'clean',
      'exit',
      'acceptable',
      'improves',
    ]);
    const tokens = new Set();

    this.getShownLackeyConversationEntries().forEach(entry => {
      [entry.leftMessageId, entry.rightMessageId].forEach(messageId => {
        const message = this.getMetaMessage(messageId);
        const normalizedText = String(message?.text ?? '').toLowerCase().replaceAll(/[^a-z0-9 ]+/g, ' ');

        normalizedText
          .split(' ')
          .map(token => token.trim())
          .filter(token => token.length >= 6 && !stopWords.has(token))
          .forEach(token => tokens.add(token));
      });
    });

    return [...tokens];
  }

  triggerReactiveLackeyConversation(conversationId) {
    if (!this.hasSeenLackeyConversation()) {
      return [];
    }

    if (this.metaState.shownReactiveLackeyIds.includes(conversationId)) {
      return [];
    }

    const conversation = this.metaGame.reactiveLackeyConversations?.[conversationId];
    if (!conversation) {
      return [];
    }

    const leftMessage = this.getMetaMessage(conversation.leftMessageId);
    const rightMessage = this.getMetaMessage(conversation.rightMessageId);
    const nextMessages = [
      leftMessage ? { ...leftMessage, placement: 'side-left', delayMs: 0 } : null,
      rightMessage ? { ...rightMessage, placement: 'side-right', delayMs: 3600 } : null,
    ].filter(Boolean);

    if (nextMessages.length === 0) {
      return [];
    }

    this.metaState.shownReactiveLackeyIds = [
      ...this.metaState.shownReactiveLackeyIds,
      conversationId,
    ];

    this.queueMetaMessages(nextMessages);
    return nextMessages;
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

    return {
      worldState: this,
      currentRoom,
      inventory: this.inventory,
      turns: this.turns,
      visitCount,
      isFirstVisit: visitCount <= 1,
      getFlag: flagName => this.getFlag(flagName),
      setFlag: (flagName, value) => this.setFlag(flagName, value),
      movePlayer: roomId => this.movePlayer(roomId),
      moveItem: (itemId, destination) => this.moveItem(itemId, destination),
      unlockExit: (roomId, direction, targetRoomId) => this.unlockExit(roomId, direction, targetRoomId),
      unlockPanel: panelId => this.unlockPanel(panelId),
      degradePanel: (panelId, mode) => this.degradePanel(panelId, mode),
      print: text => this.print(text),
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

  getPanelState(panelId) {
    return this.panelState[panelId] ?? null;
  }

  isPanelUnlocked(panelId) {
    return Boolean(this.getPanelState(panelId)?.unlocked);
  }

  unlockPanel(panelId) {
    if (!this.panelState[panelId]) {
      return false;
    }

    this.panelState[panelId] = {
      ...this.panelState[panelId],
      unlocked: true,
    };
    return true;
  }

  lockPanel(panelId) {
    if (!this.panelState[panelId]) {
      return false;
    }

    this.panelState[panelId] = {
      ...this.panelState[panelId],
      unlocked: false,
    };
    return true;
  }

  togglePanel(panelId) {
    if (!this.panelState[panelId]) {
      return false;
    }

    return this.panelState[panelId].unlocked
      ? this.lockPanel(panelId)
      : this.unlockPanel(panelId);
  }

  degradePanel(panelId, mode = 'static') {
    if (!this.panelState[panelId]) {
      return false;
    }

    this.panelState[panelId] = {
      ...this.panelState[panelId],
      degraded: mode,
    };
    return true;
  }

  clearPanelDegradation(panelId) {
    if (!this.panelState[panelId]) {
      return false;
    }

    this.panelState[panelId] = {
      ...this.panelState[panelId],
      degraded: null,
    };
    return true;
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

  queueMetaMessages(messages = []) {
    this.pendingMetaMessages.push(...messages.filter(Boolean));
  }

  consumePendingMetaMessages() {
    const messages = [...this.pendingMetaMessages];
    this.pendingMetaMessages = [];
    return messages;
  }

  isMetaConditionSatisfied(when = {}, { force = false } = {}) {
    if (force) {
      return true;
    }

    const {
      minTurn = 0,
      allFlags = [],
      anyFlags = [],
      notFlags = [],
    } = when;

    if (this.turns < minTurn) {
      return false;
    }

    if (allFlags.some(flagName => !this.getFlag(flagName))) {
      return false;
    }

    if (anyFlags.length > 0 && !anyFlags.some(flagName => this.getFlag(flagName))) {
      return false;
    }

    if (notFlags.some(flagName => this.getFlag(flagName))) {
      return false;
    }

    return true;
  }

  findNextMetaEntry(entries, shownIds, prefix, options = {}) {
    for (const [index, entry] of entries.entries()) {
      const entryId = this.getScheduledEntryId(entry, prefix, index);
      if (shownIds.includes(entryId)) {
        continue;
      }

      if (!this.isMetaConditionSatisfied(entry.when, options)) {
        continue;
      }

      return {
        entry,
        entryId,
      };
    }

    return null;
  }

  buildNextMetaMessages({ force = false } = {}) {
    const nextMessages = [];
    const lackeyConversations = this.metaGame.schedule?.lackeyConversations ?? [];
    const nextConversation = this.findNextMetaEntry(
      lackeyConversations,
      this.metaState.shownConversationIds,
      'lackey-conversation',
      { force },
    );

    if (nextConversation) {
      const { entry, entryId } = nextConversation;
      const leftMessage = this.getMetaMessage(entry.leftMessageId);
      const rightMessage = this.getMetaMessage(entry.rightMessageId);

      nextMessages.push(
        leftMessage ? { ...leftMessage, placement: 'side-left', delayMs: 0 } : null,
        rightMessage ? { ...rightMessage, placement: 'side-right', delayMs: entry.rightDelayMs ?? 4200 } : null,
      );

      this.metaState.shownConversationIds = [
        ...this.metaState.shownConversationIds,
        entryId,
      ];
    }

    const hackerEntries = this.getHackerScheduleEntries();
    if (hackerEntries.length > 0 && nextMessages.length === 0) {
      const nextHackerEntry = this.findNextMetaEntry(
        hackerEntries,
        this.metaState.shownHackerIds,
        'hacker-message',
        { force },
      );

      if (nextHackerEntry) {
        const { entry, entryId } = nextHackerEntry;
        const hackerMessage = this.getMetaMessage(entry.messageId);
        if (hackerMessage) {
          nextMessages.push({
            ...hackerMessage,
            placement: entry.placement ?? 'lower-random',
            delayMs: entry.delayMs ?? 0,
          });
        }

        this.metaState.shownHackerIds = [
          ...this.metaState.shownHackerIds,
          entryId,
        ];
      }
    }

    return nextMessages;
  }

  advanceMetaMessages() {
    const nextMessages = this.buildNextMetaMessages();

    this.queueMetaMessages(nextMessages);
    return nextMessages;
  }

  forceNextMetaMessages() {
    const nextMessages = this.buildNextMetaMessages({ force: true });
    const minimumDelay = nextMessages.reduce((lowestDelay, message) => {
      const nextDelay = message?.delayMs ?? 0;
      return Math.min(lowestDelay, nextDelay);
    }, Infinity);
    const normalizedDelay = Number.isFinite(minimumDelay) ? minimumDelay : 0;

    const previewMessages = nextMessages.map(message => ({
      ...message,
      delayMs: Math.max(0, (message.delayMs ?? 0) - normalizedDelay),
    }));

    this.queueMetaMessages(previewMessages);
    return previewMessages;
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

  tryMove(direction) {
    const currentRoom = this.getCurrentRoom();
    const blockedReason = currentRoom.checkExit(direction, this.createContext({ currentRoom }));
    if (blockedReason) {
      return {
        success: false,
        message: blockedReason,
        room: null,
      };
    }

    const nextRoom = this.move(direction);
    if (!nextRoom) {
      return {
        success: false,
        message: 'There is no exit in that direction.',
        room: null,
      };
    }

    return {
      success: true,
      message: null,
      room: nextRoom,
    };
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

  getDiscoveredRooms() {
    return Object.values(this.rooms).filter(room => this.getRoomVisitCount(room.id) > 0);
  }

  getMapAnchorRoomId(roomIds) {
    if (roomIds.includes(this.startingRoomId) && this.rooms[this.startingRoomId]) {
      return this.startingRoomId;
    }

    if (roomIds.includes(this.currentRoomId)) {
      return this.currentRoomId;
    }

    return roomIds[0] ?? null;
  }

  getRoomMapToken(room) {
    const title = room?.title ?? room?.id ?? '';
    const words = title
      .replaceAll(/[^A-Za-z0-9 ]+/g, ' ')
      .split(' ')
      .map(word => word.trim())
      .filter(Boolean);

    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }

    const compact = title.replaceAll(/[^A-Za-z0-9]+/g, '').toUpperCase();
    return compact.slice(0, 2).padEnd(2, ' ');
  }

  buildDiscoveredMapCoordinates() {
    const discoveredRooms = this.getDiscoveredRooms();
    const roomIds = discoveredRooms.map(room => room.id);

    if (roomIds.length === 0) {
      return {};
    }

    const anchorRoomId = this.getMapAnchorRoomId(roomIds);
    const allowedRoomIds = new Set(roomIds);
    const coordinates = {
      [anchorRoomId]: { x: 0, y: 0 },
    };
    const occupied = new Map([['0,0', anchorRoomId]]);
    const queue = [anchorRoomId];

    while (queue.length > 0) {
      const roomId = queue.shift();
      const room = this.rooms[roomId];
      const baseCoordinate = coordinates[roomId];

      Object.entries(room.exits).forEach(([direction, targetRoomId]) => {
        if (!allowedRoomIds.has(targetRoomId) || coordinates[targetRoomId]) {
          return;
        }

        const vector = WorldState.MAP_DIRECTION_VECTORS[direction];
        if (!vector) {
          return;
        }

        let nextCoordinate = {
          x: baseCoordinate.x + vector.x,
          y: baseCoordinate.y + vector.y,
        };

        while (occupied.has(`${nextCoordinate.x},${nextCoordinate.y}`)) {
          nextCoordinate = {
            x: nextCoordinate.x + 2,
            y: nextCoordinate.y,
          };
        }

        coordinates[targetRoomId] = nextCoordinate;
        occupied.set(`${nextCoordinate.x},${nextCoordinate.y}`, targetRoomId);
        queue.push(targetRoomId);
      });
    }

    let detachedColumn = Math.max(...Object.values(coordinates).map(coordinate => coordinate.x), 0) + 2;
    roomIds.forEach(roomId => {
      if (coordinates[roomId]) {
        return;
      }

      coordinates[roomId] = { x: detachedColumn, y: 0 };
      detachedColumn += 2;
    });

    return coordinates;
  }

  createCharacterGrid(width, height) {
    return new Array(height)
      .fill(null)
      .map(() => new Array(width).fill(' '));
  }

  writeCharacter(grid, x, y, character) {
    if (grid[y]?.[x] === undefined) {
      return;
    }

    const existingCharacter = grid[y][x];
    if (existingCharacter !== ' ' && existingCharacter !== character) {
      grid[y][x] = '+';
      return;
    }

    grid[y][x] = character;
  }

  writeCharacterForced(grid, x, y, character) {
    if (grid[y]?.[x] === undefined) {
      return;
    }

    grid[y][x] = character;
  }

  drawMapLine(grid, startPoint, endPoint) {
    const deltaX = endPoint.x - startPoint.x;
    const deltaY = endPoint.y - startPoint.y;
    const steps = Math.max(Math.abs(deltaX), Math.abs(deltaY));

    if (steps === 0) {
      return;
    }

    for (let step = 0; step <= steps; step += 1) {
      const x = Math.round(startPoint.x + ((deltaX * step) / steps));
      const y = Math.round(startPoint.y + ((deltaY * step) / steps));
      let character;

      if (deltaX === 0) {
        character = '|';
      } else if (deltaY === 0) {
        character = '-';
      } else if ((deltaX > 0 && deltaY > 0) || (deltaX < 0 && deltaY < 0)) {
        character = '\\';
      } else {
        character = '/';
      }

      this.writeCharacter(grid, x, y, character);
    }
  }

  drawRoomBox(grid, left, top, token) {
    const right = left + 3;
    const bottom = top + 2;

    this.writeCharacterForced(grid, left, top, '+');
    this.writeCharacterForced(grid, left + 1, top, '-');
    this.writeCharacterForced(grid, left + 2, top, '-');
    this.writeCharacterForced(grid, right, top, '+');
    this.writeCharacterForced(grid, left, top + 1, '|');
    this.writeCharacterForced(grid, left + 1, top + 1, token[0] ?? ' ');
    this.writeCharacterForced(grid, left + 2, top + 1, token[1] ?? ' ');
    this.writeCharacterForced(grid, right, top + 1, '|');
    this.writeCharacterForced(grid, left, bottom, '+');
    this.writeCharacterForced(grid, left + 1, bottom, '-');
    this.writeCharacterForced(grid, left + 2, bottom, '-');
    this.writeCharacterForced(grid, right, bottom, '+');
  }

  renderDiscoveredMapLines() {
    const coordinates = this.buildDiscoveredMapCoordinates();
    const roomIds = Object.keys(coordinates);

    if (roomIds.length === 0) {
      return {
        lines: ['+--+', '|??|', '+--+', '', `Location: ${this.getCurrentRoom().title}`],
        currentRoomBox: null,
      };
    }

    const positions = Object.fromEntries(
      roomIds.map(roomId => {
        const coordinate = coordinates[roomId];
        return [roomId, {
          left: coordinate.x * 6,
          top: coordinate.y * 4,
        }];
      }),
    );

    const minLeft = Math.min(...Object.values(positions).map(position => position.left));
    const minTop = Math.min(...Object.values(positions).map(position => position.top));
    Object.values(positions).forEach(position => {
      position.left = position.left - minLeft;
      position.top = position.top - minTop;
    });

    const width = Math.max(...Object.values(positions).map(position => position.left), 0) + 4;
    const height = Math.max(...Object.values(positions).map(position => position.top), 0) + 3;
    const grid = this.createCharacterGrid(width, height);
    const drawnConnections = new Set();

    roomIds.forEach(roomId => {
      const room = this.rooms[roomId];
      const sourcePosition = positions[roomId];
      const sourceCenter = {
        x: sourcePosition.left + 1,
        y: sourcePosition.top + 1,
      };

      Object.values(room.exits).forEach(targetRoomId => {
        if (!positions[targetRoomId]) {
          return;
        }

        const connectionKey = [roomId, targetRoomId]
          .sort((left, right) => left.localeCompare(right))
          .join(':');
        if (drawnConnections.has(connectionKey)) {
          return;
        }

        drawnConnections.add(connectionKey);
        const targetPosition = positions[targetRoomId];
        const targetCenter = {
          x: targetPosition.left + 1,
          y: targetPosition.top + 1,
        };

        this.drawMapLine(grid, sourceCenter, targetCenter);
      });
    });

    roomIds.forEach(roomId => {
      const room = this.rooms[roomId];
      const position = positions[roomId];
      this.drawRoomBox(grid, position.left, position.top, this.getRoomMapToken(room));
    });

    const currentPosition = positions[this.currentRoomId] ?? null;

    return {
      lines: [
        ...grid.map(row => row.join('').replace(/\s+$/u, '')),
        '',
        `Location: ${this.getCurrentRoom().title}`,
      ],
      currentRoomBox: currentPosition
        ? {
            left: currentPosition.left,
            top: currentPosition.top,
            width: 4,
            height: 3,
          }
        : null,
    };
  }

  buildPanelModel(panelId) {
    const definition = this.panelDefinitions[panelId];
    const state = this.getPanelState(panelId);

    if (!definition || !state) {
      return null;
    }

    if (!state.unlocked) {
      return {
        id: panelId,
        title: definition.title,
        unlocked: false,
        state: 'locked',
        lines: definition.lockedLines,
      };
    }

    if (panelId === 'map') {
      return this.buildMapPanelModel(definition, state);
    }

    if (panelId === 'inventory') {
      return this.buildInventoryPanelModel(definition, state);
    }

    if (panelId === 'memory') {
      return this.buildMemoryPanelModel(definition, state);
    }

    return {
      id: panelId,
      title: definition.title,
      unlocked: true,
      state: state.degraded ? 'degraded' : 'online',
      lines: ['No renderer assigned.'],
    };
  }

  buildMapPanelModel(definition, state) {
    const renderedMap = this.renderDiscoveredMapLines();

    return {
      id: 'map',
      title: definition.title,
      unlocked: true,
      state: state.degraded ? 'degraded' : 'online',
      lines: renderedMap.lines,
      currentRoomBox: renderedMap.currentRoomBox,
    };
  }

  buildInventoryPanelModel(definition, state) {
    const lines = this.inventory.length === 0
      ? ['Inventory empty.', 'Nothing retained.']
      : this.inventory.map(item => `- ${item.name}`);

    return {
      id: 'inventory',
      title: definition.title,
      unlocked: true,
      state: state.degraded ? 'degraded' : 'online',
      lines,
    };
  }

  buildMemoryPanelModel(definition, state) {
    const currentRoom = this.getCurrentRoom();
    const trueFlags = Object.entries(this.flags)
      .filter(([, value]) => value)
      .slice(0, 3)
      .map(([flagName]) => flagName);
    const inventoryEntries = this.inventory.slice(0, 2).map(item => item.id);
    const labels = [
      'shell.bootstrap',
      `room.${currentRoom.id}`,
      ...inventoryEntries.map(itemId => `item.${itemId}`),
      ...trueFlags.map(flagName => `flag.${flagName}`),
    ].slice(0, 6);

    const lines = labels.map((label, index) => {
      const address = (0x1000 + (index * 0x10)).toString(16).toUpperCase().padStart(4, '0');
      return `0x${address} ${label}`;
    });

    if (lines.length === 0) {
      lines.push('0x1000 shell.bootstrap');
    }

    return {
      id: 'memory',
      title: definition.title,
      unlocked: true,
      state: state.degraded ? 'degraded' : 'online',
      lines,
    };
  }

  getInterfaceModel() {
    return {
      title: this.title,
      location: this.getCurrentRoom().title,
      turns: this.turns,
      score: null,
      panels: Object.keys(this.panelDefinitions)
        .map(panelId => this.buildPanelModel(panelId))
        .filter(Boolean),
    };
  }

  describeMapPanel() {
    if (!this.isPanelUnlocked('map')) {
      return 'No map is available yet.';
    }

    return this.buildMapPanelModel(this.panelDefinitions.map, this.getPanelState('map')).lines.join('\n');
  }

  exportSaveData() {
    return {
      version: 1,
      manifestId: this.manifestId,
      currentRoomId: this.currentRoomId,
      flags: { ...this.flags },
      turns: this.turns,
      roomVisits: { ...this.roomVisits },
      metaState: { ...this.metaState },
      panelState: { ...this.panelState },
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
    this.metaState = this.normalizeMetaState(saveData.metaState ?? this.createDefaultMetaState());
    this.panelState = this.normalizePanelState(saveData.panelState ?? this.createDefaultPanelState());
    this.outputBuffer = [];
    this.pendingMetaMessages = [];
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