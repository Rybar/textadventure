export class GameState {
  constructor (rooms, startingRoomName) {
    this.rooms = rooms;
    this.currentRoom = this.rooms[startingRoomName]; // Replace with actual starting room
    this.inventory = []; // Player's inventory
  }

  handleCommand (command) {
    const words = command.toLowerCase ().split (' ');
    const action = words[0];
    const target = words.slice (1).join (' ');

    // Handling 'look' and 'look around' commands
    if (action === 'look') {
      if (target === '' || target === 'around') {
        return this.describeCurrentRoom ();
      } else if (target.startsWith ('at ')) {
        const objectName = target.substring (3).trim ();
        return this.describeObjectOrItem (objectName);
      }
    }

    // Handling 'go' command
    if (action === 'go') {
      return this.handleMovement (target);
    }

    // Handling inventory-related commands
    switch (action) {
      case 'take':
        return this.takeItem (target);
      case 'drop':
        return this.dropItem (target);
      case 'use':
        return this.useItem (target);
      case 'inventory':
        return this.showInventory ();
      // ... other cases ...
    }

    // Handling actions on items in the current room
    const item = this.currentRoom.findItem(target) || this.inventory.find(i => i.name === target);
    if (item && action in item.actions) {
        return item.actions[action].call(item);
    }

    return "I don't understand that command.";
  }

  takeItem(itemName) {
    const item = this.currentRoom.findItem(itemName);
    if (item) {
        if (!item.portable) {
            return `You can't take the ${itemName}.`;
        }
        this.inventory.push(item);
        this.currentRoom.removeItem(itemName);
        return `You take the ${itemName}.`;
    } else {
        return `There is no ${itemName} here to take.`;
    }
}

  dropItem (itemName) {
    const itemIndex = this.inventory.findIndex (item => item.name === itemName);
    if (itemIndex !== -1) {
      const [item] = this.inventory.splice (itemIndex, 1);
      this.currentRoom.addItem (item);
      return `You drop the ${itemName}.`;
    } else {
      return `You don't have a ${itemName}.`;
    }
  }

  useItem (itemName) {
    const item = this.inventory.find (item => item.name === itemName);
    if (item) {
      // Implement item-specific logic here, possibly affecting the room or game state
      return `You use the ${itemName}.`; // Placeholder response
    } else {
      return `You don't have a ${itemName}.`;
    }
  }

  showInventory () {
    if (this.inventory.length > 0) {
      return (
        'You have: ' + this.inventory.map (item => item.name).join (', ') + '.'
      );
    } else {
      return 'Your inventory is empty.';
    }
  }

  handleMovement (direction) {
    if (this.currentRoom.exits[direction]) {
      const nextRoomName = this.currentRoom.exits[direction];
      if (this.rooms[nextRoomName]) {
        this.currentRoom = this.rooms[nextRoomName];
        return `Moving to ${nextRoomName}. ${this.currentRoom.describe ()}`;
      } else {
        return `You can't go that way.`;
      }
    } else {
      return `There is no exit in that direction.`;
    }
  }

  describeCurrentRoom () {
    let description = this.currentRoom.describe ();

      // Include state descriptions from items in the room
      const stateDescriptions = this.currentRoom.items
      .map(item => item.stateDescription)
      .filter(desc => desc.length > 0)
      .join(" ");

      if (stateDescriptions) {
          description += " " + stateDescriptions + "\n";
      }

    if (this.currentRoom.items.length > 0) {
      description +=
        ' You can see the following items: ' +
        this.currentRoom.items.map (item => item.name).join (', ') +
        '.';
    } else {
      description += ' There are no items to see here.';
    }

    return description;
  }

  describeObjectOrItem(objectName) {
    // First, check for objects in the room
    if (this.currentRoom.objects && this.currentRoom.objects[objectName]) {
        return this.currentRoom.objects[objectName];
    }

    // Next, check for items in the room
    let item = this.currentRoom.findItem(objectName);
    if (item) {
        return item.description;
    }

    // Finally, check for items in the player's inventory
    item = this.inventory.find(item => item.name === objectName);
    if (item) {
        return item.description;
    }

    return `There is no ${objectName} to look at here.`;
}

}

export default GameState;
