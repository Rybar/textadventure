import { animateScrambledText, animateTextClear } from './js/engine/render/textEffects.js';
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
let activeTranscriptMetaTimeoutId = null;
let activeTranscriptMetaEntryId = null;
let stopActiveTranscriptMetaAnimation = null;
let activeRestartDelayTimeoutId = null;
let activeRestartCountdownIntervalId = null;
let stopActiveTranscriptClearAnimation = null;
let pendingRestartTransition = null;
let isRestartTransitionActive = false;
let restartTransitionEndsAt = 0;
let restartCountdownStartsAt = 0;
let transcriptTransitionScrollTop = null;
let transcriptShouldSnapToBottom = true;
const queuedTranscriptMetaMessages = [];
const inputElement = document.getElementById('cli-input');
const commandBarElement = document.getElementById('command-bar');
const mobilePanelTabsElement = document.getElementById('mobile-panel-tabs');
const mobilePanelTabElements = Array.from(document.querySelectorAll('.mobile-panel-tab'));
const transcriptScrollContainerElement = document.getElementById('text-grid-container');
const transcriptOutputElement = document.getElementById('transcript-output');
const transcriptLayerElement = document.createElement('div');
const transcriptClearOverlayElement = document.createElement('div');
const restartCountdownElement = document.createElement('div');
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
const URL_PATTERN = /https?:\/\/[^\s]+/gu;

transcriptLayerElement.id = 'transcript-layer';
transcriptClearOverlayElement.id = 'transcript-clear-overlay';
transcriptClearOverlayElement.setAttribute('aria-hidden', 'true');
restartCountdownElement.id = 'restart-countdown';
restartCountdownElement.setAttribute('aria-hidden', 'true');

if (transcriptScrollContainerElement && transcriptOutputElement) {
    transcriptScrollContainerElement.replaceChildren(transcriptLayerElement);
    transcriptLayerElement.append(transcriptOutputElement, transcriptClearOverlayElement);
    transcriptScrollContainerElement.appendChild(restartCountdownElement);
}

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
    isMobileThemeActive = shouldUseMobileTheme();
    bodyElement.dataset.deviceTheme = isMobileThemeActive ? 'mobile' : 'desktop';

    if (!isMobileThemeActive) {
        bodyElement.dataset.mobileInputActive = 'false';
        document.documentElement.style.setProperty('--mobile-keyboard-offset', '0px');
    }

    updateViewportMetrics();
}

function escapeHtml(text) {
    return String(text)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;');
}

function setElementTextWithLinks(element, text, { linkify = true } = {}) {
    const content = String(text ?? '');

    if (!linkify || !content) {
        element.textContent = content;
        return;
    }

    URL_PATTERN.lastIndex = 0;
    const fragments = [];
    let lastIndex = 0;

    for (const match of content.matchAll(URL_PATTERN)) {
        const [url] = match;
        const matchIndex = match.index ?? 0;

        if (matchIndex > lastIndex) {
            fragments.push(document.createTextNode(content.slice(lastIndex, matchIndex)));
        }

        const linkElement = document.createElement('a');
        linkElement.className = 'transcript-link';
        linkElement.href = url;
        linkElement.target = '_blank';
        linkElement.rel = 'noopener noreferrer';
        linkElement.textContent = url;
        fragments.push(linkElement);
        lastIndex = matchIndex + url.length;
    }

    if (fragments.length === 0) {
        element.textContent = content;
        return;
    }

    if (lastIndex < content.length) {
        fragments.push(document.createTextNode(content.slice(lastIndex)));
    }

    element.replaceChildren(...fragments);
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

function getTranscriptEntryById(entryId) {
    return transcriptEntries.find(candidate => candidate.id === entryId) ?? null;
}

function getTranscriptEntryElement(entryId) {
    return transcriptOutputElement.querySelector(`[data-entry-id="${entryId}"]`);
}

function createTranscriptMetaEntry(message) {
    const transcriptEntry = {
        id: nextTranscriptEntryId,
        type: 'meta',
        text: '',
        renderedText: '',
        tone: getMetaMessageTone(message),
        source: message.source ?? '',
        cleared: false,
        isAnimating: false,
    };

    nextTranscriptEntryId += 1;
    transcriptEntries.push(transcriptEntry);
    return transcriptEntry;
}

function clearTranscriptMetaAnimation() {
    if (activeTranscriptMetaTimeoutId) {
        globalThis.clearTimeout(activeTranscriptMetaTimeoutId);
        activeTranscriptMetaTimeoutId = null;
    }

    if (stopActiveTranscriptMetaAnimation) {
        stopActiveTranscriptMetaAnimation();
        stopActiveTranscriptMetaAnimation = null;
    }

    activeTranscriptMetaEntryId = null;
}

function startTranscriptMetaMessage(message) {
    const animationOptions = message.options ? { ...message.options } : {};
    const transcriptEntry = createTranscriptMetaEntry(message);

    transcriptEntry.isAnimating = true;
    requestTranscriptSnapToBottom();
    renderScreen();

    const metaElement = getTranscriptEntryElement(transcriptEntry.id)?.querySelector('.transcript-meta');
    if (!metaElement) {
        transcriptEntry.isAnimating = false;
        transcriptEntry.cleared = true;
        renderScreen();
        showNextTranscriptMetaMessage();
        return;
    }

    activeTranscriptMetaEntryId = transcriptEntry.id;
    stopActiveTranscriptMetaAnimation = animateScrambledText(metaElement, message.text, {
        ...animationOptions,
        holdDuration: getReadableMetaHoldDuration(message),
        onComplete: () => {
            transcriptEntry.isAnimating = false;
            transcriptEntry.cleared = true;
            transcriptEntry.text = '';
            transcriptEntry.renderedText = '';
            metaElement.textContent = '';
            clearTranscriptMetaAnimation();
            renderScreen();
            showNextTranscriptMetaMessage();
        },
    });
}

function showNextTranscriptMetaMessage() {
    if (activeTranscriptMetaEntryId != null || queuedTranscriptMetaMessages.length === 0) {
        return;
    }

    const message = queuedTranscriptMetaMessages.shift();
    if (!message?.text) {
        showNextTranscriptMetaMessage();
        return;
    }

    if ((message.delayMs ?? 0) > 0) {
        activeTranscriptMetaEntryId = -1;
        activeTranscriptMetaTimeoutId = globalThis.setTimeout(() => {
            activeTranscriptMetaEntryId = null;
            activeTranscriptMetaTimeoutId = null;
            startTranscriptMetaMessage({
                ...message,
                delayMs: 0,
            });
        }, message.delayMs);
        return;
    }

    startTranscriptMetaMessage(message);
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

function lockTranscriptScrollPosition() {
    if (!transcriptScrollContainerElement) {
        return;
    }

    transcriptTransitionScrollTop = transcriptScrollContainerElement.scrollTop;
}

function restoreTranscriptScrollPosition() {
    if (!transcriptScrollContainerElement || transcriptTransitionScrollTop == null) {
        return;
    }

    transcriptScrollContainerElement.scrollTop = transcriptTransitionScrollTop;
}

function unlockTranscriptScrollPosition() {
    transcriptTransitionScrollTop = null;
}

function renderTranscriptEntries() {
    transcriptEntries.forEach((entry, index) => {
        let entryElement = transcriptOutputElement.children[index];

        if (entryElement?.dataset.entryId !== String(entry.id)) {
            entryElement = document.createElement('article');
            transcriptOutputElement.insertBefore(entryElement, transcriptOutputElement.children[index] ?? null);
        }

        entryElement.dataset.entryId = String(entry.id);
        entryElement.className = `transcript-entry transcript-entry-${entry.type}`;

        if (entry.type === 'turn') {
            let commandElement = entryElement.querySelector('.transcript-command');
            let responseElement = entryElement.querySelector('.transcript-response');

            if (!commandElement || !responseElement || entryElement.childElementCount !== 2) {
                entryElement.replaceChildren();
                commandElement = document.createElement('div');
                commandElement.className = 'transcript-command';
                responseElement = document.createElement('div');
                responseElement.className = 'transcript-response';
                entryElement.append(commandElement, responseElement);
            }

            commandElement.textContent = `> ${entry.command}`;
            setElementTextWithLinks(responseElement, entry.renderedResponse, {
                linkify: entry.renderedResponse === entry.response,
            });
        } else if (entry.type === 'meta') {
            let metaElement = entryElement.querySelector('.transcript-meta');

            if (!metaElement || entryElement.childElementCount !== 1) {
                entryElement.replaceChildren();
                metaElement = document.createElement('div');
                metaElement.className = 'transcript-meta';
                entryElement.appendChild(metaElement);
            }

            entryElement.dataset.tone = entry.tone ?? '';
            entryElement.dataset.cleared = entry.cleared ? 'true' : 'false';
            metaElement.dataset.source = entry.source ?? '';
            metaElement.dataset.tone = entry.tone ?? '';

            if (!entry.isAnimating) {
                metaElement.textContent = entry.renderedText;
            }
        } else {
            let systemElement = entryElement.querySelector('.transcript-system');

            if (!systemElement || entryElement.childElementCount !== 1) {
                entryElement.replaceChildren();
                systemElement = document.createElement('div');
                systemElement.className = 'transcript-system';
                entryElement.appendChild(systemElement);
            }

            setElementTextWithLinks(systemElement, entry.renderedText, {
                linkify: entry.renderedText === entry.text,
            });
        }
    });

    while (transcriptOutputElement.children.length > transcriptEntries.length) {
        transcriptOutputElement.lastElementChild?.remove();
    }

    scrollTranscriptToBottom();
}

function renderScreen() {
    inputElement.disabled = isRestartTransitionActive;
    commandBarElement.dataset.disabled = isRestartTransitionActive ? 'true' : 'false';
    renderInterfaceChrome();
    renderTranscriptEntries();

    if (isRestartTransitionActive) {
        restoreTranscriptScrollPosition();
    }
}

function setRestartCountdownVisibility(isVisible) {
    restartCountdownElement.dataset.visible = isVisible ? 'true' : 'false';
    restartCountdownElement.setAttribute('aria-hidden', isVisible ? 'false' : 'true');
}

function renderRestartCountdown(remainingMs = 0) {
    if (!restartCountdownStartsAt || Date.now() < restartCountdownStartsAt) {
        restartCountdownElement.textContent = '';
        setRestartCountdownVisibility(false);
        return;
    }

    const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
    restartCountdownElement.textContent = remainingSeconds > 0
        ? `Restarting in ${remainingSeconds}...`
        : '';
    setRestartCountdownVisibility(remainingSeconds > 0);
}

function clearRestartDelayCountdown() {
    if (activeRestartCountdownIntervalId) {
        globalThis.clearInterval(activeRestartCountdownIntervalId);
        activeRestartCountdownIntervalId = null;
    }

    restartTransitionEndsAt = 0;
    restartCountdownStartsAt = 0;
    restartCountdownElement.textContent = '';
    setRestartCountdownVisibility(false);
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

    const completedEntryId = activeTypingEntryId;
    activeTypingEntryId = null;
    maybeStartPendingRestartDelay(completedEntryId);
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
        return null;
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
        return transcriptEntry;
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
    return transcriptEntry;
}

function appendLatestTranscriptEntry() {
    return appendTranscriptEntry(gameSession.transcript.entries.at(-1) ?? null);
}

function getRestartTransitionText() {
    return transcriptEntries
        .filter(entry => entry.type !== 'meta')
        .map(entry => {
            if (entry.type === 'turn') {
                return [`> ${entry.command}`, entry.response].filter(Boolean).join('\n');
            }

            return entry.text;
        })
        .filter(Boolean)
        .join('\n\n');
}

function clearVisibleTranscriptEntries() {
    for (let index = transcriptEntries.length - 1; index >= 0; index -= 1) {
        if (transcriptEntries[index]?.type !== 'meta') {
            transcriptEntries.splice(index, 1);
        }
    }
}

function completeRestartTransition() {
    const preface = pendingRestartTransition?.preface ?? '';
    const openingText = pendingRestartTransition?.openingText ?? '';
    const restartText = [preface, openingText].filter(Boolean).join('\n\n');

    pendingRestartTransition = null;
    isRestartTransitionActive = false;
    clearRestartDelayCountdown();
    transcriptOutputElement.dataset.transitioning = 'false';
    transcriptClearOverlayElement.dataset.visible = 'false';
    transcriptClearOverlayElement.textContent = '';
    unlockTranscriptScrollPosition();
    clearVisibleTranscriptEntries();

    if (restartText) {
        gameSession.presentRestartOpening(restartText);
        appendLatestTranscriptEntry();
    }

    renderScreen();
    focusCommandInput();
}

function startRestartTransitionClear() {
    activeRestartDelayTimeoutId = null;
    clearRestartDelayCountdown();

    const visibleTranscriptText = getRestartTransitionText();
    if (!visibleTranscriptText) {
        completeRestartTransition();
        return;
    }

    lockTranscriptScrollPosition();
    transcriptOutputElement.dataset.transitioning = 'true';
    transcriptClearOverlayElement.dataset.visible = 'true';
    transcriptClearOverlayElement.textContent = visibleTranscriptText;
    stopActiveTranscriptClearAnimation = animateTextClear(transcriptClearOverlayElement, visibleTranscriptText, {
        clearFrameLength: 14,
        clearFraction: 0.28,
        minCharactersPerFrame: 64,
        maxCharactersPerFrame: 220,
        onComplete: () => {
            stopActiveTranscriptClearAnimation = null;
            completeRestartTransition();
        },
    });
    renderScreen();
}

function maybeStartPendingRestartDelay(entryId) {
    if (!pendingRestartTransition || pendingRestartTransition.entryId !== entryId || activeRestartDelayTimeoutId) {
        return;
    }

    isRestartTransitionActive = true;
    restartTransitionEndsAt = Date.now() + (pendingRestartTransition.delayMs ?? 5000);
    restartCountdownStartsAt = restartTransitionEndsAt - 3000;
    renderRestartCountdown(restartTransitionEndsAt - Date.now());
    activeRestartCountdownIntervalId = globalThis.setInterval(() => {
        renderRestartCountdown(restartTransitionEndsAt - Date.now());
    }, 100);
    lockTranscriptScrollPosition();
    renderScreen();
    activeRestartDelayTimeoutId = globalThis.setTimeout(startRestartTransitionClear, pendingRestartTransition.delayMs ?? 5000);
}

function updateInterfaceEvents(events = [], latestTranscriptEntry = null) {
    events.forEach(event => {
        if (event?.type !== 'restart-transition' || !latestTranscriptEntry) {
            return;
        }

        pendingRestartTransition = {
            ...event,
            entryId: latestTranscriptEntry.id,
        };
        maybeStartPendingRestartDelay(latestTranscriptEntry.id);
    });
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

function isInteractiveTarget(target) {
    return target instanceof Element
        && target.closest('a, button, input, label, select, textarea, summary, [role="button"]') !== null;
}

function updateMetaMessages(messages = []) {
    messages.forEach(message => {
        if (!message?.text) {
            return;
        }

        queuedTranscriptMetaMessages.push({
            ...message,
            delayMs: message.delayMs ?? 0,
        });
    });

    if (activeTranscriptMetaEntryId == null) {
        showNextTranscriptMetaMessage();
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
    if (isRestartTransitionActive) {
        return;
    }

    gameSession.submitCommand(command);
    const latestTranscriptEntry = appendLatestTranscriptEntry();
    updateInterfaceEvents(gameSession.consumePendingInterfaceEvents(), latestTranscriptEntry);
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

globalThis.addEventListener('pointerdown', event => {
    if (isInteractiveTarget(event.target)) {
        return;
    }

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


