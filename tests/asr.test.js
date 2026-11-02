const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizeChunks, srt, mono, timestamp } = require("../asr-utils.js");

test("Whisper chunk times map to video time and incomplete final timestamps are bounded", () => {
  assert.deepEqual(normalizeChunks([
    { timestamp: [0.5, 3], text: " Hello " },
    { timestamp: [4, null], text: "end" },
    { timestamp: [null, 5], text: "invalid" },
    { timestamp: [11, 12], text: "outside" },
  ], 60, 70), [
    { start: 60.5, end: 63, text: "Hello" },
    { start: 64, end: 70, text: "end" },
  ]);
});
test("SRT export preserves milliseconds and hour boundaries", () => {
  assert.equal(timestamp(3599.9998), "01:00:00,000");
  assert.equal(srt([{ start: 1.25, end: 3.5, text: "Hello\nworld" }]), "1\n00:00:01,250 --> 00:00:03,500\nHello\nworld\n");
});
test("stereo audio is averaged without doubling amplitude", () => {
  const result = mono({ length: 3, numberOfChannels: 2, getChannelData: (n) => n ? [1, 0, -1] : [1, 1, 1] });
  assert.deepEqual([...result], [1, 0.5, 0]);
});
