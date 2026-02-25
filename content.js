// PromptPro v9 – Content Script
// Adds conversation context scraping for context-aware rewrites

let injectedBtn = null;
let lastEditor = null;
let isOptimizing = false;

function getEditor() {
  return (
    document.querySelector("#prompt-textarea") ||
    document.querySelector('div[contenteditable="true"][data-lexical-editor]') ||
    document.querySelector("textarea[data-id]") ||
    document.querySelector("textarea")
  );
}

function getValue(el) {
  if (!el) return "";
  return el.tagName === "TEXTAREA" ? el.value : (el.innerText || el.textContent || "");
}

function setValue(el, value) {
  if (!el) return;
  if (el.tagName === "TEXTAREA") {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
    setter.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  } else {
    el.focus();
    document.execCommand("selectAll", false, null);
    document.execCommand("insertText", false, value);
    el.dispatchEvent(new InputEvent("input", { bubbles: true }));
  }
}

// Scrape last 2 conversation turns from ChatGPT for context
function getConversationContext() {
  try {
    const turns = [];

    // User messages
    const userMsgs = document.querySelectorAll('[data-message-author-role="user"]');
    // Assistant messages
    const assistantMsgs = document.querySelectorAll('[data-message-author-role="assistant"]');

    // Get last user message (not the current one being typed)
    if (userMsgs.length > 0) {
      const lastUser = userMsgs[userMsgs.length - 1];
      const text = lastUser.innerText?.trim();
      if (text) turns.push({ role: "user", content: text.slice(0, 300) });
    }

    // Get last assistant response
    if (assistantMsgs.length > 0) {
      const lastAssistant = assistantMsgs[assistantMsgs.length - 1];
      const text = lastAssistant.innerText?.trim();
      if (text) turns.push({ role: "assistant", content: text.slice(0, 300) });
    }

    return turns;
  } catch (e) {
    return [];
  }
}

function buildButton() {
  const btn = document.createElement("button");
  btn.id = "promptpro-btn";
  btn.type = "button";
  btn.title = "Intelligently rewrite this prompt";
  btn.innerHTML = `<span class="pp-icon">⚡</span><span class="pp-label">Optimize</span>`;

  btn.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOptimizing) return;

    const editor = getEditor();
    const raw = getValue(editor).trim();
    if (!raw) { showToast("Type a prompt first!", "warn"); return; }

    isOptimizing = true;
    btn.classList.add("pp-loading");
    btn.innerHTML = `<span class="pp-icon pp-spin">⚙</span><span class="pp-label">Rewriting…</span>`;

    const context = getConversationContext();

    try {
      const response = await chrome.runtime.sendMessage({
        type: "OPTIMIZE_PROMPT",
        prompt: raw,
        context
      });

      if (!response.success) {
        const errors = {
          "NO_API_KEY": "Add your Groq API key via the extension icon ↗",
          "INVALID_KEY": "Invalid API key — check the extension settings",
          "RATE_LIMIT": "Rate limited — try again in a moment"
        };
        showToast(errors[response.error] || `Error: ${response.error}`, "warn");
        resetBtn(btn);
        return;
      }

      setValue(editor, response.optimized);
      btn.classList.remove("pp-loading");
      btn.classList.add("pp-done");
      btn.innerHTML = `<span class="pp-icon">✓</span><span class="pp-label">Done!</span>`;
      showToast("Prompt rewritten ✓");
      setTimeout(() => resetBtn(btn), 2200);

    } catch (err) {
      showToast("Something went wrong — try again", "warn");
      resetBtn(btn);
    }
  });

  return btn;
}

function resetBtn(btn) {
  btn.classList.remove("pp-loading", "pp-done");
  btn.innerHTML = `<span class="pp-icon">⚡</span><span class="pp-label">Optimize</span>`;
  isOptimizing = false;
}

function injectButton(editor) {
  if (injectedBtn) injectedBtn.remove();
  injectedBtn = buildButton();

  const sendBtn = (
    document.querySelector("[data-testid='send-button']") ||
    document.querySelector("button[aria-label='Send prompt']") ||
    document.querySelector("button[aria-label='Send message']")
  );

  if (sendBtn?.parentElement) {
    sendBtn.parentElement.insertBefore(injectedBtn, sendBtn);
  } else {
    const container = editor.closest("form") || editor.parentElement;
    if (container) {
      injectedBtn.classList.add("pp-fallback");
      if (getComputedStyle(container).position === "static") container.style.position = "relative";
      container.appendChild(injectedBtn);
    }
  }
}

function showToast(msg, type = "success") {
  document.getElementById("pp-toast")?.remove();
  const t = document.createElement("div");
  t.id = "pp-toast";
  t.className = `pp-toast${type === "warn" ? " pp-toast-warn" : ""}`;
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => { t.style.opacity = "1"; t.style.transform = "translateX(-50%) translateY(0)"; });
  setTimeout(() => {
    t.style.opacity = "0"; t.style.transform = "translateX(-50%) translateY(8px)";
    setTimeout(() => t.remove(), 300);
  }, type === "warn" ? 4000 : 3000);
}

function tryInject() {
  const editor = getEditor();
  if (editor && editor !== lastEditor) { lastEditor = editor; injectButton(editor); }
  if (injectedBtn && !document.contains(injectedBtn)) { injectedBtn = null; lastEditor = null; }
}

new MutationObserver(tryInject).observe(document.body, { childList: true, subtree: true });
tryInject();
