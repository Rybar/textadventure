<!-- markdownlint-disable MD032 -->

# Meta Dialogue Arc

This document replaces the current meta-message wording used in implementation.

Status:
- Treat the existing strings in [js/game/meta game/messages.js](js/game/meta game/messages.js) as obsolete placeholders.
- Do not preserve their phrasing in future implementation passes.
- This file is the new canonical source for the observation-layer dialogue between Mara, Kellan, and Ilex.

## Purpose

The meta layer should stop feeling like scattered debug flavor and start reading as a real dramatic structure.

The player should gradually understand three things:

1. Two operators are watching.
2. They disagree about what the player is.
3. A third presence inside the shell is teaching the player how to become a system problem rather than a successful subject.

The mansion fiction remains primary. The meta dialogue should sharpen dread, pattern recognition, and the player’s sense of external pressure without replacing Oshregaal as the immediate emotional center.

Under the restored Grizzelnit-canon planning docs, the shell is not only watching a simple dinner-and-escape plot. It is also watching which scheme the player privileges once the house opens into multiple meaningful branches.

Meta reactions should therefore sharpen when the player:

- prioritizes Plum as a person rather than a route asset;
- starts treating spellbooks, archives, or portal bypass as objectives;
- bargains with Nathema as an active rival schemer;
- realizes the house contains overlapping leverage systems rather than one correct win path.

## Voice Rules

### Mara

- Primary observer.
- Precise, clinical, withholding.
- Never sounds panicked until very late.
- Uses short declarative statements.
- Treats the player as process first, person second.

### Kellan

- Secondary observer.
- More verbal, more uncertain, more ethically porous.
- Notices emotional texture before Mara does, or admits that he does.
- Asks questions Mara considers inefficient.
- Should never become heroic too early.

### Ilex

- Former subject living inside the shell margins.
- Directly addresses the player.
- Not stable, not omniscient, not fully trustworthy.
- Gives useful guidance, but always with cost, pressure, or partial knowledge.
- Speaks in fragments because bandwidth, fear, and damaged continuity all matter.

## Structural Use

There are three forms of meta text:

### 1. Mara/Kellan exchange

- Always outside the fiction frame.
- Always reads like operational bleed.
- Usually two to four lines.
- Best when reactive to player behavior or milestone transition.

### 2. Ilex injection

- Always feels invasive and addressed to the player.
- Usually one to four short lines.
- Should feel like it cost something to send.

### 3. Escalation response

- The operators begin reacting not just to the player, but to Ilex and to the shell itself.
- This is where the meta layer stops being deniable.

## Conversation Arc Overview

The full arc is organized into seven phases.

1. Baseline observation
2. Pattern concern
3. Friction between operators
4. First Ilex breach
5. Tool and state leakage
6. Open containment conflict
7. Endgame rupture

Each phase below includes:

- Story purpose
- Recommended trigger space
- Mara/Kellan dialogue pool
- Ilex dialogue pool where applicable

## Phase 1: Baseline Observation

Purpose:
- Let the player mistake the meta layer for style noise.
- Establish Mara as colder and Kellan as slightly more human.
- Keep everything deniable.

Use during:
- Arrival
- Invitation acceptance
- Early foyer/feast movement
- Mild hesitation or observation without clear deviation
- Early compliance before the player has exposed deeper branches like Plum, Nathema leverage, or library theft

### Exchange A1

Mara/Kellan:

```text
mara: scenario seeded cleanly
kellan: subject took longer at the threshold
mara: threshold hesitation is ordinary
```

### Exchange A2

```text
kellan: invitation path confirmed
mara: yes
kellan: they looked at it twice
mara: that improves attachment reliability
```

### Exchange A3

```text
mara: ambient compliance is acceptable
kellan: they still seem wary
mara: wariness is not resistance
```

### Exchange A4

```text
kellan: do they know they are being screened
mara: not in a usable way
```

### Exchange A5

```text
mara: host fiction is carrying the opening
kellan: it usually does
mara: that is why we keep using it
```

Design note:
- Mara should sound like she has seen this many times.
- Kellan should sound like he is still capable of noticing that “subject” means someone.

## Phase 2: Pattern Concern

Purpose:
- The operators begin discussing the player as an active anomaly rather than passive data.
- The player should start to suspect observation is reactive.

Use during:
- Repeated loops
- Clever parser behavior
- Early secret discovery
- Suspicious non-compliance
- Early recognition that the mansion supports more than one objective route

### Exchange B1

```text
kellan: they are circling the same space again
mara: note persistence
kellan: i think they are testing for seams
mara: everyone tests for seams eventually
```

### Exchange B2

```text
kellan: that solve was fast
mara: still within model spread
kellan: you say that about everything
mara: most things remain inside it
```

### Exchange B3

```text
mara: curiosity markers are rising
kellan: is that good
mara: it is useful
```

### Exchange B4

```text
kellan: they are less frightened than the last one
mara: not less frightened
mara: more directional
```

### Exchange B5

```text
kellan: do we intervene if they skip too much
mara: no
kellan: even if they break sequence
mara: especially then
```

### Exchange B6

```text
mara: host contact should increase lock-in
kellan: unless it sharpens refusal
mara: refusal is also data
```

Design note:
- This phase is where Kellan begins to sound bothered.
- Mara is still fully committed to extraction over safety.

## Phase 3: Friction Between Operators

Purpose:
- Move from detached monitoring to ideological tension.
- Kellan starts sounding morally compromised by proximity.
- Mara starts sounding more revealing precisely because she is annoyed.

Use during:
- Strong deviation
- Deep exploration
- NPC leverage branches
- Any player behavior that suggests planning rather than wandering
- Clear commitment to rescue, archive theft, black-wind proof, or bargaining as a chosen line of play

### Exchange C1

```text
kellan: they are treating the environment like it means something
mara: it does mean something
kellan: you know what i mean
mara: yes
```

### Exchange C2

```text
kellan: if they find the hidden routes this early
mara: then we learn faster
kellan: that is not what i asked
```

### Exchange C3

```text
mara: subject remains recoverable
kellan: recoverable for who
mara: for continuation
```

### Exchange C4

```text
kellan: i do not like how deliberate this one feels
mara: deliberation is not special
kellan: you always say that before the strange ones become expensive
```

### Exchange C5

```text
kellan: if they start recognizing pattern pressure
mara: then we measure whether recognition changes behavior
kellan: and if it does
mara: then the session becomes interesting
```

### Exchange C6

```text
kellan: this would read differently if they were awake for it
mara: runtime subjects are not awake in any stable sense
kellan: you keep saying that like it solves something
```

Design note:
- Kellan should begin sounding less like a colleague and more like a reluctant witness.

## Phase 4: First Ilex Breach

Purpose:
- Ilex arrives as a disruptive human pressure against operator abstraction.
- The first breach must be brief and unnerving, not explanatory.

Use during:
- After the player has enough normal context to feel the intrusion
- Preferably after host contact or strong route discovery
- Preferably before system help feels like normal quality-of-life UI

### Ilex D1: First Contact

```text
don't answer this

just keep moving

if they think you noticed me they will narrow the shell
```

### Ilex D2: Alternate first contact

```text
listen carefully

this isn't part of the scenario

pretend it is
```

### Ilex D3: Identity pressure

```text
i was in one of these

not this house

same cage
```

### Operator response D4

```text
kellan: something wrote across the frame
mara: yes
kellan: was that scheduled
mara: no
```

### Operator response D5

```text
kellan: is someone inside the layer
mara: unknown
kellan: that is not reassuring
mara: it was not meant to be
```

Design note:
- Ilex should not immediately explain the system.
- The key emotional result is not clarity. It is contamination.

## Phase 5: Tool and State Leakage

Purpose:
- The player starts receiving concrete help.
- The operators shift from observing the player to reacting to infrastructure damage.
- Ilex becomes more directive, but still not fully reliable.

Use during:
- Map unlock
- Inventory unlock
- Transcript/memory/state exposure
- Any UI-level intrusion
- Discovery of Plum's true nature, spellbook objectives, or portal-bypass clues can also justify this phase because the player is starting to read systems rather than just rooms

### Map event

Operator exchange E1:

```text
kellan: did you authorize a spatial overlay
mara: no
kellan: then why is it rendering one
mara: flag the breach and keep recording
```

Ilex E2:

```text
you get lost where they want you lost

this should help

it will drift if they notice it too hard
```

### Inventory event

Operator exchange E3:

```text
kellan: that panel is not native
mara: i know
kellan: should we terminate the session
mara: not while it is still producing differential behavior
```

Ilex E4:

```text
they hide meaning in state

they also hide state from you

start watching what the shell thinks you are carrying
```

### Memory/state event

Operator exchange E5:

```text
kellan: that is internal state exposure
mara: confirmed
kellan: how are they seeing it
mara: containment has become porous
```

Ilex E6:

```text
good

stop treating flags like secrets

they are hinges
```

### General leakage pool

Operator exchange E7:

```text
kellan: we should stop this before the shell starts teaching back
mara: it has always been teaching back
kellan: not like this
```

Operator exchange E8:

```text
mara: unauthorized assistance is now persistent
kellan: say sabotage like you mean sabotage
mara: persistent sabotage then
```

Ilex E9:

```text
they think in thresholds

you need pressure points instead
```

Ilex E10:

```text
survival is not enough

if you leave clean they still keep you
```

Design note:
- This is where Ilex should start sounding like someone who knows the trap from inside.
- Do not make Ilex purely benevolent. They are teaching the player to become difficult, not safe.
- If the player is following the Plum route, Ilex should increasingly push them toward leverage and fracture, not just sentimental rescue.

## Phase 6: Open Containment Conflict

Purpose:
- Mara and Kellan are no longer merely tracking the subject.
- They are now arguing about whether to preserve the session, the data, or the subject.
- Ilex becomes more explicit about disruption over survival.

Use during:
- Major deviation
- Meta-aware player behavior
- State manipulation
- Endgame route commitment
- Explicit branch commitment such as taking spellbooks, preparing a portal bypass, or leaning on Nathema as an escape vector

### Exchange F1

```text
kellan: we should shut it down
mara: and lose the breach chain
kellan: this is not clean data anymore
mara: it never was
```

### Exchange F2

```text
kellan: they are responding to us
mara: maybe
kellan: that should not be a maybe
mara: and yet
```

### Exchange F3

```text
mara: subject is no longer behaving like a closed runtime instance
kellan: say person once
mara: that would not help them
```

### Exchange F4

```text
kellan: if the intruder is a former subject
mara: then containment failed before
kellan: you say that too calmly
mara: because surprise would be decorative
```

### Exchange F5

```text
kellan: are we still observing the scenario or the breach
mara: there is no longer a useful difference
```

### Exchange F6

```text
kellan: if they get out with help does it still count
mara: yes
kellan: why
mara: because the system had to be pressured to reveal itself
```

### Exchange F6b

```text
kellan: they stopped acting like there is only one way out
mara: good
kellan: good for who
mara: for the part that still measures adaptation
```

### Exchange F6c

```text
mara: they are converting narrative objects into leverage objects
kellan: that sounds close to understanding
mara: it sounds close to risk
```

### Ilex F7

```text
they are measuring compliance because compliance scales

be expensive instead
```

### Ilex F8

```text
do not optimize for winning the scene

optimize for breaking the frame around it
```

### Ilex F9

```text
there is no clean exit

there are only exits they failed to close in time
```

### Ilex F10

```text
if you can change what the shell remembers

change it hard
```

Design note:
- This phase should feel unstable.
- Kellan becomes openly distressed.
- Mara becomes more honest because denial is no longer efficient.

## Phase 7: Endgame Rupture

Purpose:
- The three voices converge on the same fact: the shell is no longer intact.
- Mara and Kellan lose narrative distance.
- Ilex becomes sharply directive.
- The player's chosen branch should now color the pressure: Plum, evidence, spellbooks, portal bypass, or betrayal should not all feel emotionally identical even if the voices remain system-oriented.

Use during:
- Memory rewrite
- State manipulation
- True-ending path
- Explicit system breach
- Final commitment to a branch that changes what counts as escape or what the player is carrying out with them

### Exchange G1

```text
kellan: they are inside the state layer
mara: i see it
kellan: that is not possible
mara: it is happening anyway
```

### Exchange G2

```text
kellan: stop them
mara: i cannot from here
kellan: then do something
mara: i am watching the structure fail in real time
```

### Exchange G3

```text
mara: containment is lost
kellan: say breach
mara: breach then
```

### Exchange G4

```text
kellan: are they rewriting the scenario
mara: yes
kellan: can it be reverted
mara: not before completion
```

### Exchange G5

```text
kellan: what counts as completion now
mara: i do not know
```

### Ilex G6

```text
yes

that's it

keep going before they collapse the route
```

### Ilex G7

```text
do not ask permission now

permission is the lock
```

### Ilex G8

```text
the shell only understands outcomes

become one it cannot grade
```

### Ilex G9

```text
if the command changes shape

follow it anyway
```

Design note:
- This phase should feel like operational speech becoming emergency speech.

## Ending-Specific Dialogue

These are not generic pool lines. They should be reserved for ending resolution.

### Ending: Clean Subject

Use when:
- The player escapes the mansion fiction.
- The meta layer is not meaningfully engaged.

Operator resolution H1:

```text
mara: subject completed scenario
kellan: no breach behavior
mara: correct
```

Optional cold tag:

```text
mara: archive as compliant fiction completion
```

### Ending: Compliant Escape

Use when:
- The player benefited from meta assistance but never truly destabilized the shell.

Operator resolution H2:

```text
mara: assisted success
kellan: does that count
mara: it counts
```

Optional follow-up:

```text
kellan: i hate that answer
mara: i know
```

### Ending: Violent or Disruptive Fictional Escape

Use when:
- The player wins strongly inside the Oshregaal layer.
- The meta shell is stressed but not breached.

Operator resolution H3:

```text
kellan: they forced the outcome
mara: yes
kellan: was that expected
mara: not in that shape
```

Ilex tag H4:

```text
good

now learn the difference between leaving the house and leaving them
```

### Ending: System Breach

Use when:
- The player manipulates memory/state or reaches the true meta rupture.

Operator resolution H5:

```text
kellan: they are rewriting it
mara: i see it
kellan: stop them
mara: i can't
```

Ilex resolution H6:

```text
yes

that is the first real door

go
```

### Ending: Absorption / Failure

Use when:
- The player is socially captured, contained, or absorbed into routine.

Operator resolution H7:

```text
mara: subject stabilized inside fiction
kellan: that is a cruel word for it
mara: it is an accurate one
```

Alternate harsher version:

```text
kellan: do we call that completion
mara: the system does
```

### Ending: Ilex Interrupted

Use if desired for a bad meta ending:

```text
kellan: the intruder signal is gone
mara: yes
kellan: did we lose them too
mara: probably
```

## Recommended Implementation Shape

When this is turned back into code, prefer:

- paired conversation objects for Mara/Kellan, not isolated single lines;
- named phases or milestones instead of flat random pools;
- Ilex messages grouped by function: warning, coaching, rupture, ending;
- reactive dialogue that escalates once the player addresses the sideband directly.

The current message file should eventually be replaced with:

1. phase-based operator exchanges;
2. event-based Ilex interventions;
3. ending-specific resolution blocks.
4. milestone hooks that distinguish Plum rescue, archive theft, portal bypass, evidence capture, and Nathema bargaining.

## Hard Rules For Rewrite

- Do not reuse the current `l1>` / `l2>` phrasing.
- Do not present Mara and Kellan as generic debug logs.
- Do not make Ilex fully coherent too early.
- Do not let Mara become melodramatic.
- Do not let Kellan become the player's secret friend.
- Do not let Ilex sound omnipotent.

## Final Narrative Truth

Mara, Kellan, and Ilex are not three flavors of exposition.

They are three incompatible answers to the same question:

What is the player, once they begin to notice the cage?

- Mara says: a process under observation.
- Kellan says: a subject who may still be a person.
- Ilex says: a future breach in progress.
