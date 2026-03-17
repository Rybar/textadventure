const experimentLackeyMessages = {
  lackeyLeft001: {
    id: 'lackeyLeft001',
    source: 'experiment-lackeys',
    text: 'l1> baseline fiction is holding',
    options: {
      holdDuration: 4200,
      revealChance: 0.055,
      clearFraction: 0.045,
      clearFrameLength: 54,
    },
  },
  lackeyRight001: {
    id: 'lackeyRight001',
    source: 'experiment-lackeys',
    text: 'l2> keep it that way until attachment forms',
    options: {
      holdDuration: 4200,
      revealChance: 0.055,
      clearFraction: 0.045,
      clearFrameLength: 54,
    },
  },
  lackeyLeft002: {
    id: 'lackeyLeft002',
    source: 'experiment-lackeys',
    text: 'l1> etiquette compliance remains within tolerance',
    options: {
      holdDuration: 3900,
      revealChance: 0.05,
      clearFraction: 0.05,
      clearFrameLength: 52,
    },
  },
  lackeyRight002: {
    id: 'lackeyRight002',
    source: 'experiment-lackeys',
    text: 'l2> distress can rise later no need to rush it',
    options: {
      holdDuration: 3900,
      revealChance: 0.05,
      clearFraction: 0.05,
      clearFrameLength: 52,
    },
  },
  lackeyLeft003: {
    id: 'lackeyLeft003',
    source: 'experiment-lackeys',
    text: 'l1> host contact is increasing predictive accuracy',
    options: {
      holdDuration: 4300,
      revealChance: 0.05,
      clearFraction: 0.045,
      clearFrameLength: 58,
    },
  },
  lackeyRight003: {
    id: 'lackeyRight003',
    source: 'experiment-lackeys',
    text: 'l2> do not intervene unless the subject finds a clean exit',
    options: {
      holdDuration: 4300,
      revealChance: 0.05,
      clearFraction: 0.045,
      clearFrameLength: 58,
    },
  },
  lackeyLeft004: {
    id: 'lackeyLeft004',
    source: 'experiment-lackeys',
    text: 'l1> unauthorized curiosity markers are trending upward',
    options: {
      holdDuration: 4100,
      revealChance: 0.052,
      clearFraction: 0.045,
      clearFrameLength: 54,
    },
  },
  lackeyRight004: {
    id: 'lackeyRight004',
    source: 'experiment-lackeys',
    text: 'l2> acceptable curiosity improves the later breakpoints',
    options: {
      holdDuration: 4100,
      revealChance: 0.052,
      clearFraction: 0.045,
      clearFrameLength: 54,
    },
  },
  lackeyLeftReactive001: {
    id: 'lackeyLeftReactive001',
    source: 'experiment-lackeys',
    text: 'l1> it just echoed sideband language back at us',
    options: {
      holdDuration: 4300,
      revealChance: 0.056,
      clearFraction: 0.045,
      clearFrameLength: 56,
    },
  },
  lackeyRightReactive001: {
    id: 'lackeyRightReactive001',
    source: 'experiment-lackeys',
    text: 'l2> can the subject see these messages or only guess at them',
    options: {
      holdDuration: 4300,
      revealChance: 0.056,
      clearFraction: 0.045,
      clearFrameLength: 56,
    },
  },
  lackeyLeftReactive002: {
    id: 'lackeyLeftReactive002',
    source: 'experiment-lackeys',
    text: 'l1> that input was outside scenario grammar',
    options: {
      holdDuration: 4200,
      revealChance: 0.055,
      clearFraction: 0.045,
      clearFrameLength: 54,
    },
  },
  lackeyRightReactive002: {
    id: 'lackeyRightReactive002',
    source: 'experiment-lackeys',
    text: 'l2> then why does it sound like it is answering us directly',
    options: {
      holdDuration: 4200,
      revealChance: 0.055,
      clearFraction: 0.045,
      clearFrameLength: 54,
    },
  },
};

const hackerMessages = {
  ghostHandshake: {
    id: 'ghostHandshake',
    source: 'hacker',
    text: 'if you are seeing this the shell is porous stay quiet',
    options: {
      holdDuration: 3600,
      revealChance: 0.062,
      clearFraction: 0.05,
      clearFrameLength: 48,
    },
  },
  trustNoHelp: {
    id: 'trustNoHelp',
    source: 'hacker',
    text: 'their upgrades are locks with better lighting',
    options: {
      holdDuration: 3400,
      revealChance: 0.06,
      clearFraction: 0.05,
      clearFrameLength: 46,
    },
  },
  noteTheServants: {
    id: 'noteTheServants',
    source: 'hacker',
    text: 'watch who obeys rules and who resents them resentment opens doors',
    options: {
      holdDuration: 3900,
      revealChance: 0.058,
      clearFraction: 0.048,
      clearFrameLength: 52,
    },
  },
  hiddenExitHint: {
    id: 'hiddenExitHint',
    source: 'hacker',
    text: 'real exits feel like mistakes look for the room they ignore',
    options: {
      holdDuration: 3800,
      revealChance: 0.06,
      clearFraction: 0.047,
      clearFrameLength: 50,
    },
  },
  bloodWarning: {
    id: 'bloodWarning',
    source: 'hacker',
    text: 'do not give them more of yourself than the script demands',
    options: {
      holdDuration: 3700,
      revealChance: 0.061,
      clearFraction: 0.05,
      clearFrameLength: 50,
    },
  },
  circleAdvice: {
    id: 'circleAdvice',
    source: 'hacker',
    text: 'the circle is older than the experiment if you wake it move fast',
    options: {
      holdDuration: 4200,
      revealChance: 0.062,
      clearFraction: 0.045,
      clearFrameLength: 54,
    },
  },
};

export function createMetaGameContent() {
  return {
    startupMessageId: null,
    messageSets: {
      experimentLackeys: {
        source: 'experiment-lackeys',
        messageIds: Object.keys(experimentLackeyMessages),
      },
      hacker: {
        source: 'hacker',
        messageIds: Object.keys(hackerMessages),
      },
    },
    schedule: {
      lackeyConversations: [
        {
          id: 'baseline-hold',
          when: {
            minTurn: 6,
          },
          leftMessageId: 'lackeyLeft001',
          rightMessageId: 'lackeyRight001',
        },
        {
          id: 'foyer-screening',
          when: {
            minTurn: 10,
            allFlags: ['foyerAdmitted'],
          },
          leftMessageId: 'lackeyLeft002',
          rightMessageId: 'lackeyRight002',
        },
        {
          id: 'host-contact',
          when: {
            minTurn: 14,
            allFlags: ['metOshregaal'],
          },
          leftMessageId: 'lackeyLeft003',
          rightMessageId: 'lackeyRight003',
        },
        {
          id: 'curiosity-breakpoint',
          when: {
            minTurn: 18,
            anyFlags: ['impHandshakeHintKnown', 'kelagoHandshakeHintKnown', 'secretCircleUnlocked'],
          },
          leftMessageId: 'lackeyLeft004',
          rightMessageId: 'lackeyRight004',
        },
      ],
      hackerMessages: [
        {
          id: 'first-contact',
          messageId: 'ghostHandshake',
          when: {
            minTurn: 16,
            allFlags: ['metOshregaal'],
          },
        },
        {
          id: 'servant-friction',
          messageId: 'noteTheServants',
          when: {
            minTurn: 18,
            anyFlags: ['impHelpOffered', 'kelagoMet', 'secretCircleUnlocked'],
          },
        },
        {
          id: 'hidden-exit',
          messageId: 'hiddenExitHint',
          when: {
            minTurn: 20,
            allFlags: ['secretCircleUnlocked'],
          },
        },
        {
          id: 'circle-awakening',
          messageId: 'circleAdvice',
          when: {
            minTurn: 22,
            allFlags: ['foundTeleportCircle'],
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
    },
    messages: {
      ...experimentLackeyMessages,
      ...hackerMessages,
    },
  };
}

export default createMetaGameContent;