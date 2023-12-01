export class Room {
  constructor(description, exits, items) {
      this.description = description;
      this.exits = exits; // Object with direction as key and room name as value
      this.items = items; // Array of Item objects
      this.features = []; // Array of Feature objects. features are things in the room that have descriptions but no actions and cannot be picked up
  }

  describe() {
      return this.description;
  }

  getExit(direction) {
      return this.exits[direction];
  }

  listExits() {
    return "Available exits: " + Object.keys(this.exits).join(', ');
  }

  addItem(item) {
      this.items.push(item);
  }

  removeItem(itemName) {
      this.items = this.items.filter(item => item.name !== itemName);
  }

  findItem(itemName) {
      return this.items.find(item => item.name === itemName);
  }

}

export default Room;