(() => {
  const STYLE_ID = "blurpad-qr-social-icons-style";
  const ROOT_ID = "qrSocialPresets";
  const BUILTIN_PREFIX = "BlurPad-social-";

  const COPY = {
    "zh-TW": {
      title: "內建社群圖示",
      hint: "黑白 icon，可直接套用；也可選擇自訂圖片，並共用大小與位置控制。",
      none: "無",
      custom: "自訂",
    },
    en: {
      title: "Built-in Social Icons",
      hint: "Monochrome icons share the same size and position controls as custom images.",
      none: "None",
      custom: "Custom",
    },
  };

  // Monochrome SVGs only. The QR composer already adds the white backing plate.
  const BRAND = {
    facebook: {
      label: "Facebook",
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="#000" d="M300 96h86v92h-52c-32 0-38 15-38 38v48h86l-12 91h-74v147h-96V365h-67v-91h67v-58c0-79 47-120 121-120h-21z"/></svg>`,
    },
    whatsapp: {
      label: "WhatsApp",
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="#000" d="M256 64C150 64 64 146 64 248c0 35 10 69 30 98l-30 102 106-28c27 15 57 23 86 23 106 0 192-82 192-184S362 64 256 64zm0 339c-27 0-53-7-76-21l-10-6-63 17 18-60-7-11c-16-24-24-52-24-81 0-80 68-145 152-145s152 65 152 145-68 145-152 145zm84-109c-5-2-28-14-32-16-5-1-8-2-12 3-3 5-12 15-15 19-3 3-6 4-11 1-29-14-49-26-69-57-5-9 6-9 17-29 2-4 1-8 0-11-1-4-12-29-16-39-4-10-8-9-12-9h-10c-4 0-10 2-15 7-5 6-19 19-19 46 0 27 20 53 23 57 3 4 40 62 96 86 56 24 56 16 67 15 10-1 33-13 38-26 5-13 5-25 3-28-2-3-6-5-11-7z"/></svg>`,
    },
    instagram: {
      label: "Instagram",
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect x="86" y="86" width="340" height="340" rx="94" fill="none" stroke="#000" stroke-width="34"/><circle cx="256" cy="256" r="82" fill="none" stroke="#000" stroke-width="34"/><circle cx="361" cy="151" r="22" fill="#000"/></svg>`,
    },
    linkedin: {
      label: "LinkedIn",
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><circle cx="145" cy="151" r="34" fill="#000"/><rect x="113" y="213" width="64" height="190" rx="5" fill="#000"/><path fill="#000" d="M216 213h62v26h1c9-16 30-35 65-35 69 0 82 44 82 100v99h-64v-88c0-21 0-51-33-51s-38 24-38 50v89h-65V213z"/></svg>`,
    },
  };

  const lang = () => localStorage.getItem("lang") === "en" ? "en" : "zh-TW";
  const copy = (key) => COPY[lang()]?.[key] || COPY["zh-TW"][key] || key;
  const iconPreview = (type) => `<span class="qr-social-icon" aria-hidden="true">${BRAND[type]?.svg || ""}</span>`;

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
      .qr-social-icon{width:28px;height:28px;display:block;background:#fff;border-radius:7px;padding:3px}
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
      try { Object.defineProperty(input, "files", { configurable: true, value: [file] }); }
      catch { return false; }
    }
    input.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  }

  function setActive(type) {
    document.querySelectorAll(`#${ROOT_ID} [data-social-icon]`).forEach((btn) => {
      const active = btn.dataset.socialIcon === type;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function refreshCopy() {
    const root = document.getElementById(ROOT_ID);
    if (!root) return;
    const map = { title: "title", hint: "hint", none: "none", custom: "custom" };
    Object.entries(map).forEach(([attr, key]) => {
      const el = root.querySelector(`[data-social-copy='${attr}']`);
      if (el) el.textContent = copy(key);
    });
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
      </div>`;
    section.insertBefore(root, logoActions);
    refreshCopy();

    root.addEventListener("click", (event) => {
      const button = event.target.closest("[data-social-icon]");
      if (!button) return;
      const type = button.dataset.socialIcon;
      if (type === "none") { clearButton.click(); setActive("none"); return; }
      if (type === "custom") { logoInput.click(); return; }
      const file = makeFile(type);
      if (!file) return;
      setActive(type);
      if (!setInputFile(logoInput, file)) setActive("none");
    });

    logoInput.addEventListener("change", () => {
      const file = logoInput.files?.[0];
      if (!file) return;
      if (!String(file.name || "").startsWith(BUILTIN_PREFIX)) setActive("custom");
    });
    clearButton.addEventListener("click", () => setActive("none"));
    document.getElementById("langSelect")?.addEventListener("change", () => setTimeout(refreshCopy, 0));
    return true;
  }

  function boot() {
    if (init()) return;
    const observer = new MutationObserver(() => { if (init()) observer.disconnect(); });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(() => observer.disconnect(), 15000);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
