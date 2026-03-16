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

inputElement.addEventListener('keydown', function(event) {
    switch (event.key) {
        case 'Enter': {
            event.preventDefault();
            const command = this.value.trim();

            if (command) {
                commandHistory.push(command);
            }

            historyIndex = commandHistory.length;
            handleCommand(command);
            this.value = '';
            renderScreen();
            break;
        }
        case 'ArrowUp':
            event.preventDefault();
            if (historyIndex > 0) {
                historyIndex -= 1;
                this.value = commandHistory[historyIndex];
                renderScreen();
            }
            break;
        case 'ArrowDown':
            event.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                historyIndex += 1;
                this.value = commandHistory[historyIndex];
            } else {
                historyIndex = commandHistory.length;
                this.value = '';
            }
            renderScreen();
            break;
        default:
            break;
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
    inputElement.focus();
};

globalThis.setInterval(() => {
    cursorVisible = !cursorVisible;
    renderScreen();
}, 530);

globalThis.addEventListener('pointerdown', () => {
    inputElement.focus();
    renderScreen();
});

globalThis.addEventListener('resize', positionEphemeralMessage);
globalThis.addEventListener('focus', renderScreen);
globalThis.addEventListener('blur', renderScreen);


