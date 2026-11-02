# YouTube Digest

[English](README.md) | [简体中文](README.zh-CN.md)

Turn every YouTube video into a resource for deep learning. YouTube Digest brings transcripts, bilingual translation, AI overviews, explanations, and timestamped notes into one Chrome side panel, so you can study ideas and language without losing your place.

- Turn captions into a readable, searchable learning resource.
- Learn languages with the original transcript, a Simplified Chinese translation, or an aligned bilingual view.
- Build understanding with an AI overview, chapters, key quotes, and selected-text explanations.
- Navigate long videos by clicking timestamps in the transcript, overview, or notes.
- Save polished timestamped notes for later study.
- Keep control of your data with your own API keys, local Chrome storage, and no analytics or telemetry.

YouTube Digest is a bring-your-own-key project installed locally from GitHub. It is not available through the Chrome Web Store, does not include API credits, and does not run a developer-operated server.

## Install with your coding agent

You do not need to understand the code or use the command line. Send this message to your coding agent:

> Download or clone this project into a permanent folder I choose, tell me its exact full path, and use that same folder for Chrome's Load unpacked step. If I need a suggestion during this first installation, offer `~/Documents/youtube-digest` on macOS or Linux, or `%USERPROFILE%\Documents\youtube-digest` on Windows, but do not assume either path. Walk me through installation and setup in simple terms. https://github.com/linadong/video-bilingual-transcripts

Your agent should:

1. Ask where you want to keep the project, download or clone it there, and tell you the exact full path. If you want a suggestion, it can offer `~/Documents/youtube-digest` on macOS or Linux, or `%USERPROFILE%\Documents\youtube-digest` on Windows.
2. Open the official Supadata page and your chosen AI provider's page (DeepSeek, Claude, or OpenAI Codex) below and help you create your own accounts.
3. Walk you through selecting the exact project folder you chose in Chrome with **Load unpacked**.
4. Show you where to enter your API keys in the extension's **Settings** page.
5. Open a YouTube video with captions and confirm the transcript and translation work.

Keep this folder in the same place after installation. If you move or delete it, Chrome's unpacked extension stops working until you load the extension again from its new permanent folder.

Never paste an API key into an AI chat, source file, screenshot, or public message. Enter keys yourself, directly in the YouTube Digest Settings page. Your coding agent can point to the correct field without seeing the key.

## Install manually

If you prefer to do it yourself:

1. Open [github.com/linadong/video-bilingual-transcripts](https://github.com/linadong/video-bilingual-transcripts).
2. Choose **Code**, then **Download ZIP**.
3. Choose a permanent folder and unzip the project there. Optional suggestions are `~/Documents/youtube-digest` on macOS or Linux, or `%USERPROFILE%\Documents\youtube-digest` on Windows. You may use a different folder.
4. In Chrome, open `chrome://extensions`.
5. Turn on **Developer mode**.
6. Click **Load unpacked**.
7. Select the exact project folder you chose, which must contain `manifest.json`.
8. Pin YouTube Digest from Chrome's Extensions menu if you want quick access.

Because this is an unpacked extension, it does not update automatically. After downloading an update or changing local files, click **Reload** on the YouTube Digest card at `chrome://extensions`, then refresh open YouTube tabs. Moving or deleting the source folder breaks the unpacked extension until you load it again from the new location.

## Set up your API keys

YouTube Digest needs two keys under your own provider accounts:

1. A **Supadata API key** to retrieve YouTube transcripts.
2. An **AI provider API key** for overviews, explanations, translation, and automatic note polishing. Choose **DeepSeek**, **Claude**, or **OpenAI Codex** in Settings, then get a key for that provider.

### Get a Supadata API key

1. Open the official [Supadata sign-up page](https://dash.supadata.ai/auth/sign-up).
2. Create an account and complete the short onboarding flow.
3. Supadata generates an API key automatically during onboarding.
4. Open the [Supadata dashboard](https://dash.supadata.ai/) whenever you need to find or manage the key.
5. Copy the key and paste it into **Supadata API key** in YouTube Digest Settings.

See the [official Supadata documentation](https://docs.supadata.ai/) if the dashboard flow changes.

### Get a DeepSeek API key

1. Open the official [DeepSeek API Keys page](https://platform.deepseek.com/api_keys).
2. Sign in or create a DeepSeek Platform account when prompted.
3. Choose **Create new API key**, give it a recognizable name such as `YouTube Digest`, and create it.
4. Copy the key immediately. The full key may only be shown once.
5. Paste it into **DeepSeek API key** in YouTube Digest Settings.
6. If DeepSeek reports insufficient balance, add credit in your DeepSeek Platform account and try again.

See the [official DeepSeek API documentation](https://api-docs.deepseek.com/) for current account and API details.

### Get a Claude (Anthropic) API key

1. Open the official [Anthropic Console API Keys page](https://console.anthropic.com/settings/keys).
2. Sign in or create an Anthropic account when prompted.
3. Choose **Create Key**, give it a recognizable name such as `YouTube Digest`, and create it.
4. Copy the key immediately. The full key may only be shown once.
5. Paste it into **Claude API key** in YouTube Digest Settings.
6. If Anthropic reports insufficient credit, add credit in your Anthropic Console account and try again.

See the [official Anthropic API documentation](https://docs.anthropic.com/) for current account and API details.

Open **Settings** from the side panel. You can also open the YouTube Digest **Options** page from its card at `chrome://extensions` or by right-clicking its toolbar icon. Paste keys only into these Settings fields. Never paste a key into an AI chat, repository file, screenshot, or public message.

The published version supports three built-in AI providers, selectable from the **AI provider** dropdown in Settings:

```text
DeepSeek V4 Flash
  Base URL: https://api.deepseek.com
  Model: deepseek-v4-flash

Claude Haiku 4.5
  Base URL: https://api.anthropic.com
  Model: claude-haiku-4-5-20251001

OpenAI Codex (GPT-5.3-Codex)
  Endpoint: https://api.openai.com/v1/responses
  Model: gpt-5.3-codex
```

Each provider's endpoint and model are fixed in Settings, so the only AI credential you enter is the API key for whichever provider you pick; switching providers keeps all provider keys saved so you can switch back later. YouTube Digest sends every DeepSeek request in non-thinking mode for responsive, predictable interactions; Claude has no equivalent reasoning mode to disable. To use a different provider or model than these three, copy the safe customization prompt in Settings and give it to a coding agent for your local copy. Never add an API key to that prompt or chat.

Keys and settings are stored in Chrome's local extension storage on your device. Release builds do not include or use `config.js`.

## Use YouTube Digest

1. Open a standard YouTube watch page with captions.
2. Click the YouTube Digest extension icon to open the side panel.
3. Read the timestamped transcript, or choose **Original**, **中文**, or **双语**.
4. Open **Overview** when you want AI-generated chapters and key quotes.
5. Select transcript text when you want an AI explanation.
6. Save a note from the player or a key quote, then revisit it from **Notes**.

## What works today

- Google Chrome 116 or newer, using the Side Panel API.
- Standard `youtube.com/watch` video pages.
- Native subtitle tracks returned by Supadata. YouTube Digest prefers English when available, but may show another native language.
- Original, Simplified Chinese, and aligned bilingual transcript views.
- AI overviews, selected-text explanations, translation, and automatic note polishing.
- Local notes and a local cache for recent transcript and digest results.
- DeepSeek V4 Flash, Claude Haiku 4.5, or OpenAI Codex (GPT-5.3-Codex) for AI features, selectable in Settings. Other providers require a local code adaptation and are not supported by this published version.

Shorts, live streams, private or access-restricted videos, and videos without an available native transcript may not work. Firefox, Safari, mobile browsers, and other Chromium browsers are not currently tested or supported.

YouTube Digest forces Supadata's `mode=native`. It does not request AI-generated transcripts or perform local audio transcription when native captions are unavailable.

## Supadata free tier and request costs

Current as of August 9, 2026, the [Supadata pricing page](https://supadata.ai/pricing) lists a free tier with **100 credits per month**, no credit card required. Unused credits do not roll over. Supadata pricing can change, so check the current page before relying on these numbers.

The [Supadata transcript documentation](https://docs.supadata.ai/get-transcript) describes the transcript request modes and credit behavior:

- A native transcript request uses **1 credit**, regardless of video duration.
- A generated transcript costs **2 credits per video minute**. YouTube Digest does not use this path because it forces `mode=native`.
- An unavailable native lookup returned as HTTP `206` still uses **1 credit**.

With the current native-only behavior, the free tier can cover roughly 100 transcript lookups per month when each request succeeds once. Retries and unavailable-caption lookups also consume credits, so actual successful-video coverage can be lower.

Your AI provider's usage is separate from Supadata. DeepSeek and Anthropic each apply their own free quota, rate limits, or charges. YouTube Digest does not collect payments or resell access. Set spending limits and monitor both accounts. The estimate below explains the current DeepSeek translation cost; see the Claude pricing note further down for Anthropic.

## DeepSeek V4 Flash translation cost estimate

Current as of August 10, 2026, DeepSeek lists the following prices per 1 million tokens on its official [pricing page](https://api-docs.deepseek.com/quick_start/pricing/):

- Cache-hit input: **$0.0028 USD**.
- Cache-miss input: **$0.14 USD**.
- Output: **$0.28 USD**.

DeepSeek says these prices may increase soon, so check the current pricing page before relying on this estimate. Its official [token usage guide](https://api-docs.deepseek.com/quick_start/token_usage/) estimates about 0.3 token per English character and about 0.6 token per Chinese character. Its [context caching guide](https://api-docs.deepseek.com/guides/kv_cache/) explains the automatic best-effort disk cache used for repeated prefixes.

A measured 20-minute English talk contained **2,935 spoken English words** and 15,433 transcript characters. With YouTube Digest's current grouping, it became 128 semantic segments and 43 requests of three segments each. Repeated prompts and JSON brought the rendered input to about 108,528 English characters, or **about 32,600 input tokens** using DeepSeek's 0.3 token per English character heuristic. The translated Chinese JSON output is estimated at about 3,500 to 4,500 tokens using the 0.6 token per Chinese character heuristic, plus JSON and ID overhead.

If all input is billed as cache miss, input costs about $0.0046 and output costs about $0.0010 to $0.0013, for a total of about $0.0056 to $0.0059. When much of the repeated system prompt hits DeepSeek's automatic best-effort cache, a realistic lower end is about $0.002 to $0.003. A practical estimate for fully translating this talk is therefore **$0.002 to $0.006 USD, about ¥0.02 to ¥0.04**.

Translation is lazy and progressive. Cached segments are reused, and only rows you request by scrolling into them incur calls. Retries, provider behavior, and pricing changes can increase the final cost.

## Claude Haiku 4.5 pricing

YouTube Digest has not run the same measured benchmark for Claude, so check Anthropic's official [pricing page](https://www.anthropic.com/pricing) for current per-token rates before relying on Claude for high-volume use. Anthropic bills input and output tokens separately and offers its own prompt-caching discounts; the request pattern (many small translation batches per video) is the same one measured for DeepSeek above, so expect a similar number of requests per video even though the per-token price differs.

## Remix it with your coding agent

This is a personal remix project. Upstream issues and pull requests are not accepted. If something breaks or you want a new feature, download or fork your own copy and ask your coding agent to fix, remix, or personalize it for you.

YouTube Digest uses plain HTML, CSS, and JavaScript with no build step, so it is a friendly starting point for agent-assisted projects. Ideas to try:

- Add more translation languages and let each person choose a learning language.
- Create customized summary templates for lectures, interviews, tutorials, reviews, or research talks.
- Build a vocabulary notebook that saves a word, its sentence, meaning, and video timestamp.
- Export notes and vocabulary to Markdown, CSV, Anki, or another study tool.
- Add personal topic filters that highlight the chapters most relevant to a goal.
- Add optional local-model support for a different privacy and cost tradeoff.
- Improve accessibility with keyboard navigation, font controls, and higher-contrast themes.

Ask your agent to preserve the bring-your-own-key model, keep secrets out of source files, run the checks below, and test the remix on real videos.

If you want another AI provider or model, first open the exact YouTube Digest project folder that Chrome loaded through **Load unpacked** in your coding agent. Then open YouTube Digest Settings and use **Copy customization prompt**. Replace the `[PROVIDER]` and `[MODEL]` placeholders before sending it. Do not include any API key in the prompt or chat. After the agent updates your local copy, enter the key yourself in the Settings field it identifies.

## Privacy and data flow

YouTube Digest makes provider requests directly from the extension:

1. It sends a canonical YouTube watch URL to Supadata to request the native transcript.
2. It sends the transcript and relevant video metadata to your selected AI provider (DeepSeek, Claude, or OpenAI Codex) when you request AI features.
3. Focused features send only the content they need, such as selected text with context or small transcript batches for translation.
4. It stores keys, settings, notes, and recent cache entries locally in Chrome.

There is no YouTube Digest account system, advertising, analytics, or telemetry. Supadata and your selected AI provider still receive data under their own terms and privacy policies. See [PRIVACY.md](PRIVACY.md) for details.

## Troubleshooting

### The Digest button is missing on a YouTube video

- At `chrome://extensions`, find YouTube Digest and click **Reload**, then refresh the YouTube tab.
- Confirm that you are on a standard `https://www.youtube.com/watch?...` page, not a Short, embed, or live page.
- The current version automatically follows YouTube when its responsive action bar changes. Wait a moment after the page finishes loading.
- If you have an older downloaded copy, resizing the YouTube window horizontally once may reveal the button. Then download the latest version so resizing is no longer required.
- If it is still missing, ask your coding agent to inspect the content script on that exact video page.

### The side panel does not open

- Confirm that you are on a standard `https://www.youtube.com/watch?...` page.
- At `chrome://extensions`, confirm YouTube Digest is enabled and click **Reload**.
- Refresh the YouTube tab after reloading the extension.
- Ask your coding agent to inspect the extension if the problem continues.

### YouTube Digest asks for setup

- Open **Settings** and save both a Supadata key and a key for your selected AI provider.
- This published version uses a fixed endpoint and model per provider: DeepSeek V4 Flash, Claude Haiku 4.5, or OpenAI Codex (GPT-5.3-Codex). There are no Base URL or Model fields to configure.
- If Settings says a legacy custom provider was removed, enter a DeepSeek key. The old AI key was cleared so it could not be reused with the wrong service.

### No transcript is found

- Confirm the video is public and has native captions.
- Check your Supadata key, remaining credits, rate limit, and account status.
- Remember that unavailable native lookups and manual retries may still consume credits.

YouTube Digest will not fall back to generated transcription.

### AI requests fail

- A `401` or `403` usually means the AI provider's key or account access is invalid.
- A `429` usually means the AI provider's rate or spending limit was reached.
- Confirm the key was created in the correct account (DeepSeek Platform, Anthropic Console, or OpenAI Platform, matching the provider selected in Settings) and that the account has available credit.
- If you adapted a local copy for another model, use the Settings customization prompt again and ask your coding agent to inspect that local implementation.

Never share API keys, private transcripts, or personal notes in chats, screenshots, or logs.

## Checks for coding agents

Ask your coding agent to run these commands after changing the project:

```bash
npm test
npm run check
npm run package
```

The agent should also reload the unpacked extension in Chrome and test several real YouTube videos. Automated checks do not prove that live provider requests and YouTube interactions work.

## License

MIT. See [LICENSE](LICENSE).

## Use OpenAI Codex

Reload the unpacked extension at `chrome://extensions`, open Settings, select **OpenAI Codex (GPT-5.3-Codex)**, enter your [OpenAI API key](https://platform.openai.com/api-keys), and save. Keep your Supadata key for subtitles. API usage is billed separately from ChatGPT subscriptions; this extension does not reuse your IDE login. Your API project must have access to [GPT-5.3-Codex](https://developers.openai.com/api/docs/models/gpt-5.3-codex).

All four AI features use the selected provider. Existing cached results remain; clear cached digests in Settings to regenerate with Codex. Test an overview, an explanation, subtitle translation, and note polishing on a real YouTube video. Codex uses the Responses API with low reasoning effort and `store: false`; incomplete or refused outputs are reported as errors.

## v1.4.0: local video and YouTube subtitles

This modified version includes two different subtitle workflows:

- **Local video:** Whisper Base recognizes speech on your computer, generates timestamped subtitles, and exports SRT. No API key or video upload is required. The current limit is **250 MB and 30 minutes per video**.
- **YouTube:** Supadata retrieves the video's existing native captions and requires your Supadata API key. Videos without available native captions do not fall back to audio transcription. AI translation and other AI features require a separate key for the selected AI provider.

### Generate subtitles from a local video

1. Open **Local video / 本地视频** from Settings or the side panel, then select or drop a video.
2. Click **下载 / 检查识别模型** to download the Whisper Base model on first use. Main model weights are approximately 77 MB; downloading requires access to Hugging Face.
3. Choose English, Chinese, or automatic language detection, then click **生成字幕**.
4. Click a subtitle to seek to its timestamp. Click **导出 SRT** to save the subtitles before closing the page or replacing the video, which clears them.

Once the model is cached, recognition runs locally without a network connection. Clearing the model or browser cache requires downloading it again. Playback supports volume, seeking, fullscreen, speed, and 10-second skips. MP4 (H.264/AAC) or WebM is recommended; playback and audio decoding depend on browser codec support. Reopening the page requires choosing the file again. Local subtitles appear on the player page; this workflow does not include AI analysis or subtitle import.

### Verification status

The published v1.4.0 source passed 69 automated tests, release checks, and packaging. Actual local-video transcription, live YouTube interactions, and online provider requests have not yet been manually verified for this publication. Recognition accuracy and performance still need testing with real videos.

## Baidu Netdisk preview

Refresh the pan.baidu.com playback page after updating, start playback, then open the extension side panel. Pages with fid/fsid or file path parameters are supported through accessible standard video elements. Cross-origin frames, custom players, and burned-in subtitles are not supported. Authenticated Baidu playback has not been tested. Enable captions and try Read page captions, or import UTF-8 SRT/VTT. Select cues for Chinese translation or explanation, generate chapter summaries, and click timestamps to seek. AI uses your configured provider without Supadata. Manually written timestamped notes are local, limited to 100 per video; delete individually or reset extension data. Captions and AI results are session-only.

### v1.3.1 source isolation

Local playback has a dedicated informational side panel. Since v1.4.0, speech transcription is available on the local player page; local subtitle import is not implemented. YouTube lookup is restricted to the active tab in the current window, without falling back to another YouTube tab. Reload the extension and refresh the local player after updating.

## Attribution

Based on [YouTube Digest by Zara Zhang](https://github.com/zarazhangrui/youtube-digest), under the MIT license.
