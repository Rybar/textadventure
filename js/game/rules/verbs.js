const ITEM_ACTION_VERBS = [
  'read',
  'drink',
  'wear',
  'light',
  'listen',
  'sit',
  'sleep',
];

export function createGameVerbs() {
  return Object.fromEntries(
    ITEM_ACTION_VERBS.map(verb => [
      verb,
      ({ session, command }) => session.handleItemAction(command.directObject, verb),
    ]),
  );
}

export function createGameParserOptions() {
  return {
    verbAliases: {
      l: 'look',
      get: 'take',
      quaff: 'drink',
      sip: 'drink',
      don: 'wear',
      put: 'wear',
      offer: 'give',
      present: 'show',
      display: 'show',
      question: 'ask',
      speak: 'tell',
      illuminate: 'light',
      hear: 'listen',
      tug: 'pull',
      yank: 'pull',
      ring: 'pull',
      shove: 'push',
      nudge: 'push',
      consume: 'eat',
      devour: 'eat',
      sniff: 'smell',
      rest: 'sit',
      nap: 'sleep',
      slumber: 'sleep',
    },
    prepositionObjectVerbs: ['look', 'listen', 'sit', 'drink', 'wear', 'push', 'pull', 'smell', 'taste', 'eat'],
  };
}

export default createGameVerbs;