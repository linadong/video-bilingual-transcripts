(() => {
  const $ = (id) => document.getElementById(id);
  const { CACHE_NAME, mono, srt, timestamp } = YTD_ASR_UTILS;
  let file = null, worker = null, run = 0, busy = false, cues = [], audioContext = null;
  let activeIndex = -1;
  const status = (text) => { $("asrStatus").textContent = text; };
  function buttons() {
    $("asrDownload").disabled = busy;
    $("asrStart").disabled = busy || !file;
    $("asrCancel").disabled = !busy;
    $("asrDelete").disabled = busy;
    $("asrLanguage").disabled = busy;
    $("asrExport").disabled = !cues.length;
  }
  function stop() {
    run++; worker?.terminate(); worker = null;
    if (audioContext) { audioContext.close().catch(() => {}); audioContext = null; }
    busy = false; buttons();
  }
  function render() {
    const fragment = document.createDocumentFragment();
    cues.forEach((cue) => {
      const button = document.createElement("button"); button.className = "asr-cue";
      button.textContent = `${timestamp(cue.start).replace(",", ".")}  ${cue.text}`;
      button.addEventListener("click", () => { $("video").currentTime = cue.start; }); fragment.append(button);
    });
    $("asrCues").replaceChildren(fragment); activeIndex = -1; buttons();
  }
  function makeWorker(id, downloading) {
    if (!worker) worker = new Worker("asr-worker.mjs", { type: "module" });
    worker.onmessage = ({ data }) => {
      if (data.id !== run || id !== run) return;
      if (data.type === "progress") {
        status(`${downloading ? "下载 / 加载模型" : "加载本地模型"}：${data.file} ${Number.isFinite(data.progress) ? Math.round(data.progress) + "%" : ""}`);
      } else if (data.type === "ready") {
        busy = false; status("模型已就绪并缓存。可断网后生成字幕；清理浏览器缓存后需重新下载。");
      } else if (data.type === "partial" || data.type === "complete") {
        cues = data.cues; render(); $("asrProgress").value = data.type === "complete" ? 100 : data.progress;
        status(data.type === "complete" ? (cues.length ? `转录完成，共 ${cues.length} 条字幕。自动识别可能有误，请核对。` : "未识别到语音，请检查视频音轨和语言设置。") : `正在本机识别 ${data.progress}%，可以取消并导出已有字幕。`);
        if (data.type === "complete") busy = false;
      } else if (data.type === "error") {
        stop(); status(`${downloading ? "模型下载或加载失败，请检查网络与磁盘空间后重试。" : "本地转录失败；若未下载模型，请先点击下载。"} ${data.message}`);
      }
      buttons();
    };
    worker.onerror = () => { if (id === run) { stop(); status("识别线程启动失败，请重新加载扩展后重试。请确认安装包中的 vendor 文件夹完整。"); } };
    return worker;
  }
  $("asrDownload").addEventListener("click", () => {
    stop(); busy = true; buttons(); status("准备下载 Whisper Base 量化模型，主要权重约 77 MB…");
    makeWorker(run, true).postMessage({ id: run, type: "download" });
    navigator.storage?.persist?.().catch(() => {});
  });
  $("asrStart").addEventListener("click", async () => {
    if (!file || busy) return;
    stop(); const id = run, selected = file; busy = true; cues = []; render(); buttons(); $("asrProgress").value = 0;
    try {
      if (selected.size > 250 * 1024 * 1024) throw new Error("此版本支持最大 250 MB 视频，请先分段或压缩。");
      if ($("video").duration > 1800) throw new Error("此版本支持最长 30 分钟视频，请先分段。");
      status("正在本机解码音轨…");
      const ctx = new AudioContext({ sampleRate: 16000 }); audioContext = ctx;
      const bytes = await selected.arrayBuffer(); if (id !== run) return;
      let decoded;
      try { decoded = await ctx.decodeAudioData(bytes); }
      catch { throw new Error("浏览器无法解码该视频的音轨，请使用 H.264 视频 / AAC 音频的 MP4 或 WebM。"); }
      if (id !== run) return;
      if (decoded.duration > 1800 || decoded.sampleRate !== 16000) throw new Error("音轨过长或采样率不支持，请使用 30 分钟以内的视频。");
      const audio = mono(decoded); await ctx.close(); audioContext = null; if (id !== run) return;
      status("加载本地模型…");
      makeWorker(id, false).postMessage({ id, type: "transcribe", audio, language: $("asrLanguage").value }, [audio.buffer]);
    } catch (error) { if (id === run) { stop(); status(error.message); } }
  });
  $("asrCancel").addEventListener("click", () => { stop(); status("已取消。已有字幕可导出，重新开始会从头转录。"); });
  $("asrDelete").addEventListener("click", async () => {
    stop(); busy = true; buttons();
    try { await caches.delete(CACHE_NAME); status("已删除本地识别模型缓存。再次使用前请重新下载。"); }
    catch (error) { status(`删除失败：${error.message}`); }
    finally { busy = false; buttons(); }
  });
  $("asrExport").addEventListener("click", () => {
    if (!cues.length) return;
    const url = URL.createObjectURL(new Blob([srt(cues)], { type: "application/x-subrip;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = `${(file?.name || "subtitles").replace(/\.[^.]+$/, "")}.srt`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  $("video").addEventListener("timeupdate", () => {
    const time = $("video").currentTime;
    const index = cues.findIndex((cue) => cue.start <= time && time < cue.end);
    if (index === activeIndex) return;
    const children = $("asrCues").children;
    children[activeIndex]?.classList.remove("active"); children[index]?.classList.add("active"); activeIndex = index;
  });
  globalThis.YTD_LOCAL_ASR = { setFile(next) {
    stop(); file = next; cues = []; render(); $("asrProgress").value = 0;
    status(next ? "已选择视频。先下载模型，再生成字幕；转录期间音频不会上传。" : "请选择本地视频。首次使用需下载模型。"); buttons();
  } };
  window.addEventListener("pagehide", stop); buttons();
})();
