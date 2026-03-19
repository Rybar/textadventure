import { animateScrambledText } from './js/engine/render/textEffects.js';
import { GameSession } from './js/engine/world/gameSession.js';
import { createGameManifest } from './js/game/manifest.js';

const gameSession = new GameSession(createGameManifest);
globalThis.game = gameSession;

const bodyElement = document.body;
const transcriptEntries = [];
const commandHistory = [];
let historyIndex = -1;
let activeMobilePanelId = null;
let nextTranscriptEntryId = 1;
let activeTypingIntervalId = null;
let activeTypingEntryId = null;
let activeStatusMetaTimeoutId = null;
let activeStatusMetaMessage = null;
let stopActiveStatusMetaAnimation = null;
let transcriptShouldSnapToBottom = true;
const queuedStatusMetaMessages = [];
const inputElement = document.getElementById('cli-input');
const commandBarElement = document.getElementById('command-bar');
const mobilePanelTabsElement = document.getElementById('mobile-panel-tabs');
const mobilePanelTabElements = Array.from(document.querySelectorAll('.mobile-panel-tab'));
const transcriptScrollContainerElement = document.getElementById('text-grid-container');
const transcriptOutputElement = document.getElementById('transcript-output');
const statusElements = {
    metaLine: document.getElementById('status-meta-line'),
    mobileMetaOverlay: document.getElementById('mobile-meta-overlay'),
    mobileMetaLine: document.getElementById('mobile-meta-line'),
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
let isMobileThemeActive = false;
const TYPEWRITER_FRAME_MS = 16;
const TYPEWRITER_CHARS_PER_FRAME = 4;

function shouldUseMobileTheme() {
    const hasMatchMedia = typeof globalThis.matchMedia === 'function';
    const coarsePointer = hasMatchMedia ? globalThis.matchMedia('(pointer: coarse)').matches : false;
    const narrowViewport = hasMatchMedia ? globalThis.matchMedia('(max-width: 900px)').matches : false;
    const shortViewport = hasMatchMedia ? globalThis.matchMedia('(max-height: 520px)').matches : false;
    const userAgent = globalThis.navigator?.userAgent ?? '';
    const handheldMobileAgent = /iphone|ipod|android.+mobile|windows phone|mobile/i.test(userAgent);

    return coarsePointer && (handheldMobileAgent || (narrowViewport && shortViewport));
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
    const previousMobileTheme = isMobileThemeActive;
    isMobileThemeActive = shouldUseMobileTheme();
    bodyElement.dataset.deviceTheme = isMobileThemeActive ? 'mobile' : 'desktop';

    if (!isMobileThemeActive) {
        bodyElement.dataset.mobileInputActive = 'false';
        document.documentElement.style.setProperty('--mobile-keyboard-offset', '0px');
    }

    updateViewportMetrics();

    if (previousMobileTheme !== isMobileThemeActive) {
        if (activeStatusMetaMessage?.text) {
            const interruptedMessage = activeStatusMetaMessage;

            if (activeStatusMetaTimeoutId) {
                globalThis.clearTimeout(activeStatusMetaTimeoutId);
                activeStatusMetaTimeoutId = null;
            }

            if (stopActiveStatusMetaAnimation) {
                stopActiveStatusMetaAnimation();
                stopActiveStatusMetaAnimation = null;
            }

            activeStatusMetaMessage = null;
            syncStatusMetaContainers();
            queuedStatusMetaMessages.unshift({
                ...interruptedMessage,
                delayMs: 0,
            });
            showNextStatusMetaMessage();
            return;
        }

        syncStatusMetaContainers();
    }
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

function getActiveStatusMetaElement() {
    return isMobileThemeActive ? statusElements.mobileMetaLine : statusElements.metaLine;
}

function getMetaMessageTone(message = {}) {
    if (message.source === 'hacker') {
        return 'hacker';
    }

    if (message.source === 'experiment-lackeys-aware' || /Reactive/i.test(message.id ?? '')) {
        return 'aware';
    }

    if (message.source === 'experiment-lackeys') {
        return 'lackey';
    }

    return '';
}

function syncStatusMetaContainers({ text = '', source = '', tone = '', visible = false } = {}) {
    statusElements.metaLine.textContent = '';
    statusElements.metaLine.dataset.source = '';
    statusElements.metaLine.dataset.tone = '';

    statusElements.mobileMetaLine.textContent = '';
    statusElements.mobileMetaLine.dataset.source = '';
    statusElements.mobileMetaLine.dataset.tone = '';
    statusElements.mobileMetaOverlay.dataset.visible = 'false';
    statusElements.mobileMetaOverlay.setAttribute('aria-hidden', 'true');

    if (!visible || !text) {
        return;
    }

    const activeElement = getActiveStatusMetaElement();
    activeElement.textContent = text;
    activeElement.dataset.source = source;
    activeElement.dataset.tone = tone;

    if (isMobileThemeActive) {
        statusElements.mobileMetaOverlay.dataset.visible = 'true';
        statusElements.mobileMetaOverlay.setAttribute('aria-hidden', 'false');
    }
}

function clearStatusMetaDisplay() {
    if (activeStatusMetaTimeoutId) {
        globalThis.clearTimeout(activeStatusMetaTimeoutId);
        activeStatusMetaTimeoutId = null;
    }

    if (stopActiveStatusMetaAnimation) {
        stopActiveStatusMetaAnimation();
        stopActiveStatusMetaAnimation = null;
    }

    activeStatusMetaMessage = null;
    syncStatusMetaContainers();
}

function getReadableMetaHoldDuration(message) {
    const configuredHoldDuration = message.options?.holdDuration ?? 0;
    const wordCount = String(message.text ?? '')
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .length;
    const readingDuration = Math.max(2400, wordCount * 320);
    return Math.max(configuredHoldDuration, readingDuration);
}

function startStatusMetaMessage(message) {
    const animationOptions = message.options ? { ...message.options } : {};

    activeStatusMetaMessage = message;
    syncStatusMetaContainers({
        visible: true,
        source: message.source ?? '',
        tone: getMetaMessageTone(message),
    });

    const activeMetaElement = getActiveStatusMetaElement();
    stopActiveStatusMetaAnimation = animateScrambledText(activeMetaElement, message.text, {
        ...animationOptions,
        holdDuration: getReadableMetaHoldDuration(message),
        onComplete: () => {
            activeStatusMetaMessage = null;
            stopActiveStatusMetaAnimation = null;
            syncStatusMetaContainers();
            showNextStatusMetaMessage();
        },
    });
}

function showNextStatusMetaMessage() {
    if (activeStatusMetaMessage || queuedStatusMetaMessages.length === 0) {
        return;
    }

    const message = queuedStatusMetaMessages.shift();
    if (!message?.text) {
        showNextStatusMetaMessage();
        return;
    }

    if ((message.delayMs ?? 0) > 0) {
        activeStatusMetaMessage = { delayed: true };
        activeStatusMetaTimeoutId = globalThis.setTimeout(() => {
            activeStatusMetaMessage = null;
            activeStatusMetaTimeoutId = null;
            startStatusMetaMessage({
                ...message,
                delayMs: 0,
            });
        }, message.delayMs);
        return;
    }

    startStatusMetaMessage(message);
}

function isTranscriptNearBottom() {
    const container = transcriptScrollContainerElement;
    if (!container) {
        return true;
    }

    const remainingDistance = container.scrollHeight - container.clientHeight - container.scrollTop;
    return remainingDistance <= 24;
}

function requestTranscriptSnapToBottom() {
    transcriptShouldSnapToBottom = true;
}

function updateTranscriptScrollIntent() {
    transcriptShouldSnapToBottom = isTranscriptNearBottom();
}

function getWheelDeltaInPixels(event) {
    const lineHeight = 24;
    const pageHeight = transcriptScrollContainerElement?.clientHeight ?? globalThis.innerHeight ?? 0;

    if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
        return event.deltaY * lineHeight;
    }

    if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
        return event.deltaY * pageHeight;
    }

    return event.deltaY;
}

function handleTranscriptWheel(event) {
    const container = transcriptScrollContainerElement;
    if (!container) {
        return;
    }

    const maxScrollTop = container.scrollHeight - container.clientHeight;
    if (maxScrollTop <= 0) {
        return;
    }

    const deltaY = getWheelDeltaInPixels(event);
    if (deltaY === 0) {
        return;
    }

    event.preventDefault();
    const nextScrollTop = Math.max(0, Math.min(maxScrollTop, container.scrollTop + deltaY));
    container.scrollTop = nextScrollTop;
    updateTranscriptScrollIntent();
}

function scrollTranscriptToBottom() {
    const container = transcriptScrollContainerElement;
    if (!container || !transcriptShouldSnapToBottom) {
        return;
    }

    container.scrollTop = container.scrollHeight;
}

function renderTranscriptEntries() {
    const fragment = document.createDocumentFragment();

    transcriptEntries.forEach(entry => {
        const entryElement = document.createElement('article');
        entryElement.className = `transcript-entry transcript-entry-${entry.type}`;

        if (entry.type === 'turn') {
            const commandElement = document.createElement('div');
            commandElement.className = 'transcript-command';
            commandElement.textContent = `> ${entry.command}`;
            entryElement.appendChild(commandElement);

            const responseElement = document.createElement('div');
            responseElement.className = 'transcript-response';
            responseElement.textContent = entry.renderedResponse;
            entryElement.appendChild(responseElement);
        } else {
            const systemElement = document.createElement('div');
            systemElement.className = 'transcript-system';
            systemElement.textContent = entry.renderedText;
            entryElement.appendChild(systemElement);
        }

        fragment.appendChild(entryElement);
    });

    transcriptOutputElement.replaceChildren(fragment);
    scrollTranscriptToBottom();
}

function renderScreen() {
    renderInterfaceChrome();
    renderTranscriptEntries();
}

function finalizeTypingAnimation() {
    if (activeTypingIntervalId) {
        globalThis.clearInterval(activeTypingIntervalId);
        activeTypingIntervalId = null;
    }

    if (activeTypingEntryId == null) {
        return;
    }

    const entry = transcriptEntries.find(candidate => candidate.id === activeTypingEntryId);
    if (entry) {
        if (entry.type === 'turn') {
            entry.renderedResponse = entry.response;
        } else {
            entry.renderedText = entry.text;
        }
    }

    activeTypingEntryId = null;
}

function startTypingAnimation(entry) {
    const fullText = entry.type === 'turn' ? entry.response : entry.text;
    if (!fullText) {
        return;
    }

    activeTypingEntryId = entry.id;
    let visibleLength = 0;

    activeTypingIntervalId = globalThis.setInterval(() => {
        visibleLength = Math.min(fullText.length, visibleLength + TYPEWRITER_CHARS_PER_FRAME);

        if (entry.type === 'turn') {
            entry.renderedResponse = fullText.slice(0, visibleLength);
        } else {
            entry.renderedText = fullText.slice(0, visibleLength);
        }

        renderScreen();

        if (visibleLength >= fullText.length) {
            finalizeTypingAnimation();
        }
    }, TYPEWRITER_FRAME_MS);
}

function appendTranscriptEntry(entry) {
    finalizeTypingAnimation();

    if (!entry) {
        return;
    }

    if (entry.type === 'turn') {
        const transcriptEntry = {
            id: nextTranscriptEntryId,
            type: 'turn',
            command: entry.command,
            response: entry.response,
            renderedResponse: '',
        };
        nextTranscriptEntryId += 1;
        transcriptEntries.push(transcriptEntry);
        requestTranscriptSnapToBottom();
        renderScreen();
        startTypingAnimation(transcriptEntry);
        return;
    }

    const transcriptEntry = {
        id: nextTranscriptEntryId,
        type: 'system',
        text: entry.text,
        renderedText: '',
    };
    nextTranscriptEntryId += 1;
    transcriptEntries.push(transcriptEntry);
    requestTranscriptSnapToBottom();
    renderScreen();
    startTypingAnimation(transcriptEntry);
}

function appendLatestTranscriptEntry() {
    appendTranscriptEntry(gameSession.transcript.entries.at(-1) ?? null);
}

function focusCommandInput() {
    if (!commandBarElement) {
        return;
    }

    if (document.activeElement !== inputElement) {
        inputElement.focus({ preventScroll: true });
    }
}

function isPrintableKey(event) {
    return event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;
}

function updateMetaMessages(messages = []) {
    messages.forEach(message => {
        if (!message?.text) {
            return;
        }

        queuedStatusMetaMessages.push({
            ...message,
            delayMs: message.delayMs ?? 0,
        });
    });

    if (!activeStatusMetaMessage) {
        showNextStatusMetaMessage();
    }
}

inputElement.addEventListener('input', () => {
    requestTranscriptSnapToBottom();
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
            requestTranscriptSnapToBottom();
            renderScreen();
            break;
        }
        case 'ArrowUp':
            event.preventDefault();
            if (historyIndex > 0) {
                historyIndex -= 1;
                input.value = commandHistory[historyIndex];
                requestTranscriptSnapToBottom();
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
            requestTranscriptSnapToBottom();
            renderScreen();
            break;
        default:
            break;
    }
}

inputElement.addEventListener('keydown', function(event) {
    handleInputKeyDown(event, this);
});

commandBarElement.addEventListener('submit', event => {
    event.preventDefault();
    const command = inputElement.value.trim();

    if (command) {
        commandHistory.push(command);
    }

    historyIndex = commandHistory.length;
    handleCommand(command);
    inputElement.value = '';
    requestTranscriptSnapToBottom();
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
        requestTranscriptSnapToBottom();
        renderScreen();
        return;
    }

    if (isPrintableKey(event)) {
        event.preventDefault();
        focusCommandInput();
        inputElement.value += event.key;
        requestTranscriptSnapToBottom();
        renderScreen();
    }
});

function handleCommand(command) {
    gameSession.submitCommand(command);
    appendLatestTranscriptEntry();
    updateMetaMessages(gameSession.consumePendingMetaMessages());
    renderScreen();
}

globalThis.onload = function() {
    applyDeviceTheme();
    const startupMetaMessage = gameSession.getStartupMetaMessage();
    if (startupMetaMessage?.text) {
        updateMetaMessages([startupMetaMessage]);
    }

    gameSession.start();
    appendLatestTranscriptEntry();
    renderScreen();

    if (!isMobileThemeActive) {
        focusCommandInput();
    }
};

globalThis.addEventListener('pointerdown', () => {
    if (!isMobileThemeActive) {
        focusCommandInput();
    }

    renderScreen();
});

globalThis.addEventListener('focus', renderScreen);
globalThis.addEventListener('blur', renderScreen);
globalThis.addEventListener('resize', applyDeviceTheme);

if (transcriptScrollContainerElement) {
    transcriptScrollContainerElement.addEventListener('scroll', updateTranscriptScrollIntent, { passive: true });
    transcriptScrollContainerElement.addEventListener('wheel', handleTranscriptWheel, { passive: false });
}

if (globalThis.visualViewport) {
    globalThis.visualViewport.addEventListener('resize', updateViewportMetrics);
    globalThis.visualViewport.addEventListener('scroll', updateViewportMetrics);
}


