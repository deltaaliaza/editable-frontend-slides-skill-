#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

function usage() {
  console.error("Usage: node inject_editable_layer.js <input.html> <output.html>");
  process.exit(2);
}

const input = process.argv[2];
const output = process.argv[3];
if (!input || !output) usage();

const inputPath = path.resolve(input);
const outputPath = path.resolve(output);
let html = fs.readFileSync(inputPath, "utf8");

const CSS_START = "<!-- editable-frontend-slides:css:start -->";
const CSS_END = "<!-- editable-frontend-slides:css:end -->";
const JS_START = "<!-- editable-frontend-slides:js:start -->";
const JS_END = "<!-- editable-frontend-slides:js:end -->";

function stripExistingLayer(source) {
  return source
    .replace(new RegExp(`${CSS_START}[\\s\\S]*?${CSS_END}\\s*`, "g"), "")
    .replace(new RegExp(`${JS_START}[\\s\\S]*?${JS_END}\\s*`, "g"), "")
    .replace(/<script\b[^>]*\bid=["']editable-frontend-slides-state["'][^>]*>[\s\S]*?<\/script>\s*/gi, "");
}

const editorCss = `
${CSS_START}
<style id="editable-frontend-slides-css">
  .efs-panel {
    position: fixed;
    left: 14px;
    top: 14px;
    z-index: 9999;
    display: flex;
    gap: 8px;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }
  .efs-panel button {
    border: 1px solid rgba(255,255,255,0.35);
    border-radius: 999px;
    background: #14202a;
    color: #fffdf7;
    font-weight: 800;
    padding: 9px 13px;
    cursor: pointer;
    box-shadow: 0 8px 24px rgba(20, 32, 42, 0.2);
  }
  .efs-panel button.active,
  .efs-panel button:hover {
    background: #fffdf7;
    color: #14202a;
  }
  .efs-toolbar {
    position: fixed;
    left: 50%;
    top: 16px;
    transform: translateX(-50%);
    z-index: 9999;
    display: none;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 999px;
    background: rgba(20, 32, 42, 0.92);
    color: #fffdf7;
    font: 800 13px/1 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    box-shadow: 0 16px 38px rgba(20, 32, 42, 0.28);
  }
  body.efs-editing .efs-toolbar { display: flex; }
  .efs-toolbar button,
  .efs-toolbar input[type="color"] {
    border: 0;
    border-radius: 999px;
    background: rgba(255,255,255,0.12);
    color: #fffdf7;
    font-weight: 900;
    min-width: 31px;
    height: 31px;
    cursor: pointer;
  }
  .efs-toolbar input[type="color"] { padding: 4px; }
  body.efs-editing [data-editable="true"] {
    outline: 2px dashed rgba(8, 127, 131, 0.55);
    outline-offset: 4px;
  }
  .efs-selection-overlay {
    position: absolute;
    display: none;
    z-index: 10000;
    border: 3px solid rgba(180, 52, 44, 0.72);
    outline: 2px dashed rgba(8, 127, 131, 0.65);
    outline-offset: 5px;
    pointer-events: none;
  }
  body.efs-editing .efs-selection-overlay.active { display: block; }
  .efs-selection-move,
  .efs-selection-resize {
    position: absolute;
    pointer-events: auto;
  }
  .efs-selection-move {
    left: -3px;
    top: -42px;
    border: 0;
    border-radius: 999px;
    background: rgba(20, 32, 42, 0.92);
    color: #fffdf7;
    font: 900 16px/1 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    padding: 12px 16px;
    cursor: grab;
    box-shadow: 0 12px 30px rgba(20, 32, 42, 0.26);
  }
  .efs-selection-resize {
    right: -13px;
    bottom: -13px;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: 4px solid #fffdf7;
    background: #087f83;
    cursor: nwse-resize;
    box-shadow: 0 8px 20px rgba(20, 32, 42, 0.22);
  }
  .efs-crop-frame {
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(20, 32, 42, 0.18);
    border-radius: 8px;
    background: #fff;
    box-shadow: 0 18px 42px rgba(20, 32, 42, 0.16);
  }
  .efs-crop-frame > img {
    position: absolute;
    left: 50%;
    top: 50%;
    width: auto !important;
    height: auto !important;
    min-width: 0 !important;
    min-height: 0 !important;
    max-width: none !important;
    max-height: none !important;
    object-fit: initial !important;
    object-position: initial !important;
    border: 0 !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    background: transparent !important;
    user-select: none;
    -webkit-user-drag: none;
    transform-origin: center center;
  }
  .efs-image-tools {
    position: absolute;
    right: 10px;
    top: 10px;
    z-index: 2;
    display: none;
    gap: 7px;
    padding: 8px;
    border-radius: 999px;
    background: rgba(20, 32, 42, 0.88);
    box-shadow: 0 8px 20px rgba(20, 32, 42, 0.2);
  }
  body.efs-editing .efs-crop-frame.selected .efs-image-tools { display: flex; }
  .efs-image-tools button,
  .efs-image-tools label {
    border: 0;
    border-radius: 999px;
    background: rgba(255,255,255,0.14);
    color: #fffdf7;
    font: 900 12px/1 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    padding: 8px 10px;
    cursor: pointer;
  }
  .efs-image-tools input { display: none; }
  .efs-help {
    position: fixed;
    right: 18px;
    top: 18px;
    z-index: 9999;
    max-width: 360px;
    border-radius: 8px;
    background: rgba(20, 32, 42, 0.94);
    color: #fffdf7;
    padding: 12px 14px;
    font: 800 13px/1.45 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    box-shadow: 0 16px 36px rgba(20, 32, 42, 0.25);
    display: none;
  }
  body.efs-editing .efs-help { display: block; }
</style>
${CSS_END}`;

const editorJs = `
${JS_START}
<script id="editable-frontend-slides-js">
(() => {
  if (window.__EDITABLE_FRONTEND_SLIDES_RUNTIME__) return;
  window.__EDITABLE_FRONTEND_SLIDES_RUNTIME__ = true;

  const ORIGINAL_HTML_FOR_EXPORT = "<!DOCTYPE html>\\n" + document.documentElement.outerHTML;
  const STATE_GLOBAL = "__EDITABLE_FRONTEND_SLIDES_STATE__";
  const STORAGE_TEXTS = "editable-frontend-slides-texts-" + location.pathname;
  const STORAGE_LAYOUT = "editable-frontend-slides-layout-" + location.pathname;

  function qs(selector, root = document) { return root.querySelector(selector); }
  function qsa(selector, root = document) { return Array.from(root.querySelectorAll(selector)); }
  function stageElement() { return qs("#deckStage") || qs(".deck-stage") || qs("[data-deck-stage]"); }
  function slideElements() { return qsa(".slide"); }
  function embeddedState() { return window[STATE_GLOBAL] || {}; }
  function activeExportId() { return embeddedState().__meta?.exportId || null; }

  function readStorage(key) {
    const raw = localStorage.getItem(key);
    if (!raw) return { data: {}, exportId: null };
    try {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.__efsStorageVersion === 1) {
        return { data: parsed.data || {}, exportId: parsed.__embeddedExportId || null };
      }
      return { data: parsed || {}, exportId: null };
    } catch (error) {
      console.warn("Could not parse editable slides storage", error);
      return { data: {}, exportId: null };
    }
  }

  function writeStorage(key, data, exportId) {
    localStorage.setItem(key, JSON.stringify({
      __efsStorageVersion: 1,
      __embeddedExportId: exportId || null,
      savedAt: new Date().toISOString(),
      data
    }));
  }

  function ensureUi() {
    if (qs(".efs-panel")) return;
    const panel = document.createElement("div");
    panel.className = "efs-panel";
    panel.innerHTML = '<button type="button" class="efs-edit-toggle">編輯</button><button type="button" class="efs-export-toggle">匯出</button>';
    document.body.appendChild(panel);

    const toolbar = document.createElement("div");
    toolbar.className = "efs-toolbar";
    toolbar.innerHTML = '<span class="efs-readout">未選取</span><button type="button" data-efs-action="reset-position">位置重設</button><button type="button" data-efs-action="font-down">A-</button><button type="button" data-efs-action="font-up">A+</button><input type="color" value="#14202a" data-efs-action="color"><button type="button" data-efs-action="bold">粗體</button><button type="button" data-efs-action="reset-style">樣式重設</button>';
    document.body.appendChild(toolbar);

    const help = document.createElement("div");
    help.className = "efs-help";
    help.textContent = "編輯模式：點選文字、卡片、表格或圖片後，可用方向鍵微調 1px，Shift+方向鍵 10px。拖選取框左上角可搬移，拖右下角可改尺寸。圖片框內拖曳可調整裁切，Alt+方向鍵可微調圖片內容。";
    document.body.appendChild(help);
  }

  class InlineEditor {
    constructor() {
      this.isActive = false;
      this.prepareEditableTargets();
      this.editables = qsa('[data-editable="true"]');
      this.load();
      this.setup();
    }

    prepareEditableTargets() {
      const existing = qsa('[data-editable="true"]');
      existing.forEach((element, index) => {
        if (!element.dataset.editId) element.dataset.editId = String(index);
        element.dataset.efsLegacyEditId = String(index);
      });

      const selector = [
        ".deck-stage .slide h1",
        ".deck-stage .slide h2",
        ".deck-stage .slide h3",
        ".deck-stage .slide p",
        ".deck-stage .slide li",
        ".deck-stage .slide strong",
        ".deck-stage .slide span",
        ".deck-stage .slide div",
        "[data-deck-stage] .slide h1",
        "[data-deck-stage] .slide h2",
        "[data-deck-stage] .slide h3",
        "[data-deck-stage] .slide p",
        "[data-deck-stage] .slide li",
        "[data-deck-stage] .slide strong",
        "[data-deck-stage] .slide span",
        "[data-deck-stage] .slide div"
      ].join(",");
      const skipSelector = ".efs-panel,.efs-toolbar,.efs-help,.efs-selection-overlay,.efs-crop-frame,.efs-image-tools,.section-grid";
      let autoIndex = 0;
      qsa(selector).forEach((element) => {
        if (element.dataset.editable === "true") return;
        if (element.closest(skipSelector)) return;
        if (!element.textContent || !element.textContent.trim()) return;
        const childElements = Array.from(element.children).filter((child) => child.tagName.toLowerCase() !== "br");
        if (childElements.length > 0) return;
        const slide = element.closest(".slide");
        const slideIndex = slide ? slideElements().indexOf(slide) : 0;
        element.dataset.editable = "true";
        element.dataset.efsInlineOnly = "true";
        element.dataset.editId = "auto-" + slideIndex + "-" + autoIndex;
        autoIndex += 1;
      });
    }

    setup() {
      this.editables.forEach((element, index) => {
        if (!element.dataset.editId) element.dataset.editId = String(index);
        element.addEventListener("input", () => this.save());
      });
    }

    toggle(force) {
      this.isActive = typeof force === "boolean" ? force : !this.isActive;
      document.body.classList.toggle("editing", this.isActive);
      document.body.classList.toggle("efs-editing", this.isActive);
      qs(".efs-edit-toggle")?.classList.toggle("active", this.isActive);
      this.editables.forEach((element) => {
        element.setAttribute("contenteditable", this.isActive ? "true" : "false");
      });
    }

    save() {
      const data = this.exportState();
      writeStorage(STORAGE_TEXTS, data, activeExportId());
    }

    load() {
      const embedded = embeddedState().texts || {};
      const local = readStorage(STORAGE_TEXTS);
      let data = local.data || {};
      if (Object.keys(embedded).length && local.exportId !== activeExportId()) {
        data = embedded;
        writeStorage(STORAGE_TEXTS, data, activeExportId());
      }
      this.editables.forEach((element, index) => {
        const key = element.dataset.editId || String(index);
        const legacyKey = element.dataset.efsLegacyEditId;
        if (Object.prototype.hasOwnProperty.call(data, key)) element.innerHTML = data[key];
        else if (legacyKey && Object.prototype.hasOwnProperty.call(data, legacyKey)) element.innerHTML = data[legacyKey];
      });
    }

    exportState() {
      const data = {};
      this.editables.forEach((element, index) => {
        const key = element.dataset.editId || String(index);
        data[key] = element.innerHTML;
      });
      return data;
    }
  }

  class LayoutEditor {
    constructor() {
      this.stage = stageElement();
      this.state = this.load();
      this.selected = null;
      this.counter = 0;
      this.overlay = this.createOverlay();
      this.readout = qs(".efs-readout");
      this.initWhenReady();
      this.setupKeyboard();
      this.setupToolbar();
    }

    stageScale() {
      if (!this.stage) return 1;
      return this.stage.getBoundingClientRect().width / (this.stage.offsetWidth || 1920) || 1;
    }

    makeId(prefix) {
      this.counter += 1;
      return prefix + "-" + this.counter;
    }

    load() {
      const embedded = embeddedState().layout || {};
      const local = readStorage(STORAGE_LAYOUT);
      if (Object.keys(embedded).length && local.exportId !== activeExportId()) {
        writeStorage(STORAGE_LAYOUT, embedded, activeExportId());
        return Object.assign({}, embedded);
      }
      return Object.assign({}, embedded, local.data || {});
    }

    save() {
      writeStorage(STORAGE_LAYOUT, this.state, activeExportId());
    }

    exportState() {
      return this.state;
    }

    createOverlay() {
      const overlay = document.createElement("div");
      overlay.className = "efs-selection-overlay";
      overlay.innerHTML = '<button class="efs-selection-move" type="button">移動</button><div class="efs-selection-resize"></div>';
      this.stage.appendChild(overlay);
      qs(".efs-selection-move", overlay).addEventListener("pointerdown", (event) => this.startMove(event));
      qs(".efs-selection-resize", overlay).addEventListener("pointerdown", (event) => this.startResize(event));
      return overlay;
    }

    initWhenReady() {
      const run = () => {
        this.prepareImageFrames();
        this.prepareSelectableObjects();
        this.applyAll();
        this.updateOverlay();
      };
      if (document.readyState === "complete") run();
      else window.addEventListener("load", run, { once: true });
    }

    prepareImageFrames() {
      const images = qsa("img.screenshot, .image-strip img, img[data-efs-crop]");
      images.forEach((img) => {
        if (img.closest(".efs-crop-frame")) return;
        const scale = this.stageScale();
        const rect = img.getBoundingClientRect();
        const frame = document.createElement("div");
        const id = this.makeId("image");
        frame.className = (img.classList.contains("reveal") ? "reveal " : "") + "efs-crop-frame";
        frame.dataset.efsLayoutId = id;
        frame.dataset.efsLayoutType = "image";
        frame.dataset.originalSrc = img.getAttribute("src") || "";
        frame.style.width = Math.max(80, rect.width / scale) + "px";
        frame.style.height = Math.max(60, rect.height / scale) + "px";
        const tools = document.createElement("div");
        tools.className = "efs-image-tools";
        tools.innerHTML = '<button type="button" data-efs-image-action="fit">適合</button><button type="button" data-efs-image-action="fill">填滿</button><button type="button" data-efs-image-action="aspect">原比例</button><button type="button" data-efs-image-action="reset">重設</button><label>替換<input type="file" accept="image/*" data-efs-image-action="replace"></label>';
        img.dataset.originalClass = img.className;
        img.classList.remove("reveal", "screenshot", "tall");
        img.removeAttribute("width");
        img.removeAttribute("height");
        img.style.opacity = "";
        img.style.transform = "";
        img.parentElement.insertBefore(frame, img);
        frame.appendChild(tools);
        frame.appendChild(img);
        this.ensureState(frame);
        this.bindSelectable(frame);
        this.bindImageFrame(frame);
        this.initializeImageFrame(frame);
      });
    }

    prepareSelectableObjects() {
      const selector = [
        "[data-editable='true']:not([data-efs-inline-only='true'])",
        ".tile",
        ".step",
        ".db-card",
        ".callout",
        ".formula",
        ".matrix",
        ".workflow",
        ".dark-panel",
        ".top-title",
        ".efs-crop-frame"
      ].join(",");
      qsa(selector).forEach((element) => {
        if (element.classList.contains("efs-selection-overlay") || element.closest(".efs-selection-overlay")) return;
        if (element.closest(".efs-crop-frame") && !element.classList.contains("efs-crop-frame")) return;
        if (!element.dataset.efsLayoutId) {
          element.dataset.efsLayoutId = this.makeId(element.classList.contains("efs-crop-frame") ? "image" : "object");
          element.dataset.efsLayoutType = element.classList.contains("efs-crop-frame") ? "image" : "text";
        }
        this.ensureState(element);
        this.bindSelectable(element);
      });
    }

    ensureState(element) {
      const id = element.dataset.efsLayoutId;
      const rect = element.getBoundingClientRect();
      const scale = this.stageScale();
      this.state[id] = this.state[id] || {};
      const st = this.state[id];
      st.x = st.x || 0;
      st.y = st.y || 0;
      st.w = st.w || Math.max(20, rect.width / scale);
      st.h = st.h || Math.max(20, rect.height / scale);
      st.originalW = st.originalW || st.w;
      st.originalH = st.originalH || st.h;
      st.fontScale = st.fontScale || 1;
      st.color = st.color || "";
      st.fontWeight = st.fontWeight || "";
      if (element.dataset.efsLayoutType === "image") {
        st.src = st.src || element.dataset.originalSrc || element.querySelector("img")?.getAttribute("src");
        st.imgX = st.imgX || 0;
        st.imgY = st.imgY || 0;
        st.imgScale = st.imgScale || 1;
      }
    }

    bindSelectable(element) {
      if (element.dataset.efsBoundLayout === "true") return;
      element.dataset.efsBoundLayout = "true";
      element.addEventListener("pointerdown", (event) => {
        if (!document.body.classList.contains("efs-editing")) return;
        if (event.target.closest(".efs-image-tools")) return;
        const editableTarget = event.target.closest("[data-editable='true']");
        if (editableTarget && editableTarget !== element && element.contains(editableTarget) && !element.classList.contains("matrix")) return;
        this.select(element);
      });
    }

    bindImageFrame(frame) {
      const img = frame.querySelector("img");
      img.addEventListener("load", () => this.initializeImageFrame(frame));
      frame.addEventListener("pointerdown", (event) => {
        if (!document.body.classList.contains("efs-editing")) return;
        if (event.target.closest(".efs-image-tools")) return;
        if (event.target !== img) return;
        this.select(frame);
        event.preventDefault();
        event.stopPropagation();
        this.startImagePan(event, frame);
      });
      frame.addEventListener("wheel", (event) => {
        if (!document.body.classList.contains("efs-editing")) return;
        event.preventDefault();
        const st = this.state[frame.dataset.efsLayoutId];
        st.imgScale = Math.max(0.05, Math.min((st.imgScale || 1) * (event.deltaY < 0 ? 1.06 : 0.94), 8));
        this.applyImage(frame);
        this.save();
      }, { passive: false });
      qs('[data-efs-image-action="fit"]', frame).addEventListener("click", () => this.fitImage(frame));
      qs('[data-efs-image-action="fill"]', frame).addEventListener("click", () => this.fillImage(frame));
      qs('[data-efs-image-action="aspect"]', frame).addEventListener("click", () => this.restoreImageAspect(frame));
      qs('[data-efs-image-action="reset"]', frame).addEventListener("click", () => this.resetImage(frame));
      qs('[data-efs-image-action="replace"]', frame).addEventListener("change", (event) => this.replaceImage(event, frame));
    }

    initializeImageFrame(frame) {
      const img = frame.querySelector("img");
      const st = this.state[frame.dataset.efsLayoutId];
      if (!img || !st || !img.naturalWidth || !img.naturalHeight) return;
      if (!st.fitted) {
        this.fitImage(frame);
        st.fitted = true;
        this.save();
      } else {
        this.applyImage(frame);
      }
    }

    applyAll() {
      qsa("[data-efs-layout-id]").forEach((element) => this.applyElement(element));
    }

    applyElement(element) {
      const st = this.state[element.dataset.efsLayoutId];
      if (!st) return;
      element.style.transform = "translate(" + (st.x || 0) + "px, " + (st.y || 0) + "px)";
      if (st.w && st.resized) {
        element.style.width = st.w + "px";
        element.style.maxWidth = "none";
      }
      if (st.h && st.resized) {
        element.style.height = st.h + "px";
        element.style.maxHeight = "none";
      }
      if (element.dataset.efsLayoutType === "text") this.applyTextStyle(element);
      if (element.dataset.efsLayoutType === "image") this.applyImage(element);
      if (element === this.selected) this.updateOverlay();
    }

    applyTextStyle(element) {
      const st = this.state[element.dataset.efsLayoutId];
      const targets = element.matches("[data-editable='true']")
        ? [element]
        : qsa("[data-editable='true'], p, li, h1, h2, h3, strong, span, .node-num, .node-title, .matrix > div", element);
      targets.forEach((target) => {
        if (!target.dataset.efsBaseFontSize) target.dataset.efsBaseFontSize = String(parseFloat(getComputedStyle(target).fontSize) || 24);
        const base = parseFloat(target.dataset.efsBaseFontSize);
        target.style.fontSize = Math.max(8, base * (st.fontScale || 1)) + "px";
        target.style.color = st.color || "";
        target.style.fontWeight = st.fontWeight || "";
      });
    }

    applyImage(frame) {
      const img = frame.querySelector("img");
      const st = this.state[frame.dataset.efsLayoutId];
      if (!img || !st) return;
      if (st.src && img.getAttribute("src") !== st.src) {
        img.src = st.src;
        if (!img.complete || !img.naturalWidth || !img.naturalHeight) return;
      }
      if (!img.naturalWidth || !img.naturalHeight) return;
      img.classList.remove("screenshot", "tall", "reveal");
      img.removeAttribute("width");
      img.removeAttribute("height");
      img.style.setProperty("width", img.naturalWidth + "px", "important");
      img.style.setProperty("height", img.naturalHeight + "px", "important");
      img.style.setProperty("max-width", "none", "important");
      img.style.setProperty("max-height", "none", "important");
      img.style.setProperty("object-fit", "initial", "important");
      img.style.setProperty("object-position", "initial", "important");
      img.style.transform = "translate(calc(-50% + " + (st.imgX || 0) + "px), calc(-50% + " + (st.imgY || 0) + "px)) scale(" + (st.imgScale || 1) + ")";
    }

    fitImage(frame) {
      const img = frame.querySelector("img");
      const st = this.state[frame.dataset.efsLayoutId];
      if (!img || !img.naturalWidth || !img.naturalHeight || !st) return;
      st.imgScale = Math.min(frame.clientWidth / img.naturalWidth, frame.clientHeight / img.naturalHeight);
      st.imgX = 0;
      st.imgY = 0;
      st.fitted = true;
      this.applyImage(frame);
      this.save();
    }

    fillImage(frame) {
      const img = frame.querySelector("img");
      const st = this.state[frame.dataset.efsLayoutId];
      if (!img || !img.naturalWidth || !img.naturalHeight || !st) return;
      st.imgScale = Math.max(frame.clientWidth / img.naturalWidth, frame.clientHeight / img.naturalHeight);
      st.imgX = 0;
      st.imgY = 0;
      st.fitted = true;
      this.applyImage(frame);
      this.save();
    }

    restoreImageAspect(frame) {
      const img = frame.querySelector("img");
      const st = this.state[frame.dataset.efsLayoutId];
      if (!img || !img.naturalWidth || !img.naturalHeight || !st) return;
      const width = frame.offsetWidth || st.w || img.naturalWidth;
      st.w = width;
      st.h = width * (img.naturalHeight / img.naturalWidth);
      st.resized = true;
      st.imgX = 0;
      st.imgY = 0;
      this.applyElement(frame);
      this.fitImage(frame);
      this.updateOverlay();
      this.save();
    }

    resetImage(frame) {
      const st = this.state[frame.dataset.efsLayoutId];
      st.src = frame.dataset.originalSrc;
      st.imgX = 0;
      st.imgY = 0;
      st.imgScale = 1;
      st.fitted = false;
      st.w = st.originalW || st.w;
      st.h = st.originalH || st.h;
      st.resized = true;
      const img = frame.querySelector("img");
      img.src = st.src;
      this.applyElement(frame);
      this.save();
    }

    replaceImage(event, frame) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      const st = this.state[frame.dataset.efsLayoutId];
      reader.onload = () => {
        st.src = reader.result;
        st.imgX = 0;
        st.imgY = 0;
        st.imgScale = 1;
        st.fitted = false;
        frame.querySelector("img").src = reader.result;
        this.save();
      };
      reader.readAsDataURL(file);
    }

    select(element) {
      if (!element) return;
      if (this.selected) this.selected.classList.remove("selected");
      this.selected = element;
      this.selected.classList.add("selected");
      this.updateOverlay();
    }

    updateOverlay() {
      if (!this.selected || !document.body.classList.contains("efs-editing")) {
        this.overlay.classList.remove("active");
        if (this.readout) this.readout.textContent = "未選取";
        return;
      }
      const stageRect = this.stage.getBoundingClientRect();
      const rect = this.selected.getBoundingClientRect();
      const scale = this.stageScale();
      this.overlay.classList.add("active");
      this.overlay.style.left = (rect.left - stageRect.left) / scale + "px";
      this.overlay.style.top = (rect.top - stageRect.top) / scale + "px";
      this.overlay.style.width = rect.width / scale + "px";
      this.overlay.style.height = rect.height / scale + "px";
      const st = this.state[this.selected.dataset.efsLayoutId];
      if (this.readout) this.readout.textContent = (this.selected.dataset.efsLayoutType === "image" ? "圖片" : "文字") + " x:" + Math.round(st.x || 0) + " y:" + Math.round(st.y || 0);
    }

    startMove(event) {
      if (!this.selected) return;
      event.preventDefault();
      event.stopPropagation();
      const element = this.selected;
      const st = this.state[element.dataset.efsLayoutId];
      const start = { x: event.clientX, y: event.clientY, ox: st.x || 0, oy: st.y || 0 };
      const move = (e) => {
        st.x = start.ox + (e.clientX - start.x) / this.stageScale();
        st.y = start.oy + (e.clientY - start.y) / this.stageScale();
        this.applyElement(element);
      };
      const up = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        this.save();
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    }

    startResize(event) {
      if (!this.selected) return;
      event.preventDefault();
      event.stopPropagation();
      const element = this.selected;
      const st = this.state[element.dataset.efsLayoutId];
      const start = { x: event.clientX, y: event.clientY, w: element.getBoundingClientRect().width / this.stageScale(), h: element.getBoundingClientRect().height / this.stageScale() };
      const move = (e) => {
        st.w = Math.max(60, start.w + (e.clientX - start.x) / this.stageScale());
        st.h = Math.max(30, start.h + (e.clientY - start.y) / this.stageScale());
        st.resized = true;
        this.applyElement(element);
      };
      const up = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        this.save();
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    }

    startImagePan(event, frame) {
      const st = this.state[frame.dataset.efsLayoutId];
      const start = { x: event.clientX, y: event.clientY, ox: st.imgX || 0, oy: st.imgY || 0 };
      const move = (e) => {
        st.imgX = start.ox + (e.clientX - start.x) / this.stageScale();
        st.imgY = start.oy + (e.clientY - start.y) / this.stageScale();
        this.applyImage(frame);
      };
      const up = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        this.save();
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    }

    setupKeyboard() {
      document.addEventListener("keydown", (event) => {
        if (!document.body.classList.contains("efs-editing")) return;
        if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
        if (!this.selected || (event.target && event.target.getAttribute("contenteditable") === "true")) return;
        event.preventDefault();
        const st = this.state[this.selected.dataset.efsLayoutId];
        const amount = event.shiftKey ? 10 : 1;
        const dx = event.key === "ArrowLeft" ? -amount : event.key === "ArrowRight" ? amount : 0;
        const dy = event.key === "ArrowUp" ? -amount : event.key === "ArrowDown" ? amount : 0;
        if (event.altKey && this.selected.dataset.efsLayoutType === "image") {
          st.imgX = (st.imgX || 0) + dx;
          st.imgY = (st.imgY || 0) + dy;
        } else {
          st.x = (st.x || 0) + dx;
          st.y = (st.y || 0) + dy;
        }
        this.applyElement(this.selected);
        this.save();
      });
    }

    setupToolbar() {
      qs('[data-efs-action="reset-position"]')?.addEventListener("click", () => this.resetPosition());
      qs('[data-efs-action="font-down"]')?.addEventListener("click", () => this.adjustFont(-0.08));
      qs('[data-efs-action="font-up"]')?.addEventListener("click", () => this.adjustFont(0.08));
      qs('[data-efs-action="color"]')?.addEventListener("input", (event) => this.setColor(event.target.value));
      qs('[data-efs-action="bold"]')?.addEventListener("click", () => this.toggleBold());
      qs('[data-efs-action="reset-style"]')?.addEventListener("click", () => this.resetStyle());
    }

    resetPosition() {
      if (!this.selected) return;
      const st = this.state[this.selected.dataset.efsLayoutId];
      st.x = 0;
      st.y = 0;
      this.applyElement(this.selected);
      this.save();
    }

    adjustFont(delta) {
      if (!this.selected || this.selected.dataset.efsLayoutType !== "text") return;
      const st = this.state[this.selected.dataset.efsLayoutId];
      st.fontScale = Math.max(0.45, Math.min((st.fontScale || 1) + delta, 2.4));
      this.applyElement(this.selected);
      this.save();
    }

    setColor(color) {
      if (!this.selected || this.selected.dataset.efsLayoutType !== "text") return;
      this.state[this.selected.dataset.efsLayoutId].color = color;
      this.applyElement(this.selected);
      this.save();
    }

    toggleBold() {
      if (!this.selected || this.selected.dataset.efsLayoutType !== "text") return;
      const st = this.state[this.selected.dataset.efsLayoutId];
      st.fontWeight = st.fontWeight === "800" ? "" : "800";
      this.applyElement(this.selected);
      this.save();
    }

    resetStyle() {
      if (!this.selected || this.selected.dataset.efsLayoutType !== "text") return;
      const st = this.state[this.selected.dataset.efsLayoutId];
      st.fontScale = 1;
      st.color = "";
      st.fontWeight = "";
      this.applyElement(this.selected);
      this.save();
    }
  }

  function serializeState(state) {
    return JSON.stringify(state)
      .replace(/</g, "\\\\u003c")
      .replace(/\\u2028/g, "\\\\u2028")
      .replace(/\\u2029/g, "\\\\u2029");
  }

  function stateScript(serialized) {
    const openTag = "<scr" + "ipt id=\\"editable-frontend-slides-state\\">";
    const closeTag = "</scr" + "ipt>";
    return openTag + "window.__EDITABLE_FRONTEND_SLIDES_STATE__ = " + serialized + ";" + closeTag;
  }

  function removeEmbeddedState(source) {
    return source
      .replace(/<script\\b[^>]*\\bid=["']editable-frontend-slides-state["'][^>]*>[\\s\\S]*?<\\/script>\\s*/gi, "")
      .replace(/<script\\b[^>]*\\bid=["']safe-layout-editor-state["'][^>]*>[\\s\\S]*?<\\/script>\\s*/gi, "")
      .replace(/<script>window\\.__EDITABLE_FRONTEND_SLIDES_STATE__\\s*=\\s*\\{[\\s\\S]*?\\};<\\/script>\\s*/gi, "")
      .replace(/<script>window\\.__SAFE_LAYOUT_EDITOR_STATE__\\s*=\\s*\\{[\\s\\S]*?\\};<\\/script>\\s*/gi, "");
  }

  function exportEditableHtml(editor, layoutEditor) {
    const exportedAt = new Date().toISOString();
    const exportId = "export-" + Date.now() + "-" + Math.random().toString(36).slice(2, 10);
    const state = {
      __meta: {
        version: 1,
        exportId,
        exportedAt,
        mode: "editable-frontend-slides-portable-html"
      },
      texts: editor.exportState(),
      layout: layoutEditor.exportState()
    };
    const cleanOriginal = removeEmbeddedState(ORIGINAL_HTML_FOR_EXPORT).replace(/<!DOCTYPE html>\\s*/i, "");
    const html = "<!DOCTYPE html>\\n" + cleanOriginal.replace(/<\\/head>/i, stateScript(serializeState(state)) + "\\n</head>");
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const stamp = exportedAt.replace(/[-:]/g, "").replace(/\\.\\d{3}Z$/, "");
    link.href = url;
    link.download = "editable_frontend_slides_" + stamp + ".html";
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  ensureUi();
  const inlineEditor = new InlineEditor();
  const layoutEditor = new LayoutEditor();
  qs(".efs-edit-toggle")?.addEventListener("click", () => inlineEditor.toggle());
  qs(".efs-export-toggle")?.addEventListener("click", () => exportEditableHtml(inlineEditor, layoutEditor));
  document.addEventListener("keydown", (event) => {
    if ((event.key === "e" || event.key === "E") && !(event.target && event.target.getAttribute("contenteditable") === "true")) {
      inlineEditor.toggle();
    }
  });
})();
</script>
${JS_END}`;

html = stripExistingLayer(html);

if (!/<\/head>/i.test(html)) {
  throw new Error("Input HTML is missing </head>; cannot inject editor CSS/state safely.");
}
if (!/<\/body>/i.test(html)) {
  throw new Error("Input HTML is missing </body>; cannot inject editor runtime safely.");
}

html = html.replace(/<\/head>/i, `${editorCss}\n</head>`);
html = html.replace(/<\/body>/i, `${editorJs}\n</body>`);

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, html, "utf8");
console.log(`Injected editable frontend slides layer: ${outputPath}`);

