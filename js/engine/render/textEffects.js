const RANDOM_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function randomChar() {
  return RANDOM_CHARS.charAt(Math.floor(Math.random() * RANDOM_CHARS.length));
}

function createInitialScramble(target = '') {
  return String(target)
    .split('')
    .map(character => {
      if (character === '\n' || character === ' ') {
        return character;
      }

      return randomChar();
    })
    .join('');
}

function scrambleText(scrambled, target = '', revealChance = 0.06) {
  return String(scrambled)
    .split('')
    .map((character, index) => {
      if (character === '\n' || character === ' ') {
        return character;
      }

      if (target[index] === '\n' || target[index] === ' ') {
        return target[index];
      }

      return Math.random() < revealChance || target[index] === character
        ? target[index] || character
        : randomChar();
    })
    .join('');
}

function getRemainingIndexes(clearableIndexes, clearedMask) {
  return clearableIndexes.filter(index => !clearedMask[index]);
}

function getMaskedIndexes(clearableIndexes, visibleMask) {
  return clearableIndexes.filter(index => !visibleMask[index]);
}

function getClusterCandidates(sortedRemaining, seedPosition, seedIndex, limit) {
  const candidates = [seedIndex];

  for (let radius = 1; radius <= limit; radius += 1) {
    const leftNeighbor = sortedRemaining[seedPosition - radius];
    const rightNeighbor = sortedRemaining[seedPosition + radius];

    if (leftNeighbor !== undefined && seedIndex - leftNeighbor <= 3) {
      candidates.push(leftNeighbor);
    }

    if (rightNeighbor !== undefined && rightNeighbor - seedIndex <= 3) {
      candidates.push(rightNeighbor);
    }
  }

  return candidates.filter((index, position, source) => source.indexOf(index) === position);
}

function chooseIndexesToClear(remainingIndexes, charactersToClear) {
  const seedIndex = remainingIndexes[Math.floor(Math.random() * remainingIndexes.length)];
  const sortedRemaining = [...remainingIndexes].sort((left, right) => left - right);
  const seedPosition = sortedRemaining.indexOf(seedIndex);
  const clusterCandidates = getClusterCandidates(
    sortedRemaining,
    seedPosition,
    seedIndex,
    charactersToClear * 2,
  ).sort(() => Math.random() - 0.5);

  const clearedIndexes = clusterCandidates.slice(0, charactersToClear);
  if (Math.random() < 0.35) {
    const strayIndex = remainingIndexes[Math.floor(Math.random() * remainingIndexes.length)];
    if (!clearedIndexes.includes(strayIndex)) {
      clearedIndexes.push(strayIndex);
    }
  }

  if (clearedIndexes.length < charactersToClear) {
    const unusedIndexes = remainingIndexes
      .filter(index => !clearedIndexes.includes(index))
      .sort(() => Math.random() - 0.5);

    clearedIndexes.push(...unusedIndexes.slice(0, charactersToClear - clearedIndexes.length));
  }

  return clearedIndexes;
}

function buildVisibleBase(targetText, clearedMask) {
  return targetText
    .split('')
    .map((character, index) => {
      if (character === '\n' || character === ' ') {
        return character;
      }

      return clearedMask[index] ? ' ' : character;
    })
    .join('');
}

function buildRevealBase(targetText, visibleMask, activeText = '') {
  return targetText
    .split('')
    .map((character, index) => {
      if (character === '\n' || character === ' ') {
        return character;
      }

      if (visibleMask[index] && activeText[index] && activeText[index] !== ' ') {
        return activeText[index];
      }

      if (visibleMask[index]) {
        return randomChar();
      }

      return ' ';
    })
    .join('');
}

function revealScrambledText(element, text, frameLength, revealChance = 0.06) {
  const targetText = String(text);
  const revealableIndexes = targetText
    .split('')
    .map((character, index) => ({ character, index }))
    .filter(({ character }) => character !== '\n' && character !== ' ')
    .map(({ index }) => index);

  let visibleMask = targetText
    .split('')
    .map(character => character === '\n' || character === ' ');
  let activeText = buildRevealBase(targetText, visibleMask);

  const intervalId = globalThis.setInterval(() => {
    const hiddenIndexes = getMaskedIndexes(revealableIndexes, visibleMask);
    if (hiddenIndexes.length > 0) {
      const charactersToReveal = Math.max(1, Math.ceil(hiddenIndexes.length * 0.08));
      chooseIndexesToClear(hiddenIndexes, charactersToReveal).forEach(index => {
        visibleMask[index] = true;
      });
    }

    const visibleBase = buildRevealBase(targetText, visibleMask, activeText);
    activeText = scrambleText(visibleBase, targetText, revealChance);
    element.textContent = activeText;

    if (hiddenIndexes.length === 0 && activeText === targetText) {
      globalThis.clearInterval(intervalId);
    }
  }, frameLength);

  return intervalId;
}

function clearScrambledText(element, text, options = {}) {
  const targetText = String(text);
  const frameLength = options.frameLength ?? 40;
  const clearFraction = options.clearFraction ?? 0.05;
  const minCharactersPerFrame = Math.max(1, options.minCharactersPerFrame ?? 1);
  const maxCharactersPerFrame = Number.isFinite(options.maxCharactersPerFrame)
    ? Math.max(minCharactersPerFrame, options.maxCharactersPerFrame)
    : null;
  const onComplete = typeof options.onComplete === 'function' ? options.onComplete : null;
  let clearedMask = targetText
    .split('')
    .map(character => character === '\n' || character === ' ');

  const clearableIndexes = targetText
    .split('')
    .map((character, index) => ({ character, index }))
    .filter(({ character }) => character !== '\n' && character !== ' ')
    .map(({ index }) => index);

  const intervalId = globalThis.setInterval(() => {
    const remainingIndexes = getRemainingIndexes(clearableIndexes, clearedMask);
    if (remainingIndexes.length === 0) {
      globalThis.clearInterval(intervalId);
      element.textContent = '';
      if (onComplete) {
        onComplete();
      }
      return;
    }

    let charactersToClear = Math.max(
      minCharactersPerFrame,
      Math.ceil(remainingIndexes.length * clearFraction),
    );

    if (maxCharactersPerFrame !== null) {
      charactersToClear = Math.min(charactersToClear, maxCharactersPerFrame);
    }

    chooseIndexesToClear(remainingIndexes, Math.min(charactersToClear, remainingIndexes.length)).forEach(index => {
      clearedMask[index] = true;
    });

    element.textContent = scrambleText(buildVisibleBase(targetText, clearedMask));
  }, frameLength);

  return intervalId;
}

export function animateTextClear(element, text, options = {}) {
  if (!element) {
    return () => {};
  }

  const clearFrameLength = options.clearFrameLength ?? 40;
  const clearFraction = options.clearFraction ?? 0.05;
  const minCharactersPerFrame = options.minCharactersPerFrame ?? 1;
  const maxCharactersPerFrame = options.maxCharactersPerFrame;
  const onComplete = typeof options.onComplete === 'function' ? options.onComplete : null;
  const targetText = String(text ?? '');

  element.textContent = targetText;

  const intervalId = clearScrambledText(element, targetText, {
    frameLength: clearFrameLength,
    clearFraction,
    minCharactersPerFrame,
    maxCharactersPerFrame,
    onComplete,
  });

  return () => {
    globalThis.clearInterval(intervalId);
    element.textContent = '';
  };
}

export function animateScrambledText(element, text, options = {}) {
  if (!element) {
    return () => {};
  }

  const holdDuration = options.holdDuration ?? 1800;
  const frameRate = options.frameRate ?? 60;
  const clearFrameLength = options.clearFrameLength ?? 40;
  const revealChance = options.revealChance ?? 0.06;
  const clearFraction = options.clearFraction ?? 0.05;
  const onComplete = typeof options.onComplete === 'function' ? options.onComplete : null;
  const frameLength = Math.max(16, Math.round(1000 / frameRate));
  const targetText = String(text);
  let revealIntervalId = null;
  let clearIntervalId = null;
  let holdTimeoutId = null;
  let didComplete = false;

  function finishAnimation() {
    if (didComplete) {
      return;
    }

    didComplete = true;
    if (onComplete) {
      onComplete();
    }
  }

  element.textContent = buildRevealBase(targetText, targetText.split('').map(character => character === '\n' || character === ' '));

  revealIntervalId = revealScrambledText(element, targetText, frameLength, revealChance);
  const revealCompletionPollId = globalThis.setInterval(() => {
    if (element.textContent !== targetText) {
      return;
    }

    if (revealIntervalId) {
      globalThis.clearInterval(revealIntervalId);
      revealIntervalId = null;
    }

    globalThis.clearInterval(revealCompletionPollId);
    holdTimeoutId = globalThis.setTimeout(() => {
      clearIntervalId = clearScrambledText(element, targetText, {
        frameLength: clearFrameLength,
        clearFraction,
        onComplete: finishAnimation,
      });
    }, holdDuration);
  }, frameLength);

  return () => {
    if (revealIntervalId) {
      globalThis.clearInterval(revealIntervalId);
    }

    globalThis.clearInterval(revealCompletionPollId);

    if (clearIntervalId) {
      globalThis.clearInterval(clearIntervalId);
    }

    if (holdTimeoutId) {
      globalThis.clearTimeout(holdTimeoutId);
    }

    element.textContent = '';
  };
}

export default animateScrambledText;