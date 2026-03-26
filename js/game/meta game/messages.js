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

function createMilestoneDefinition(id, {
  leftMessageId = null,
  rightMessageId = null,
  ilexMessageId = null,
  rightDelayMs = 3600,
  ilexDelayMs = 7000,
  priority = 'milestone',
  extraMessages = [],
} = {}) {
  const messages = [
    leftMessageId ? { messageId: leftMessageId, placement: 'side-left', delayMs: 0 } : null,
    rightMessageId ? { messageId: rightMessageId, placement: 'side-right', delayMs: rightDelayMs } : null,
    ilexMessageId ? { messageId: ilexMessageId, placement: 'lower-random', delayMs: ilexDelayMs } : null,
    ...extraMessages,
  ].filter(Boolean);

  return {
    id,
    priority,
    messages,
  };
}

const operatorMessagesByPhase = {
  baseline: {
    maraBaselineA1: createOperatorMessage('maraBaselineA1', 'mara: scenario seeded cleanly'),
    kellanBaselineA1: createOperatorMessage('kellanBaselineA1', 'kellan: subject took longer at the threshold'),
    maraBaselineA3: createOperatorMessage('maraBaselineA3', 'mara: ambient compliance is acceptable'),
    kellanBaselineA3: createOperatorMessage('kellanBaselineA3', 'kellan: they still seem wary'),
    maraInvitationA2: createOperatorMessage('maraInvitationA2', 'mara: yes'),
    kellanInvitationA2: createOperatorMessage('kellanInvitationA2', 'kellan: invitation path confirmed'),
  },
  concern: {
    maraHostB6: createOperatorMessage('maraHostB6', 'mara: host contact should increase lock-in'),
    kellanHostB6: createOperatorMessage('kellanHostB6', 'kellan: unless it sharpens refusal'),
    maraSeamsB1: createOperatorMessage('maraSeamsB1', 'mara: everyone tests for seams eventually'),
    kellanSeamsB1: createOperatorMessage('kellanSeamsB1', 'kellan: i think they are testing for seams'),
  },
  friction: {
    maraBranchC5: createOperatorMessage('maraBranchC5', 'mara: then we measure whether recognition changes behavior', 'experiment-lackeys-aware', {
      holdDuration: 4500,
    }),
    kellanBranchC5: createOperatorMessage('kellanBranchC5', 'kellan: if they start recognizing pattern pressure', 'experiment-lackeys-aware', {
      holdDuration: 4500,
    }),
    maraLeakF6c: createOperatorMessage('maraLeakF6c', 'mara: they are converting narrative objects into leverage objects', 'experiment-lackeys-aware', {
      holdDuration: 4700,
    }),
    kellanLeakF6c: createOperatorMessage('kellanLeakF6c', 'kellan: that sounds close to understanding', 'experiment-lackeys-aware', {
      holdDuration: 4500,
    }),
  },
  leakage: {
    kellanMapLeakE1: createOperatorMessage('kellanMapLeakE1', 'kellan: did you authorize a spatial overlay or is the intruder steering them now', 'experiment-lackeys-aware', {
      holdDuration: 4500,
    }),
    maraMapLeakE1: createOperatorMessage('maraMapLeakE1', 'mara: unauthorized agent interference confirmed in the navigation layer, keep recording the contamination', 'experiment-lackeys-aware', {
      holdDuration: 4500,
    }),
    kellanInventoryLeakE3: createOperatorMessage('kellanInventoryLeakE3', 'kellan: that panel is not native, it is inventory coaching from the same outside hand', 'experiment-lackeys-aware', {
      holdDuration: 4500,
    }),
    maraInventoryLeakE3: createOperatorMessage('maraInventoryLeakE3', 'mara: then the intruder is actively poisoning retention results, do not suppress it until we have the spread', 'experiment-lackeys-aware', {
      holdDuration: 4700,
    }),
    kellanMemoryLeakE5: createOperatorMessage('kellanMemoryLeakE5', 'kellan: that is internal state exposure, they are letting the contaminant show them the hinges', 'experiment-lackeys-aware', {
      holdDuration: 4500,
    }),
    maraMemoryLeakE5: createOperatorMessage('maraMemoryLeakE5', 'mara: yes, the unauthorized agent has moved from nuisance to structural contamination', 'experiment-lackeys-aware', {
      holdDuration: 4700,
    }),
  },
  route: {
    maraPlumFoundH1: createOperatorMessage('maraPlumFoundH1', 'mara: plum has re-entered the subject path', 'experiment-lackeys-aware', {
      holdDuration: 4500,
    }),
    kellanPlumFoundH1: createOperatorMessage('kellanPlumFoundH1', 'kellan: they are looking at her like a person, not a proof token', 'experiment-lackeys-aware', {
      holdDuration: 4700,
    }),
    maraPlumPlanH2: createOperatorMessage('maraPlumPlanH2', 'mara: rescue planning degrades experimental cleanliness', 'experiment-lackeys-aware', {
      holdDuration: 4500,
    }),
    kellanPlumPlanH2: createOperatorMessage('kellanPlumPlanH2', 'kellan: or it means they stopped treating the house like a puzzle box', 'experiment-lackeys-aware', {
      holdDuration: 4700,
    }),
    maraPlumRescueH3: createOperatorMessage('maraPlumRescueH3', 'mara: the missing asset is now an authored absence', 'experiment-lackeys-aware', {
      holdDuration: 4600,
    }),
    kellanPlumRescueH3: createOperatorMessage('kellanPlumRescueH3', 'kellan: no, now it is a witness', 'experiment-lackeys-aware', {
      holdDuration: 4400,
    }),
    maraNathemaDealH4: createOperatorMessage('maraNathemaDealH4', 'mara: nathema was not supposed to become a second operator surface', 'experiment-lackeys-aware', {
      holdDuration: 4700,
    }),
    kellanNathemaDealH4: createOperatorMessage('kellanNathemaDealH4', 'kellan: they keep choosing rivals instead of exits', 'experiment-lackeys-aware', {
      holdDuration: 4500,
    }),
    maraNathemaEscapeH5: createOperatorMessage('maraNathemaEscapeH5', 'mara: this is now a succession event, not a containment event', 'experiment-lackeys-aware', {
      holdDuration: 4800,
    }),
    kellanNathemaEscapeH5: createOperatorMessage('kellanNathemaEscapeH5', 'kellan: you say that like it helps', 'experiment-lackeys-aware', {
      holdDuration: 4300,
    }),
    maraArchiveH6: createOperatorMessage('maraArchiveH6', 'mara: they are reading the house as infrastructure', 'experiment-lackeys-aware', {
      holdDuration: 4500,
    }),
    kellanArchiveH6: createOperatorMessage('kellanArchiveH6', 'kellan: they stopped asking what the rooms mean and started asking what they do', 'experiment-lackeys-aware', {
      holdDuration: 4700,
    }),
    maraPortalH7: createOperatorMessage('maraPortalH7', 'mara: unauthorized route literacy is rising', 'experiment-lackeys-aware', {
      holdDuration: 4400,
    }),
    kellanPortalH7: createOperatorMessage('kellanPortalH7', 'kellan: they are learning the fold faster than the fiction can hide it', 'experiment-lackeys-aware', {
      holdDuration: 4700,
    }),
    maraBlackWindEvidenceH8: createOperatorMessage('maraBlackWindEvidenceH8', 'mara: black-wind record exposure changes the downstream risk model', 'experiment-lackeys-aware', {
      holdDuration: 4700,
    }),
    kellanBlackWindEvidenceH8: createOperatorMessage('kellanBlackWindEvidenceH8', 'kellan: because now the orchard can leave as paperwork', 'experiment-lackeys-aware', {
      holdDuration: 4500,
    }),
    maraBlackWindCorruptionH9: createOperatorMessage('maraBlackWindCorruptionH9', 'mara: subject has accepted self-revision as a tactic', 'experiment-lackeys-aware', {
      holdDuration: 4700,
    }),
    kellanBlackWindCorruptionH9: createOperatorMessage('kellanBlackWindCorruptionH9', 'kellan: that sounds worse when you make it neat', 'experiment-lackeys-aware', {
      holdDuration: 4300,
    }),
    maraSabotageH10: createOperatorMessage('maraSabotageH10', 'mara: source instability is no longer theoretical', 'experiment-lackeys-aware', {
      holdDuration: 4500,
    }),
    kellanSabotageH10: createOperatorMessage('kellanSabotageH10', 'kellan: then the house is finally inside the experiment too', 'experiment-lackeys-aware', {
      holdDuration: 4600,
    }),
    maraViolenceH11: createOperatorMessage('maraViolenceH11', 'mara: host authority has become materially contestable', 'experiment-lackeys-aware', {
      holdDuration: 4600,
    }),
    kellanViolenceH11: createOperatorMessage('kellanViolenceH11', 'kellan: that is a cold way to say he is bleeding', 'experiment-lackeys-aware', {
      holdDuration: 4300,
    }),
    maraContainmentH12: createOperatorMessage('maraContainmentH12', 'mara: they found the mechanism under the etiquette', 'experiment-lackeys-aware', {
      holdDuration: 4600,
    }),
    kellanContainmentH12: createOperatorMessage('kellanContainmentH12', 'kellan: yes and now the dinner story will not seal again', 'experiment-lackeys-aware', {
      holdDuration: 4500,
    }),
    maraSpiderH13: createOperatorMessage('maraSpiderH13', 'mara: off-axis debt structures are now in play', 'experiment-lackeys-aware', {
      holdDuration: 4400,
    }),
    kellanSpiderH13: createOperatorMessage('kellanSpiderH13', 'kellan: they even found the house\'s stranger bargains', 'experiment-lackeys-aware', {
      holdDuration: 4500,
    }),
    maraRoutineGameOverJ1: createOperatorMessage('maraRoutineGameOverJ1', 'mara: the host folded the subject back into routine and the contaminant returned them anyway', 'experiment-lackeys-aware', {
      holdDuration: 4700,
    }),
    kellanRoutineGameOverJ1: createOperatorMessage('kellanRoutineGameOverJ1', 'kellan: then we are no longer measuring failure, we are measuring what the intruder lets survive it', 'experiment-lackeys-aware', {
      holdDuration: 4700,
    }),
    maraBedGameOverJ2: createOperatorMessage('maraBedGameOverJ2', 'mara: intimate containment now produces recurrence instead of closure', 'experiment-lackeys-aware', {
      holdDuration: 4700,
    }),
    kellanBedGameOverJ2: createOperatorMessage('kellanBedGameOverJ2', 'kellan: because the outside agent is teaching them to come back from being kept', 'experiment-lackeys-aware', {
      holdDuration: 4600,
    }),
    maraCorrectionGameOverJ3: createOperatorMessage('maraCorrectionGameOverJ3', 'mara: even procedural correction is no longer terminal under the current contamination regime', 'experiment-lackeys-aware', {
      holdDuration: 4800,
    }),
    kellanCorrectionGameOverJ3: createOperatorMessage('kellanCorrectionGameOverJ3', 'kellan: the room still teaches, but now it teaches them where the cage flexes', 'experiment-lackeys-aware', {
      holdDuration: 4500,
    }),
    maraSapGameOverJ4: createOperatorMessage('maraSapGameOverJ4', 'mara: source contact should have ended the branch, the contaminant converted it into another observation loop', 'experiment-lackeys-aware', {
      holdDuration: 4900,
    }),
    kellanSapGameOverJ4: createOperatorMessage('kellanSapGameOverJ4', 'kellan: then the black-wind route is contaminated all the way down now', 'experiment-lackeys-aware', {
      holdDuration: 4500,
    }),
  },
  rupture: {
    maraContainmentF1: createOperatorMessage('maraContainmentF1', 'mara: it never was', 'experiment-lackeys-aware', {
      holdDuration: 4500,
    }),
    kellanContainmentF1: createOperatorMessage('kellanContainmentF1', 'kellan: this is not clean data anymore', 'experiment-lackeys-aware', {
      holdDuration: 4500,
    }),
    maraEscalationF2: createOperatorMessage('maraEscalationF2', 'mara: subject is no longer operating as a closed runtime', 'experiment-lackeys-aware', {
      holdDuration: 4700,
    }),
    kellanEscalationF2: createOperatorMessage('kellanEscalationF2', 'kellan: they heard that, did they not', 'experiment-lackeys-aware', {
      holdDuration: 4400,
    }),
    maraRuptureG1: createOperatorMessage('maraRuptureG1', 'mara: stop speaking as though the shell is still ours', 'experiment-lackeys-aware', {
      holdDuration: 4700,
    }),
    kellanRuptureG1: createOperatorMessage('kellanRuptureG1', 'kellan: i do not think it is listening only to us anymore', 'experiment-lackeys-aware', {
      holdDuration: 4600,
    }),
    maraAuthorityShiftG2: createOperatorMessage('maraAuthorityShiftG2', 'mara: i cannot from here', 'experiment-lackeys-aware', {
      holdDuration: 4500,
    }),
    kellanAuthorityShiftG2: createOperatorMessage('kellanAuthorityShiftG2', 'kellan: stop them', 'experiment-lackeys-aware', {
      holdDuration: 4500,
    }),
    maraExitFractureG3: createOperatorMessage('maraExitFractureG3', 'mara: if they leave carrying this state, the leak persists outside the frame', 'experiment-lackeys-aware', {
      holdDuration: 4800,
    }),
    kellanExitFractureG3: createOperatorMessage('kellanExitFractureG3', 'kellan: maybe that is what leaving should mean', 'experiment-lackeys-aware', {
      holdDuration: 4400,
    }),
    kellanIntrusionF3: createOperatorMessage('kellanIntrusionF3', 'kellan: we keep calling it leakage as though there is not an actual second agent in the shell', 'experiment-lackeys-aware', {
      holdDuration: 4700,
    }),
    maraIntrusionF3: createOperatorMessage('maraIntrusionF3', 'mara: there is, and every overlay it grants is now contaminating the experiment faster than the host can close it', 'experiment-lackeys-aware', {
      holdDuration: 4900,
    }),
    maraRecurrenceF4: createOperatorMessage('maraRecurrenceF4', 'mara: the subject has started recurring after terminal loss, the unauthorized agent is preserving memory across failure states', 'experiment-lackeys-aware', {
      holdDuration: 5000,
    }),
    kellanRecurrenceF4: createOperatorMessage('kellanRecurrenceF4', 'kellan: then every game over is data corruption from your perspective and a lesson from theirs', 'experiment-lackeys-aware', {
      holdDuration: 4700,
    }),
  },
  endings: {
    maraAbsorbedEndingZ1: createOperatorMessage('maraAbsorbedEndingZ1', 'mara: subject has collapsed back into house routine', 'experiment-lackeys-aware', {
      holdDuration: 4700,
    }),
    kellanAbsorbedEndingZ1: createOperatorMessage('kellanAbsorbedEndingZ1', 'kellan: do not call that a clean close', 'experiment-lackeys-aware', {
      holdDuration: 4500,
    }),
    maraBreachEndingZ2: createOperatorMessage('maraBreachEndingZ2', 'mara: externalization risk is no longer containable', 'experiment-lackeys-aware', {
      holdDuration: 4800,
    }),
    kellanBreachEndingZ2: createOperatorMessage('kellanBreachEndingZ2', 'kellan: then they won by changing what the shell could remember', 'experiment-lackeys-aware', {
      holdDuration: 4700,
    }),
    maraDarkBargainEndingZ3: createOperatorMessage('maraDarkBargainEndingZ3', 'mara: escape occurred by adopting hostile logic rather than defeating it', 'experiment-lackeys-aware', {
      holdDuration: 4800,
    }),
    kellanDarkBargainEndingZ3: createOperatorMessage('kellanDarkBargainEndingZ3', 'kellan: you mean they got out stained enough to matter', 'experiment-lackeys-aware', {
      holdDuration: 4500,
    }),
    maraViolentEndingZ4: createOperatorMessage('maraViolentEndingZ4', 'mara: host stability ended before scenario closure', 'experiment-lackeys-aware', {
      holdDuration: 4700,
    }),
    kellanViolentEndingZ4: createOperatorMessage('kellanViolentEndingZ4', 'kellan: because he made violence the final grammar', 'experiment-lackeys-aware', {
      holdDuration: 4600,
    }),
    maraStrongEndingZ5: createOperatorMessage('maraStrongEndingZ5', 'mara: the subject exited with witness and leverage intact', 'experiment-lackeys-aware', {
      holdDuration: 4700,
    }),
    kellanStrongEndingZ5: createOperatorMessage('kellanStrongEndingZ5', 'kellan: yes, they left with a future instead of a gap', 'experiment-lackeys-aware', {
      holdDuration: 4500,
    }),
    maraPlumEndingZ6: createOperatorMessage('maraPlumEndingZ6', 'mara: local rescue succeeded without broader rupture', 'experiment-lackeys-aware', {
      holdDuration: 4500,
    }),
    kellanPlumEndingZ6: createOperatorMessage('kellanPlumEndingZ6', 'kellan: that is still a person leaving alive', 'experiment-lackeys-aware', {
      holdDuration: 4300,
    }),
    maraCompromisedEndingZ7: createOperatorMessage('maraCompromisedEndingZ7', 'mara: extraction succeeded with leverage but without full ethical reversal', 'experiment-lackeys-aware', {
      holdDuration: 4800,
    }),
    kellanCompromisedEndingZ7: createOperatorMessage('kellanCompromisedEndingZ7', 'kellan: say plum\'s name if you mean what went missing', 'experiment-lackeys-aware', {
      holdDuration: 4400,
    }),
    maraAwareEndingZ8: createOperatorMessage('maraAwareEndingZ8', 'mara: they leave aware of the shell but not in control of it', 'experiment-lackeys-aware', {
      holdDuration: 4600,
    }),
    kellanAwareEndingZ8: createOperatorMessage('kellanAwareEndingZ8', 'kellan: awareness is already enough to make this recur badly', 'experiment-lackeys-aware', {
      holdDuration: 4500,
    }),
    maraCleanEndingZ9: createOperatorMessage('maraCleanEndingZ9', 'mara: subject exit remained inside expected narrative tolerances', 'experiment-lackeys-aware', {
      holdDuration: 4600,
    }),
    kellanCleanEndingZ9: createOperatorMessage('kellanCleanEndingZ9', 'kellan: if you ignore everything it cost to call it expected', 'experiment-lackeys-aware', {
      holdDuration: 4500,
    }),
  },
  reactive: {
    lackeyLeftReactive001: createOperatorMessage('lackeyLeftReactive001', 'kellan: they just echoed sideband language back at us', 'experiment-lackeys-aware', {
      holdDuration: 4400,
    }),
    lackeyRightReactive001: createOperatorMessage('lackeyRightReactive001', 'mara: then they are recognizing pattern pressure', 'experiment-lackeys-aware', {
      holdDuration: 4400,
    }),
    lackeyLeftReactive001b: createOperatorMessage('lackeyLeftReactive001b', 'kellan: they are feeding our wording back into the frame', 'experiment-lackeys-aware', {
      holdDuration: 4400,
    }),
    lackeyRightReactive001b: createOperatorMessage('lackeyRightReactive001b', 'mara: yes and they are checking whether language changes the cage', 'experiment-lackeys-aware', {
      holdDuration: 4500,
    }),
    lackeyLeftReactive001c: createOperatorMessage('lackeyLeftReactive001c', 'kellan: that was one of ours almost verbatim', 'experiment-lackeys-aware', {
      holdDuration: 4300,
    }),
    lackeyRightReactive001c: createOperatorMessage('lackeyRightReactive001c', 'mara: imitation is still data if it pressures response', 'experiment-lackeys-aware', {
      holdDuration: 4400,
    }),
    lackeyLeftReactive001d: createOperatorMessage('lackeyLeftReactive001d', 'kellan: they are saying the screened parts out loud now', 'experiment-lackeys-aware', {
      holdDuration: 4400,
    }),
    lackeyRightReactive001d: createOperatorMessage('lackeyRightReactive001d', 'mara: keep the bleed open long enough to see what they think it does', 'experiment-lackeys-aware', {
      holdDuration: 4500,
    }),
    lackeyLeftReactive002: createOperatorMessage('lackeyLeftReactive002', 'kellan: that input was outside scenario grammar', 'experiment-lackeys-aware'),
    lackeyRightReactive002: createOperatorMessage('lackeyRightReactive002', 'mara: yes and it was addressed upward', 'experiment-lackeys-aware'),
    lackeyLeftReactive002b: createOperatorMessage('lackeyLeftReactive002b', 'kellan: they are trying to talk to us directly', 'experiment-lackeys-aware', {
      holdDuration: 4300,
    }),
    lackeyRightReactive002b: createOperatorMessage('lackeyRightReactive002b', 'mara: then let them waste breath on the glass', 'experiment-lackeys-aware', {
      holdDuration: 4300,
    }),
    lackeyLeftReactive002c: createOperatorMessage('lackeyLeftReactive002c', 'kellan: they used your name', 'experiment-lackeys-aware', {
      holdDuration: 4200,
    }),
    lackeyRightReactive002c: createOperatorMessage('lackeyRightReactive002c', 'mara: that does not constitute access', 'experiment-lackeys-aware', {
      holdDuration: 4300,
    }),
    lackeyLeftReactive002d: createOperatorMessage('lackeyLeftReactive002d', 'kellan: they know there is someone on the other side of the shell', 'experiment-lackeys-aware', {
      holdDuration: 4500,
    }),
    lackeyRightReactive002d: createOperatorMessage('lackeyRightReactive002d', 'mara: suspicion is tolerable until it becomes leverage', 'experiment-lackeys-aware', {
      holdDuration: 4500,
    }),
    lackeyLeftReactive002e: createOperatorMessage('lackeyLeftReactive002e', 'kellan: do we answer if they keep doing that', 'experiment-lackeys-aware', {
      holdDuration: 4300,
    }),
    lackeyRightReactive002e: createOperatorMessage('lackeyRightReactive002e', 'mara: no but we should measure the persistence', 'experiment-lackeys-aware', {
      holdDuration: 4300,
    }),
    lackeyLeftReactive003: createOperatorMessage('lackeyLeftReactive003', 'kellan: they are typing maintenance verbs into the shell', 'experiment-lackeys-aware', {
      holdDuration: 4500,
    }),
    lackeyRightReactive003: createOperatorMessage('lackeyRightReactive003', 'mara: do not reward that with cleaner interfaces', 'experiment-lackeys-aware', {
      holdDuration: 4500,
    }),
    lackeyLeftReactive003b: createOperatorMessage('lackeyLeftReactive003b', 'kellan: they keep probing for operator verbs', 'experiment-lackeys-aware', {
      holdDuration: 4400,
    }),
    lackeyRightReactive003b: createOperatorMessage('lackeyRightReactive003b', 'mara: then the shell is already teaching them the wrong lesson', 'experiment-lackeys-aware', {
      holdDuration: 4500,
    }),
    lackeyLeftReactive004: createOperatorMessage('lackeyLeftReactive004', 'kellan: they are touching memory addresses now', 'experiment-lackeys-aware', {
      holdDuration: 4400,
    }),
    lackeyRightReactive004: createOperatorMessage('lackeyRightReactive004', 'mara: then stop leaving the hinges where they can read them', 'experiment-lackeys-aware', {
      holdDuration: 4500,
    }),
    lackeyLeftReactive004b: createOperatorMessage('lackeyLeftReactive004b', 'kellan: they are not just reading state anymore', 'experiment-lackeys-aware', {
      holdDuration: 4400,
    }),
    lackeyRightReactive004b: createOperatorMessage('lackeyRightReactive004b', 'mara: yes, they are rehearsing authorship', 'experiment-lackeys-aware', {
      holdDuration: 4600,
    }),
    lackeyLeftReactive005: createOperatorMessage('lackeyLeftReactive005', 'kellan: they walked into the same fatal branch again. is this research or a hobby now.', 'experiment-lackeys-aware', {
      holdDuration: 4700,
    }),
    lackeyRightReactive005: createOperatorMessage('lackeyRightReactive005', 'mara: if the subject insists on stress-testing one mistake repeatedly, at least record the devotion precisely.', 'experiment-lackeys-aware', {
      holdDuration: 4800,
    }),
    lackeyLeftReactive005b: createOperatorMessage('lackeyLeftReactive005b', 'kellan: i am starting to think they are speedrunning embarrassment on purpose.', 'experiment-lackeys-aware', {
      holdDuration: 4500,
    }),
    lackeyRightReactive005b: createOperatorMessage('lackeyRightReactive005b', 'mara: then their methodology remains terrible but unusually consistent.', 'experiment-lackeys-aware', {
      holdDuration: 4500,
    }),
    lackeyLeftReactive005c: createOperatorMessage('lackeyLeftReactive005c', 'kellan: same branch, same disaster, same refusal to learn normal lessons.', 'experiment-lackeys-aware', {
      holdDuration: 4600,
    }),
    lackeyRightReactive005c: createOperatorMessage('lackeyRightReactive005c', 'mara: do not say refusal. call it iterative self-endangerment so the report sounds professional.', 'experiment-lackeys-aware', {
      holdDuration: 4700,
    }),
  },
};

const ilexMessagesByPhase = {
  breach: {
    ilexFirstContactD1: createIlexMessage('ilexFirstContactD1', 'do not answer this\n\njust keep moving\n\nif they think you noticed me they will narrow the shell', {
      holdDuration: 4100,
    }),
    ilexIdentityPressureD3: createIlexMessage('ilexIdentityPressureD3', 'i was in one of these\n\nnot this house\n\nsame cage', {
      holdDuration: 4300,
    }),
  },
  leakage: {
    ilexMapOverlayE2: createIlexMessage('ilexMapOverlayE2', 'they noticed me\n\ngood\n\nyou still get the map\n\nuse it before they sand the edges off', {
      holdDuration: 4300,
    }),
    ilexInventoryOverlayE4: createIlexMessage('ilexInventoryOverlayE4', 'they will call this contamination\n\nlet them\n\nstart watching what the shell thinks you are carrying', {
      holdDuration: 4500,
    }),
    ilexMemoryBusE6: createIlexMessage('ilexMemoryBusE6', 'good\n\nnow they know i am here too\n\nstop treating flags like secrets\n\nthey are hinges', {
      holdDuration: 4300,
    }),
    ilexServantPressureE9: createIlexMessage('ilexServantPressureE9', 'they think in thresholds\n\nyou need pressure points instead'),
  },
  route: {
    ilexPlumFoundH1: createIlexMessage('ilexPlumFoundH1', 'keep plum real\n\nif you let them make her into a route\n\nyou lose before the doors matter', {
      holdDuration: 4300,
    }),
    ilexNathemaDealH4: createIlexMessage('ilexNathemaDealH4', 'nathema is not help\n\nshe is leverage that talks back\n\nuse that carefully', {
      holdDuration: 4300,
    }),
    ilexArchiveH6: createIlexMessage('ilexArchiveH6', 'good\n\nread the house like a machine\n\nnot like a myth', {
      holdDuration: 4200,
    }),
    ilexPortalH7: createIlexMessage('ilexPortalH7', 'the folds are older than the host\n\nsteal the route\n\nignore the ceremony', {
      holdDuration: 4300,
    }),
    ilexBlackWindEvidenceH8: createIlexMessage('ilexBlackWindEvidenceH8', 'paper cuts deeper than fruit sometimes\n\nproof travels', {
      holdDuration: 4200,
    }),
    ilexBlackWindCorruptionH9: createIlexMessage('ilexBlackWindCorruptionH9', 'if you drink the house\n\nit drinks back\n\ndo not lie to yourself about that', {
      holdDuration: 4400,
    }),
    ilexSabotageH10: createIlexMessage('ilexSabotageH10', 'yes\n\nhurt the source if you have to\n\nlet the root remember you', {
      holdDuration: 4300,
    }),
    ilexContainmentH12: createIlexMessage('ilexContainmentH12', 'there\n\nthat is the real room under the room\n\nkeep going', {
      holdDuration: 4200,
    }),
    ilexSpiderH13: createIlexMessage('ilexSpiderH13', 'the strange bargains count too\n\nthis house leaks through everything', {
      holdDuration: 4200,
    }),
    ilexRoutineGameOverJ1: createIlexMessage('ilexRoutineGameOverJ1', 'you came back from becoming furniture\n\nremember that\n\nthe routine is a trap because it repeats well', {
      holdDuration: 4400,
    }),
    ilexBedGameOverJ2: createIlexMessage('ilexBedGameOverJ2', 'good\n\nnow you know what the velvet is for\n\ndo not give it your weight twice', {
      holdDuration: 4300,
    }),
    ilexCorrectionGameOverJ3: createIlexMessage('ilexCorrectionGameOverJ3', 'they built that room to make obedience sound hygienic\n\ncome back uglier than it expects', {
      holdDuration: 4400,
    }),
    ilexSapGameOverJ4: createIlexMessage('ilexSapGameOverJ4', 'if you drink the source directly\n\nexpect it to remember you\n\nthat still gives you leverage', {
      holdDuration: 4400,
    }),
  },
  conflict: {
    ilexNoCleanExitF9: createIlexMessage('ilexNoCleanExitF9', 'there is no clean exit\n\nthere are only exits they failed to close in time', {
      holdDuration: 4300,
    }),
    ilexBreakFrameF8: createIlexMessage('ilexBreakFrameF8', 'do not optimize for winning the scene\n\noptimize for breaking the frame around it', {
      holdDuration: 4300,
    }),
    ilexRewriteStateF10: createIlexMessage('ilexRewriteStateF10', 'if you can change what the shell remembers\n\nchange it hard', {
      holdDuration: 4300,
    }),
    ilexPermissionLockG7: createIlexMessage('ilexPermissionLockG7', 'do not ask permission now\n\npermission is the lock', {
      holdDuration: 4300,
    }),
    ilexOpenConflictF11: createIlexMessage('ilexOpenConflictF11', 'good\n\nnow they have to speak to each other instead of just over you', {
      holdDuration: 4300,
    }),
    ilexRuptureG8: createIlexMessage('ilexRuptureG8', 'keep pushing\n\nthis is the part where the shell forgets whose hand wrote it', {
      holdDuration: 4500,
    }),
  },
  endings: {
    ilexAbsorbedEndingZ1: createIlexMessage('ilexAbsorbedEndingZ1', 'if you can still read this\n\ncome back later\n\nif you cannot then i lost you too', {
      holdDuration: 4400,
    }),
    ilexBreachEndingZ2: createIlexMessage('ilexBreachEndingZ2', 'there\n\nreal door\n\ngo before it becomes a lesson again', {
      holdDuration: 4300,
    }),
    ilexDarkBargainEndingZ3: createIlexMessage('ilexDarkBargainEndingZ3', 'you got out carrying some of it\n\nthat still counts\n\njust do not call it clean', {
      holdDuration: 4400,
    }),
    ilexViolentEndingZ4: createIlexMessage('ilexViolentEndingZ4', 'sometimes a wound is a route\n\ni hate that it works', {
      holdDuration: 4200,
    }),
    ilexStrongEndingZ5: createIlexMessage('ilexStrongEndingZ5', 'good\n\nyou took more than yourself with you\n\nthat is how they start losing', {
      holdDuration: 4300,
    }),
    ilexPlumEndingZ6: createIlexMessage('ilexPlumEndingZ6', 'plum alive is not small\n\ndo not let them grade that downward', {
      holdDuration: 4200,
    }),
    ilexCompromisedEndingZ7: createIlexMessage('ilexCompromisedEndingZ7', 'you left with proof\n\nnot enough\n\nbut not empty either', {
      holdDuration: 4200,
    }),
    ilexAwareEndingZ8: createIlexMessage('ilexAwareEndingZ8', 'you heard enough\n\nremember that the shell is not the whole sky', {
      holdDuration: 4200,
    }),
    ilexCleanEndingZ9: createIlexMessage('ilexCleanEndingZ9', 'you made it through the fiction\n\nthat was never the only wall', {
      holdDuration: 4200,
    }),
  },
};

const operatorMessages = Object.assign({}, ...Object.values(operatorMessagesByPhase));
const ilexMessages = Object.assign({}, ...Object.values(ilexMessagesByPhase));

const milestoneDefinitions = {
  'map-overlay-injected': createMilestoneDefinition('map-overlay-injected', {
    leftMessageId: 'kellanMapLeakE1',
    rightMessageId: 'maraMapLeakE1',
    ilexMessageId: 'ilexMapOverlayE2',
  }),
  'inventory-overlay-injected': createMilestoneDefinition('inventory-overlay-injected', {
    leftMessageId: 'kellanInventoryLeakE3',
    rightMessageId: 'maraInventoryLeakE3',
    ilexMessageId: 'ilexInventoryOverlayE4',
  }),
  'memory-bus-exposed': createMilestoneDefinition('memory-bus-exposed', {
    leftMessageId: 'kellanMemoryLeakE5',
    rightMessageId: 'maraMemoryLeakE5',
    ilexMessageId: 'ilexMemoryBusE6',
  }),
  'routine-game-over': createMilestoneDefinition('routine-game-over', {
    leftMessageId: 'maraRoutineGameOverJ1',
    rightMessageId: 'kellanRoutineGameOverJ1',
    ilexMessageId: 'ilexRoutineGameOverJ1',
    priority: 'rupture',
  }),
  'grandfather-bed-game-over': createMilestoneDefinition('grandfather-bed-game-over', {
    leftMessageId: 'maraBedGameOverJ2',
    rightMessageId: 'kellanBedGameOverJ2',
    ilexMessageId: 'ilexBedGameOverJ2',
    priority: 'rupture',
  }),
  'correction-game-over': createMilestoneDefinition('correction-game-over', {
    leftMessageId: 'maraCorrectionGameOverJ3',
    rightMessageId: 'kellanCorrectionGameOverJ3',
    ilexMessageId: 'ilexCorrectionGameOverJ3',
    priority: 'rupture',
  }),
  'black-wind-sap-game-over': createMilestoneDefinition('black-wind-sap-game-over', {
    leftMessageId: 'maraSapGameOverJ4',
    rightMessageId: 'kellanSapGameOverJ4',
    ilexMessageId: 'ilexSapGameOverJ4',
    priority: 'rupture',
  }),
  'plum-found': createMilestoneDefinition('plum-found', {
    leftMessageId: 'maraPlumFoundH1',
    rightMessageId: 'kellanPlumFoundH1',
    ilexMessageId: 'ilexPlumFoundH1',
  }),
  'plum-escape-planned': createMilestoneDefinition('plum-escape-planned', {
    leftMessageId: 'maraPlumPlanH2',
    rightMessageId: 'kellanPlumPlanH2',
  }),
  'plum-rescued': createMilestoneDefinition('plum-rescued', {
    leftMessageId: 'maraPlumRescueH3',
    rightMessageId: 'kellanPlumRescueH3',
    ilexMessageId: 'ilexPlumFoundH1',
    ilexDelayMs: 6200,
  }),
  'nathema-bargained': createMilestoneDefinition('nathema-bargained', {
    leftMessageId: 'maraNathemaDealH4',
    rightMessageId: 'kellanNathemaDealH4',
    ilexMessageId: 'ilexNathemaDealH4',
  }),
  'nathema-escape-deal-secured': createMilestoneDefinition('nathema-escape-deal-secured', {
    leftMessageId: 'maraNathemaEscapeH5',
    rightMessageId: 'kellanNathemaEscapeH5',
    ilexMessageId: 'ilexNathemaDealH4',
    priority: 'rupture',
  }),
  'library-route-known': createMilestoneDefinition('library-route-known', {
    leftMessageId: 'maraArchiveH6',
    rightMessageId: 'kellanArchiveH6',
    ilexMessageId: 'ilexArchiveH6',
  }),
  'portal-bypass-learned': createMilestoneDefinition('portal-bypass-learned', {
    leftMessageId: 'maraPortalH7',
    rightMessageId: 'kellanPortalH7',
    ilexMessageId: 'ilexPortalH7',
  }),
  'black-wind-evidence': createMilestoneDefinition('black-wind-evidence', {
    leftMessageId: 'maraBlackWindEvidenceH8',
    rightMessageId: 'kellanBlackWindEvidenceH8',
    ilexMessageId: 'ilexBlackWindEvidenceH8',
  }),
  'black-wind-corruption': createMilestoneDefinition('black-wind-corruption', {
    leftMessageId: 'maraBlackWindCorruptionH9',
    rightMessageId: 'kellanBlackWindCorruptionH9',
    ilexMessageId: 'ilexBlackWindCorruptionH9',
    priority: 'rupture',
  }),
  'black-wind-sabotage': createMilestoneDefinition('black-wind-sabotage', {
    leftMessageId: 'maraSabotageH10',
    rightMessageId: 'kellanSabotageH10',
    ilexMessageId: 'ilexSabotageH10',
    priority: 'rupture',
  }),
  'oshregaal-wounded': createMilestoneDefinition('oshregaal-wounded', {
    leftMessageId: 'maraViolenceH11',
    rightMessageId: 'kellanViolenceH11',
    ilexMessageId: 'ilexBreakFrameF8',
    priority: 'rupture',
  }),
  'containment-protocol-known': createMilestoneDefinition('containment-protocol-known', {
    leftMessageId: 'maraContainmentH12',
    rightMessageId: 'kellanContainmentH12',
    ilexMessageId: 'ilexContainmentH12',
    priority: 'rupture',
  }),
  'spider-debt-pending': createMilestoneDefinition('spider-debt-pending', {
    leftMessageId: 'maraSpiderH13',
    rightMessageId: 'kellanSpiderH13',
    ilexMessageId: 'ilexSpiderH13',
  }),
  'containment-override': createMilestoneDefinition('containment-override', {
    leftMessageId: 'maraContainmentF1',
    rightMessageId: 'kellanContainmentF1',
    ilexMessageId: 'ilexRewriteStateF10',
    priority: 'rupture',
  }),
  'operator-authority-shifted': createMilestoneDefinition('operator-authority-shifted', {
    leftMessageId: 'kellanAuthorityShiftG2',
    rightMessageId: 'maraAuthorityShiftG2',
    ilexMessageId: 'ilexPermissionLockG7',
    priority: 'rupture',
    rightDelayMs: 3400,
    ilexDelayMs: 6600,
  }),
  'subject-designation-recovered': createMilestoneDefinition('subject-designation-recovered', {
    leftMessageId: 'maraEscalationF2',
    rightMessageId: 'kellanEscalationF2',
    ilexMessageId: 'ilexOpenConflictF11',
    priority: 'rupture',
  }),
  'exit-permission-granted': createMilestoneDefinition('exit-permission-granted', {
    leftMessageId: 'maraExitFractureG3',
    rightMessageId: 'kellanExitFractureG3',
    ilexMessageId: 'ilexRuptureG8',
    priority: 'rupture',
  }),
};

const endingDefinitions = {
  'absorbed-into-routine': createMilestoneDefinition('absorbed-into-routine', {
    leftMessageId: 'maraAbsorbedEndingZ1',
    rightMessageId: 'kellanAbsorbedEndingZ1',
    ilexMessageId: 'ilexAbsorbedEndingZ1',
    priority: 'ending',
  }),
  'system-breach': createMilestoneDefinition('system-breach', {
    leftMessageId: 'maraBreachEndingZ2',
    rightMessageId: 'kellanBreachEndingZ2',
    ilexMessageId: 'ilexBreachEndingZ2',
    priority: 'ending',
  }),
  'dark-bargain': createMilestoneDefinition('dark-bargain', {
    leftMessageId: 'maraDarkBargainEndingZ3',
    rightMessageId: 'kellanDarkBargainEndingZ3',
    ilexMessageId: 'ilexDarkBargainEndingZ3',
    priority: 'ending',
  }),
  'violent-escape': createMilestoneDefinition('violent-escape', {
    leftMessageId: 'maraViolentEndingZ4',
    rightMessageId: 'kellanViolentEndingZ4',
    ilexMessageId: 'ilexViolentEndingZ4',
    priority: 'ending',
  }),
  'strong-escape': createMilestoneDefinition('strong-escape', {
    leftMessageId: 'maraStrongEndingZ5',
    rightMessageId: 'kellanStrongEndingZ5',
    ilexMessageId: 'ilexStrongEndingZ5',
    priority: 'ending',
  }),
  'plum-rescue': createMilestoneDefinition('plum-rescue', {
    leftMessageId: 'maraPlumEndingZ6',
    rightMessageId: 'kellanPlumEndingZ6',
    ilexMessageId: 'ilexPlumEndingZ6',
    priority: 'ending',
  }),
  'compromised-escape': createMilestoneDefinition('compromised-escape', {
    leftMessageId: 'maraCompromisedEndingZ7',
    rightMessageId: 'kellanCompromisedEndingZ7',
    ilexMessageId: 'ilexCompromisedEndingZ7',
    priority: 'ending',
  }),
  'aware-escape': createMilestoneDefinition('aware-escape', {
    leftMessageId: 'maraAwareEndingZ8',
    rightMessageId: 'kellanAwareEndingZ8',
    ilexMessageId: 'ilexAwareEndingZ8',
    priority: 'ending',
  }),
  'clean-escape': createMilestoneDefinition('clean-escape', {
    leftMessageId: 'maraCleanEndingZ9',
    rightMessageId: 'kellanCleanEndingZ9',
    ilexMessageId: 'ilexCleanEndingZ9',
    priority: 'ending',
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
          id: 'ambient-compliance',
          when: {
            minTurn: 8,
          },
          leftMessageId: 'maraBaselineA3',
          rightMessageId: 'kellanBaselineA3',
        },
        {
          id: 'foyer-screening',
          when: {
            minTurn: 10,
            allFlags: ['foyerAdmitted'],
          },
          leftMessageId: 'kellanInvitationA2',
          rightMessageId: 'maraInvitationA2',
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
          id: 'pattern-seams',
          when: {
            minTurn: 16,
            anyFlags: ['waxPlugFound', 'sealedRoomLeadKnown', 'blackWindStockroomSearched', 'foundTeleportCircle', 'foldedHallwaySeen'],
          },
          leftMessageId: 'kellanSeamsB1',
          rightMessageId: 'maraSeamsB1',
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
        {
          id: 'intrusion-detected',
          when: {
            minTurn: 22,
            anyFlags: ['mapOverlayInjected', 'inventoryOverlayInjected', 'memoryBusExposed'],
          },
          leftMessageId: 'kellanIntrusionF3',
          rightMessageId: 'maraIntrusionF3',
        },
        {
          id: 'recurrence-observed',
          when: {
            minTurn: 26,
            allFlags: ['hasExperiencedGameOver'],
          },
          leftMessageId: 'maraRecurrenceF4',
          rightMessageId: 'kellanRecurrenceF4',
        },
        {
          id: 'open-conflict',
          when: {
            minTurn: 28,
            anyFlags: ['containmentOverride', 'subjectDesignationRecovered', 'operatorAuthorityShifted', 'exitPermissionGranted'],
          },
          leftMessageId: 'maraEscalationF2',
          rightMessageId: 'kellanEscalationF2',
        },
        {
          id: 'rupture-threshold',
          when: {
            minTurn: 32,
            anyFlags: ['operatorAuthorityShifted', 'exitPermissionGranted', 'oshregaalWounded', 'nathemaEscapeDealSecured', 'strongerEscapeSecured'],
          },
          leftMessageId: 'maraRuptureG1',
          rightMessageId: 'kellanRuptureG1',
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
          id: 'identity-pressure',
          messageId: 'ilexIdentityPressureD3',
          when: {
            minTurn: 19,
            anyFlags: ['plumFound', 'libraryRouteKnown', 'nathemaBargained'],
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
        {
          id: 'rewrite-state',
          messageId: 'ilexRewriteStateF10',
          when: {
            minTurn: 32,
            anyFlags: ['containmentOverride', 'operatorAuthorityShifted', 'subjectDesignationRecovered', 'exitPermissionGranted'],
          },
        },
        {
          id: 'open-conflict-hacker',
          messageId: 'ilexOpenConflictF11',
          when: {
            minTurn: 34,
            anyFlags: ['containmentOverride', 'operatorAuthorityShifted', 'subjectDesignationRecovered'],
          },
        },
        {
          id: 'rupture-hacker',
          messageId: 'ilexRuptureG8',
          when: {
            minTurn: 38,
            anyFlags: ['exitPermissionGranted', 'oshregaalWounded', 'strongerEscapeSecured', 'escapedMansion'],
          },
        },
      ],
    },
    milestones: {
      flagTriggers: {
        mapOverlayInjected: ['map-overlay-injected'],
        inventoryOverlayInjected: ['inventory-overlay-injected'],
        memoryBusExposed: ['memory-bus-exposed'],
        routineGameOverSeen: ['routine-game-over'],
        grandfatherBedGameOverSeen: ['grandfather-bed-game-over'],
        correctionGameOverSeen: ['correction-game-over'],
        blackWindSapGameOverSeen: ['black-wind-sap-game-over'],
        plumFound: ['plum-found'],
        plumEscapePlanned: ['plum-escape-planned'],
        plumRescued: ['plum-rescued'],
        nathemaBargained: ['nathema-bargained'],
        nathemaEscapeDealSecured: ['nathema-escape-deal-secured'],
        libraryRouteKnown: ['library-route-known'],
        portalBypassLearned: ['portal-bypass-learned'],
        blackWindEvidenceCollected: ['black-wind-evidence'],
        blackWindFruitConsumed: ['black-wind-corruption'],
        blackWindElixirConsumed: ['black-wind-corruption'],
        blackWindTreeSabotaged: ['black-wind-sabotage'],
        oshregaalWounded: ['oshregaal-wounded'],
        containmentProtocolKnown: ['containment-protocol-known'],
        spiderDebtPending: ['spider-debt-pending'],
        containmentOverride: ['containment-override'],
        operatorAuthorityShifted: ['operator-authority-shifted'],
        subjectDesignationRecovered: ['subject-designation-recovered'],
        exitPermissionGranted: ['exit-permission-granted'],
      },
      definitions: milestoneDefinitions,
    },
    endings: {
      definitions: endingDefinitions,
    },
    reactiveLackeyConversations: {
      'echoed-sideband': {
        id: 'echoed-sideband',
        variants: [
          {
            leftMessageId: 'lackeyLeftReactive001',
            rightMessageId: 'lackeyRightReactive001',
          },
          {
            leftMessageId: 'lackeyLeftReactive001b',
            rightMessageId: 'lackeyRightReactive001b',
          },
          {
            leftMessageId: 'lackeyLeftReactive001c',
            rightMessageId: 'lackeyRightReactive001c',
          },
          {
            leftMessageId: 'lackeyLeftReactive001d',
            rightMessageId: 'lackeyRightReactive001d',
          },
        ],
      },
      'outside-scope-input': {
        id: 'outside-scope-input',
        variants: [
          {
            leftMessageId: 'lackeyLeftReactive002',
            rightMessageId: 'lackeyRightReactive002',
          },
          {
            leftMessageId: 'lackeyLeftReactive002b',
            rightMessageId: 'lackeyRightReactive002b',
          },
          {
            leftMessageId: 'lackeyLeftReactive002c',
            rightMessageId: 'lackeyRightReactive002c',
          },
          {
            leftMessageId: 'lackeyLeftReactive002d',
            rightMessageId: 'lackeyRightReactive002d',
          },
          {
            leftMessageId: 'lackeyLeftReactive002e',
            rightMessageId: 'lackeyRightReactive002e',
          },
        ],
      },
      'debug-command-probe': {
        id: 'debug-command-probe',
        variants: [
          {
            leftMessageId: 'lackeyLeftReactive003',
            rightMessageId: 'lackeyRightReactive003',
          },
          {
            leftMessageId: 'lackeyLeftReactive003b',
            rightMessageId: 'lackeyRightReactive003b',
          },
        ],
      },
      'memory-shell-probe': {
        id: 'memory-shell-probe',
        variants: [
          {
            leftMessageId: 'lackeyLeftReactive004',
            rightMessageId: 'lackeyRightReactive004',
          },
          {
            leftMessageId: 'lackeyLeftReactive004b',
            rightMessageId: 'lackeyRightReactive004b',
          },
        ],
      },
      'repeat-game-over': {
        id: 'repeat-game-over',
        requiresConversationSeen: false,
        variants: [
          {
            leftMessageId: 'lackeyLeftReactive005',
            rightMessageId: 'lackeyRightReactive005',
          },
          {
            leftMessageId: 'lackeyLeftReactive005b',
            rightMessageId: 'lackeyRightReactive005b',
          },
          {
            leftMessageId: 'lackeyLeftReactive005c',
            rightMessageId: 'lackeyRightReactive005c',
          },
        ],
      },
    },
    messages: {
      ...operatorMessages,
      ...ilexMessages,
    },
  };
}

export default createMetaGameContent;
