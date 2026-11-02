const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

test("opening local video hides old results without querying another YouTube tab", async () => {
  const nodes = new Map(), queries = [], redirects = [], listeners = { addListener() {} };
  const local = "chrome-extension://test/local-player.html";
  const context = vm.createContext({
    console, URL, setTimeout, clearTimeout, setInterval, clearInterval,
    IntersectionObserver: class {}, CSS: { escape: (x) => x },
    window: { getSelection: () => null, close() {}, location: { replace(url) { redirects.push(url); } } },
    document: {
      addEventListener() {}, querySelectorAll: () => [], querySelector: () => null,
      getElementById(id) {
        if (!nodes.has(id)) nodes.set(id, { style: { display: "block" }, classList: { remove() {}, toggle() {} } });
        return nodes.get(id);
      },
    },
    chrome: {
      runtime: { onMessage: listeners, getURL: (name) => `chrome-extension://test/${name}`, sendMessage() { throw new Error("Must not request YouTube data"); } },
      windows: { getCurrent: async () => ({ id: 1 }) },
      tabs: { onUpdated: listeners, onActivated: listeners, query: async (query) => { queries.push(query); return [{ id: 2, url: local }]; } },
    },
    YTD_SETTINGS: require("../settings.js"),
  });
  vm.runInContext(fs.readFileSync(path.join(__dirname, "../sidepanel.js"), "utf8"), context);
  await vm.runInContext('currentVideoId = "old-youtube"; currentAnalysis = {}; checkCurrentTab()', context);
  assert.equal(queries.length, 1);
  assert.equal(queries[0].currentWindow, true);
  assert.equal(nodes.get("resultsState").style.display, "none");
  assert.equal(nodes.get("tabsNav").style.display, "none");
  assert.deepEqual(redirects, ["chrome-extension://test/local-panel.html"]);
  assert.equal(vm.runInContext("currentVideoId", context), null);
});
