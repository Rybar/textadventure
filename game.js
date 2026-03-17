import TextGrid from './js/engine/render/textGrid.js';
import { animateScrambledText } from './js/engine/render/textEffects.js';
import { GameSession } from './js/engine/world/gameSession.js';
import { createGameManifest } from './js/game/manifest.js';

const textGrid = new TextGrid();
const gameSession = new GameSession(createGameManifest);
globalThis.game = gameSession;

const bodyElement = document.body;
const screenShellElement = document.getElementById('screen-shell');
const transcriptEntries = [];
const commandHistory = [];
let historyIndex = -1;
let cursorVisible = true;
let activeMobilePanelId = null;
const inputElement = document.getElementById('cli-input');
const mobileCommandBarElement = document.getElementById('mobile-command-bar');
const mobilePanelTabsElement = document.getElementById('mobile-panel-tabs');
const mobilePanelTabElements = Array.from(document.querySelectorAll('.mobile-panel-tab'));
const ephemeralMessageElements = {
    sideLeft: document.getElementById('ephemeral-message-left'),
    sideRight: document.getElementById('ephemeral-message-right'),
    lowerLeft: document.getElementById('ephemeral-message-lower-left'),
    lowerRight: document.getElementById('ephemeral-message-lower-right'),
};
const stopEphemeralAnimations = new Map();
const scheduledEphemeralTimeouts = new Map();
const statusElements = {
    gameTitle: document.getElementById('game-title'),
    currentLocation: document.getElementById('current-location'),
    turnCounter: document.getElementById('turn-counter'),
    scoreCounter: document.getElementById('score-counter'),
};
const terminalStageElement = document.getElementById('terminal-stage');
const panelStackElement = document.getElementById('panel-stack');
const panelElements = {
    map: {
        root: document.getElementById('panel-map'),
        body: document.getElementById('panel-map-body'),
    },
    inventory: {
        root: document.getElementById('panel-inventory'),
        body: document.getElementById('panel-inventory-body'),
    },
    memory: {
        root: document.getElementById('panel-memory'),
        body: document.getElementById('panel-memory-body'),
    },
};
const metaColumns = {
    sideLeft: document.getElementById('meta-column-left'),
    sideRight: document.getElementById('meta-column-right'),
    lowerLeft: document.getElementById('meta-column-left'),
    lowerRight: document.getElementById('meta-column-right'),
};
let isMobileThemeActive = false;

function shouldUseMobileTheme() {
    const hasMatchMedia = typeof globalThis.matchMedia === 'function';
    const coarsePointer = hasMatchMedia ? globalThis.matchMedia('(pointer: coarse)').matches : false;
    const narrowViewport = hasMatchMedia ? globalThis.matchMedia('(max-width: 1180px)').matches : false;
    const shortViewport = hasMatchMedia ? globalThis.matchMedia('(max-height: 900px)').matches : false;

    return coarsePointer && (narrowViewport || shortViewport);
}

function updateViewportMetrics() {
    const visualViewport = globalThis.visualViewport;
    const viewportHeight = visualViewport?.height ?? globalThis.innerHeight;
    const keyboardOffset = visualViewport
        ? Math.max(0, globalThis.innerHeight - visualViewport.height - visualViewport.offsetTop)
        : 0;

    document.documentElement.style.setProperty('--visual-viewport-height', `${Math.round(viewportHeight)}px`);
    document.documentElement.style.setProperty('--mobile-keyboard-offset', `${Math.round(keyboardOffset)}px`);
}

function applyDeviceTheme() {
    isMobileThemeActive = shouldUseMobileTheme();
    bodyElement.dataset.deviceTheme = isMobileThemeActive ? 'mobile' : 'desktop';

    if (!isMobileThemeActive) {
        bodyElement.dataset.mobileInputActive = 'false';
        document.documentElement.style.setProperty('--mobile-keyboard-offset', '0px');
    }

    updateViewportMetrics();
    textGrid.setViewportMode({ mobile: isMobileThemeActive });
}

function formatCounter(value, width = 3) {
    return String(value).padStart(width, '0');
}

function escapeHtml(text) {
    return String(text)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;');
}

function renderMapPanelMarkup(panelModel) {
    const { currentRoomBox } = panelModel;

    return panelModel.lines.map((line, rowIndex) => {
        return Array.from(line).map((character, columnIndex) => {
            if (character === ' ') {
                return ' ';
            }

            const isInCurrentRoomBox = currentRoomBox
                && rowIndex >= currentRoomBox.top
                && rowIndex < currentRoomBox.top + currentRoomBox.height
                && columnIndex >= currentRoomBox.left
                && columnIndex < currentRoomBox.left + currentRoomBox.width;
            const className = isInCurrentRoomBox ? 'map-char-current' : 'map-char-dim';
            return `<span class="${className}">${escapeHtml(character)}</span>`;
        }).join('');
    }).join('\n');
}

function renderPanel(panelModel) {
    const panelElement = panelElements[panelModel.id];
    if (!panelElement) {
        return;
    }

    panelElement.root.dataset.state = panelModel.state;
    panelElement.root.dataset.visible = panelModel.unlocked ? 'true' : 'false';
    panelElement.root.setAttribute('aria-hidden', panelModel.unlocked ? 'false' : 'true');

    if (panelModel.id === 'map' && panelModel.currentRoomBox) {
        panelElement.body.innerHTML = renderMapPanelMarkup(panelModel);
        return;
    }

    panelElement.body.textContent = panelModel.lines.join('\n');
}

function syncMobilePanelTabs(panels) {
    const unlockedPanels = panels.filter(panel => panel.unlocked);
    const unlockedIds = new Set(unlockedPanels.map(panel => panel.id));

    if (!unlockedIds.has(activeMobilePanelId)) {
        activeMobilePanelId = null;
    }

    mobilePanelTabsElement.setAttribute('aria-hidden', unlockedPanels.length > 0 ? 'false' : 'true');
    mobilePanelTabsElement.dataset.visible = unlockedPanels.length > 0 ? 'true' : 'false';

    mobilePanelTabElements.forEach(button => {
        const panelId = button.dataset.panelId;
        const isUnlocked = unlockedIds.has(panelId);
        button.hidden = !isUnlocked;
        button.dataset.active = activeMobilePanelId === panelId ? 'true' : 'false';
        button.setAttribute('aria-pressed', activeMobilePanelId === panelId ? 'true' : 'false');
    });
}

function renderInterfaceChrome() {
    const interfaceModel = gameSession.getInterfaceModel();
    const unlockedPanels = interfaceModel.panels.filter(panel => panel.unlocked);

    terminalStageElement.dataset.layout = !isMobileThemeActive && unlockedPanels.length > 0 ? 'with-panels' : 'transcript-only';
    terminalStageElement.dataset.mobilePanelOpen = isMobileThemeActive && activeMobilePanelId ? 'true' : 'false';
    panelStackElement.setAttribute('aria-hidden', unlockedPanels.length > 0 ? 'false' : 'true');

    statusElements.gameTitle.textContent = interfaceModel.title;
    statusElements.currentLocation.textContent = interfaceModel.location;
    statusElements.turnCounter.textContent = `TURNS ${formatCounter(interfaceModel.turns)}`;
    statusElements.scoreCounter.textContent = interfaceModel.score == null
        ? 'SCORE ---'
        : `SCORE ${formatCounter(interfaceModel.score)}`;

    syncMobilePanelTabs(interfaceModel.panels);

    interfaceModel.panels.forEach(panel => {
        renderPanel({
            ...panel,
            unlocked: isMobileThemeActive
                ? panel.unlocked && panel.id === activeMobilePanelId
                : panel.unlocked,
        });
    });
}

function focusCommandInput() {
    if (isMobileThemeActive && !mobileCommandBarElement) {
        return;
    }

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

        const messageOptions = message.options;

        if (message.placement === 'side-left') {
            updateEphemeralMessage('sideLeft', message.text, {
                ...messageOptions,
                placement: 'side-left',
                delayMs: message.delayMs ?? 0,
            });
            return;
        }

        if (message.placement === 'side-right') {
            updateEphemeralMessage('sideRight', message.text, {
                ...messageOptions,
                placement: 'side-right',
                delayMs: message.delayMs ?? 0,
            });
            return;
        }

        const lowerKey = Math.random() < 0.5 ? 'lowerLeft' : 'lowerRight';
        clearEphemeralSlot('lowerLeft');
        clearEphemeralSlot('lowerRight');
        updateEphemeralMessage(lowerKey, message.text, {
            ...messageOptions,
            placement: message.placement ?? 'lower-random',
            delayMs: message.delayMs ?? 0,
        });
    });
}

function renderScreen() {
    textGrid.setViewportMode({ mobile: isMobileThemeActive });
    renderInterfaceChrome();
    const transcriptLines = transcriptEntries.flatMap(entry => textGrid.wrapText(entry));
    textGrid.renderFrame({
        transcriptLines,
        promptText: isMobileThemeActive ? '' : inputElement.value,
        cursorVisible: document.activeElement === inputElement && cursorVisible,
        promptVisible: !isMobileThemeActive,
    });
}

function appendTranscriptEntry(text) {
    transcriptEntries.push(String(text));
}

inputElement.addEventListener('input', () => {
    renderScreen();
});

inputElement.addEventListener('focus', () => {
    if (isMobileThemeActive) {
        bodyElement.dataset.mobileInputActive = 'true';
        updateViewportMetrics();
    }

    renderScreen();
});

inputElement.addEventListener('blur', () => {
    bodyElement.dataset.mobileInputActive = 'false';

    if (isMobileThemeActive) {
        globalThis.setTimeout(updateViewportMetrics, 80);
    }

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

mobileCommandBarElement.addEventListener('submit', event => {
    event.preventDefault();
    const command = inputElement.value.trim();

    if (command) {
        commandHistory.push(command);
    }

    historyIndex = commandHistory.length;
    handleCommand(command);
    inputElement.value = '';
    renderScreen();
    focusCommandInput();
});

mobilePanelTabElements.forEach(button => {
    button.addEventListener('click', () => {
        const panelId = button.dataset.panelId;
        activeMobilePanelId = activeMobilePanelId === panelId ? null : panelId;
        renderScreen();
    });
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
    applyDeviceTheme();
    textGrid.createOrUpdateGrid();
    const startupMetaMessage = gameSession.getStartupMetaMessage();
    if (startupMetaMessage?.text) {
        updateMetaMessages([startupMetaMessage]);
    }

    appendTranscriptEntry(gameSession.start());
    renderScreen();

    if (!isMobileThemeActive) {
        focusCommandInput();
    }
};

globalThis.setInterval(() => {
    cursorVisible = !cursorVisible;
    renderScreen();
}, 530);

globalThis.addEventListener('pointerdown', () => {
    if (!isMobileThemeActive) {
        focusCommandInput();
    }

    renderScreen();
});

globalThis.addEventListener('focus', renderScreen);
globalThis.addEventListener('blur', renderScreen);
globalThis.addEventListener('resize', applyDeviceTheme);

if (globalThis.visualViewport) {
    globalThis.visualViewport.addEventListener('resize', updateViewportMetrics);
    globalThis.visualViewport.addEventListener('scroll', updateViewportMetrics);
}


