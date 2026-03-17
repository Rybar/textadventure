import { normalizeTriggerMap, runTriggerEntries } from '../authoring/triggers.js';

export class Room {
  constructor({
    id,
    title,
    description,
    exits = {},
    exitGuards = {},
    items = [],
    objects = {},
    verbs = {},
    onEnter = [],
    onLook = [],
    triggers = {},
    conditionalDescriptions = [],
  }) {
    this.id = id;
    this.title = title ?? id;
    this.description = description;
    this.exits = exits;
    this.exitGuards = exitGuards;
    this.items = items;
    this.objects = this.normalizeObjects(objects);
    this.verbs = verbs;
    this.triggers = this.normalizeTriggers({ onEnter, onLook, triggers });
    this.onEnter = this.triggers.enter;
    this.onLook = this.triggers.look;
    this.conditionalDescriptions = conditionalDescriptions;
  }

  normalizeTriggers({ onEnter = [], onLook = [], triggers = {} } = {}) {
    const normalizedTriggers = normalizeTriggerMap({ onEnter, onLook, triggers });

    return Object.fromEntries(
      Object.entries(normalizedTriggers).map(([triggerName, entries]) => [
        triggerName,
        entries.map((entry, index) => {
          if (!entry || typeof entry === 'function' || typeof entry === 'string') {
            return entry;
          }

          if (entry.once && !entry.id) {
            return {
              ...entry,
              id: `${this.id}:${triggerName}:${index}`,
            };
          }

          return entry;
        }),
      ]),
    );
  }

  normalizeObjects(objects = {}) {
    return Object.fromEntries(
      Object.entries(objects).map(([key, value]) => {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          return [key, {
            id: value.id ?? key,
            name: value.name ?? key,
            aliases: [key, ...(value.aliases ?? [])].map(alias => alias.toLowerCase()),
            description: value.description ?? '',
            actions: value.actions ?? {},
          }];
        }

        return [key, {
          id: key,
          name: key,
          aliases: [key.toLowerCase()],
          description: value,
          actions: {},
        }];
      }),
    );
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

  runTrigger(triggerName, context = {}) {
    return runTriggerEntries(this.triggers[triggerName] ?? [], context);
  }

  runHook(hookName, context = {}) {
    let triggerName = hookName;

    if (hookName === 'onEnter') {
      triggerName = 'enter';
    } else if (hookName === 'onLook') {
      triggerName = 'look';
    }

    return this.runTrigger(triggerName, context);
  }

  getExit(direction) {
    return this.exits[direction];
  }

  setExit(direction, targetRoomId) {
    this.exits[direction] = targetRoomId;
  }

  checkExit(direction, context = {}) {
    const guard = this.exitGuards[direction];
    if (!guard) {
      return null;
    }

    if (typeof guard === 'function') {
      return guard(context);
    }

    return String(guard);
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

  findObject(objectName) {
    const normalizedName = String(objectName).toLowerCase();

    return Object.values(this.objects).find(object => {
      return object.name.toLowerCase() === normalizedName || object.aliases.includes(normalizedName);
    }) ?? null;
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