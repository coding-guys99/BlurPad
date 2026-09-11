# BlurPad Development Log

## v1.2.0 — 2026-09-11

### Added
- Reorganized the main parameter area into three responsive tabs: Image, Watermark, and QR Code.
- Added touch-friendly tab sizing and a sticky tab bar on mobile so long controls no longer need to be shown at the same time.
- Added a standalone QR Code generator with URL mode as the default/primary workflow.
- URL QR generation is automatic while typing or pasting; URLs without a protocol automatically receive `https://`.
- Added Wi-Fi QR generation with SSID, password, WPA/WPA2, WEP, open-network, and hidden-network options.
- Added high-resolution 1024×1024 PNG download with a white quiet-zone border for more reliable scanning.
- Added Traditional Chinese and English labels/help text for the new tabs and QR workflow.

### UX
- Image controls stay together in the Image tab.
- Watermark controls, including move/scale/rotation, stay together in the Watermark tab.
- QR Code is isolated in its own tab to reduce desktop clutter and mobile scrolling.
- QR URL mode is always selected first; Wi-Fi is a secondary mode.

### Implementation
- Added `tool-tabs-qr.js` as a non-invasive UI extension so the stable image renderer in `app.js` remains unchanged.
- QR generation uses `qrcodejs` loaded only when needed.
- Wi-Fi QR payloads escape reserved characters before encoding.

## v1.1.1 — 2026-09-07

### Added
- Added whole-group Watermark Rotation control.
- Rotation range: -180° to +180°, default 0°.
- Watermark text, top line, and bottom line rotate together around the watermark group's center point.
- Rotation is applied consistently to Live Preview, single-image export, and batch ZIP export.
- The draggable preview selection frame now rotates with the watermark group.
- Reset restores watermark rotation to 0°.
- Added Traditional Chinese and English labels/help text for rotation.

### Implementation
- Added `watermark-rotation.js` as a small extension to the existing stable watermark core.
- Rotation is applied as a Canvas transform around the current watermark X/Y pivot before the existing watermark renderer runs.
- The extension augments the existing output options with `watermarkRotation` so an export uses one consistent rotation value.

### Validation
- JavaScript syntax checked for `watermark-rotation.js` and the updated `i18n.js`.
- Rotation uses the same normalized X/Y pivot as the existing watermark placement system.

## v1.1.0 — 2026-09-07

### Added
- Added a new Watermark group for web image output.
- Added centered watermark text with independent top-line and bottom-line toggles.
- Added watermark enable/disable control.
- Added watermark color and opacity controls.
- Added whole-group scale control.
- Added normalized horizontal and vertical position controls so placement stays consistent across output sizes.
- Added direct drag positioning in Live Preview; the complete watermark group moves together.
- Added watermark support to Live Preview, single-image export, and batch ZIP export.
- Added Traditional Chinese and English strings for the watermark controls.

### Rendering behavior
- Watermark is rendered as the final Canvas overlay after background and foreground composition.
- Mirror affects the image layers only; watermark text remains readable and is not mirrored.
- Preview watermark dimensions are scaled against the selected output resolution so preview and final export keep the same relative placement and size.

### Validation
- JavaScript syntax checked for `app.js` and `i18n.js`.
- Verified all JavaScript DOM IDs used by the watermark feature exist in `index.html`.
- Verified all `data-i18n` keys used by the page exist in both Traditional Chinese and English dictionaries.
