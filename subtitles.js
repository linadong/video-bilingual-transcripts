var YTD_SUBTITLES = (() => {
  function timestamp(value) {
    const parts = value.replace(",", ".").split(":").map(Number);
    if (parts.length < 2 || parts.length > 3 || parts.some((p) => !Number.isFinite(p) || p < 0) || parts.at(-1) >= 60 || (parts.length === 3 && parts[1] >= 60)) return NaN;
    return parts.reduce((sum, part) => sum * 60 + part, 0);
  }
  function clean(text) { return String(text).replace(/<[^>]*>/g, "").trim(); }
  function normalize(cues) {
    return cues.map((cue) => ({ start: Number(cue.start), end: Number(cue.end), text: clean(cue.text || "") }))
      .filter((cue) => Number.isFinite(cue.start) && cue.start >= 0 && Number.isFinite(cue.end) && cue.end > cue.start && cue.text)
      .sort((a, b) => a.start - b.start).map((cue, i) => ({ ...cue, id: `cue-${i}` }));
  }
  function parse(source) {
    if (source.length > 2000000) throw new Error("字幕过大，请使用小于 2 MB 的字幕。");
    const cues = [];
    for (const block of source.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n").split(/\n[ \t]*\n/)) {
      if (/^(WEBVTT|NOTE|STYLE|REGION)\b/.test(block.trim())) continue;
      const lines = block.trim().split("\n");
      const index = lines.findIndex((line) => line.includes("-->"));
      if (index < 0) continue;
      const match = lines[index].match(/^\s*(\S+)\s+-->\s+(\S+)/);
      if (!match) continue;
      cues.push({ start: timestamp(match[1]), end: timestamp(match[2]), text: lines.slice(index + 1).join("\n") });
    }
    const result = normalize(cues);
    if (!result.length) throw new Error("没有识别到有效字幕，请导入 UTF-8 编码的 SRT 或 VTT 文件。");
    if (result.length > 10000) throw new Error("字幕条目过多，最多支持 10000 条。");
    return result;
  }
  function format(seconds) { const n = Math.max(0, Math.floor(seconds || 0)); return `${Math.floor(n / 60)}:${String(n % 60).padStart(2, "0")}`; }
  return { parse, normalize, format };
})();
if (typeof module !== "undefined") module.exports = YTD_SUBTITLES;
