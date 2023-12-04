export class TextGrid {
  constructor () {
    this.gridContainer = document.getElementById ('text-grid');
    this.gridWidth = 0;
    this.gridHeight = 0;
    this.grid = [];
  }

  measureCharacterSize () {
    const measurer = document.createElement ('div');
    measurer.style.display = 'inline-block';
    measurer.style.visibility = 'hidden';
    measurer.style.position = 'absolute';
    measurer.textContent = 'M'; // Use 'M' as it's typically one of the widest characters
    (measurer.style.fontFamily = 'Courier New'), 'monospace';
    document.body.appendChild (measurer);
    const size = {
      width: measurer.offsetWidth,
      height: measurer.offsetHeight,
    };
    document.body.removeChild (measurer);
    return size;
  }

  calculateGridDimensions () {
    const charSize = this.measureCharacterSize ();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    this.gridWidth = Math.floor (viewportWidth / charSize.width * 1.02);
    this.gridHeight = Math.floor (viewportHeight / charSize.height * 0.95);

    return {gridWidth: this.gridWidth, gridHeight: this.gridHeight};
  }

  createOrUpdateGrid () {
    const {gridWidth, gridHeight} = this.calculateGridDimensions ();
    this.grid = new Array (gridHeight).fill (' '.repeat (gridWidth));
    this.updateGridDisplay ();
  }

  // Function to update the display
  updateGridDisplay () {
    this.gridContainer.textContent = this.grid.join ('\n');
  }

  // Function to set a character at a specific position
  setCharacter (x, y, character) {
    if (x < this.gridWidth && y < this.gridHeight) {
      const row = this.grid[y].split ('');
      row[x] = character;
      this.grid[y] = row.join ('');
      this.updateGridDisplay ();
    }
  }

  // Function to update random characters
  updateRandomCharacters () {
    for (let i = 0; i < 1000; i++) {
      const x = Math.floor (Math.random () * this.gridWidth);
      const y = Math.floor (Math.random () * this.gridHeight);
      const randomChar = String.fromCharCode (
        33 + Math.floor (Math.random () * (126 - 33))
      );
      this.setCharacter (x, y, randomChar);
    }
  }

  print(text, x, y, lineLength) {
    const lines = text.split('\n'); // Split text into lines first

    let currentLine = y;

    lines.forEach(line => {
        const words = line.split(' '); // Split line into words
        let lineBuffer = '';

        words.forEach((word, index) => {
            const testLine = lineBuffer + word + (index < words.length - 1 ? ' ' : '');
            if (testLine.length > lineLength) {
                if (lineBuffer) {
                    this.setLineSegment(currentLine, x, lineBuffer);
                    currentLine++;
                }
                lineBuffer = word + ' ';
            } else {
                lineBuffer = testLine;
            }
        });

        if (lineBuffer) {
            this.setLineSegment(currentLine, x, lineBuffer.trim());
            currentLine++;
        }
    });

    this.updateGridDisplay();
}




  setLineSegment (lineNumber, startColumn, segment) {
    if (lineNumber < this.grid.length) {
      const line = this.grid[lineNumber].split ('');
      for (let i = 0; i < segment.length; i++) {
        if (startColumn + i < line.length) {
          line[startColumn + i] = segment[i];
        }
      }
      this.grid[lineNumber] = line.join ('');
    }
  }

  fillRectangle (x, y, width, height, characters) {
    for (let row = y; row < y + height; row++) {
      if (row >= this.gridHeight) break; // Boundary check for rows
      for (let col = x; col < x + width; col++) {
        if (col >= this.gridWidth) break; // Boundary check for columns

        const randomChar = characters.charAt (
          Math.floor (Math.random () * characters.length)
        );
        this.setCharacter (col, row, randomChar);
      }
    }
    this.updateGridDisplay ();
  }
}

export default TextGrid;