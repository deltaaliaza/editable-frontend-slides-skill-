#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

function usage() {
  console.error("Usage: node audit_editable_deck.js <deck.html>");
  process.exit(2);
}

const input = process.argv[2];
if (!input) usage();

const file = path.resolve(input);
const html = fs.readFileSync(file, "utf8");
const checks = [];

function check(name, pass, detail = "") {
  checks.push({ name, pass: Boolean(pass), detail });
}

function count(re) {
  return (html.match(re) || []).length;
}

const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map((m) => m[1]);
let scriptsOk = true;
let scriptError = "";
for (const [index, script] of scripts.entries()) {
  try {
    new Function(script);
  } catch (error) {
    scriptsOk = false;
    scriptError = `script ${index}: ${error.message}`;
    break;
  }
}

const slideCount = count(/<section\b[^>]*class=["'][^"']*\bslide\b/gi);
const matrixCount = count(/class=["'][^"']*\bmatrix\b/gi);
const screenshotCount = count(/<img\b[^>]*class=["'][^"']*\bscreenshot\b/gi);
const imageStripCount = count(/class=["'][^"']*\bimage-strip\b/gi);

check("HTML file exists", fs.existsSync(file), file);
check("Contains slides", slideCount > 0, `${slideCount} slide(s)`);
check("Contains fixed stage", /class=["'][^"']*\bdeck-stage\b/i.test(html) || /id=["']deckStage["']/i.test(html) || /data-deck-stage/i.test(html));
check("Inline scripts parse", scriptsOk, scriptError || `${scripts.length} script(s)`);
check("Has editor layer marker or class", /editable-frontend-slides|EditableFrontendSlides|efs-/i.test(html));
check("Has edit mode shortcut", /event\.key\s*={0,2}\s*["']E["']|event\.key\s*={0,2}\s*["']e["']/i.test(html) || /key\s*===\s*["']E["']/i.test(html));
check("Has editable text logic", /prepareEditableTargets|data-efs-inline-only|data-inline-only/i.test(html));
check("Has selection overlay", /selection-overlay|efs-selection-overlay/i.test(html));
check("Has matrix support", matrixCount === 0 || /matrix/.test(html), `${matrixCount} matrix element(s)`);
check("Has matrix selection exception", matrixCount === 0 || /classList\.contains\(["']matrix["']\)|closest\(["']\.matrix["']\)/.test(html));
check("Has image crop support when images need it", screenshotCount + imageStripCount === 0 || /crop-frame|efs-crop-frame/.test(html), `${screenshotCount} screenshot image(s), ${imageStripCount} image-strip(s)`);
check("Has export function", /exportEditedHtml|exportEditableHtml|download\s*=/.test(html));
check("Escapes serialized state", /replace\(\s*\/<\/g\s*,\s*["']\\u003c["']\s*\)/.test(html) || /\\u003c/.test(html));
check("Builds safe script tags", /"<scr"\s*\+\s*"ipt/.test(html) || /'<scr'\s*\+\s*'ipt/.test(html) || /id=["']editable-frontend-slides-state["']/.test(html) || /id=["']safe-layout-editor-state["']/.test(html));
check("Does not contain broken exported close tag", !html.includes("<\\\\/script>"));

const failed = checks.filter((item) => !item.pass);
for (const item of checks) {
  const mark = item.pass ? "PASS" : "FAIL";
  console.log(`${mark} ${item.name}${item.detail ? ` - ${item.detail}` : ""}`);
}

console.log("");
console.log(`Summary: ${checks.length - failed.length}/${checks.length} checks passed`);

if (failed.length) process.exit(1);

