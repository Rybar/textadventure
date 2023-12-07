export class Item {
  constructor(name, description, actions, portable = true, stateDescription = "", life = null, aliases = []) {
      this.name = name;
      this.description = description;
      this.actions = actions; // Object with action name as key and action function as value
      this.portable = portable; //false for items that cannot be picked up
      this.stateDescription = stateDescription; // Description of the item's state (e.g. "The window is open.")
      this.alisases = aliases; // Array of aliases for the item's name, e.g. ["desk", "dsk"] for a desk item named "writing desk"
      this.life = life; // Number of times the item can be used before it is depleted
  }

  // Check if the given name matches the item name or any of its aliases
  matchesName(name) {
    return this.name === name || this.aliases.includes(name);
  }

  updateStateDescription(newDescription) {
    this.stateDescription = newDescription;
  }

  updateDescription(newDescription) {
    this.description = newDescription;
  }

  performAction(actionName) {
      if(this.actions[actionName]) {
          return this.actions[actionName](this);
      }
      return `Cannot perform ${actionName} on ${this.name}`;
  }

  decreaseLife() {
    if (this.life !== null) {
        this.life -= 1;
        if (this.life <= 0) {
            this.life = 0;
            return true; // Indicate that the item's life is depleted
        }
    }
    return false; // Life is not depleted or not applicable
}
}

export default Item;