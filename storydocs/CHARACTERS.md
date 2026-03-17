# Characters

This file records the important characters, what they want, how they pressure the player, and what engine support they imply.

## Grandfather Oshregaal

### Core identity

- Elderly chaos sorcerer.
- Creator of black wind elixir and patriarch of the tusk people.
- Enormous appetites: food, stories, admiration, mutation, spectacle.
- Simultaneously slovenly, brilliant, vain, affectionate, and cruel.

### Story role

- Host.
- Warden disguised as entertainer.
- Social gate between entry and deeper exploration.
- Final pressure source even when off-screen.

### What he wants from the player

- Compliance framed as courtesy.
- Entertainment.
- Proof that the player accepts his terms of reality.
- Reasons to delay departure.

### How he should feel in play

- Hard to refuse directly.
- Always talking before violence becomes necessary.
- Generous in a way that creates debt.
- Interested in the player more as a curiosity than an enemy.

### Parser-facing needs

- Rich `ask`, `tell`, `give`, `drink`, `sit`, and `refuse` responses.
- State for whether the player has insulted him, fed his ego, offered blood, accepted wine, agreed to stay, or tried to leave.
- A conversation model that can tolerate repeated interaction without exhausting his personality too quickly.

### Engine implications

- Exit guards that can be social, not just physical.
- Scene-state milestones for dinner phases.
- A system for host reactions to manners, gifts, and open defiance.
- Global consequences if he becomes suspicious or enraged.

## Lady Kelago

### Core identity

- Oshregaal's older sister.
- Biomancer artist obsessed with making living furniture.
- One of the few people Oshregaal truly loves.

### Story role

- Grotesque domestic counterpoint to Oshregaal.
- Source of clues about the household's emotional history.
- Optional ally, menace, or distraction.

### What she wants

- Beauty.
- Consent twisted into artistry.
- Interesting conversation.
- Subjects and materials.

### Best use in the adaptation

- She should be seductive in the sense of aesthetic fascination, not romantic coding.
- She is ideal for `ask about brother`, `ask about furniture`, `tell work is beautiful`, `look at chair`, and `shake hand`-style clue chains.
- She should reward attention and flattery more than obedience.

### Engine implications

- Conversation topics that unlock hints.
- Room-specific clue flags.
- Transformative hazards that can be postponed or reframed, not instant fail states.

## Pazuzu The Imp

### Core identity

- Bound servant.
- Bitter, resentful, observant.
- Forced to obey Oshregaal while hating him.

### Story role

- Chaperone.
- Source of tension between what servants say and what they mean.
- Natural bridge between mansion fiction and meta-story paranoia.

### What he wants

- To spite Oshregaal.
- To complain.
- To survive his binding.
- To exploit loopholes without openly betraying his master.

### Best use in the adaptation

- He should be one of the first characters to feel like he knows the rules are traps.
- His help should come in evasions, tone, emphasis, and resentment.
- He is ideal for hint delivery that still feels diegetic.

### Engine implications

- Conditional hint dialogue.
- Chaperone states that can constrain or open movement.
- Reactive lines for forbidden topics and stolen objects.

## Oggaf And Zamzam

### Core identity

- Mutant ogre butlers.
- Polite, procedural, watchful.
- Enforcers of the front-of-house fiction.

### Story role

- Border guards between public hospitality and forbidden wandering.
- A test of etiquette before Oshregaal appears.

### What they want

- Names.
- Invitations.
- Proper behavior.
- Reduced confusion.

### Best use in the adaptation

- They should be easy to talk to but hard to out-argue.
- They should respond to titles, invitations, and formal phrasing.
- They should punish obvious trespass faster than subtle insolence.

### Engine implications

- Name recognition.
- Invitation-gated access.
- Guard dialogue with suspicion thresholds.

## Wrongus

### Core identity

- Chef ogre.
- Busy, gross, strangely practical.
- Oversees the blood-homunculus stew.

### Story role

- Makes the feast horrifyingly concrete.
- Connects Oshregaal's performance to physical process.

### What he wants

- To finish the meal.
- To keep the kitchen functional.
- To avoid interruption unless the interruption is useful.

### Best use in the adaptation

- Kitchen dialogue should reveal process, not lore dumps.
- He should be less philosophical than the front-of-house cast.
- The kitchen is a good place for the player to realize the hospitality ritual is literal consumption.

### Engine implications

- Timed or milestone-based dinner prep state.
- Responses to the blood cup, stew, ingredients, and sabotage.

## Plum The Scribe

### Core identity

- Vat-spawned copy of a dead empress.
- Intelligent, empathetic, memory-damaged.
- Maintains notes to herself because Oshregaal periodically wipes her memory.

### Story role

- Strongest first rescue target.
- Humanizing center of the deeper mansion.
- Source of actionable knowledge about survival and resistance.

### What she wants

- Escape.
- Continuity of self.
- To kill Oshregaal if escape fails.
- To be believed.

### Best use in the adaptation

- Plum should be the clearest emotional reason to keep pushing deeper.
- Her notes should function as both lore and practical clue bundles.
- She is also the most natural in-fiction source for anti-command techniques and escape planning.

### Engine implications

- Recoverable note documents.
- Rescue state.
- Escort-light logic or post-rescue abstracted ally support.
- Branching outcomes depending on whether she escapes, dies, or remembers enough.

## Lady Nathema

### Core identity

- High-status tusk clan leader or near-leader.
- Dangerous guest with her own agenda.
- Interested in black wind fruit, leverage, and power.

### Story role

- Rival operative inside the feast structure.
- Optional mission target, bargaining partner, or threat.

### What she wants

- Black wind fruit or elixir.
- Political advantage.
- Apprenticeship or influence with Oshregaal.

### Best use in the adaptation

- She should offer the player morally compromised opportunities.
- She should feel competent and impatient.
- The player should be able to lie to her, bargain with her, or betray her.

### Engine implications

- Alternative objective branches.
- Social reputation changes.
- Negotiation and trade flags.

## Slorum

### Core identity

- Otyugh in the cesspit.
- Well-fed, oddly intelligent, attached to her foul doll-party.

### Story role

- Grotesque but not purely hostile obstacle on one escape route.
- Example of the mansion's discarded underside mirroring the feast above.

### Best use in the adaptation

- Should be negotiable, distractible, or avoidable.
- Ideal for tonal contrast: pathetic, disgusting, and unexpectedly legible.

## Chariadulscha / He-Who-Counts

### Core identity

- Dead or nearly dead god-shade.
- Source of information, not rescue.
- Demands future chaos in exchange for truth.

### Story role

- Optional bargain machine.
- Late-game truth source.
- A reminder that the mansion is only one node in a larger occult world.

### Engine implications

- Promise-tracking.
- Deferred consequences.
- Knowledge exchange systems.

## The Experiment Operators

### Core identity

- Cold observers running or maintaining the test environment.
- Interested in compliance, attachment, distress thresholds, and predictive behavior.

### Story role

- Off-screen antagonistic infrastructure.
- They should never be more vivid than Oshregaal during the early game.

### Engine implications

- Scheduled side-channel messages.
- Unlockable UI upgrades tied to milestones.
- Alternate failure interpretation: not just death, but containment outcomes.

## The Hacker / Prior Subject

### Core identity

- Someone with partial access to the shell.
- Uncertain motives, but clearly hostile to the operators.
- Offers warnings that are helpful but incomplete.

### Story role

- Counter-voice to the operators.
- First proof that the side-channel messages are not just atmospheric noise.

### Engine implications

- Milestone-gated interjections.
- Hints that point toward genuine escape vectors without solving puzzles outright.
- Unauthorized interface hacks, especially the later arrival of map and inventory panels.
- Eventual exposure of a memory panel that surfaces pseudo-memory addresses the player can learn to manipulate.
