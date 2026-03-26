import { ActionRegistry } from './actionRegistry.js';
import { CommandParser } from '../parser/commandParser.js';
import { Transcript } from './transcript.js';
import { WorldState } from './worldState.js';

export class GameSession {
  constructor(manifestSource, options = {}) {
    this.manifestFactory = options.manifestFactory
      ?? (typeof manifestSource === 'function' ? manifestSource : null);
    this.manifest = typeof manifestSource === 'function'
      ? manifestSource()
      : manifestSource;
    this.commandParser = options.commandParser ?? new CommandParser(this.manifest.parserOptions ?? {});
    this.transcript = options.transcript ?? new Transcript();
    this.actionRegistry = options.actionRegistry ?? new ActionRegistry();
    this.worldState = new WorldState(this.manifest);
    this.pendingMetaMessages = [];
    this.pendingInterfaceEvents = [];
    this.pendingClarification = null;
    this.debugState = {
      metaDebugEnabled: false,
    };
    this.initializeActionRegistry();
  }

  buildOpeningText(options = {}) {
    const openingPreface = this.getOpeningPreface(options);
    const openingText = this.worldState.enterCurrentRoom();
    return [openingPreface, openingText].filter(Boolean).join('\n\n');
  }

  start(options = {}) {
    if (options.resetTranscript) {
      this.transcript.clear();
    }

    this.transcript.recordSystem(this.buildOpeningText());
    return this.transcript.getLatestPrintableEntry();
  }

  getOpeningPreface(options = {}) {
    const lines = ['FEAST OF OSHREGAAL'];

    if (options.includeCredits ?? true) {
      lines.push(
        'A text adventure based on a Pathfinder campaign of the same name by Grizzelnit.',
        'Inspired by Goblin Punch\'s original D&D scenario, "The Meal of Oshregaal":',
        'https://goblinpunch.blogspot.com/2015/05/the-meal-of-oshregaal.html',
      );
    }

    return lines.join('\n');
  }

  getMetaMessage(messageId) {
    return this.worldState.getMetaMessage(messageId);
  }

  getStartupMetaMessage() {
    return this.worldState.getStartupMetaMessage();
  }

  getInterfaceModel() {
    return this.worldState.getInterfaceModel();
  }

  consumePendingMetaMessages() {
    const messages = [...this.pendingMetaMessages];
    this.pendingMetaMessages = [];
    return messages;
  }

  consumePendingInterfaceEvents() {
    const events = [...this.pendingInterfaceEvents];
    this.pendingInterfaceEvents = [];
    return events;
  }

  queueInterfaceEvent(event) {
    if (!event || typeof event !== 'object') {
      return;
    }

    this.pendingInterfaceEvents.push(event);
  }

  presentRestartOpening(openingText) {
    const openingEntryText = String(openingText ?? '').trim();
    if (!openingEntryText) {
      return '';
    }

    this.transcript.clear();
    this.transcript.recordSystem(openingEntryText);
    return this.transcript.getLatestPrintableEntry();
  }

  appendWorldPendingMetaMessages() {
    const messages = this.worldState.consumePendingMetaMessages();
    if (messages.length === 0) {
      return [];
    }

    this.pendingMetaMessages = [
      ...this.pendingMetaMessages,
      ...messages,
    ];

    return messages;
  }

  submitCommand(rawInput) {
    const clarificationExecution = this.tryHandlePendingClarification(rawInput);
    if (clarificationExecution) {
      if (
        clarificationExecution.normalizedCommand?.type !== 'empty'
        && clarificationExecution.consumeTurn
        && !clarificationExecution.skipPostTurnProcessing
      ) {
        this.worldState.advanceMetaMessages();
        this.appendWorldPendingMetaMessages();
      }

      this.transcript.recordTurn(rawInput, clarificationExecution.response);
      return this.transcript.getLatestPrintableEntry();
    }

    const parsedCommand = this.commandParser.parse(rawInput);
    const execution = this.execute(parsedCommand);
    const { normalizedCommand, response } = execution;
    const shouldCollectReactiveMessages = !execution.skipPostTurnProcessing && (
      execution.consumeTurn
      || this.playerIssuedDebugCommand(normalizedCommand)
      || this.playerIssuedMemoryShellCommand(normalizedCommand)
    );

    if (normalizedCommand.type !== 'empty' && !execution.usedClarification && !execution.skipPostTurnProcessing) {
      if (execution.consumeTurn) {
        this.worldState.advanceMetaMessages();
      }

      if (shouldCollectReactiveMessages) {
        this.collectReactiveLackeyMessages(rawInput, normalizedCommand);
      }

      this.appendWorldPendingMetaMessages();
    }

    this.transcript.recordTurn(rawInput, response);
    return this.transcript.getLatestPrintableEntry();
  }

  execute(command) {
    if (command.type === 'empty') {
      return this.createExecutionResult('Enter a command.', command, {
        consumeTurn: false,
      });
    }

    const normalizedCommand = this.normalizeCommand(command);
    const consumeTurn = !this.isNonTurnCommand(normalizedCommand.verb);
    const initialRoomId = this.worldState.currentRoomId;
    if (consumeTurn) {
      this.worldState.incrementTurn();
    }

    const actionContext = this.createActionContext(normalizedCommand);
    let primaryResponse = null;
    const globalVerbHandler = this.actionRegistry.getGlobalVerbHandler(normalizedCommand.verb);
    if (globalVerbHandler) {
      primaryResponse = globalVerbHandler(actionContext);
    } else {
      const currentRoom = this.worldState.getCurrentRoom();
      if (currentRoom.hasVerb(normalizedCommand.verb)) {
        primaryResponse = currentRoom.performVerb(normalizedCommand.verb, actionContext);
      } else {
        primaryResponse = this.handleGenericAction(normalizedCommand, actionContext);
      }
    }

    if (
      primaryResponse
      && typeof primaryResponse === 'object'
      && typeof primaryResponse.response === 'string'
      && primaryResponse.normalizedCommand
    ) {
      return primaryResponse;
    }

    const clarificationPending = Boolean(this.pendingClarification);
    if (clarificationPending && consumeTurn) {
      this.worldState.turns = Math.max(0, this.worldState.turns - 1);
    }

    const sceneOutputs = consumeTurn && !clarificationPending && this.shouldAdvanceCurrentRoomScene(normalizedCommand, initialRoomId)
      ? this.worldState.advanceCurrentRoomScene({
        command: normalizedCommand,
        actionResponse: primaryResponse,
        initialRoomId,
      })
      : [];

    const scheduledOutputs = consumeTurn && !clarificationPending
      ? this.worldState.advanceScheduledEvents()
      : [];

    const combinedResponse = [primaryResponse, ...sceneOutputs, ...scheduledOutputs].filter(Boolean).join('\n\n');

    return this.createExecutionResult(this.finalizeResponse(combinedResponse), normalizedCommand, {
      consumeTurn: consumeTurn && !clarificationPending,
    });
  }

  initializeActionRegistry() {
    this.actionRegistry.registerGlobalVerbs({
      look: context => this.handleLook(context.command, context),
      go: context => this.handleMovement(context.command.directObject),
      exits: () => this.worldState.getCurrentRoom().listExits(),
      take: context => this.handleTake(context.command),
      drop: context => this.handleDrop(context.command),
      inventory: () => this.worldState.listInventory(),
      help: () => this.getHelpText(),
      give: context => this.handleGive(context.command, context),
      show: context => this.handleShow(context.command, context),
      ask: context => this.handleAsk(context.command, context),
      tell: context => this.handleTell(context.command, context),
      open: context => this.handleGenericAction(context.command, context),
      close: context => this.handleGenericAction(context.command, context),
      push: context => this.handleGenericAction(context.command, context),
      pull: context => this.handleGenericAction(context.command, context),
      use: context => this.handleGenericAction(context.command, context),
      eat: context => this.handleGenericAction(context.command, context),
      smell: context => this.handleGenericAction(context.command, context),
      taste: context => this.handleGenericAction(context.command, context),
      greet: context => this.handleGenericAction(context.command, context),
      wait: () => 'You wait for a moment.',
      debugmeta: context => this.toggleMetaDebug(context.command.directObject),
      debughacker: context => this.toggleHackerDebug(context.command.directObject),
      debugpanel: context => this.debugPanel(context.command.directObject),
      scan: context => this.handleMemoryScan(context.command.directObject),
      peek: context => this.handleMemoryPeek(context.command.directObject),
      poke: context => this.handleMemoryPoke(context.command.directObject),
      nextmeta: () => this.forceNextMetaEvent(),
      nexthacker: () => this.forceNextHackerEvent(),
      save: context => this.saveGame(context.command.directObject),
      load: context => this.loadGame(context.command.directObject),
      restart: () => this.restartAdventure(),
      map: () => this.worldState.describeMapPanel(),
    });

    this.actionRegistry.registerGlobalVerbs(this.manifest.verbs ?? {});
  }

  getHelpText() {
    const segments = [
      'Try commands like LOOK, LOOK AT WINDOW, TAKE BREAD, OPEN CHEST, PULL BELL PULL, USE KEY ON DOOR, SHOW INVITATION TO OGGAF, ASK IMP ABOUT ESCAPE, GO SOUTH, INVENTORY, SAVE, or LOAD.',
    ];

    if (this.worldState.isPanelUnlocked('map')) {
      segments.push('MAP will open the spatial overlay.');
    }

    if (this.worldState.isPanelUnlocked('memory')) {
      segments.push('The shell is answering maintenance verbs now: SCAN, PEEK, and POKE.');
    }

    segments.push('RESTART begins a fresh run while preserving unlocked panel and shell progress.');

    return segments.join(' ');
  }

  shouldAdvanceCurrentRoomScene(command, initialRoomId) {
    if (!command || this.worldState.currentRoomId !== initialRoomId) {
      return false;
    }

    return !['go', 'save', 'load', 'inventory', 'map', 'help', 'exits'].includes(command.verb);
  }

  createActionContext(command, additionalContext = {}) {
    return this.worldState.createContext({
      session: this,
      command,
      ...additionalContext,
    });
  }

  isNonTurnCommand(verb) {
    return verb === 'debugmeta'
      || verb === 'debughacker'
      || verb === 'debugpanel'
      || verb === 'scan'
      || verb === 'peek'
      || verb === 'poke'
      || verb === 'nextmeta'
        || verb === 'nexthacker'
        || verb === 'restart';
  }

  ensureMemoryShellAvailable() {
    if (!this.worldState.isPanelUnlocked('memory')) {
      return 'No readable memory bus is exposed yet.';
    }

    if (!this.worldState.getFlag('shellContactAcknowledged')) {
      this.worldState.setFlag('shellContactAcknowledged', true);
    }

    if (!this.worldState.getFlag('memoryBusExposed')) {
      this.worldState.setFlag('memoryBusExposed', true);
    }

    return null;
  }

  parseMemoryAddressToken(token) {
    const normalizedToken = String(token ?? '').trim().toLowerCase();
    if (!normalizedToken) {
      return null;
    }

    if (/^0x[0-9a-f]+$/u.test(normalizedToken)) {
      return Number.parseInt(normalizedToken, 16);
    }

    if (/^\d+$/u.test(normalizedToken)) {
      return Number.parseInt(normalizedToken, 10);
    }

    return null;
  }

  parseMemoryBitToken(token) {
    const normalizedToken = String(token ?? '').trim().toLowerCase();
    if (!/^[0-7]$/u.test(normalizedToken)) {
      return null;
    }

    return Number.parseInt(normalizedToken, 10);
  }

  parseMemoryOperands(rawOperands = '') {
    return String(rawOperands ?? '')
      .trim()
      .split(/\s+/u)
      .filter(Boolean);
  }

  handleMemoryScan(rawOperands = '') {
    const unavailableMessage = this.ensureMemoryShellAvailable();
    if (unavailableMessage) {
      return unavailableMessage;
    }

    const operands = this.parseMemoryOperands(rawOperands);
    if (operands.length === 0) {
      return this.worldState.describeMemoryPanel();
    }

    const address = this.parseMemoryAddressToken(operands[0]);
    if (address === null) {
      return 'Usage: SCAN or SCAN <address>.';
    }

    const rowLine = this.worldState.renderMemoryRowLine(address);
    if (!rowLine) {
      return 'No readable row exists at that address.';
    }

    return rowLine;
  }

  handleMemoryPeek(rawOperands = '') {
    const unavailableMessage = this.ensureMemoryShellAvailable();
    if (unavailableMessage) {
      return unavailableMessage;
    }

    const operands = this.parseMemoryOperands(rawOperands);
    if (operands.length === 0) {
      return 'Usage: PEEK <address> [bit].';
    }

    const address = this.parseMemoryAddressToken(operands[0]);
    if (address === null) {
      return 'Usage: PEEK <address> [bit].';
    }

    if (operands.length === 1) {
      const rowLine = this.worldState.renderMemoryRowLine(address);
      return rowLine ?? 'No readable row exists at that address.';
    }

    const bit = this.parseMemoryBitToken(operands[1]);
    if (bit === null) {
      return 'Usage: PEEK <address> [bit].';
    }

    const entry = this.worldState.getMemoryFlagEntryByAddress(address, bit);
    if (!entry) {
      return 'No readable cell exists at that address.';
    }

    return `${this.worldState.formatMemoryAddress(entry.address)}.${entry.bit} ${entry.value ? '##' : '[]'}`;
  }

  handleMemoryPoke(rawOperands = '') {
    const unavailableMessage = this.ensureMemoryShellAvailable();
    if (unavailableMessage) {
      return unavailableMessage;
    }

    const operands = this.parseMemoryOperands(rawOperands);
    if (operands.length < 2) {
      return 'Usage: POKE <address> <bit> [toggle|set|clear].';
    }

    const address = this.parseMemoryAddressToken(operands[0]);
    const bit = this.parseMemoryBitToken(operands[1]);
    if (address === null || bit === null) {
      return 'Usage: POKE <address> <bit> [toggle|set|clear].';
    }

    const modeToken = String(operands[2] ?? 'toggle').trim().toLowerCase();
      let mode = null;
      if (modeToken === '1' || modeToken === 'on' || modeToken === 'set') {
        mode = 'set';
      } else if (modeToken === '0' || modeToken === 'off' || modeToken === 'clear') {
        mode = 'clear';
      } else if (modeToken === 'toggle') {
        mode = 'toggle';
      }

    if (!mode) {
      return 'Usage: POKE <address> <bit> [toggle|set|clear].';
    }

    return this.worldState.writeMemoryFlagByLocation(address, bit, mode).message;
  }

  normalizeInputText(rawInput) {
    return String(rawInput ?? '').trim().toLowerCase().replaceAll(/\s+/g, ' ');
  }

  playerEchoedLackeyLanguage(rawInput) {
    const normalizedInput = this.normalizeInputText(rawInput);
    if (!normalizedInput) {
      return false;
    }

    return this.worldState.getShownLackeyLexicon().some(token => normalizedInput.includes(token));
  }

  playerAddressedTheShell(rawInput) {
    const normalizedInput = this.normalizeInputText(rawInput);
    if (!normalizedInput) {
      return false;
    }

    const shellAddressPatterns = [
      /\bwho are you\b/u,
      /\bcan you (see|hear|read)\b/u,
      /\bdid you say\b/u,
      /\bcan you see (this|these|the) (message|messages|text)\b/u,
      /\b(see|read) (the|these|your) (message|messages|text)\b/u,
      /\b(sideband|monitor|screen|shell|subject|scenario|grammar)\b/u,
    ];

    return shellAddressPatterns.some(pattern => pattern.test(normalizedInput));
  }

  playerAddressedLackeys(rawInput) {
    const normalizedInput = this.normalizeInputText(rawInput);
    if (!normalizedInput) {
      return false;
    }

    const lackeyAddressPatterns = [
      /\bmara\b/u,
      /\bkellan\b/u,
      /\byou two\b/u,
      /\bwhich one of you\b/u,
      /\bare you watching\b/u,
      /\bwho is talking\b/u,
    ];

    return lackeyAddressPatterns.some(pattern => pattern.test(normalizedInput));
  }

  playerIssuedDebugCommand(command) {
    if (command?.type !== 'command') {
      return false;
    }

    return ['debugmeta', 'debughacker', 'debugpanel'].includes(command.verb);
  }

  playerIssuedMemoryShellCommand(command) {
    if (command?.type !== 'command') {
      return false;
    }

    return ['scan', 'peek', 'poke'].includes(command.verb);
  }

  collectReactiveLackeyMessages(rawInput, normalizedCommand) {
    if (!this.worldState.hasSeenLackeyConversation()) {
      return [];
    }

    if (this.playerEchoedLackeyLanguage(rawInput)) {
      return this.worldState.triggerReactiveLackeyConversation('echoed-sideband');
    }

    if (this.playerAddressedLackeys(rawInput)) {
      return this.worldState.triggerReactiveLackeyConversation('outside-scope-input');
    }

    if (normalizedCommand.type === 'command' && this.playerAddressedTheShell(rawInput)) {
      return this.worldState.triggerReactiveLackeyConversation('outside-scope-input');
    }

    if (this.playerIssuedDebugCommand(normalizedCommand)) {
      return this.worldState.triggerReactiveLackeyConversation('debug-command-probe');
    }

    if (this.playerIssuedMemoryShellCommand(normalizedCommand) && this.worldState.isPanelUnlocked('memory')) {
      return this.worldState.triggerReactiveLackeyConversation('memory-shell-probe');
    }

    return [];
  }

  normalizeCommand(command) {
    if (!['ask', 'tell'].includes(command.verb) || command.indirectObject || !command.directObject.includes(' ')) {
      return command;
    }

    const tokens = command.directObject.split(' ');
    for (let index = tokens.length - 1; index > 0; index -= 1) {
      const candidateTarget = tokens.slice(0, index).join(' ');
      const candidateTopic = tokens.slice(index).join(' ');
      if (this.worldState.resolveInteractiveTarget(candidateTarget).status !== 'none') {
        return {
          ...command,
          directObject: candidateTarget,
          indirectObject: candidateTopic,
        };
      }
    }

    return command;
  }

  createExecutionResult(response, normalizedCommand, options = {}) {
    return {
      response,
      normalizedCommand,
      consumeTurn: options.consumeTurn ?? false,
      usedClarification: options.usedClarification ?? false,
      skipPostTurnProcessing: options.skipPostTurnProcessing ?? false,
    };
  }

  normalizeClarificationInput(rawInput) {
    return this.normalizeInputText(rawInput).replace(/^(?:the|a|an)\s+/u, '');
  }

  getClarificationOptionLabel(candidate, candidates = []) {
    const baseLabel = candidate.target.name;
    const matchingNameCount = candidates.filter(other => other.target.name === candidate.target.name).length;
    if (matchingNameCount <= 1) {
      return baseLabel;
    }

    if (candidate.scope === 'inventory') {
      return `${baseLabel} (inventory)`;
    }

    if (candidate.type === 'object') {
      return `${baseLabel} (object)`;
    }

    return `${baseLabel} (here)`;
  }

  buildClarificationPrompt(requestedName, candidates) {
    const requestedText = requestedName ? ` for "${requestedName}"` : '';
    const optionLines = candidates.map((candidate, index) => `${index + 1}. ${this.getClarificationOptionLabel(candidate, candidates)}`);
    return [`Which do you mean${requestedText}?`, ...optionLines, 'Reply with a number or CANCEL.'].join('\n');
  }

  requestClarification({ command, property, resolvedProperty, requestedName, candidates }) {
    this.pendingClarification = {
      command: { ...command },
      property,
      resolvedProperty,
      requestedName,
      candidates,
    };

    return this.buildClarificationPrompt(requestedName, candidates);
  }

  clearPendingClarification() {
    this.pendingClarification = null;
  }

  getClarificationCandidateTerms(candidate) {
    const terms = new Set([
      candidate.target.name.toLowerCase(),
      ...candidate.target.aliases,
    ]);

    if (candidate.scope === 'inventory') {
      terms.add(`inventory ${candidate.target.name.toLowerCase()}`);
      terms.add(`${candidate.target.name.toLowerCase()} in inventory`);
    }

    if (candidate.type === 'object') {
      terms.add(`object ${candidate.target.name.toLowerCase()}`);
    }

    return terms;
  }

  selectClarificationCandidate(rawInput, candidates) {
    const normalizedInput = this.normalizeClarificationInput(rawInput);
    if (!normalizedInput) {
      return {
        status: 'invalid',
        candidate: null,
      };
    }

    const numericSelection = Number.parseInt(normalizedInput, 10);
    if (String(numericSelection) === normalizedInput && numericSelection >= 1 && numericSelection <= candidates.length) {
      return {
        status: 'resolved',
        candidate: candidates[numericSelection - 1],
      };
    }

    const matchingCandidates = candidates.filter(candidate => this.getClarificationCandidateTerms(candidate).has(normalizedInput));
    if (matchingCandidates.length === 1) {
      return {
        status: 'resolved',
        candidate: matchingCandidates[0],
      };
    }

    if (matchingCandidates.length > 1) {
      return {
        status: 'ambiguous',
        candidate: null,
      };
    }

    return {
      status: 'invalid',
      candidate: null,
    };
  }

  tryHandlePendingClarification(rawInput) {
    if (!this.pendingClarification) {
      return null;
    }

    const normalizedInput = this.normalizeClarificationInput(rawInput);
    if (['cancel', 'nevermind', 'never mind'].includes(normalizedInput)) {
      const cancelledCommand = this.pendingClarification.command;
      this.clearPendingClarification();
      return this.createExecutionResult('Clarification cancelled.', cancelledCommand, {
        consumeTurn: false,
        usedClarification: true,
      });
    }

    const selection = this.selectClarificationCandidate(rawInput, this.pendingClarification.candidates);
    if (selection.status !== 'resolved') {
      const response = selection.status === 'ambiguous'
        ? 'That still matches more than one option.\n'
        : '';

      return this.createExecutionResult(
        `${response}${this.buildClarificationPrompt(
          this.pendingClarification.requestedName,
          this.pendingClarification.candidates,
        )}`,
        this.pendingClarification.command,
        {
          consumeTurn: false,
          usedClarification: true,
        },
      );
    }

    const pendingClarification = this.pendingClarification;
    this.clearPendingClarification();
    return {
      ...this.execute({
        ...pendingClarification.command,
        [pendingClarification.resolvedProperty]: selection.candidate,
      }),
      usedClarification: true,
    };
  }

  resolveCommandTarget({ command, property, resolvedProperty, resolve, missingMessage }) {
    const targetName = command[property];
    if (!targetName) {
      return {
        status: 'missing',
        response: typeof missingMessage === 'function' ? missingMessage(targetName) : missingMessage,
      };
    }

    if (command[resolvedProperty]) {
      return {
        status: 'resolved',
        candidate: command[resolvedProperty],
      };
    }

    const resolution = resolve(targetName);
    if (resolution.status === 'none') {
      return {
        status: 'missing',
        response: typeof missingMessage === 'function' ? missingMessage(targetName) : missingMessage,
      };
    }

    if (resolution.status === 'ambiguous') {
      return {
        status: 'clarification',
        response: this.requestClarification({
          command,
          property,
          resolvedProperty,
          requestedName: targetName,
          candidates: resolution.candidates,
        }),
      };
    }

    return {
      status: 'resolved',
      candidate: resolution.candidate,
    };
  }

  finalizeResponse(primaryResponse) {
    const printedOutput = this.worldState.flushPrintedOutput();
    return [primaryResponse, ...printedOutput].filter(Boolean).join('\n');
  }

  toggleMetaDebug(argument = '') {
    const normalizedArgument = String(argument ?? '').trim().toLowerCase();

    if (normalizedArgument === 'on') {
      this.debugState.metaDebugEnabled = true;
      return 'Meta debug mode enabled. Use NEXTMETA to preview the next scheduled meta exchange.';
    }

    if (normalizedArgument === 'off') {
      this.debugState.metaDebugEnabled = false;
      return 'Meta debug mode disabled.';
    }

    this.debugState.metaDebugEnabled = !this.debugState.metaDebugEnabled;
    return this.debugState.metaDebugEnabled
      ? 'Meta debug mode enabled. Use NEXTMETA to preview the next scheduled meta exchange.'
      : 'Meta debug mode disabled.';
  }

  toggleHackerDebug(argument = '') {
    const response = this.toggleMetaDebug(argument);
    return response.replaceAll('NEXTMETA', 'NEXTHACKER');
  }

  forceNextMetaEvent() {
    if (!this.debugState.metaDebugEnabled) {
      return 'Meta debug mode is off. Use DEBUGMETA to enable it first.';
    }

    const messages = this.worldState.forceNextMetaMessages();
    this.pendingMetaMessages = this.worldState.consumePendingMetaMessages();

    if (messages.length === 0) {
      return 'No additional meta messages are queued.';
    }

    return `Queued ${messages.length} meta ${messages.length === 1 ? 'message' : 'messages'} for preview.`;
  }

  forceNextHackerEvent() {
    if (!this.debugState.metaDebugEnabled) {
      return 'Meta debug mode is off. Use DEBUGHACKER to enable it first.';
    }

    const messages = this.worldState.forceNextHackerMessages();
    this.pendingMetaMessages = this.worldState.consumePendingMetaMessages();

    if (messages.length === 0) {
      return 'No additional hacker messages are queued.';
    }

    return `Queued ${messages.length} hacker ${messages.length === 1 ? 'message' : 'messages'} for preview.`;
  }

  debugPanel(argument = '') {
    const normalizedArgument = String(argument ?? '').trim().toLowerCase();

    if (!normalizedArgument) {
      return 'Specify a panel: MAP, INVENTORY, MEMORY, ALL, or RESET.';
    }

    if (normalizedArgument === 'all') {
      ['map', 'inventory', 'memory'].forEach(panelId => this.worldState.unlockPanel(panelId));
      return 'All debug panels unlocked.';
    }

    if (normalizedArgument === 'reset') {
      ['map', 'inventory', 'memory'].forEach(panelId => {
        this.worldState.lockPanel(panelId);
        this.worldState.clearPanelDegradation(panelId);
      });
      return 'All debug panels reset to locked.';
    }

    if (!this.worldState.getPanelState(normalizedArgument)) {
      return `Unknown panel "${normalizedArgument}".`;
    }

    this.worldState.togglePanel(normalizedArgument);
    const isUnlocked = this.worldState.isPanelUnlocked(normalizedArgument);
    return `${normalizedArgument.toUpperCase()} panel ${isUnlocked ? 'unlocked' : 'locked'}.`;
  }

  handleLook(command, actionContext = this.createActionContext(command)) {
    if (!command.directObject || command.directObject === 'around') {
      return this.worldState.lookAroundCurrentRoom();
    }

    const resolution = this.resolveCommandTarget({
      command,
      property: 'directObject',
      resolvedProperty: 'resolvedDirectTarget',
      resolve: targetName => this.worldState.resolveInteractiveTarget(targetName),
      missingMessage: targetName => `There is no ${targetName} to look at here.`,
    });

    if (resolution.status !== 'resolved') {
      return resolution.response;
    }

    if (resolution.candidate.type === 'object') {
      return typeof resolution.candidate.target.description === 'function'
        ? resolution.candidate.target.description(actionContext)
        : resolution.candidate.target.description;
    }

    const item = resolution.candidate.target;
    if (item.hasAction('look')) {
      return item.performAction('look', {
        ...actionContext,
        item,
      });
    }

    return this.worldState.describeItem(item, actionContext);
  }

  handleMovement(direction) {
    if (!direction) {
      return 'Go where?';
    }

    const movementResult = this.worldState.tryMove(direction);
    if (!movementResult.success) {
      return movementResult.message;
    }

    return `\n${this.worldState.enterCurrentRoom()}`;
  }

  capitalizeVerb(verb = '') {
    return `${verb.charAt(0).toUpperCase()}${verb.slice(1)}`;
  }

  getResolvedTargetName(resolvedTarget, fallbackName = '') {
    if (!resolvedTarget?.target) {
      return fallbackName;
    }

    return resolvedTarget.target.name ?? fallbackName;
  }

  invokeResolvedAction(resolvedTarget, actionName, actionContext, extraContext = {}) {
    if (!resolvedTarget) {
      return {
        handled: false,
        result: null,
      };
    }

    if (resolvedTarget.type === 'item') {
      if (!resolvedTarget.target.hasAction(actionName)) {
        return {
          handled: false,
          result: null,
        };
      }

      return {
        handled: true,
        result: resolvedTarget.target.performAction(actionName, {
          ...actionContext,
          ...extraContext,
          item: extraContext.item ?? resolvedTarget.target,
          target: resolvedTarget.target,
          targetItem: resolvedTarget.target,
        }),
      };
    }

    const handler = resolvedTarget.target.actions?.[actionName];
    if (!handler) {
      return {
        handled: false,
        result: null,
      };
    }

    if (typeof handler === 'function') {
      return {
        handled: true,
        result: handler({
          ...actionContext,
          ...extraContext,
          target: resolvedTarget.target,
        }),
      };
    }

    return {
      handled: true,
      result: String(handler),
    };
  }

  finalizeConsumableActionResult(result, item, actionName) {
    if (!item || !['eat', 'use'].includes(actionName)) {
      return result;
    }

    const depleted = item.decreaseUses();
    if (!depleted) {
      return result;
    }

    this.worldState.removeItemById(item.id);
    return `${result} The ${item.name} is now used up.`;
  }

  performTargetAction(actionName, resolvedTarget, actionContext, fallbackText) {
    if (resolvedTarget.type === 'item') {
      return this.handleItemAction(resolvedTarget.target.name, actionName, actionContext, resolvedTarget);
    }

    const handler = resolvedTarget.target.actions?.[actionName];
    if (!handler) {
      return fallbackText;
    }

    if (typeof handler === 'function') {
      return handler({
        ...actionContext,
        target: resolvedTarget.target,
      });
    }

    return String(handler);
  }

  handleShow(command, actionContext) {
    if (!command.directObject) {
      return 'Show what?';
    }

    if (!command.indirectObject) {
      return `Show ${command.directObject} to whom?`;
    }

    const itemResolution = this.resolveCommandTarget({
      command,
      property: 'directObject',
      resolvedProperty: 'resolvedDirectTarget',
      resolve: targetName => this.worldState.resolveVisibleItem(targetName),
      missingMessage: targetName => `You don't see a ${targetName} here.`,
    });
    if (itemResolution.status !== 'resolved') {
      return itemResolution.response;
    }

    const targetResolution = this.resolveCommandTarget({
      command,
      property: 'indirectObject',
      resolvedProperty: 'resolvedIndirectTarget',
      resolve: targetName => this.worldState.resolveInteractiveTarget(targetName),
      missingMessage: targetName => `You don't see ${targetName} here.`,
    });
    if (targetResolution.status !== 'resolved') {
      return targetResolution.response;
    }

    const item = itemResolution.candidate.target;
    const resolvedTarget = targetResolution.candidate;

    const showContext = {
      ...actionContext,
      item,
      sourceItem: item,
      shownItem: item,
      directTarget: item,
      directTargetType: 'item',
      indirectTarget: resolvedTarget.target,
      indirectTargetType: resolvedTarget.type,
    };

    const showResult = this.invokeResolvedAction(resolvedTarget, 'show', actionContext, showContext);
    if (showResult.handled) {
      return showResult.result;
    }

    const giveResult = this.invokeResolvedAction(resolvedTarget, 'give', actionContext, showContext);
    if (giveResult.handled) {
      return giveResult.result;
    }

    return `${command.indirectObject} shows no interest in the ${item.name}.`;
  }

  handleGive(command, actionContext) {
    if (!command.directObject) {
      return 'Give what?';
    }

    if (!command.indirectObject) {
      return `Give ${command.directObject} to whom?`;
    }

    const itemResolution = this.resolveCommandTarget({
      command,
      property: 'directObject',
      resolvedProperty: 'resolvedDirectTarget',
      resolve: targetName => this.worldState.resolveInventoryItem(targetName),
      missingMessage: targetName => `You don't have a ${targetName}.`,
    });
    if (itemResolution.status !== 'resolved') {
      return itemResolution.response;
    }

    const targetResolution = this.resolveCommandTarget({
      command,
      property: 'indirectObject',
      resolvedProperty: 'resolvedIndirectTarget',
      resolve: targetName => this.worldState.resolveInteractiveTarget(targetName),
      missingMessage: targetName => `You don't see ${targetName} here.`,
    });
    if (targetResolution.status !== 'resolved') {
      return targetResolution.response;
    }

    const item = itemResolution.candidate.target;
    return this.performTargetAction('give', targetResolution.candidate, {
      ...actionContext,
      item,
    }, `No one here seems interested in the ${item.name}.`);
  }

  handleAsk(command, actionContext) {
    if (!command.directObject) {
      return 'Ask whom?';
    }

    if (!command.indirectObject) {
      return `Ask ${command.directObject} about what?`;
    }

    const targetResolution = this.resolveCommandTarget({
      command,
      property: 'directObject',
      resolvedProperty: 'resolvedDirectTarget',
      resolve: targetName => this.worldState.resolveInteractiveTarget(targetName),
      missingMessage: targetName => `You don't see ${targetName} here.`,
    });
    if (targetResolution.status !== 'resolved') {
      return targetResolution.response;
    }

    return this.performTargetAction('ask', targetResolution.candidate, {
      ...actionContext,
      topic: command.indirectObject,
    }, `${command.directObject} offers no useful answer.`);
  }

  handleTell(command, actionContext) {
    if (!command.directObject) {
      return 'Tell whom?';
    }

    if (!command.indirectObject) {
      return `Tell ${command.directObject} what?`;
    }

    const targetResolution = this.resolveCommandTarget({
      command,
      property: 'directObject',
      resolvedProperty: 'resolvedDirectTarget',
      resolve: targetName => this.worldState.resolveInteractiveTarget(targetName),
      missingMessage: targetName => `You don't see ${targetName} here.`,
    });
    if (targetResolution.status !== 'resolved') {
      return targetResolution.response;
    }

    return this.performTargetAction('tell', targetResolution.candidate, {
      ...actionContext,
      topic: command.indirectObject,
    }, `${command.directObject} does not seem interested.`);
  }

  handleTake(command) {
    if (!command.directObject) {
      return 'Take what?';
    }

    const resolution = this.resolveCommandTarget({
      command,
      property: 'directObject',
      resolvedProperty: 'resolvedDirectTarget',
      resolve: targetName => this.worldState.resolveCandidates(this.worldState.getRoomItemCandidates(targetName)),
      missingMessage: targetName => `There is no ${targetName} here to take.`,
    });
    if (resolution.status !== 'resolved') {
      return resolution.response;
    }

    const item = resolution.candidate.target;
    if (!item.portable) {
      return `You can't take the ${item.name}.`;
    }

    this.worldState.removeItemById(item.id);
    this.worldState.inventory.push(item);
    this.worldState.syncNaturalPanelUnlocks();

    const takeText = item.hasAction('take')
      ? item.performAction('take', this.createActionContext(command, {
        item,
        target: item,
      }))
      : null;

    return [`You take the ${item.name}.`, takeText].filter(Boolean).join('\n\n');
  }

  handleDrop(command) {
    if (!command.directObject) {
      return 'Drop what?';
    }

    const resolution = this.resolveCommandTarget({
      command,
      property: 'directObject',
      resolvedProperty: 'resolvedDirectTarget',
      resolve: targetName => this.worldState.resolveInventoryItem(targetName),
      missingMessage: targetName => `You don't have a ${targetName}.`,
    });
    if (resolution.status !== 'resolved') {
      return resolution.response;
    }

    const item = resolution.candidate.target;
    this.worldState.removeItemById(item.id);
    this.worldState.getCurrentRoom().addItem(item);
    return `You drop the ${item.name}.`;
  }

  handleGenericAction(command, actionContext = this.createActionContext(command)) {
    const actionName = command.verb;

    if (!command.directObject) {
      return `${this.capitalizeVerb(actionName)} what?`;
    }

    const directResolution = this.resolveCommandTarget({
      command,
      property: 'directObject',
      resolvedProperty: 'resolvedDirectTarget',
      resolve: targetName => this.worldState.resolveInteractiveTarget(targetName),
      missingMessage: targetName => `You don't see ${targetName} here.`,
    });
    if (directResolution.status !== 'resolved') {
      return directResolution.response;
    }

    const directTarget = directResolution.candidate;

    let indirectTarget = null;
    if (command.indirectObject) {
      const indirectResolution = this.resolveCommandTarget({
        command,
        property: 'indirectObject',
        resolvedProperty: 'resolvedIndirectTarget',
        resolve: targetName => this.worldState.resolveInteractiveTarget(targetName),
        missingMessage: targetName => `You don't see ${targetName} here.`,
      });
      if (indirectResolution.status !== 'resolved') {
        return indirectResolution.response;
      }

      indirectTarget = indirectResolution.candidate;
    }

    const directResult = this.invokeResolvedAction(directTarget, actionName, actionContext, {
      directTarget: directTarget.target,
      directTargetType: directTarget.type,
      indirectTarget: indirectTarget?.target ?? null,
      indirectTargetType: indirectTarget?.type ?? null,
      tool: indirectTarget?.type === 'item' ? indirectTarget.target : null,
    });

    if (directResult.handled) {
      return this.finalizeConsumableActionResult(
        directResult.result,
        directTarget.type === 'item' ? directTarget.target : null,
        actionName,
      );
    }

    if (indirectTarget && directTarget.type === 'item') {
      const indirectResult = this.invokeResolvedAction(indirectTarget, actionName, actionContext, {
        item: directTarget.target,
        sourceItem: directTarget.target,
        directTarget: directTarget.target,
        directTargetType: directTarget.type,
        indirectTarget: indirectTarget.target,
        indirectTargetType: indirectTarget.type,
        tool: directTarget.target,
      });

      if (indirectResult.handled) {
        return this.finalizeConsumableActionResult(indirectResult.result, directTarget.target, actionName);
      }
    }

    if (command.indirectObject) {
      return `You can't ${actionName} ${command.directObject} ${command.preposition ?? 'with'} ${command.indirectObject}.`;
    }

    return `You can't ${actionName} the ${this.getResolvedTargetName(directTarget, command.directObject)}.`;
  }

  handleItemAction(itemName, actionName, actionContext = this.createActionContext({
    type: 'command',
    verb: actionName,
    directObject: itemName,
  }), resolvedItem = null) {
    if (!itemName) {
      return `${actionName.charAt(0).toUpperCase()}${actionName.slice(1)} what?`;
    }

    const item = resolvedItem?.target ?? this.worldState.findVisibleItem(itemName);
    if (!item) {
      return `You don't see a ${itemName} here.`;
    }

    if (!item.hasAction(actionName)) {
      return `You can't ${actionName} the ${item.name}.`;
    }

    const result = item.performAction(actionName, {
      ...actionContext,
      item,
    });

    return this.finalizeConsumableActionResult(result, item, actionName);
  }

  getStorage() {
    try {
      return globalThis.localStorage || null;
    } catch {
      return null;
    }
  }

  getSaveKey(slotName = 'quicksave') {
    const normalizedSlot = String(slotName || 'quicksave').trim().toLowerCase() || 'quicksave';
    const manifestId = this.manifest.id ?? 'game';
    return `textadventure:${manifestId}:save:${normalizedSlot}`;
  }

  getPersistentRestartFlagNames() {
    return [
      'hasExperiencedGameOver',
      'routineGameOverSeen',
      'grandfatherBedGameOverSeen',
      'correctionGameOverSeen',
      'blackWindSapGameOverSeen',
      'peafowlGameOverSeen',
      'rubyEyesGameOverSeen',
      'bloodHomunculusGameOverSeen',
      'coinChestGameOverSeen',
      'holocaustCandleGameOverSeen',
      'oozeFormGameOverSeen',
    ];
  }

  captureRestartPersistence({ includeQueuedMetaMessages = false } = {}) {
    return {
      metaState: {
        shownConversationIds: [...(this.worldState.metaState?.shownConversationIds ?? [])],
        shownHackerIds: [...(this.worldState.metaState?.shownHackerIds ?? [])],
        shownReactiveLackeyIds: [...(this.worldState.metaState?.shownReactiveLackeyIds ?? [])],
        reactiveLackeyCounts: this.worldState.metaState?.reactiveLackeyCounts
          ? { ...this.worldState.metaState.reactiveLackeyCounts }
          : {},
        shownMilestoneIds: [...(this.worldState.metaState?.shownMilestoneIds ?? [])],
        shownEndingIds: [...(this.worldState.metaState?.shownEndingIds ?? [])],
        gameOverCount: Number(this.worldState.metaState?.gameOverCount ?? 0),
        gameOverBranchCounts: this.worldState.metaState?.gameOverBranchCounts
          ? { ...this.worldState.metaState.gameOverBranchCounts }
          : {},
        lastGameOverBranchId: this.worldState.metaState?.lastGameOverBranchId ?? null,
      },
      panelState: Object.fromEntries(
        Object.entries(this.worldState.panelState ?? {}).map(([panelId, state]) => [panelId, {
          unlocked: Boolean(state?.unlocked),
          degraded: null,
        }]),
      ),
      persistentFlags: Object.fromEntries(
        this.getPersistentRestartFlagNames().map(flagName => [flagName, Boolean(this.worldState.getFlag(flagName))]),
      ),
      queuedMetaMessages: includeQueuedMetaMessages
        ? this.worldState.consumePendingMetaMessages()
        : [],
    };
  }

  applyRestartPersistence(nextWorldState, persistence = {}) {
    nextWorldState.metaState = nextWorldState.normalizeMetaState(persistence.metaState ?? nextWorldState.metaState);
    nextWorldState.panelState = nextWorldState.normalizePanelState(persistence.panelState ?? nextWorldState.panelState);

    Object.entries(persistence.persistentFlags ?? {}).forEach(([flagName, value]) => {
      if (flagName in nextWorldState.flags) {
        nextWorldState.flags[flagName] = value;
      }
    });
  }

  restartAdventure({
    preface = 'You force the house back to its opening lie.',
    persistence = this.captureRestartPersistence(),
    skipPostTurnProcessing = true,
    deferOpeningText = false,
    restartDelayMs = 5000,
    includeCreditsInOpening = true,
  } = {}) {
    const nextWorldState = new WorldState(this.createFreshManifest());
    this.applyRestartPersistence(nextWorldState, persistence);
    this.worldState = nextWorldState;
    this.pendingClarification = null;
    this.pendingMetaMessages = [...(persistence.queuedMetaMessages ?? [])];
    const openingText = this.buildOpeningText({ includeCredits: includeCreditsInOpening });

    if (deferOpeningText) {
      this.queueInterfaceEvent({
        type: 'restart-transition',
        delayMs: restartDelayMs,
        openingText,
      });

      return this.createExecutionResult(
        preface,
        {
          type: 'command',
          verb: 'restart',
          directObject: null,
          indirectObject: null,
        },
        {
          consumeTurn: false,
          skipPostTurnProcessing,
        },
      );
    }

    return this.createExecutionResult(
      [preface, openingText].filter(Boolean).join('\n\n'),
      {
        type: 'command',
        verb: 'restart',
        directObject: null,
        indirectObject: null,
      },
      {
        consumeTurn: false,
        skipPostTurnProcessing,
      },
    );
  }

  triggerGameOver(failureText, options = {}) {
    const gameOverRecord = this.worldState.recordGameOver(options.branchId ?? 'generic');
    this.worldState.setFlag('hasExperiencedGameOver', true);
    (options.persistentFlags ?? []).forEach(flagName => {
      this.worldState.setFlag(flagName, true);
    });

    if (gameOverRecord.branchCount >= 2) {
      this.worldState.triggerReactiveLackeyConversation('repeat-game-over');
    }

    const persistence = this.captureRestartPersistence({ includeQueuedMetaMessages: true });

    return this.restartAdventure({
      preface: failureText,
      persistence,
      skipPostTurnProcessing: true,
      deferOpeningText: true,
      restartDelayMs: options.restartDelayMs ?? 5000,
      includeCreditsInOpening: false,
    }).response;
  }

  createFreshManifest() {
    if (!this.manifestFactory) {
      return this.manifest;
    }

    this.manifest = this.manifestFactory();
    return this.manifest;
  }

  saveGame(slotName = 'quicksave') {
    const storage = this.getStorage();
    if (!storage) {
      return 'Saving is not available in this environment.';
    }

    const normalizedSlot = String(slotName || 'quicksave').trim().toLowerCase() || 'quicksave';
    storage.setItem(this.getSaveKey(normalizedSlot), JSON.stringify(this.worldState.exportSaveData()));
    return `Game saved to slot "${normalizedSlot}".`;
  }

  loadGame(slotName = 'quicksave') {
    const storage = this.getStorage();
    if (!storage) {
      return 'Loading is not available in this environment.';
    }

    const normalizedSlot = String(slotName || 'quicksave').trim().toLowerCase() || 'quicksave';
    const savedData = storage.getItem(this.getSaveKey(normalizedSlot));
    if (!savedData) {
      return `There is no saved game in slot "${normalizedSlot}".`;
    }

    try {
      const nextWorldState = new WorldState(this.createFreshManifest());
      nextWorldState.importSaveData(JSON.parse(savedData));
      this.worldState = nextWorldState;
      this.pendingClarification = null;
      this.pendingMetaMessages = [];
      return `Game loaded from slot "${normalizedSlot}".\n\n${this.worldState.lookAroundCurrentRoom()}`;
    } catch (error) {
      return `Unable to load slot "${normalizedSlot}": ${error.message}`;
    }
  }
}

export default GameSession;