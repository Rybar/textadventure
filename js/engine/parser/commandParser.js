const ARTICLES = new Set(['a', 'an', 'the']);
const PREPOSITIONS = new Set(['at', 'to', 'with', 'in', 'into', 'from', 'on', 'about']);
const DIRECTION_ALIASES = {
  n: 'north',
  s: 'south',
  e: 'east',
  w: 'west',
  ne: 'northeast',
  nw: 'northwest',
  se: 'southeast',
  sw: 'southwest',
  u: 'up',
  d: 'down',
};
const DIRECTIONS = new Set([
  'north',
  'south',
  'east',
  'west',
  'northeast',
  'northwest',
  'southeast',
  'southwest',
  'up',
  'down',
]);
const DEFAULT_VERB_ALIASES = {
  x: 'look',
  examine: 'look',
  inspect: 'look',
  get: 'take',
  i: 'inventory',
  inv: 'inventory',
};
const DEFAULT_PREPOSITION_OBJECT_VERBS = new Set(['look']);

function stripArticles(text) {
  return text
    .split(' ')
    .filter(token => token && !ARTICLES.has(token))
    .join(' ')
    .trim();
}

function normalizeDirection(token) {
  if (DIRECTION_ALIASES[token]) {
    return DIRECTION_ALIASES[token];
  }

  return DIRECTIONS.has(token) ? token : null;
}

export class CommandParser {
  constructor(options = {}) {
    const optionVerbAliases = options.verbAliases;

    this.verbAliases = {
      ...DEFAULT_VERB_ALIASES,
      ...optionVerbAliases,
    };
    this.prepositionObjectVerbs = new Set([
      ...DEFAULT_PREPOSITION_OBJECT_VERBS,
      ...(options.prepositionObjectVerbs ?? []),
    ]);
  }

  parse(rawInput = '') {
    const normalizedInput = rawInput.trim().toLowerCase().replaceAll(/\s+/g, ' ');

    if (!normalizedInput) {
      return {
        type: 'empty',
        rawInput,
      };
    }

    const tokens = normalizedInput.split(' ');
    const shorthandDirection = normalizeDirection(tokens[0]);
    if (tokens.length === 1 && shorthandDirection) {
      return {
        type: 'command',
        rawInput,
        verb: 'go',
        directObject: shorthandDirection,
        preposition: null,
        indirectObject: null,
      };
    }

    const rawVerb = tokens.shift();
    const verb = this.verbAliases[rawVerb] ?? rawVerb;
    const directDirection = verb === 'go' ? normalizeDirection(tokens[0]) : null;
    if (directDirection) {
      return {
        type: 'command',
        rawInput,
        verb: 'go',
        directObject: directDirection,
        preposition: null,
        indirectObject: null,
      };
    }

    const prepositionIndex = tokens.findIndex(token => PREPOSITIONS.has(token));

    let directObject = '';
    let preposition = null;
    let indirectObject = null;

    if (prepositionIndex >= 0) {
      preposition = tokens[prepositionIndex];
      directObject = stripArticles(tokens.slice(0, prepositionIndex).join(' '));
      indirectObject = stripArticles(tokens.slice(prepositionIndex + 1).join(' '));
    } else {
      directObject = stripArticles(tokens.join(' '));
    }

    if (this.prepositionObjectVerbs.has(verb) && !directObject && indirectObject) {
      directObject = indirectObject;
      preposition = null;
      indirectObject = null;
    }

    return {
      type: 'command',
      rawInput,
      verb,
      directObject,
      preposition,
      indirectObject,
    };
  }
}

export default CommandParser;