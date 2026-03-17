import { ActionRegistry } from './actionRegistry.js';
import { CommandParser } from '../parser/commandParser.js';
import { Transcript } from './transcript.js';
import { WorldState } from './worldState.js';

export class GameSession {
  constructor(manifestSource, options = {}) {
    this.manifestFactory = options.manifestFactory
      ?? (typeof manifestSource === 'function' ? manifestSource : null);
    this.manifest = typeof manifestSource === 'function'
      ? manifestSource()
      : manifestSource;
    this.commandParser = options.commandParser ?? new CommandParser(this.manifest.parserOptions ?? {});
    this.transcript = options.transcript ?? new Transcript();
    this.actionRegistry = options.actionRegistry ?? new ActionRegistry();
    this.worldState = new WorldState(this.manifest);
    this.initializeActionRegistry();
  }

  start() {
    const openingText = this.worldState.enterCurrentRoom();
    this.transcript.recordSystem(openingText);
    return this.transcript.getLatestPrintableEntry();
  }

  getMetaMessage(messageId) {
    return this.worldState.getMetaMessage(messageId);
  }

  getStartupMetaMessage() {
    return this.worldState.getStartupMetaMessage();
  }

  submitCommand(rawInput) {
    const parsedCommand = this.commandParser.parse(rawInput);
    const response = this.execute(parsedCommand);
    this.transcript.recordTurn(rawInput, response);
    return this.transcript.getLatestPrintableEntry();
  }

  execute(command) {
    if (command.type === 'empty') {
      return 'Enter a command.';
    }

    this.worldState.incrementTurn();

    const normalizedCommand = this.normalizeCommand(command);
    const actionContext = this.createActionContext(normalizedCommand);
    const globalVerbHandler = this.actionRegistry.getGlobalVerbHandler(normalizedCommand.verb);
    if (globalVerbHandler) {
      return this.finalizeResponse(globalVerbHandler(actionContext));
    }

    const currentRoom = this.worldState.getCurrentRoom();
    if (currentRoom.hasVerb(normalizedCommand.verb)) {
      return this.finalizeResponse(currentRoom.performVerb(normalizedCommand.verb, actionContext));
    }

    return this.finalizeResponse(this.handleItemAction(normalizedCommand.directObject, normalizedCommand.verb, actionContext));
  }

  initializeActionRegistry() {
    this.actionRegistry.registerGlobalVerbs({
      look: context => this.handleLook(context.command),
      go: context => this.handleMovement(context.command.directObject),
      exits: () => this.worldState.getCurrentRoom().listExits(),
      take: context => this.worldState.takeItem(context.command.directObject),
      drop: context => this.worldState.dropItem(context.command.directObject),
      inventory: () => this.worldState.listInventory(),
      help: () => 'Try commands like LOOK, LOOK AT WINDOW, TAKE BREAD, READ INVITATION, LISTEN TO FOUNTAIN, SIT ON COUCH, GO SOUTH, INVENTORY, SAVE, or LOAD.',
      give: context => this.handleGive(context.command, context),
      ask: context => this.handleAsk(context.command, context),
      tell: context => this.handleTell(context.command, context),
      save: context => this.saveGame(context.command.directObject),
      load: context => this.loadGame(context.command.directObject),
      map: () => 'No map is available yet.',
    });

    this.actionRegistry.registerGlobalVerbs(this.manifest.verbs ?? {});
  }

  createActionContext(command, additionalContext = {}) {
    return this.worldState.createContext({
      session: this,
      command,
      ...additionalContext,
    });
  }

  normalizeCommand(command) {
    if (!['ask', 'tell'].includes(command.verb) || command.indirectObject || !command.directObject.includes(' ')) {
      return command;
    }

    const tokens = command.directObject.split(' ');
    for (let index = tokens.length - 1; index > 0; index -= 1) {
      const candidateTarget = tokens.slice(0, index).join(' ');
      const candidateTopic = tokens.slice(index).join(' ');
      if (this.worldState.findInteractiveTarget(candidateTarget)) {
        return {
          ...command,
          directObject: candidateTarget,
          indirectObject: candidateTopic,
        };
      }
    }

    return command;
  }

  finalizeResponse(primaryResponse) {
    const printedOutput = this.worldState.flushPrintedOutput();
    return [primaryResponse, ...printedOutput].filter(Boolean).join('\n');
  }

  handleLook(command) {
    if (!command.directObject || command.directObject === 'around') {
      return this.worldState.lookAroundCurrentRoom();
    }

    return this.worldState.describeObject(command.directObject);
  }

  handleMovement(direction) {
    if (!direction) {
      return 'Go where?';
    }

    const nextRoom = this.worldState.move(direction);
    if (!nextRoom) {
      return 'There is no exit in that direction.';
    }

    return `\n${this.worldState.enterCurrentRoom()}`;
  }

  performTargetAction(actionName, targetName, actionContext, fallbackText) {
    const resolvedTarget = this.worldState.findInteractiveTarget(targetName);
    if (!resolvedTarget) {
      return `You don't see ${targetName} here.`;
    }

    if (resolvedTarget.type === 'item') {
      return this.handleItemAction(targetName, actionName, actionContext);
    }

    const handler = resolvedTarget.target.actions?.[actionName];
    if (!handler) {
      return fallbackText;
    }

    if (typeof handler === 'function') {
      return handler({
        ...actionContext,
        target: resolvedTarget.target,
      });
    }

    return String(handler);
  }

  handleGive(command, actionContext) {
    if (!command.directObject) {
      return 'Give what?';
    }

    if (!command.indirectObject) {
      return `Give ${command.directObject} to whom?`;
    }

    const item = this.worldState.findInventoryItem(command.directObject);
    if (!item) {
      return `You don't have a ${command.directObject}.`;
    }

    return this.performTargetAction('give', command.indirectObject, {
      ...actionContext,
      item,
    }, `No one here seems interested in the ${item.name}.`);
  }

  handleAsk(command, actionContext) {
    if (!command.directObject) {
      return 'Ask whom?';
    }

    if (!command.indirectObject) {
      return `Ask ${command.directObject} about what?`;
    }

    return this.performTargetAction('ask', command.directObject, {
      ...actionContext,
      topic: command.indirectObject,
    }, `${command.directObject} offers no useful answer.`);
  }

  handleTell(command, actionContext) {
    if (!command.directObject) {
      return 'Tell whom?';
    }

    if (!command.indirectObject) {
      return `Tell ${command.directObject} what?`;
    }

    return this.performTargetAction('tell', command.directObject, {
      ...actionContext,
      topic: command.indirectObject,
    }, `${command.directObject} does not seem interested.`);
  }

  handleItemAction(itemName, actionName, actionContext = this.createActionContext({
    type: 'command',
    verb: actionName,
    directObject: itemName,
  })) {
    if (!itemName) {
      return `${actionName.charAt(0).toUpperCase()}${actionName.slice(1)} what?`;
    }

    const item = this.worldState.findVisibleItem(itemName);
    if (!item) {
      return `You don't see a ${itemName} here.`;
    }

    if (!item.hasAction(actionName)) {
      return `You can't ${actionName} the ${item.name}.`;
    }

    const result = item.performAction(actionName, {
      ...actionContext,
      item,
    });

    if (actionName === 'eat' || actionName === 'use') {
      const depleted = item.decreaseUses();
      if (depleted) {
        this.worldState.removeVisibleItem(item.name);
        return `${result} The ${item.name} is now used up.`;
      }
    }

    return result;
  }

  getStorage() {
    try {
      return globalThis.localStorage ?? null;
    } catch {
      return null;
    }
  }

  getSaveKey(slotName = 'quicksave') {
    const normalizedSlot = String(slotName || 'quicksave').trim().toLowerCase() || 'quicksave';
    const manifestId = this.manifest.id ?? 'game';
    return `textadventure:${manifestId}:save:${normalizedSlot}`;
  }

  createFreshManifest() {
    if (!this.manifestFactory) {
      return this.manifest;
    }

    this.manifest = this.manifestFactory();
    return this.manifest;
  }

  saveGame(slotName = 'quicksave') {
    const storage = this.getStorage();
    if (!storage) {
      return 'Saving is not available in this environment.';
    }

    const normalizedSlot = String(slotName || 'quicksave').trim().toLowerCase() || 'quicksave';
    storage.setItem(this.getSaveKey(normalizedSlot), JSON.stringify(this.worldState.exportSaveData()));
    return `Game saved to slot "${normalizedSlot}".`;
  }

  loadGame(slotName = 'quicksave') {
    const storage = this.getStorage();
    if (!storage) {
      return 'Loading is not available in this environment.';
    }

    const normalizedSlot = String(slotName || 'quicksave').trim().toLowerCase() || 'quicksave';
    const savedData = storage.getItem(this.getSaveKey(normalizedSlot));
    if (!savedData) {
      return `There is no saved game in slot "${normalizedSlot}".`;
    }

    try {
      const nextWorldState = new WorldState(this.createFreshManifest());
      nextWorldState.importSaveData(JSON.parse(savedData));
      this.worldState = nextWorldState;
      return `Game loaded from slot "${normalizedSlot}".\n\n${this.worldState.lookAroundCurrentRoom()}`;
    } catch (error) {
      return `Unable to load slot "${normalizedSlot}": ${error.message}`;
    }
  }
}

export default GameSession;