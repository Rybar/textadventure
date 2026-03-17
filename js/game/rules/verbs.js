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
      question: 'ask',
      speak: 'tell',
      illuminate: 'light',
      hear: 'listen',
      rest: 'sit',
      nap: 'sleep',
      slumber: 'sleep',
    },
    prepositionObjectVerbs: ['look', 'listen', 'sit', 'drink', 'wear'],
  };
}

export default createGameVerbs;