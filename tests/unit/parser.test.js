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

  assert.deepEqual(parser.parse('northwest'), {
    type: 'command',
    rawInput: 'northwest',
    verb: 'go',
    directObject: 'northwest',
    preposition: null,
    indirectObject: null,
  });

  assert.deepEqual(parser.parse('nw'), {
    type: 'command',
    rawInput: 'nw',
    verb: 'go',
    directObject: 'northwest',
    preposition: null,
    indirectObject: null,
  });

  assert.deepEqual(parser.parse('go southeast'), {
    type: 'command',
    rawInput: 'go southeast',
    verb: 'go',
    directObject: 'southeast',
    preposition: null,
    indirectObject: null,
  });

  assert.deepEqual(parser.parse('pull on bell pull'), {
    type: 'command',
    rawInput: 'pull on bell pull',
    verb: 'pull',
    directObject: 'bell pull',
    preposition: null,
    indirectObject: null,
  });

  assert.deepEqual(parser.parse('show invitation to oggaf'), {
    type: 'command',
    rawInput: 'show invitation to oggaf',
    verb: 'show',
    directObject: 'invitation',
    preposition: 'to',
    indirectObject: 'oggaf',
  });

  assert.deepEqual(parser.parse('use key on door'), {
    type: 'command',
    rawInput: 'use key on door',
    verb: 'use',
    directObject: 'key',
    preposition: 'on',
    indirectObject: 'door',
  });
});