function createOperatorMessage(id, text, source = 'experiment-lackeys', options = {}) {
  return {
    id,
    source,
    text,
    options: {
      holdDuration: 4300,
      revealChance: 0.053,
      clearFraction: 0.045,
      clearFrameLength: 56,
      ...options,
    },
  };
}

function createIlexMessage(id, text, options = {}) {
  return {
    id,
    source: 'hacker',
    text,
    options: {
      holdDuration: 3900,
      revealChance: 0.061,
      clearFraction: 0.048,
      clearFrameLength: 50,
      ...options,
    },
  };
}

const operatorMessages = {
  maraBaselineA1: createOperatorMessage('maraBaselineA1', 'mara: baseline holds'),
  kellanBaselineA1: createOperatorMessage('kellanBaselineA1', 'kellan: they hesitated at the threshold'),
  maraInvitationA2: createOperatorMessage('maraInvitationA2', 'mara: invitation path confirmed'),
  kellanInvitationA2: createOperatorMessage('kellanInvitationA2', 'kellan: they looked at it twice'),
  maraHostB6: createOperatorMessage('maraHostB6', 'mara: host contact should increase lock-in'),
  kellanHostB6: createOperatorMessage('kellanHostB6', 'kellan: unless it sharpens refusal'),
  maraBranchC5: createOperatorMessage('maraBranchC5', 'mara: recognition changes behavior'),
  kellanBranchC5: createOperatorMessage('kellanBranchC5', 'kellan: they are treating the routes like choices', undefined, {
    holdDuration: 4500,
  }),
  maraLeakF6c: createOperatorMessage('maraLeakF6c', 'mara: they are converting narrative objects into leverage objects', undefined, {
    holdDuration: 4700,
  }),
  kellanLeakF6c: createOperatorMessage('kellanLeakF6c', 'kellan: that sounds close to understanding', undefined, {
    holdDuration: 4500,
  }),
  lackeyLeftReactive001: createOperatorMessage('lackeyLeftReactive001', 'kellan: they just echoed sideband language back at us', 'experiment-lackeys-aware', {
    holdDuration: 4400,
  }),
  lackeyRightReactive001: createOperatorMessage('lackeyRightReactive001', 'mara: then they are recognizing pattern pressure', 'experiment-lackeys-aware', {
    holdDuration: 4400,
  }),
  lackeyLeftReactive002: createOperatorMessage('lackeyLeftReactive002', 'kellan: that input was outside scenario grammar', 'experiment-lackeys-aware'),
  lackeyRightReactive002: createOperatorMessage('lackeyRightReactive002', 'mara: yes and it was addressed upward', 'experiment-lackeys-aware'),
  lackeyLeftReactive003: createOperatorMessage('lackeyLeftReactive003', 'kellan: they are typing maintenance verbs into the shell', 'experiment-lackeys-aware', {
    holdDuration: 4500,
  }),
  lackeyRightReactive003: createOperatorMessage('lackeyRightReactive003', 'mara: do not reward that with cleaner interfaces', 'experiment-lackeys-aware', {
    holdDuration: 4500,
  }),
};

const ilexMessages = {
  ilexFirstContactD1: createIlexMessage('ilexFirstContactD1', "don't answer this\n\njust keep moving\n\nif they think you noticed me they will narrow the shell", {
    holdDuration: 4100,
  }),
  ilexServantPressureE9: createIlexMessage('ilexServantPressureE9', 'they think in thresholds\n\nyou need pressure points instead'),
  ilexNoCleanExitF9: createIlexMessage('ilexNoCleanExitF9', 'there is no clean exit\n\nthere are only exits they failed to close in time', {
    holdDuration: 4300,
  }),
  ilexBreakFrameF8: createIlexMessage('ilexBreakFrameF8', 'do not optimize for winning the scene\n\noptimize for breaking the frame around it', {
    holdDuration: 4300,
  }),
};

export function createMetaGameContent() {
  return {
    startupMessageId: null,
    messageSets: {
      experimentLackeys: {
        source: 'experiment-lackeys',
        messageIds: Object.keys(operatorMessages),
      },
      hacker: {
        source: 'hacker',
        messageIds: Object.keys(ilexMessages),
      },
    },
    schedule: {
      lackeyConversations: [
        {
          id: 'baseline-hold',
          when: {
            minTurn: 6,
          },
          leftMessageId: 'maraBaselineA1',
          rightMessageId: 'kellanBaselineA1',
        },
        {
          id: 'foyer-screening',
          when: {
            minTurn: 10,
            allFlags: ['foyerAdmitted'],
          },
          leftMessageId: 'maraInvitationA2',
          rightMessageId: 'kellanInvitationA2',
        },
        {
          id: 'host-contact',
          when: {
            minTurn: 14,
            allFlags: ['metOshregaal'],
          },
          leftMessageId: 'maraHostB6',
          rightMessageId: 'kellanHostB6',
        },
        {
          id: 'route-anomaly',
          when: {
            minTurn: 18,
            anyFlags: ['plumFound', 'nathemaBargained', 'libraryRouteKnown', 'foundTeleportCircle', 'portalBypassLearned'],
          },
          leftMessageId: 'maraBranchC5',
          rightMessageId: 'kellanBranchC5',
        },
        {
          id: 'leverage-reading',
          when: {
            minTurn: 24,
            anyFlags: ['nathemaRouteKnowledgeShared', 'nathemaTextsShared', 'spellbooksSecured', 'blackWindEvidenceCollected'],
          },
          leftMessageId: 'maraLeakF6c',
          rightMessageId: 'kellanLeakF6c',
        },
      ],
      hackerMessages: [
        {
          id: 'first-contact',
          messageId: 'ilexFirstContactD1',
          when: {
            minTurn: 16,
            allFlags: ['metOshregaal'],
          },
        },
        {
          id: 'pressure-points',
          messageId: 'ilexServantPressureE9',
          when: {
            minTurn: 22,
            anyFlags: ['impHelpOffered', 'kelagoMet', 'plumFound', 'libraryRouteKnown'],
          },
        },
        {
          id: 'no-clean-exit',
          messageId: 'ilexNoCleanExitF9',
          when: {
            minTurn: 26,
            anyFlags: ['nathemaBargained', 'portalBypassLearned', 'spellbooksSecured', 'blackWindEvidenceCollected'],
          },
        },
        {
          id: 'break-the-frame',
          messageId: 'ilexBreakFrameF8',
          when: {
            minTurn: 30,
            anyFlags: ['nathemaEscapeDealSecured', 'oshregaalWounded', 'blackWindTreeSabotaged', 'spellbooksSecured'],
          },
        },
      ],
    },
    reactiveLackeyConversations: {
      'echoed-sideband': {
        id: 'echoed-sideband',
        leftMessageId: 'lackeyLeftReactive001',
        rightMessageId: 'lackeyRightReactive001',
      },
      'outside-scope-input': {
        id: 'outside-scope-input',
        leftMessageId: 'lackeyLeftReactive002',
        rightMessageId: 'lackeyRightReactive002',
      },
      'debug-command-probe': {
        id: 'debug-command-probe',
        leftMessageId: 'lackeyLeftReactive003',
        rightMessageId: 'lackeyRightReactive003',
      },
    },
    messages: {
      ...operatorMessages,
      ...ilexMessages,
    },
  };
}

export default createMetaGameContent;