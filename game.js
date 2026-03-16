import TextGrid from './js/engine/render/textGrid.js';
import { animateScrambledText } from './js/engine/render/textEffects.js';
import { GameSession } from './js/engine/world/gameSession.js';
import { createGameManifest } from './js/game/manifest.js';

const textGrid = new TextGrid();
const gameSession = new GameSession(createGameManifest());
globalThis.game = gameSession;

const transcriptLines = [];
const commandHistory = [];
let historyIndex = -1;
let cursorVisible = true;
let stopEphemeralAnimation = null;
const inputElement = document.getElementById('cli-input');
const ephemeralMessageElement = document.getElementById('ephemeral-message');
const textGridContainerElement = document.getElementById('text-grid-container');

function focusCommandInput() {
    if (document.activeElement !== inputElement) {
        inputElement.focus({ preventScroll: true });
    }
}

function isPrintableKey(event) {
    return event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;
}

function positionEphemeralMessage() {
    if (!ephemeralMessageElement || !textGridContainerElement) {
        return;
    }

    const gap = 16;
    const viewportPadding = 12;
    const displayRect = textGridContainerElement.getBoundingClientRect();
    const messageRect = ephemeralMessageElement.getBoundingClientRect();

    let left = displayRect.right + gap;
    if (left + messageRect.width > globalThis.innerWidth - viewportPadding) {
        left = displayRect.left - messageRect.width - gap;
    }

    left = Math.max(viewportPadding, left);

    let top = displayRect.top + gap;
    if (top + messageRect.height > globalThis.innerHeight - viewportPadding) {
        top = Math.max(viewportPadding, displayRect.bottom - messageRect.height);
    }

    ephemeralMessageElement.style.left = `${Math.round(left)}px`;
    ephemeralMessageElement.style.top = `${Math.round(top)}px`;
}

function updateEphemeralMessage(message, options = {}) {
    if (!ephemeralMessageElement) {
        return;
    }

    if (stopEphemeralAnimation) {
        stopEphemeralAnimation();
        stopEphemeralAnimation = null;
    }

    if (options.scramble === false) {
        ephemeralMessageElement.textContent = message;
        positionEphemeralMessage();
        return;
    }

    stopEphemeralAnimation = animateScrambledText(ephemeralMessageElement, message, {
        frameRate: options.frameRate ?? 60,
        holdDuration: options.holdDuration,
        clearFrameLength: options.clearFrameLength,
        revealChance: options.revealChance,
        clearFraction: options.clearFraction,
    });

    globalThis.requestAnimationFrame(positionEphemeralMessage);
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
    renderScreen();
}

globalThis.onload = function() {
    textGrid.createOrUpdateGrid();
    const startupMetaMessage = gameSession.getStartupMetaMessage();
    if (startupMetaMessage?.text) {
        updateEphemeralMessage(startupMetaMessage.text, startupMetaMessage.options ?? {});
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

globalThis.addEventListener('resize', positionEphemeralMessage);
globalThis.addEventListener('focus', renderScreen);
globalThis.addEventListener('blur', renderScreen);


