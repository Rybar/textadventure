export class TextGrid {
  constructor(options = {}) {
    this.gridContainer = document.getElementById('text-grid');
    this.defaultGridWidth = options.columns ?? 96;
    this.defaultGridHeight = options.rows ?? 54;
    this.gridWidth = this.defaultGridWidth;
    this.gridHeight = this.defaultGridHeight;
    this.promptVisible = true;
    this.promptRow = this.gridHeight - 1;
    this.transcriptHeight = this.gridHeight - 2;
    this.gridCenter = {
      x: Math.floor(this.gridWidth / 2),
      y: Math.floor(this.gridHeight / 2),
    };
    this.grid = [];
    this.measurementElement = null;
  }

  clamp(value, minimum, maximum) {
    return Math.max(minimum, Math.min(maximum, value));
  }

  updateGridMetrics() {
    this.promptRow = this.gridHeight - 1;
    this.transcriptHeight = this.promptVisible
      ? Math.max(1, this.gridHeight - 2)
      : Math.max(1, this.gridHeight);
    this.gridCenter = {
      x: Math.floor(this.gridWidth / 2),
      y: Math.floor(this.gridHeight / 2),
    };
  }

  getMeasurementElement() {
    if (this.measurementElement) {
      return this.measurementElement;
    }

    const element = document.createElement('span');
    element.setAttribute('aria-hidden', 'true');
    element.textContent = 'MMMMMMMMMM';
    element.style.position = 'absolute';
    element.style.visibility = 'hidden';
    element.style.pointerEvents = 'none';
    element.style.whiteSpace = 'pre';
    document.body.appendChild(element);
    this.measurementElement = element;
    return element;
  }

  measureCharacterMetrics() {
    const measurementElement = this.getMeasurementElement();
    const computedStyle = globalThis.getComputedStyle(this.gridContainer);
    measurementElement.style.fontFamily = computedStyle.fontFamily;
    measurementElement.style.fontSize = computedStyle.fontSize;
    measurementElement.style.lineHeight = computedStyle.lineHeight;
    measurementElement.style.letterSpacing = computedStyle.letterSpacing;

    const rect = measurementElement.getBoundingClientRect();
    const characterWidth = rect.width / measurementElement.textContent.length;
    const lineHeight = Number.parseFloat(computedStyle.lineHeight) || rect.height || Number.parseFloat(computedStyle.fontSize) || 16;

    return {
      characterWidth: Math.max(1, characterWidth),
      lineHeight: Math.max(1, lineHeight),
    };
  }

  setViewportMode({ mobile = false } = {}) {
    this.promptVisible = !mobile;

    if (!mobile) {
      this.gridWidth = this.defaultGridWidth;
      this.gridHeight = this.defaultGridHeight;
      this.updateGridMetrics();
      return;
    }

    const container = this.gridContainer?.parentElement;
    if (!container) {
      this.updateGridMetrics();
      return;
    }

    const containerStyle = globalThis.getComputedStyle(container);
    const { characterWidth, lineHeight } = this.measureCharacterMetrics();
    const availableWidth = container.clientWidth
      - Number.parseFloat(containerStyle.paddingLeft || '0')
      - Number.parseFloat(containerStyle.paddingRight || '0');
    const availableHeight = container.clientHeight > 0
      ? container.clientHeight
        - Number.parseFloat(containerStyle.paddingTop || '0')
        - Number.parseFloat(containerStyle.paddingBottom || '0')
      : globalThis.innerHeight * 0.58;

    this.gridWidth = this.clamp(Math.floor(availableWidth / characterWidth) - 1, 34, 72);
    this.gridHeight = this.clamp(Math.floor(availableHeight / lineHeight), 18, 42);
    this.updateGridMetrics();
  }

  createOrUpdateGrid() {
    this.grid = new Array(this.gridHeight).fill(' '.repeat(this.gridWidth));
    this.updateGridDisplay();
  }

  updateGridDisplay() {
    this.gridContainer.textContent = this.grid.join('\n');
  }

  wrapText(text, width = this.gridWidth) {
    const paragraphs = String(text).split('\n');
    const wrappedLines = [];

    paragraphs.forEach(paragraph => {
      const normalizedParagraph = paragraph.replaceAll(/\s+/g, ' ').trim();

      if (!normalizedParagraph) {
        wrappedLines.push('');
        return;
      }

      const words = normalizedParagraph.split(' ');
      let currentLine = '';

      words.forEach(word => {
        if (word.length > width) {
          if (currentLine) {
            wrappedLines.push(currentLine);
            currentLine = '';
          }

          for (let index = 0; index < word.length; index += width) {
            wrappedLines.push(word.slice(index, index + width));
          }
          return;
        }

        const candidateLine = currentLine ? `${currentLine} ${word}` : word;
        if (candidateLine.length <= width) {
          currentLine = candidateLine;
          return;
        }

        wrappedLines.push(currentLine);
        currentLine = word;
      });

      if (currentLine) {
        wrappedLines.push(currentLine);
      }
    });

    return wrappedLines;
  }

  renderFrame({ transcriptLines = [], promptText = '', cursorVisible = true, promptVisible = this.promptVisible }) {
    const nextGrid = new Array(this.gridHeight).fill(' '.repeat(this.gridWidth));
    const transcriptHeight = promptVisible
      ? Math.max(1, this.gridHeight - 2)
      : this.gridHeight;
    const visibleTranscript = transcriptLines.slice(-transcriptHeight);
    const transcriptStartRow = transcriptHeight - visibleTranscript.length;

    visibleTranscript.forEach((line, index) => {
      nextGrid[transcriptStartRow + index] = this.padLine(line);
    });

    if (promptVisible) {
      nextGrid[this.promptRow] = this.buildPromptLine(promptText, cursorVisible);
    }

    this.grid = nextGrid;
    this.updateGridDisplay();
  }

  padLine(text = '') {
    const visibleText = String(text).slice(0, this.gridWidth);
    return visibleText.padEnd(this.gridWidth, ' ');
  }

  buildPromptLine(promptText, cursorVisible) {
    const promptPrefix = '> ';
    const promptWidth = this.gridWidth - promptPrefix.length;
    const normalizedPrompt = String(promptText).replaceAll(/\s+/g, ' ');
    const visiblePrompt = normalizedPrompt.slice(-promptWidth);
    const cursor = cursorVisible ? '_' : ' ';
    const prompt = `${promptPrefix}${visiblePrompt}${cursor}`.slice(0, this.gridWidth);
    return this.padLine(prompt);
  }
}

export default TextGrid;