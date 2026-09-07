const $ = (id) => document.getElementById(id);

const DEFAULT_OPTS = {
  width: 1920,
  height: 1080,
  blur: 35,
  bgDim: 0.8,
  bgSat: 0.75,
  format: "jpg",
  quality: 90,
  mirror: false,
  preset: "free",

  watermarkEnabled: false,
  watermarkText: "BLURPAD",
  watermarkTopLine: true,
  watermarkBottomLine: true,
  watermarkColor: "#ffffff",
  watermarkOpacity: 0.8,
  watermarkScale: 100,
  watermarkX: 50,
  watermarkY: 50,
};

// UI refs
const langSelect = $("langSelect");
const btnPickFolder = $("btnPickFolder");
const btnRunBatch = $("btnRunBatch");
const folderInput = $("folderInput");
const dropFolder = $("dropFolder");
const folderPathEl = $("folderPath");
const batchCountEl = $("batchCount");

const w = $("w"), h = $("h");
const blur = $("blur"), blurVal = $("blurVal");
const dim = $("dim"), dimVal = $("dimVal");
const sat = $("sat"), satVal = $("satVal");
const format = $("format");
const quality = $("quality");
const btnReset = $("btnReset");

const sizePreset = $("sizePreset");
const mirror = $("mirror");

// Watermark refs
const watermarkEnabled = $("watermarkEnabled");
const watermarkText = $("watermarkText");
const watermarkTopLine = $("watermarkTopLine");
const watermarkBottomLine = $("watermarkBottomLine");
const watermarkColor = $("watermarkColor");
const watermarkOpacity = $("watermarkOpacity");
const watermarkOpacityVal = $("watermarkOpacityVal");
const watermarkScale = $("watermarkScale");
const watermarkScaleVal = $("watermarkScaleVal");
const watermarkX = $("watermarkX");
const watermarkY = $("watermarkY");
const watermarkXVal = $("watermarkXVal");
const watermarkYVal = $("watermarkYVal");
const watermarkControls = $("watermarkControls");
const watermarkDragHandle = $("watermarkDragHandle");

const previewDrop = $("previewDrop");
const previewImg = $("previewImg");
const previewEmpty = $("previewEmpty");
const imageInput = $("imageInput");
const btnExportOne = $("btnExportOne");
const previewHint = $("previewHint");

const barFill = $("barFill");
const current = $("current");
const done = $("done");
const total = $("total");
const ok = $("ok");
const fail = $("fail");
const log = $("log");

const btnPickBg = $("btnPickBg");
const btnClearBg = $("btnClearBg");
const bgInput = $("bgInput");
const bgName = $("bgName");

// State
let previewFile = null;
let batchFiles = [];
let bgFile = null;
let previewRefreshTimer = null;
let watermarkWasDragged = false;

const PRESETS = {
  free: null,
  fb_1_91_1: { w: 1200, h: 630 },
  ig_1_1:    { w: 1080, h: 1080 },
  ig_9_16:   { w: 1080, h: 1920 },
  ig_4_5:    { w: 1080, h: 1350 },
  ar_16_9:   { w: 1920, h: 1080 },
  ar_4_3:    { w: 1600, h: 1200 },
  ar_3_4:    { w: 1200, h: 1600 },
};

function clamp(n, min, max) {
  const v = Number(n);
  if (!Number.isFinite(v)) return min;
  return Math.max(min, Math.min(max, v));
}

function clampInt(n, min, max) {
  return Math.round(clamp(n, min, max));
}

function opts() {
  return {
    width: clampInt(w.value, 64, 8000) || DEFAULT_OPTS.width,
    height: clampInt(h.value, 64, 8000) || DEFAULT_OPTS.height,
    blur: Number(blur.value) || DEFAULT_OPTS.blur,
    bgDim: Number(dim.value) || DEFAULT_OPTS.bgDim,
    bgSat: Number(sat.value) || DEFAULT_OPTS.bgSat,
    format: String(format.value || DEFAULT_OPTS.format),
    quality: clampInt(quality.value, 1, 100) || DEFAULT_OPTS.quality,
    mirror: !!(mirror && mirror.checked),
    preset: (sizePreset && sizePreset.value) ? String(sizePreset.value) : DEFAULT_OPTS.preset,

    watermarkEnabled: !!(watermarkEnabled && watermarkEnabled.checked),
    watermarkText: String(watermarkText?.value ?? DEFAULT_OPTS.watermarkText),
    watermarkTopLine: !!(watermarkTopLine && watermarkTopLine.checked),
    watermarkBottomLine: !!(watermarkBottomLine && watermarkBottomLine.checked),
    watermarkColor: String(watermarkColor?.value || DEFAULT_OPTS.watermarkColor),
    watermarkOpacity: clamp(watermarkOpacity?.value ?? DEFAULT_OPTS.watermarkOpacity, 0, 1),
    watermarkScale: clamp(watermarkScale?.value ?? DEFAULT_OPTS.watermarkScale, 25, 250),
    watermarkX: clamp(watermarkX?.value ?? DEFAULT_OPTS.watermarkX, 0, 100),
    watermarkY: clamp(watermarkY?.value ?? DEFAULT_OPTS.watermarkY, 0, 100),
  };
}

function updateWatermarkReadouts() {
  if (watermarkOpacityVal && watermarkOpacity) watermarkOpacityVal.textContent = `${Math.round(Number(watermarkOpacity.value) * 100)}%`;
  if (watermarkScaleVal && watermarkScale) watermarkScaleVal.textContent = `${Math.round(Number(watermarkScale.value))}%`;
  if (watermarkXVal && watermarkX) watermarkXVal.textContent = `${Math.round(Number(watermarkX.value))}%`;
  if (watermarkYVal && watermarkY) watermarkYVal.textContent = `${Math.round(Number(watermarkY.value))}%`;
}

function updateWatermarkUiState() {
  const enabled = !!watermarkEnabled?.checked;
  if (watermarkControls) watermarkControls.classList.toggle("is-disabled", !enabled);
  [watermarkText, watermarkTopLine, watermarkBottomLine, watermarkColor, watermarkOpacity, watermarkScale, watermarkX, watermarkY]
    .filter(Boolean)
    .forEach((el) => { el.disabled = !enabled; });
  updateWatermarkDragHandle();
}

function applyDefaults() {
  w.value = DEFAULT_OPTS.width;
  h.value = DEFAULT_OPTS.height;
  blur.value = DEFAULT_OPTS.blur;
  dim.value = DEFAULT_OPTS.bgDim;
  sat.value = DEFAULT_OPTS.bgSat;
  format.value = DEFAULT_OPTS.format;
  quality.value = DEFAULT_OPTS.quality;

  if (sizePreset) sizePreset.value = DEFAULT_OPTS.preset;
  if (mirror) mirror.checked = DEFAULT_OPTS.mirror;

  if (watermarkEnabled) watermarkEnabled.checked = DEFAULT_OPTS.watermarkEnabled;
  if (watermarkText) watermarkText.value = DEFAULT_OPTS.watermarkText;
  if (watermarkTopLine) watermarkTopLine.checked = DEFAULT_OPTS.watermarkTopLine;
  if (watermarkBottomLine) watermarkBottomLine.checked = DEFAULT_OPTS.watermarkBottomLine;
  if (watermarkColor) watermarkColor.value = DEFAULT_OPTS.watermarkColor;
  if (watermarkOpacity) watermarkOpacity.value = DEFAULT_OPTS.watermarkOpacity;
  if (watermarkScale) watermarkScale.value = DEFAULT_OPTS.watermarkScale;
  if (watermarkX) watermarkX.value = DEFAULT_OPTS.watermarkX;
  if (watermarkY) watermarkY.value = DEFAULT_OPTS.watermarkY;

  blurVal.textContent = String(blur.value);
  dimVal.textContent = Number(dim.value).toFixed(2);
  satVal.textContent = Number(sat.value).toFixed(2);
  updateWatermarkReadouts();
  updateWatermarkUiState();
}

function setProgress(p) {
  total.textContent = String(p.total ?? 0);
  done.textContent = String(p.done ?? 0);
  ok.textContent = String(p.ok ?? 0);
  fail.textContent = String(p.fail ?? 0);
  current.textContent = p.current || "—";
  const pct = (p.total > 0) ? Math.round((p.done / p.total) * 100) : 0;
  barFill.style.width = `${pct}%`;
}

function logLine(s) {
  log.textContent += `${s}\n`;
  log.scrollTop = log.scrollHeight;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function getBaseName(file) {
  const name = file?.name || "image";
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(0, dot) : name;
}

function sanitizeName(s) {
  return String(s).replace(/[\\/:*?"<>|]/g, "_");
}

async function fileToImage(file) {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.decoding = "async";
  img.src = url;

  if (img.decode) {
    await img.decode().catch(() => {});
  } else {
    await new Promise((res, rej) => {
      img.onload = () => res();
      img.onerror = (e) => rej(e);
    });
  }

  img.__objectURL = url;
  return img;
}

function withMirror(ctx, enabled, tw, drawFn) {
  ctx.save();
  if (enabled) {
    ctx.translate(tw, 0);
    ctx.scale(-1, 1);
  }
  drawFn();
  ctx.restore();
}

let __CANVAS_FILTER_OK = null;

function detectCanvasFilterWorks() {
  if (__CANVAS_FILTER_OK !== null) return __CANVAS_FILTER_OK;

  try {
    const c = document.createElement("canvas");
    c.width = 64; c.height = 64;
    const x = c.getContext("2d", { willReadFrequently: true });
    if (!x) return (__CANVAS_FILTER_OK = false);

    x.fillStyle = "#000";
    x.fillRect(0, 0, 64, 64);
    x.fillStyle = "#fff";
    x.fillRect(32, 0, 32, 64);

    const before = x.getImageData(31, 32, 3, 1).data;
    x.clearRect(0, 0, 64, 64);

    x.filter = "blur(6px)";
    x.fillStyle = "#000";
    x.fillRect(0, 0, 64, 64);
    x.fillStyle = "#fff";
    x.fillRect(32, 0, 32, 64);

    const after = x.getImageData(31, 32, 3, 1).data;
    const diff = Math.abs(after[0] - before[0]) + Math.abs(after[4] - before[4]) + Math.abs(after[8] - before[8]);
    __CANVAS_FILTER_OK = diff > 5;
    return __CANVAS_FILTER_OK;
  } catch {
    return (__CANVAS_FILTER_OK = false);
  }
}

function applyBrightnessSaturationToCanvas(canvas, bright, satv) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = img.data;

  const b = Math.max(0, Number(bright) || 1);
  const s = Math.max(0, Number(satv) || 1);

  for (let i = 0; i < d.length; i += 4) {
    let r = d[i], g = d[i + 1], bl = d[i + 2];
    const gray = 0.2126 * r + 0.7152 * g + 0.0722 * bl;
    r = gray + (r - gray) * s;
    g = gray + (g - gray) * s;
    bl = gray + (bl - gray) * s;
    r *= b; g *= b; bl *= b;
    d[i] = r < 0 ? 0 : r > 255 ? 255 : r;
    d[i + 1] = g < 0 ? 0 : g > 255 ? 255 : g;
    d[i + 2] = bl < 0 ? 0 : bl > 255 ? 255 : bl;
  }

  ctx.putImageData(img, 0, 0);
}

function drawBlurredFallback(ctx, srcCanvas, tw, th, blurPx, mirrorOn) {
  const samples = 16;
  const radius = Math.max(0, Math.min(blurPx, 80)) / 2;
  if (radius <= 0) {
    withMirror(ctx, mirrorOn, tw, () => ctx.drawImage(srcCanvas, 0, 0));
    return;
  }

  ctx.save();
  ctx.globalAlpha = 1 / samples;
  for (let i = 0; i < samples; i++) {
    const ang = (i / samples) * Math.PI * 2;
    const dx = Math.cos(ang) * radius;
    const dy = Math.sin(ang) * radius;
    withMirror(ctx, mirrorOn, tw, () => ctx.drawImage(srcCanvas, dx, dy));
  }
  ctx.restore();
}

function drawWatermarkGroup(ctx, tw, th, o) {
  if (!o.watermarkEnabled) return;

  const text = String(o.watermarkText || "").trim();
  if (!text && !o.watermarkTopLine && !o.watermarkBottomLine) return;

  // Watermark values are defined against the selected output size. Preview rendering
  // uses a smaller canvas, so scale visual units to keep preview/output identical.
  const outputW = Math.max(1, Number(o.width) || tw);
  const outputH = Math.max(1, Number(o.height) || th);
  const previewScale = Math.min(tw / outputW, th / outputH);
  const groupScale = clamp(o.watermarkScale, 25, 250) / 100;
  const unit = previewScale * groupScale;

  const x = tw * (clamp(o.watermarkX, 0, 100) / 100);
  const y = th * (clamp(o.watermarkY, 0, 100) / 100);
  const fontSize = Math.max(8 * previewScale, 52 * unit);
  const lineWidth = Math.max(1, 2 * unit);
  const lineLength = Math.max(80 * previewScale, Math.min(outputW * 0.34, 720) * unit);
  const lineGap = Math.max(12 * previewScale, 30 * unit);
  const lineOffset = fontSize * 0.88 + lineGap;
  const opacity = clamp(o.watermarkOpacity, 0, 1);

  ctx.save();
  ctx.filter = "none";
  ctx.globalAlpha = opacity;
  ctx.strokeStyle = o.watermarkColor || "#ffffff";
  ctx.fillStyle = o.watermarkColor || "#ffffff";
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";
  ctx.font = `600 ${fontSize}px ui-sans-serif, system-ui, -apple-system, "Segoe UI", Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  if (o.watermarkTopLine) {
    ctx.beginPath();
    ctx.moveTo(x - lineLength / 2, y - lineOffset);
    ctx.lineTo(x + lineLength / 2, y - lineOffset);
    ctx.stroke();
  }

  if (text) ctx.fillText(text, x, y);

  if (o.watermarkBottomLine) {
    ctx.beginPath();
    ctx.moveTo(x - lineLength / 2, y + lineOffset);
    ctx.lineTo(x + lineLength / 2, y + lineOffset);
    ctx.stroke();
  }

  ctx.restore();
}

// === Core render: background cover + blur/dim/sat; foreground contain centered ===
function drawBlurPad(ctx, fgImg, bgImg, tw, th, o) {
  const blurPx = Math.max(0, Number(o.blur) || 0);
  const bright = Math.max(0.1, Number(o.bgDim) || 1);
  const satv = Math.max(0, Number(o.bgSat) || 1);
  const mirrorOn = !!o.mirror;

  const bgCanvas = document.createElement("canvas");
  bgCanvas.width = tw;
  bgCanvas.height = th;
  const bctx = bgCanvas.getContext("2d", { willReadFrequently: true });

  const biw = bgImg.width, bih = bgImg.height;
  const scaleCover = Math.max(tw / biw, th / bih);
  const bw = biw * scaleCover, bh = bih * scaleCover;
  const bx = (tw - bw) / 2;
  const by = (th - bh) / 2;

  bctx.clearRect(0, 0, tw, th);
  withMirror(bctx, mirrorOn, tw, () => bctx.drawImage(bgImg, bx, by, bw, bh));
  applyBrightnessSaturationToCanvas(bgCanvas, bright, satv);

  ctx.clearRect(0, 0, tw, th);
  const filterOK = detectCanvasFilterWorks();

  if (filterOK) {
    ctx.save();
    ctx.filter = `blur(${blurPx}px)`;
    withMirror(ctx, mirrorOn, tw, () => ctx.drawImage(bgCanvas, 0, 0));
    ctx.restore();
  } else {
    drawBlurredFallback(ctx, bgCanvas, tw, th, blurPx, false);
  }

  const fiw = fgImg.width, fih = fgImg.height;
  const scaleContain = Math.min(tw / fiw, th / fih);
  const fw = fiw * scaleContain, fh = fih * scaleContain;
  const fx = (tw - fw) / 2;
  const fy = (th - fh) / 2;

  ctx.save();
  ctx.filter = "none";
  withMirror(ctx, mirrorOn, tw, () => ctx.drawImage(fgImg, fx, fy, fw, fh));
  ctx.restore();

  // Watermark is always the top-most overlay and is never mirrored with the image.
  drawWatermarkGroup(ctx, tw, th, o);
}

async function renderToBlob(file, o, targetW, targetH, previewMode = false) {
  const fgImg = await fileToImage(file);
  const bgImg = bgFile ? await fileToImage(bgFile) : fgImg;

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d", { alpha: false });

  drawBlurPad(ctx, fgImg, bgImg, targetW, targetH, o);

  const fmt = (o.format === "png") ? "image/png" : "image/jpeg";
  const q = (fmt === "image/jpeg") ? clamp((o.quality || 90) / 100, 0.1, 1) : undefined;
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, fmt, q));
  if (!blob) throw new Error("toBlob failed");

  try { if (fgImg.__objectURL) URL.revokeObjectURL(fgImg.__objectURL); } catch {}
  try { if (bgImg !== fgImg && bgImg.__objectURL) URL.revokeObjectURL(bgImg.__objectURL); } catch {}

  return blob;
}

function updateWatermarkDragHandle() {
  if (!watermarkDragHandle || !previewDrop || !watermarkEnabled) return;
  const show = !!previewFile && watermarkEnabled.checked;
  watermarkDragHandle.hidden = !show;
  if (!show) return;

  const o = opts();
  watermarkDragHandle.style.left = `${o.watermarkX}%`;
  watermarkDragHandle.style.top = `${o.watermarkY}%`;
  watermarkDragHandle.style.width = `${Math.min(84, Math.max(18, 34 * o.watermarkScale / 100))}%`;
  watermarkDragHandle.style.height = `${Math.min(44, Math.max(12, 18 * o.watermarkScale / 100))}%`;
}

async function refreshPreview() {
  if (!previewFile) {
    updateWatermarkDragHandle();
    return;
  }

  previewEmpty.style.display = "block";
  previewEmpty.textContent = window.i18n?.t?.("rendering_preview") || "Rendering preview...";
  previewImg.style.display = "none";
  btnExportOne.disabled = true;

  try {
    const o = opts();
    previewDrop.style.aspectRatio = `${o.width} / ${o.height}`;

    const pw = 960;
    const ph = Math.max(1, Math.round(pw * (o.height / o.width)));
    const blob = await renderToBlob(previewFile, o, pw, ph, true);

    const url = URL.createObjectURL(blob);
    previewImg.onload = () => URL.revokeObjectURL(url);
    previewImg.src = url;
    previewImg.style.display = "block";
    previewEmpty.style.display = "none";
    btnExportOne.disabled = false;
    updateWatermarkDragHandle();
  } catch (e) {
    previewEmpty.textContent = `Preview failed: ${e.message}`;
  }
}

function schedulePreview(delay = 80) {
  clearTimeout(previewRefreshTimer);
  previewRefreshTimer = setTimeout(() => { refreshPreview(); }, delay);
}

function wireDrop(el, onDropFile) {
  ["dragenter", "dragover"].forEach(ev => {
    el.addEventListener(ev, (e) => {
      e.preventDefault();
      e.stopPropagation();
      el.classList.add("hover");
    });
  });
  ["dragleave", "drop"].forEach(ev => {
    el.addEventListener(ev, (e) => {
      e.preventDefault();
      e.stopPropagation();
      el.classList.remove("hover");
    });
  });
  el.addEventListener("drop", (e) => {
    const f = e.dataTransfer?.files?.[0];
    if (!f) return;
    onDropFile(f, e.dataTransfer);
  });
}

function isImageFile(file) {
  return /^image\//.test(file.type) || /\.(jpg|jpeg|png|webp)$/i.test(file.name);
}

function setBatch(files, folderLabel = "") {
  batchFiles = (files || []).filter(isImageFile);
  batchCountEl.textContent = String(batchFiles.length);
  folderPathEl.textContent = folderLabel || (batchFiles.length ? "（已選擇）" : "（尚未選擇）");
  btnRunBatch.disabled = batchFiles.length === 0;
}

function applyPreset(key) {
  const p = PRESETS[key];
  if (!p) return;
  w.value = p.w;
  h.value = p.h;
  blurVal.textContent = String(blur.value);
  dimVal.textContent = Number(dim.value).toFixed(2);
  satVal.textContent = Number(sat.value).toFixed(2);
}

if (sizePreset) {
  sizePreset.addEventListener("change", async () => {
    applyPreset(sizePreset.value);
    await refreshPreview();
  });
}

[w, h].forEach(el => {
  el.addEventListener("input", () => {
    if (sizePreset) sizePreset.value = "free";
  });
});

// === Events ===
blur.addEventListener("input", () => blurVal.textContent = blur.value);
dim.addEventListener("input", () => dimVal.textContent = Number(dim.value).toFixed(2));
sat.addEventListener("input", () => satVal.textContent = Number(sat.value).toFixed(2));

[w, h, blur, dim, sat, format, quality].forEach(el => {
  el.addEventListener("input", refreshPreview);
  el.addEventListener("change", refreshPreview);
});

if (mirror) mirror.addEventListener("change", refreshPreview);

if (watermarkEnabled) {
  watermarkEnabled.addEventListener("change", () => {
    updateWatermarkUiState();
    refreshPreview();
  });
}

[watermarkText, watermarkTopLine, watermarkBottomLine, watermarkColor].filter(Boolean).forEach(el => {
  el.addEventListener("input", () => schedulePreview());
  el.addEventListener("change", () => refreshPreview());
});

[watermarkOpacity, watermarkScale, watermarkX, watermarkY].filter(Boolean).forEach(el => {
  el.addEventListener("input", () => {
    updateWatermarkReadouts();
    updateWatermarkDragHandle();
    schedulePreview();
  });
  el.addEventListener("change", () => refreshPreview());
});

// Drag the watermark group directly inside the preview.
if (watermarkDragHandle) {
  let dragging = false;

  watermarkDragHandle.addEventListener("pointerdown", (e) => {
    if (!watermarkEnabled?.checked) return;
    dragging = true;
    watermarkWasDragged = false;
    watermarkDragHandle.classList.add("dragging");
    watermarkDragHandle.setPointerCapture?.(e.pointerId);
    e.preventDefault();
    e.stopPropagation();
  });

  watermarkDragHandle.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const rect = previewDrop.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const xPct = clamp(((e.clientX - rect.left) / rect.width) * 100, 0, 100);
    const yPct = clamp(((e.clientY - rect.top) / rect.height) * 100, 0, 100);
    watermarkX.value = xPct.toFixed(1);
    watermarkY.value = yPct.toFixed(1);
    watermarkWasDragged = true;
    updateWatermarkReadouts();
    updateWatermarkDragHandle();
    schedulePreview(110);
    e.preventDefault();
    e.stopPropagation();
  });

  const endDrag = (e) => {
    if (!dragging) return;
    dragging = false;
    watermarkDragHandle.classList.remove("dragging");
    try { watermarkDragHandle.releasePointerCapture?.(e.pointerId); } catch {}
    refreshPreview();
    e.preventDefault();
    e.stopPropagation();
  };

  watermarkDragHandle.addEventListener("pointerup", endDrag);
  watermarkDragHandle.addEventListener("pointercancel", endDrag);
  watermarkDragHandle.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
  });
}

btnReset.addEventListener("click", async () => {
  applyDefaults();
  logLine(window.i18n?.t?.("reset_done") || "Reset to default.");
  if (previewFile) await refreshPreview();
});

window.i18n.applyI18n();
langSelect.value = localStorage.getItem("lang") || "zh-TW";
langSelect.addEventListener("change", (e) => window.i18n.setLang(e.target.value));

wireDrop(previewDrop, async (f) => {
  if (!isImageFile(f)) return;
  previewFile = f;
  await refreshPreview();
});

previewDrop.addEventListener("click", () => {
  if (watermarkWasDragged) {
    watermarkWasDragged = false;
    return;
  }
  imageInput.click();
});

imageInput.addEventListener("change", async () => {
  const f = imageInput.files?.[0];
  if (!f) return;
  previewFile = f;
  await refreshPreview();
});

btnExportOne.addEventListener("click", async () => {
  if (!previewFile) return;

  const o = opts();
  setProgress({ total: 1, done: 0, ok: 0, fail: 0, current: previewFile.name });
  logLine(`${window.i18n?.t?.("exporting") || "Exporting..."} ${previewFile.name}`);

  try {
    const blob = await renderToBlob(previewFile, o, o.width, o.height, false);
    const base = sanitizeName(getBaseName(previewFile));
    const filename = `${base}_${o.width}x${o.height}.${o.format}`;
    downloadBlob(blob, filename);
    setProgress({ total: 1, done: 1, ok: 1, fail: 0, current: previewFile.name });
    logLine(`${window.i18n?.t?.("export_done") || "Done."} ${filename}`);
  } catch (e) {
    setProgress({ total: 1, done: 1, ok: 0, fail: 1, current: previewFile.name });
    logLine(`❌ ${String(e?.message || e)}`);
  }
});

btnPickFolder.addEventListener("click", () => folderInput.click());
folderInput.addEventListener("change", () => {
  const files = Array.from(folderInput.files || []);
  const first = files[0];
  const folderLabel = first?.webkitRelativePath ? first.webkitRelativePath.split("/")[0] : "（已選擇）";
  setBatch(files, folderLabel);
});

btnPickBg.addEventListener("click", () => bgInput.click());

bgInput.addEventListener("change", async () => {
  const f = bgInput.files?.[0];
  if (!f) return;
  bgFile = f;
  bgName.textContent = f.name;
  btnClearBg.disabled = false;
  await refreshPreview();
});

btnClearBg.addEventListener("click", async () => {
  bgFile = null;
  bgName.textContent = window.i18n?.t?.("use_ori") || "（使用原圖）";
  btnClearBg.disabled = true;
  bgInput.value = "";
  await refreshPreview();
});

wireDrop(dropFolder, (f, dt) => {
  const files = Array.from(dt?.files || []);
  if (files.length) {
    const first = files[0];
    const folderLabel = first?.webkitRelativePath ? first.webkitRelativePath.split("/")[0] : "（已拖曳）";
    setBatch(files, folderLabel);
  } else {
    logLine("⚠️ Browser blocked folder drop. Use ‘Select Folder’ instead.");
  }
});

btnRunBatch.addEventListener("click", async () => {
  if (!batchFiles.length) return;

  const o = opts();
  const zip = new JSZip();

  let doneN = 0, okN = 0, failN = 0;
  setProgress({ total: batchFiles.length, done: 0, ok: 0, fail: 0, current: "" });
  logLine(`Batch start: ${batchFiles.length} files`);

  for (const file of batchFiles) {
    try {
      setProgress({ total: batchFiles.length, done: doneN, ok: okN, fail: failN, current: file.name });
      const blob = await renderToBlob(file, o, o.width, o.height, false);
      const base = sanitizeName(getBaseName(file));
      const filename = `${base}_${o.width}x${o.height}.${o.format}`;
      zip.file(filename, blob);
      okN++;
      logLine(`✓ ${file.name}`);
    } catch (e) {
      failN++;
      logLine(`✗ ${file.name} (${String(e?.message || e)})`);
    } finally {
      doneN++;
      setProgress({ total: batchFiles.length, done: doneN, ok: okN, fail: failN, current: file.name });
      await new Promise(r => setTimeout(r, 0));
    }
  }

  logLine("Zipping...");
  const zipBlob = await zip.generateAsync({ type: "blob" });
  const zipName = `BlurPad_${o.width}x${o.height}_${Date.now()}.zip`;
  downloadBlob(zipBlob, zipName);
  logLine(`ZIP ready: ${zipName}`);
});

applyDefaults();
setProgress({ total: 0, done: 0, ok: 0, fail: 0, current: "" });

(function initAdDock(){
  const dock = document.getElementById("adDock");
  const btnCollapse = document.getElementById("adCollapse");
  const btnPill = document.getElementById("adPill");
  if(!dock || !btnCollapse || !btnPill) return;

  const KEY = "blurpad_ad_state";

  function setState(state){
    dock.dataset.state = state;
    localStorage.setItem(KEY, state);
  }

  const saved = localStorage.getItem(KEY);
  if(saved === "collapsed") setState("collapsed");
  else setState("open");

  btnCollapse.addEventListener("click", () => setState("collapsed"));
  btnPill.addEventListener("click", () => setState("open"));
})();
