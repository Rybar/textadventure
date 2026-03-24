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
    this.eventDefinitions = this.normalizeEventDefinitions(manifest.events);
    this.mapDefinition = this.normalizeMapDefinition(manifest.map);
    this.flags = manifest.flags ? { ...manifest.flags } : {};
    this.panelDefinitions = this.createPanelDefinitions(manifest.ui?.panels);
    this.panelState = this.createDefaultPanelState();
    this.triggerState = this.createDefaultTriggerState();
    this.schedulerState = this.createDefaultSchedulerState();
    this.roomState = this.createDefaultRoomState();
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

  createDefaultTriggerState() {
    return {
      firedEventIds: [],
    };
  }

  createDefaultSchedulerState() {
    return {
      nextEntryId: 1,
      entries: [],
    };
  }

  createDefaultRoomState() {
    return {};
  }

  normalizeEventDefinitions(eventDefinitions = {}) {
    return Object.fromEntries(
      Object.entries(eventDefinitions ?? {}).map(([eventId, definition]) => {
        if (typeof definition === 'function') {
          return [eventId, {
            id: eventId,
            run: definition,
            actions: [],
          }];
        }

        return [eventId, {
          id: eventId,
          actions: Array.isArray(definition?.actions) ? definition.actions : [],
          ...definition,
        }];
      }),
    );
  }

  normalizeMapDefinition(mapDefinition = {}) {
    return {
      rooms: mapDefinition?.rooms ? { ...mapDefinition.rooms } : {},
    };
  }

  normalizeSchedulerState(schedulerState = {}) {
    const nextState = this.createDefaultSchedulerState();

    nextState.nextEntryId = Number.isInteger(schedulerState?.nextEntryId) && schedulerState.nextEntryId > 0
      ? schedulerState.nextEntryId
      : nextState.nextEntryId;
    nextState.entries = Array.isArray(schedulerState?.entries)
      ? schedulerState.entries
        .filter(entry => entry && typeof entry === 'object' && Number.isFinite(entry.dueTurn))
        .map(entry => ({
          id: entry.id,
          scheduleId: entry.scheduleId ?? null,
          type: entry.type ?? 'event',
          dueTurn: entry.dueTurn,
          eventId: entry.eventId ?? null,
          roomId: entry.roomId ?? null,
          triggerName: entry.triggerName ?? null,
          data: entry.data && typeof entry.data === 'object' ? { ...entry.data } : {},
        }))
      : [];

    return nextState;
  }

  normalizeRoomState(roomState = {}) {
    return Object.fromEntries(
      Object.entries(roomState ?? {}).filter(([, state]) => state && typeof state === 'object' && !Array.isArray(state)).map(([roomId, state]) => [
        roomId,
        { ...state },
      ]),
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
      reactiveLackeyCounts: {},
      shownMilestoneIds: [],
      shownEndingIds: [],
    };
  }

  normalizeTriggerState(triggerState = {}) {
    if (Array.isArray(triggerState.firedEventIds)) {
      return {
        firedEventIds: [...new Set(triggerState.firedEventIds.filter(Boolean))],
      };
    }

    return this.createDefaultTriggerState();
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
      || (metaState.reactiveLackeyCounts && typeof metaState.reactiveLackeyCounts === 'object')
      || Array.isArray(metaState.shownMilestoneIds)
      || Array.isArray(metaState.shownEndingIds)
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
        reactiveLackeyCounts: metaState.reactiveLackeyCounts && typeof metaState.reactiveLackeyCounts === 'object'
          ? { ...metaState.reactiveLackeyCounts }
          : {},
        shownMilestoneIds: Array.isArray(metaState.shownMilestoneIds)
          ? [...metaState.shownMilestoneIds]
          : [],
        shownEndingIds: Array.isArray(metaState.shownEndingIds)
          ? [...metaState.shownEndingIds]
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
      reactiveLackeyCounts: {},
      shownMilestoneIds: [],
      shownEndingIds: [],
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

    const conversation = this.metaGame.reactiveLackeyConversations?.[conversationId];
    if (!conversation) {
      return [];
    }

    const variants = Array.isArray(conversation.variants) && conversation.variants.length > 0
      ? conversation.variants
      : [conversation];
    const shownCount = this.metaState.reactiveLackeyCounts?.[conversationId] ?? 0;
    const nextVariant = variants[shownCount % variants.length] ?? null;

    if (!nextVariant) {
      return [];
    }

    const leftMessage = this.getMetaMessage(nextVariant.leftMessageId);
    const rightMessage = this.getMetaMessage(nextVariant.rightMessageId);
    const nextMessages = [
      leftMessage ? { ...leftMessage, placement: 'side-left', delayMs: 0, priority: 'reactive' } : null,
      rightMessage ? { ...rightMessage, placement: 'side-right', delayMs: 3600, priority: 'reactive' } : null,
    ].filter(Boolean);

    if (nextMessages.length === 0) {
      return [];
    }

    this.metaState.shownReactiveLackeyIds = this.metaState.shownReactiveLackeyIds.includes(conversationId)
      ? this.metaState.shownReactiveLackeyIds
      : [...this.metaState.shownReactiveLackeyIds, conversationId];
    this.metaState.reactiveLackeyCounts = {
      ...this.metaState.reactiveLackeyCounts,
      [conversationId]: shownCount + 1,
    };

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

    const baseContext = {
      worldState: this,
      currentRoom,
      inventory: this.inventory,
      turns: this.turns,
      visitCount,
      isFirstVisit: visitCount <= 1,
      getItemById: itemId => this.getItemById(itemId),
      getItemLocation: itemOrId => this.getItemLocation(itemOrId),
      isItemInInventory: itemOrId => this.isItemInInventory(itemOrId),
      isItemInRoom: (itemOrId, roomId = currentRoom?.id) => this.isItemInRoom(itemOrId, roomId),
      isItemVisibleHere: (itemOrId, roomId = currentRoom?.id) => this.isItemVisibleHere(itemOrId, roomId),
      getFlag: flagName => this.getFlag(flagName),
      setFlag: (flagName, value) => this.setFlag(flagName, value),
      movePlayer: roomId => this.movePlayer(roomId),
      moveItem: (itemId, destination) => this.moveItem(itemId, destination),
      unlockExit: (roomId, direction, targetRoomId) => this.unlockExit(roomId, direction, targetRoomId),
      unlockPanel: panelId => this.unlockPanel(panelId),
      degradePanel: (panelId, mode) => this.degradePanel(panelId, mode),
      hasTriggeredEvent: eventId => this.hasTriggeredEvent(eventId),
      markTriggeredEvent: eventId => this.markTriggeredEvent(eventId),
      triggerRoomEvent: (roomId, triggerName, eventContext = {}) => this.runRoomTrigger(roomId, triggerName, eventContext),
      emitRoomEvent: (triggerName, eventContext = {}) => this.runRoomTrigger(currentRoom, triggerName, eventContext).join('\n\n'),
      triggerEvent: (eventId, eventContext = {}) => this.runEvent(eventId, eventContext),
      emitEvent: (eventId, eventContext = {}) => this.runEvent(eventId, eventContext).join('\n\n'),
      hasRunEvent: eventId => this.hasTriggeredEvent(this.getEventStateId(eventId)),
      scheduleEvent: (eventId, scheduleOptions = {}) => this.scheduleEvent(eventId, scheduleOptions),
      cancelScheduledEvent: scheduleId => this.cancelScheduledEvent(scheduleId),
      hasScheduledEvent: scheduleId => this.hasScheduledEvent(scheduleId),
      getRoomState: (roomId = currentRoom?.id) => this.getRoomState(roomId),
      setRoomState: (updates, roomId = currentRoom?.id) => this.patchRoomState(roomId, updates),
      print: text => this.print(text),
      ...additionalContext,
    };

    baseContext.getScenePhase = (roomId = currentRoom?.id, sceneContext = {}) => {
      const room = typeof roomId === 'string'
        ? this.rooms[roomId]
        : roomId ?? currentRoom;

      if (!room) {
        return null;
      }

      return room.getScenePhase({
        ...baseContext,
        ...sceneContext,
        currentRoom: room,
      });
    };

    baseContext.currentScenePhase = currentRoom?.getScenePhase(baseContext) ?? null;
    return baseContext;
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

  hasTriggeredEvent(eventId) {
    return this.triggerState.firedEventIds.includes(eventId);
  }

  markTriggeredEvent(eventId) {
    if (!eventId || this.hasTriggeredEvent(eventId)) {
      return false;
    }

    this.triggerState.firedEventIds = [...this.triggerState.firedEventIds, eventId];
    return true;
  }

  getRoomState(roomId = this.currentRoomId) {
    if (!roomId) {
      return {};
    }

    if (!this.roomState[roomId]) {
      this.roomState[roomId] = {};
    }

    return this.roomState[roomId];
  }

  patchRoomState(roomId = this.currentRoomId, updates = {}) {
    if (!roomId || !updates || typeof updates !== 'object' || Array.isArray(updates)) {
      return this.getRoomState(roomId);
    }

    const nextState = {
      ...this.getRoomState(roomId),
      ...updates,
    };

    this.roomState = {
      ...this.roomState,
      [roomId]: nextState,
    };

    return nextState;
  }

  getEventStateId(eventId) {
    return `event:${eventId}`;
  }

  resolveContextValue(value, context) {
    if (typeof value === 'function') {
      return value(context);
    }

    return value;
  }

  runEventAction(action, context = {}) {
    if (typeof action === 'function') {
      return action(context);
    }

    if (typeof action === 'string') {
      return action;
    }

    if (!action || typeof action !== 'object') {
      return null;
    }

    if (typeof action.run === 'function') {
      return action.run(context);
    }

    switch (action.type) {
      case 'setFlag': {
        this.setFlag(action.flag, this.resolveContextValue(action.value, context));
        return null;
      }
      case 'unlockExit': {
        this.unlockExit(
          this.resolveContextValue(action.roomId, context),
          this.resolveContextValue(action.direction, context),
          this.resolveContextValue(action.targetRoomId, context),
        );
        return null;
      }
      case 'unlockPanel': {
        this.unlockPanel(this.resolveContextValue(action.panelId, context));
        return null;
      }
      case 'lockPanel': {
        this.lockPanel(this.resolveContextValue(action.panelId, context));
        return null;
      }
      case 'degradePanel': {
        this.degradePanel(
          this.resolveContextValue(action.panelId, context),
          this.resolveContextValue(action.mode, context),
        );
        return null;
      }
      case 'clearPanelDegradation': {
        this.clearPanelDegradation(this.resolveContextValue(action.panelId, context));
        return null;
      }
      case 'moveItem': {
        this.moveItem(
          this.resolveContextValue(action.itemId, context),
          this.resolveContextValue(action.destination, context),
        );
        return null;
      }
      case 'movePlayer': {
        this.movePlayer(this.resolveContextValue(action.roomId, context));
        return null;
      }
      case 'print': {
        this.print(this.resolveContextValue(action.text, context));
        return null;
      }
      case 'queueMetaMessages': {
        const messages = this.resolveContextValue(action.messages, context) ?? [];
        this.queueMetaMessages(Array.isArray(messages) ? messages : [messages]);
        return null;
      }
      case 'event': {
        return this.runEvent(this.resolveContextValue(action.eventId, context), context);
      }
      case 'scheduleEvent': {
        this.scheduleEvent(
          this.resolveContextValue(action.eventId, context),
          {
            delayTurns: this.resolveContextValue(action.delayTurns, context),
            scheduleId: this.resolveContextValue(action.scheduleId, context),
            data: this.resolveContextValue(action.data, context),
          },
        );
        return null;
      }
      case 'cancelScheduledEvent': {
        this.cancelScheduledEvent(this.resolveContextValue(action.scheduleId, context));
        return null;
      }
      case 'roomTrigger': {
        return this.runRoomTrigger(
          this.resolveContextValue(action.roomId, context) ?? context.currentRoom,
          this.resolveContextValue(action.triggerName, context),
          context,
        );
      }
      default: {
        return this.resolveContextValue(action.text, context);
      }
    }
  }

  runEvent(eventId, additionalContext = {}) {
    const definition = this.eventDefinitions[eventId];
    if (!definition) {
      return [];
    }

    const context = this.createContext({
      eventId,
      ...additionalContext,
    });
    const stateId = this.getEventStateId(eventId);

    if (definition.once && this.hasTriggeredEvent(stateId)) {
      return [];
    }

    if (typeof definition.when === 'function' && !definition.when(context)) {
      return [];
    }

    const outputs = [];

    definition.actions.forEach(action => {
      const result = this.runEventAction(action, context);

      if (Array.isArray(result)) {
        outputs.push(...result);
        return;
      }

      outputs.push(result);
    });

    if (typeof definition.run === 'function') {
      outputs.push(definition.run(context));
    }

    if (definition.text !== undefined) {
      outputs.push(this.resolveContextValue(definition.text, context));
    }

    if (definition.once) {
      this.markTriggeredEvent(stateId);
    }

    return outputs.filter(Boolean);
  }

  setFlag(flagName, value) {
    const previousValue = this.flags[flagName];
    this.flags[flagName] = value;
    this.applyFlagSideEffects(flagName, value, previousValue);
  }

  applyFlagSideEffects(flagName, value, previousValue) {
    this.applyMemoryFlagSideEffects(flagName, value);

    if (previousValue === value || !value) {
      return;
    }

    if (this.metaState.shownEndingIds.length > 0) {
      return;
    }

    const endingMessages = this.triggerMetaEndingIfNeeded();
    if (endingMessages.length > 0) {
      return;
    }

    this.triggerMetaMilestonesForFlag(flagName);
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

  buildConfiguredMetaMessages(entries = [], defaultPriority = 'milestone') {
    return entries.map(entry => {
      const message = this.getMetaMessage(entry.messageId);
      if (!message) {
        return null;
      }

      return {
        ...message,
        placement: entry.placement ?? 'lower-random',
        delayMs: entry.delayMs ?? 0,
        priority: entry.priority ?? defaultPriority,
      };
    }).filter(Boolean);
  }

  getMetaPriorityValue(priority = 'scheduled') {
    switch (priority) {
      case 'ending':
        return 4;
      case 'rupture':
        return 3;
      case 'milestone':
        return 2;
      case 'reactive':
        return 1;
      default:
        return 0;
    }
  }

  hasPendingMetaPriorityAtOrAbove(priority = 'milestone') {
    const targetPriority = this.getMetaPriorityValue(priority);
    return this.pendingMetaMessages.some(message => this.getMetaPriorityValue(message?.priority) >= targetPriority);
  }

  hasMetaEngagement() {
    return this.getFlag('mapOverlayInjected')
      || this.getFlag('inventoryOverlayInjected')
      || this.getFlag('memoryBusExposed')
      || this.getFlag('shellContactAcknowledged')
      || this.metaState.shownHackerIds.length > 0
      || this.metaState.shownMilestoneIds.some(milestoneId => {
        return [
          'map-overlay-injected',
          'inventory-overlay-injected',
          'memory-bus-exposed',
          'containment-override',
          'operator-authority-shifted',
          'subject-designation-recovered',
          'exit-permission-granted',
        ].includes(milestoneId);
      });
  }

  hasEscapeLeverage() {
    return this.getFlag('blackWindEvidenceCollected')
      || this.getFlag('blackWindTreeSabotaged')
      || this.getFlag('portalBypassLearned')
      || this.getFlag('spellbooksSecured')
      || this.getFlag('containmentProtocolKnown')
      || this.getFlag('nathemaBlackWindSampleDelivered')
      || this.getFlag('nathemaRouteKnowledgeShared')
      || this.getFlag('nathemaTextsShared')
      || Boolean(this.findInventoryItem('black-wind-ledger'))
      || Boolean(this.findInventoryItem('black-wind-root-sample'))
      || Boolean(this.findInventoryItem('black-wind-fruit'))
      || Boolean(this.findInventoryItem('black-wind-elixir'))
      || Boolean(this.findInventoryItem('geometry-folio'))
      || Boolean(this.findInventoryItem('threshold-spellbook'))
      || Boolean(this.findInventoryItem('grey-grin-blade'));
  }

  resolveMetaEndingId() {
    if (this.getFlag('absorbedIntoRoutine')) {
      return 'absorbed-into-routine';
    }

    if (!this.getFlag('escapedMansion')) {
      return null;
    }

    if (
      this.getFlag('containmentOverride')
      || this.getFlag('operatorAuthorityShifted')
      || this.getFlag('subjectDesignationRecovered')
      || this.getFlag('exitPermissionGranted')
    ) {
      return 'system-breach';
    }

    if (
      this.getFlag('nathemaEscapeDealSecured')
      || this.getFlag('blackWindFruitConsumed')
      || this.getFlag('blackWindElixirConsumed')
      || this.getFlag('servantApronWorn')
    ) {
      return 'dark-bargain';
    }

    if (this.getFlag('oshregaalWounded')) {
      return 'violent-escape';
    }

    if (this.getFlag('strongerEscapeSecured')) {
      return 'strong-escape';
    }

    if (this.getFlag('plumRescued')) {
      return 'plum-rescue';
    }

    if (this.hasEscapeLeverage()) {
      return 'compromised-escape';
    }

    if (this.hasMetaEngagement()) {
      return 'aware-escape';
    }

    return 'clean-escape';
  }

  buildNextMetaEndingMessages() {
    const endingId = this.resolveMetaEndingId();
    if (!endingId || this.metaState.shownEndingIds.includes(endingId)) {
      return [];
    }

    const endingDefinition = this.metaGame.endings?.definitions?.[endingId];
    if (!endingDefinition) {
      return [];
    }

    const nextMessages = this.buildConfiguredMetaMessages(endingDefinition.messages ?? [], endingDefinition.priority ?? 'ending');
    if (nextMessages.length === 0) {
      return [];
    }

    this.metaState.shownEndingIds = [
      ...this.metaState.shownEndingIds,
      endingId,
    ];

    return nextMessages;
  }

  triggerMetaEndingIfNeeded() {
    const nextMessages = this.buildNextMetaEndingMessages();
    if (nextMessages.length === 0) {
      return [];
    }

    this.queueMetaMessages(nextMessages);
    return nextMessages;
  }

  triggerMetaMilestone(milestoneId) {
    if (!milestoneId || this.metaState.shownMilestoneIds.includes(milestoneId)) {
      return [];
    }

    const milestone = this.metaGame.milestones?.definitions?.[milestoneId];
    if (!milestone) {
      return [];
    }

    const nextMessages = this.buildConfiguredMetaMessages(milestone.messages ?? [], milestone.priority ?? 'milestone');
    if (nextMessages.length === 0) {
      return [];
    }

    this.metaState.shownMilestoneIds = [
      ...this.metaState.shownMilestoneIds,
      milestoneId,
    ];
    this.queueMetaMessages(nextMessages);
    return nextMessages;
  }

  triggerMetaMilestonesForFlag(flagName) {
    const milestoneIds = this.metaGame.milestones?.flagTriggers?.[flagName] ?? [];
    return milestoneIds.flatMap(milestoneId => this.triggerMetaMilestone(milestoneId));
  }

  createScheduledEntry(baseEntry = {}) {
    const entryId = this.schedulerState.nextEntryId;
    this.schedulerState.nextEntryId += 1;

    return {
      id: `scheduled:${entryId}`,
      scheduleId: baseEntry.scheduleId ?? null,
      type: baseEntry.type ?? 'event',
      dueTurn: baseEntry.dueTurn,
      eventId: baseEntry.eventId ?? null,
      roomId: baseEntry.roomId ?? null,
      triggerName: baseEntry.triggerName ?? null,
      data: baseEntry.data && typeof baseEntry.data === 'object' ? { ...baseEntry.data } : {},
    };
  }

  hasScheduledEvent(scheduleId) {
    if (!scheduleId) {
      return false;
    }

    return this.schedulerState.entries.some(entry => entry.scheduleId === scheduleId);
  }

  cancelScheduledEvent(scheduleId) {
    if (!scheduleId) {
      return false;
    }

    const originalLength = this.schedulerState.entries.length;
    this.schedulerState.entries = this.schedulerState.entries.filter(entry => entry.scheduleId !== scheduleId);
    return this.schedulerState.entries.length !== originalLength;
  }

  scheduleEvent(eventId, options = {}) {
    if (!eventId) {
      return null;
    }

    const delayTurns = Math.max(0, Number.isFinite(options.delayTurns) ? Number(options.delayTurns) : 0);
    const scheduleId = options.scheduleId ? String(options.scheduleId) : null;
    if (scheduleId) {
      this.cancelScheduledEvent(scheduleId);
    }

    const entry = this.createScheduledEntry({
      type: 'event',
      eventId,
      scheduleId,
      dueTurn: this.turns + delayTurns,
      data: options.data ?? {},
    });

    this.schedulerState.entries = [...this.schedulerState.entries, entry]
      .sort((left, right) => left.dueTurn - right.dueTurn || String(left.id).localeCompare(String(right.id)));
    return entry;
  }

  runScheduledEntry(entry) {
    if (!entry) {
      return [];
    }

    if (entry.type === 'event') {
      return this.runEvent(entry.eventId, {
        scheduledEntry: entry,
        scheduledData: entry.data ?? {},
        ...entry.data,
      });
    }

    if (entry.type === 'roomTrigger') {
      return this.runRoomTrigger(entry.roomId, entry.triggerName, {
        scheduledEntry: entry,
        scheduledData: entry.data ?? {},
        ...entry.data,
      });
    }

    return [];
  }

  advanceScheduledEvents() {
    const dueEntries = [];
    const futureEntries = [];

    this.schedulerState.entries.forEach(entry => {
      if (entry.dueTurn <= this.turns) {
        dueEntries.push(entry);
        return;
      }

      futureEntries.push(entry);
    });

    this.schedulerState.entries = futureEntries;

    return dueEntries.flatMap(entry => this.runScheduledEntry(entry)).filter(Boolean);
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
    if (this.metaState.shownEndingIds.length > 0) {
      return [];
    }

    if (!force && this.hasPendingMetaPriorityAtOrAbove('milestone')) {
      return [];
    }

    const nextEndingMessages = this.buildNextMetaEndingMessages();
    if (nextEndingMessages.length > 0) {
      return nextEndingMessages;
    }

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
        leftMessage ? { ...leftMessage, placement: 'side-left', delayMs: 0, priority: 'scheduled' } : null,
        rightMessage ? { ...rightMessage, placement: 'side-right', delayMs: entry.rightDelayMs ?? 4200, priority: 'scheduled' } : null,
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
            priority: 'scheduled',
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

  buildNextHackerMessages({ force = false } = {}) {
    const hackerEntries = this.getHackerScheduleEntries();
    if (hackerEntries.length === 0) {
      return [];
    }

    const nextHackerEntry = this.findNextMetaEntry(
      hackerEntries,
      this.metaState.shownHackerIds,
      'hacker-message',
      { force },
    );

    if (!nextHackerEntry) {
      return [];
    }

    const { entry, entryId } = nextHackerEntry;
    const hackerMessage = this.getMetaMessage(entry.messageId);
    this.metaState.shownHackerIds = [
      ...this.metaState.shownHackerIds,
      entryId,
    ];

    if (!hackerMessage) {
      return [];
    }

    return [{
      ...hackerMessage,
      placement: entry.placement ?? 'lower-random',
      delayMs: entry.delayMs ?? 0,
      priority: 'scheduled',
    }];
  }

  normalizePreviewMessages(nextMessages = []) {
    const minimumDelay = nextMessages.reduce((lowestDelay, message) => {
      const nextDelay = message?.delayMs ?? 0;
      return Math.min(lowestDelay, nextDelay);
    }, Infinity);
    const normalizedDelay = Number.isFinite(minimumDelay) ? minimumDelay : 0;

    return nextMessages.map(message => ({
      ...message,
      delayMs: Math.max(0, (message.delayMs ?? 0) - normalizedDelay),
    }));
  }

  advanceMetaMessages() {
    const nextMessages = this.buildNextMetaMessages();

    this.queueMetaMessages(nextMessages);
    return nextMessages;
  }

  forceNextMetaMessages() {
    const nextMessages = this.buildNextMetaMessages({ force: true });
    const previewMessages = this.normalizePreviewMessages(nextMessages);

    this.queueMetaMessages(previewMessages);
    return previewMessages;
  }

  forceNextHackerMessages() {
    const nextMessages = this.buildNextHackerMessages({ force: true });
    const previewMessages = this.normalizePreviewMessages(nextMessages);

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

  resolveItemReference(itemOrId) {
    if (!itemOrId) {
      return null;
    }

    if (typeof itemOrId === 'string') {
      return itemOrId;
    }

    return itemOrId.id ?? null;
  }

  getItemLocation(itemId) {
    const resolvedItemId = this.resolveItemReference(itemId);
    if (!resolvedItemId) {
      return null;
    }

    const inventoryItem = this.inventory.find(item => item.id === resolvedItemId);
    if (inventoryItem) {
      return {
        type: 'inventory',
      };
    }

    for (const room of Object.values(this.rooms)) {
      if (room.items.some(item => item.id === resolvedItemId)) {
        return {
          type: 'room',
          roomId: room.id,
        };
      }
    }

    return null;
  }

  isItemInInventory(itemOrId) {
    return this.getItemLocation(itemOrId)?.type === 'inventory';
  }

  isItemInRoom(itemOrId, roomId = this.currentRoomId) {
    const location = this.getItemLocation(itemOrId);
    return location?.type === 'room' && location.roomId === roomId;
  }

  isItemVisibleHere(itemOrId, roomId = this.currentRoomId) {
    const resolvedItemId = this.resolveItemReference(itemOrId);
    if (!resolvedItemId || !roomId || !this.rooms[roomId]) {
      return false;
    }

    return this.rooms[roomId].items.some(item => item.id === resolvedItemId && item.visible !== false);
  }

  describeItem(item, context = {}) {
    if (!item) {
      return '';
    }

    if (typeof item.description === 'function') {
      return item.description({
        ...context,
        item,
      });
    }

    return item.description;
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

  runRoomTrigger(roomOrId, triggerName, additionalContext = {}) {
    const room = typeof roomOrId === 'string'
      ? this.rooms[roomOrId]
      : roomOrId;

    if (!room) {
      return [];
    }

    return room.runTrigger(triggerName, this.createContext({
      currentRoom: room,
      ...additionalContext,
    }));
  }

  findInventoryItem(itemName) {
    return this.resolveInventoryItem(itemName).candidate?.target ?? null;
  }

  findVisibleItem(itemName) {
    return this.resolveVisibleItem(itemName).candidate?.target ?? null;
  }

  findVisibleObject(objectName) {
    return this.resolveVisibleObject(objectName).candidate?.target ?? null;
  }

  findInteractiveTarget(targetName) {
    return this.resolveInteractiveTarget(targetName).candidate ?? null;
  }

  normalizeLookupName(targetName) {
    return String(targetName ?? '').trim().toLowerCase();
  }

  resolveCandidates(candidates = []) {
    if (candidates.length === 0) {
      return {
        status: 'none',
        candidate: null,
        candidates: [],
      };
    }

    if (candidates.length === 1) {
      return {
        status: 'unique',
        candidate: candidates[0],
        candidates,
      };
    }

    return {
      status: 'ambiguous',
      candidate: null,
      candidates,
    };
  }

  getInventoryItemCandidates(itemName) {
    const normalizedName = this.normalizeLookupName(itemName);
    if (!normalizedName) {
      return [];
    }

    return this.inventory
      .filter(item => item.matchesName(normalizedName))
      .map(item => ({
        type: 'item',
        target: item,
        scope: 'inventory',
      }));
  }

  getRoomItemCandidates(itemName, room = this.getCurrentRoom()) {
    const normalizedName = this.normalizeLookupName(itemName);
    if (!normalizedName || !room) {
      return [];
    }

    return room.items
      .filter(item => item.visible !== false)
      .filter(item => item.matchesName(normalizedName))
      .map(item => ({
        type: 'item',
        target: item,
        scope: 'room',
      }));
  }

  getVisibleItemCandidates(itemName) {
    return [
      ...this.getRoomItemCandidates(itemName),
      ...this.getInventoryItemCandidates(itemName),
    ];
  }

  getVisibleObjectCandidates(objectName, room = this.getCurrentRoom()) {
    const normalizedName = this.normalizeLookupName(objectName);
    if (!normalizedName || !room) {
      return [];
    }

    return Object.values(room.objects)
      .filter(object => object.name.toLowerCase() === normalizedName || object.aliases.includes(normalizedName))
      .map(object => ({
        type: 'object',
        target: object,
        scope: 'room',
      }));
  }

  resolveInventoryItem(itemName) {
    return this.resolveCandidates(this.getInventoryItemCandidates(itemName));
  }

  resolveVisibleItem(itemName) {
    return this.resolveCandidates(this.getVisibleItemCandidates(itemName));
  }

  resolveVisibleObject(objectName) {
    return this.resolveCandidates(this.getVisibleObjectCandidates(objectName));
  }

  resolveInteractiveTarget(targetName, options = {}) {
    const {
      includeObjects = true,
      includeRoomItems = true,
      includeInventoryItems = true,
    } = options;

    const candidates = [];
    if (includeObjects) {
      candidates.push(...this.getVisibleObjectCandidates(targetName));
    }

    if (includeRoomItems) {
      candidates.push(...this.getRoomItemCandidates(targetName));
    }

    if (includeInventoryItems) {
      candidates.push(...this.getInventoryItemCandidates(targetName));
    }

    return this.resolveCandidates(candidates);
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
    const hookText = this.runRoomTrigger(currentRoom, 'enter', context);
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
    const hookText = this.runRoomTrigger(currentRoom, 'look', context);
    const description = this.describeCurrentRoom(context);
    const printedOutput = this.flushPrintedOutput();

    return [...printedOutput, ...hookText, description].filter(Boolean).join('\n\n');
  }

  advanceCurrentRoomScene(additionalContext = {}) {
    const currentRoom = this.getCurrentRoom();
    if (!currentRoom?.hasScene()) {
      return [];
    }

    return currentRoom.runSceneTurn(this.createContext({
      currentRoom,
      ...additionalContext,
    })).filter(Boolean);
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
    const visibleItems = currentRoom.items.filter(item => item.visible !== false);
    let description = currentRoom.describe(context);

    const sceneDescription = currentRoom.getSceneDescription(context);
    if (sceneDescription) {
      description += `\n${sceneDescription}`;
    }

    const conditionalDescriptions = currentRoom.getConditionalDescriptions(context).join(' ');
    if (conditionalDescriptions) {
      description += `\n${conditionalDescriptions}`;
    }

    const stateDescriptions = visibleItems
      .map(item => item.stateDescription)
      .filter(Boolean)
      .join(' ');

    if (stateDescriptions) {
      description += `\n${stateDescriptions}\n`;
    }

    if (visibleItems.length > 0) {
      description += `\nYou can see the following items: ${visibleItems.map(item => item.name).join(', ')}.\n`;
    } else {
      description += ' There are no items to see here.\n';
    }

    description += ` ${currentRoom.listExits()}`;
    return description;
  }

  describeObject(itemName) {
    const currentRoom = this.getCurrentRoom();
    const context = this.createContext({ currentRoom });

    const visibleObject = this.findVisibleObject(itemName);
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

    return this.describeItem(item, context);
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

  getRoomMapMetadata(roomId) {
    return this.mapDefinition.rooms?.[roomId] ?? null;
  }

  getRoomMapToken(room) {
    const mapMetadata = room ? this.getRoomMapMetadata(room.id) : null;
    if (mapMetadata?.token) {
      return String(mapMetadata.token).toUpperCase().slice(0, 2).padEnd(2, ' ');
    }

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

    const allowedRoomIds = new Set(roomIds);
    const coordinates = {};
    const occupied = new Map();

    roomIds.forEach(roomId => {
      const mapMetadata = this.getRoomMapMetadata(roomId);
      if (!Number.isFinite(mapMetadata?.x) || !Number.isFinite(mapMetadata?.y)) {
        return;
      }

      coordinates[roomId] = {
        x: mapMetadata.x,
        y: mapMetadata.y,
      };
      occupied.set(`${mapMetadata.x},${mapMetadata.y}`, roomId);
    });

    if (Object.keys(coordinates).length === 0) {
      const anchorRoomId = this.getMapAnchorRoomId(roomIds);
      coordinates[anchorRoomId] = { x: 0, y: 0 };
      occupied.set('0,0', anchorRoomId);
    }

    const queue = Object.keys(coordinates);

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
    const roomBoxes = Object.fromEntries(
      roomIds.map(roomId => [roomId, {
        left: positions[roomId].left,
        top: positions[roomId].top,
        width: 4,
        height: 3,
        token: this.getRoomMapToken(this.rooms[roomId]),
        region: this.getRoomMapMetadata(roomId)?.region ?? null,
      }]),
    );

    return {
      lines: [
        ...grid.map(row => row.join('').replace(/\s+$/u, '')),
        '',
        `Location: ${this.getCurrentRoom().title}`,
      ],
      roomBoxes,
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
      roomBoxes: renderedMap.roomBoxes,
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

  getMemoryFlagEntries() {
    return Object.keys(this.flags).map((flagName, index) => {
      const byteIndex = Math.floor(index / 8);
      return {
        flagName,
        index,
        byteIndex,
        address: byteIndex * 0x08,
        bit: index % 8,
        value: Boolean(this.flags[flagName]),
      };
    });
  }

  getMemoryFlagEntryByAddress(address, bit) {
    const normalizedAddress = Number(address);
    const normalizedBit = Number(bit);

    if (!Number.isInteger(normalizedAddress) || normalizedAddress < 0) {
      return null;
    }

    if (!Number.isInteger(normalizedBit) || normalizedBit < 0 || normalizedBit > 7) {
      return null;
    }

    return this.getMemoryFlagEntries().find(entry => entry.address === normalizedAddress && entry.bit === normalizedBit) ?? null;
  }

  getMemoryFlagByLocation(address, bit) {
    return this.getMemoryFlagEntryByAddress(address, bit)?.flagName ?? null;
  }

  formatMemoryAddress(address) {
    return `0x${Number(address).toString(16).toUpperCase().padStart(4, '0')}`;
  }

  getMemoryRowEntries(address) {
    const normalizedAddress = Number(address);
    if (!Number.isInteger(normalizedAddress) || normalizedAddress < 0) {
      return null;
    }

    const rowAddress = Math.floor(normalizedAddress / 0x08) * 0x08;
    const rowEntries = this.getMemoryFlagEntries().filter(entry => entry.address === rowAddress);

    if (rowEntries.length === 0) {
      return null;
    }

    return {
      address: rowAddress,
      entries: rowEntries,
    };
  }

  renderMemoryRowLine(address) {
    const row = this.getMemoryRowEntries(address);
    if (!row) {
      return null;
    }

    const cells = Array.from({ length: 8 }, (_, bitIndex) => {
      const entry = row.entries.find(candidate => candidate.bit === bitIndex);

      if (!entry) {
        return '  ';
      }

      return entry.value ? '##' : '[]';
    }).join(' ');

    return `${this.formatMemoryAddress(row.address)} ${cells}`;
  }

  isMemoryFlagWritable(flagName) {
    return new Set([
      'shellContactAcknowledged',
      'mapOverlayInjected',
      'inventoryOverlayInjected',
      'memoryBusExposed',
      'exitPermissionGranted',
      'containmentOverride',
      'operatorAuthorityShifted',
      'subjectDesignationRecovered',
    ]).has(flagName);
  }

  applyMemoryFlagSideEffects(flagName, value) {
    if (flagName === 'mapOverlayInjected') {
      if (value) {
        this.unlockPanel('map');
      } else {
        this.lockPanel('map');
      }
    }

    if (flagName === 'inventoryOverlayInjected') {
      if (value) {
        this.unlockPanel('inventory');
      } else {
        this.lockPanel('inventory');
      }
    }
  }

  writeMemoryFlagByLocation(address, bit, mode = 'toggle') {
    const entry = this.getMemoryFlagEntryByAddress(address, bit);
    if (!entry) {
      return {
        status: 'missing',
        message: 'No writable cell exists at that address.',
      };
    }

    if (!this.isMemoryFlagWritable(entry.flagName)) {
      return {
        status: 'readonly',
        message: `${this.formatMemoryAddress(entry.address)}.${entry.bit} rejects the write. That cell is read-only.`,
        entry,
      };
    }

    let nextValue = null;
    if (mode === 'toggle') {
      nextValue = !entry.value;
    } else if (mode === 'set') {
      nextValue = true;
    } else if (mode === 'clear') {
      nextValue = false;
    } else {
      return {
        status: 'invalid-mode',
        message: 'Write mode must be TOGGLE, SET, or CLEAR.',
        entry,
      };
    }

    this.setFlag(entry.flagName, nextValue);

    const updatedEntry = {
      ...entry,
      value: nextValue,
    };

    return {
      status: 'written',
      entry: updatedEntry,
      message: `${this.formatMemoryAddress(updatedEntry.address)}.${updatedEntry.bit} => ${nextValue ? '##' : '[]'}`,
    };
  }

  renderMemoryPanelLines() {
    const entries = this.getMemoryFlagEntries();
    const rowCount = Math.max(1, Math.ceil(entries.length / 8));
    const lines = ['       0  1  2  3  4  5  6  7'];

    for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
      const rowEntries = entries.slice(rowIndex * 8, (rowIndex + 1) * 8);
      const address = `0x${(rowIndex * 0x08).toString(16).toUpperCase().padStart(4, '0')}`;
      const cells = Array.from({ length: 8 }, (_, bitIndex) => {
        const entry = rowEntries.find(candidate => candidate.bit === bitIndex);

        if (!entry) {
          return '  ';
        }

        return entry.value ? '##' : '[]';
      }).join(' ');

      lines.push(`${address} ${cells}`);
    }

    return lines;
  }

  buildMemoryPanelModel(definition, state) {
    return {
      id: 'memory',
      title: definition.title,
      unlocked: true,
      state: state.degraded ? 'degraded' : 'online',
      lines: this.renderMemoryPanelLines(),
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

  describeMemoryPanel() {
    if (!this.isPanelUnlocked('memory')) {
      return 'No readable memory bus is exposed yet.';
    }

    return this.renderMemoryPanelLines().join('\n');
  }

  exportSaveData() {
    return {
      version: 1,
      manifestId: this.manifestId,
      currentRoomId: this.currentRoomId,
      flags: { ...this.flags },
      turns: this.turns,
      roomVisits: { ...this.roomVisits },
      roomState: this.normalizeRoomState(this.roomState),
      metaState: { ...this.metaState },
      panelState: { ...this.panelState },
      triggerState: { ...this.triggerState },
      schedulerState: {
        nextEntryId: this.schedulerState.nextEntryId,
        entries: this.schedulerState.entries.map(entry => ({
          ...entry,
          data: entry.data && typeof entry.data === 'object' ? { ...entry.data } : {},
        })),
      },
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
    this.roomState = this.normalizeRoomState(saveData.roomState ?? this.createDefaultRoomState());
    this.metaState = this.normalizeMetaState(saveData.metaState ?? this.createDefaultMetaState());
    this.panelState = this.normalizePanelState(saveData.panelState ?? this.createDefaultPanelState());
    this.triggerState = this.normalizeTriggerState(saveData.triggerState ?? this.createDefaultTriggerState());
    this.schedulerState = this.normalizeSchedulerState(saveData.schedulerState ?? this.createDefaultSchedulerState());
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