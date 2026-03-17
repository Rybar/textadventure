# Items And Relics

This file lists the items, treasures, clues, and cursed objects that matter most in the adaptation.

## Design Principle

In this game, items should usually do at least one of the following:

- unlock traversal;
- reveal lore through use or inspection;
- signal social identity or status;
- tempt the player into danger;
- support an alternate escape or mission branch.

## Core Story Items

### Invitation

- The cleanest front-door key in the setting.
- Establishes the player's cover identity.
- Should support `read`, `give`, and maybe later `forge` or `alter` if that system appears.

### Red Cloak And Guest Garb

- Signals belonging, theatricality, and disguise potential.
- Good for surface-level status checks and self-presentation flavor.

### Plum's Memory Folder

- One of the best non-magical clue items in the module.
- Should provide:
  - anti-command insight;
  - escape planning fragments;
  - evidence of Oshregaal's memory tampering;
  - emotional context for Plum.

### Wax Plug

- Extremely important adaptation item because it turns Oshregaal's command ability into a readable and answerable mechanic.
- Should function as both clue and tool.

### Forged Signet Rings

- Useful for deception, disguise, or persuasion variants.
- Strong parser item because their value is contextual, not only monetary.

## Objective And Treasure Items

### Grey Grin Blade

- High-value optional objective.
- Should feel dangerous to possess even before its full curse is explicit.
- Best use in adaptation:
  - theft target;
  - possible anti-Oshregaal weapon;
  - long-tail corruption item for later campaigns or NG+ style loops.

### Black Wind Fruit

- Political commodity and body-horror symbol.
- It should be clear that this is not merely loot; it is portable corruption and leverage.

### Black Wind Elixir

- Source of mutation and power.
- Strong story item for factions, bargaining, sabotage, and endings.
- Should never feel safe just because it is useful.

### Black Wind Ledger

- Documentary proof that Oshregaal's black-wind trade is current, organized, and politically distributed.
- Strong evidence item because it transforms the branch from rumor into leverage.
- Should support `read` and portable theft even if later branches decide whether it is traded, exposed, or merely used as insurance.

### Black Wind Root Sample

- Physical proof taken from the source chamber itself rather than from the trade layer above it.
- Useful because it proves the orchard is active under the house right now, not merely inherited or historical.
- Best use in adaptation:
  - source-proof item for bargaining;
  - clue that the stockroom is only the commercial face of a deeper system;
  - future ingredient for sabotage, poisoning, or ritual counterplay.

### Crystal Sword

- Plum's escape-grade weapon.
- Its fragility makes it narratively strong: a real tool, not a permanent combat solution.

## Ritual And Escape Items

### Scroll Of Activate Portal

- Core hidden-exit item.
- Should remain understandable once found: the player must know it matters, even if they do not know where to use it yet.

### Meditative Incense

- Subtle but useful utility item because it calms wind.
- Strong bridge item between bedroom flavor and black wind tree solution space.

### Peafowl Egg

- Rare occult ingredient.
- Can serve as a sellable treasure, an upgrade reagent, or a clue that astral phenomena are systemically useful.

## Feast And Body Horror Items

### Blood Cup

- A ritual container more than a treasure.
- Acceptance or refusal should change social state.
- The player should understand that giving blood is intimate, not procedural.

### Blood Homunculus

- Signature Oshregaal grotesquerie.
- In adaptation this should serve three jobs:
  - horror payoff for the feast;
  - proof that Oshregaal can literalize ownership;
  - mechanical temptation because consuming it can heal or restore.

### Candy Oozes

- Excellent flavor-horror objects.
- Better as room drama and inspection payoff than as core inventory items.

## Cursed Wealth And Trap Objects

### Cursed Coin Chest

- Classic greed trap, but also a strong symbol of chaos feeding on value.
- In parser form, the paper wrapping and warnings should allow discovery before punishment.

### Holocaust Candle

- Purely important as a set-piece hazard and sign of accumulated atrocity.
- Better as environmental threat than inventory candidate.

### Ruby Eyes In The Idol

- Tempting treasure with escalating cost.
- Good model for optional greed-driven danger.

## Books, Notes, And Knowledge Objects

### Oshregaal's Notes

- Good bridge between philosophy and practical danger.
- Should support partial comprehension even before full lore systems exist.

### Chaos Theory Book And Spellbooks

- Important for tone, clue density, and future magical systems.
- In the single-player parser adaptation, many such texts should reveal usable information before they reveal full spell functionality.

### Living Or Cursed Books

- Useful reminder that the mansion's library is active, not archival.

## Potions Worth Preserving

### Potion Of Hole

- Strong parser item because its use is specific, memorable, and spatial.

### Potion Of Ooze Form

- Supports creative traversal.

### Potion Of Mutation

- Pure temptation item. Useful for desperation or alternate solutions.

### Shark Polymorph Vials

- Weird, optional, memorable.
- Keep if they enable one strong later payoff, not just novelty.

## Item Behavior Categories For Implementation

When implementing items, classify them early.

### Identity items

- Invitation.
- Cloaks.
- Signet rings.

### Clue items

- Memory folder.
- Notes.
- Letters.
- Keys.

### Ritual items

- Blood cup.
- Scroll of Activate Portal.
- Incense.

### Corrupting power items

- Black wind fruit.
- Black wind elixir.
- Grey Grin Blade.
- Mutation potions.

### Hazard items

- Cursed coins.
- trapped relics.
- unstable occult books.

## Practical Item Rules

- A clue item should usually have `look` and `read` value even if it is not otherwise usable.
- A ritual item should usually unlock through recognition, not random verb spam.
- A cursed item should telegraph enough to be interesting.
- Monetary treasure should usually also tell a story about its owner or location.
