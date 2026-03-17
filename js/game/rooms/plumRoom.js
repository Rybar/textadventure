import { createTopicResponder } from '../../engine/authoring/conversation.js';
import { Room } from '../../engine/models/room.js';
import { createPlumMemoryFolder } from '../items/plumMemoryFolder.js';

export function createPlumRoom() {
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
        reply: 'Plum touches the folder on her desk. "He edits what he dislikes. I write to the next version of myself in hopes that one of us accumulates enough continuity to become a person again."',
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
At the desk sits Plum, pale and alert, with the posture of someone who has learned to preserve herself by writing faster than others can revise her. South lies Oshregaal's private chamber.
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
      search({ command, getFlag }) {
        const target = command.directObject;

        if (!target || target.includes('room') || target.includes('desk') || target.includes('notes')) {
          return getFlag('plumMemoryRead')
            ? 'The desk remains packed with copies, reminders, and self-addressed instructions. Once you know what the folder contains, every page in the room starts to feel like a backup life.'
            : 'The desk is arranged for continuity under siege: sorted notes, sharpened pens, dates corrected by hand, and a memory folder kept close enough to be grabbed in panic.';
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
        text: 'The open memory folder gives the whole room the air of a life repeatedly reassembled from fragments.',
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
            return 'Plum stands ready, pale and taut with purpose. She has the look of someone forcing herself not to waste the narrow interval between decision and panic.';
          }

          return 'Plum is young, exhausted, and sharply attentive. Her expression keeps changing as though bracing for corrections that have not happened yet.';
        },
        actions: {
          ask: plumAsk,
          tell: plumTell,
          give({ item }) {
            if (item.id === 'wax-plug') {
              return 'Plum closes your fingers back around the wax plug. "Keep it," she says. "If one of us gets ordered into stupidity, it should not be the one still moving through the house."';
            }

            return `Plum looks at the ${item.name} carefully, then shakes her head. "Not yet," she says. "Useful things should stay with the person still walking around."`;
          },
        },
      },
      desk: 'The desk is a barricade made of paper, discipline, and repeated self-repair.',
      shelves: 'The shelves hold copied stories, name lists, and practical notes written as if memory were a resource stored outside the body.',
      lamp: 'The lamp is trimmed low, bright enough for copying and dim enough not to count as comfort.',
      door: 'The eastern door opens into Oshregaal\'s library, where he keeps the more literate parts of his vanity.',
    },
  });
}

export default createPlumRoom;