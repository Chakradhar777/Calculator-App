const display = document.getElementById('display');
const buttons = document.querySelectorAll('.btn');
const clearBtn = document.getElementById('clear');
const equalsBtn = document.getElementById('equals');
const historyList = document.getElementById('history-list');
const clearHistoryBtn = document.getElementById('clear-history');

let currentExpression = '';

function updateDisplay() {
  display.value = currentExpression;
}

buttons.forEach(button => {
  button.addEventListener('click', () => {
    const value = button.dataset.value;
    if (button.id === 'clear') {
      currentExpression = '';
      updateDisplay();
    } else if (button.id === 'equals') {
      try {
        // Evaluate expression safely using Function constructor
        const result = Function(`return ${currentExpression}`)();
        if (result !== undefined) {
          saveCalculation(currentExpression, result);
          currentExpression = result.toString();
          updateDisplay();
        }
      } catch {
        display.value = 'Error';
        currentExpression = '';
      }
    } else {
      currentExpression += value;
      updateDisplay();
    }
  });
});

// Fetch history from backend
async function loadHistory() {
  try {
    const res = await fetch('/history');
    const data = await res.json();
    historyList.innerHTML = '';
    data.forEach(item => {
      const li = document.createElement('li');
      li.textContent = `${item.expression} = ${item.result}`;
      historyList.appendChild(li);
    });
  } catch (error) {
    console.error('Failed to load history', error);
  }
}

// Save calculation to backend
async function saveCalculation(expression, result) {
  try {
    await fetch('/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expression, result })
    });
    loadHistory();
  } catch (error) {
    console.error('Failed to save calculation', error);
  }
}

// Clear history handler
clearHistoryBtn.addEventListener('click', async () => {
  try {
    await fetch('/clear-history', { method: 'POST' });
    loadHistory(); // Refresh displayed history
  } catch (error) {
    console.error('Failed to clear history', error);
  }
});

// Initial load
loadHistory();
