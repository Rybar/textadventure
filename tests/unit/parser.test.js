import test from 'node:test';
import assert from 'node:assert/strict';

import { createGameManifest } from '../../js/game/manifest.js';
import { CommandParser } from '../../js/engine/parser/commandParser.js';

test('parser resolves custom verb aliases and preposition object forms', () => {
  const parser = new CommandParser(createGameManifest().parserOptions);

  assert.deepEqual(parser.parse('put on red cloak'), {
    type: 'command',
    rawInput: 'put on red cloak',
    verb: 'wear',
    directObject: 'red cloak',
    preposition: null,
    indirectObject: null,
  });

  assert.deepEqual(parser.parse('listen to piano'), {
    type: 'command',
    rawInput: 'listen to piano',
    verb: 'listen',
    directObject: 'piano',
    preposition: null,
    indirectObject: null,
  });

  assert.deepEqual(parser.parse('ask ogres about leaving'), {
    type: 'command',
    rawInput: 'ask ogres about leaving',
    verb: 'ask',
    directObject: 'ogres',
    preposition: 'about',
    indirectObject: 'leaving',
  });
});