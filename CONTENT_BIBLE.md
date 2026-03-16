# Content Bible

## Project Direction

The game is now based on The Meal of Oshregaal.

This project should adapt the custom Goblin Punch adventure into a parser-driven, ASCII-forward text adventure. The goal is not to reproduce tabletop combat room by room. The goal is to preserve the module's strongest qualities: invitation, hospitality, grotesque surrealism, social danger, hidden routes, and a mansion that is easier to enter than to leave.

## Core Premise

The player arrives at the cavern mansion of Grandfather Oshregaal carrying a real, stolen, or forged invitation to dinner.

Oshregaal is an aging chaos sorcerer who created the tusk people through black wind elixir and now lives in a decadent underground manor. He is dangerous, charming, theatrical, and difficult to escape. The player enters as a guest and gradually realizes they are also prey, entertainment, and potentially an inconvenience to be contained.

The game should feel like a dinner invitation drifting into a social-horror labyrinth.

## Creative Pillars

- Weird hospitality.
- Rococo grotesquerie.
- Social manipulation over direct violence.
- Dense, memorable room interactions.
- Multiple objectives and multiple escape routes.
- Strong ASCII visuals for rooms, maps, and feast set pieces.
- A retro parser interface that makes etiquette, observation, and risk feel tactile.

## Tone

- Darkly funny.
- Ornate and disgusting at the same time.
- Polite on the surface, threatening underneath.
- Surreal, but still legible enough for puzzle-solving.

Oshregaal should be funny, dangerous, vain, and exhausting. The game should not flatten him into a generic villain.

## Best Adaptation Lens

This should be a social-surreal infiltration game, not a combat crawler.

That means:

- Many threats should be avoidable.
- Conversation and observation should matter as much as inventory use.
- The player should frequently be deciding whether to comply, flatter, lie, stall, steal, or flee.
- Combat should exist, but feel like a costly escalation.

## Player Role

The player is an outsider entering Oshregaal's domain under pretense.

The exact identity can stay flexible, but a good parser-friendly setup is:

- a hired infiltrator,
- an agent with forged credentials,
- a scavenger with a stolen invitation,
- or a desperate operative sent to retrieve a person or object.

The player should begin with one explicit mission and discover additional opportunities through exploration.

## Recommended Primary Mission

For the first real game build, the primary mission should be:

- Rescue Oshregaal's captive scribe and escape alive.

This is the strongest initial objective because it:

- gives the player a humane and concrete goal,
- encourages exploration beyond the feast,
- does not require a boss fight,
- and allows optional secondary goals.

## Strong Optional Missions

- Steal the Grey Grin Blade.
- Escape with proof of black wind elixir production.
- Sabotage Oshregaal's household.
- Destroy the black wind tree.
- Betray Lady Nathema or turn her against Oshregaal.

## Main World Structure

The adapted game should unfold in layers.

### Layer 1: Approach

The outer cavern and grounds establish the mansion's scale and strangeness before the player is formally admitted.

Core spaces:

- Cavern
- Fern Garden
- Fishing Shack
- Grand Stairs

Purpose:

- establish tone,
- offer optional discoveries,
- teach that even the grounds are unsafe and unnatural.

### Layer 2: Hospitality

The front-facing mansion rooms establish Oshregaal's rules.

Core spaces:

- Foyer
- Sitting Room
- Guest Room
- Feast Hall

Purpose:

- introduce the ogre butlers,
- frame the player as a guest,
- make Oshregaal's charm and coercion visible,
- teach that leaving is socially or physically blocked.

### Layer 3: Inner Household

The back rooms expose the mechanics of the house.

Core spaces:

- Kelago's Room
- Kitchen
- Ogre Beds
- Grandfather's Room
- Secret Circle

Purpose:

- reveal the grotesque domestic life of the mansion,
- supply useful items and clues,
- introduce routes toward escape or mission completion.

### Layer 4: Inner Dungeon

These rooms shift the game from hospitality tension into deep weirdness.

Core spaces:

- Trophy Room
- Spider Room
- Library or related hidden room
- Bathroom / Pit route
- Folded Hallway route

Purpose:

- increase danger,
- support multiple solutions,
- and turn escape into a structured puzzle rather than a single door check.

## Recommended First Playable Slice

Do not implement the full PDF first.

Build this 10-room slice first:

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

This slice is enough to support:

- invitation and entry,
- hospitality pressure,
- Oshregaal as a central NPC,
- one grotesque side chamber,
- one explicit mission,
- one valid escape route.

## Expanded Room List

After the first slice, expand toward a fuller adaptation with these additional spaces:

- Ogre Beds
- Grandfather's Room
- Trophy Room
- Spider Room
- Scribe's Chamber
- Library
- Bathroom
- Pit / Cesspool
- Tunnel
- Folded Hallway
- Black Wind Tree chamber

## Essential NPCs

### Grandfather Oshregaal

The center of the game.

Traits:

- gluttonous,
- theatrical,
- rude in a strangely affectionate way,
- vain,
- intelligent,
- terrifying when crossed.

Design role:

- social gatekeeper,
- one-way pressure mechanic,
- unreliable host,
- possible endgame obstacle.

### Pazuzu the Imp

Chained servant and resentful chaperone.

Traits:

- spiteful,
- funny,
- dangerous,
- hates Oshregaal,
- lies constantly, but can still be useful.

Design role:

- source of hints,
- unstable guide,
- possible betrayer.

### Oggaf and Zamzam

Mutant ogre butlers.

Traits:

- polite,
- suspicious,
- rule-bound,
- physically dangerous.

Design role:

- enforce guest etiquette,
- gate the foyer and front spaces,
- react strongly to trespass.

### Lady Kelago

Oshregaal's sister and biomantic furniture artist.

Traits:

- cultured,
- monstrous,
- practical,
- affectionate toward Oshregaal,
- horrifyingly sincere.

Design role:

- one of the strongest side scenes,
- source of grotesque lore,
- potential ally, obstacle, or distraction.

### Wrongus

The cook.

Traits:

- focused,
- literal-minded,
- proud of his work.

Design role:

- supports the blood-homunculus feast set piece,
- offers kitchen interactions,
- can become part of sabotage or escape planning.

### The Scribe

Primary rescue target for the first full build.

Traits:

- intelligent,
- observant,
- frightened but not helpless.

Design role:

- mission anchor,
- source of late-game information,
- potential co-escape participant.

### Lady Nathema

Optional for the first slice, stronger in the expanded game.

Traits:

- militant,
- impatient,
- dangerous,
- politically significant.

Design role:

- optional faction pressure,
- alternate objective source,
- route to a more politically charged version of the story.

## Best Parser Verbs For This Game

The Oshregaal adaptation wants a wider social verb set than the current prototype.

Core verbs:

- `look`
- `examine`
- `take`
- `drop`
- `open`
- `close`
- `go`
- `inventory`
- `use`

Important interaction verbs:

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
- `hide`

Important command forms to support later:

- `give invitation to oggaf`
- `ask oshregaal about nathema`
- `tell ogres your name`
- `shake hand`
- `sit on lap`
- `drink wine`
- `eat homunculus`

## Signature Set Pieces To Preserve

### The Invitation

The player should enter as a guest, not a dungeon intruder. That changes the whole rhythm of play.

### The Feast

This should be a long interactive scene, not just a description dump.

Possible actions during the feast:

- talk to Oshregaal,
- observe the tusk guests,
- speak to the imp,
- accept or refuse food,
- refuse or offer blood,
- flatter, insult, or distract.

### The Blood Homunculus Meal

This is too memorable to cut. It should stay as one of the central horrors of the adaptation.

### Kelago's Workshop

One of the module's best rooms. It is both conversational and deeply grotesque.

### The Handshake Door

An ideal parser puzzle. Preserve it.

### The Teleportation Circle

A clean escape route and strong objective anchor.

## Escape Structure

Escaping the mansion should be a central design problem.

Main escape routes to preserve over time:

- Teleportation circle.
- Folded hallway route.
- Pit / bathroom / cesspool route.
- Killing or fully bypassing Oshregaal.

For the first slice, only the teleportation-circle route needs to be fully implemented.

## Items And Objective Objects

Important early objects:

- invitation
- guest cloak
- wine cup
- blood cup
- chef's spices
- homunculus tureen
- teleport scroll
- mutation potion
- kitchen tools
- keys or symbolic access items

Important later objects:

- Grey Grin Blade
- black wind fruit
- elixir evidence
- spider-keyed lock item
- scribe documents

## Flags And State Model

The adaptation should eventually use explicit world flags.

Suggested early flags:

- `hasInvitation`
- `foyerAdmitted`
- `metOshregaal`
- `feastStarted`
- `gaveBlood`
- `impSuspicious`
- `kelagoMet`
- `kitchenAccessGranted`
- `foundTeleportCircle`
- `hasTeleportScroll`
- `scribeLocated`
- `scribeFreed`
- `escapeRouteUnlocked`

## Interface And Presentation Opportunities

This setting works extremely well with ASCII presentation.

Good ASCII targets:

- cavern exterior and marble stairs,
- foyer chandelier,
- feast table,
- Kelago's room,
- trophy room,
- secret circle,
- mansion map panel.

Animation opportunities:

- subtle transcript distortion around chaos magic,
- exaggerated entrance text for Oshregaal,
- imp interruptions appearing in offset text,
- feast-service text arriving in waves,
- stronger scramble effects when cursed books or portal magic are used.

## Content Style Guide

- Keep descriptions vivid but compact.
- Favor one unforgettable detail per room.
- Use humor as pressure relief, not as parody.
- Make every important NPC sound distinct.
- Let manners function as a game mechanic.
- Let horror arrive through implication, not constant screaming prose.

## Definition Of Success For The First Oshregaal Build

The first real Oshregaal-based build is successful if a player can:

- enter the mansion with an invitation,
- survive an interactive dinner with Oshregaal,
- explore beyond the public rooms,
- locate the scribe or another major objective,
- unlock the teleport circle route,
- and escape with a clear sense that deeper content still exists.

## Immediate Next Content Work

The next content implementation target should be the first 10-room slice with:

- room definitions,
- exits,
- key scenery,
- NPC topic hooks,
- objective items,
- and first-pass state flags.

That will replace the old manor-mystery direction and give the parser expansion concrete Oshregaal-specific targets.
