export class Room {
  constructor({
    id,
    title,
    description,
    exits = {},
    items = [],
    objects = {},
    verbs = {},
    onEnter = [],
    onLook = [],
    conditionalDescriptions = [],
  }) {
    this.id = id;
    this.title = title ?? id;
    this.description = description;
    this.exits = exits;
    this.items = items;
    this.objects = objects;
    this.verbs = verbs;
    this.onEnter = Array.isArray(onEnter) ? onEnter : [onEnter];
    this.onLook = Array.isArray(onLook) ? onLook : [onLook];
    this.conditionalDescriptions = conditionalDescriptions;
  }

  describe(context = {}) {
    if (typeof this.description === 'function') {
      return this.description(context);
    }

    return this.description;
  }

  getConditionalDescriptions(context = {}) {
    return this.conditionalDescriptions
      .filter(entry => {
        if (typeof entry?.when !== 'function') {
          return Boolean(entry?.text);
        }

        return entry.when(context);
      })
      .map(entry => {
        if (typeof entry?.text === 'function') {
          return entry.text(context);
        }

        return entry?.text;
      })
      .filter(Boolean);
  }

  runHook(hookName, context = {}) {
    const hooks = Array.isArray(this[hookName]) ? this[hookName] : [];

    return hooks
      .map(hook => {
        if (typeof hook === 'function') {
          return hook(context);
        }

        return hook;
      })
      .filter(Boolean);
  }

  getExit(direction) {
    return this.exits[direction];
  }

  setExit(direction, targetRoomId) {
    this.exits[direction] = targetRoomId;
  }

  hasVerb(verb) {
    return this.verbs[verb] !== undefined;
  }

  performVerb(verb, context = {}) {
    const handler = this.verbs[verb];
    if (!handler) {
      return null;
    }

    if (typeof handler === 'function') {
      return handler(context);
    }

    return String(handler);
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