const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const subtitles = require("../subtitles.js");

test("SRT and VTT preserve time alignment, multiline content, and cue order", () => {
  const srt = '\uFEFF1\r\n00:00:12,500 --> 00:00:15,000\r\n<b>Hello</b>\r\nworld\r\n\r\n2\r\n00:00:02,000 --> 00:00:04,000\r\nEarlier';
  const cues = subtitles.parse(srt);
  assert.equal(cues[0].start, 2);
  assert.equal(cues[1].start, 12.5);
  assert.equal(cues[1].text, "Hello\nworld");
  const vtt = subtitles.parse("WEBVTT\n\nNOTE ignore\n\nfirst\n01:02.250 --> 01:05.000 align:start\nWelcome");
  assert.equal(vtt[0].start, 62.25);
  assert.equal(vtt[0].end, 65);
});

test("subtitle parser rejects malformed times, reversed ranges, and oversized imports", () => {
  for (const source of ["not subtitles", "00:99:00 --> 01:00:00\nBad", "00:05 --> 00:02\nReverse"]) assert.throws(() => subtitles.parse(source), /没有识别/);
  assert.throws(() => subtitles.parse("x".repeat(2000001)), /字幕过大/);
  assert.equal(subtitles.normalize([{ start: -1, end: 2, text: "x" }]).length, 0);
});

function adapter({ videos = [], href = "https://pan.baidu.com/s/example?fid=123&fpath=%2Fcourse%2Fwelcome.mp4" } = {}) {
  let listener;
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "../baidu-content.js"), "utf8"), {
    chrome: { runtime: { onMessage: { addListener(fn) { listener = fn; } } } },
    document: { title: "Baidu", querySelectorAll() { return videos; } },
    location: { href }, URL,
  });
  return (message) => { let result; listener({ action: "baiduPlayer", ...message }, {}, (value) => { result = value; }); return result; };
}
function video() { return { paused: false, duration: 100, currentTime: 12, getBoundingClientRect: () => ({ width: 800 }), textTracks: [{ mode: "showing", cues: [{ startTime: 1, endTime: 3, text: "Hello" }] }] }; }

test("Baidu adapter reads captions, validates identity, and clamps seeks", () => {
  const media = video(), send = adapter({ videos: [media] });
  const state = send({ command: "captions" });
  assert.equal(state.title, "welcome.mp4");
  assert.equal(state.time, 12);
  assert.equal(state.cues[0].text, "Hello");
  assert.equal(send({ command: "seek", videoId: "different", time: 30 }).success, false);
  assert.equal(media.currentTime, 12);
  assert.equal(send({ command: "seek", videoId: state.videoId, time: 500 }).success, true);
  assert.equal(media.currentTime, 100);
  assert.equal(send({ command: "seek", time: -1 }).success, false);
});

test("Baidu adapter reports inaccessible players and ambiguous file identity", () => {
  assert.match(adapter()({}).error, /未找到/);
  assert.match(adapter({ videos: [video()], href: "https://pan.baidu.com/disk/main" })({}).error, /缺少文件标识/);
});

test("Baidu panel imports captions, translates selected cue, summarizes, and saves current-time note", async () => {
  const elements = new Map(), stored = {}, messages = [];
  function node() { return { textContent: "", value: "", files: [], children: [], listeners: {},
    addEventListener(type, fn) { this.listeners[type] = fn; },
    replaceChildren(...children) { this.children = children; }, append(...children) { this.children.push(...children); },
    setAttribute() {}, click() {},
  }; }
  function get(id) { if (!elements.has(id)) elements.set(id, node()); return elements.get(id); }
  const info = { success: true, videoId: "baidu:test:123", title: "Welcome", time: 42, duration: 100, cues: [] };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "../baidu-panel.js"), "utf8"), {
    document: { getElementById: get, createElement: node, createDocumentFragment: node },
    window: { addEventListener() {} }, YTD_SUBTITLES: subtitles,
    setInterval() {}, clearInterval() {}, setTimeout, clearTimeout,
    crypto: { randomUUID: () => "note-1" },
    chrome: {
      tabs: { query: async () => [{ id: 1, url: "https://pan.baidu.com/s/test?fid=123" }], sendMessage: async () => info },
      storage: { local: { get: async (key) => ({ [key]: stored[key] }), set: async (data) => Object.assign(stored, data) } },
      runtime: { sendMessage: async (message) => {
        messages.push(message);
        if (message.action === "translateContent") return { success: true, translatedContent: { segments: [{ id: "cue-0", text: "你好" }] } };
        return { success: true, analysis: { chapters: [{ title: "Intro", timestampSeconds: 1, summary: "Welcome" }] } };
      } },
    },
  });
  const settle = () => new Promise((resolve) => setImmediate(resolve));
  await settle();
  get("file").files = [{ size: 100, text: async () => "1\n00:00:01,000 --> 00:00:03,000\nHello" }];
  get("file").listeners.change(); await settle();
  assert.equal(get("count").textContent, "1 条");
  assert.equal(get("translate").disabled, false);
  get("translate").listeners.click(); await settle();
  assert.equal(messages[0].content.segments[0].text, "Hello");
  assert.equal(get("status").textContent, "翻译完成。");
  get("analyze").listeners.click(); await settle();
  assert.match(messages[1].transcriptText, /\[0:01\] Hello/);
  assert.equal(get("result").children.length, 1);
  get("note").value = "My note";
  get("save").listeners.click(); await settle();
  assert.equal(stored["baiduNotes:baidu:test:123"][0].time, 42);
  assert.equal(stored["baiduNotes:baidu:test:123"][0].text, "My note");
});
