(() => {
  const STYLE_ID = "blurpad-qr-social-icons-style";
  const ROOT_ID = "qrSocialPresets";
  const BUILTIN_PREFIX = "BlurPad-social-";
  let selected = "none";

  const COPY = {
    "zh-TW": {
      title: "內建社群圖示",
      hint: "可直接套用社群 icon，或選擇自訂圖片；會共用目前的大小與位置控制。",
      none: "無",
      custom: "自訂",
    },
    en: {
      title: "Built-in Social Icons",
      hint: "Use a social icon or choose a custom image. Size and position controls are shared.",
      none: "None",
      custom: "Custom",
    },
  };

  const BRAND = {
    facebook: {
      label: "Facebook",
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><circle cx="256" cy="256" r="240" fill="#1877F2"/><path fill="#fff" d="M294 160h55v-72c-10-1-42-4-80-4-79 0-133 48-133 136v76H78v81h58v203h99V377h66l11-81h-77v-68c0-23 6-39 39-39h41v-29z" transform="scale(.75) translate(85 45)"/></svg>`,
    },
    whatsapp: {
      label: "WhatsApp",
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><circle cx="256" cy="256" r="240" fill="#25D366"/><path fill="#fff" d="M256 122c-74 0-134 58-134 130 0 25 7 49 20 70l-21 70 73-19c19 10 40 15 62 15 74 0 134-58 134-130S330 122 256 122zm0 226c-20 0-39-5-55-15l-8-4-43 11 12-41-5-8c-10-16-15-34-15-53 0-55 47-100 104-100s104 45 104 100-47 100-104 100zm58-75c-3-2-19-9-22-10-3-1-6-2-8 2-2 3-9 10-11 12-2 2-4 2-7 1-20-10-34-18-48-40-4-7 4-6 12-20 1-3 1-5 0-7-1-2-8-20-11-27-3-7-6-6-8-6h-7c-2 0-7 1-10 5-3 4-13 13-13 32s14 37 16 40c2 3 27 43 66 60 39 17 39 11 46 10 7-1 23-9 26-18 3-9 3-17 2-19-1-2-4-3-7-5z"/></svg>`,
    },
    instagram: {
      label: "Instagram",
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs><linearGradient id="igbp" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#FEDA75"/><stop offset=".28" stop-color="#FA7E1E"/><stop offset=".52" stop-color="#D62976"/><stop offset=".76" stop-color="#962FBF"/><stop offset="1" stop-color="#4F5BD5"/></linearGradient></defs><rect x="24" y="24" width="464" height="464" rx="116" fill="url(#igbp)"/><rect x="132" y="132" width="248" height="248" rx="78" fill="none" stroke="#fff" stroke-width="30"/><circle cx="256" cy="256" r="61" fill="none" stroke="#fff" stroke-width="30"/><circle cx="349" cy="163" r="18" fill="#fff"/></svg>`,
    },
    linkedin: {
      label: "LinkedIn",
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect x="24" y="24" width="464" height="464" rx="72" fill="#0A66C2"/><circle cx="145" cy="165" r="31" fill="#fff"/><rect x="116" y="218" width="58" height="178" rx="4" fill="#fff"/><path fill="#fff" d="M211 218h56v24h1c8-14 27-32 59-32 63 0 75 39 75 90v96h-58v-85c0-20 0-47-30-47-30 0-35 22-35 46v86h-58V218z"/></svg>`,
    },
  };

  function lang() {
    return localStorage.getItem("lang") === "en" ? "en" : "zh-TW";
  }

  function copy(key) {
    return COPY[lang()]?.[key] || COPY["zh-TW"][key] || key;
  }

  function iconPreview(type) {
    const svg = BRAND[type]?.svg || "";
    return `<span class="qr-social-icon" aria-hidden="true">${svg}</span>`;
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .qr-social-section{display:flex;flex-direction:column;gap:8px}
      .qr-social-head{display:flex;flex-direction:column;gap:2px}
      .qr-social-title{font-size:12px;font-weight:700;color:var(--text)}
      .qr-social-hint{font-size:11px;line-height:1.4;color:var(--muted)}
      .qr-social-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}
      .qr-social-btn{min-height:66px;padding:7px 4px;border:1px solid var(--border);border-radius:11px;background:rgba(255,255,255,.025);color:var(--muted);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;cursor:pointer;font:inherit;font-size:10px;line-height:1.15;transition:.15s ease}
      .qr-social-btn:hover{background:rgba(255,255,255,.055);color:var(--text)}
      .qr-social-btn.is-active{border-color:rgba(77,163,255,.55);background:rgba(77,163,255,.12);color:var(--text);box-shadow:0 0 0 2px rgba(77,163,255,.07)}
      .qr-social-icon{width:28px;height:28px;display:block}
      .qr-social-icon svg{display:block;width:100%;height:100%}
      .qr-social-none{width:28px;height:28px;border-radius:50%;border:1px solid rgba(255,255,255,.22);display:grid;place-items:center;font-size:18px;line-height:1;color:var(--muted)}
      .qr-social-custom{width:28px;height:28px;border-radius:8px;border:1px dashed rgba(255,255,255,.28);display:grid;place-items:center;font-size:18px;line-height:1;color:var(--muted)}
      .qr-logo-actions label[for="qrLogoInput"]{display:none}
      @media (max-width:420px){.qr-social-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.qr-social-btn{min-height:62px}}
    `;
    document.head.appendChild(style);
  }

  function makeFile(type) {
    const brand = BRAND[type];
    if (!brand) return null;
    return new File([brand.svg], `${BUILTIN_PREFIX}${type}.svg`, { type: "image/svg+xml" });
  }

  function setInputFile(input, file) {
    if (!input || !file) return false;
    try {
      const dt = new DataTransfer();
      dt.items.add(file);
      input.files = dt.files;
    } catch {
      try {
        Object.defineProperty(input, "files", { configurable: true, value: [file] });
      } catch {
        return false;
      }
    }
    input.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  }

  function setActive(type) {
    selected = type;
    document.querySelectorAll("#qrSocialPresets [data-social-icon]").forEach((btn) => {
      const active = btn.dataset.socialIcon === type;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function refreshCopy() {
    const root = document.getElementById(ROOT_ID);
    if (!root) return;
    const title = root.querySelector("[data-social-copy='title']");
    const hint = root.querySelector("[data-social-copy='hint']");
    const none = root.querySelector("[data-social-copy='none']");
    const custom = root.querySelector("[data-social-copy='custom']");
    if (title) title.textContent = copy("title");
    if (hint) hint.textContent = copy("hint");
    if (none) none.textContent = copy("none");
    if (custom) custom.textContent = copy("custom");
  }

  function init() {
    if (document.getElementById(ROOT_ID)) return true;
    const section = document.querySelector(".qr-logo-section");
    const logoActions = section?.querySelector(".qr-logo-actions");
    const logoInput = document.getElementById("qrLogoInput");
    const clearButton = document.getElementById("qrLogoClear");
    if (!section || !logoActions || !logoInput || !clearButton) return false;

    injectStyles();

    const root = document.createElement("div");
    root.id = ROOT_ID;
    root.className = "qr-social-section";
    root.innerHTML = `
      <div class="qr-social-head">
        <div class="qr-social-title" data-social-copy="title"></div>
        <div class="qr-social-hint" data-social-copy="hint"></div>
      </div>
      <div class="qr-social-grid" role="group" aria-label="Social icon presets">
        <button type="button" class="qr-social-btn is-active" data-social-icon="none" aria-pressed="true"><span class="qr-social-none" aria-hidden="true">×</span><span data-social-copy="none"></span></button>
        <button type="button" class="qr-social-btn" data-social-icon="facebook" aria-pressed="false">${iconPreview("facebook")}<span>Facebook</span></button>
        <button type="button" class="qr-social-btn" data-social-icon="whatsapp" aria-pressed="false">${iconPreview("whatsapp")}<span>WhatsApp</span></button>
        <button type="button" class="qr-social-btn" data-social-icon="instagram" aria-pressed="false">${iconPreview("instagram")}<span>Instagram</span></button>
        <button type="button" class="qr-social-btn" data-social-icon="linkedin" aria-pressed="false">${iconPreview("linkedin")}<span>LinkedIn</span></button>
        <button type="button" class="qr-social-btn" data-social-icon="custom" aria-pressed="false"><span class="qr-social-custom" aria-hidden="true">＋</span><span data-social-copy="custom"></span></button>
      </div>
    `;
    section.insertBefore(root, logoActions);
    refreshCopy();

    root.addEventListener("click", (event) => {
      const button = event.target.closest("[data-social-icon]");
      if (!button) return;
      const type = button.dataset.socialIcon;
      if (type === "none") {
        clearButton.click();
        setActive("none");
        return;
      }
      if (type === "custom") {
        logoInput.click();
        return;
      }
      const file = makeFile(type);
      if (!file) return;
      setActive(type);
      if (!setInputFile(logoInput, file)) setActive("none");
    });

    logoInput.addEventListener("change", () => {
      const file = logoInput.files?.[0];
      if (!file) return;
      const name = String(file.name || "");
      if (!name.startsWith(BUILTIN_PREFIX)) setActive("custom");
    });

    clearButton.addEventListener("click", () => setActive("none"));
    document.getElementById("langSelect")?.addEventListener("change", () => setTimeout(refreshCopy, 0));
    return true;
  }

  function boot() {
    if (init()) return;
    const observer = new MutationObserver(() => {
      if (init()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(() => observer.disconnect(), 15000);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
