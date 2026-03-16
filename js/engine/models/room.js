export class Room {
  constructor({
    id,
    title,
    description,
    exits = {},
    items = [],
    objects = {},
  }) {
    this.id = id;
    this.title = title ?? id;
    this.description = description;
    this.exits = exits;
    this.items = items;
    this.objects = objects;
  }

  describe() {
    return this.description;
  }

  getExit(direction) {
    return this.exits[direction];
  }

  listExits() {
    const exits = Object.keys(this.exits);
    return exits.length > 0
      ? `Available exits: ${exits.join(', ')}`
      : 'There are no visible exits.';
  }

  addItem(item) {
    this.items.push(item);
  }

  removeItem(itemName) {
    const item = this.findItem(itemName);
    if (!item) {
      return null;
    }

    this.items = this.items.filter(candidate => candidate !== item);
    return item;
  }

  findItem(itemName) {
    return this.items.find(item => item.matchesName(itemName));
  }
}

export default Room;