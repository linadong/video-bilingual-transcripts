(() => {
  const $ = (id) => document.getElementById(id);
  const { parse, normalize, format } = YTD_SUBTITLES;
  let current = null, tabId = null, cues = [], selected = null, epoch = 0, busy = false, syncing = false;
  const notice = (text) => { $("status").textContent = text; };
  const noteKey = () => `baiduNotes:${current.videoId}`;
  function controls() {
    for (const id of ["read", "import", "save"]) $(id).disabled = !current || busy;
    for (const id of ["translate", "explain"]) $(id).disabled = !current || !selected || busy;
    $("analyze").disabled = !current || !cues.length || busy;
  }
  async function player(command = "state", extra = {}) {
    const result = await chrome.tabs.sendMessage(tabId, { action: "baiduPlayer", command, videoId: current?.videoId, ...extra });
    if (!result?.success) throw new Error(result?.error || "无法连接播放器");
    return result;
  }
  function clear() {
    epoch++; current = null; cues = []; selected = null;
    $("captions").replaceChildren(); $("notes").replaceChildren(); $("result").textContent = "导入字幕后，可生成摘要或解释。";
    $("count").textContent = ""; $("note").value = ""; notice("");
  }
  async function sync() {
    if (syncing) return;
    syncing = true;
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.url?.startsWith("https://pan.baidu.com/")) throw new Error("请切换到百度网盘视频标签页。");
      const result = await chrome.tabs.sendMessage(tab.id, { action: "baiduPlayer", command: "state" });
      if (!result?.success) throw new Error(result?.error || "未找到播放器");
      if (tabId !== tab.id || current?.videoId !== result.videoId) { clear(); tabId = tab.id; current = result; await renderNotes(); }
      current = result;
      $("title").textContent = result.title;
      $("connection").textContent = `已连接 · ${format(result.time)} / ${format(result.duration)}`;
    } catch (error) {
      if (current) clear();
      $("connection").textContent = /Receiving end|establish connection/.test(error.message) ? "请刷新百度网盘页面并开始播放，再重新打开侧栏。" : error.message;
    } finally { syncing = false; controls(); }
  }
  async function work(fn) {
    if (busy) return;
    busy = true; controls(); notice("正在处理…");
    try { await fn(); } catch (error) { notice(error.message); }
    finally { busy = false; controls(); }
  }
  function jump(time) { work(async () => { await player("seek", { time }); notice(""); }); }
  function timeButton(time) { const button = document.createElement("button"); button.textContent = format(time); button.addEventListener("click", () => jump(time)); return button; }
  function renderCues() {
    const fragment = document.createDocumentFragment();
    cues.forEach((cue) => {
      const row = document.createElement("div"); row.className = "cue" + (cue === selected ? " selected" : "");
      const text = document.createElement("button"); text.className = "text"; text.textContent = cue.text; text.setAttribute("aria-pressed", String(cue === selected));
      text.addEventListener("click", () => { selected = cue; renderCues(); controls(); });
      row.append(timeButton(cue.start), text);
      if (cue.translation) { const translated = document.createElement("p"); translated.className = "translation"; translated.textContent = cue.translation; row.append(translated); }
      fragment.append(row);
    });
    $("captions").replaceChildren(fragment); $("count").textContent = `${cues.length} 条`;
  }
  function setCues(value) { epoch++; cues = value; selected = cues[0] || null; $("result").textContent = "字幕已更新，可重新生成 AI 结果。"; renderCues(); controls(); }
  $("read").addEventListener("click", () => work(async () => {
    const version = epoch; const result = await player("captions"); if (version !== epoch) return;
    const parsed = normalize(result.cues || []);
    if (!parsed.length) throw new Error("未读取到可访问的字幕轨。请在网盘中开启字幕，或导入 SRT / VTT。画面内字幕无法直接读取。");
    setCues(parsed); notice(`已读取 ${cues.length} 条字幕。`);
  }));
  $("import").addEventListener("click", () => { $("file").value = ""; $("file").click(); });
  $("file").addEventListener("change", () => work(async () => {
    const version = epoch, file = $("file").files[0]; if (!file || !current) return;
    if (file.size > 2000000) throw new Error("请使用小于 2 MB 的字幕文件。");
    const parsed = parse(await file.text()); if (version !== epoch) return;
    setCues(parsed); notice(`已导入 ${cues.length} 条字幕。`);
  }));
  async function ai(message) {
    let timeout;
    try {
      const result = await Promise.race([chrome.runtime.sendMessage(message), new Promise((_, reject) => { timeout = setTimeout(() => reject(new Error("请求超时，请稍后重试。")), 125000); })]);
      if (!result?.success) throw new Error(result?.message || result?.error || "AI 请求失败，请检查设置中的密钥。");
      return result;
    } finally { clearTimeout(timeout); }
  }
  $("translate").addEventListener("click", () => work(async () => {
    if (!selected || !current) return;
    const version = epoch, cue = selected;
    const result = await ai({ action: "translateContent", contentType: "transcriptBatch", targetLanguage: "zh", videoTitle: current.title, content: { segments: [{ id: cue.id, text: cue.text }] } });
    if (version !== epoch) return;
    const translated = result.translatedContent?.segments?.find((s) => s.id === cue.id);
    if (!translated?.text) throw new Error("未获得有效翻译，请重试。");
    cue.translation = translated.text; renderCues(); notice("翻译完成。");
  }));
  $("explain").addEventListener("click", () => work(async () => {
    if (!selected || !current) return;
    const version = epoch, index = cues.indexOf(selected);
    const result = await ai({ action: "explainSelection", selectedText: selected.text, transcriptContext: cues.slice(Math.max(0, index - 2), index + 3).map((c) => c.text).join("\n"), videoTitle: current.title });
    if (version !== epoch) return;
    $("result").textContent = result.explanation; notice("解释完成。");
  }));
  $("analyze").addEventListener("click", () => work(async () => {
    if (!current || !cues.length) return;
    const version = epoch, transcriptText = cues.map((c) => `[${format(c.start)}] ${c.text}`).join("\n");
    if (transcriptText.length > 120000) throw new Error("字幕过长，请导入分段字幕后生成摘要。");
    const result = await ai({ action: "analyzeTranscript", transcriptText, videoTitle: current.title, channelName: "", videoDescription: "", videoDuration: current.duration || cues.at(-1).end });
    if (version !== epoch) return;
    $("result").replaceChildren();
    for (const chapter of result.analysis?.chapters || []) {
      const section = document.createElement("p"); const text = document.createElement("span"); text.textContent = ` ${chapter.title}\n${chapter.summary || ""}`;
      section.append(timeButton(chapter.timestampSeconds), text); $("result").append(section);
    }
    notice("摘要完成。");
  }));
  async function renderNotes() {
    const version = epoch, key = noteKey(); const data = await chrome.storage.local.get(key);
    if (version !== epoch) return;
    $("notes").replaceChildren();
    for (const note of data[key] || []) {
      const row = document.createElement("div"); row.className = "note";
      const text = document.createElement("p"); text.textContent = note.text;
      const remove = document.createElement("button"); remove.textContent = "删除";
      remove.addEventListener("click", () => work(async () => {
        const latest = await chrome.storage.local.get(key);
        await chrome.storage.local.set({ [key]: (latest[key] || []).filter((n) => n.id !== note.id) });
        if (version === epoch) await renderNotes(); notice("已删除笔记。");
      }));
      row.append(timeButton(note.time), text, remove); $("notes").append(row);
    }
  }
  $("save").addEventListener("click", () => work(async () => {
    if (!current) return;
    const text = $("note").value.trim(); if (!text) throw new Error("请先填写笔记内容。");
    const version = epoch, key = noteKey(), info = await player(); if (version !== epoch) return;
    const data = await chrome.storage.local.get(key);
    const notes = data[key] || []; if (notes.length >= 100) throw new Error("此视频已有 100 条笔记，请先删除部分笔记。");
    await chrome.storage.local.set({ [key]: [...notes, { id: crypto.randomUUID(), time: info.time, text }] });
    if (version !== epoch) return;
    $("note").value = ""; await renderNotes(); notice("笔记已保存在本机。");
  }));
  controls(); sync(); const timer = setInterval(sync, 1500);
  window.addEventListener("pagehide", () => clearInterval(timer));
})();
