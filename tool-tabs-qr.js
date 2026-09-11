(() => {
  const STYLE_ID = "blurpad-tool-tabs-qr-style";
  const QR_LIB = "https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js";
  let qrLibPromise = null;
  let qrTimer = null;
  let lastPayload = "";
  let lastMode = "url";

  const t = (key, fallback) => window.i18n?.t?.(key, null, fallback) || fallback;

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .tool-tabs{
        display:grid;
        grid-template-columns:repeat(3,minmax(0,1fr));
        gap:6px;
        padding:5px;
        margin-bottom:2px;
        border:1px solid var(--border);
        border-radius:14px;
        background:rgba(0,0,0,.18);
      }
      .tool-tab{
        min-height:42px;
        border:0;
        border-radius:10px;
        background:transparent;
        color:var(--muted);
        font:inherit;
        font-size:12px;
        font-weight:650;
        cursor:pointer;
        transition:background .15s ease,color .15s ease,box-shadow .15s ease;
      }
      .tool-tab:hover{background:rgba(255,255,255,.045);color:var(--text)}
      .tool-tab.is-active{
        color:var(--text);
        background:rgba(77,163,255,.15);
        box-shadow:inset 0 0 0 1px rgba(77,163,255,.28);
      }
      .tool-tab-panel{display:flex;flex-direction:column;gap:12px;min-width:0}
      .tool-tab-panel[hidden]{display:none!important}
      .qr-panel{gap:14px}
      .qr-intro{font-size:12px;color:var(--muted);line-height:1.5}
      .qr-mode-tabs{
        display:grid;
        grid-template-columns:1fr 1fr;
        gap:6px;
        padding:4px;
        border-radius:12px;
        background:rgba(255,255,255,.035);
        border:1px solid var(--border);
      }
      .qr-mode-btn{
        min-height:40px;
        border:0;
        border-radius:9px;
        color:var(--muted);
        background:transparent;
        font:inherit;
        font-size:12px;
        font-weight:650;
        cursor:pointer;
      }
      .qr-mode-btn.is-active{background:rgba(255,255,255,.08);color:var(--text)}
      .qr-fields{display:flex;flex-direction:column;gap:11px}
      .qr-fields[hidden]{display:none!important}
      .qr-field label{display:block;font-size:12px;color:var(--muted);margin-bottom:6px}
      .qr-field input[type="url"],
      .qr-field input[type="text"],
      .qr-field input[type="password"],
      .qr-field select{
        width:100%;
        min-height:42px;
        background:rgba(0,0,0,.22);
        border:1px solid var(--border);
        color:var(--text);
        padding:9px 10px;
        border-radius:12px;
        outline:none;
      }
      .qr-field input:focus,.qr-field select:focus{
        border-color:rgba(77,163,255,.55);
        box-shadow:0 0 0 4px rgba(77,163,255,.08);
      }
      .qr-check{
        display:flex;
        align-items:center;
        gap:8px;
        min-height:40px;
        color:var(--muted);
        font-size:12px;
        user-select:none;
      }
      .qr-preview-card{
        display:flex;
        flex-direction:column;
        align-items:center;
        gap:10px;
        padding:16px;
        border:1px solid var(--border);
        border-radius:16px;
        background:rgba(0,0,0,.14);
      }
      .qr-preview-frame{
        width:min(100%,286px);
        aspect-ratio:1;
        display:flex;
        align-items:center;
        justify-content:center;
        padding:15px;
        border-radius:14px;
        background:#fff;
        overflow:hidden;
      }
      .qr-preview-frame canvas,.qr-preview-frame img{max-width:100%;height:auto!important;display:block}
      .qr-empty{font-size:12px;color:#687487;text-align:center;line-height:1.45;padding:16px}
      .qr-status{width:100%;font-size:11px;line-height:1.45;color:var(--muted);word-break:break-all;text-align:center}
      .qr-actions{display:grid;grid-template-columns:1fr auto;gap:8px;width:100%}
      .qr-actions .btn{min-height:42px}
      .qr-actions .btn.primary{width:100%}
      .qr-hint{font-size:11px;color:var(--muted);line-height:1.45}
      @media (max-width:980px){
        .params-card{width:100%;min-width:0}
        .tool-tabs{position:sticky;top:8px;z-index:20;background:rgba(11,15,20,.94);backdrop-filter:blur(12px)}
        .tool-tab{min-height:46px;font-size:12px}
        .qr-preview-frame{width:min(100%,320px)}
        .qr-actions{grid-template-columns:1fr}
        .qr-actions .btn{width:100%}
      }
      @media (max-width:420px){
        .tool-tabs{gap:4px;padding:4px}
        .tool-tab{padding:0 5px;font-size:11px}
        .qr-preview-card{padding:12px}
      }
    `;
    document.head.appendChild(style);
  }

  function ensureQrLib() {
    if (window.QRCode) return Promise.resolve(window.QRCode);
    if (qrLibPromise) return qrLibPromise;
    qrLibPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = QR_LIB;
      script.async = true;
      script.onload = () => window.QRCode ? resolve(window.QRCode) : reject(new Error("QRCode library unavailable"));
      script.onerror = () => reject(new Error("QRCode library failed to load"));
      document.head.appendChild(script);
    });
    return qrLibPromise;
  }

  function normalizeUrl(raw) {
    const value = String(raw || "").trim();
    if (!value) return "";
    if (/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(value)) return value;
    if (value.startsWith("//")) return `https:${value}`;
    return `https://${value}`;
  }

  function escapeWifi(value) {
    return String(value ?? "").replace(/([\\;,":])/g, "\\$1");
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function buildQrPanel() {
    const panel = document.createElement("div");
    panel.className = "tool-tab-panel qr-panel";
    panel.dataset.toolPanel = "qr";
    panel.hidden = true;
    panel.innerHTML = `
      <div class="qr-intro" data-i18n="qr_intro">貼上網址即可自動產生 QR Code；也可切換為 Wi‑Fi QR。</div>

      <div class="qr-mode-tabs" role="tablist" aria-label="QR type">
        <button class="qr-mode-btn is-active" type="button" data-qr-mode="url" data-i18n="qr_mode_url">網址</button>
        <button class="qr-mode-btn" type="button" data-qr-mode="wifi" data-i18n="qr_mode_wifi">Wi‑Fi</button>
      </div>

      <div class="qr-fields" data-qr-fields="url">
        <div class="qr-field">
          <label for="qrUrl" data-i18n="qr_url_label">網址</label>
          <input id="qrUrl" type="url" inputmode="url" autocomplete="url" autocapitalize="none" spellcheck="false" placeholder="https://example.com" />
        </div>
        <div class="qr-hint" data-i18n="qr_url_hint">可直接貼上網址；沒有 http/https 時會自動補上 https://。</div>
      </div>

      <div class="qr-fields" data-qr-fields="wifi" hidden>
        <div class="qr-field">
          <label for="qrWifiSsid" data-i18n="qr_wifi_ssid">Wi‑Fi 名稱（SSID）</label>
          <input id="qrWifiSsid" type="text" autocomplete="off" spellcheck="false" />
        </div>
        <div class="qr-field" id="qrWifiPasswordField">
          <label for="qrWifiPassword" data-i18n="qr_wifi_password">密碼</label>
          <input id="qrWifiPassword" type="password" autocomplete="new-password" />
        </div>
        <div class="qr-field">
          <label for="qrWifiSecurity" data-i18n="qr_wifi_security">安全類型</label>
          <select id="qrWifiSecurity">
            <option value="WPA" data-i18n="qr_wifi_wpa">WPA / WPA2</option>
            <option value="WEP">WEP</option>
            <option value="nopass" data-i18n="qr_wifi_open">無密碼</option>
          </select>
        </div>
        <label class="qr-check">
          <input id="qrWifiHidden" type="checkbox" />
          <span data-i18n="qr_wifi_hidden">隱藏網路</span>
        </label>
        <div class="qr-hint" data-i18n="qr_wifi_hint">掃描後可由支援的手機直接加入 Wi‑Fi。</div>
      </div>

      <div class="qr-preview-card">
        <div id="qrPreviewFrame" class="qr-preview-frame">
          <div id="qrEmpty" class="qr-empty" data-i18n="qr_empty">貼上網址後，QR Code 會顯示在這裡。</div>
          <div id="qrMount"></div>
        </div>
        <div id="qrStatus" class="qr-status"></div>
        <div class="qr-actions">
          <button id="qrDownload" type="button" class="btn primary" disabled data-i18n="qr_download">下載 PNG</button>
          <button id="qrClear" type="button" class="btn" data-i18n="qr_clear">清除</button>
        </div>
      </div>
    `;
    return panel;
  }

  function init() {
    const paramsCard = document.querySelector(".params-card");
    const form = paramsCard?.querySelector(".form");
    const watermarkSection = form?.querySelector(".watermark-section");
    if (!paramsCard || !form || !watermarkSection || form.dataset.tabsReady === "1") return;

    form.dataset.tabsReady = "1";
    injectStyles();

    const tabBar = document.createElement("div");
    tabBar.className = "tool-tabs";
    tabBar.setAttribute("role", "tablist");
    tabBar.innerHTML = `
      <button class="tool-tab is-active" type="button" data-tool-tab="image" role="tab" aria-selected="true" data-i18n="tab_image">圖片</button>
      <button class="tool-tab" type="button" data-tool-tab="watermark" role="tab" aria-selected="false" data-i18n="tab_watermark">水印</button>
      <button class="tool-tab" type="button" data-tool-tab="qr" role="tab" aria-selected="false" data-i18n="tab_qr">QR Code</button>
    `;

    const imagePanel = document.createElement("div");
    imagePanel.className = "tool-tab-panel";
    imagePanel.dataset.toolPanel = "image";

    const watermarkPanel = document.createElement("div");
    watermarkPanel.className = "tool-tab-panel";
    watermarkPanel.dataset.toolPanel = "watermark";
    watermarkPanel.hidden = true;

    const originalChildren = Array.from(form.children);
    originalChildren.forEach((child) => {
      if (child === watermarkSection) {
        watermarkPanel.appendChild(child);
      } else if (child.classList?.contains("section-divider")) {
        child.remove();
      } else {
        imagePanel.appendChild(child);
      }
    });

    const qrPanel = buildQrPanel();
    form.append(tabBar, imagePanel, watermarkPanel, qrPanel);

    const paramActions = paramsCard.querySelector(".paramActions");
    const tabButtons = Array.from(tabBar.querySelectorAll("[data-tool-tab]"));
    const panels = Array.from(form.querySelectorAll("[data-tool-panel]"));

    function activateTool(name) {
      tabButtons.forEach((btn) => {
        const active = btn.dataset.toolTab === name;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-selected", active ? "true" : "false");
      });
      panels.forEach((p) => { p.hidden = p.dataset.toolPanel !== name; });
      if (paramActions) paramActions.style.display = name === "qr" ? "none" : "flex";
      if (name === "qr") {
        ensureQrLib().then(() => generateQr(true)).catch(showQrLibraryError);
        setTimeout(() => document.getElementById("qrUrl")?.focus(), 30);
      }
    }

    tabButtons.forEach((btn) => btn.addEventListener("click", () => activateTool(btn.dataset.toolTab)));

    const modeButtons = Array.from(qrPanel.querySelectorAll("[data-qr-mode]"));
    const urlFields = qrPanel.querySelector('[data-qr-fields="url"]');
    const wifiFields = qrPanel.querySelector('[data-qr-fields="wifi"]');
    const urlInput = qrPanel.querySelector("#qrUrl");
    const ssidInput = qrPanel.querySelector("#qrWifiSsid");
    const passwordInput = qrPanel.querySelector("#qrWifiPassword");
    const passwordField = qrPanel.querySelector("#qrWifiPasswordField");
    const securityInput = qrPanel.querySelector("#qrWifiSecurity");
    const hiddenInput = qrPanel.querySelector("#qrWifiHidden");
    const qrMount = qrPanel.querySelector("#qrMount");
    const qrEmpty = qrPanel.querySelector("#qrEmpty");
    const qrStatus = qrPanel.querySelector("#qrStatus");
    const downloadBtn = qrPanel.querySelector("#qrDownload");
    const clearBtn = qrPanel.querySelector("#qrClear");

    function setMode(mode) {
      lastMode = mode === "wifi" ? "wifi" : "url";
      modeButtons.forEach((btn) => btn.classList.toggle("is-active", btn.dataset.qrMode === lastMode));
      urlFields.hidden = lastMode !== "url";
      wifiFields.hidden = lastMode !== "wifi";
      if (lastMode === "url") setTimeout(() => urlInput.focus(), 20);
      else setTimeout(() => ssidInput.focus(), 20);
      scheduleQr(0);
    }

    function getPayload() {
      if (lastMode === "url") {
        const normalized = normalizeUrl(urlInput.value);
        if (!normalized) return { payload: "", status: t("qr_empty", "貼上網址後，QR Code 會顯示在這裡。") };
        return { payload: normalized, status: normalized };
      }

      const ssid = ssidInput.value.trim();
      if (!ssid) return { payload: "", status: t("qr_wifi_need_ssid", "請輸入 Wi‑Fi 名稱（SSID）。") };
      const security = securityInput.value || "WPA";
      const password = security === "nopass" ? "" : passwordInput.value;
      const hidden = hiddenInput.checked ? "true" : "false";
      const payload = `WIFI:T:${security};S:${escapeWifi(ssid)};P:${escapeWifi(password)};H:${hidden};;`;
      return { payload, status: `${t("qr_wifi_ready", "Wi‑Fi QR 已產生")}: ${ssid}` };
    }

    function clearPreview(status = "") {
      qrMount.innerHTML = "";
      qrEmpty.hidden = false;
      qrStatus.textContent = status;
      downloadBtn.disabled = true;
      lastPayload = "";
    }

    function showQrLibraryError() {
      clearPreview(t("qr_library_error", "QR Code 元件載入失敗，請重新整理頁面後再試。"));
    }

    async function generateQr(silent = false) {
      const { payload, status } = getPayload();
      if (!payload) {
        clearPreview(status);
        return;
      }

      try {
        await ensureQrLib();
        qrMount.innerHTML = "";
        qrEmpty.hidden = true;
        new window.QRCode(qrMount, {
          text: payload,
          width: 256,
          height: 256,
          colorDark: "#000000",
          colorLight: "#ffffff",
          correctLevel: window.QRCode.CorrectLevel.H,
        });
        lastPayload = payload;
        qrStatus.textContent = status;
        downloadBtn.disabled = false;
      } catch (err) {
        if (!silent) console.error(err);
        showQrLibraryError();
      }
    }

    function scheduleQr(delay = 180) {
      clearTimeout(qrTimer);
      qrTimer = setTimeout(() => generateQr(true), delay);
    }

    async function downloadQrPng() {
      const { payload } = getPayload();
      if (!payload) return;
      try {
        await ensureQrLib();
        const holder = document.createElement("div");
        holder.style.cssText = "position:fixed;left:-10000px;top:-10000px;width:896px;height:896px;background:#fff";
        document.body.appendChild(holder);
        new window.QRCode(holder, {
          text: payload,
          width: 896,
          height: 896,
          colorDark: "#000000",
          colorLight: "#ffffff",
          correctLevel: window.QRCode.CorrectLevel.H,
        });

        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        const sourceCanvas = holder.querySelector("canvas");
        const sourceImg = holder.querySelector("img");
        const out = document.createElement("canvas");
        out.width = 1024;
        out.height = 1024;
        const ctx = out.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, out.width, out.height);

        if (sourceCanvas) {
          ctx.drawImage(sourceCanvas, 64, 64, 896, 896);
        } else if (sourceImg) {
          if (!sourceImg.complete) await new Promise((r) => { sourceImg.onload = r; sourceImg.onerror = r; });
          ctx.drawImage(sourceImg, 64, 64, 896, 896);
        } else {
          holder.remove();
          throw new Error("QR render failed");
        }
        holder.remove();

        const blob = await new Promise((resolve) => out.toBlob(resolve, "image/png"));
        if (!blob) throw new Error("PNG export failed");
        downloadBlob(blob, lastMode === "wifi" ? "BlurPad_QR_WiFi.png" : "BlurPad_QR_URL.png");
      } catch (err) {
        console.error(err);
        qrStatus.textContent = t("qr_download_error", "QR PNG 下載失敗，請再試一次。");
      }
    }

    function syncPasswordField() {
      const open = securityInput.value === "nopass";
      passwordField.hidden = open;
      if (open) passwordInput.value = "";
      scheduleQr(0);
    }

    modeButtons.forEach((btn) => btn.addEventListener("click", () => setMode(btn.dataset.qrMode)));
    [urlInput, ssidInput, passwordInput].forEach((el) => {
      el.addEventListener("input", () => scheduleQr());
      el.addEventListener("paste", () => setTimeout(() => scheduleQr(0), 0));
    });
    securityInput.addEventListener("change", syncPasswordField);
    hiddenInput.addEventListener("change", () => scheduleQr(0));
    downloadBtn.addEventListener("click", downloadQrPng);
    clearBtn.addEventListener("click", () => {
      if (lastMode === "url") {
        urlInput.value = "";
        urlInput.focus();
      } else {
        ssidInput.value = "";
        passwordInput.value = "";
        securityInput.value = "WPA";
        hiddenInput.checked = false;
        syncPasswordField();
        ssidInput.focus();
      }
      clearPreview(t("qr_empty", "貼上網址後，QR Code 會顯示在這裡。"));
    });

    syncPasswordField();
    setMode("url");
    window.i18n?.applyI18n?.();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
