import { CommandParser } from '../parser/commandParser.js';
import { Transcript } from './transcript.js';
import { WorldState } from './worldState.js';

export class GameSession {
  constructor(manifest, options = {}) {
    this.commandParser = options.commandParser ?? new CommandParser();
    this.transcript = options.transcript ?? new Transcript();
    this.worldState = new WorldState(manifest);
  }

  start() {
    const openingText = this.worldState.describeCurrentRoom();
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

    switch (command.verb) {
      case 'look':
        return this.handleLook(command);
      case 'go':
        return this.handleMovement(command.directObject);
      case 'exits':
        return this.worldState.getCurrentRoom().listExits();
      case 'take':
        return this.worldState.takeItem(command.directObject);
      case 'drop':
        return this.worldState.dropItem(command.directObject);
      case 'use':
      case 'eat':
        return this.handleItemAction(command.directObject, command.verb);
      case 'inventory':
        return this.worldState.listInventory();
      case 'help':
        return 'Try commands like LOOK, LOOK AT WINDOW, TAKE BREAD, GO SOUTH, INVENTORY, or EXITS.';
      default:
        return this.handleItemAction(command.directObject, command.verb);
    }
  }

  handleLook(command) {
    if (!command.directObject || command.directObject === 'around') {
      return this.worldState.describeCurrentRoom();
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

    return `\n${this.worldState.describeCurrentRoom()}`;
  }

  handleItemAction(itemName, actionName) {
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
      worldState: this.worldState,
      currentRoom: this.worldState.getCurrentRoom(),
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
}

export default GameSession;