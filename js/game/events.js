export function createGameEventDefinitions() {
  return {
    approveFoyerAdmission: {
      actions: [
        {
          type: 'setFlag',
          flag: 'foyerAdmitted',
          value: true,
        },
      ],
      text: ({ eventText }) => eventText ?? 'The butlers accept your status as a guest.',
    },
    startFeastService: {
      once: true,
      when: ({ getFlag }) => !getFlag('feastStarted'),
      actions: [
        {
          type: 'setFlag',
          flag: 'feastStarted',
          value: true,
        },
      ],
      text: 'The room seems to register your arrival as a social fact. Several tusk guests glance up only long enough to decide whether you belong to the menu, the audience, or both.',
    },
    unlockSecretCirclePassage: {
      once: true,
      when: ({ getFlag }) => !getFlag('secretCircleUnlocked'),
      actions: [
        {
          type: 'setFlag',
          flag: 'secretCircleUnlocked',
          value: true,
        },
        {
          type: 'setFlag',
          flag: 'foundTeleportCircle',
          value: true,
        },
        {
          type: 'unlockExit',
          roomId: 'feastHall',
          direction: 'west',
          targetRoomId: 'secretCircle',
        },
      ],
      text: 'Your hand closes around a hidden brass hand sewn into the curtain folds. You shake it once. Somewhere inside the wall, a lock answers with genteel satisfaction, and the curtained passage to the west yields at last.',
    },
    discoverKitchenBloodRitual: {
      actions: [
        {
          type: 'setFlag',
          flag: 'kitchenBloodHintKnown',
          value: true,
        },
      ],
    },
    startNathemaBargain: {
      actions: [
        {
          type: 'setFlag',
          flag: 'nathemaBargained',
          value: true,
        },
      ],
    },
  };
}

export default createGameEventDefinitions;