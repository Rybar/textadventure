import { scrambleText, animateText } from './js/core/util.js';
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

// Define game state with rooms
let gameState = new GameState({ "kitchen": kitchen, "livingRoom": livingRoom }, 'kitchen');
window.game = gameState; // For debugging
let commandHistory = [];
let historyIndex = -1;
const outputElement = document.getElementById('output');
const inputElement = document.getElementById('input');

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
    outputElement.innerText += '\n> ' + command;
    animateText(gameState.handleCommand(command), outputElement);
    scrollToBottom();
}

function scrollToBottom() {
    outputElement.scrollTop = outputElement.scrollHeight;
}

window.onload = function() {
    animateText(gameState.handleCommand('look around'), outputElement);
    scrollToBottom();
    inputElement.focus();
}