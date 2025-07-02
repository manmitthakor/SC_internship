const display = document.getElementById('display');
const history = document.getElementById('history');
let darkMode = true;

function append(value) {
  display.value += value;
}

function clearDisplay() {
  display.value = '';
  history.textContent = '';
}

function deleteLast() {
  display.value = display.value.slice(0, -1);
}

function calculate() {
  try {
    const result = eval(display.value);
    history.textContent = display.value + " =";
    display.value = result;
  } catch {
    display.value = 'Error';
  }
}

function toggleTheme() {
  document.body.classList.toggle('light-mode');
  darkMode = !darkMode;
}

// Keyboard support
document.addEventListener('keydown', (e) => {
  if (e.key.match(/[0-9+\-*/().]/)) {
    append(e.key);
  } else if (e.key === 'Enter') {
    calculate();
  } else if (e.key === 'Backspace') {
    deleteLast();
  } else if (e.key === 'Escape') {
    clearDisplay();
  }
});
