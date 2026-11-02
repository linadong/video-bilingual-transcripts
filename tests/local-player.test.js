const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function setup() {
  const elements = new Map();
  function element(id) {
    if (!elements.has(id)) elements.set(id, {
      listeners: {}, value: id === "speed" ? "1" : "", files: [],
      classList: { toggle() {}, add() {}, remove() {} },
      addEventListener(name, fn) { this.listeners[name] = fn; },
      pause() {}, load() {}, click() {}, removeAttribute(name) { delete this[name]; },
    });
    return elements.get(id);
  }
  const created = [], revoked = [], windowEvents = {};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "../local-player.js"), "utf8"), {
    document: { getElementById: element, addEventListener() {} },
    window: { addEventListener(name, fn) { windowEvents[name] = fn; } },
    URL: {
      createObjectURL(file) { created.push(file); return `blob:${created.length}`; },
      revokeObjectURL(url) { revoked.push(url); },
    },
  });
  function choose(name = "video.mp4", size = 1024, type = "video/mp4") {
    element("file").files = [{ name, size, type }];
    element("file").listeners.change();
  }
  return { element, choose, created, revoked, windowEvents };
}

test("local playback releases previous files on replacement, close, and page exit", () => {
  const { element, choose, created, revoked, windowEvents } = setup();
  choose();
  assert.equal(element("video").src, "blob:1");
  assert.equal(element("video").hidden, false);
  choose("second.webm");
  assert.deepEqual(revoked, ["blob:1"]);
  element("close").listeners.click();
  assert.deepEqual(revoked, ["blob:1", "blob:2"]);
  assert.equal(element("video").src, undefined);
  assert.equal(element("video").hidden, true);
  choose();
  windowEvents.pagehide();
  assert.equal(created.length, 3);
  assert.deepEqual(revoked, ["blob:1", "blob:2", "blob:3"]);
});

test("invalid files do not replace an active video and decode failures are actionable", () => {
  const { element, choose, created } = setup();
  choose();
  choose("document.txt", 20, "text/plain");
  assert.equal(created.length, 1);
  assert.equal(element("video").src, "blob:1");
  assert.match(element("status").textContent, /请选择/);
  choose("empty.mp4", 0);
  assert.equal(created.length, 1);
  element("video").listeners.error();
  assert.match(element("status").textContent, /H.264/);
  assert.equal(element("speed").disabled, true);
});

test("player clamps seeking to video duration and applies selected speed", () => {
  const { element, choose } = setup();
  choose("<video>.mp4");
  assert.equal(element("filename").textContent, "<video>.mp4");
  const video = element("video");
  video.duration = 25;
  video.currentTime = 2;
  element("back").listeners.click();
  assert.equal(video.currentTime, 0);
  video.currentTime = 22;
  element("forward").listeners.click();
  assert.equal(video.currentTime, 25);
  element("speed").value = "1.5";
  video.listeners.loadedmetadata();
  assert.equal(video.playbackRate, 1.5);
  assert.equal(element("speed").disabled, false);
});
