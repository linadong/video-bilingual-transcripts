const test = require("node:test");
const assert = require("node:assert/strict");

const settings = require("../settings.js");

test("DeepSeek defaults use V4 Flash", () => {
  const normalized = settings.normalize({
    provider: "unexpected",
    aiApiKey: "  example-key  ",
    aiBaseUrl: "https://api.example.com/v1",
    aiModel: "example-model",
    supadataApiKey: "  example-supadata  ",
  });

  assert.equal(normalized.provider, "deepseek");
  assert.equal(normalized.aiBaseUrl, "https://api.deepseek.com");
  assert.equal(normalized.aiModel, "deepseek-v4-flash");
  assert.equal(normalized.aiApiKey, "example-key");
  assert.equal(normalized.supadataApiKey, "example-supadata");
  assert.equal(
    settings.aiEndpointUrl("deepseek"),
    "https://api.deepseek.com/chat/completions",
  );
});

test("Claude provider resolves its own fixed endpoint and model", () => {
  const normalized = settings.normalize({
    provider: "claude",
    aiApiKeys: { claude: "  claude-key  " },
    supadataApiKey: "example-supadata",
  });

  assert.equal(normalized.provider, "claude");
  assert.equal(normalized.aiBaseUrl, "https://api.anthropic.com");
  assert.equal(normalized.aiModel, "claude-haiku-4-5-20251001");
  assert.equal(normalized.aiApiKey, "claude-key");
  assert.equal(
    settings.aiEndpointUrl("claude"),
    "https://api.anthropic.com/v1/messages",
  );
  // An unknown provider id falls back to the default provider's endpoint.
  assert.equal(
    settings.aiEndpointUrl("unexpected"),
    settings.aiEndpointUrl(settings.DEFAULT_PROVIDER),
  );
});

test("switching providers keeps each provider's key isolated", () => {
  const withDeepSeekKey = settings.normalize({
    provider: "deepseek",
    aiApiKeys: { deepseek: "deepseek-secret" },
  });
  assert.equal(withDeepSeekKey.aiApiKey, "deepseek-secret");
  assert.equal(withDeepSeekKey.aiApiKeys.claude, "");

  // Switching the active provider must not discard the other provider's key.
  const switchedToClaude = settings.normalize({
    provider: "claude",
    aiApiKeys: withDeepSeekKey.aiApiKeys,
  });
  assert.equal(switchedToClaude.aiApiKey, "");
  assert.equal(switchedToClaude.aiApiKeys.deepseek, "deepseek-secret");

  const bothConfigured = settings.normalize({
    provider: "claude",
    aiApiKeys: { ...switchedToClaude.aiApiKeys, claude: "claude-secret" },
  });
  assert.equal(bothConfigured.aiApiKey, "claude-secret");
  assert.equal(bothConfigured.aiApiKeys.deepseek, "deepseek-secret");
  assert.equal(bothConfigured.aiApiKeys.claude, "claude-secret");
});

test("legacy custom migration clears only the AI key and is idempotent", () => {
  const legacy = {
    provider: "custom",
    aiApiKey: "custom-secret",
    aiBaseUrl: "https://api.example.com/v1",
    aiModel: "example-model",
    supadataApiKey: " supadata-secret ",
  };
  const first = settings.migrateLegacyCustom(legacy);

  assert.equal(first.migrated, true);
  assert.equal(first.settings.provider, "deepseek");
  assert.equal(first.settings.aiBaseUrl, settings.PROVIDERS.deepseek.baseUrl);
  assert.equal(first.settings.aiModel, settings.PROVIDERS.deepseek.model);
  assert.equal(first.settings.aiApiKey, "");
  assert.equal(first.settings.supadataApiKey, "supadata-secret");

  const second = settings.migrateLegacyCustom(first.settings);
  assert.equal(second.migrated, false);
  assert.deepEqual(second.settings, first.settings);

  const configuredDeepSeek = settings.normalize({
    ...first.settings,
    aiApiKeys: { deepseek: "new-deepseek-key" },
  });
  assert.equal(configuredDeepSeek.aiApiKey, "new-deepseek-key");
});

test("a pre-multi-provider single aiApiKey string migrates into aiApiKeys.deepseek", () => {
  const legacySingleKey = {
    provider: "deepseek",
    aiApiKey: "old-single-key-format",
    supadataApiKey: "supadata-secret",
  };

  const normalized = settings.normalize(legacySingleKey);

  assert.equal(normalized.aiApiKey, "old-single-key-format");
  assert.equal(normalized.aiApiKeys.deepseek, "old-single-key-format");
  assert.equal(normalized.aiApiKeys.claude, "");
});

test("Supadata receives a canonical YouTube URL", () => {
  assert.equal(
    settings.canonicalYouTubeUrl("ydTeb_I0b94"),
    "https://www.youtube.com/watch?v=ydTeb_I0b94",
  );
  assert.throws(
    () => settings.canonicalYouTubeUrl('"><script>'),
    /Invalid YouTube video ID/,
  );
});


test("Codex uses Responses and preserves provider key isolation on reload", () => {
  const codex = settings.normalize({ provider: "codex", aiApiKeys: { codex: " codex-key " } });
  assert.equal(codex.aiModel, "gpt-5.3-codex");
  assert.equal(settings.aiEndpointUrl("codex"), "https://api.openai.com/v1/responses");
  assert.equal(codex.aiApiKey, "codex-key");
  const reloaded = settings.normalize(codex);
  assert.equal(reloaded.aiApiKeys.deepseek, "");
  const switched = settings.normalize({ ...reloaded, provider: "deepseek" });
  assert.equal(switched.aiApiKey, "");
  assert.equal(switched.aiApiKeys.codex, "codex-key");
});

test("panel routing isolates local playback, Baidu, and YouTube", () => {
  const local = "chrome-extension://test/local-player.html";
  assert.equal(settings.panelPageForUrl(local, local), "local-panel.html");
  assert.equal(settings.panelPageForUrl(local + "?x=1", local), "local-panel.html");
  assert.equal(settings.panelPageForUrl("https://www.youtube.com/watch?v=123", local), "sidepanel.html");
  assert.equal(settings.panelPageForUrl("https://pan.baidu.com/s/test?fid=123", local), "baidu-panel.html");
  for (const url of [undefined, "https://www.youtube.com.example.com/watch?v=123", "https://example.com", "chrome-extension://other/local-player.html"]) {
    assert.equal(settings.panelPageForUrl(url, local), null);
  }
});
