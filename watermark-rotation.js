(() => {
  function initWatermarkRotation() {
    if (document.getElementById("watermarkRotation")) return;

    const controls = document.getElementById("watermarkControls");
    const scaleInput = document.getElementById("watermarkScale");
    const enabledInput = document.getElementById("watermarkEnabled");
    const dragHandle = document.getElementById("watermarkDragHandle");
    if (!controls || !scaleInput || !enabledInput) return;

    const field = document.createElement("div");
    field.className = "field";
    field.innerHTML = `
      <div class="field-head">
        <label for="watermarkRotation" data-i18n="watermark_rotation">旋轉</label>
        <span id="watermarkRotationVal" class="mono muted">0°</span>
      </div>
      <input id="watermarkRotation" type="range" min="-180" max="180" step="1" value="0" />
    `;

    const scaleField = scaleInput.closest(".field");
    if (scaleField?.parentNode) scaleField.parentNode.insertBefore(field, scaleField.nextSibling);
    else controls.appendChild(field);

    const rotationInput = document.getElementById("watermarkRotation");
    const rotationVal = document.getElementById("watermarkRotationVal");
    const rotationLabel = field.querySelector("[data-i18n='watermark_rotation']");
    if (!rotationInput || !rotationVal) return;

    if (rotationLabel && window.i18n?.t) {
      rotationLabel.textContent = window.i18n.t("watermark_rotation", null, "旋轉");
    }

    const clampRotation = (value) => Math.max(-180, Math.min(180, Number(value) || 0));
    const getRotation = () => clampRotation(rotationInput.value);

    const updateReadout = () => {
      rotationVal.textContent = `${Math.round(getRotation())}°`;
    };

    const originalOpts = opts;
    opts = function patchedOpts() {
      return {
        ...originalOpts(),
        watermarkRotation: getRotation(),
      };
    };

    const originalDrawWatermarkGroup = drawWatermarkGroup;
    drawWatermarkGroup = function rotatedWatermarkGroup(ctx, tw, th, o) {
      const angle = clampRotation(o?.watermarkRotation ?? getRotation());
      if (!angle || !o?.watermarkEnabled) {
        originalDrawWatermarkGroup(ctx, tw, th, o);
        return;
      }

      const x = tw * (Math.max(0, Math.min(100, Number(o.watermarkX) || 0)) / 100);
      const y = th * (Math.max(0, Math.min(100, Number(o.watermarkY) || 0)) / 100);

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle * Math.PI / 180);
      ctx.translate(-x, -y);
      originalDrawWatermarkGroup(ctx, tw, th, o);
      ctx.restore();
    };

    const originalUpdateWatermarkDragHandle = updateWatermarkDragHandle;
    updateWatermarkDragHandle = function rotatedWatermarkDragHandle() {
      originalUpdateWatermarkDragHandle();
      if (!dragHandle || dragHandle.hidden) return;
      dragHandle.style.transform = `translate(-50%, -50%) rotate(${getRotation()}deg)`;
    };

    const originalUpdateWatermarkUiState = updateWatermarkUiState;
    updateWatermarkUiState = function patchedWatermarkUiState() {
      originalUpdateWatermarkUiState();
      rotationInput.disabled = !enabledInput.checked;
      updateWatermarkDragHandle();
    };

    const originalApplyDefaults = applyDefaults;
    applyDefaults = function patchedApplyDefaults() {
      originalApplyDefaults();
      rotationInput.value = "0";
      updateReadout();
      updateWatermarkDragHandle();
    };

    rotationInput.addEventListener("input", () => {
      updateReadout();
      updateWatermarkDragHandle();
      if (typeof schedulePreview === "function") schedulePreview();
      else if (typeof refreshPreview === "function") refreshPreview();
    });

    rotationInput.addEventListener("change", () => {
      if (typeof refreshPreview === "function") refreshPreview();
    });

    enabledInput.addEventListener("change", () => {
      rotationInput.disabled = !enabledInput.checked;
      updateWatermarkDragHandle();
    });

    updateReadout();
    rotationInput.disabled = !enabledInput.checked;
    updateWatermarkDragHandle();
  }

  if (document.readyState === "complete") initWatermarkRotation();
  else window.addEventListener("load", initWatermarkRotation, { once: true });
})();
