import { pipeline, env } from "./vendor/transformers/transformers.mjs";
import "./asr-utils.js";

const { CACHE_NAME, normalizeChunks } = globalThis.YTD_ASR_UTILS;
env.useBrowserCache = false;
env.useCustomCache = true;
env.customCache = await caches.open(CACHE_NAME);
env.backends.onnx.wasm.wasmPaths = new URL("./vendor/transformers/", import.meta.url).href;
env.backends.onnx.wasm.numThreads = 1;
env.backends.onnx.wasm.proxy = false;
let recognizer = null;
let busy = false;

async function load(download, id) {
  if (recognizer) return recognizer;
  env.allowLocalModels = !download;
  env.allowRemoteModels = download;
  recognizer = await pipeline("automatic-speech-recognition", "onnx-community/whisper-base", {
    revision: "1846881", dtype: "q8", device: "wasm", local_files_only: !download,
    progress_callback: (progress) => self.postMessage({ id, type: "progress", file: progress.file || "", progress: progress.progress, status: progress.status }),
  });
  return recognizer;
}
self.onmessage = async ({ data }) => {
  const { id, type, audio, language } = data;
  if (busy) return;
  busy = true;
  try {
    const model = await load(type === "download", id);
    if (type === "download") { self.postMessage({ id, type: "ready" }); return; }
    if (!(audio instanceof Float32Array) || !audio.length || audio.length > 16000 * 1800) throw new Error("音频为空或超过 30 分钟限制。");
    const duration = audio.length / 16000;
    // One minute at a time bounds intermediate tensors. Within each block,
    // Whisper's overlapping 30-second windows preserve sentence boundaries.
    const cues = [];
    for (let start = 0; start < audio.length; start += 16000 * 60) {
      const samples = audio.subarray(start, Math.min(start + 16000 * 60, audio.length));
      let energy = 0;
      for (const sample of samples) energy += sample * sample;
      if (Math.sqrt(energy / samples.length) > 0.0001) {
        const options = { return_timestamps: true, chunk_length_s: 30, stride_length_s: 5, task: "transcribe", ...(language === "auto" ? {} : { language }) };
        const result = await model(samples, options);
        cues.push(...normalizeChunks(result.chunks, start / 16000, Math.min((start + samples.length) / 16000, duration)));
      }
      self.postMessage({ id, type: "partial", cues: [...cues], progress: Math.min(100, Math.round((start + samples.length) / audio.length * 100)) });
    }
    self.postMessage({ id, type: "complete", cues });
  } catch (error) {
    self.postMessage({ id, type: "error", message: error.message });
  } finally { busy = false; }
};
