# Story Docs

This folder is the internal content-and-implementation reference for adapting The Meal of Oshregaal into a single-player parser adventure with a hidden experiment meta-story.

These docs are written for two audiences at once:

- the human developer deciding what story to keep, cut, or restructure;
- the agent helping implement content and engine systems without losing the intended tone or mission structure.

## Canonical Priorities

When two ideas conflict, prefer them in this order:

1. Preserve the feeling of entering a grotesque house where hospitality is coercion.
2. Preserve strong parser interactions: invitation logic, conversation pressure, hidden doors, ritual actions, grotesque objects, and layered escape routes.
3. Preserve the meta-story as interference and observation, not as a replacement for the mansion fiction.
4. Reduce tabletop-combat density in favor of social danger, puzzle logic, and escalating entrapment.
5. Keep engine systems reusable and content-facing APIs narrow.

## How To Use This Folder

- Read [SOURCE_STORY.md](./SOURCE_STORY.md) for the spoiler-heavy summary of the original module and the adaptation stance.
- Read [CHARACTERS.md](./CHARACTERS.md) when writing dialogue, relationship flags, conversation topics, or NPC action handlers.
- Read [ROOMS_AND_SECRETS.md](./ROOMS_AND_SECRETS.md) when implementing map content, exit guards, secrets, or progression gates.
- Read [ITEMS_AND_RELICS.md](./ITEMS_AND_RELICS.md) when implementing inventory, clue items, consumables, cursed objects, or objective rewards.
- Read [PLOT_AND_META.md](./PLOT_AND_META.md) when writing milestones, pacing revelations, endings, or UI/meta interruptions.
- Read [META_DIALOGUE_ARC.md](./META_DIALOGUE_ARC.md) when writing Mara/Kellan exchanges, Ilex injections, or replacing the observation-layer message set.
- Read [ENGINE_CONTENT_INTERFACE.md](./ENGINE_CONTENT_INTERFACE.md) when changing engine features, parser support, flags, tests, or authoring patterns.
- Read [AUTHORING_GUIDE.md](./AUTHORING_GUIDE.md) for the current engine-facing content API and authoring reference.
- Read [AUTHORING_TUTORIAL.md](./AUTHORING_TUTORIAL.md) for a step-by-step walkthrough of adding a new room feature using items, dialogue, events, and the scheduler.

## Internal Ground Rules

- These docs are allowed to be fully spoiler-heavy.
- Source material is a reference, not a prison. Preserve identity, not every encounter.
- Every major room should support at least one observation verb, one social or puzzle affordance, and one clue that points beyond itself.
- Every important NPC should be describable as motives plus leverage, not only as flavor text.
- Every meta beat should do one of three jobs: foreshadow, reframe, or mechanically alter play.

## Current Adaptation Baseline

- The player is a single subject moving through a mansion-fiction scenario.
- The visible story is an Oshregaal dinner invitation and attempted escape.
- The hidden story is that the player is trapped inside a monitored text-adventure experiment.
- Early content should feel deniable: eerie, not explanatory.
- The first robust playable arc should still be the scribe-rescue route with at least one viable hidden exit.

## Useful Authoring Heuristics

- If a room is memorable in the PDF because of combat alone, redesign it around etiquette, inspection, deception, ritual, or traversal.
- If an object is memorable because it is bizarre, make it examinable and usually operable.
- If a secret matters, seed it at least twice before it becomes mandatory.
- If a meta message appears, it should either deepen dread or sharpen a meaningful player decision.
