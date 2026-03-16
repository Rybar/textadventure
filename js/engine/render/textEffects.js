const RANDOM_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function randomChar() {
  return RANDOM_CHARS.charAt(Math.floor(Math.random() * RANDOM_CHARS.length));
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

function clearScrambledText(element, text, frameLength, clearFraction = 0.05) {
  const targetText = String(text);
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
      return;
    }

    const charactersToClear = Math.max(1, Math.ceil(remainingIndexes.length * clearFraction));
    chooseIndexesToClear(remainingIndexes, charactersToClear).forEach(index => {
      clearedMask[index] = true;
    });

    element.textContent = scrambleText(buildVisibleBase(targetText, clearedMask));
  }, frameLength);

  return intervalId;
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
  const frameLength = Math.max(16, Math.round(1000 / frameRate));
  const targetText = String(text);
  let currentText = scrambleText(targetText, '', revealChance);
  let revealIntervalId = null;
  let clearIntervalId = null;
  let holdTimeoutId = null;

  element.textContent = '';

  revealIntervalId = globalThis.setInterval(() => {
    currentText = scrambleText(currentText, targetText, revealChance);
    element.textContent = currentText;

    if (currentText === targetText) {
      globalThis.clearInterval(revealIntervalId);
      revealIntervalId = null;
      holdTimeoutId = globalThis.setTimeout(() => {
        clearIntervalId = clearScrambledText(element, targetText, clearFrameLength, clearFraction);
      }, holdDuration);
    }
  }, frameLength);

  return () => {
    if (revealIntervalId) {
      globalThis.clearInterval(revealIntervalId);
    }

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