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
    unlockMetalHandDoor: {
      once: true,
      when: ({ getFlag }) => !getFlag('metalHandDoorUnlocked'),
      actions: [
        {
          type: 'setFlag',
          flag: 'metalHandDoorUnlocked',
          value: true,
        },
      ],
      text: 'You take the iron hand and give it a formal shake. Inside the wall, hidden catches withdraw with offended precision, and the north door unlocks like a servant forced to admit you were technically correct.',
    },
    unfoldFoldedHallway: {
      once: true,
      when: ({ getFlag }) => !getFlag('foldedHallwayUnlocked'),
      actions: [
        {
          type: 'setFlag',
          flag: 'foldedHallwayUnlocked',
          value: true,
        },
        {
          type: 'unlockExit',
          roomId: 'foldedHallway',
          direction: 'north',
          targetRoomId: 'tunnel',
        },
      ],
      text: 'You press the wax palm to one of the idol\'s hands and your own flesh to the other. The corridor shudders, reluctantly accepts the fraud, and unfolds into a single navigable line long enough to expose a northern tunnel.',
    },
    prepareTunnelRescueRoute: {
      once: true,
      when: ({ getFlag }) => !getFlag('plumTunnelRouteReady'),
      actions: [
        {
          type: 'setFlag',
          flag: 'plumTunnelRouteReady',
          value: true,
        },
      ],
      text: 'You light the meditative incense and set it beneath the cracked arch. The smoke threads itself into the draft instead of fighting it. Roots loosen, the cold wind steadies, and the tunnel relaxes into something two careful bodies might actually traverse without panic or noise.',
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
    discoverPlumScribe: {
      once: true,
      actions: [
        {
          type: 'setFlag',
          flag: 'plumFound',
          value: true,
        },
      ],
      text: 'Plum looks up from her desk with the wary alertness of someone who has learned that every interruption carries edits with it. For the first time tonight, the mansion offers you someone worth rescuing rather than merely surviving.',
    },
    planPlumEscape: {
      actions: [
        {
          type: 'setFlag',
          flag: 'plumTrustEarned',
          value: true,
        },
        {
          type: 'setFlag',
          flag: 'plumEscapePlanned',
          value: true,
        },
      ],
    },
  };
}

export default createGameEventDefinitions;