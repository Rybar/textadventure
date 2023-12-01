export function animateText(text, element) {
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
export function clearScreenAnimation(element) {
  let originalText = element.innerText;
  let scrambledText = scrambleText(originalText);
  element.innerText = scrambledText;

  let interval = setInterval(function() {
      if (scrambledText.length > 0) {
          // Reduce the length of the scrambled text
          scrambledText = scrambledText.substring(0, scrambledText.length - 1);
          element.innerText = scrambleText(scrambledText);
      } else {
          clearInterval(interval);
          element.innerText = ''; // Clear the screen completely
      }
  }, 100);
}

export function scrambleText(scrambled, target = '') {
return scrambled.split('').map((c, i) => (Math.random() < 0.1 || target[i] === c) ? target[i] || c : randomChar()).join('');
}

export function randomChar() {
const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
return chars.charAt(Math.floor(Math.random() * chars.length));
}