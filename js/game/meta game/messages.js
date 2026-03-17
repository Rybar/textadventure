const experimentLackeyMessages = {
  intakeNotice: {
    id: 'intakeNotice',
    source: 'experiment-lackeys',
    text: 'subject 13 is now under observation',
    options: {
      holdDuration: 1800,
      revealChance: 0.055,
      clearFraction: 0.045,
      clearFrameLength: 42,
    },
  },
  baselineCompliance: {
    id: 'baselineCompliance',
    source: 'experiment-lackeys',
    text: 'baseline etiquette response within tolerance',
    options: {
      holdDuration: 1600,
      revealChance: 0.05,
      clearFraction: 0.05,
      clearFrameLength: 40,
    },
  },
  noncriticalDistress: {
    id: 'noncriticalDistress',
    source: 'experiment-lackeys',
    text: 'distress spike logged no intervention required',
    options: {
      holdDuration: 1750,
      revealChance: 0.048,
      clearFraction: 0.05,
      clearFrameLength: 44,
    },
  },
  appetiteTelemetry: {
    id: 'appetiteTelemetry',
    source: 'experiment-lackeys',
    text: 'hospitality pressure remains a reliable coercion vector',
    options: {
      holdDuration: 1900,
      revealChance: 0.05,
      clearFraction: 0.045,
      clearFrameLength: 46,
    },
  },
  routeSuppression: {
    id: 'routeSuppression',
    source: 'experiment-lackeys',
    text: 'unauthorized escape ideation detected monitor only',
    options: {
      holdDuration: 1850,
      revealChance: 0.052,
      clearFraction: 0.045,
      clearFrameLength: 41,
    },
  },
  survivabilityNote: {
    id: 'survivabilityNote',
    source: 'experiment-lackeys',
    text: 'continued survivability is desirable but not essential',
    options: {
      holdDuration: 2000,
      revealChance: 0.05,
      clearFraction: 0.04,
      clearFrameLength: 48,
    },
  },
};

const hackerMessages = {
  ghostHandshake: {
    id: 'ghostHandshake',
    source: 'hacker',
    text: 'if you are seeing this the shell is porous stay quiet',
    options: {
      holdDuration: 1700,
      revealChance: 0.062,
      clearFraction: 0.05,
      clearFrameLength: 36,
    },
  },
  trustNoHelp: {
    id: 'trustNoHelp',
    source: 'hacker',
    text: 'their upgrades are locks with better lighting',
    options: {
      holdDuration: 1600,
      revealChance: 0.06,
      clearFraction: 0.05,
      clearFrameLength: 35,
    },
  },
  noteTheServants: {
    id: 'noteTheServants',
    source: 'hacker',
    text: 'watch who obeys rules and who resents them resentment opens doors',
    options: {
      holdDuration: 1900,
      revealChance: 0.058,
      clearFraction: 0.048,
      clearFrameLength: 39,
    },
  },
  hiddenExitHint: {
    id: 'hiddenExitHint',
    source: 'hacker',
    text: 'real exits feel like mistakes look for the room they ignore',
    options: {
      holdDuration: 1850,
      revealChance: 0.06,
      clearFraction: 0.047,
      clearFrameLength: 37,
    },
  },
  bloodWarning: {
    id: 'bloodWarning',
    source: 'hacker',
    text: 'do not give them more of yourself than the script demands',
    options: {
      holdDuration: 1800,
      revealChance: 0.061,
      clearFraction: 0.05,
      clearFrameLength: 38,
    },
  },
  circleAdvice: {
    id: 'circleAdvice',
    source: 'hacker',
    text: 'the circle is older than the experiment if you wake it move fast',
    options: {
      holdDuration: 2000,
      revealChance: 0.062,
      clearFraction: 0.045,
      clearFrameLength: 40,
    },
  },
};

export function createMetaGameContent() {
  return {
    startupMessageId: 'intakeNotice',
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
    messages: {
      ...experimentLackeyMessages,
      ...hackerMessages,
    },
  };
}

export default createMetaGameContent;