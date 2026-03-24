export class Item {
  constructor({
    id,
    name,
    description,
    actions = {},
    portable = true,
    stateDescription = '',
    aliases = [],
    uses = null,
    visible = true,
  }) {
    this.id = id ?? name;
    this.name = name;
    this.description = description;
    this.actions = actions;
    this.portable = portable;
    this.stateDescription = stateDescription;
    this.aliases = aliases.map(alias => alias.toLowerCase());
    this.uses = uses;
    this.visible = visible;
  }

  matchesName(name) {
    const normalizedName = name.toLowerCase();
    return this.name.toLowerCase() === normalizedName || this.aliases.includes(normalizedName);
  }

  updateStateDescription(newDescription) {
    this.stateDescription = newDescription;
  }

  updateDescription(newDescription) {
    this.description = newDescription;
  }

  updateVisibility(visible) {
    this.visible = Boolean(visible);
  }

  reveal() {
    this.updateVisibility(true);
  }

  hide() {
    this.updateVisibility(false);
  }

  hasAction(actionName) {
    return this.actions[actionName] !== undefined;
  }

  performAction(actionName, context = {}) {
    const action = this.actions[actionName];
    if (!action) {
      return `Cannot perform ${actionName} on ${this.name}.`;
    }

    if (typeof action === 'function') {
      return action.call(this, context);
    }

    return String(action);
  }

  decreaseUses() {
    if (this.uses === null) {
      return false;
    }

    this.uses -= 1;
    if (this.uses <= 0) {
      this.uses = 0;
      return true;
    }

    return false;
  }

  serializeState() {
    return {
      description: this.description,
      stateDescription: this.stateDescription,
      uses: this.uses,
      visible: this.visible,
    };
  }

  applyState(state = {}) {
    if (Object.hasOwn(state, 'description')) {
      this.description = state.description;
    }

    if (Object.hasOwn(state, 'stateDescription')) {
      this.stateDescription = state.stateDescription;
    }

    if (Object.hasOwn(state, 'uses')) {
      this.uses = state.uses;
    }

    if (Object.hasOwn(state, 'visible')) {
      this.visible = state.visible;
    }
  }
}

export default Item;