export class ActionRegistry {
  constructor() {
    this.globalVerbs = new Map();
  }

  registerGlobalVerb(verb, handler) {
    if (!verb || typeof handler !== 'function') {
      return;
    }

    this.globalVerbs.set(String(verb).toLowerCase(), handler);
  }

  registerGlobalVerbs(verbs = {}) {
    Object.entries(verbs).forEach(([verb, handler]) => {
      this.registerGlobalVerb(verb, handler);
    });
  }

  getGlobalVerbHandler(verb) {
    if (!verb) {
      return null;
    }

    return this.globalVerbs.get(String(verb).toLowerCase()) ?? null;
  }
}

export default ActionRegistry;