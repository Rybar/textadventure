import TextGrid from './js/engine/render/textGrid.js';
import { animateScrambledText } from './js/engine/render/textEffects.js';
import { GameSession } from './js/engine/world/gameSession.js';
import { createGameManifest } from './js/game/manifest.js';

const textGrid = new TextGrid();
const gameSession = new GameSession(createGameManifest);
globalThis.game = gameSession;

const transcriptLines = [];
const commandHistory = [];
let historyIndex = -1;
let cursorVisible = true;
const inputElement = document.getElementById('cli-input');
const ephemeralMessageElements = {
    sideLeft: document.getElementById('ephemeral-message-left'),
    sideRight: document.getElementById('ephemeral-message-right'),
    lowerLeft: document.getElementById('ephemeral-message-lower-left'),
    lowerRight: document.getElementById('ephemeral-message-lower-right'),
};
const stopEphemeralAnimations = new Map();
const scheduledEphemeralTimeouts = new Map();
const metaColumns = {
    sideLeft: document.getElementById('meta-column-left'),
    sideRight: document.getElementById('meta-column-right'),
    lowerLeft: document.getElementById('meta-column-left'),
    lowerRight: document.getElementById('meta-column-right'),
};

function focusCommandInput() {
    if (document.activeElement !== inputElement) {
        inputElement.focus({ preventScroll: true });
    }
}

function isPrintableKey(event) {
    return event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;
}

function positionEphemeralMessage(element, options = {}) {
    if (!element) {
        return;
    }

    const topPercent = options.topPercent ?? 6;
    element.style.top = `${topPercent}%`;
}

function clearEphemeralSlot(elementKey) {
    const existingTimeout = scheduledEphemeralTimeouts.get(elementKey);
    if (existingTimeout) {
        globalThis.clearTimeout(existingTimeout);
        scheduledEphemeralTimeouts.delete(elementKey);
    }

    const existingStop = stopEphemeralAnimations.get(elementKey);
    if (existingStop) {
        existingStop();
        stopEphemeralAnimations.delete(elementKey);
    }
}

function renderEphemeralMessage(elementKey, message, options = {}) {
    const element = ephemeralMessageElements[elementKey];
    const column = metaColumns[elementKey];
    if (!element || !column) {
        return;
    }
    const isLower = elementKey === 'lowerLeft' || elementKey === 'lowerRight';
    const topPercent = options.topPercent ?? (isLower ? 60 + (Math.random() * 18) : 6);
    const columnWidth = column.getBoundingClientRect().width;
    const inset = Math.max(0, Math.floor(columnWidth * 0.03));

    element.style.left = `${inset}px`;
    element.style.right = `${inset}px`;
    element.style.maxWidth = `${Math.max(120, Math.floor(columnWidth - (inset * 2)))}px`;
    element.style.textAlign = 'left';

    if (options.scramble === false) {
        element.textContent = message;
        positionEphemeralMessage(element, { topPercent });
        return;
    }

    const stopAnimation = animateScrambledText(element, message, {
        frameRate: options.frameRate ?? 60,
        holdDuration: options.holdDuration,
        clearFrameLength: options.clearFrameLength,
        revealChance: options.revealChance,
        clearFraction: options.clearFraction,
    });
    stopEphemeralAnimations.set(elementKey, stopAnimation);

    globalThis.requestAnimationFrame(() => {
        positionEphemeralMessage(element, { topPercent });
    });
}

function updateEphemeralMessage(elementKey, message, options = {}) {
    clearEphemeralSlot(elementKey);

    const delayMs = options.delayMs ?? 0;
    if (delayMs > 0) {
        const timeoutId = globalThis.setTimeout(() => {
            scheduledEphemeralTimeouts.delete(elementKey);
            renderEphemeralMessage(elementKey, message, options);
        }, delayMs);
        scheduledEphemeralTimeouts.set(elementKey, timeoutId);
        return;
    }

    renderEphemeralMessage(elementKey, message, options);
}

function updateMetaMessages(messages = []) {
    messages.forEach(message => {
        if (!message?.text) {
            return;
        }

        if (message.placement === 'side-left') {
            updateEphemeralMessage('sideLeft', message.text, {
                ...(message.options ?? {}),
                placement: 'side-left',
                delayMs: message.delayMs ?? 0,
            });
            return;
        }

        if (message.placement === 'side-right') {
            updateEphemeralMessage('sideRight', message.text, {
                ...(message.options ?? {}),
                placement: 'side-right',
                delayMs: message.delayMs ?? 0,
            });
            return;
        }

        const lowerKey = Math.random() < 0.5 ? 'lowerLeft' : 'lowerRight';
        clearEphemeralSlot('lowerLeft');
        clearEphemeralSlot('lowerRight');
        updateEphemeralMessage(lowerKey, message.text, {
            ...(message.options ?? {}),
            placement: message.placement ?? 'lower-random',
            delayMs: message.delayMs ?? 0,
        });
    });
}

function renderScreen() {
    textGrid.renderFrame({
        transcriptLines,
        promptText: inputElement.value,
        cursorVisible: document.activeElement === inputElement && cursorVisible,
    });
}

function appendTranscriptEntry(text) {
    transcriptLines.push(...textGrid.wrapText(text));
}

inputElement.addEventListener('input', () => {
    renderScreen();
});

function handleInputKeyDown(event, input = inputElement) {
    switch (event.key) {
        case 'Enter': {
            event.preventDefault();
            const command = input.value.trim();

            if (command) {
                commandHistory.push(command);
            }

            historyIndex = commandHistory.length;
            handleCommand(command);
            input.value = '';
            renderScreen();
            break;
        }
        case 'ArrowUp':
            event.preventDefault();
            if (historyIndex > 0) {
                historyIndex -= 1;
                input.value = commandHistory[historyIndex];
                renderScreen();
            }
            break;
        case 'ArrowDown':
            event.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                historyIndex += 1;
                input.value = commandHistory[historyIndex];
            } else {
                historyIndex = commandHistory.length;
                input.value = '';
            }
            renderScreen();
            break;
        default:
            break;
    }
}

inputElement.addEventListener('keydown', function(event) {
    handleInputKeyDown(event, this);
});

document.addEventListener('keydown', event => {
    if (document.activeElement === inputElement) {
        return;
    }

    if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'Enter') {
        focusCommandInput();
        handleInputKeyDown(event, inputElement);
        return;
    }

    if (event.key === 'Backspace') {
        event.preventDefault();
        focusCommandInput();
        inputElement.value = inputElement.value.slice(0, -1);
        renderScreen();
        return;
    }

    if (isPrintableKey(event)) {
        event.preventDefault();
        focusCommandInput();
        inputElement.value += event.key;
        renderScreen();
    }
});

function handleCommand(command) {
    const transcriptEntry = gameSession.submitCommand(command);
    appendTranscriptEntry(transcriptEntry);
    updateMetaMessages(gameSession.consumePendingMetaMessages());
    renderScreen();
}

globalThis.onload = function() {
    textGrid.createOrUpdateGrid();
    const startupMetaMessage = gameSession.getStartupMetaMessage();
    if (startupMetaMessage?.text) {
        updateMetaMessages([startupMetaMessage]);
    }

    appendTranscriptEntry(gameSession.start());
    renderScreen();
    focusCommandInput();
};

globalThis.setInterval(() => {
    cursorVisible = !cursorVisible;
    renderScreen();
}, 530);

globalThis.addEventListener('pointerdown', () => {
    focusCommandInput();
    renderScreen();
});

globalThis.addEventListener('focus', renderScreen);
globalThis.addEventListener('blur', renderScreen);


