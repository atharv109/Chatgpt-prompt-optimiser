# ⚡ PromptPro — AI Prompt Optimizer

A Chrome/Edge browser extension that instantly rewrites your ChatGPT prompts into masterclass-level prompts using a 6-stage AI pipeline powered by **Llama 3.3 70B via Groq** — completely free, no credit card needed.

---

## What it does

You type a rough prompt. You click **⚡ Optimize**. PromptPro rewrites it into a far better version and drops it straight into the ChatGPT text box — ready to send.

**Before:**
> "help me optimise my linkedin based on my resume"

**After:**
> "Act as an expert LinkedIn profile coach and personal branding specialist. I'm attaching my resume — use it as the sole source of truth. Rewrite my LinkedIn headline, About section, and experience bullets to make my profile compelling and discoverable to recruiters. Show me the actual rewritten content, not just suggestions. Use only what's in my resume, keep the tone human not corporate."

---

## The 6-stage pipeline

Every prompt goes through this silently on every click:

| Stage | What it does |
|-------|-------------|
| 1. Classify | Detects domain (coding / writing / career / learning / creative / analysis / general), real intent, and user level |
| 2. Anti-pattern detection | Fixes double-barrelled questions, vague scope, ambiguous pronouns, missing referents |
| 3. Output intent | Detects if you want the actual deliverable, feedback, an explanation, or a decision — and asks for exactly that |
| 4. Domain template | Applies the known-best prompt structure for the detected domain |
| 5. Audience calibration | Adjusts depth and style based on beginner / intermediate / expert signals |
| 6. Rewrite | Combines everything into one clean, proportional, natural prompt |

---

## Installation

### 1. Get a free Groq API key
- Go to [console.groq.com/keys](https://console.groq.com/keys)
- Sign up (no credit card needed)
- Click **Create API Key** and copy it

### 2. Load the extension in Chrome
1. Clone or download this repo
2. Go to `chrome://extensions` in Chrome or Edge
3. Enable **Developer Mode** (toggle in the top right)
4. Click **Load Unpacked**
5. Select the `promptpro-v10` folder

### 3. Add your API key
1. Click the ⚡ PromptPro icon in your browser toolbar
2. Paste your `gsk_...` Groq API key
3. Click **Save** — the green dot means you're live

### 4. Use it
1. Go to [chatgpt.com](https://chatgpt.com)
2. Type any prompt
3. Click **⚡ Optimize** next to the send button
4. Your prompt is instantly rewritten — hit send

---

## How it works technically

```
ChatGPT page
    ↓ content.js injects the Optimize button + scrapes conversation context
    ↓ on click → sends message to background.js
background.js (service worker)
    ↓ reads API key from chrome.storage.local
    ↓ calls Groq API with 6-stage system prompt + user prompt + context
    ↓ returns rewritten prompt
content.js
    ↓ drops rewritten prompt into ChatGPT text box
```

All API calls are made from the background service worker (bypasses CORS). The API key is stored locally in your browser and never leaves your machine except to go directly to Groq.

---

## File structure

```
promptpro-v10/
├── manifest.json       # Chrome Manifest V3 config
├── background.js       # Service worker — owns storage + Groq API calls
├── content.js          # Injected into ChatGPT — button + context scraping
├── content.css         # Styles for the injected button and toast
├── popup.html          # Extension toolbar popup UI
├── popup.js            # Popup logic — talks to background via messages
└── icons/              # Extension icons
```

---

## Supported browsers

- ✅ Chrome
- ✅ Edge
- ❌ Firefox (Manifest V3 support is different — coming soon)

---

## Model

**Llama 3.3 70B Versatile** via [Groq](https://groq.com) — chosen for:
- Free tier (14,400 requests/day, no credit card)
- Excellent instruction following
- Fast inference (~1-2 seconds per rewrite)

---

## Roadmap

- [ ] Support Claude.ai, Gemini, Perplexity
- [ ] Visual feedback showing which pipeline stages fired
- [ ] Custom system prompt editor in settings
- [ ] Firefox support

---

## License

MIT — do whatever you want with it.
