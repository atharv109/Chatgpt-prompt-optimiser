// PromptPro – popup.js
// Must be a separate file. MV3 blocks all inline scripts in extension pages.

const input = document.getElementById('api-key-input');
const saveBtn = document.getElementById('save-btn');
const statusMsg = document.getElementById('status-msg');
const statusDot = document.getElementById('status-dot');
const barText = document.getElementById('bar-text');
const deleteBtn = document.getElementById('delete-btn');

function setStatus(msg, type) {
  statusMsg.textContent = msg;
  statusMsg.className = 'status-msg ' + (type || '');
}

function setActive(active) {
  statusDot.className = 'dot ' + (active ? 'active' : 'inactive');
  barText.className = 'bar-text ' + (active ? 'active' : 'inactive');
  barText.innerHTML = active
    ? '<strong>Active</strong> — ready on chatgpt.com'
    : '<strong>No API key</strong> — add one above';
  deleteBtn.style.display = active ? 'block' : 'none';
}

// Load key from background worker on popup open
chrome.runtime.sendMessage({ type: 'GET_KEY' }, (response) => {
  if (chrome.runtime.lastError) {
    setStatus('Extension error — try reloading it', 'err');
    return;
  }
  if (response && response.success && response.key) {
    input.value = response.key;
    setActive(true);
  }
});

// Save
saveBtn.addEventListener('click', () => {
  const key = input.value.trim();
  if (!key) { setStatus('Please enter your API key.', 'err'); return; }
  if (!key.startsWith('gsk_')) { setStatus("Groq keys start with gsk_ — check your key", 'err'); return; }

  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving…';
  setStatus('', '');

  chrome.runtime.sendMessage({ type: 'SAVE_KEY', key }, (response) => {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save';

    if (chrome.runtime.lastError) {
      setStatus('Extension error: ' + chrome.runtime.lastError.message, 'err');
      return;
    }
    if (response && response.success) {
      setStatus('✓ Key saved!', 'ok');
      setActive(true);
      setTimeout(() => setStatus('', ''), 3000);
    } else {
      setStatus('Save failed: ' + (response?.error || 'unknown error'), 'err');
    }
  });
});

// Delete
deleteBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'DELETE_KEY' }, () => {
    input.value = '';
    setActive(false);
    setStatus('Key removed.', 'ok');
    setTimeout(() => setStatus('', ''), 2000);
  });
});

// Enter key shortcut
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') saveBtn.click();
});
