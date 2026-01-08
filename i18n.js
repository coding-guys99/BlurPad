const I18N = {
  "zh-TW": {
    app_title: "BlurPad",
    app_subtitle: "同圖雙層：背景 Blur、前景置中",

    batch_title: "批次處理",
    optional: "選用",
    batch_desc: "用於一次處理整個資料夾\n一般情況請使用右側「即時預覽」",
    batch_drop: "拖曳資料夾到這裡",
    batch_hint: "或使用右上角按鈕",
    batch_pick: "選擇資料夾",
    run_batch: "批次輸出 ZIP",
    batch_folder: "資料夾",
    no_select:"（尚未選擇）",
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
    size: "尺寸",
    bg_dim: "背景亮度（壓暗）",
    bg_sat: "背景飽和度（降飽和）",
    output: "輸出",
    quality: "品質（JPG）",

    preview_title: "即時預覽",
    preview_empty: "拖一張圖片到這裡預覽（也可以點一下選檔）",
    preview_hint: "拖一張圖片到上方預覽框",
    export_one: "輸出這張",

    progress_title: "進度",
    current: "目前",
    done: "完成",
    success: "成功",
    fail: "失敗"
  },

  "en": {
    app_title: "BlurPad",
    app_subtitle: "Dual-layer: blurred background, centered subject",

    batch_title: "Batch",
    optional: "Optional",
    batch_desc: "Process a whole folder at once\nFor normal use, use Live Preview",
    batch_drop: "Drop a folder here",
    batch_hint: "or use the top-right button",
    batch_pick: "Select Folder",
    run_batch: "Export ZIP",
    batch_folder: "Folder",
    no_select:"（unknown）",
    batch_count: "Count",
    batch_output: "Output",
    batch_output_desc: "Download as ZIP",

    params_title: "Parameters",
    bg_option: "Background Picture（Optional）",
    clear: "Clear",
    use_ori: "Use Original",
    select_bg: "select Background",
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

    progress_title: "Progress",
    current: "Current",
    done: "Done",
    success: "OK",
    fail: "Fail"
  }
};

let currentLang = localStorage.getItem("lang") || "zh-TW";

function t(key) {
  return I18N[currentLang]?.[key] || key;
}

function applyI18n() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (key) el.innerText = t(key);
  });
}

function setLang(lang) {
  if (!I18N[lang]) return;
  currentLang = lang;
  localStorage.setItem("lang", lang);
  applyI18n();
}

window.i18n = { t, setLang, applyI18n };
