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

function animateText(text, element) {
  let scrambled = scrambleText(text);
  element.innerText += '\n' + scrambled;

  let interval = setInterval(function() {
      scrambled = scrambleText(scrambled, text);
      element.innerText = element.innerText.slice(0, -scrambled.length) + scrambled;

      if (scrambled === text) {
          clearInterval(interval);
      }
  }, 1000/60);
}

function scrambleText(scrambled, target = '') {
  return scrambled.split('').map((c, i) => (Math.random() < 0.1 || target[i] === c) ? target[i] || c : randomChar()).join('');
}

function randomChar() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return chars.charAt(Math.floor(Math.random() * chars.length));
}

window.onload = function() {
    animateText(gameState.handleCommand('look around'), outputElement);
    scrollToBottom();
    inputElement.focus();
}