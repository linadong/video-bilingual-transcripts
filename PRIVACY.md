# Privacy

Effective: July 28, 2026

YouTube Digest is a GitHub-only, bring-your-own-key Chrome extension. It has no YouTube Digest account, developer-operated backend, analytics, advertising, or telemetry.

## Data the extension handles

Depending on the feature you use, YouTube Digest handles:

- the canonical URL and video ID of the active YouTube video;
- transcript text and timestamps;
- video metadata such as title, channel, description, and duration;
- text you select in the transcript and nearby transcript context;
- transcript context around a timestamped note;
- content you ask to translate;
- notes you save;
- Supadata, DeepSeek, OpenAI, and Claude (Anthropic) configuration, including API keys; and
- cached transcript, digest, and translation results.

## Where data goes

### Supadata

YouTube Digest sends the canonical YouTube video URL to `https://api.supadata.ai` with your Supadata API key. Supadata returns the transcript and timestamps. A Supadata key is required for transcript retrieval.

### DeepSeek

The published version sends AI feature content to DeepSeek V4 Flash at `https://api.deepseek.com`:

- transcript plus relevant title, channel, description, or duration for an overview;
- selected text plus nearby transcript context for an explanation;
- small semantic transcript batches currently needed for progressive Chinese
  translation, or requested overview or explanation content;
- nearby transcript context and video metadata when polishing a saved note.

The endpoint and `deepseek-v4-flash` model are fixed in the published Settings page. You provide one DeepSeek API key, used only when DeepSeek is the selected AI provider.

### Claude (Anthropic)

The published version can also send AI feature content to Claude Haiku 4.5 at `https://api.anthropic.com`, when you select Claude as the AI provider in Settings:

- transcript plus relevant title, channel, description, or duration for an overview;
- selected text plus nearby transcript context for an explanation;
- small semantic transcript batches currently needed for progressive Chinese
  translation, or requested overview or explanation content;
- nearby transcript context and video metadata when polishing a saved note.

The endpoint and `claude-haiku-4-5-20251001` model are fixed in the published Settings page. You provide one Anthropic API key, used only when Claude is the selected AI provider. Switching the AI provider in Settings keeps all provider keys stored so you can switch back later.

### OpenAI Codex

When selected, OpenAI Codex receives the same feature content described above at `https://api.openai.com/v1/responses`, using `gpt-5.3-codex`. Its API key is stored locally and sent only to OpenAI. Requests set `store: false`; this does not override OpenAI’s other retention policies. No IDE credentials or ChatGPT chat history are read.

To use a provider or model other than DeepSeek, Claude, or OpenAI Codex, you must adapt your own local source copy and its permissions. The Settings page provides a coding-agent prompt for that purpose and warns you never to include an API key in the prompt or chat.

Requests go directly from the extension to Supadata, DeepSeek, Anthropic, or OpenAI. They are authenticated with the keys you supply. YouTube Digest's developer does not proxy or receive these requests.

Those services process data under their own terms, privacy policies, retention practices, and account settings. Do not send confidential, personal, or regulated content unless their terms and your obligations permit it.

## Local storage and retention

YouTube Digest uses Chrome's local extension storage, not a YouTube Digest cloud service.

- Supadata, DeepSeek, OpenAI, and Claude settings and API keys remain on the device in Chrome's extension storage.
- Saved notes remain until you delete them or remove/clear the extension's data. The extension keeps up to 100 notes.
- Recent transcript, digest, and per-segment translation cache entries are stored
  locally. The cache is limited to 20 videos, and entries older than 30 days are
  removed when the side panel opens.

Chrome extension storage is not a password vault. Anyone with sufficient access to your browser profile or device may be able to recover locally stored keys or content. Use scoped keys where providers support them, set spending limits, and rotate or revoke a key if the device or browser profile is compromised.

To remove data:

- delete individual saved notes in YouTube Digest;
- use the Options page to clear cached digests, delete all notes, or reset all extension data;
- remove the extension or clear its stored data from Chrome to delete all local settings, keys, notes, and cache entries; and
- revoke keys in the Supadata, DeepSeek, Anthropic, or OpenAI Console dashboard to stop their future use.

Clearing local data does not delete information already processed or retained by Supadata, DeepSeek, Anthropic, or OpenAI. Use each service's controls for service-side requests.

## Permissions

YouTube Digest uses Chrome permissions for these purposes:

- `sidePanel`: display the YouTube Digest interface beside YouTube.
- `storage`: store settings, keys, notes, and cached results locally.
- `tabs`: identify and interact with the active YouTube tab.
- `scripting`: coordinate the extension's YouTube page controls.
- YouTube host access: read the active video's URL and metadata and provide timestamp controls.
- Supadata host access: retrieve transcripts.
- DeepSeek host access: provide AI overviews, explanations, translation, and note polishing through DeepSeek V4 Flash when DeepSeek is the selected AI provider.
- OpenAI host access: provide overviews, explanations, translation, and note polishing when Codex is selected.
- Anthropic host access: provide AI overviews, explanations, translation, and note polishing through Claude Haiku 4.5 when Claude is the selected AI provider.

YouTube Digest does not use these permissions to monitor general browsing activity.

## No sale or advertising use

YouTube Digest does not sell personal information, build advertising profiles, or share data with data brokers. It does not include analytics SDKs.

## Changes

Privacy-relevant changes will be documented in this file and in the repository history. Review updates before installing a new version.

## Questions

This repository does not provide a public support or issue channel. Review this policy, the source code, and each provider's documentation before using the extension. For a vulnerability or accidental secret exposure, follow the private process in [SECURITY.md](SECURITY.md).

## Local video player

The local player reads only the video explicitly selected or dropped by the user, using a temporary browser object URL. It makes no network requests and does not send video content to any provider, save video files, or persist filenames or playback history. Object URLs are released when replacing or closing a video or leaving the page. Local playback needs no API credentials or extra host permissions.

## Baidu Netdisk preview

Host access to `https://pan.baidu.com/*` allows the content script to read standard video timing and accessible text tracks, and seek on request. It reads the page URL file identifier and title to associate notes with the correct video. It does not read cookies, bypass login, request private Baidu APIs, download videos, or send links to Supadata. Imported SRT/VTT and page captions are held in memory. User-triggered AI actions send relevant subtitle text and the video title to the selected AI provider. Notes, timestamps, and file identifiers are stored locally under baiduNotes keys; delete notes individually or use Reset extension data.
