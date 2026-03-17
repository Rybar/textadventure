function normalizeEntries(entries = []) {
  return (Array.isArray(entries) ? entries : [entries]).filter(Boolean);
}

export function normalizeTriggerMap({ onEnter = [], onLook = [], triggers = {} } = {}) {
  const normalizedTriggers = Object.fromEntries(
    Object.entries(triggers).map(([triggerName, entries]) => [triggerName, normalizeEntries(entries)]),
  );

  return {
    ...normalizedTriggers,
    enter: [...normalizeEntries(onEnter), ...normalizeEntries(normalizedTriggers.enter)],
    look: [...normalizeEntries(onLook), ...normalizeEntries(normalizedTriggers.look)],
  };
}

function resolveTriggerEntryText(entry, context) {
  if (typeof entry.run === 'function') {
    return entry.run(context);
  }

  if (typeof entry.text === 'function') {
    return entry.text(context);
  }

  return entry.text ?? null;
}

export function runTriggerEntries(entries = [], context = {}) {
  return entries
    .map(entry => {
      if (typeof entry === 'function') {
        return entry(context);
      }

      if (typeof entry === 'string') {
        return entry;
      }

      if (!entry || typeof entry !== 'object') {
        return null;
      }

      if (entry.once && entry.id && typeof context.hasTriggeredEvent === 'function' && context.hasTriggeredEvent(entry.id)) {
        return null;
      }

      if (typeof entry.when === 'function' && !entry.when(context)) {
        return null;
      }

      const result = resolveTriggerEntryText(entry, context);

      if (entry.once && entry.id && typeof context.markTriggeredEvent === 'function') {
        context.markTriggeredEvent(entry.id);
      }

      return result;
    })
    .filter(Boolean);
}

export default runTriggerEntries;