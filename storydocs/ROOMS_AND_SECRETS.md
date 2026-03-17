# Rooms And Secrets

This file maps the mansion as story structure rather than encounter key. It is intended to help with both room writing and engine implementation.

## Core Structural Rule

The mansion is not just a map. It is a pressure gradient.

- Outer rooms establish wonder and danger.
- Front rooms enforce etiquette.
- Inner rooms expose household truth.
- Deep rooms reveal the occult machinery of mutation, entrapment, and escape.

## First Playable Slice

These are the ten rooms that should remain the first polished vertical slice.

1. Cavern
2. Fern Garden
3. Grand Stairs
4. Foyer
5. Sitting Room
6. Guest Room
7. Feast Hall
8. Kelago's Room
9. Kitchen
10. Secret Circle

This slice already supports invitation logic, initial hospitality pressure, Oshregaal contact, servant friction, one major side character, and one hidden escape thread.

## Outer Approach

### Cavern

- First image of the mansion embedded in the cavern wall.
- Signals that the house is both absurdly elegant and physically wrong.
- Important affordances: inspect windows, approach stairs, note alternate paths, observe dangerous wildlife signs.
- Implementation note: this room should establish that visible exits are not the only exits.

### Fern Garden

- Overgrown former garden filled with statues, concealment, and astral peafowl threat.
- Important affordances: search foliage, inspect statues, survive or outwit peafowl, find tunnel path.
- Clue role: teaches that hidden routes exist outside the formal entrance.

### Shack

- Fishing gear, odd supplies, polymorph vials, gore-stained practicality.
- Good optional early loot room.
- Good place to seed that servants have hobbies and routines.

### Grand Stairs

- Ceremonial approach to the house.
- Must feel like crossing a threshold into expected performance.
- Hidden detail: pit access on the east side.

### Pit And Cesspool

- First strong sign that the house has a digestive underside.
- Escape-adjacent route, but filthy and risky.
- Slorum and the mock dinner tableau echo the feast in degraded form.

## Hospitality Layer

### Foyer

- The official front door scene.
- Oggaf and Zamzam test names, invitation, and bearing.
- Piano creature establishes that even decor is alive.
- The player must learn the house's logic: politeness is surveillance.

### Sitting Room

- Soft furnishings that breathe and gossip.
- Fountain that looks comforting but has subtle magical consequences.
- Best use: reward `look`, `listen`, `sit`, and `drink` with slightly different truths.

### Ogre Beds

- Domestic back-of-house room.
- Useful because it lowers the grandeur and makes the household tangible.
- Good place for theft, disguise, or servant-pattern clues.

### South Guest Room

- Safe-looking bedroom for the player if they stay.
- Should communicate false hospitality.

### North Guest Room

- Lady Nathema's space.
- Holds status clues, contraband, cursed wealth, and active political pressure.
- Best parser actions: search bedrolls, inspect chest wrapping, talk to Nathema, test trust and deceit.

## Inner Household

### Kelago's Room

- One of the strongest rooms in the whole module.
- Beauty, mutation, living furniture, intimacy with horror.
- Critical functions:
  - deepen Oshregaal's family texture;
  - show a house member who is neither servant nor prisoner;
  - seed clues and alternate social pathways.
- Adaptation guidance: keep the room unsettling and conversational, not just monstrous.

### Feast Hall

- Emotional center of the mansion.
- Oshregaal, tusk retainers, the imp, the meal, and the red curtains hiding the Secret Circle.
- This room should evolve across visits or phases.
- Important state changes:
  - admitted to the feast;
  - blood requested or refused;
  - host contact established;
  - player suspicion raised;
  - secret-circle clue seeded.

### Grandfather's Room

- Personal chamber and coercive one-way gate deeper into the house.
- Metal-hand door is an excellent parser puzzle and should stay.
- The cursed bed and trapped concubines are memorable but should be framed as horror and warning, not as random gotcha.
- Key story job: make it explicit that Oshregaal will not let guests leave.

### Kitchen

- The feast's backstage.
- Best place to reveal the blood-homunculus ritual in concrete terms.
- Important affordances: inspect stew, question Wrongus, sabotage meal, find ingredients, understand timing.

### Secret Circle

- Hidden room behind the feast hall curtains.
- Crucial because it converts vague suspicion into actionable escape possibility.
- The room should feel older than Oshregaal's dinner performance.
- Important affordances: inspect books, inspect circle, use scroll, discover portal logic.

## Deep Weird Layer

### Spider Room

- Locked, occult, and informational.
- Chariadulscha should be an unsettling knowledge source, not a conventional NPC ally.

### Trophy Room

- A museum of conquest, desecration, and cursed memory.
- Houses the Grey Grin Blade.
- Should reward careful inspection and make theft feel consequential.

### Stairwell

- Transitional predator space.
- The stalker-statue concept is strong; in parser form it should become a repeat pressure room rather than pure combat tax.

### Library

- Oshregaal's intellectual self-image made physical.
- Good place for history, doctrine, keys, and clues about how he thinks.
- Should support reading, searching, and forbidden-knowledge risk.

### Bathroom

- Grotesque relief space with practical connection to the cesspit route.
- Useful because it makes escape humiliating but possible.

### Sealed Room

- Punishment and containment space.
- Should matter as a threat even if the player never enters it.
- Good candidate for meta-story resonance: explicit confinement mirroring experimental containment.

## Black Wind Cluster

### Black Wind Fruit / Alchemist Space

- The place where the source of tusk power becomes material and stealable.
- Strong objective room because it connects politics, mutation, and trade.

### Black Wind Tree

- One of the deepest source-truth rooms.
- The tree should feel like the mansion's original sin made botanical.
- Destroying or sampling it should be a major branch, not a side action.

## Impossible Geometry Cluster

### Folded Hallway

- Essential escape route.
- The impossible shape is one of the module's signature ideas.
- In parser form, the hallway should be readable through repeated inspection and clue layering, not only through diagram shock.

### Nyarlathotep Statue

- Mechanism for unfolding the hallway.
- The current source solution assumes two living palms.
- Single-player adaptation should preserve the eerie logic while allowing alternatives:
  - recruit help;
  - use a body substitute;
  - unlock a later one-person ritual version;
  - or let the hacker/meta layer expose a workaround at cost.

### Idol Room

- Valuable but hazardous side-objective room.
- Good place for greed tests and trap telegraphing.

### Tunnel

- Exterior/interior link that proves the mansion is not sealed so much as selectively permeable.

## Scribe's Chamber

### Plum's Room

- Emotional anchor of the deeper mansion.
- The memory folder is one of the best clue bundles in the module.
- This room should shift the player from mere escape to rescue-plus-escape.

## Secret Design Rules

- Every mandatory secret should have at least two clues and one soft preview.
- Every hidden route should feel slightly improper or off-protocol.
- The best secrets in this adaptation are actions that look like manners, mistakes, or idle curiosity.

## Room Authoring Checklist

When implementing a room, try to supply all of the following:

- one sentence of immediate sensory identity;
- three obvious examine targets;
- one non-obvious target;
- one social or ritual affordance;
- one clue pointing elsewhere;
- one state change or revisit payoff.
