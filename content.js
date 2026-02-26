// PromptPro v14 – Correct button placement on all sites
// ChatGPT: after "+" button
// Claude: after "+" button  
// Gemini: after "Tools" button
// Perplexity: after "+" button

function first(...selectors) {
  for (const sel of selectors) {
    try { const el = document.querySelector(sel); if (el) return el; } catch(e) {}
  }
  return null;
}

function setContentEditable(el, value) {
  el.focus();
  const sel = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(el);
  sel.removeAllRanges();
  sel.addRange(range);
  document.execCommand('insertText', false, value);
  el.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
}

function setTextarea(el, value) {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
  setter.call(el, value);
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
}

// ─── Site Configs ─────────────────────────────────────────────────────────────

const SITE_CONFIGS = {

  // ChatGPT: anchor AFTER the "+" (attach files) button on the left
  'chatgpt.com': {
    getEditor: () => first('#prompt-textarea', 'div[contenteditable="true"][data-lexical-editor]', 'textarea'),
    getValue: (el) => el.tagName === 'TEXTAREA' ? el.value : (el.innerText || ''),
    setValue: (el, v) => el.tagName === 'TEXTAREA' ? setTextarea(el, v) : setContentEditable(el, v),
    getAnchor: () => {
      // "+" button has aria-label containing "Attach" or just find the leftmost button in the toolbar
      return first(
        'button[aria-label*="Attach"]',
        'button[aria-label*="attach"]',
        'button[data-testid="composer-attachment-button"]',
        // fallback: first button inside the form toolbar area
        'form button:first-of-type'
      );
    },
    insertBtn: (btn, anchor) => anchor.insertAdjacentElement('afterend', btn),
    getContext: () => {
      try {
        const turns = [];
        const u = document.querySelectorAll('[data-message-author-role="user"]');
        const a = document.querySelectorAll('[data-message-author-role="assistant"]');
        if (u.length) turns.push({ role: 'user', content: u[u.length-1].innerText?.trim().slice(0, 300) });
        if (a.length) turns.push({ role: 'assistant', content: a[a.length-1].innerText?.trim().slice(0, 300) });
        return turns;
      } catch { return []; }
    }
  },

  // Claude: anchor AFTER the "+" button (aria-label="Add content")
  'claude.ai': {
    getEditor: () => first(
      'div[contenteditable="true"].ProseMirror',
      'div.ProseMirror[contenteditable]',
      'fieldset div[contenteditable="true"]',
      'div[contenteditable="true"]'
    ),
    getValue: (el) => el.innerText || el.textContent || '',
    setValue: (el, v) => setContentEditable(el, v),
    getAnchor: () => first(
      'button[aria-label="Add content"]',
      'button[aria-label*="Add"]',
      'button[data-testid="add-content-button"]',
      // The "+" in Claude's bottom left
      'fieldset button:first-of-type'
    ),
    insertBtn: (btn, anchor) => anchor.insertAdjacentElement('afterend', btn),
    getContext: () => {
      try {
        const turns = [];
        const h = document.querySelectorAll('[data-testid="human-turn-content"]');
        const a = document.querySelectorAll('[data-testid="ai-turn-content"]');
        if (h.length) turns.push({ role: 'user', content: h[h.length-1].innerText?.trim().slice(0, 300) });
        if (a.length) turns.push({ role: 'assistant', content: a[a.length-1].innerText?.trim().slice(0, 300) });
        return turns;
      } catch { return []; }
    }
  },

  // Gemini: anchor AFTER the "Tools" button
  'gemini.google.com': {
    getEditor: () => first('textarea.gds-body-l', 'textarea[placeholder*="Ask Gemini"]', 'textarea'),
    getValue: (el) => el.value || '',
    setValue: (el, v) => {
      setTextarea(el, v);
      el.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'a' }));
      el.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'a' }));
    },
    getAnchor: () => first(
      // "Tools" button - from the screenshot it has text "Tools" with a tools icon
      'button[aria-label="Tools"]',
      'button[mattooltip="Tools"]',
      // Find button containing text "Tools"
      ...[...document.querySelectorAll('button')].filter(b => b.innerText?.trim() === 'Tools')
    ),
    insertBtn: (btn, anchor) => anchor.insertAdjacentElement('afterend', btn),
    getContext: () => {
      try {
        const turns = [];
        const u = document.querySelectorAll('.user-query-text, [class*="user-query"]');
        const a = document.querySelectorAll('[class*="response-content"] p');
        if (u.length) turns.push({ role: 'user', content: u[u.length-1].innerText?.trim().slice(0, 300) });
        if (a.length) turns.push({ role: 'assistant', content: a[a.length-1].innerText?.trim().slice(0, 300) });
        return turns;
      } catch { return []; }
    }
  },

  // Perplexity: anchor AFTER the "+" button on the left
  'perplexity.ai': {
    getEditor: () => first('div#ask-input', 'div[role="textbox"]', 'div[contenteditable="true"]'),
    getValue: (el) => el.innerText || el.textContent || '',
    setValue: (el, v) => setContentEditable(el, v),
    getAnchor: () => first(
      'button[aria-label="Add files or tools"]',
      'button[aria-label*="Add"]',
      // The "+" button — from diagnostic it has aria-label "Add files or tools"
      'button[class*="reset"]:first-of-type'
    ),
    insertBtn: (btn, anchor) => anchor.insertAdjacentElement('afterend', btn),
    getContext: () => {
      try {
        const turns = [];
        const u = document.querySelectorAll('[data-testid="user-message"]');
        const a = document.querySelectorAll('.prose p');
        if (u.length) turns.push({ role: 'user', content: u[u.length-1].innerText?.trim().slice(0, 300) });
        if (a.length) turns.push({ role: 'assistant', content: a[a.length-1].innerText?.trim().slice(0, 300) });
        return turns;
      } catch { return []; }
    }
  }
};

// ─── Site detection ───────────────────────────────────────────────────────────

function getSiteKey() {
  const host = window.location.hostname;
  if (host.includes('chatgpt.com') || host.includes('chat.openai.com')) return 'chatgpt.com';
  if (host.includes('claude.ai')) return 'claude.ai';
  if (host.includes('gemini.google.com')) return 'gemini.google.com';
  if (host.includes('perplexity.ai')) return 'perplexity.ai';
  return null;
}

const siteKey = getSiteKey();
const site = siteKey ? SITE_CONFIGS[siteKey] : null;
let injectedBtn = null;
let lastAnchor = null;
let isOptimizing = false;

// ─── Button ───────────────────────────────────────────────────────────────────

function buildButton() {
  const btn = document.createElement('button');
  btn.id = 'promptpro-btn';
  btn.type = 'button';
  btn.title = 'Intelligently rewrite this prompt with AI';
  btn.innerHTML = `<span class="pp-icon">⚡</span><span class="pp-label">Optimize</span>`;

  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOptimizing) return;

    const editor = site.getEditor();
    const raw = site.getValue(editor).trim();
    if (!raw) { showToast('Type a prompt first!', 'warn'); return; }

    isOptimizing = true;
    btn.classList.add('pp-loading');
    btn.innerHTML = `<span class="pp-icon pp-spin">⚙</span><span class="pp-label">Rewriting…</span>`;

    try {
      const response = await chrome.runtime.sendMessage({
        type: 'OPTIMIZE_PROMPT',
        prompt: raw,
        context: site.getContext()
      });

      if (!response.success) {
        const errors = {
          NO_API_KEY: 'Add your Groq API key via the extension icon ↗',
          INVALID_KEY: 'Invalid API key — check extension settings',
          RATE_LIMIT: 'Rate limited — try again in a moment'
        };
        showToast(errors[response.error] || `Error: ${response.error}`, 'warn');
        resetBtn(btn); return;
      }

      site.setValue(editor, response.optimized);
      btn.classList.remove('pp-loading');
      btn.classList.add('pp-done');
      btn.innerHTML = `<span class="pp-icon">✓</span><span class="pp-label">Done!</span>`;
      showToast('Prompt rewritten ✓');
      setTimeout(() => resetBtn(btn), 2200);

    } catch (err) {
      showToast('Something went wrong — try again', 'warn');
      resetBtn(btn);
    }
  });

  return btn;
}

function resetBtn(btn) {
  btn.classList.remove('pp-loading', 'pp-done');
  btn.innerHTML = `<span class="pp-icon">⚡</span><span class="pp-label">Optimize</span>`;
  isOptimizing = false;
}

// ─── Injection ────────────────────────────────────────────────────────────────

function injectButton() {
  if (!site) return;

  // Special handling for Gemini's Tools button which needs text search
  let anchor;
  if (siteKey === 'gemini.google.com') {
    anchor = document.querySelector('button[aria-label="Tools"]') ||
      [...document.querySelectorAll('button')].find(b => b.innerText?.trim() === 'Tools');
  } else {
    anchor = site.getAnchor();
  }

  if (!anchor) return;
  if (anchor === lastAnchor && injectedBtn && document.contains(injectedBtn)) return;

  // Remove stale button if it exists
  injectedBtn?.remove();
  injectedBtn = buildButton();
  lastAnchor = anchor;
  site.insertBtn(injectedBtn, anchor);
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function showToast(msg, type = 'success') {
  document.getElementById('pp-toast')?.remove();
  const t = document.createElement('div');
  t.id = 'pp-toast';
  t.className = `pp-toast${type === 'warn' ? ' pp-toast-warn' : ''}`;
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => { t.style.opacity = '1'; t.style.transform = 'translateX(-50%) translateY(0)'; });
  setTimeout(() => {
    t.style.opacity = '0'; t.style.transform = 'translateX(-50%) translateY(8px)';
    setTimeout(() => t.remove(), 300);
  }, type === 'warn' ? 4000 : 3000);
}

// ─── Observer + retries ───────────────────────────────────────────────────────

function tryInject() {
  if (!site) return;
  injectButton();
  if (injectedBtn && !document.contains(injectedBtn)) {
    injectedBtn = null;
    lastAnchor = null;
  }
}

new MutationObserver(tryInject).observe(document.body, { childList: true, subtree: true });
tryInject();
setTimeout(tryInject, 500);
setTimeout(tryInject, 1500);
setTimeout(tryInject, 3000);
