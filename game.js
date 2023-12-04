import { scrambleText, animateText } from './js/core/util.js';
import TextGrid  from './js/core/textGrid.js';
import { GameState } from './js/core/gameState.js';

// Initialize Rooms. room modules include items
import { kitchen } from './js/rooms/kitchen.js';
import { livingRoom } from './js/rooms/livingRoom.js';

//connect rooms by adding exits
kitchen.exits = {
    "south": "livingRoom"
};
livingRoom.exits = {
    "north": "kitchen"
};

// Initialize TextGrid
let textGrid = new TextGrid();

// Define game state with rooms
let gameState = new GameState({ "kitchen": kitchen, "livingRoom": livingRoom }, 'kitchen');
window.game = gameState; // For debugging
let commandHistory = [];
let historyIndex = -1;
const inputElement = document.getElementById('cli-input');

inputElement.addEventListener('keydown', function(event) {
    switch(event.key) {
        case 'Enter':
            commandHistory.push(this.value);
            historyIndex = commandHistory.length;
            handleCommand(this.value);
            this.value = '';
            break;
        case 'ArrowUp':
            if (historyIndex > 0) {
                historyIndex--;
                this.value = commandHistory[historyIndex];
            }
            event.preventDefault(); // Prevents cursor from going to the start of the line
            break;
        case 'ArrowDown':
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                this.value = commandHistory[historyIndex];
            } else if (historyIndex === commandHistory.length - 1) {
                historyIndex++;
                this.value = '';
            }
            event.preventDefault(); // Prevents cursor from going to the end of the line
            break;
    }
});

function handleCommand(command) {
    textGrid.fillRectangle(0, 1, 120, 24, ' ');
    textGrid.print(gameState.handleCommand(command), 1, 2, 120);
}

window.onload = function() {
    textGrid.createOrUpdateGrid();

    textGrid.updateRandomCharacters();
    textGrid.fillRectangle(0, 1, 100, 24, ' ');
    textGrid.print(gameState.handleCommand('look around'), 1, 2, 120);
    // scrollToBottom();
    // inputElement.focus();
}