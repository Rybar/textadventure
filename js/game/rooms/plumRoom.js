import { createTopicResponder } from '../../engine/authoring/conversation.js';
import { Room } from '../../engine/models/room.js';
import { createPlumMemoryFolder } from '../items/plumMemoryFolder.js';

export function createPlumRoom() {
  const revealPlumBlade = ({ getFlag, setFlag }) => {
    if (!getFlag('plumBladeKnown')) {
      setFlag('plumBladeKnown', true);
    }

    if (getFlag('plumBladeRevealed')) {
      return 'The narrow seam in Plum\'s forearm is already open, leaving the concealed crystal blade visible in its fitted recess.';
    }

    setFlag('plumBladeRevealed', true);
    return 'You work a fingernail into the nearly invisible seam along Plum\'s left forearm. It clicks open with mechanical neatness, revealing a slender crystal blade nested inside her arm like an emergency memory she could no longer afford to forget.';
  };

  const getPlumEscapeReply = getFlag => {
    if (getFlag('plumTunnelRouteReady')) {
      return 'Plum goes very still, then exhales like someone returning from far away. "Then the tunnel may actually take us both," she says. "Ugly is fine. Narrow is fine. Real is what matters. If you are ready, so am I."';
    }

    if (getFlag('escapeRouteUnlocked')) {
      return 'Plum straightens despite herself. "Then there may actually be a road," she says. "If the circle is live, we still need timing, quiet, and enough nerve to leave before the house decides the story should improve."';
    }

    return 'Plum lowers her voice. "There are routes," she says, "but none of them are simple. The circle behind the curtains is real. The folded hall beyond the library is realer. Both are worse than they sound, which is why they may work."';
  };

  const getPlumHelpReply = getFlag => {
    if (getFlag('plumFollowing')) {
      return 'Plum is already on her feet and visibly done with planning. "Move," she says softly. "I can be brave at this speed. Faster, ideally."';
    }

    if (getFlag('plumTunnelRouteReady')) {
      return 'Plum rises halfway from her chair, ready in spite of herself. "Then we stop planning and start leaving," she says. "Say when, and I will trust your route more than his house."';
    }

    if (getFlag('plumEscapePlanned')) {
      return 'Plum gives you a tense, grateful look. "Then do not die before you come back," she says. "I would hate to organize hope twice."';
    }

    return 'Plum studies you as though hope were an expensive lie. "If you mean it," she says, "bring me a route and one moment when he is looking at himself instead of us."';
  };

  const plumAsk = createTopicResponder({
    rules: [
      {
        match: ['name', 'who are you'],
        reply: '"Plum," she says. "Usually. If I seem uncertain, it is because certainty here requires maintenance."',
      },
      {
        match: ['oshregaal', 'grandfather'],
        reply: 'Plum glances toward the south door before answering. "He likes company, correction, and ownership in that order," she says. "The trouble is that he treats all three as adjacent arts."',
      },
      {
        match: ['memory', 'folder', 'notes'],
        reply: 'Plum touches the folder on her desk. "He edits what he dislikes. I write to the next version of myself in hopes that one of us accumulates enough continuity to become a person again. Lately the notes have also been arguing with whatever I was before this house acquired me."',
      },
      {
        match: ['numerian', 'android', 'construct', 'machine'],
        effect: ({ setFlag }) => {
          setFlag('plumNatureUnderstood', true);
        },
        reply: 'Plum watches your face carefully before answering. "Numerian, I think," she says. "Construct, certainly. He prefers the word scribe because it sounds less like theft. Some days I remember Silvermount as a place. Some days only as a failure in the dark that still feels older than this house."',
      },
      {
        match: ['silvermount', 'origin', 'before'],
        effect: ({ setFlag }) => {
          setFlag('plumNatureUnderstood', true);
        },
        reply: 'Plum closes her eyes for one hard breath. "Silvermount," she says. "That word survives more wipes than my own certainty. I do not know whether I served there, came from there, or was rebuilt from something found there. I only know the name feels truer than anything Oshregaal tells me about myself."',
      },
      {
        match: ['wax', 'plug', 'ear'],
        reply: 'Plum nods sharply. "Keep it. When he speaks in the voice he uses for obedience, wax in one ear makes disobedience feel thinkable again."',
      },
      {
        match: ['escape', 'leave', 'outside'],
        reply: ({ getFlag }) => getPlumEscapeReply(getFlag),
      },
      {
        match: ['library', 'folded hall', 'hallway', 'idol'],
        reply: 'Plum presses two fingers to her temple as if lining notes up behind her eyes. "Beyond the library is a corridor that refuses to stay one corridor. There is a black idol that wants two living palms. I never had enough hands, only versions of them in diagrams."',
      },
      {
        match: ['grey grin', 'blade', 'weapon', 'sword'],
        reply: ({ getFlag }) => getFlag('greyGrinShownToPlum')
          ? 'Plum looks at the memory of the blade more than the blade itself. "Good," she says softly. "That means theft is no longer theoretical in this house. Just do not mistake symbolic violence for an exit."'
          : 'Plum draws a slow breath. "The Grey Grin exists to make possession feel like intention," she says. "If you take it, everyone around you becomes a potential consequence."',
      },
      {
        match: ['crystal blade', 'arm blade', 'seam', 'forearm'],
        effect: ({ setFlag }) => {
          setFlag('plumBladeKnown', true);
          setFlag('plumNatureUnderstood', true);
        },
        reply: 'Plum glances at her left forearm with obvious reluctance. "Emergency provisioning," she says. "A blade folded into the armature. He either has not found it or enjoys pretending not to. I have not decided which possibility is worse."',
      },
      {
        match: ['help', 'rescue'],
        reply: ({ getFlag }) => getPlumHelpReply(getFlag),
      },
    ],
    fallback: 'Plum answers quietly, economically, and with the practiced caution of someone who has had to preserve herself in writing more often than in speech.',
  });

  const plumTell = createTopicResponder({
    rules: [
      {
        match: ['i will help', 'i will get you out', 'come with me', 'i can help'],
        effect: ({ emitEvent }) => {
          emitEvent('planPlumEscape');
        },
        reply: 'Plum goes still, then nods once. "Good," she says. "Then we are no longer only surviving separately. Read the folder. Keep the wax. If you find a stable road, come back for me before the house rewrites the evening."',
      },
      {
        match: ['follow me', 'come now', 'we leave now', 'come with me now', 'it is time'],
        effect: ({ getFlag, emitEvent }) => {
          if (getFlag('plumTunnelRouteReady') && !getFlag('plumFollowing') && !getFlag('plumRescued')) {
            emitEvent('beginPlumEscort');
          }
        },
        reply: ({ getFlag }) => {
          if (getFlag('plumRescued')) {
            return 'Plum is no longer in this room to answer. Only the disciplined remains of her temporary life are left behind.';
          }

          if (!getFlag('plumTunnelRouteReady')) {
            return 'Plum stands halfway, then makes herself sit again. "Not blind," she says. "Bring me a route first. Hope is useful only when attached to architecture."';
          }

          return 'Plum closes the folder, takes one steadying breath, and rises. "Then let us be gone before the house remembers to keep me," she says.';
        },
      },
      {
        match: ['oshregaal is awful', 'grandfather is awful'],
        reply: 'A tired laugh escapes Plum before she can stop it. "Yes," she says. "The useful part is learning which kind of awful he is from room to room."',
      },
      {
        match: ['your notes are clever', 'the folder is clever', 'you are clever'],
        reply: 'Plum looks embarrassed and pleased in the same breath. "Cleverness is what you call panic after you survive it long enough," she says.',
      },
    ],
    fallback: 'Plum receives the remark with wary concentration, as if deciding whether it belongs in the next version of her notes.',
  });

  const memoryFolder = createPlumMemoryFolder();

  return new Room({
    id: 'plumRoom',
    title: 'Plum\'s Room',
    description: `
This smaller chamber has the careful plainness of a room allowed to stay human only because its occupant is useful. A narrow bed, a desk, shelves of copied notes, and a lamp make up most of the space.
At the desk sits Plum, pale and alert, with the posture of someone who has learned to preserve herself by writing faster than others can revise her. When the lamp shifts, faint luminous tracery shows for an instant beneath the skin of one forearm. South lies Oshregaal's private chamber.
East, a door stands open into Oshregaal's library.
`.trim(),
    exits: {
      south: 'grandfatherRoom',
      east: 'library',
    },
    triggers: {
      enter: [
        {
          id: 'plumRoom:first-contact',
          once: true,
          run: ({ emitEvent }) => emitEvent('discoverPlumScribe'),
        },
      ],
    },
    verbs: {
      search({ command, getFlag, setFlag, isItemVisibleHere }) {
        const target = command.directObject;

        if (!target || target.includes('room') || target.includes('desk') || target.includes('notes')) {
          return getFlag('plumMemoryRead')
            ? isItemVisibleHere('plum-memory-folder')
              ? 'The desk remains packed with copies, reminders, and self-addressed instructions. Once you know what the folder contains, every page in the room starts to feel like a backup life.'
              : 'The desk remains packed with copies, reminders, and self-addressed instructions. Once you know what the missing folder contained, every page in the room starts to feel like a backup life.'
            : isItemVisibleHere('plum-memory-folder')
              ? 'The desk is arranged for continuity under siege: sorted notes, sharpened pens, dates corrected by hand, and a memory folder kept close enough to be grabbed in panic.'
              : 'The desk is arranged for continuity under siege: sorted notes, sharpened pens, dates corrected by hand, and a conspicuous gap where a memory folder had been kept close enough to be grabbed in panic.';
        }

        if (target.includes('plum') || target.includes('scribe') || target.includes('arm') || target.includes('forearm')) {
          setFlag('plumNatureUnderstood', true);
          setFlag('plumBladeKnown', true);
          return getFlag('plumBladeRevealed')
            ? 'Looked at closely, Plum is not merely pale but precise: faint luminous lines sit under the skin of her arm like buried circuitry, and the opened forearm seam leaves the concealed crystal blade impossible to mistake for metaphor.'
            : 'Up close, Plum\'s left forearm gives itself away. Beneath the skin, faint luminous lines gather and vanish with the lamp\'s movement, and along the inner arm runs a seam so fine it reads more like an afterthought in the body than a scar.';
        }

        if (target.includes('seam')) {
          setFlag('plumBladeKnown', true);
          return getFlag('plumBladeRevealed')
            ? 'The seam is already open, the concealed blade nested in its recess like a fact no longer deniable.'
            : 'The seam is nearly invisible until you know to look for it: a precise mechanical join concealed along Plum\'s left forearm.';
        }

        if (target.includes('blade') || target.includes('crystal')) {
          if (!getFlag('plumBladeRevealed')) {
            return 'You do not yet see any crystal blade outside rumor and the suggestion of that narrow seam.';
          }

          return getFlag('plumSilvermountHintSeen')
            ? 'Turned through the strengthened lamplight, the crystal blade shows an etched alignment of lines and angles that Plum insists belongs to Silvermount. Whatever she is, the weapon was built as part of the same story.'
            : 'The crystal blade is narrow, clear, and unnervingly exact. In ordinary light it looks almost blank, as though waiting for the right angle to confess its markings.';
        }

        if (target.includes('bed') || target.includes('shelf') || target.includes('lamp')) {
          return 'Everything in Plum\'s room has been selected for function over comfort. Even the neatness looks defensive.';
        }

        return `You search the ${target} and find evidence of discipline, damage, and a woman trying to remain legible to herself.`;
      },
    },
    items: [memoryFolder],
    conditionalDescriptions: [
      {
        when: ({ getFlag }) => getFlag('plumEscapePlanned'),
        text: 'The room feels fractionally less defeated now that the possibility of return has been spoken aloud.',
      },
      {
        when: ({ getFlag }) => getFlag('plumFollowing'),
        text: 'Plum is no longer sitting. The room has acquired the strained hush of a decision already in motion.',
      },
      {
        when: ({ getFlag }) => getFlag('plumRescued'),
        text: 'Plum is gone. Her chair sits empty beside the desk, and the room feels less captive for the absence.',
      },
      {
        when: ({ getFlag }) => getFlag('plumMemoryRead'),
        text: ({ getItemLocation, getFlag, isItemVisibleHere }) => {
          if (!getFlag('plumMemoryRead')) {
            return null;
          }

          return isItemVisibleHere('plum-memory-folder')
            ? 'The open memory folder gives the whole room the air of a life repeatedly reassembled from fragments.'
            : getItemLocation('plum-memory-folder')?.type === 'inventory'
              ? 'The memory folder you took still gives the room the air of a life repeatedly reassembled from fragments.'
              : 'The room still reads like a life repeatedly reassembled from fragments, even with the memory folder no longer lying open on the desk.';
        },
      },
    ],
    objects: {
      plum: {
        name: 'Plum',
        aliases: ['scribe', 'plum'],
        description({ getFlag }) {
          if (getFlag('plumRescued')) {
            return 'Plum is no longer here. Only the memory of her careful presence remains, pressed into the room like writing on a page beneath the top sheet.';
          }

          if (getFlag('plumFollowing')) {
            return 'Plum stands ready, pale and taut with purpose. Faint luminous lines ghost beneath one forearm when she moves, and she has the look of someone forcing herself not to waste the narrow interval between decision and panic.';
          }

          return getFlag('plumBladeRevealed')
            ? 'Plum is young, exhausted, and sharply attentive. Her left forearm now stands half-open along a hidden seam, exposing the recess where the crystalline emergency blade was concealed.'
            : 'Plum is young, exhausted, and sharply attentive. Her expression keeps changing as though bracing for corrections that have not happened yet, and the lamp occasionally catches faint luminous lines beneath the skin of one forearm.';
        },
        actions: {
          ask: plumAsk,
          tell: plumTell,
          show({ item, setFlag }) {
            if (item.id === 'grey-grin-blade') {
              setFlag('greyGrinShownToPlum', true);
              return 'Plum goes very still at the sight of the Grey Grin Blade. "So it can be stolen after all," she says. "That is useful to know, though not nearly as safe as it sounds."';
            }

            return `Plum studies the ${item.name} carefully, as if checking whether it belongs to the part of the evening that can still be survived.`;
          },
          give({ item }) {
            if (item.id === 'wax-plug') {
              return 'Plum closes your fingers back around the wax plug. "Keep it," she says. "If one of us gets ordered into stupidity, it should not be the one still moving through the house."';
            }

            if (item.id === 'grey-grin-blade') {
              return 'Plum recoils from the offer by half an inch, then steadies. "No," she says. "If that blade is going to change tonight, let it change it in the hand that stole it."';
            }

            return `Plum looks at the ${item.name} carefully, then shakes her head. "Not yet," she says. "Useful things should stay with the person still walking around."`;
          },
        },
      },
      desk: 'The desk is a barricade made of paper, discipline, and repeated self-repair.',
      shelves: 'The shelves hold copied stories, name lists, and practical notes written as if memory were a resource stored outside the body.',
      lamp: {
        description({ getFlag }) {
          return getFlag('plumLampLit')
            ? 'The lamp now burns a little higher, throwing sharper light across Plum, the desk, and any lie in the room thin enough to transmit it.'
            : 'The lamp is trimmed low, bright enough for copying and dim enough not to count as comfort.';
        },
        actions: {
          use({ getFlag, setFlag }) {
            if (getFlag('plumLampLit')) {
              return 'The lamp is already turned high enough to sharpen every edge in the room.';
            }

            setFlag('plumLampLit', true);
            return 'You turn the lamp wick up. The room hardens into greater clarity, and the faint lines beneath Plum\'s skin stop looking like tricks of exhaustion.';
          },
        },
      },
      seam: {
        description({ getFlag }) {
          if (!getFlag('plumBladeKnown')) {
            return 'You do not yet see any seam in Plum worth naming.';
          }

          return getFlag('plumBladeRevealed')
            ? 'The seam in Plum\'s forearm is open now, its hidden blade housing laid bare with almost surgical tidiness.'
            : 'A nearly invisible seam runs along Plum\'s left forearm, too precise to be accidental flesh.';
        },
        actions: {
          open(context) {
            return revealPlumBlade(context);
          },
          use(context) {
            return revealPlumBlade(context);
          },
        },
      },
      blade: {
        name: 'crystal blade',
        aliases: ['crystal blade', 'blade'],
        description({ getFlag }) {
          if (!getFlag('plumBladeRevealed')) {
            return 'You do not yet see any crystal blade outside rumor and implication.';
          }

          return getFlag('plumSilvermountHintSeen')
            ? 'The crystalline blade is etched with a fine geometric trace that only appears under stronger light: a worn alignment of lines Plum associates with Silvermount.'
            : 'The crystalline blade is slim, clear, and almost invisible edge-on. In ordinary light it looks less forged than grown to specification.';
        },
        actions: {
          use({ getFlag, setFlag, indirectTarget }) {
            if (!getFlag('plumBladeRevealed')) {
              return 'You do not yet have any crystal blade to use.';
            }

            if (indirectTarget?.name === 'lamp') {
              if (!getFlag('plumLampLit')) {
                return 'The lamp is too low to pull anything useful out of the crystal. More light first.';
              }

              if (!getFlag('plumSilvermountHintSeen')) {
                setFlag('plumSilvermountHintSeen', true);
                setFlag('plumNatureUnderstood', true);
                return 'You angle the crystal blade through the strengthened lamplight. Fine internal etching blooms across it: nested lines, a broken spire shape, and a tiny notation Plum recognizes at once. "Silvermount," she says, voice gone thin. "That is not decorative. That is where someone expected this body to remember from."';
              }

              return 'The blade still throws the same hidden etching through the lamp: Silvermount reduced to geometry and memory pressure.';
            }

            return 'The crystal blade feels too precise to treat like an ordinary knife. It seems built for revelation as much as harm.';
          },
        },
      },
      door: 'The eastern door opens into Oshregaal\'s library, where he keeps the more literate parts of his vanity.',
    },
  });
}

export default createPlumRoom;