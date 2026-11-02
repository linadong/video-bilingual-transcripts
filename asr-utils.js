/* Pure audio/subtitle helpers shared by the page, worker and tests. */
globalThis.YTD_ASR_UTILS = (() => {
  const CACHE_NAME = "ytd-whisper-base-q8-1846881";
  function normalizeChunks(chunks, offset, duration) {
    return (chunks || []).flatMap((chunk) => {
      const [rawStart, rawEnd] = chunk.timestamp || [];
      if (typeof rawStart !== "number" || !Number.isFinite(rawStart)) return [];
      const start = Math.max(offset, offset + rawStart);
      const end = Math.min(duration, rawEnd == null ? duration : offset + rawEnd);
      const text = String(chunk.text || "").trim();
      return text && Number.isFinite(end) && start < end ? [{ start, end, text }] : [];
    });
  }
  function timestamp(seconds) {
    const ms = Math.max(0, Math.round(seconds * 1000));
    return `${String(Math.floor(ms / 3600000)).padStart(2, "0")}:${String(Math.floor(ms / 60000) % 60).padStart(2, "0")}:${String(Math.floor(ms / 1000) % 60).padStart(2, "0")},${String(ms % 1000).padStart(3, "0")}`;
  }
  function srt(cues) { return cues.map((cue, i) => `${i + 1}\n${timestamp(cue.start)} --> ${timestamp(cue.end)}\n${cue.text}\n`).join("\n"); }
  function mono(buffer) {
    const result = new Float32Array(buffer.length);
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < result.length; i++) result[i] += data[i] / buffer.numberOfChannels;
    }
    return result;
  }
  return { CACHE_NAME, normalizeChunks, timestamp, srt, mono };
})();
if (typeof module !== "undefined") module.exports = globalThis.YTD_ASR_UTILS;
