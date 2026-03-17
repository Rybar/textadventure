export function normalizeTopicText(topic = '') {
  return String(topic ?? '').trim().toLowerCase();
}

export function topicMatches(topic, phrases = []) {
  const normalizedTopic = normalizeTopicText(topic);
  const normalizedPhrases = Array.isArray(phrases) ? phrases : [phrases];

  if (!normalizedTopic || normalizedPhrases.length === 0) {
    return false;
  }

  return normalizedPhrases
    .map(phrase => normalizeTopicText(phrase))
    .filter(Boolean)
    .some(phrase => normalizedTopic.includes(phrase));
}

function resolveRuleText(rule, context) {
  if (typeof rule.reply === 'function') {
    return rule.reply(context);
  }

  if (rule.reply !== undefined) {
    return rule.reply;
  }

  if (typeof rule.text === 'function') {
    return rule.text(context);
  }

  return rule.text ?? null;
}

function matchesRule(rule, context) {
  if (typeof rule.when === 'function' && !rule.when(context)) {
    return false;
  }

  if (rule.match === undefined) {
    return true;
  }

  return topicMatches(context.topic, rule.match);
}

export function createTopicResponder({ before, rules = [], fallback = null } = {}) {
  return rawContext => {
    const context = {
      ...rawContext,
      topic: normalizeTopicText(rawContext?.topic),
    };

    context.topicMatches = phrases => topicMatches(context.topic, phrases);

    if (typeof before === 'function') {
      before(context);
    }

    for (const rule of rules) {
      if (!matchesRule(rule, context)) {
        continue;
      }

      if (typeof rule.effect === 'function') {
        rule.effect(context);
      }

      return resolveRuleText(rule, context);
    }

    if (typeof fallback === 'function') {
      return fallback(context);
    }

    return fallback;
  };
}

export default createTopicResponder;