/* Local playback only: no network requests, credentials, or persistent files. */
(() => {
  const get = (id) => document.getElementById(id);
  const video = get("video");
  const picker = get("file");
  const status = get("status");
  const controls = [get("back"), get("forward"), get("speed")];
  let objectUrl = null;

  function setStatus(text, error = false) {
    status.textContent = text;
    status.classList.toggle("error", error);
  }

  function releaseVideo() {
    globalThis.YTD_LOCAL_ASR?.setFile(null);
    video.pause();
    video.removeAttribute("src");
    video.load();
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = null;
    controls.forEach((control) => { control.disabled = true; });
    get("close").disabled = true;
    video.hidden = true;
    get("empty").hidden = false;
    picker.value = "";
    get("filename").textContent = "尚未选择视频";
  }

  function openFile(file) {
    if (!file) return;
    if (!file.size || !(file.type.startsWith("video/") || /\.(mp4|webm|mov|m4v|mkv|avi|ogv)$/i.test(file.name))) {
      setStatus("请选择非空的视频文件，例如 MP4 或 WebM。", true);
      return;
    }
    releaseVideo();
    objectUrl = URL.createObjectURL(file);
    globalThis.YTD_LOCAL_ASR?.setFile(file);
    get("filename").textContent = file.name;
    get("empty").hidden = true;
    video.hidden = false;
    get("close").disabled = false;
    setStatus("正在读取本地视频…");
    video.src = objectUrl;
    video.load();
  }

  get("choose").addEventListener("click", () => { picker.value = ""; picker.click(); });
  picker.addEventListener("change", () => openFile(picker.files[0]));
  get("close").addEventListener("click", () => { releaseVideo(); setStatus("视频已关闭，可以选择另一个文件。"); });
  video.addEventListener("loadedmetadata", () => {
    if (!objectUrl) return;
    controls.forEach((control) => { control.disabled = false; });
    video.playbackRate = Number(get("speed").value);
    setStatus("已就绪，点击播放。视频仅在本机读取。");
  });
  video.addEventListener("error", () => {
    if (!objectUrl) return;
    controls.forEach((control) => { control.disabled = true; });
    setStatus("无法读取或播放此视频。请尝试 H.264 / AAC 编码的 MP4，或选择其他文件。", true);
  });
  get("speed").addEventListener("change", () => { video.playbackRate = Number(get("speed").value); });
  function seek(delta) {
    if (Number.isFinite(video.duration)) video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + delta));
  }
  get("back").addEventListener("click", () => seek(-10));
  get("forward").addEventListener("click", () => seek(10));
  // Prevent dropped files from navigating away from this extension page.
  document.addEventListener("dragover", (event) => { event.preventDefault(); });
  document.addEventListener("drop", (event) => { event.preventDefault(); });
  const dropzone = get("dropzone");
  dropzone.addEventListener("dragover", (event) => { event.preventDefault(); dropzone.classList.add("dragging"); });
  dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragging"));
  dropzone.addEventListener("drop", (event) => {
    event.preventDefault();
    dropzone.classList.remove("dragging");
    const files = event.dataTransfer?.files;
    if (files?.length !== 1) { setStatus("请每次拖入一个视频文件。", true); return; }
    openFile(files[0]);
  });
  window.addEventListener("pagehide", releaseVideo);
})();
