export class TextGrid {
  constructor () {
    this.gridContainer = document.getElementById ('text-grid');
    this.gridWidth = 0;
    this.gridHeight = 0;
    this.gridCenter = {x: 0, y: 0};
    this.grid = [];
    this.cursorPosition = {x: 0, y: 0};
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
    this.gridCenter = {x: Math.floor (this.gridWidth / 2), y: Math.floor (this.gridHeight / 2)};

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

  getCharacter(x, y) {
      if (y < 0 || y >= this.grid.length || x < 0 || x >= this.grid[y].length) {
          return ' '; // Return a space for out-of-bounds coordinates
      }
      return this.grid[y][x];
  }

  setCharacter(x, y, character) {
      if (y >= 0 && y < this.grid.length && x >= 0 && x < this.grid[y].length) {
          const row = this.grid[y].split('');
          row[x] = character;
          this.grid[y] = row.join('');
      }
      // Ignore if coordinates are outside the grid bounds
  }

  // Function to update random characters
  updateRandomCharacters (char) {
    for (let i = 0; i < 1000; i++) {
      
      const x = Math.floor (Math.random () * this.gridWidth);
      const y = Math.floor (Math.random () * this.gridHeight);
      const randomChar = String.fromCharCode (
        33 + Math.floor (Math.random () * (126 - 33))
      );
      this.setCharacter (x, y, char);
    }
  }

  print(text, x, y, lineLength) {
    y = y || this.cursorPosition.y;
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
    this.cursorPosition.y = y + text.split('\n').length;
    this.updateGridDisplay();
}

  printAnimated(text, x, y, lineLength, duration) {
    y = y || this.cursorPosition.y;
    const frames = Math.floor(duration/60); // Total number of frames in the animation
    const frameDuration = 1000/60; // Duration of each frame in milliseconds
    let lines = text.split('\n').map(line => line.padEnd(lineLength, ' ')); // Pad each line to lineLength

    // Initialize grid with whitespaces
    for (let i = 0; i < lines.length; i++) {
        this.setLineSegment(y + i, x, ' '.repeat(lineLength));
    }
    this.updateGridDisplay();

    // Create animation frames
    for (let frame = 0; frame <= frames; frame++) {
        setTimeout(() => {
            for (let i = 0; i < lines.length; i++) {
                let animatedLine = '';
                for (let j = 0; j < lineLength; j++) {
                    if (frame < frames / 2) {
                        // Fade-in effect: Start with whitespace and gradually introduce random characters
                        const fadeChance = frame / (frames / 2);
                        animatedLine += (lines[i][j] !== ' ' && Math.random() < fadeChance) ? 
                            this.getRandomCharacter() : 
                            ' ';
                    } else {
                        // Second half of the animation: Transition to actual text
                        const settleChance = (frame - frames / 2) / (frames / 2);
                        animatedLine += (lines[i][j] !== ' ' && Math.random() < settleChance) ? 
                            lines[i][j] : 
                            (lines[i][j] !== ' ' ? this.getRandomCharacter() : ' ');
                    }
                }
                this.setLineSegment(y + i, x, animatedLine);
            }
            this.cursorPosition.y = y + lines.length;
            this.updateGridDisplay();
        }, frame * frameDuration);
    }
  }

  fillRectangleAnimated(x, y, width, height, characters, duration) {
      const fps = 60;
      const frames = duration / 1000 * fps; // Convert duration to seconds and calculate total frames
      let currentFrame = 0;

      // Function to fill a portion of the rectangle
      const fillPortion = () => {
          const portion = (currentFrame / frames) * (width * height);
          let charIndex = 0;

          for (let i = 0; i < height; i++) {
              for (let j = 0; j < width; j++) {
                  if (i * width + j < portion) {
                      const char = characters[charIndex % characters.length];
                      this.setCharacter(x + j, y + i, char);
                      charIndex++;
                  }
              }
          }
          this.updateGridDisplay();
      };

      // Animation loop
      const animate = () => {
          fillPortion();
          currentFrame++;
          if (currentFrame <= frames) {
              requestAnimationFrame(animate);
          }
      };

      animate();
  }

  scrollUpAnimated(x, y, width, height, linesToScroll, duration) {
    const fps = 60; // Frames per second
    const totalFrames = duration / 1000 * fps; // Total number of frames
    const shiftPerFrame = linesToScroll / totalFrames; // Lines to scroll per frame
    let currentShift = 0; // Current shift amount

    const animateScroll = (frame) => {
        if (frame > totalFrames) return;

        currentShift += shiftPerFrame;
        const integerShift = Math.floor(currentShift);

        for (let row = y; row < y + height; row++) {
            for (let col = x; col < x + width; col++) {
                // Determine the source row for the current frame
                const srcRow = row + integerShift;
                const char = (srcRow < y + height) ? this.getCharacter(col, srcRow) : ' ';
                this.setCharacter(col, row - integerShift, char);
            }
        }

        this.updateGridDisplay();
        setTimeout(() => animateScroll(frame + 1), 1000 / fps);
    };

    animateScroll(0);
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


  getRandomCharacter() {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return characters.charAt(Math.floor(Math.random() * characters.length));
  }
}

export default TextGrid;