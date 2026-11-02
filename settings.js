/**
 * Shared, non-secret configuration helpers.
 *
 * API keys are stored in chrome.storage.local by options.js. This file contains
 * defaults and validation only, so it is safe to publish.
 */
var YTD_SETTINGS = (() => {
  const STORAGE_KEY = "ytd_settings";

  // Each built-in provider has a fixed endpoint and model, same as the
  // original DeepSeek-only design. There are no user-facing Base URL or
  // Model fields; adding a provider means adding an entry here plus a
  // request/response pair in background.js.
  const PROVIDERS = Object.freeze({
    deepseek: Object.freeze({
      id: "deepseek",
      label: "DeepSeek V4 Flash",
      baseUrl: "https://api.deepseek.com",
      model: "deepseek-v4-flash",
    }),
    codex: Object.freeze({
      id: "codex",
      label: "OpenAI Codex (GPT-5.3-Codex)",
      baseUrl: "https://api.openai.com",
      model: "gpt-5.3-codex",
    }),
    claude: Object.freeze({
      id: "claude",
      label: "Claude Haiku 4.5",
      baseUrl: "https://api.anthropic.com",
      model: "claude-haiku-4-5-20251001",
    }),
  });
  const DEFAULT_PROVIDER = "deepseek";

  const DEFAULTS = Object.freeze({
    provider: DEFAULT_PROVIDER,
    aiApiKeys: Object.freeze({ deepseek: "", claude: "", codex: "" }),
    aiBaseUrl: PROVIDERS[DEFAULT_PROVIDER].baseUrl,
    aiModel: PROVIDERS[DEFAULT_PROVIDER].model,
    supadataApiKey: "",
  });

  function isLegacyCustom(input) {
    return !!input && input.provider === "custom";
  }

  function resolveProvider(input) {
    const candidate = input?.provider;
    return Object.hasOwn(PROVIDERS, candidate) ? candidate : DEFAULT_PROVIDER;
  }

  // Older stored settings kept a single top-level `aiApiKey` string, which
  // was always a DeepSeek key (DeepSeek was the only provider). Fold it into
  // the per-provider map so switching providers never discards a key.
  // Once that map exists, aiApiKey is only a derived active-provider value;
  // never migrate it back into DeepSeek on subsequent loads.
  function normalizeApiKeys(input) {
    const legacyKey =
      !isLegacyCustom(input) && !input?.aiApiKeys && typeof input?.aiApiKey === "string"
        ? input.aiApiKey.trim()
        : "";
    const storedKeys =
      input?.aiApiKeys && typeof input.aiApiKeys === "object"
        ? input.aiApiKeys
        : {};
    const keys = {};
    for (const providerId of Object.keys(PROVIDERS)) {
      const storedKey = storedKeys[providerId];
      keys[providerId] = typeof storedKey === "string" ? storedKey.trim() : "";
    }
    if (!keys.deepseek && legacyKey) {
      keys.deepseek = legacyKey;
    }
    return keys;
  }

  function normalize(input = {}) {
    const provider = resolveProvider(input);
    const aiApiKeys = normalizeApiKeys(input);
    const providerConfig = PROVIDERS[provider];
    return {
      provider,
      aiApiKeys,
      aiApiKey: aiApiKeys[provider],
      aiBaseUrl: providerConfig.baseUrl,
      aiModel: providerConfig.model,
      supadataApiKey:
        typeof input.supadataApiKey === "string"
          ? input.supadataApiKey.trim()
          : "",
    };
  }

  function migrateLegacyCustom(input = {}) {
    return {
      settings: normalize(input),
      migrated: isLegacyCustom(input),
    };
  }

  function aiEndpointUrl(providerId) {
    const resolvedProvider = Object.hasOwn(PROVIDERS, providerId)
      ? providerId
      : DEFAULT_PROVIDER;
    const providerConfig = PROVIDERS[resolvedProvider];
    if (resolvedProvider === "codex") return `${providerConfig.baseUrl}/v1/responses`;
    return resolvedProvider === "claude"
      ? `${providerConfig.baseUrl}/v1/messages`
      : `${providerConfig.baseUrl}/chat/completions`;
  }

  function canonicalYouTubeUrl(videoId) {
    const normalized = String(videoId || "").trim();
    if (!/^[A-Za-z0-9_-]{6,20}$/.test(normalized)) {
      throw new Error("Invalid YouTube video ID.");
    }
    return `https://www.youtube.com/watch?v=${normalized}`;
  }

  function panelPageForUrl(url, localPlayerUrl) {
    if (typeof url !== "string") return null;
    if (url.split(/[?#]/)[0] === localPlayerUrl) return "local-panel.html";
    if (url.startsWith("https://pan.baidu.com/")) return "baidu-panel.html";
    if (url.startsWith("https://www.youtube.com/")) return "sidepanel.html";
    return null;
  }

  return {
    panelPageForUrl,
    STORAGE_KEY,
    PROVIDERS,
    DEFAULT_PROVIDER,
    DEFAULTS,
    isLegacyCustom,
    normalize,
    migrateLegacyCustom,
    aiEndpointUrl,
    canonicalYouTubeUrl,
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = YTD_SETTINGS;
}
