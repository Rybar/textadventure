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
    discoverAlchemyStockroom: {
      once: true,
      when: ({ getFlag }) => !getFlag('alchemyStockroomFound'),
      actions: [
        {
          type: 'setFlag',
          flag: 'alchemyStockroomFound',
          value: true,
        },
        {
          type: 'unlockExit',
          roomId: 'kitchen',
          direction: 'east',
          targetRoomId: 'alchemyStockroom',
        },
      ],
      text: 'Behind the bowing pantry shelf you find a lacquered service panel cut too cleanly into the wall to be accidental. It yields to pressure and exposes a narrow hidden stockroom where Oshregaal keeps the black-wind trade near the kitchen but safely out of polite sight.',
    },
    discoverBlackWindTreePassage: {
      once: true,
      when: ({ getFlag }) => !getFlag('blackWindTreePassageFound'),
      actions: [
        {
          type: 'setFlag',
          flag: 'blackWindTreePassageFound',
          value: true,
        },
        {
          type: 'unlockExit',
          roomId: 'alchemyStockroom',
          direction: 'down',
          targetRoomId: 'blackWindTreeChamber',
        },
      ],
      text: 'Behind the lowest rack you find an iron drain choked with lacquer-dark residue and fine root hair. The runoff is too regular to be accidental. Following the draft around it reveals a service hatch and a narrow stair descending below the stockroom into the colder dark where the trade is actually grown.',
    },
    unlockTrophyRoom: {
      once: true,
      when: ({ getFlag }) => getFlag('greyGrinLeadKnown') && !getFlag('trophyRoomUnlocked'),
      actions: [
        {
          type: 'setFlag',
          flag: 'trophyRoomUnlocked',
          value: true,
        },
        {
          type: 'unlockExit',
          roomId: 'library',
          direction: 'east',
          targetRoomId: 'trophyRoom',
        },
      ],
      text: 'The false genealogy index yields with a soft click, and one library case swings inward to expose a concealed eastern gallery where Oshregaal keeps victories polished into furniture.',
    },
    triggerButlerDiversion: {
      actions: [
        {
          type: 'setFlag',
          flag: 'butlerDiversionActive',
          value: true,
        },
        {
          type: 'scheduleEvent',
          eventId: 'endButlerDiversion',
          delayTurns: 2,
          scheduleId: 'butler-diversion',
        },
      ],
      text: 'You pull the bell in the coded double-ring pattern from the correction card. Somewhere in the house, two heavy sets of formal footsteps answer at once, moving away from the foyer with urgent professional annoyance.',
    },
    endButlerDiversion: {
      actions: [
        {
          type: 'setFlag',
          flag: 'butlerDiversionActive',
          value: false,
        },
      ],
      text: 'From below comes the sound of disciplined footsteps returning to their proper stations. The butlers have corrected the interruption.',
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
    beginPlumEscort: {
      when: ({ getFlag }) => getFlag('plumTunnelRouteReady') && !getFlag('plumFollowing') && !getFlag('plumRescued'),
      actions: [
        {
          type: 'setFlag',
          flag: 'plumFollowing',
          value: true,
        },
        {
          type: 'scheduleEvent',
          eventId: 'raisePlumAbsenceAlarm',
          delayTurns: 2,
          scheduleId: 'plum-absence-alarm',
        },
      ],
      text: 'Plum closes the folder, takes one steadying breath, and rises. "Then let us be gone before the house remembers to keep me," she says. She stays close, moving with the tense economy of someone who has rehearsed this in thought far more often than in muscle.',
    },
    raisePlumAbsenceAlarm: {
      when: ({ getFlag }) => getFlag('plumFollowing') && !getFlag('plumRescued'),
      actions: [
        {
          type: 'setFlag',
          flag: 'plumEscapeAlarmed',
          value: true,
        },
      ],
      text: 'From deeper in the mansion comes the soft double ring of a servant bell answered by nothing. A moment later, somewhere farther off, a door is opened too quickly. The house has begun to notice an absence.',
    },
    completePlumTunnelEscape: {
      when: ({ getFlag }) => getFlag('plumFollowing') && getFlag('plumTunnelRouteReady') && !getFlag('plumRescued'),
      actions: [
        {
          type: 'setFlag',
          flag: 'plumFollowing',
          value: false,
        },
        {
          type: 'setFlag',
          flag: 'plumRescued',
          value: true,
        },
        {
          type: 'cancelScheduledEvent',
          scheduleId: 'plum-absence-alarm',
        },
        {
          type: 'movePlayer',
          roomId: 'fernGarden',
        },
      ],
      run: ({ worldState }) => {
        return [
          'You drop to a crawl beneath the arch and Plum follows without complaint, incense smoke threading ahead of you through the roots. The tunnel scrapes skin, steals breath, and finally spills both of you into the feral garden beyond the mansion wall.',
          'For one stunned second neither of you moves. Then Plum looks back toward the hidden house entrance and says, with exhausted precision, "That still counts."',
          worldState.lookAroundCurrentRoom(),
        ].join('\n\n');
      },
    },
    securePlumAlliance: {
      once: true,
      when: ({ getFlag }) => getFlag('plumRescued') && !getFlag('plumAllianceSecured'),
      actions: [
        {
          type: 'setFlag',
          flag: 'plumAllianceSecured',
          value: true,
        },
        {
          type: 'setFlag',
          flag: 'blackWindEvidenceLeadKnown',
          value: true,
        },
      ],
      text: 'Plum takes one long breath of the garden air, studies the culvert, and makes herself smaller inside the ferns. "I can stay lost longer than he can stay patient," she says. "If you go back in, do not go back for pride. Go back for leverage. His black-wind records are kept near the alchemical stock, not the respectable rooms. Find the fruit, the ledgers, or anything that counts shipments, and suddenly escape becomes a story he cannot edit cleanly." Then she slips from sight with the practiced urgency of someone who has survived by becoming absent on purpose.',
    },
  };
}

export default createGameEventDefinitions;