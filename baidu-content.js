/* Uses only the page's standard media interface, never private Baidu APIs. */
(() => {
  chrome.runtime.onMessage.addListener((message, sender, reply) => {
    if (message.action !== "baiduPlayer") return;
    try {
      const players = [...document.querySelectorAll("video")].filter((v) => v.getBoundingClientRect().width > 0);
      const video = players.find((v) => !v.paused) || players[0];
      if (!video) throw new Error("未找到可访问的视频播放器，请先在百度网盘打开视频并开始播放。嵌入式或非标准播放器可能暂不支持。");
      const url = new URL(location.href);
      const fileId = url.searchParams.get("fid") || url.searchParams.get("fsid");
      const filePath = url.searchParams.get("fpath") || url.searchParams.get("path");
      const title = filePath?.split("/").pop() || document.title;
      if (!fileId && !filePath) throw new Error("当前网址缺少文件标识，请打开具体视频的分享播放页。");
      const videoId = `baidu:${url.pathname}:${fileId || filePath}`;
      if (message.videoId && message.videoId !== videoId) throw new Error("播放视频已更换，请重新选择字幕或笔记。");
      if (message.command === "seek") {
        const time = Number(message.time);
        if (!Number.isFinite(time) || time < 0 || !Number.isFinite(video.duration)) throw new Error("视频尚未就绪，无法跳转。");
        video.currentTime = Math.min(time, video.duration);
      }
      let cues = [];
      if (message.command === "captions") {
        const tracks = [...video.textTracks];
        const track = tracks.find((t) => t.mode === "showing" && t.cues?.length) || tracks.find((t) => t.cues?.length);
        if (track) cues = [...track.cues].slice(0, 10000).map((cue) => ({ start: cue.startTime, end: cue.endTime, text: cue.text }));
      }
      reply({ success: true, videoId, title, time: video.currentTime, duration: Number.isFinite(video.duration) ? video.duration : 0, cues });
    } catch (error) { reply({ success: false, error: error.message }); }
  });
})();
