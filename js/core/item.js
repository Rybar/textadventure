export class Item {
  constructor(name, description, actions, portable = true, stateDescription = "") {
      this.name = name;
      this.description = description;
      this.actions = actions; // Object with action name as key and action function as value
      this.portable = portable; //false for items that cannot be picked up
      this.stateDescription = stateDescription; // Description of the item's state (e.g. "The window is open.")
  }

  updateStateDescription(newDescription) {
    this.stateDescription = newDescription;
  }

  performAction(actionName) {
      if(this.actions[actionName]) {
          return this.actions[actionName](this);
      }
      return `Cannot perform ${actionName} on ${this.name}`;
  }
}

export default Item;