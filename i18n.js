const I18N = {
  "zh-TW": {
    app_title: "BlurPad",
    app_subtitle: "同圖雙層：背景 Blur、前景置中",

    // ✅ Language labels (for <select> options)
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
    horizontal: "水平",
    reset: "重置",
    size: "尺寸",
    bg_dim: "背景亮度（壓暗）",
    bg_sat: "背景飽和度（降飽和）",
    output: "輸出",
    quality: "品質（JPG）",

    preview_title: "即時預覽",
    preview_empty: "拖一張圖片到這裡預覽（也可以點一下選檔）",
    preview_hint: "拖一張圖片到上方預覽框",
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

    // ✅ Language labels
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
    horizontal: "Horizontal",
    reset: "Reset",
    size: "Size",
    bg_dim: "Background brightness (dim)",
    bg_sat: "Background saturation",
    output: "Output",
    quality: "Quality (JPG)",

    preview_title: "Live Preview",
    preview_empty: "Drop an image here (or click to choose)",
    preview_hint: "Drop an image into the preview area",
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

  // ✅ 特別處理 <select id="langSelect"> 的 option 文字（不管有沒有 data-i18n 都會更新）
  applyLangSelectLabels();
}

function applyLangSelectLabels() {
  const sel = document.getElementById("langSelect");
  if (!sel) return;

  [...sel.options].forEach(opt => {
    // 1) 若你有用 data-i18n（推薦），就跟著 key 翻
    const k = opt.getAttribute("data-i18n");
    if (k) {
      opt.textContent = t(k, null, opt.textContent);
      return;
    }

    // 2) 若沒 data-i18n，就用 value 判斷（向下相容你原本 HTML）
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