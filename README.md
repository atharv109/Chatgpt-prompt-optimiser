# ⚡ PromptPro – AI Prompt Optimizer

A Chrome/Edge browser extension that instantly rewrites your prompts into masterclass-level prompts using a 6-stage AI pipeline powered by **Llama 3.3 70B via Groq** — completely free, no credit card needed.

Works on **ChatGPT, Claude.ai, Gemini, and Perplexity**.

---

## What it does

You type a rough prompt. You click **⚡ Optimize**. PromptPro rewrites it into a far better version and drops it straight into the text box — ready to send.

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

## Supported platforms

| Platform | Status | Button location |
|----------|--------|----------------|
| ChatGPT | ✅ | Next to the `+` button |
| Claude.ai | ✅ | Next to the `+` button |
| Gemini | ✅ | Next to the Tools button |
| Perplexity | ✅ | Next to the `+` button |

---

## Installation

### 1. Get a free Groq API key
- Go to [console.groq.com/keys](https://console.groq.com/keys)
- Sign up (no credit card needed)
- Click **Create API Key** and copy it — it starts with `gsk_`

### 2. Load the extension in Chrome
1. Clone or download this repo
2. Go to `chrome://extensions` in Chrome or Edge
3. Enable **Developer Mode** (toggle top-right)
4. Click **Load Unpacked** and select the repo folder

### 3. Add your API key
1. Click the ⚡ PromptPro icon in your toolbar
2. Paste your `gsk_...` Groq API key
3. Click **Save** — green dot means you're live

### 4. Use it
1. Go to ChatGPT, Claude, Gemini, or Perplexity
2. Type any rough prompt
3. Click **⚡ Optimize**
4. Your prompt is instantly rewritten — hit send

---

## How it works technically

```
AI site (ChatGPT / Claude / Gemini / Perplexity)
    ↓ content.js detects the site, injects ⚡ Optimize button at the right location
    ↓ on click → scrapes current prompt + last 2 conversation turns for context
    ↓ sends to background.js via chrome.runtime.sendMessage
background.js (service worker)
    ↓ reads API key from chrome.storage.local
    ↓ calls Groq API (Llama 3.3 70B) with 6-stage system prompt
    ↓ returns rewritten prompt
content.js
    ↓ injects rewritten prompt back into the text box
```

All API calls go through the background service worker (bypasses CORS). The API key is stored locally in your browser and never leaves your machine except to go directly to Groq.

---

## File structure

```
├── manifest.json       # Chrome Manifest V3 config
├── background.js       # Service worker — storage + Groq API calls + 6-stage system prompt
├── content.js          # Injected into AI sites — button + context scraping + per-site DOM adapters
├── content.css         # Styles for the injected button and toast notifications
├── popup.html          # Extension toolbar popup UI
├── popup.js            # Popup logic — communicates with background via messages
└── icons/              # Extension icons (16, 48, 128px)
```

---

## Supported browsers

- ✅ Chrome
- ✅ Edge
- ❌ Firefox (Manifest V3 differences — coming soon)

---

## Model

**Llama 3.3 70B Versatile** via [Groq](https://groq.com):
- Free tier — 14,400 requests/day, no credit card
- ~1–2 second rewrite speed
- Excellent instruction following for prompt engineering tasks

---

## Roadmap

- [ ] Image generation platforms (Midjourney, DALL-E, Stable Diffusion, Ideogram, Leonardo.ai)
- [ ] Video generation platforms (Runway, Sora, Kling, Pika)
- [ ] Music generation (Suno, Udio)
- [ ] Firefox support
- [ ] Visual feedback showing which pipeline stages fired

---

## License

MIT — do whatever you want with it.
