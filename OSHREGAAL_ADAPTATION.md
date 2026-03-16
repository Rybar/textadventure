# Oshregaal Adaptation Notes

## Conclusion

Yes. This adventure is a very good fit for the game.

The strongest parts for a parser-based text adventure are not the tactical combat encounters. They are the invitation premise, the surreal mansion, the social pressure of the feast, the grotesque domestic details, the hidden exits, and the feeling that entering the mansion is easy but leaving it is difficult.

That structure maps cleanly onto an exploration-heavy retro text adventure.

## What The PDF Is, In Practical Terms

At a high level, the adventure centers on Grandfather Oshregaal, an aged chaos sorcerer who created the tusk people using black wind elixir. He now lives in a lavish, deeply strange mansion built into a cavern wall and spends his later years feasting, entertaining guests, mutating life, and refusing to let visitors leave.

The adventure has several strong pillars:

- A written invitation to dinner as the entry point.
- A cavern approach and bizarre mansion exterior.
- A rococo interior full of body horror, absurdity, and hospitality.
- A powerful host who is more interesting socially than as a simple boss.
- Multiple possible objectives: kill a guest, kidnap a guest, rescue a captive, steal a blade, destroy the black wind tree, or kill Oshregaal.
- A mansion that acts as a one-way gate deeper into danger.
- Several memorable escape routes and hidden connections.

## Why It Works For This Project

It already has the qualities that work well in a parser game:

- Distinct rooms with strong identities.
- Dense interactive objects.
- Secrets, hidden doors, and alternate traversal.
- Social encounters where phrasing and timing matter.
- A host whose rules can be learned and manipulated.
- Weird inventory opportunities.
- A strong final objective with multiple approaches.

It also suits the retro interface direction:

- The mansion map can be shown as ASCII panels.
- The feast hall, foyer, trophy room, and cavern are all good ASCII-art candidates.
- Transcript formatting can sell Oshregaal's dialogue and the imp's interruptions.
- Parser commands fit the space naturally: `give invitation`, `shake hand`, `sit quietly`, `ask about Nathema`, `steal cloak`, `drink wine`, `read runes`, `use portal`.

## Best Adaptation Strategy

Do not adapt it as a straight combat crawler.

Instead, adapt it as a social-surreal infiltration adventure where:

- combat is rare, dangerous, and usually a failure state or optional solution,
- exploration and conversation do the heavy lifting,
- puzzles come from rules of the house,
- the player is trying to complete one or more objectives and then escape.

That is the version most likely to feel good in a text adventure engine.

## Recommended Game Frame

The player arrives with a forged or stolen invitation to dine with Grandfather Oshregaal.

Before entering play, choose one mission from a short list, or let the player discover one during the game.

Recommended mission set:

- Assassinate Lady Nathema.
- Rescue the vat-spawn scribe.
- Steal the Grey Grin Blade.
- Destroy the black wind tree.
- Escape with proof of Oshregaal's weakness.

For a first full implementation, pick one primary mission and two optional missions.

Best first primary mission:

- Rescue the scribe and escape.

Why:

- It gives the player a clear humane goal.
- It encourages exploration into the deeper mansion.
- It does not require killing Oshregaal in the first pass.
- It allows multiple endings depending on what else the player accomplishes.

## Recommended Structure For The Text Adventure

Break the game into five acts.

### Act 1: Invitation and Arrival

The player learns rumors, receives or steals an invitation, and approaches the cavern mansion.

Key rooms:

- Cavern approach
- Fern garden
- Fishing shack
- Grand stairs

Key functions:

- Establish tone.
- Teach that the grounds are already strange.
- Offer one or two optional discoveries before entering the mansion.

### Act 2: Hospitality as Threat

The player enters the foyer and is treated as a guest.

Key rooms:

- Foyer
- Sitting room
- Guest room
- Feast hall

Key functions:

- Introduce polite monster servants.
- Establish Oshregaal's personality.
- Teach social rules: behave, converse, accept hospitality carefully, don't try to leave.

### Act 3: Wandering The Mansion

The player gets a reason or pretext to explore northward.

Key rooms:

- Kelago's room
- Grandfather's room
- Secret circle
- Kitchen
- Ogre beds

Key functions:

- Discover the mansion's inner logic.
- Find clues, keys, and escape tools.
- Start learning there are multiple routes out.

### Act 4: The Inner Dungeon

The player moves deeper into the surreal back half of the mansion.

Key rooms from the PDF that adapt especially well:

- Trophy room
- Spider room with the dead god
- Library or portrait room if included
- Bathroom and cesspit route
- Folded hallway and tunnel route

Key functions:

- Shift from social unease into dangerous weirdness.
- Gate the player with puzzle logic rather than pure combat.
- Offer alternate escape and mission completion routes.

### Act 5: Objective and Escape

The player chooses how much risk to take.

Possible finales:

- Escape quietly with the scribe.
- Steal the sword and flee.
- Burn or poison the black wind tree.
- Betray one faction to another.
- Confront Oshregaal directly.

## What To Keep From The Module

These are the strongest elements and should survive adaptation.

- Oshregaal as a charismatic, gluttonous, dangerous host.
- The invitation to dinner.
- The contrast between manners and monstrosity.
- The mutant ogre butlers.
- The imp servant who hates Oshregaal.
- Kelago as a memorable grotesque artisan.
- The black wind tree and elixir as the core source of corruption.
- The mansion's hidden exits and one-way-gate feeling.
- The Grey Grin Blade as a high-value optional objective.
- The feast as the emotional and structural center of the game.

## What To Change For A Parser Game

Some module elements are excellent at a tabletop but should be adjusted for this format.

### Reduce pure combat density

The player should not have to fight through room after room. Convert many threats into avoidable hazards, conversational scenes, stealth situations, or puzzle obstacles.

### Turn stat blocks into interaction profiles

Instead of HD, AC, and Morale, represent important beings through:

- attitude,
- desires,
- weaknesses,
- allowed conversation topics,
- trigger conditions,
- item reactions.

Example:

- Oggaf and Zamzam
  - attitude: polite but suspicious
  - desire: proper etiquette, clear guest identity
  - weakness: confusion, flattery, orders that sound official
  - trigger: trespassing in forbidden areas

### Convert random encounters into event text

Examples:

- The astral peafowl become a dangerous grounds event.
- The feast becomes a timed set piece with escalating social pressure.
- The cursed coins become a trap revealed through inspection and greed.

### Turn escape routes into major puzzle threads

The module already has this structure. Lean into it.

Main escape routes to preserve:

- Teleportation circle.
- Folded hallway / tunnel route.
- Cesspit / bathroom route.
- Killing or bypassing Oshregaal.

## Recommended First Playable Scope

Do not try to implement the entire PDF at once.

Start with a 10-room adaptation that captures its identity.

Recommended first slice:

1. Cavern
2. Fern Garden
3. Stairs
4. Foyer
5. Sitting Room
6. Guest Room
7. Feast Hall
8. Kelago's Room
9. Kitchen
10. Secret Circle

That slice supports:

- arrival,
- invitation logic,
- social tension,
- one major NPC scene,
- one grotesque side room,
- one objective,
- one escape route.

## Suggested Player Verbs

This adaptation wants stronger verbs than a simple house mystery.

Core verbs to support early:

- `look`
- `examine`
- `take`
- `drop`
- `open`
- `close`
- `give`
- `ask`
- `tell`
- `drink`
- `eat`
- `wear`
- `remove`
- `unlock`
- `listen`
- `smell`
- `sit`
- `shake`

Important topic-driven interactions:

- `ask oshregaal about nathema`
- `ask imp about escape`
- `tell ogres your names`
- `give invitation to oggaf`
- `shake hand`
- `sit on lap`

## Best NPC Set For Version 1

Use a small cast with strong personalities.

- Grandfather Oshregaal
- Pazuzu the imp
- Oggaf and Zamzam the ogre butlers
- Lady Kelago
- Wrongus the cook
- The captive scribe

Lady Nathema should be optional in the first build unless the mission specifically needs her.

## Mission Design Recommendation

For a text adventure, give the player one explicit mission at the start and one or two implicit opportunities they can discover.

Best starting setup:

- Explicit mission: rescue the scribe.
- Hidden optional mission: steal the Grey Grin Blade.
- Hidden optional mission: escape with evidence of black wind elixir production.

This gives structure without overloading the player.

## Strong Puzzle and Social Set Pieces

These scenes should become centerpiece interactions.

### The Door Handshake

One door only opens when its metal hand is shaken. This is excellent parser material and should stay exactly as a memorable verb puzzle.

### The Feast

The feast should be a long interactive scene rather than a cutscene.

Possible player actions during the feast:

- flatter Oshregaal,
- insult him carefully,
- refuse wine,
- accept wine,
- talk privately to the imp,
- observe Lady Nathema,
- plant something in the kitchen chain,
- give blood or refuse.

### The Blood Homunculus Meal

This is grotesque and memorable. It is probably the most iconic set piece in the module. It should stay.

### Kelago's Furniture Workshop

This is another excellent scene because it is both horrifying and conversational. The player should be able to observe, question, flatter, distract, or steal here.

### The Teleportation Circle

This is a clean parser objective because it requires understanding a place, a tool, and timing.

## Content Risks

These are the places where adaptation discipline matters.

- Do not turn the game into a combat transcription of the module.
- Do not try to preserve every monster and every mechanical subsystem from tabletop play.
- Do not overload the first version with too many simultaneous assassination and kidnapping objectives.
- Do not lose the comedy. Oshregaal is grotesque, but he is also absurd, theatrical, and funny.

## Recommended New Project Direction

The game should pivot from the previous house-mystery concept to an Oshregaal-based game package.

Recommended game title options:

- The Meal of Oshregaal
- Dinner With Grandfather
- Beneath the Rococo Cavern
- Invitation to Chaos

The cleanest option is `The Meal of Oshregaal`, since it keeps the feast at the center.

## Immediate Next Content Step

The next useful move is to create a parser-friendly content package for the first 10-room slice with:

- room definitions,
- exits,
- items and scenery,
- NPC interaction topics,
- one explicit mission,
- one escape route,
- a small set of state flags.

That will give Phase 2 parser work concrete targets such as `give invitation`, `ask about`, `shake hand`, and `drink wine` instead of generic parser expansion.