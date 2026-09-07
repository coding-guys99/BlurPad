const I18N = {
  "zh-TW": {
    app_title: "BlurPad",
    app_subtitle: "同圖雙層：背景 Blur、前景置中",

    lang_zhTW: "繁體中文",
    lang_en: "English",

    batch_title: "批次處理",
    optional: "選用",
    batch_desc: "用於一次處理整個資料夾\n一般情況請使用右側「即時預覽」",
    batch_drop: "拖曳資料夾到這裡",
    batch_hint: "或使用右上角按鈕",
    batch_pick: "選擇資料夾",
    run_batch: "批次輸出 ZIP",
    batch_folder: "資料夾",
    no_select: "（尚未選擇）",
    batch_count: "數量",
    batch_output: "輸出",
    batch_output_desc: "打包成 ZIP 下載",

    params_title: "參數",
    bg_option: "背景圖（可選）",
    clear: "清除",
    select_bg: "選擇背景圖",
    use_ori: "使用原圖",
    custom: "自訂",
    horizontal: "Mirror（左右鏡像）",
    reset: "重置",
    size: "尺寸",
    bg_dim: "背景亮度（壓暗）",
    bg_sat: "背景飽和度（降飽和）",
    output: "輸出",
    quality: "品質（JPG）",

    watermark_title: "水印",
    watermark_subtitle: "上下線 + 中間文字，可拖曳、縮放與旋轉整組",
    watermark_enable: "啟用",
    watermark_text: "文字",
    watermark_top_line: "上線條",
    watermark_bottom_line: "下線條",
    watermark_color: "顏色",
    watermark_opacity: "透明度",
    watermark_scale: "整組大小",
    watermark_rotation: "旋轉",
    watermark_x: "水平位置",
    watermark_y: "垂直位置",
    watermark_drag_hint: "啟用後可直接拖曳預覽中的水印整組，並可調整大小與旋轉角度。",
    watermark_drag: "拖曳水印",

    preview_title: "即時預覽",
    preview_empty: "拖一張圖片到這裡預覽（也可以點一下選檔）",
    preview_hint: "拖一張圖片到上方預覽框",
    rendering_preview: "正在產生預覽…",
    export_one: "輸出這張",
    export_video: "輸出影片",

    progress_title: "進度",
    current: "目前",
    done: "完成",
    success: "成功",
    fail: "失敗",

    reset_done: "已重置為預設值",
    exporting: "輸出中…",
    export_done: "完成。"
  },

  "en": {
    app_title: "BlurPad",
    app_subtitle: "Dual-layer: blurred background, centered subject",

    lang_zhTW: "Traditional Chinese",
    lang_en: "English",

    batch_title: "Batch",
    optional: "Optional",
    batch_desc: "Process a whole folder at once\nFor normal use, use Live Preview",
    batch_drop: "Drop a folder here",
    batch_hint: "or use the top-right button",
    batch_pick: "Select Folder",
    run_batch: "Export ZIP",
    batch_folder: "Folder",
    no_select: "(none)",
    batch_count: "Count",
    batch_output: "Output",
    batch_output_desc: "Download as ZIP",

    params_title: "Parameters",
    bg_option: "Background Image (Optional)",
    clear: "Clear",
    select_bg: "Select Background",
    use_ori: "Use Original",
    custom: "Custom",
    horizontal: "Mirror (Horizontal)",
    reset: "Reset",
    size: "Size",
    bg_dim: "Background brightness (dim)",
    bg_sat: "Background saturation",
    output: "Output",
    quality: "Quality (JPG)",

    watermark_title: "Watermark",
    watermark_subtitle: "Top/bottom lines with centered text; move, scale and rotate as one group",
    watermark_enable: "Enable",
    watermark_text: "Text",
    watermark_top_line: "Top line",
    watermark_bottom_line: "Bottom line",
    watermark_color: "Color",
    watermark_opacity: "Opacity",
    watermark_scale: "Group size",
    watermark_rotation: "Rotation",
    watermark_x: "Horizontal position",
    watermark_y: "Vertical position",
    watermark_drag_hint: "When enabled, drag the watermark group in the preview and adjust its size or rotation angle.",
    watermark_drag: "Drag watermark",

    preview_title: "Live Preview",
    preview_empty: "Drop an image here (or click to choose)",
    preview_hint: "Drop an image into the preview area",
    rendering_preview: "Rendering preview...",
    export_one: "Export This Image",
    export_video: "Export Video",

    progress_title: "Progress",
    current: "Current",
    done: "Done",
    success: "OK",
    fail: "Fail",

    reset_done: "Reset to default.",
    exporting: "Exporting...",
    export_done: "Done."
  }
};

let currentLang = localStorage.getItem("lang") || "zh-TW";

function t(key, vars, fallback) {
  const s = I18N[currentLang]?.[key];
  return (s ?? fallback ?? key);
}

function applyI18n() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (!key) return;
    el.textContent = t(key, null, el.textContent);
  });
  applyLangSelectLabels();
}

function applyLangSelectLabels() {
  const sel = document.getElementById("langSelect");
  if (!sel) return;

  [...sel.options].forEach(opt => {
    const k = opt.getAttribute("data-i18n");
    if (k) {
      opt.textContent = t(k, null, opt.textContent);
      return;
    }

    if (opt.value === "zh-TW") opt.textContent = t("lang_zhTW", null, opt.textContent);
    else if (opt.value === "en") opt.textContent = t("lang_en", null, opt.textContent);
  });
}

function setLang(lang) {
  if (!I18N[lang]) return;
  currentLang = lang;
  localStorage.setItem("lang", lang);
  applyI18n();
}

window.i18n = { t, setLang, applyI18n };

// Rotation is kept as a small extension so the stable core app.js does not need to be rewritten.
(() => {
  const script = document.createElement("script");
  script.src = "./watermark-rotation.js?v=1.1.1";
  document.body.appendChild(script);
})();
