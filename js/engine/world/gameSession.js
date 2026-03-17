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
    this.commandParser = options.commandParser ?? new CommandParser();
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

    const actionContext = this.createActionContext(command);
    const globalVerbHandler = this.actionRegistry.getGlobalVerbHandler(command.verb);
    if (globalVerbHandler) {
      return this.finalizeResponse(globalVerbHandler(actionContext));
    }

    const currentRoom = this.worldState.getCurrentRoom();
    if (currentRoom.hasVerb(command.verb)) {
      return this.finalizeResponse(currentRoom.performVerb(command.verb, actionContext));
    }

    return this.finalizeResponse(this.handleItemAction(command.directObject, command.verb, actionContext));
  }

  initializeActionRegistry() {
    this.actionRegistry.registerGlobalVerbs({
      look: context => this.handleLook(context.command),
      go: context => this.handleMovement(context.command.directObject),
      exits: () => this.worldState.getCurrentRoom().listExits(),
      take: context => this.worldState.takeItem(context.command.directObject),
      drop: context => this.worldState.dropItem(context.command.directObject),
      inventory: () => this.worldState.listInventory(),
      help: () => 'Try commands like LOOK, LOOK AT WINDOW, TAKE BREAD, GO SOUTH, INVENTORY, EXITS, SAVE, or LOAD.',
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