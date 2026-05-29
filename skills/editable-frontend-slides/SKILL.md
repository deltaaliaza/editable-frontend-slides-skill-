---
name: editable-frontend-slides
description: Add or maintain a reusable in-browser editing layer for zero-dependency HTML slide decks, especially decks created with frontend-slides. Use when a user wants editable HTML slides with E-key edit mode, draggable/resizable text boxes, cards, tables, image crop frames, image replacement, keyboard nudging, and portable HTML export that preserves edits.
---

# Editable Frontend Slides

## Purpose

Use this skill after `frontend-slides` has produced a 16:9 HTML deck, or when an existing HTML slide deck needs reusable browser-based editing controls.

The output remains a single HTML file that opens directly in a browser. No server, build step, or runtime dependency should be required.

## Workflow

1. If the user is creating a new presentation, first use `frontend-slides` for content, visual design, fixed 1920x1080 stage, and slide navigation.
2. Add the editable layer with `scripts/inject_editable_layer.js` unless the deck already has a compatible layer.
3. Preserve the deck's original design and slide controller. Do not rewrite the presentation unless the user asks.
4. Validate with `scripts/audit_editable_deck.js`, then open the HTML in a browser for manual checks.
5. When modifying an existing editable deck, keep user edits and export state intact unless explicitly asked to reset them.

## Capabilities

The editable layer should provide:

- `E` key and on-screen button to toggle edit mode.
- Inline editing for visible slide text, including cards, table cells, labels, and source notes.
- Selection overlay for movable/resizable objects.
- Arrow-key nudging: 1px by default, 10px with `Shift`.
- Text toolbar for size, color, bold, and reset.
- Image crop frames with fit, fill, original ratio, reset, replacement, drag panning, wheel zoom, and `Alt+Arrow` panning.
- Matrix/table resizing while preserving cell text editing.
- Portable export with embedded state and safe `script` serialization.

## Important Rules

- Do not break Frontend Slides fixed-stage invariants: keep the deck authored inside a 1920x1080 stage that scales as a whole.
- Do not wrap text in layout-changing containers after the deck is designed. Use inline editable markers on leaf text nodes.
- Mark automatically added editable text as inline-only so it can be edited without becoming a new draggable object.
- Keep cards, callouts, formulas, tables/matrices, workflows, panels, titles, and image frames selectable as larger layout objects.
- For table or matrix cells, allow the outer table object to be selected even when clicking editable cell text.
- Export from a clean original HTML snapshot plus embedded editor state; do not export the mutated runtime DOM.
- Escape serialized state before inserting it into a script tag.

## Resources

- Read `references/editor-contract.md` before implementing or repairing the editable layer.
- Read `references/validation-checklist.md` before final delivery.
- Use `scripts/inject_editable_layer.js` to add the layer to an HTML deck.
- Use `scripts/audit_editable_deck.js` to check syntax, slide count, editor markers, table coverage, image controls, and export safety.

