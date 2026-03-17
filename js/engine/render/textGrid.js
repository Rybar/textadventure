export class TextGrid {
  constructor(options = {}) {
    this.gridContainer = document.getElementById('text-grid');
    this.gridWidth = options.columns ?? 96;
    this.gridHeight = options.rows ?? 54;
    this.promptRow = options.promptRow ?? this.gridHeight - 1;
    this.transcriptHeight = options.transcriptHeight ?? this.gridHeight - 2;
    this.gridCenter = {
      x: Math.floor(this.gridWidth / 2),
      y: Math.floor(this.gridHeight / 2),
    };
    this.grid = [];
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

  renderFrame({ transcriptLines = [], promptText = '', cursorVisible = true }) {
    const nextGrid = new Array(this.gridHeight).fill(' '.repeat(this.gridWidth));
    const visibleTranscript = transcriptLines.slice(-this.transcriptHeight);
    const transcriptStartRow = this.transcriptHeight - visibleTranscript.length;

    visibleTranscript.forEach((line, index) => {
      nextGrid[transcriptStartRow + index] = this.padLine(line);
    });

    nextGrid[this.promptRow] = this.buildPromptLine(promptText, cursorVisible);

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